//new controller for the story manager template
angular.module('StoryManager')
	.controller('storyMgr', ['librarian', function(librarian) {
		let storyDetails = librarian.getCurrentStory();
		let storyName = storyDetails.name;
		let storySynopsis = storyDetails.synopsis;
		let chapters = storyDetails.chapters;
		
		function changeStoryName(newName)
		{
			storyName = newName;
		}
		
		function changeChapterName(chapterNum, chapterName)
		{
			chapters[chapterNum-1].name = chapterName;
			librarian.updateStory(chapters);
		}
		
		function changeChapterSynopsis(chapterNum, chapterSynopsis)
		{
			chapters[chapterNum-1].name = chapterSynopsis;
			librarian.updateStory(chapters);
		}
		
		function addChapter(chapterName, chapterSynopsis)
		{
			chapters.push({number: chapters.length, title: chapterName, synopsis: chapterSynopsis});
			librarian.updateStory(chapters);
		}
		
		function removeChapter(chapterID)
		{
			chapters.splice(chapterID, 1);
			librarian.updateStory(chapters);
		}
}]);