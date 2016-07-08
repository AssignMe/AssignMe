import sys, getopt
from os import system
from os.path import isfile
import sqlite3
import json as JSON
try:
	import requests
except ImportError:
	sys.exit('\033[1;31mError, Module requests is required\033[1;0m')

token = open('token', 'r').read()

# API_URL = 'https://api.github.com/'
API_URL = 'https://github.ncsu.edu/api/v3/'

headers = {
    'User-Agent': 'AssignMe',
    'content-type': 'application/json',
    'Authorization': token
}


def makeDb(csvPath, dbPath, tableName):
	if(isfile(dbPath)):
		print('\033[1;31m -> There already exists a database with the given dbPath, try again ...\033[1;0m\n')
		return
	else:
		print(' * Making the db file ...')
		print(' * Importing from csv ...')
		system('echo ".import ' + csvPath + ' ' + tableName + '" | sqlite3 ' + dbPath + ' -csv')

		conn = sqlite3.connect(dbPath)
		c = conn.cursor()
		c.execute('ALTER TABLE {tn} RENAME TO TEMPOLDTABLE;'.format(tn=tableName))
		c.execute('CREATE TABLE {tn} (unityId, teamName, teamId DEFAULT NULL, assigned DEFAULT NULL)'.format(tn=tableName))
		c.execute('INSERT INTO {tn} (unityId, teamName) SELECT unityId, teamName FROM TEMPOLDTABLE;'.format(tn=tableName))
		c.execute('DROP TABLE TEMPOLDTABLE;')
		conn.commit()
		conn.close()

# makeDb('fall2016.csv', 'fall2016.db', 'fall2016')

def getTeamId(teamName, dbPath, tableName):
	conn = sqlite3.connect(dbPath)
	c = conn.cursor()
	c.execute('select teamId from {tn} where teamName = "{teamName}";'.format(tn=tableName, teamName=teamName))
	teamId = c.fetchone()[0];
	conn.commit()
	conn.close()
	return teamId

def createRepo(repoName, orgName):
	json = {
		'name': repoName,
		'auto_init': 'true',
		'public': 'false',
		'gitignore_template': 'nanoc'
	}

	url = '{api}orgs/{orgName}/repos'.format(api=API_URL, orgName=orgName)

	r = requests.post(url, headers=headers, json=json)
	statusCode = int(r.headers['Status'].split(' ')[0])

	if statusCode >= 400:
		print 'Server error: ', statusCode
		return
	print 'Created repository {repoName} in {orgName}'.format(repoName=repoName, orgName=orgName)

# createRepo('test2', 'assignme')

def deleteRepo(repoName, orgName):
	url = '{api}teams/{id}'.format(api=API_URL, id=id)
	r = requests.delete(url, headers=headers)
	statusCode = int(r.headers['Status'].split(' ')[0])
	if statusCode >= 400:
		print 'Server error: ', statusCode
		return

	print 'Deleted the team with id = {id}'.format(id=id)


def deleteRepo(repoName, orgName):
	url = '{api}repos/{orgName}/{repoName}'.format(api=API_URL, orgName=orgName, repoName=repoName)

	r = requests.delete(url, headers=headers)
	statusCode = int(r.headers['Status'].split(' ')[0])

	if statusCode >= 400:
		print 'Server error: ', statusCode
		return
	print 'Deleted the repository {repoName} in {orgName}'.format(repoName=repoName, orgName=orgName)

# deleteRepo('test2', 'assignme')


def createTeam(teamName, orgName, permission, dbPath, tableName):
	json = {
		'name': teamName,
		'repo_names': ['{orgName}/{teamName}'.format(orgName=orgName, teamName=teamName)],
		'privacy': 'secret',
		'permission': permission
	}

	url = '{api}orgs/{orgName}/teams'.format(api=API_URL, orgName=orgName)

	r = requests.post(url, headers=headers, json=json)
	statusCode = int(r.headers['Status'].split(' ')[0])

	if statusCode >= 400:
		print 'Server error: ', statusCode
		return

	print 'Created the team {teamName} in {orgName}'.format(teamName=teamName, orgName=orgName)

	conn = sqlite3.connect(dbPath)
	c = conn.cursor()
	c.execute('UPDATE {tn} set teamId = ? where teamName = "{teamName}";'.format(tn=tableName, teamName=teamName), (JSON.loads(r.text)['id'],))
	conn.commit()
	conn.close()

# createTeam('test'+str(x), 'assignme', ['AssignMe/test1', 'AssignMe/test2'], 'push', 'fall2016.db')


def deleteTeam(teamName, dbPath, tableName):
	url = '{api}teams/{id}'.format(api=API_URL, id=getTeamId(teamName, dbPath, tableName))
	r = requests.delete(url, headers=headers)
	statusCode = int(r.headers['Status'].split(' ')[0])
	if statusCode >= 400:
		print 'Server error: ', statusCode
		return
	print 'Deleted the team with teamName = {teamName}'.format(teamName=teamName)
	conn = sqlite3.connect(dbPath)
	c = conn.cursor()
	c.execute('UPDATE {tn} set teamId = NULL where teamName = "{teamName}";'.format(tn=tableName, teamName=teamName))
	conn.commit()
	conn.close()


def addUserToTeam(userName, teamName, orgName, dbPath, tableName):
	url = '{api}teams/{id}/memberships/{userName}'.format(api=API_URL, id=getTeamId(teamName, dbPath, tableName), userName=userName)
	r = requests.put(url, headers=headers)
	statusCode = int(r.headers['Status'].split(' ')[0])
	if statusCode >= 400:
		print 'Server error: ', statusCode
		return
	print 'Added {userName} to {teamName}'.format(userName=userName, teamName=teamName)
	

def updateTeamRepoPermission(teamName, orgName, repoName, permission, dbPath, tableName):
	json = {
		'permission': permission
	}
	url = '{api}teams/{id}/repos/{orgName}/{repoName}'.format(api=API_URL, id=getTeamId(teamName, dbPath, tableName), orgName=orgName, repoName=repoName)
	r = requests.put(url, headers=headers, json=json)
	statusCode = int(r.headers['Status'].split(' ')[0])
	if statusCode >= 400:
		print 'Server error: ', statusCode
		return
	print 'Updated the team permission to {permission} where teamName = {teamName} '.format(teamName=teamName, permission=permission)


##################################################################
# Handling commandline args ######################################
##################################################################

# Read command line args
myopts, args = getopt.getopt(sys.argv[1:],"mud", ["dbPath=", "permission=", "tableName=", "import=", "orgName=", "assign"])

tableName = ''
dbPath = ''
permission = ''
importing = False
csv = ''
orgName = ''
makingTeams = False
updatingPermission = False
deletingTeams = False
assigningUsers = False

for o, a in myopts:
	# print '\nYES', o, a
	if o == '-m':
		makingTeams = True
	elif o == '-u':
		updatingPermission = True
	elif o == '-d':
		deletingTeams = True
	elif o == '--permission':
		permission = a
	elif o == '--tableName':
		tableName = a
	elif o == '--dbPath':
		dbPath = a
	elif o == '--import':
		importing = True
		csv = a
	elif o == '--orgName':
		orgName = a
	elif o == '--assign':
		assigningUsers = True
	else: 
		print("Usage: %s -makeTeamsAndRepos" % sys.argv[0])

# print tableName
# print dbPath
# print permission
# print makingTeams
# print updatingPermission
# print deletingTeams
# print csv
# print orgName
# print importing



if importing:
	makeDb(csv, dbPath, tableName)
	sys.exit(0)

elif makingTeams:
	conn = sqlite3.connect(dbPath)
	c = conn.cursor()
	c.execute('select teamName from {tn} where teamId is NULL'.format(tn=tableName))
	teams = c.fetchall()
	for team in teams:
		createRepo(team[0], orgName)
		createTeam(team[0], orgName, 'push', dbPath, tableName)
	conn.commit()
	conn.close()

elif updatingPermission:
	conn = sqlite3.connect(dbPath)
	c = conn.cursor()
	c.execute('select teamName from {tn} where teamId is not NULL'.format(tn=tableName))
	teams = c.fetchall()
	for team in teams:
		updateTeamRepoPermission(team[0], orgName, team[0], permission, dbPath, tableName)
	conn.commit()
	conn.close()

elif deletingTeams:
	conn = sqlite3.connect(dbPath)
	c = conn.cursor()
	c.execute('select teamName from {tn} where teamId is not NULL'.format(tn=tableName))
	teams = c.fetchall()
	for team in teams:
		deleteTeam(team[0], dbPath, tableName)
		deleteRepo(team[0], orgName)
	conn.commit()
	conn.close()

elif assigningUsers:
	conn = sqlite3.connect(dbPath)
	c = conn.cursor()
	c.execute('select unityId, teamName from {tn} where assigned is NULL'.format(tn=tableName))
	rows = c.fetchall()
	for row in rows:
		addUserToTeam(row[0], row[1], orgName, dbPath, tableName)
	conn.commit()
	conn.close()

# $ python assignme.py --import fall2016.csv --dbPath fall2016.db --tableName fall2016
# $ python assignme.py -m --dbPath fall2016.db --orgName assignme --tableName fall2016
# $ python assignme.py --assign --dbPath fall2016.db --orgName assignme --tableName fall2016
# $ python assignme.py -u --dbPath fall2016.db --orgName assignme --tableName fall2016 --permission pull
# $ python assignme.py -d --dbPath fall2016.db --orgName assignme --tableName fall2016
