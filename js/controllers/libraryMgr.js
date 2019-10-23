//library controller
//contains all the stotries' basic data
angular.module("StoryManager")
	.controller('libraryMgr', ['librarian', function(librarian) {
	var numStories = librarian.getNumStories();
	var storiesDetails = [];
	var selectedStory = 0;
	
	function getStoryDetails()
	{
		for(var i = 0; i < numStories; i++)
		{
			var storyDetails = librarian.getStory(i+1);
			var story = { title: storyDetails.title, synopsis: storyDetails.synopsis };
			storiesDetails.push(story);
		}
	}
	
	function getSelectedStory()
	{
		return selectedStory;
	}
	
	function setSelectedStory(numSelected)
	{
		selectedStory = numSelected;
	}
}]);