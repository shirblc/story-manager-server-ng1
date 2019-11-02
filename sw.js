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

//fetch event listener
this.addEventListener("fetch", function(event) {
	let reqUrl = event.request.url;
	let urlToGet;
	
	//if the requested page is the home page
	if(reqUrl.pathname == "/")
		urlToGet = "index.html";\
	else
		urlToGet = reqUrl;
	
	//response
	event.respondWith(
		caches.match(urlToGet).then(function(response) {
			//if the url exists in the cache
			if(response)
				{
					return response;
				}
			//if the url doesn't exist in the cache
			else
				{
					return fetch(urlToGet);
				}
		})
	);
});