/*
	app.js
	Story Manager Module
	
	Written by Shir Bar Lev
*/

angular
.module('StoryManager', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider, $http) {
	$urlRouterProvider.otherwise('/');
	
	//home state (main/library page)
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
		controller: 'libraryCtrl as library'
	});
	
	//a story's page
	$stateProvider.state('story', {
		templateUrl: '/views/storyMgr.html',
		url: '/story/{id}',
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
		controller: 'storyCtrl as story'
	});
	
	//a story edit page
	//child of the story page
	$stateProvider.state('story.edit', {
		templateUrl: '/views/storyEdit.html',
		url: '/story/{id}/edit-story',
		controller: 'editCtrl as edit'
	});
	
	//a chapter edit page
	//child of the story edit page
	$stateProvider.state('story.edit.chapter', {
		templateUrl: '/views/chapterEdit.html',
		url: '/story/{id}/edit-story/edit-chapter/{chapterNum}',
		controller: 'editCtrl as edit'
	});
}]);

angular
.module('StoryManager').$inject = ['$http'];