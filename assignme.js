var request = require('request');
var fs = require("fs");

// reading the token from file - Synchronous read
var token = fs.readFileSync('token');
console.log("Synchronous read: " + token.toString());

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

var teamCount = 1;
function createTeam(name) {
	var options = {
		// url: ' https://api.github.com/user/repos',
		url: 'https://api.github.com/orgs/AssignMe/teams',
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



// createRepo("test");
for (var index = 0; index < 5; index++) {
	createTeam(index.toString());
}
