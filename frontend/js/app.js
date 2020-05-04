/*
	app.js
	Story Manager Module
	
	Written by Shir Bar Lev
*/

angular
.module('StoryManager', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider, $stateParams, $http) {
	$urlRouterProvider.otherwise('/');
	
	//home state (main/library page)
	$stateProvider.state('home', {
		templateUrl: '/views/libraryMgr.html',
		url: '/',
		resolve: {
			loadData: function($http) {
				return $http({
					method: 'GET',
					url: 'http://localhost:5000/'
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
			loadData: function($http, $stateParams) {
				return $http({
					method: 'GET',
					url: 'http://localhost:5000/story/' + $stateParams.id
				}).then(function(response) {
					return response.data.story;
				});
			}
		},
		controller: 'storyCtrl as story'
	});
	
	//a story edit page
	$stateProvider.state('edit', {
		templateUrl: '/views/storyEdit.html',
		url: '/story/{id}/edit-story',
		resolve: {
			loadData: function($http,  $stateParams) {
				return $http({
					method: 'GET',
					url: 'http://localhost:5000/story/' + $stateParams.id
				}).then(function(response) {
					return response.data.story;
				});
			}
		},
		controller: 'storyCtrl as story'
	});
	
	//a chapter edit page
	//child of the story edit page
	$stateProvider.state('editChapter', {
		templateUrl: '/views/chapterEdit.html',
		url:'/story/{id}/edit-story/edit-chapter/{chapterID}',
		resolve: {
			loadData: function($http, $stateParams) {
				return $http({
					method: 'GET',
					url: `http://localhost:5000/story/${$stateParams.id}/chapters/${$stateParams.chapterID}`
				}).then(function(response) {
					return response.data.chapter;
				});
			}
		},
		controller: 'storyCtrl as story'
	});
}]);

angular
.module('StoryManager').$inject = ['$http'];

//Injecting UI-Router stateParams
angular
.module('StoryManager').$inject = ['$stateParams'];

// register service worker
var serviceWorker;
if(navigator.serviceWorker)
	{
		navigator.serviceWorker.register("/sw.js", { scope: '/' }).then(function(reg) {
			serviceWorker = reg;
			// if there's no service worker controlling the page, reload to let the new service worker take over
			if(!navigator.serviceWorker.controller)
				{
					window.location.reload();
				}
		}).catch(function(err) {
			console.log(err);
		});
	}