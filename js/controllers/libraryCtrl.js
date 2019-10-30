/*
	libraryCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/

//library controller
//contains all the stotries' basic data
angular.module("StoryManager")
	.controller("libraryCtrl", ['librarian', 'loadData', function(librarian, loadData) {
		//variable declaration
		var vm = this;
		this.numStories = loadData.length;
		this.storiesDetails = getStoryDetails();
		this.selectedStory = 0;
		
		/*
		Function Name: getStoryDetails()
		Function Description: Gets the details of each story from the loadData resolve and adds their
								title and synopsis to the storiesDetails array (used by the template).
		Parameters: None.
		----------------
		Programmer: Shir Bar Lev.
		*/
		function getStoryDetails()
		{
			var storyArray = []; 
			
			for(var i = 0; i < vm.numStories; i++)
			{
				var storyDetails = loadData[i];
				var story = {
					title: storyDetails.name, 
					synopsis: storyDetails.synopsis,
					id: storyDetails.id
				};
				storyArray.push(story);
			}
			
			return storyArray;
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
			return vm.selectedStory;
		}

		/*
		Function Name: setSelectedStory()
		Function Description: Sets the number of the currently selected story.
		Parameters: numSelected - new selected story.
		----------------
		Programmer: Shir Bar Lev.
		*/
		this.setSelectedStory = function(numSelected)
		{
			selectedStory = numSelected;
		}
}]);