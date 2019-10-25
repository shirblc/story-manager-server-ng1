/*
	librarian.js
	Story Manager Service
	
	Written by Shir Bar Lev
*/

//librarian service to deal with getting and setting the stories list
angular.module('StoryManager')
	.service('librarian', ['$http', function($http) {
		//variable declaration
		var myStories;
		var currentStoryNum = 0;
		var currentStory;
		
		/*
		Function Name: getStory()
		Function Description: Gets a specific story from the stories array.
		Parameters: storyID - the number of story to get.
		----------------
		Programmer: Shir Bar Lev.
		*/
		function getStory(storyID)
		{
			return myStories.stories[storyID];
		}
		
		/*
		Function Name: getNumStories()
		Function Description: Gets the number of stories that currently exist.
		Parameters: None.
		----------------
		Programmer: Shir Bar Lev.
		*/
		function getNumStories()
		{
			return myStories.stories.length;
		}
		
		/*
		Function Name: getCurrentStory()
		Function Description: Gets the currently selected story.
		Parameters: None.
		----------------
		Programmer: Shir Bar Lev.
		*/
		function getCurrentStory()
		{
			return currentStory;
		}
		
		/*
		Function Name: setCurrentStoryNum()
		Function Description: Sets the number of the currently selected story
		Parameters: selectedStory - the number of the currently selected story.
		----------------
		Programmer: Shir Bar Lev.
		*/
		function setCurrentStoryNum(selectedStory)
		{
			currentStoryNum = selectedStory;
			currentStory = myStories.stories[selectedStory];
		}
		
		/*
		Function Name: updateStory()
		Function Description: Updates the JSON with the details of the currently open story's chapaters.
		Parameters: chapters - an array containing the story's chapters information.
		----------------
		Programmer: Shir Bar Lev.
		*/
		function updateStory(chapters)
		{	myStories.stories[currentStoryNum].chapters = chapters;
			$.ajax({
				url: "data/stories.json",
				type: "POST",
				data: myStories.stories[currentStoryNum]
			});
		}
		
		/*
		Function Name: updateStoryDetails()
		Function Description: Updates the stories array with the details of the currently open story.
		Parameters: storyName - the updated name of the story.
					storySynopsis - the updated synopsis of the story
		----------------
		Programmer: Shir Bar Lev.
		*/
		function updateStoryDetails(storyName, storySynopsis)
		{
			myStories.stories[currentStoryNum].name = storyName;
		 	myStories.stories[currentStoryNum].synopsis = storySynopsis;
		}
}]);