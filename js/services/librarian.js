//librarian service to deal with getting and setting the stories list
angular.module('StoryManager')
	.service('librarian', function() {
	var myStories = getStories();
	var currentStoryNum = 0;
	var currentStory = myStories[currentStoryNum];
	
		function getStories()
		{
			return $.getJSON('data/stories.json');
		}
	
		function getStory(storyID)
		{
			return myStories.stories[storyID];
		}
		
		function getNumStories()
		{
			return myStories.stories.length;
		}
		
		function getCurrentStory()
		{
			return currentStory;
		}
	
		function setCurrentStoryNum(selectedStory)
		{
			currentStoryNum = selectedStory;
		}
		
		function updateStory(chapters)
		{	myStories.stories[currentStory].chapters = chapters;
			$.ajax({
				url: "data/stories.json",
				type: "POST",
				data: myStories.stories[currentStory]
			});
		}
		
		function updateStoryDetails(storyName, storySynopsis)
		{
			myStories.stories[currentStory].name = storyName;
		 	myStories.stories[currentStory].synopsis = storySynopsis;
		}
});