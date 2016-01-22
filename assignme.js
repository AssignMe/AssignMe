var request = require('request');
var fs = require("fs");

// reading the token from file - Synchronous read
var token = fs.readFileSync('token');
console.log("Synchronous read: " + token.toString());


//**************************************************************
//**************************************************************
//************* Creation / Assignment functions ****************
//**************************************************************
//**************************************************************

/**
 * Creates repository under the given org and given name
 */
function createRepo(name) {
	var options = {
		// url: ' https://api.github.com/user/repos',
		url: 'https://api.github.com/orgs/AssignMe/repos',
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

	request(options, function (error, response, body) {
		console.log(body);
	});
}

/**
 * Created a team under the given org
 * @return id of the team
 */
function createTeam(teamName, org) {
	var options = {
		url: 'https://api.github.com/orgs/' + org + '/teams',
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

	request(options, function (error, response, body) {
		var ID = body.id;
		return ID;
	});
}




//**************************************************************
//**************************************************************
//********************** Needs more work ***********************
//**************************************************************
//**************************************************************


/**
 * get org's teams
 * @return id of the team
 */
function getTeamId(teamName, org) {
	var options = {
		url: 'https://api.github.com/orgs/' + org + '/teams',
		method: 'GET',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		console.log(body); //This prints out the json but if I "return body" and print it that way it prints undefined?
		return body;
	});
}

function addRepoToTeam(repoName) {
	var options = {
		url: 'https://api.github.com/orgs/AssignMe/teams',
		method: 'PUT',
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

	request(options, function (error, response, body) {
		console.log(body);
	});
}

/**
 * Deletes an org's team, given it's id
 */
function deleteTeam(id) {
	var options = {
		url: 'https://api.github.com/teams/' + id.toString(),
		method: 'DELETE',
		headers: {
			"User-Agent": "AssignMe",
			"content-type": "application/json",
			"Authorization": token
		}
	};

	request(options, function (error, response, body) {
		console.log(body[0].url);
	});
}

print(getTeamId("25", "assignme"));