var nextMailApp = angular.module('nextMailApp', []);
nextMailApp.controller('mainController', function($scope, $http, $log) {
	$scope.city = "";
	$scope.bank_id = document.getElementById('bankName').options[0].value;
	$scope.suggestedCities = [];
	$scope.branches = [];
	$scope.suggestCitiesClick = function() {
		if ($scope.city == '') {
			$scope.suggestedCities = [];
			return;
		}
	}
	$scope.suggestCities = function() {
		if ($scope.bank_id == '') {
			$scope.city = '';
			return;
		}
		if ($scope.city == '') {
			$scope.suggestedCities = [];
			return;
		}
		if ($scope.location != null && $scope.location.city == $scope.city) {
			$scope.selectCity(null);
			return;
		}
		var url = "/suggestions";
		$http.post(url, {
			bank_id: $scope.bank_id,
			city: $scope.city
		}).success(function(response) {
			$log.info(response);
			$scope.suggestedCities = response;
			$scope.location = null;
		});
	};
	$scope.selectCity = function(el) {
		if (el != null) {
			$scope.city = el.target.attributes['city'].value;
			$scope.state = el.target.attributes['state'].value;
			$scope.district = el.target.attributes['district'].value;
			$scope.location = {
				city: $scope.city,
				state: $scope.state,
				district: $scope.district
			}
		}
		var url = "/branches";
		$http.post(url, {
			bank_id: $scope.bank_id,
			location: $scope.location
		}).success(function(response) {
			$scope.suggestedCities = [];
			var sel = document.getElementById('bankName');
			$scope.bank_name = sel.options[sel.selectedIndex].text;
			$scope.selectedCity = document.getElementById('cityName').value;
			$scope.branches = response;
		});
	};
});