var request = require('request');
var fs = require("fs");
var enterprise_url = "https://github.ncsu.edu/api/v3/";
// var enterprise_url = 'https://api.github.com/';

// reading the token from file - Synchronous read
var token = fs.readFileSync('token');
var token = token.toString();

//**************************************************************
//**************************************************************
//*************** Creation / Assignment functions **************
//**************************************************************
//**************************************************************

/**
 * Creates repository under the given org and given name
 */
function createRepo(name, org) {
  var options = {
    // url: ' https://api.github.com/user/repos',
    url: enterprise_url + 'orgs/' + org + '/repos',
    method: 'POST',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    },
    json: {
      "name": name,
      "auto_init": true,
      "public": true,
      "gitignore_template": "nanoc"
    }
  };

  request(options, function(error, response, body) {
    console.log("Created repository: " + name);
  });
}

/**
 * Deletes a repository under the given org
 * Notice: if using OAuth, the `delete_repo` scope is required
 *
 * @param repoName repository name
 * @param org Organization name
 */
function deleteRepo(repoName, org) {
  var options = {
    url: enterprise_url + 'repos/' + org + '/' + repoName,
    method: 'DELETE',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    }
  };

  request(options, function(error, response, body) {
    console.log("Deleted repository: " + repoName);
  });
}

/**
 * Created a team under the given org
 * @param teamName Team name
 * @param org Organization name
 */
function createTeam(teamName, org) {
  var options = {
    url: enterprise_url + 'orgs/' + org + '/teams',
    method: 'POST',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    },
    json: {
      "name": teamName,
      "auto_init": true,
      "public": true,
      "gitignore_template": "nanoc"
    }
  };

  request(options, function(error, response, body) {
    var ID = body.id;
    return ID;
  });
}


/**
 * Adds the given repository to the given team
 *
 * @param repoName Repository name
 * @param teamName Team name
 * @param org Organization name
 */
function addRepoToTeam(repoName, teamName, org) {
  var options = {
    url: enterprise_url + 'teams/' + getTeamId(teamName, org) + '/repos/' + org + '/' + repoName,
    method: 'PUT',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    }
  };

  request(options, function(error, response, body) {
    console.log("Added repository: " + repoName + " to Team: " + teamName + " in " + org + "organization");
  });
}

/**
 * Deletes a team, given it's id
 *
 * @param id Team id
 */
function deleteTeam(id) {
  var options = {
    url: enterprise_url + 'teams/' + id,
    method: 'DELETE',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    }
  };

  request(options, function(error, response, body) {
    console.log("Deleted team: " + id.toString());
    console.log(error);
  });
}


/**
 * Gets team data for all teams under the given organization
 *
 * @param org Organization name
 */
var pageNumber = 1;

function getTeamData(org) {
  var options = {
    url: enterprise_url + 'orgs/' + org + '/teams?page=' + pageNumber + '&per_page=100',
    method: 'GET',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    }
  };

  request(options, function(error, response, body) {
    fs.appendFile("team.json", body, function(err) {});
  });
  if (pageNumber > 10)
    return;
  setTimeout(function() {
    console.log('Blah blah blah blah extra-blah');
    pageNumber++;
    getTeamData(org);
  }, 5000);
}

//Makes correction to json files after merging them
function writeJSON() {
  var previousData = fs.readFileSync('./team.json', 'utf8').toString();
  previousData = previousData.split('[]').join("");
  previousData = previousData.split('][').join(",");
  fs.writeFile('team.json', previousData, function() {});
}


/**
 * Parses the team data to get team id for the given team name
 *
 * @param teamName Team name
 * @param org Organization name
 */
function getTeamId(teamName, org) {
  var obj = JSON.parse(fs.readFileSync('./team.json', 'utf8'));
  for (var i = 0; i < obj.length; i++) {
    if (obj[i].name == teamName)
      return obj[i].id.toString();
  }
}


/**
 * Removes a repository from a team inside the given org
 *
 * @param repoName Repository name
 * @param teamName Team name
 * @param org Organization name
 */
function removeTeamRepository(repoName, teamName, org) {
  var options = {
    url: enterprise_url + 'teams/' + getTeamId(teamName, org) + '/repos/' + org + '/' + repoName,
    method: 'DELETE',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    }
  };

  request(options, function(error, response, body) {
    console.log("Deleted team repository: " + teamName);
  });
}


/**
 * Adds a user to the given team
 *
 * @param username username of the user
 * @param teamName Team name
 * @param org Organization name
 */
function addUserToTeam(username, teamName, org) {
  var options = {
    url: enterprise_url + 'teams/' + getTeamId(teamName, org) + '/memberships/' + username,
    method: 'PUT',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    }
  };

  request(options, function(error, response, body) {
		// console.log(getTeamId(teamName, org));
    console.log("Added " + username + " to team: " + teamName);
  });
}


/**
 * Removes a user from the given team.
 *
 * @param username The user's username
 * @param teamName Team name
 * @param org Organization name
 */
function removeUserFromTeam(username, teamName, org) {
  var options = {
    url: enterprise_url + 'teams/' + getTeamId(teamName, org) + '/memberships/' + username,
    method: 'DELETE',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    }
  };

  request(options, function(error, response, body) {
    console.log("Removed " + username + " from team: " + teamName);
  });
}

/**
 * Updates team repository permissions
 *
 * @param repoName repository name
 * @param teamName team name
 * @org orgnaization name
 * @permission new permission level : "pull", "push", "admin"
 */
function updateTeamRepositoryPermissions(repoName, teamName, org, permission) {
  var options = {
    url: enterprise_url + 'teams/' + getTeamId(teamName, org) + '/repos/' + org + '/' + repoName,
    method: 'PUT',
    headers: {
      "User-Agent": "AssignMe",
      "content-type": "application/json",
      "Authorization": token
    },
    json: {
      "permission": permission
    }
  };

  request(options, function(error, response, body) {
		// console.log(error);
    console.log("Updated permission on repository: " + repoName + " to " + permission);
  });
}
// updateTeamRepositoryPermissions("3", "3", "assignme", "push");

//readFILE line by line and assign the teams to ids.
function assignAll(inputFile, organization) {
  var fs = require('fs'),
    readline = require('readline'),
    instream = fs.createReadStream(inputFile),
    outstream = new(require('stream'))(),
    rl = readline.createInterface(instream, outstream);

  rl.on('line', function(line) {
    // console.log("username: " + line.split(":")[0]);
    // console.log("reponame: " + line.split(":")[1]);
    var username = line.split(":")[0];
    var teamname = line.split(":")[1];
    addUserToTeam(username, teamname, organization);
  });

  rl.on('close', function(line) {
    // console.log('done reading file.');
  });
}

//readFILE line by line and change access of each user to "permission" parameter
function changeAccess(inputFile, organization, permission) {
  var fs = require('fs'),
    readline = require('readline'),
    instream = fs.createReadStream(inputFile),
    outstream = new(require('stream'))(),
    rl = readline.createInterface(instream, outstream);

  rl.on('line', function(line) {
    // console.log("username: " + line.split(":")[0]);
    // console.log("reponame: " + line.split(":")[1]);
    var username = line.split(":")[0];
    var teamname = line.split(":")[1];
    updateTeamRepositoryPermissions(teamname, teamname, organization, permission);
  });

  rl.on('close', function(line) {
    // console.log('done reading file.');
  });
}



//**************************************************************
//**************************************************************
//************************** Testing****************************
//**************************************************************
//**************************************************************

// var usernames = ["theferrit32", "shorsher", "chbrown13", "sheckman", "jctetter", "ssmirr"];

// create team and repos 1-6
// for (var i = 0; i < 500; i++) {
// 	createTeam(i.toString(), "assignme");
// 	createRepo(i.toString(), "assignme");
// }

// get team data
// getTeamData("assignme");
// writeJSON();

//Assign repository to teams:
// for (var i = 0; i < 3; i++) {
// 	addRepoToTeam(i, i, "assignme");
// }

//Adding users to teams:
// for (var i = 0; i < 200; i++) {
// 	// addUserToTeam(usernames[i], i, "assignme");
// 	addUserToTeam('ssmirr', i, "assignme");
// 	console.log(getTeamId(i, "assignme"));
// }

//Update repo permissions:
// for (var i = 0; i < 6; i++) {
// 	updateTeamRepositoryPermissions(i, i, "assignme", "pull");
// }

//removing users from teams:
// for (var i = 0; i < 6; i++) {
// 	removeUserFromTeam(usernames[i], i, "assignme");
// }

//remove repository 1-6 from teams 1-6
// for (var i = 0; i < 6; i++) {
// 	removeTeamRepository(i, i, "assignme");
// }

//delete team 1-6
// for (var i = 0; i < 200; i++) {
// 		// deleteTeam(getTeamId(i.toString(), "assignme"));
// 		deleteTeam(getTeamId(i.toString(), "assignme"));
// }

//delete repo 1-6
// for (var i = 0; i < 20; i++) {
// 	deleteRepo(i.toString(), "assignme");
// }

// reading repository data and assigning the team names
// assignAll('ncsu_repository_data');




//**************************************************************
//**************************************************************
//*********************** Instructions *************************
//**************************************************************
//**************************************************************




var args = process.argv.slice(2);
var command = args[0];
var org = args[1];
var repositories = args[2]; //unityid:teamname
var permission = args[3]; //new permission level: push/pull for updating use access level

/** handling the entered command */
if (command === 'getdata') {
  if (typeof command !== 'undefined') {
    if (typeof org == 'undefined')
      console.error('Second commandline parameter not entered: Organization Name');
    else {
      console.log('Get data ... \n\n');
      getTeamData(org);
    }
  }
}

//fixing the json file after concatinating all pages.
else if (command === 'makejson') {
  console.log('Making the json file ...\n\n');
  writeJSON();
}

//assign the repositories
else if (command === 'assign') {
  if (typeof org == 'undefined')
    console.error('Commandline parameter not entered: Organization_Name Repository_List_File');
  else if (typeof repositories == 'undefined')
    console.error('Third Commandline parameter not entered: Repository_List_File');
  else {
    console.log('Assigning the repositories ...\n\n');
    assignAll(repositories, org);
  }
}

//changing user access to repositories
else if (command === 'access') {
  if (typeof org == 'undefined')
    console.error('Commandline parameter not entered: Organization_Name Repository_List_File Access_Level');
  else if (typeof repositories == 'undefined')
    console.error('Commandline parameter not entered: Repository_List_File Access_Level');
  else if (typeof permission == 'undefined')
    console.error('4th Commandline parameter not entered: Access_Level');
  else {
    console.log('Assigning the repositories ...\n\n');
    changeAccess(repositories, org, permission.toString());
  }
} else
  console.error('Invalid parameter entered! use: getdata, makejson, assign');



// Here are the steps:

// *** 1 *** assignme is the organization name
// node assignme.js getdata engr-csc216-spring2016

// *** 2 *** Makes correction to json files after merging them
// node assignme.js makejson

// *** 3 *** P1_repos.cvs is the team data (on each line username:teamname)
// node assignme.js assign engr-csc216-spring2016 P1_repos.csv

// *** To change use access on repositories run: changeAccess
// node assignme.js access engr-csc216-spring2016 P1_repos.csv pull


// Please MAKE SURE run each of the steps above on by one (comment out the one that you don't want to run)
// otherwise it might nto work correctly.
// ** This is the next thing I need to fix **
