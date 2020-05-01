/*
	librarian.js
	Story Manager Service
	
	Written by Shir Bar Lev
*/

//librarian service to deal with exporting the changes the user makes to their stories
angular.module('StoryManager')
	.service('librarian', ['$http', function($http) {
		//variable declaration
		var vm = this;
		this.myStories = {
			stories: []
		};
		
		/*
		Function Name: addStory()
		Function Description: Adds a new story.
		Parameters: story - the new story. 
							   updatedStories - the updated stories array (including the new story).
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.addStory = function(story, updatedStories)
		{
			$http({
					method: 'POST',
					url: 'http://localhost:5000/',
					data: JSON.stringify(story)
				}).then(function(response) {
					return response.data;
				});
			
			vm.myStories.stories = updatedStories;
			vm.postToCache();
		}
		
		/*
		Function Name: postToCache()
		Function Description: Sends the updated stories object to the Service Worker so they
							can be cached.
		Parameters: None.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.postToCache = function() {
			navigator.serviceWorker.controller.postMessage(vm.myStories);
		}
}]);