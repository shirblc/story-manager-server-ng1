//install event listener
this.addEventListener("install", function(event) {
	event.waitUntil(
		//open a cache
		caches.open("story-mgr-v1").then(function(cache) {
			//site assets to cache
			let toCache = [
				'index.html',
				'/views/chapterEdit.html',
				'/views/libraryMgr.html',
				'/views/settings.html',
				'/views/storyEdit.html',
				'/views/storyMgr.html',
				'/js/app.js',
				'/js/services/librarian.js',
				'/js/controllers/libraryCtrl.js',
				'/js/controllers/settingsCtrl.js',
				'/js/controllers/storyCtrl.js',
				'/data/stories.json',
				'/css/styles.css',
				'/css/Noteworthy-Lt.ttf'
			];
			
			//add the assets to cache
			cache.addAll(toCache);
			//error
		}).catch(function(error) {
			console.log(error);
		})
	)
});