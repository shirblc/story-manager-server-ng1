/*
	libraryCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/

//library controller
//contains all the stotries' basic data
angular.module("StoryManager")
	.controller("libraryCtrl", ['librarian', function(librarian) {
		//variable declaration
		var numStories = librarian.getNumStories();
		var storiesDetails = [];
		var selectedStory = 0;
		
		getStoryDetails();
		/*
		Function Name: getStoryDetails()
		Function Description: Gets the details of each story from the librarian service and adds their
								title and synopsis to the storiesDetails array (used by the template).
		Parameters: None.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.getStoryDetails = function()
		{
			for(var i = 0; i < numStories; i++)
			{
				var storyDetails = librarian.getStory(i+1);
				var story = { 
					title: storyDetails.title, 
					synopsis: storyDetails.synopsis
				};
				storiesDetails.push(story);
			}
		}

		/*
		Function Name: getSelectedStory()
		Function Description: Returns the number of the currently selected story.
		Parameters: None.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.getSelectedStory = function()
		{
			return selectedStory;
		}

		/*
		Function Name: setSelectedStory()
		Function Description: Sets the number of the currently selected story, both in the controller
								and in the librarian service.
		Parameters: numSelected - new selected story.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.setSelectedStory = function(numSelected)
		{
			selectedStory = numSelected;
			librarian.setCurrentStoryNum(numSelected);
		}
}]);