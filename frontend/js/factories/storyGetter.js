/*
	storyGetter.js
	Story Manager Factory
	
	Written by Shir Bar Lev
*/

angular.module('StoryManager')
	.factory('storyGetter', ['$http', function storyGetterFactory($http) {
	//returns 
		return {
			getStories:  function getStories() {
				return $http.get('http://localhost:5000/');
			}
		}
	}
]);