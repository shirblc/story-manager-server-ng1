"use strict";

/*
	app.js
	Story Manager Module
	
	Written by Shir Bar Lev
*/
angular.module('StoryManager', ['ui.router']).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider, $stateParams, $http) {
  $urlRouterProvider.otherwise('/'); //home state (main/library page)

  $stateProvider.state('home', {
    templateUrl: '/views/libraryMgr.html',
    url: '/',
    resolve: {
      loadData: function loadData($http) {
        return $http({
          method: 'GET',
          url: 'http://localhost:5000/'
        }).then(function (response) {
          return response.data.stories;
        });
      }
    },
    controller: 'libraryCtrl as library'
  }); //a story's page

  $stateProvider.state('story', {
    templateUrl: '/views/storyMgr.html',
    url: '/story/{id}',
    resolve: {
      loadData: function loadData($http, $stateParams) {
        return $http({
          method: 'GET',
          url: 'http://localhost:5000/story/' + $stateParams.id
        }).then(function (response) {
          return response.data.story;
        });
      }
    },
    controller: 'storyCtrl as story'
  }); //a story edit page

  $stateProvider.state('edit', {
    templateUrl: '/views/storyEdit.html',
    url: '/story/{id}/edit-story',
    resolve: {
      loadData: function loadData($http, $stateParams) {
        return $http({
          method: 'GET',
          url: 'http://localhost:5000/story/' + $stateParams.id
        }).then(function (response) {
          return response.data.story;
        });
      }
    },
    controller: 'storyCtrl as story'
  }); //a chapter edit page
  //child of the story edit page

  $stateProvider.state('editChapter', {
    templateUrl: '/views/chapterEdit.html',
    url: '/story/{id}/edit-story/edit-chapter/{chapterID}',
    resolve: {
      loadData: function loadData($http, $stateParams) {
        return $http({
          method: 'GET',
          url: "http://localhost:5000/story/".concat($stateParams.id, "/chapters/").concat($stateParams.chapterID)
        }).then(function (response) {
          return response.data.chapter;
        });
      }
    },
    controller: 'storyCtrl as story'
  });
}]);
angular.module('StoryManager').$inject = ['$http']; //Injecting UI-Router stateParams

angular.module('StoryManager').$inject = ['$stateParams']; // register service worker

var serviceWorker;

if (navigator.serviceWorker) {
  navigator.serviceWorker.register("/sw.js", {
    scope: '/'
  }).then(function (reg) {
    serviceWorker = reg; // if there's no service worker controlling the page, reload to let the new service worker take over

    if (!navigator.serviceWorker.controller) {
      window.location.reload();
    }
  })["catch"](function (err) {
    console.log(err);
  });
}
"use strict";

/*
	libraryCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/
//library controller
//contains all the stotries' basic data
angular.module("StoryManager").controller("libraryCtrl", ['librarian', 'loadData', function (librarian, loadData) {
  //variable declaration
  var vm = this;
  this.stories = loadData;
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

  function getStoryDetails() {
    var storyArray = [];

    for (var i = 0; i < vm.numStories; i++) {
      var storyDetails = loadData[i];
      var story = {
        title: storyDetails.title,
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


  this.getSelectedStory = function () {
    return vm.selectedStory;
  };
  /*
  Function Name: setSelectedStory()
  Function Description: Sets the number of the currently selected story.
  Parameters: numSelected - new selected story.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.setSelectedStory = function (numSelected) {
    vm.selectedStory = numSelected;
  };
  /*
  Function Name: openAdd()
  Function Description: Opens the "add story" popup.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.openAdd = function () {
    document.getElementById("modalBox").className = "on";
    document.getElementById("addPopUp").classList.remove("off");
    document.getElementById("addPopUp").classList.add("on");
  };
  /*
  Function Name: addStory()
  Function Description: Adds a new story.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.addStory = function () {
    var newStory = {
      "id": vm.numStories + 1,
      "title": document.getElementById("storyTitle").value,
      "synopsis": document.getElementById("storySynopsis").value,
      "chapters": []
    };
    vm.stories.push(newStory);
    librarian.addStory(newStory, vm.stories);
    document.getElementById("modalBox").className = "off";
    document.getElementById("addPopUp").classList.remove("on");
    document.getElementById("addPopUp").classList.add("off");
  };
  /*
  Function Name: closePopUp()
  Function Description: Closes the popup without adding a new story.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.closePopUp = function () {
    document.getElementById("modalBox").className = "off";
    document.getElementById("addPopUp").classList.remove("on");
    document.getElementById("addPopUp").classList.add("off");
  };
}]);
"use strict";

/*
	settingsCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/
//controller for the settings page
angular.module("StoryManager").controller("settingsCtrl", [function () {
  //chapters vs plot-lines view
  var storyView = "chaptersView"; //getter for the storyView

  this.getStoryView = function () {
    return storyView;
  }; //setter for the storyView


  this.setStoryView = function (newView) {
    storyView = newView;
  };
}]);
"use strict";

/*
	storyCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/
//story manager controller
//contains the currently viewed story
angular.module('StoryManager').controller('storyCtrl', ['$stateParams', 'librarian', 'loadData', '$state', function ($stateParams, librarian, loadData, $state) {
  //variable declaration
  var vm = this;
  this.storyDetails = loadData;
  this.storyName = this.storyDetails.title;
  this.storySynopsis = this.storyDetails.synopsis;
  this.chapters = this.storyDetails.chapters;
  this.storyID = this.storyDetails.id;
  this.chapter = loadChapterData();
  this.forDeletion; //the chapter being edited.

  this.editedChapter = $stateParams.chapterID;
  /*
  Function Name: loadChapterData()
  Function Description: Checks to see whether the current page has a "chapterID" value,
  					which means it's a chapter-edit page. If it is, fetches the data
  					of the chapter being edited for the template to fill in.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */

  function loadChapterData() {
    if ($stateParams.chapterID) {
      return vm.chapters[$stateParams.chapterID - 1];
    }
  }
  /*
  Function Name: changeDetails()
  Function Description: Changes the name and synopsis of the story.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.changeDetails = function () {
    vm.storyName = document.getElementById("storyTitle").value;
    vm.storySynopsis = document.getElementById("storySynopsis").value;
    vm.stories[vm.storyID - 1].name = vm.storyName;
    vm.stories[vm.storyID - 1].synopsis = vm.storySynopsis;
    librarian.updateStory(vm.storyDetails);
  };
  /*
  Function Name: deleteItem()
  Function Description: Opens a popup to confirm whether to delete the selected item.
  Parameters: toDelete - the item which needs to be deleted.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.deleteItem = function (toDelete) {
    document.getElementById("modalBox").className = "on";
    document.getElementById("deletePopUp").classList.remove("off");
    document.getElementById("deletePopUp").classList.add("on");
    if (typeof toDelete != "string") vm.forDeletion = "All chapters";else vm.forDeletion = toDelete;
  };
  /*
  Function Name: delete()
  Function Description: Deletes whatever the user asked to delete.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this["delete"] = function () {
    //if the user requested to delete the story
    if (vm.forDeletion == vm.storyName) {
      vm.stories.splice(vm.storyID - 1, 1);
      librarian.updateStories(vm.stories);
      $state.go("home");
    } //if the user requested to delete all the chapters
    else if (vm.forDeletion == "All chapters") {
        vm.chapters = [];
        vm.stories[vm.storyID - 1].chapters = [];
        librarian.updateStories(vm.stories);
      } //if it's not either of those, the user requested to delete a chapter
      else {
          var chapterNum = vm.forDeletion.substr(8, 1);
          vm.removeChapter(chapterNum);
        }
  };
  /*
  Function Name: closePopUp()
  Function Description: Aborts deletion and closes the popup.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.closePopUp = function () {
    document.getElementById("modalBox").className = "off"; //if the delete popup is the one from which the function was called, the function hides 
    //it.

    if (document.getElementById("deletePopUp").classList.contains("on")) {
      document.getElementById("deletePopUp").classList.add("off");
      document.getElementById("deletePopUp").classList.remove("on");
    } //if it wasn't the delete popup, it was the "add" popup, so the function
    //hides it instead
    else {
        document.getElementById("addPopUp").classList.add("off");
        document.getElementById("addPopUp").classList.remove("on");
      }
  };
  /*
  Function Name: changeChapterDetails()
  Function Description: Changes the name and synopsis of the selected chapter.
  Parameters: None
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.changeChapterDetails = function () {
    var chapterID = document.getElementById("chapterID").value;
    var editedChapter = {
      id: chapterID,
      number: document.getElementById("chapterNum").value,
      title: document.getElementById("chapterTitle").value,
      synopsis: document.getElementById("chapterSynopsis").value
    }; //if the chapter's number wasn't changed

    if (editedChapter.number == vm.chapter.number && editedChapter.id == vm.chapter.id) {
      vm.chapter.name = editedChapter.title;
      vm.chapter.synopsis = editedChapter.synopsis;
      vm.chapters[vm.chapter.number - 1] = editedChapter;
    } else {
      //checks whether there's already a chapter there
      //if there is, put it in the new location and move all chapters from there on forward
      if (vm.chapters[vm.chapter.number - 1]) {
        vm.chapters.splice(vm.chapter.number - 1, 0, editedChapter);
        vm.chapters.forEach(function (chapter, index) {
          if (index > vm.chapter.number) {
            chapter.number = index + 1;
          }
        });
      } //if there isn't
      else {
          vm.chapters[vm.chapter.number - 1].number = editedChapter.number;
          vm.chapters[vm.chapter.number - 1].name = editedChapter.title;
          vm.chapters[vm.chapter.number - 1].synopsis = editedChapter.synopsis;
        }
    }

    vm.storyDetails.chapters = vm.chapters;
    librarian.editChapter(editedChapter, vm.storyID);
    vm.changeState();
  };
  /*
  Function Name: changeState()
  Function Description: Once the user is done updating the chapter, sends the user back to the
  					story page.
  Parameters: None
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.changeState = function () {
    $state.go('story', {
      id: vm.storyID
    });
  };
  /*
  Function Name: openAddPanel()
  Function Description: Opens the panel allowing the user to insert the details for the new
  					chapter.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.openAddPanel = function () {
    document.getElementById("modalBox").className = "on";
    document.getElementById("addPopUp").classList.remove("off");
    document.getElementById("addPopUp").classList.add("on");
  };
  /*
  Function Name: addChapter()
  Function Description: Adds a new chapter.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.addChapter = function () {
    //checks whether a number was entered for chapter number
    //if there was, places the chapter in the given place
    //it there wasn't, simply adds it at the end of the current chapters array
    var numChapter = document.getElementById("chapterID").value ? document.getElementById("chapterID").value : vm.chapters.length + 1;
    var newChapter = {
      number: numChapter,
      title: document.getElementById("chapterTitle").value,
      synopsis: document.getElementById("chapterSynopsis").value
    }; //checks if there's already a chapter there
    //if there is

    if (vm.chapters[numChapter - 1]) {
      vm.chapters.splice(numChapter - 1, 0, newChapter);
      vm.chapters.forEach(function (chapter, index) {
        chapter.number = index + 1;
      });
    } //if there isn't
    else {
        //adds the chapter to the array in the story controller and sends it to the librarian
        vm.chapters.push(newChapter);
      }

    vm.storyDetails.chapters = vm.chapters;
    librarian.addChapter(newChapter, vm.storyID); //removes the modal box and popup

    document.getElementById("modalBox").className = "off";
    document.getElementById("addPopUp").classList.add("off");
    document.getElementById("addPopUp").classList.remove("on");
  };
  /*
  Function Name: openRemovePanel()
  Function Description: Opens the panel allowing the user to choose which chapters to delete.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.openRemovePanel = function () {
    document.querySelectorAll(".remove").forEach(function (chapter) {
      chapter.classList.add("on");
      chapter.classList.remove("off");
    });
    document.getElementById("doneBtn").classList.add("on");
    document.getElementById("doneBtn").classList.remove("off");
  };
  /*
  Function Name: closeRemovePanel()
  Function Description: Closes the panel allowing the user to choose which chapters to delete.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.closeRemovePanel = function () {
    document.querySelectorAll(".remove").forEach(function (chapter) {
      chapter.classList.add("off");
      chapter.classList.remove("on");
    });
    document.getElementById("doneBtn").classList.add("off");
    document.getElementById("doneBtn").classList.remove("on");
  };
  /*
  Function Name: removeChapter()
  Function Description: Deletes a chapter.
  Parameters: chapterNumber - number of the chapter to delete.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.removeChapter = function (chapterNumber) {
    vm.chapters.splice(chapterNumber, 1);
    vm.stories[vm.storyID - 1].chapters = vm.chapters;
    librarian.updateStories(vm.stories);
  };
}]);
"use strict";

/*
	storyGetter.js
	Story Manager Factory
	
	Written by Shir Bar Lev
*/
angular.module('StoryManager').factory('storyGetter', ['$http', function storyGetterFactory($http) {
  //returns 
  return {
    getStories: function getStories() {
      return $http.get('http://localhost:5000/stories');
    }
  };
}]);
"use strict";

/*
	librarian.js
	Story Manager Service
	
	Written by Shir Bar Lev
*/
//librarian service to deal with exporting the changes the user makes to their stories
angular.module('StoryManager').service('librarian', ['$http', 'storyGetter', function ($http, storyGetter) {
  //variable declaration
  var vm = this;
  this.myStories;
  this.getStories = storyGetter.getStories().then(function (response) {
    vm.myStories = response.data.stories;
  });
  /*
  Function Name: addStory()
  Function Description: Adds a new story.
  Parameters: story - the new story. 
  					   updatedStories - the updated stories array (including the new story).
  ----------------
  Programmer: Shir Bar Lev.
  */

  this.addStory = function (story, updatedStories) {
    $http({
      method: 'POST',
      url: 'http://localhost:5000/',
      data: JSON.stringify(story)
    }).then(function (response) {
      return response.data;
    });
    vm.myStories.stories = updatedStories;
    vm.postToCache();
  };
  /*
  Function Name: updateStory()
  Function Description: Updates an existing story.
  Parameters: updatedStory - Updated story data.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.updateStory = function (updatedStory) {
    vm.myStories.stories[updatedStory.id - 1] = updatedStory; // Sends the new story to the server

    $http({
      method: 'POST',
      url: "http://localhost:5000/story/".concat(updatedStory.id),
      data: JSON.stringify(updatedStory)
    }).then(function (response) {
      return response.data;
    }); // Updates the service worker

    vm.postToCache();
  };
  /*
  Function Name: addChapter()
  Function Description: Adds a new chapter.
  Parameters: chapter - the new chapter.
  					   storyID - the ID of the story.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.addChapter = function (chapter, storyID) {
    vm.myStories[storyID - 1].chapters.push(chapter); // Sends the new chapter to the server

    $http({
      method: 'POST',
      url: "http://localhost:5000/story/".concat(storyID),
      data: JSON.stringify(chapter)
    }).then(function (response) {
      return response.data;
    }); // Updates the service worker

    vm.postToCache();
  };
  /*
  Function Name: editChapter()
  Function Description: Edits a chapter.
  Parameters: chapter - the new chapter.
  					   storyID - the ID of the story.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.editChapter = function (chapter, storyID) {
    vm.myStories[storyID - 1].chapters[chapter.number - 1] = chapter; // Sends the new chapter to the server

    $http({
      method: 'POST',
      url: "http://localhost:5000/story/".concat(storyID, "/chapters/").concat(chapter.number),
      data: JSON.stringify(chapter)
    }).then(function (response) {
      return response.data;
    }); // Updates the service worker

    vm.postToCache();
  };
  /*
  Function Name: postToCache()
  Function Description: Sends the updated stories object to the Service Worker so they
  					can be cached.
  Parameters: None.
  ----------------
  Programmer: Shir Bar Lev.
  */


  this.postToCache = function () {
    if (serviceWorker) {
      navigator.serviceWorker.controller.postMessage(vm.myStories);
    }
  };
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnRyb2xsZXJzL2xpYnJhcnlDdHJsLmpzIiwiY29udHJvbGxlcnMvc2V0dGluZ3NDdHJsLmpzIiwiY29udHJvbGxlcnMvc3RvcnlDdHJsLmpzIiwiZmFjdG9yaWVzL3N0b3J5R2V0dGVyLmpzIiwic2VydmljZXMvbGlicmFyaWFuLmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIiRzdGF0ZVBhcmFtcyIsIiRodHRwIiwib3RoZXJ3aXNlIiwic3RhdGUiLCJ0ZW1wbGF0ZVVybCIsInVybCIsInJlc29sdmUiLCJsb2FkRGF0YSIsIm1ldGhvZCIsInRoZW4iLCJyZXNwb25zZSIsImRhdGEiLCJzdG9yaWVzIiwiY29udHJvbGxlciIsImlkIiwic3RvcnkiLCJjaGFwdGVySUQiLCJjaGFwdGVyIiwiJGluamVjdCIsInNlcnZpY2VXb3JrZXIiLCJuYXZpZ2F0b3IiLCJyZWdpc3RlciIsInNjb3BlIiwicmVnIiwid2luZG93IiwibG9jYXRpb24iLCJyZWxvYWQiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwibGlicmFyaWFuIiwidm0iLCJudW1TdG9yaWVzIiwibGVuZ3RoIiwic3Rvcmllc0RldGFpbHMiLCJnZXRTdG9yeURldGFpbHMiLCJzZWxlY3RlZFN0b3J5Iiwic3RvcnlBcnJheSIsImkiLCJzdG9yeURldGFpbHMiLCJ0aXRsZSIsInN5bm9wc2lzIiwicHVzaCIsImdldFNlbGVjdGVkU3RvcnkiLCJzZXRTZWxlY3RlZFN0b3J5IiwibnVtU2VsZWN0ZWQiLCJvcGVuQWRkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNsYXNzTmFtZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsImFkZFN0b3J5IiwibmV3U3RvcnkiLCJ2YWx1ZSIsImNsb3NlUG9wVXAiLCJzdG9yeVZpZXciLCJnZXRTdG9yeVZpZXciLCJzZXRTdG9yeVZpZXciLCJuZXdWaWV3IiwiJHN0YXRlIiwic3RvcnlOYW1lIiwic3RvcnlTeW5vcHNpcyIsImNoYXB0ZXJzIiwic3RvcnlJRCIsImxvYWRDaGFwdGVyRGF0YSIsImZvckRlbGV0aW9uIiwiZWRpdGVkQ2hhcHRlciIsImNoYW5nZURldGFpbHMiLCJuYW1lIiwidXBkYXRlU3RvcnkiLCJkZWxldGVJdGVtIiwidG9EZWxldGUiLCJzcGxpY2UiLCJ1cGRhdGVTdG9yaWVzIiwiZ28iLCJjaGFwdGVyTnVtIiwic3Vic3RyIiwicmVtb3ZlQ2hhcHRlciIsImNvbnRhaW5zIiwiY2hhbmdlQ2hhcHRlckRldGFpbHMiLCJudW1iZXIiLCJmb3JFYWNoIiwiaW5kZXgiLCJlZGl0Q2hhcHRlciIsImNoYW5nZVN0YXRlIiwib3BlbkFkZFBhbmVsIiwiYWRkQ2hhcHRlciIsIm51bUNoYXB0ZXIiLCJuZXdDaGFwdGVyIiwib3BlblJlbW92ZVBhbmVsIiwicXVlcnlTZWxlY3RvckFsbCIsImNsb3NlUmVtb3ZlUGFuZWwiLCJjaGFwdGVyTnVtYmVyIiwiZmFjdG9yeSIsInN0b3J5R2V0dGVyRmFjdG9yeSIsImdldFN0b3JpZXMiLCJnZXQiLCJzZXJ2aWNlIiwic3RvcnlHZXR0ZXIiLCJteVN0b3JpZXMiLCJ1cGRhdGVkU3RvcmllcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJwb3N0VG9DYWNoZSIsInVwZGF0ZWRTdG9yeSIsInBvc3RNZXNzYWdlIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7QUFPQUEsT0FBTyxDQUNOQyxNQURELENBQ1EsY0FEUixFQUN3QixDQUFDLFdBQUQsQ0FEeEIsRUFFQ0MsTUFGRCxDQUVRLENBQUMsZ0JBQUQsRUFBbUIsb0JBQW5CLEVBQXlDLFVBQVNDLGNBQVQsRUFBeUJDLGtCQUF6QixFQUE2Q0MsWUFBN0MsRUFBMkRDLEtBQTNELEVBQWtFO0FBQ2xIRixFQUFBQSxrQkFBa0IsQ0FBQ0csU0FBbkIsQ0FBNkIsR0FBN0IsRUFEa0gsQ0FHbEg7O0FBQ0FKLEVBQUFBLGNBQWMsQ0FBQ0ssS0FBZixDQUFxQixNQUFy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QUFDRCxhQUFWLENBQXdCTixVQUF4QixDQUFtQzhGLFdBQW5DLENBQStDNUUsRUFBRSxDQUFDc0UsU0FBbEQ7QUFDQTtBQUNELEdBSkQ7QUFLRCxDQXJIc0IsQ0FEdkIiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblx0YXBwLmpzXG5cdFN0b3J5IE1hbmFnZXIgTW9kdWxlXG5cdFxuXHRXcml0dGVuIGJ5IFNoaXIgQmFyIExldlxuKi9cblxuYW5ndWxhclxuLm1vZHVsZSgnU3RvcnlNYW5hZ2VyJywgWyd1aS5yb3V0ZXInXSlcbi5jb25maWcoWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInLCBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkc3RhdGVQYXJhbXMsICRodHRwKSB7XG5cdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblx0XG5cdC8vaG9tZSBzdGF0ZSAobWFpbi9saWJyYXJ5IHBhZ2UpXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuXHRcdHRlbXBsYXRlVXJsOiAnL3ZpZXdzL2xpYnJhcnlNZ3IuaHRtbCcsXG5cdFx0dXJsOiAnLycsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0bG9hZERhdGE6IGZ1bmN0aW9uKCRodHRwKSB7XG5cdFx0XHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAvJ1xuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGEuc3Rvcmllcztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9sbGVyOiAnbGlicmFyeUN0cmwgYXMgbGlicmFyeSdcblx0fSk7XG5cdFxuXHQvL2Egc3RvcnkncyBwYWdlXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzdG9yeScsIHtcblx0XHR0ZW1wbGF0ZVVybDogJy92aWV3cy9zdG9yeU1nci5odG1sJyxcblx0XHR1cmw6ICcvc3Rvcnkve2lkfScsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0bG9hZERhdGE6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGVQYXJhbXMpIHtcblx0XHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS8nICsgJHN0YXRlUGFyYW1zLmlkXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YS5zdG9yeTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9sbGVyOiAnc3RvcnlDdHJsIGFzIHN0b3J5J1xuXHR9KTtcblx0XG5cdC8vYSBzdG9yeSBlZGl0IHBhZ2Vcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2VkaXQnLCB7XG5cdFx0dGVtcGxhdGVVcmw6ICcvdmlld3Mvc3RvcnlFZGl0Lmh0bWwnLFxuXHRcdHVybDogJy9zdG9yeS97aWR9L2VkaXQtc3RvcnknLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGxvYWREYXRhOiBmdW5jdGlvbigkaHR0cCwgICRzdGF0ZVBhcmFtcykge1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwL3N0b3J5LycgKyAkc3RhdGVQYXJhbXMuaWRcblx0XHRcdFx0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhLnN0b3J5O1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbnRyb2xsZXI6ICdzdG9yeUN0cmwgYXMgc3RvcnknXG5cdH0pO1xuXHRcblx0Ly9hIGNoYXB0ZXIgZWRpdCBwYWdlXG5cdC8vY2hpbGQgb2YgdGhlIHN0b3J5IGVkaXQgcGFnZVxuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZWRpdENoYXB0ZXInLCB7XG5cdFx0dGVtcGxhdGVVcmw6ICcvdmlld3MvY2hhcHRlckVkaXQuaHRtbCcsXG5cdFx0dXJsOicvc3Rvcnkve2lkfS9lZGl0LXN0b3J5L2VkaXQtY2hhcHRlci97Y2hhcHRlcklEfScsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0bG9hZERhdGE6IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGVQYXJhbXMpIHtcblx0XHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRcdHVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS8keyRzdGF0ZVBhcmFtcy5pZH0vY2hhcHRlcnMvJHskc3RhdGVQYXJhbXMuY2hhcHRlcklEfWBcblx0XHRcdFx0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhLmNoYXB0ZXI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y29udHJvbGxlcjogJ3N0b3J5Q3RybCBhcyBzdG9yeSdcblx0fSk7XG59XSk7XG5cbmFuZ3VsYXJcbi5tb2R1bGUoJ1N0b3J5TWFuYWdlcicpLiRpbmplY3QgPSBbJyRodHRwJ107XG5cbi8vSW5qZWN0aW5nIFVJLVJvdXRlciBzdGF0ZVBhcmFtc1xuYW5ndWxhclxuLm1vZHVsZSgnU3RvcnlNYW5hZ2VyJykuJGluamVjdCA9IFsnJHN0YXRlUGFyYW1zJ107XG5cbi8vIHJlZ2lzdGVyIHNlcnZpY2Ugd29ya2VyXG52YXIgc2VydmljZVdvcmtlcjtcbmlmKG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyKVxuXHR7XG5cdFx0bmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoXCIvc3cuanNcIiwgeyBzY29wZTogJy8nIH0pLnRoZW4oZnVuY3Rpb24ocmVnKSB7XG5cdFx0XHRzZXJ2aWNlV29ya2VyID0gcmVnO1xuXHRcdFx0Ly8gaWYgdGhlcmUncyBubyBzZXJ2aWNlIHdvcmtlciBjb250cm9sbGluZyB0aGUgcGFnZSwgcmVsb2FkIHRvIGxldCB0aGUgbmV3IHNlcnZpY2Ugd29ya2VyIHRha2Ugb3ZlclxuXHRcdFx0aWYoIW5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmNvbnRyb2xsZXIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0XHRcdH1cblx0XHR9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcblx0XHRcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0fSk7XG5cdH0iLCIvKlxuXHRsaWJyYXJ5Q3RybC5qc1xuXHRTdG9yeSBNYW5hZ2VyIENvbnRyb2xsZXJcblx0XG5cdFdyaXR0ZW4gYnkgU2hpciBCYXIgTGV2XG4qL1xuXG4vL2xpYnJhcnkgY29udHJvbGxlclxuLy9jb250YWlucyBhbGwgdGhlIHN0b3RyaWVzJyBiYXNpYyBkYXRhXG5hbmd1bGFyLm1vZHVsZShcIlN0b3J5TWFuYWdlclwiKVxuXHQuY29udHJvbGxlcihcImxpYnJhcnlDdHJsXCIsIFsnbGlicmFyaWFuJywgJ2xvYWREYXRhJywgZnVuY3Rpb24obGlicmFyaWFuLCBsb2FkRGF0YSkge1xuXHRcdC8vdmFyaWFibGUgZGVjbGFyYXRpb25cblx0XHR2YXIgdm0gPSB0aGlzO1xuXHRcdHRoaXMuc3RvcmllcyA9IGxvYWREYXRhO1xuXHRcdHRoaXMubnVtU3RvcmllcyA9IGxvYWREYXRhLmxlbmd0aDtcblx0XHR0aGlzLnN0b3JpZXNEZXRhaWxzID0gZ2V0U3RvcnlEZXRhaWxzKCk7XG5cdFx0dGhpcy5zZWxlY3RlZFN0b3J5ID0gMDtcblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGdldFN0b3J5RGV0YWlscygpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEdldHMgdGhlIGRldGFpbHMgb2YgZWFjaCBzdG9yeSBmcm9tIHRoZSBsb2FkRGF0YSByZXNvbHZlIGFuZCBhZGRzIHRoZWlyXG5cdFx0XHRcdFx0XHRcdFx0dGl0bGUgYW5kIHN5bm9wc2lzIHRvIHRoZSBzdG9yaWVzRGV0YWlscyBhcnJheSAodXNlZCBieSB0aGUgdGVtcGxhdGUpLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdGZ1bmN0aW9uIGdldFN0b3J5RGV0YWlscygpXG5cdFx0e1xuXHRcdFx0dmFyIHN0b3J5QXJyYXkgPSBbXTsgXG5cdFx0XHRcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCB2bS5udW1TdG9yaWVzOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciBzdG9yeURldGFpbHMgPSBsb2FkRGF0YVtpXTtcblx0XHRcdFx0dmFyIHN0b3J5ID0ge1xuXHRcdFx0XHRcdHRpdGxlOiBzdG9yeURldGFpbHMudGl0bGUsIFxuXHRcdFx0XHRcdHN5bm9wc2lzOiBzdG9yeURldGFpbHMuc3lub3BzaXMsXG5cdFx0XHRcdFx0aWQ6IHN0b3J5RGV0YWlscy5pZFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRzdG9yeUFycmF5LnB1c2goc3RvcnkpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm4gc3RvcnlBcnJheTtcblx0XHR9XG5cblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGdldFNlbGVjdGVkU3RvcnkoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzdG9yeS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmdldFNlbGVjdGVkU3RvcnkgPSBmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHZtLnNlbGVjdGVkU3Rvcnk7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBzZXRTZWxlY3RlZFN0b3J5KClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogU2V0cyB0aGUgbnVtYmVyIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogbnVtU2VsZWN0ZWQgLSBuZXcgc2VsZWN0ZWQgc3RvcnkuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuc2V0U2VsZWN0ZWRTdG9yeSA9IGZ1bmN0aW9uKG51bVNlbGVjdGVkKVxuXHRcdHtcblx0XHRcdHZtLnNlbGVjdGVkU3RvcnkgPSBudW1TZWxlY3RlZDtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBvcGVuQWRkKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogT3BlbnMgdGhlIFwiYWRkIHN0b3J5XCIgcG9wdXAuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5vcGVuQWRkID0gZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvblwiO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib2ZmXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib25cIik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogYWRkU3RvcnkoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBBZGRzIGEgbmV3IHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuYWRkU3RvcnkgPSBmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIG5ld1N0b3J5ID0ge1xuXHRcdFx0XHRcImlkXCI6IHZtLm51bVN0b3JpZXMgKyAxLFxuXHRcdFx0XHRcInRpdGxlXCI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcnlUaXRsZVwiKS52YWx1ZSxcblx0XHRcdFx0XCJzeW5vcHNpc1wiOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3J5U3lub3BzaXNcIikudmFsdWUsXG5cdFx0XHRcdFwiY2hhcHRlcnNcIjogW11cblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdHZtLnN0b3JpZXMucHVzaChuZXdTdG9yeSk7XG5cdFx0XHRsaWJyYXJpYW4uYWRkU3RvcnkobmV3U3RvcnksIHZtLnN0b3JpZXMpO1xuXHRcdFx0XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib2ZmXCI7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjbG9zZVBvcFVwKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQ2xvc2VzIHRoZSBwb3B1cCB3aXRob3V0IGFkZGluZyBhIG5ldyBzdG9yeS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmNsb3NlUG9wVXAgPSBmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbEJveFwiKS5jbGFzc05hbWUgPSBcIm9mZlwiO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvZmZcIik7XG5cdFx0fVxufV0pOyIsIi8qXG5cdHNldHRpbmdzQ3RybC5qc1xuXHRTdG9yeSBNYW5hZ2VyIENvbnRyb2xsZXJcblx0XG5cdFdyaXR0ZW4gYnkgU2hpciBCYXIgTGV2XG4qL1xuXG4vL2NvbnRyb2xsZXIgZm9yIHRoZSBzZXR0aW5ncyBwYWdlXG5hbmd1bGFyLm1vZHVsZShcIlN0b3J5TWFuYWdlclwiKVxuXHQuY29udHJvbGxlcihcInNldHRpbmdzQ3RybFwiLCBbZnVuY3Rpb24oKSB7XG5cdFx0Ly9jaGFwdGVycyB2cyBwbG90LWxpbmVzIHZpZXdcblx0XHR2YXIgc3RvcnlWaWV3ID0gXCJjaGFwdGVyc1ZpZXdcIjtcblx0XHRcblx0XHQvL2dldHRlciBmb3IgdGhlIHN0b3J5Vmlld1xuXHRcdHRoaXMuZ2V0U3RvcnlWaWV3ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gc3RvcnlWaWV3O1xuXHRcdH1cblx0XHRcblx0XHQvL3NldHRlciBmb3IgdGhlIHN0b3J5Vmlld1xuXHRcdHRoaXMuc2V0U3RvcnlWaWV3ID0gZnVuY3Rpb24obmV3Vmlldykge1xuXHRcdFx0c3RvcnlWaWV3ID0gbmV3Vmlldztcblx0XHR9XG5cdH1dKTsiLCIvKlxuXHRzdG9yeUN0cmwuanNcblx0U3RvcnkgTWFuYWdlciBDb250cm9sbGVyXG5cdFxuXHRXcml0dGVuIGJ5IFNoaXIgQmFyIExldlxuKi9cblxuLy9zdG9yeSBtYW5hZ2VyIGNvbnRyb2xsZXJcbi8vY29udGFpbnMgdGhlIGN1cnJlbnRseSB2aWV3ZWQgc3RvcnlcbmFuZ3VsYXIubW9kdWxlKCdTdG9yeU1hbmFnZXInKVxuXHQuY29udHJvbGxlcignc3RvcnlDdHJsJywgWyckc3RhdGVQYXJhbXMnLCAnbGlicmFyaWFuJywgJ2xvYWREYXRhJywgJyRzdGF0ZScsIGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgbGlicmFyaWFuLCBsb2FkRGF0YSwgJHN0YXRlKSB7XG5cdFx0Ly92YXJpYWJsZSBkZWNsYXJhdGlvblxuXHRcdHZhciB2bSA9IHRoaXM7XG5cdFx0dGhpcy5zdG9yeURldGFpbHMgPSBsb2FkRGF0YTtcblx0XHR0aGlzLnN0b3J5TmFtZSA9IHRoaXMuc3RvcnlEZXRhaWxzLnRpdGxlO1xuXHRcdHRoaXMuc3RvcnlTeW5vcHNpcyA9IHRoaXMuc3RvcnlEZXRhaWxzLnN5bm9wc2lzO1xuXHRcdHRoaXMuY2hhcHRlcnMgPSB0aGlzLnN0b3J5RGV0YWlscy5jaGFwdGVycztcblx0XHR0aGlzLnN0b3J5SUQgPSB0aGlzLnN0b3J5RGV0YWlscy5pZDtcblx0XHR0aGlzLmNoYXB0ZXIgPSBsb2FkQ2hhcHRlckRhdGEoKTtcblx0XHR0aGlzLmZvckRlbGV0aW9uO1xuXHRcdC8vdGhlIGNoYXB0ZXIgYmVpbmcgZWRpdGVkLlxuXHRcdHRoaXMuZWRpdGVkQ2hhcHRlciA9ICRzdGF0ZVBhcmFtcy5jaGFwdGVySUQ7XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBsb2FkQ2hhcHRlckRhdGEoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBDaGVja3MgdG8gc2VlIHdoZXRoZXIgdGhlIGN1cnJlbnQgcGFnZSBoYXMgYSBcImNoYXB0ZXJJRFwiIHZhbHVlLFxuXHRcdFx0XHRcdFx0XHR3aGljaCBtZWFucyBpdCdzIGEgY2hhcHRlci1lZGl0IHBhZ2UuIElmIGl0IGlzLCBmZXRjaGVzIHRoZSBkYXRhXG5cdFx0XHRcdFx0XHRcdG9mIHRoZSBjaGFwdGVyIGJlaW5nIGVkaXRlZCBmb3IgdGhlIHRlbXBsYXRlIHRvIGZpbGwgaW4uXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0ZnVuY3Rpb24gbG9hZENoYXB0ZXJEYXRhKCkge1xuXHRcdFx0aWYoJHN0YXRlUGFyYW1zLmNoYXB0ZXJJRClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB2bS5jaGFwdGVyc1skc3RhdGVQYXJhbXMuY2hhcHRlcklEIC0gMV07XG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjaGFuZ2VEZXRhaWxzKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQ2hhbmdlcyB0aGUgbmFtZSBhbmQgc3lub3BzaXMgb2YgdGhlIHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2hhbmdlRGV0YWlscyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dm0uc3RvcnlOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9yeVRpdGxlXCIpLnZhbHVlO1xuXHRcdFx0dm0uc3RvcnlTeW5vcHNpcyA9ICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3J5U3lub3BzaXNcIikudmFsdWU7XG5cdFx0XHR2bS5zdG9yaWVzW3ZtLnN0b3J5SUQtMV0ubmFtZSA9IHZtLnN0b3J5TmFtZTtcblx0XHRcdHZtLnN0b3JpZXNbdm0uc3RvcnlJRC0xXS5zeW5vcHNpcyA9IHZtLnN0b3J5U3lub3BzaXM7XG5cdFx0XHRcblx0XHRcdGxpYnJhcmlhbi51cGRhdGVTdG9yeSh2bS5zdG9yeURldGFpbHMpO1xuXHRcdH07XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBkZWxldGVJdGVtKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogT3BlbnMgYSBwb3B1cCB0byBjb25maXJtIHdoZXRoZXIgdG8gZGVsZXRlIHRoZSBzZWxlY3RlZCBpdGVtLlxuXHRcdFBhcmFtZXRlcnM6IHRvRGVsZXRlIC0gdGhlIGl0ZW0gd2hpY2ggbmVlZHMgdG8gYmUgZGVsZXRlZC5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5kZWxldGVJdGVtID0gZnVuY3Rpb24odG9EZWxldGUpIHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvblwiO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib2ZmXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib25cIik7XG5cdFx0XHRpZih0eXBlb2YgdG9EZWxldGUgIT0gXCJzdHJpbmdcIilcblx0XHRcdFx0dm0uZm9yRGVsZXRpb24gPSBcIkFsbCBjaGFwdGVyc1wiO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHR2bS5mb3JEZWxldGlvbiA9IHRvRGVsZXRlO1xuXHRcdH07XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBkZWxldGUoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBEZWxldGVzIHdoYXRldmVyIHRoZSB1c2VyIGFza2VkIHRvIGRlbGV0ZS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly9pZiB0aGUgdXNlciByZXF1ZXN0ZWQgdG8gZGVsZXRlIHRoZSBzdG9yeVxuXHRcdFx0aWYodm0uZm9yRGVsZXRpb24gPT0gdm0uc3RvcnlOYW1lKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dm0uc3Rvcmllcy5zcGxpY2Uodm0uc3RvcnlJRC0xLCAxKTtcblx0XHRcdFx0XHRsaWJyYXJpYW4udXBkYXRlU3Rvcmllcyh2bS5zdG9yaWVzKTtcblx0XHRcdFx0XHQkc3RhdGUuZ28oXCJob21lXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHQvL2lmIHRoZSB1c2VyIHJlcXVlc3RlZCB0byBkZWxldGUgYWxsIHRoZSBjaGFwdGVyc1xuXHRcdFx0ZWxzZSBpZih2bS5mb3JEZWxldGlvbiA9PSBcIkFsbCBjaGFwdGVyc1wiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dm0uY2hhcHRlcnMgPSBbXTtcblx0XHRcdFx0XHR2bS5zdG9yaWVzW3ZtLnN0b3J5SUQtMV0uY2hhcHRlcnMgPSBbXTtcblx0XHRcdFx0XHRsaWJyYXJpYW4udXBkYXRlU3Rvcmllcyh2bS5zdG9yaWVzKTtcblx0XHRcdFx0fVxuXHRcdFx0Ly9pZiBpdCdzIG5vdCBlaXRoZXIgb2YgdGhvc2UsIHRoZSB1c2VyIHJlcXVlc3RlZCB0byBkZWxldGUgYSBjaGFwdGVyXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgY2hhcHRlck51bSA9IHZtLmZvckRlbGV0aW9uLnN1YnN0cig4LDEpO1xuXHRcdFx0XHRcdHZtLnJlbW92ZUNoYXB0ZXIoY2hhcHRlck51bSk7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdFxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogY2xvc2VQb3BVcCgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEFib3J0cyBkZWxldGlvbiBhbmQgY2xvc2VzIHRoZSBwb3B1cC5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmNsb3NlUG9wVXAgPSBmdW5jdGlvbigpIHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvZmZcIjtcblx0XHRcdFxuXHRcdFx0Ly9pZiB0aGUgZGVsZXRlIHBvcHVwIGlzIHRoZSBvbmUgZnJvbSB3aGljaCB0aGUgZnVuY3Rpb24gd2FzIGNhbGxlZCwgdGhlIGZ1bmN0aW9uIGhpZGVzIFxuXHRcdFx0Ly9pdC5cblx0XHRcdGlmKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlUG9wVXBcIikuY2xhc3NMaXN0LmNvbnRhaW5zKFwib25cIikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZVBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvZmZcIik7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0XHRcdH1cblx0XHRcdC8vaWYgaXQgd2Fzbid0IHRoZSBkZWxldGUgcG9wdXAsIGl0IHdhcyB0aGUgXCJhZGRcIiBwb3B1cCwgc28gdGhlIGZ1bmN0aW9uXG5cdFx0XHQvL2hpZGVzIGl0IGluc3RlYWRcblx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjaGFuZ2VDaGFwdGVyRGV0YWlscygpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IENoYW5nZXMgdGhlIG5hbWUgYW5kIHN5bm9wc2lzIG9mIHRoZSBzZWxlY3RlZCBjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmVcblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5jaGFuZ2VDaGFwdGVyRGV0YWlscyA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHR2YXIgY2hhcHRlcklEID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVySURcIikudmFsdWU7XG5cdFx0XHR2YXIgZWRpdGVkQ2hhcHRlciA9ICB7XG5cdFx0XHRcdGlkOiBjaGFwdGVySUQsXG5cdFx0XHRcdG51bWJlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVyTnVtXCIpLnZhbHVlLCBcblx0XHRcdFx0dGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlclRpdGxlXCIpLnZhbHVlLCBcblx0XHRcdFx0c3lub3BzaXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlclN5bm9wc2lzXCIpLnZhbHVlXG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vaWYgdGhlIGNoYXB0ZXIncyBudW1iZXIgd2Fzbid0IGNoYW5nZWRcblx0XHRcdGlmKGVkaXRlZENoYXB0ZXIubnVtYmVyID09IHZtLmNoYXB0ZXIubnVtYmVyICYmIGVkaXRlZENoYXB0ZXIuaWQgPT0gdm0uY2hhcHRlci5pZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZtLmNoYXB0ZXIubmFtZSA9IGVkaXRlZENoYXB0ZXIudGl0bGU7XG5cdFx0XHRcdFx0dm0uY2hhcHRlci5zeW5vcHNpcyA9IGVkaXRlZENoYXB0ZXIuc3lub3BzaXM7XG5cdFx0XHRcdFx0dm0uY2hhcHRlcnNbdm0uY2hhcHRlci5udW1iZXItMV0gPSBlZGl0ZWRDaGFwdGVyO1xuXHRcdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL2NoZWNrcyB3aGV0aGVyIHRoZXJlJ3MgYWxyZWFkeSBhIGNoYXB0ZXIgdGhlcmVcblx0XHRcdFx0XHQvL2lmIHRoZXJlIGlzLCBwdXQgaXQgaW4gdGhlIG5ldyBsb2NhdGlvbiBhbmQgbW92ZSBhbGwgY2hhcHRlcnMgZnJvbSB0aGVyZSBvbiBmb3J3YXJkXG5cdFx0XHRcdFx0aWYodm0uY2hhcHRlcnNbdm0uY2hhcHRlci5udW1iZXItMV0pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHZtLmNoYXB0ZXJzLnNwbGljZSh2bS5jaGFwdGVyLm51bWJlci0xLCAwLCBlZGl0ZWRDaGFwdGVyKTtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdHZtLmNoYXB0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcHRlciwgaW5kZXgpIHtcblx0XHRcdFx0XHRcdFx0XHRpZihpbmRleCA+IHZtLmNoYXB0ZXIubnVtYmVyKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyLm51bWJlciA9IGluZGV4ICsgMTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly9pZiB0aGVyZSBpc24ndFxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dm0uY2hhcHRlcnNbdm0uY2hhcHRlci5udW1iZXItMV0ubnVtYmVyID0gZWRpdGVkQ2hhcHRlci5udW1iZXI7XG5cdFx0XHRcdFx0XHRcdHZtLmNoYXB0ZXJzW3ZtLmNoYXB0ZXIubnVtYmVyLTFdLm5hbWUgPSBlZGl0ZWRDaGFwdGVyLnRpdGxlO1xuXHRcdFx0XHRcdFx0XHR2bS5jaGFwdGVyc1t2bS5jaGFwdGVyLm51bWJlci0xXS5zeW5vcHNpcyA9IGVkaXRlZENoYXB0ZXIuc3lub3BzaXM7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dm0uc3RvcnlEZXRhaWxzLmNoYXB0ZXJzID0gdm0uY2hhcHRlcnM7XG5cdFx0XHRsaWJyYXJpYW4uZWRpdENoYXB0ZXIoZWRpdGVkQ2hhcHRlciwgdm0uc3RvcnlJRCk7XG5cdFx0XHRcblx0XHRcdHZtLmNoYW5nZVN0YXRlKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogY2hhbmdlU3RhdGUoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBPbmNlIHRoZSB1c2VyIGlzIGRvbmUgdXBkYXRpbmcgdGhlIGNoYXB0ZXIsIHNlbmRzIHRoZSB1c2VyIGJhY2sgdG8gdGhlXG5cdFx0XHRcdFx0XHRcdHN0b3J5IHBhZ2UuXG5cdFx0UGFyYW1ldGVyczogTm9uZVxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmNoYW5nZVN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkc3RhdGUuZ28oJ3N0b3J5Jywge2lkOiB2bS5zdG9yeUlEfSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogb3BlbkFkZFBhbmVsKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogT3BlbnMgdGhlIHBhbmVsIGFsbG93aW5nIHRoZSB1c2VyIHRvIGluc2VydCB0aGUgZGV0YWlscyBmb3IgdGhlIG5ld1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMub3BlbkFkZFBhbmVsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib25cIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9mZlwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9uXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGFkZENoYXB0ZXIoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBBZGRzIGEgbmV3IGNoYXB0ZXIuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5hZGRDaGFwdGVyID0gZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdC8vY2hlY2tzIHdoZXRoZXIgYSBudW1iZXIgd2FzIGVudGVyZWQgZm9yIGNoYXB0ZXIgbnVtYmVyXG5cdFx0XHQvL2lmIHRoZXJlIHdhcywgcGxhY2VzIHRoZSBjaGFwdGVyIGluIHRoZSBnaXZlbiBwbGFjZVxuXHRcdFx0Ly9pdCB0aGVyZSB3YXNuJ3QsIHNpbXBseSBhZGRzIGl0IGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgY2hhcHRlcnMgYXJyYXlcblx0XHRcdHZhciBudW1DaGFwdGVyID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlcklEXCIpLnZhbHVlKSA/IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJJRFwiKS52YWx1ZSkgOiAodm0uY2hhcHRlcnMubGVuZ3RoICsgMSk7XG5cdFx0XHR2YXIgbmV3Q2hhcHRlciA9IHtcblx0XHRcdFx0XHRudW1iZXI6IG51bUNoYXB0ZXIsIFxuXHRcdFx0XHRcdHRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJUaXRsZVwiKS52YWx1ZSwgXG5cdFx0XHRcdFx0c3lub3BzaXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlclN5bm9wc2lzXCIpLnZhbHVlXG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly9jaGVja3MgaWYgdGhlcmUncyBhbHJlYWR5IGEgY2hhcHRlciB0aGVyZVxuXHRcdFx0Ly9pZiB0aGVyZSBpc1xuXHRcdFx0aWYodm0uY2hhcHRlcnNbbnVtQ2hhcHRlci0xXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZtLmNoYXB0ZXJzLnNwbGljZShudW1DaGFwdGVyLTEsIDAsIG5ld0NoYXB0ZXIpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZtLmNoYXB0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcHRlciwgaW5kZXgpIHtcblx0XHRcdFx0XHRcdGNoYXB0ZXIubnVtYmVyID0gaW5kZXggKyAxO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHQvL2lmIHRoZXJlIGlzbid0XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL2FkZHMgdGhlIGNoYXB0ZXIgdG8gdGhlIGFycmF5IGluIHRoZSBzdG9yeSBjb250cm9sbGVyIGFuZCBzZW5kcyBpdCB0byB0aGUgbGlicmFyaWFuXG5cdFx0XHRcdFx0dm0uY2hhcHRlcnMucHVzaChuZXdDaGFwdGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR2bS5zdG9yeURldGFpbHMuY2hhcHRlcnMgPSB2bS5jaGFwdGVycztcblx0XHRcdGxpYnJhcmlhbi5hZGRDaGFwdGVyKG5ld0NoYXB0ZXIsIHZtLnN0b3J5SUQpO1xuXHRcdFx0XG5cdFx0XHQvL3JlbW92ZXMgdGhlIG1vZGFsIGJveCBhbmQgcG9wdXBcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvZmZcIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IG9wZW5SZW1vdmVQYW5lbCgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IE9wZW5zIHRoZSBwYW5lbCBhbGxvd2luZyB0aGUgdXNlciB0byBjaG9vc2Ugd2hpY2ggY2hhcHRlcnMgdG8gZGVsZXRlLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMub3BlblJlbW92ZVBhbmVsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnJlbW92ZVwiKS5mb3JFYWNoKGZ1bmN0aW9uKGNoYXB0ZXIpIHtcblx0XHRcdFx0Y2hhcHRlci5jbGFzc0xpc3QuYWRkKFwib25cIik7XG5cdFx0XHRcdGNoYXB0ZXIuY2xhc3NMaXN0LnJlbW92ZShcIm9mZlwiKTtcblx0XHRcdH0pXG5cdFx0XHRcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9uZUJ0blwiKS5jbGFzc0xpc3QuYWRkKFwib25cIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvbmVCdG5cIikuY2xhc3NMaXN0LnJlbW92ZShcIm9mZlwiKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjbG9zZVJlbW92ZVBhbmVsKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQ2xvc2VzIHRoZSBwYW5lbCBhbGxvd2luZyB0aGUgdXNlciB0byBjaG9vc2Ugd2hpY2ggY2hhcHRlcnMgdG8gZGVsZXRlLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2xvc2VSZW1vdmVQYW5lbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yZW1vdmVcIikuZm9yRWFjaChmdW5jdGlvbihjaGFwdGVyKSB7XG5cdFx0XHRcdGNoYXB0ZXIuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdFx0Y2hhcHRlci5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0XHR9KVxuXHRcdFx0XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvbmVCdG5cIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9uZUJ0blwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogcmVtb3ZlQ2hhcHRlcigpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IERlbGV0ZXMgYSBjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IGNoYXB0ZXJOdW1iZXIgLSBudW1iZXIgb2YgdGhlIGNoYXB0ZXIgdG8gZGVsZXRlLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLnJlbW92ZUNoYXB0ZXIgPSBmdW5jdGlvbihjaGFwdGVyTnVtYmVyKVxuXHRcdHtcblx0XHRcdHZtLmNoYXB0ZXJzLnNwbGljZShjaGFwdGVyTnVtYmVyLCAxKTtcblx0XHRcdHZtLnN0b3JpZXNbdm0uc3RvcnlJRC0xXS5jaGFwdGVycyA9IHZtLmNoYXB0ZXJzO1xuXHRcdFx0bGlicmFyaWFuLnVwZGF0ZVN0b3JpZXModm0uc3Rvcmllcyk7XG5cdFx0fVxufV0pOyIsIi8qXG5cdHN0b3J5R2V0dGVyLmpzXG5cdFN0b3J5IE1hbmFnZXIgRmFjdG9yeVxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbmFuZ3VsYXIubW9kdWxlKCdTdG9yeU1hbmFnZXInKVxuXHQuZmFjdG9yeSgnc3RvcnlHZXR0ZXInLCBbJyRodHRwJywgZnVuY3Rpb24gc3RvcnlHZXR0ZXJGYWN0b3J5KCRodHRwKSB7XG5cdC8vcmV0dXJucyBcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0U3RvcmllczogIGZ1bmN0aW9uIGdldFN0b3JpZXMoKSB7XG5cdFx0XHRcdHJldHVybiAkaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yaWVzJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5dKTsiLCIvKlxuXHRsaWJyYXJpYW4uanNcblx0U3RvcnkgTWFuYWdlciBTZXJ2aWNlXG5cdFxuXHRXcml0dGVuIGJ5IFNoaXIgQmFyIExldlxuKi9cblxuLy9saWJyYXJpYW4gc2VydmljZSB0byBkZWFsIHdpdGggZXhwb3J0aW5nIHRoZSBjaGFuZ2VzIHRoZSB1c2VyIG1ha2VzIHRvIHRoZWlyIHN0b3JpZXNcbmFuZ3VsYXIubW9kdWxlKCdTdG9yeU1hbmFnZXInKVxuXHQuc2VydmljZSgnbGlicmFyaWFuJywgWyckaHR0cCcsICdzdG9yeUdldHRlcicsIGZ1bmN0aW9uKCRodHRwLCBzdG9yeUdldHRlcikge1xuXHRcdC8vdmFyaWFibGUgZGVjbGFyYXRpb25cblx0XHR2YXIgdm0gPSB0aGlzO1xuXHRcdHRoaXMubXlTdG9yaWVzO1xuXHRcdHRoaXMuZ2V0U3RvcmllcyA9IHN0b3J5R2V0dGVyLmdldFN0b3JpZXMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHR2bS5teVN0b3JpZXMgPSByZXNwb25zZS5kYXRhLnN0b3JpZXM7XG5cdFx0fSk7XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBhZGRTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEFkZHMgYSBuZXcgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogc3RvcnkgLSB0aGUgbmV3IHN0b3J5LiBcblx0XHRcdFx0XHRcdFx0ICAgdXBkYXRlZFN0b3JpZXMgLSB0aGUgdXBkYXRlZCBzdG9yaWVzIGFycmF5IChpbmNsdWRpbmcgdGhlIG5ldyBzdG9yeSkuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuYWRkU3RvcnkgPSBmdW5jdGlvbihzdG9yeSwgdXBkYXRlZFN0b3JpZXMpXG5cdFx0e1xuXHRcdFx0JGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC8nLFxuXHRcdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHN0b3J5KVxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR2bS5teVN0b3JpZXMuc3RvcmllcyA9IHVwZGF0ZWRTdG9yaWVzO1xuXHRcdFx0dm0ucG9zdFRvQ2FjaGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiB1cGRhdGVTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IFVwZGF0ZXMgYW4gZXhpc3Rpbmcgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogdXBkYXRlZFN0b3J5IC0gVXBkYXRlZCBzdG9yeSBkYXRhLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLnVwZGF0ZVN0b3J5ID0gZnVuY3Rpb24odXBkYXRlZFN0b3J5KVxuXHRcdHtcblx0XHRcdHZtLm15U3Rvcmllcy5zdG9yaWVzW3VwZGF0ZWRTdG9yeS5pZC0xXSA9IHVwZGF0ZWRTdG9yeTtcblx0XHRcdFxuXHRcdFx0Ly8gU2VuZHMgdGhlIG5ldyBzdG9yeSB0byB0aGUgc2VydmVyXG5cdFx0XHQkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdFx0dXJsOiBgaHR0cDovL2xvY2FsaG9zdDo1MDAwL3N0b3J5LyR7dXBkYXRlZFN0b3J5LmlkfWAsXG5cdFx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkodXBkYXRlZFN0b3J5KVxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGVzIHRoZSBzZXJ2aWNlIHdvcmtlclxuXHRcdFx0dm0ucG9zdFRvQ2FjaGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBhZGRDaGFwdGVyKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQWRkcyBhIG5ldyBjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IGNoYXB0ZXIgLSB0aGUgbmV3IGNoYXB0ZXIuXG5cdFx0XHRcdFx0XHRcdCAgIHN0b3J5SUQgLSB0aGUgSUQgb2YgdGhlIHN0b3J5LlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmFkZENoYXB0ZXIgPSBmdW5jdGlvbihjaGFwdGVyLCBzdG9yeUlEKVxuXHRcdHtcblx0XHRcdHZtLm15U3Rvcmllc1tzdG9yeUlELTFdLmNoYXB0ZXJzLnB1c2goY2hhcHRlcik7XG5cdFx0XHRcblx0XHRcdC8vIFNlbmRzIHRoZSBuZXcgY2hhcHRlciB0byB0aGUgc2VydmVyXG5cdFx0XHQkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdFx0dXJsOiBgaHR0cDovL2xvY2FsaG9zdDo1MDAwL3N0b3J5LyR7c3RvcnlJRH1gLFxuXHRcdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KGNoYXB0ZXIpXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdC8vIFVwZGF0ZXMgdGhlIHNlcnZpY2Ugd29ya2VyXG5cdFx0XHR2bS5wb3N0VG9DYWNoZSgpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGVkaXRDaGFwdGVyKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogRWRpdHMgYSBjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IGNoYXB0ZXIgLSB0aGUgbmV3IGNoYXB0ZXIuXG5cdFx0XHRcdFx0XHRcdCAgIHN0b3J5SUQgLSB0aGUgSUQgb2YgdGhlIHN0b3J5LlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmVkaXRDaGFwdGVyID0gZnVuY3Rpb24oY2hhcHRlciwgc3RvcnlJRClcblx0XHR7XG5cdFx0XHR2bS5teVN0b3JpZXNbc3RvcnlJRC0xXS5jaGFwdGVyc1tjaGFwdGVyLm51bWJlci0xXSA9IGNoYXB0ZXI7XG5cdFx0XHRcblx0XHRcdC8vIFNlbmRzIHRoZSBuZXcgY2hhcHRlciB0byB0aGUgc2VydmVyXG5cdFx0XHQkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdFx0dXJsOiBgaHR0cDovL2xvY2FsaG9zdDo1MDAwL3N0b3J5LyR7c3RvcnlJRH0vY2hhcHRlcnMvJHtjaGFwdGVyLm51bWJlcn1gLFxuXHRcdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KGNoYXB0ZXIpXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdC8vIFVwZGF0ZXMgdGhlIHNlcnZpY2Ugd29ya2VyXG5cdFx0XHR2bS5wb3N0VG9DYWNoZSgpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IHBvc3RUb0NhY2hlKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogU2VuZHMgdGhlIHVwZGF0ZWQgc3RvcmllcyBvYmplY3QgdG8gdGhlIFNlcnZpY2UgV29ya2VyIHNvIHRoZXlcblx0XHRcdFx0XHRcdFx0Y2FuIGJlIGNhY2hlZC5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLnBvc3RUb0NhY2hlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZihzZXJ2aWNlV29ya2VyKSB7XG5cdFx0XHRcdG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmNvbnRyb2xsZXIucG9zdE1lc3NhZ2Uodm0ubXlTdG9yaWVzKTtcblx0XHRcdH1cblx0XHR9XG59XSk7Il19
