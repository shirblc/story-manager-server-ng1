/*
	storyCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/

//story manager controller
//contains the currently viewed story
angular.module('StoryManager')
	.controller('storyCtrl', ['librarian', function(librarian) {
		//variable declaration
		var storyDetails = librarian.getCurrentStory();
		var storyName = storyDetails.name;
		var storySynopsis = storyDetails.synopsis;
		var chapters = storyDetails.chapters;
		
		/*
		Function Name: changeStoryName()
		Function Description: Changes the name of the story.
		Parameters: newName - the new name for the story.
		----------------
		Programmer: Shir Bar Lev.
		*/
		function changeStoryName(newName)
		{
			storyName = newName;
		}
		
		/*
		Function Name: changeChapterName()
		Function Description: Changes the name of the selected chapter.
		Parameters: chapterNum - the number of chapter to change
					chapterName - the new name for the chapter
		----------------
		Programmer: Shir Bar Lev.
		*/
		function changeChapterName(chapterNum, chapterName)
		{
			chapters[chapterNum-1].name = chapterName;
			librarian.updateStory(chapters);
		}
		
		/*
		Function Name: changeChapterSynopsis()
		Function Description: Changes the synopsis of the selected chapter.
		Parameters: chapterNum - the number of chapter to change
					chapterSynopsis - the new synopsis for the chapter
		----------------
		Programmer: Shir Bar Lev.
		*/
		function changeChapterSynopsis(chapterNum, chapterSynopsis)
		{
			chapters[chapterNum-1].name = chapterSynopsis;
			librarian.updateStory(chapters);
		}
		
		/*
		Function Name: addChapter()
		Function Description: Adds a new chapter.
		Parameters: chapterName - the name of the new chapter
					chapterSynopsis - the synopsis of the new chapter
		----------------
		Programmer: Shir Bar Lev.
		*/
		function addChapter(chapterName, chapterSynopsis)
		{
			chapters.push({number: chapters.length, title: chapterName, synopsis: chapterSynopsis});
			librarian.updateStory(chapters);
		}
		
		/*
		Function Name: removeChapter()
		Function Description: Deletes a chapter.
		Parameters: chapterID - the number of the chapter to delete
		----------------
		Programmer: Shir Bar Lev.
		*/
		function removeChapter(chapterID)
		{
			chapters.splice(chapterID, 1);
			librarian.updateStory(chapters);
		}
}]);