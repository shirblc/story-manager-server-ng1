/*
	app.js
	Story Manager Module
	
	Written by Shir Bar Lev
*/

angular
.module('StoryManager', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	
	$stateProvider.state('home', {
		templateUrl: '/views/libraryMgr.html',
		url: '/',
		controller: 'libraryCtrl'
	});
}]);

angular
.module('StoryManager').$inject = ['$http'];