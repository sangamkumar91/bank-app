var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');
//var request = require('request');
var csv = require('fast-csv');
var port = process.env.PORT || 8080;
//Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/resources'));
//Middlewares
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
//Routes
function sortObject(obj) {
	var arr = [];
	var prop;
	for (prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			if (obj[prop] !== null && obj[prop] !== undefined && prop !== '') arr.push({
				'key': prop,
				'value': obj[prop].bank_name
			});
		}
	}
	arr.sort(function(a, b) {
		return (a.value > b.value) ? 1 : -1;
	});
	return arr;
}
app.get('/', function(req, res) {
	var scount = 0;
	var count = 1;
	if(listOfBanks === null)
	{
		listOfBanks = {};
	var stream = fs.createReadStream("bank_list.csv");
	csv.fromStream(stream, {
		headers: true
	}).on("data", function(data) {
		if (!listOfBanks[data['bank_id']]) {
			var newBank = new Bank(data);
			listOfBanks[data['bank_id']] = newBank;
		} else {
			listOfBanks[data['bank_id']].addCity(data);
		}
	
	}).on("end", function() {
		
		
		
		sortedlistOfBanks = sortObject(listOfBanks);
		res.render('index', {
			items: sortedlistOfBanks
		});
	});
		
	}
	else{
		
		res.render('index', {
			items: sortedlistOfBanks
		});
		
	}


});
app.post('/suggestions', function(req, res) {
	var bankId = req.body.bank_id;
	var citySearch = req.body.city;
	var resultArr = [];
	if (listOfBanks.length == 0) {}
	if (Boolean(bankId)) {
		var selectedCities = listOfBanks[bankId].cities;
				for (var city in selectedCities) {
					if (city.toUpperCase().indexOf(citySearch.toUpperCase()) == 0) {
						resultArr.push(city);
					}
				}
			
		
		res.json(resultArr);
	} else {
		res.json("Please Select Bank");
	}
});
app.post('/branches', function(req, res) {
	var bankId = req.body.bank_id;
	var location = req.body.location;
	var resultArr = [];
	try {
		var selectedBranches = listOfBanks[bankId].cities[location.city].branches;
	} catch (e) {
		res.json([]);
		return;
	}
	for (var branch in selectedBranches) {
		var branchObj = {
			ifsc: branch,
			branch: selectedBranches[branch].branch,
			address: selectedBranches[branch].address,
			state:selectedBranches[branch].state,
			district:selectedBranches[branch].district
			
		}
		resultArr.push(branchObj);
	}
	res.json(resultArr);
});
// Data Structure
var Branch = function(data) {
	this.address = data['address'];
	this.branch = data['branch'];
	this.district = data['district'];
	this.state = data['state'];
}
var City = function(data) {
	var self = this;
	self.branches = [];
	self.addBranch = function(data) {
		Branch.prototype = self;
		var newBranch = new Branch(data);
		self.branches[data['ifsc']] = newBranch;
		return self;
	};
	self.addBranch(data);
}
var Bank = function(data) {
	var self = this;
	self.bank_id = data['bank_id']
	self.bank_name = data['bank_name'];
	self.states = [];
	self.cities = [];
	self.addCity = function(data) {
		if (self.cities[data['city']]) {
			self.cities[data['city']].addBranch(data);
			return self;
		} else {
			City.prototype = self;
			var newCity = new City(data);
			self.cities[data['city']] = newCity;
			return self.cities[data['city']];
		}
	};
	self.addCity(data);
}
var listOfBanks = null;
var sortedlistOfBanks;
	//Start Application
app.listen(port, function() {
	console.log('Ready on Heroku port ' + port);
});