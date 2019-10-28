/*
	storyCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/

//story manager controller
//contains the currently viewed story
angular.module('StoryManager')
	.controller('storyCtrl', ['$stateParams', 'librarian', 'loadData', function($stateParams, librarian, loadData) {
		//variable declaration
		var vm = this;
		var storyDetails = loadData[$stateParams.id-1];
		this.storyName = storyDetails.name;
		this.storySynopsis = storyDetails.synopsis;
		this.chapters = storyDetails.chapters;
		this.storyID = storyDetails.id;
		
		/*
		Function Name: changeDetails()
		Function Description: Changes the name and synopsis of the story.
		Parameters: None.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.changeDetails = function() {
			vm.storyName = document.getElementById("storyTitle").value;
			vm.storySynopsis =  document.getElementById("storySynopsis").value;
			librarian.updateStoryDetails(vm.storyName, vm.storySynopsis);
		};
		
		/*
		Function Name: changeChapterDetails()
		Function Description: Changes the name and synopsis of the selected chapter.
		Parameters: chapterName - the new name for the chapter
					chapterSynopsis - the new synopsis for the chapter
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.changeChapterDetails = function(chapterName, chapterSynopsis)
		{
			vm.story.chapters[$stateParams.chapterNum-1].name = chapterName;
			vm.story.chapters[$stateParams.chapterNum-1].name = chapterSynopsis;
			librarian.updateStory(vm.story.chapters);
		}
		
		/*
		Function Name: addChapter()
		Function Description: Adds a new chapter.
		Parameters: chapterName - the name of the new chapter
					chapterSynopsis - the synopsis of the new chapter
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.addChapter = function(chapterName, chapterSynopsis)
		{
			vm.chapters.push({number: chapters.length, title: chapterName, synopsis: chapterSynopsis});
			librarian.updateStory(chapters);
		}
		
		/*
		Function Name: removeChapter()
		Function Description: Deletes a chapter.
		Parameters: chapterID - the number of the chapter to delete
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.removeChapter = function(chapterID)
		{
			vm.chapters.splice(chapterID, 1);
			librarian.updateStory(chapters);
		}
}]);