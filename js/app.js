/*
	app.js
	Story Manager Module
	
	Written by Shir Bar Lev
*/

angular
.module('StoryManager', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider, $http) {
	$urlRouterProvider.otherwise('/');
	
	$stateProvider.state('home', {
		templateUrl: '/views/libraryMgr.html',
		url: '/',
		resolve: {
			loadData: function($http) {
				return $http({
					method: 'GET',
					url: '/data/stories.json'
				}).then(function(response) {
					return response.data.stories;
				});
			}
		},
		controller: 'libraryCtrl'
	});
}]);

angular
.module('StoryManager').$inject = ['$http'];