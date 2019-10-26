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
		
		/*
		Function Name: changeDetails()
		Function Description: Changes the name and synopsis of the story.
		Parameters: newName - the new name for the story.
					newSynopsis - the new synopsis
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.changeDetails = function(newName, newSynopsis) {
			vm.story.name = newName;
			vm.story.synopsis = newSynopsis;
			librarian.updateStoryDetails(vm.story.name, vm.story.synopsis);
		};
		
		/*
		Function Name: changeChapterDetails()
		Function Description: Changes the name and synopsis of the selected chapter.
		Parameters: chapterNum - the number of chapter to change
					chapterName - the new name for the chapter
					chapterSynopsis - the new synopsis for the chapter
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.changeChapterDetails = function(chapterNum, chapterName, chapterSynopsis)
		{
			vm.story.chapters[chapterNum-1].name = chapterName;
			vm.story.chapters[chapterNum-1].name = chapterSynopsis;
			librarian.updateStory(vm.story.chapters);
		}
}]);