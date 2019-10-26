/*
	editCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/

//edit controller, responsible for any editing act (on both storyEdit and chapterEdit)
angular.module("StoryManager")
	.controller("editCtrl", ['librarian', function(librarian) {
		//variable declaration
		var vm = this;
		this.story;
		
		//changes the name and the synopsis of the story to the new ones
		//set by the user. Passes the originaal value if undefined.
		this.changeDetails = function(newName, newSynopsis) {
			vm.story.name = newName;
			vm.story.synopsis = newSynopsis;
			librarian.updateStoryDetails(vm.story.name, vm.story.synopsis);
		};
}]);