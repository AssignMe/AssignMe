### Python version:
Generating mass GitHub repos/teams under an existing organization and assigning users to their corresponding teams.
At the end there is an option for changing their access to read only.

---

`assignme.py` has the same functionality as the older node version, rewritten in python.

---

### Installing the Requirements:
Assignme needs `requests` python module which can be installed using pip:
```
pip install requests
```

I'm using a `sqlite3` database in this new version to make it nicer. So need to have [`sqlite3`](https://www.sqlite.org/download.html) installed as well.


### Commands:
Here is what you can do with this script:
```
$ python assignme.py --import fall2016.csv --dbPath fall2016.db --tableName fall2016
$ python assignme.py -m --dbPath fall2016.db --orgName assignme --tableName fall2016 #makes teams and repos
$ python assignme.py --assign --dbPath fall2016.db --orgName assignme --tableName fall2016
$ python assignme.py -u --dbPath fall2016.db --orgName assignme --tableName fall2016 --permission pull #updates the permissions
$ python assignme.py -d --dbPath fall2016.db --orgName assignme --tableName fall2016 #deletes the teams and repos
```


I will add a more detailed readme ...
