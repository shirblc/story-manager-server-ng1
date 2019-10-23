//librarian service to deal with getting and setting the stories list
angular.module('StoryManager')
	.service('librarian', function() {
	var myStories = getStories();
	
		function getStories()
		{
			return $.getJSON('data/stories.json');
		}
	
		function getStoryDetails(storyID)
		{
			return myStories[storyID];
		}
	
		function getChapterDetails(storyID, chapterID)
		{
			
		}
});