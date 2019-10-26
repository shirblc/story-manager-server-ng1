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