/*
	librarian.js
	Story Manager Service
	
	Written by Shir Bar Lev
*/

//librarian service to deal with exporting the changes the user makes to their stories
angular.module('StoryManager')
	.service('librarian', ['$http', 'storyGetter', function($http, storyGetter) {
		//variable declaration
		var vm = this;
		this.myStories;
		this.getStories = storyGetter.getStories().then(function(response) {
			vm.myStories = response.data.stories;
		});
		
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
		Function Name: updateStory()
		Function Description: Updates an existing story.
		Parameters: updatedStory - Updated story data.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.updateStory = function(updatedStory)
		{
			vm.myStories.stories[updatedStory.id-1] = updatedStory;
			
			// Sends the new story to the server
			$http({
					method: 'POST',
					url: `http://localhost:5000/story/${updatedStory.id}`,
					data: JSON.stringify(updatedStory)
				}).then(function(response) {
					return response.data;
				});
			
			// Updates the service worker
			vm.postToCache();
		}
		
		/*
		Function Name: addChapter()
		Function Description: Adds a new chapter.
		Parameters: chapter - the new chapter.
							   storyID - the ID of the story.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.addChapter = function(chapter, storyID)
		{
			vm.myStories[storyID-1].chapters.push(chapter);
			
			// Sends the new chapter to the server
			$http({
					method: 'POST',
					url: `http://localhost:5000/story/${storyID}`,
					data: JSON.stringify(chapter)
				}).then(function(response) {
					return response.data;
				});
			
			// Updates the service worker
			vm.postToCache();
		}
		
		/*
		Function Name: editChapter()
		Function Description: Edits a chapter.
		Parameters: chapter - the new chapter.
							   storyID - the ID of the story.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.editChapter = function(chapter, storyID)
		{
			vm.myStories[storyID-1].chapters[chapter.number-1] = chapter;
			
			// Sends the new chapter to the server
			$http({
					method: 'POST',
					url: `http://localhost:5000/story/${storyID}/chapters/${chapter.number}`,
					data: JSON.stringify(chapter)
				}).then(function(response) {
					return response.data;
				});
			
			// Updates the service worker
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
			if(serviceWorker) {
				navigator.serviceWorker.controller.postMessage(vm.myStories);
			}
		}
}]);