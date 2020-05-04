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
      return $http.get('http://localhost:5000/');
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
      serviceWorker.controller.postMessage(vm.myStories);
    }
  };
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnRyb2xsZXJzL2xpYnJhcnlDdHJsLmpzIiwiY29udHJvbGxlcnMvc2V0dGluZ3NDdHJsLmpzIiwiY29udHJvbGxlcnMvc3RvcnlDdHJsLmpzIiwiZmFjdG9yaWVzL3N0b3J5R2V0dGVyLmpzIiwic2VydmljZXMvbGlicmFyaWFuLmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIiRzdGF0ZVBhcmFtcyIsIiRodHRwIiwib3RoZXJ3aXNlIiwic3RhdGUiLCJ0ZW1wbGF0ZVVybCIsInVybCIsInJlc29sdmUiLCJsb2FkRGF0YSIsIm1ldGhvZCIsInRoZW4iLCJyZXNwb25zZSIsImRhdGEiLCJzdG9yaWVzIiwiY29udHJvbGxlciIsImlkIiwic3RvcnkiLCJjaGFwdGVySUQiLCJjaGFwdGVyIiwiJGluamVjdCIsInNlcnZpY2VXb3JrZXIiLCJuYXZpZ2F0b3IiLCJyZWdpc3RlciIsInNjb3BlIiwicmVnIiwid2luZG93IiwibG9jYXRpb24iLCJyZWxvYWQiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwibGlicmFyaWFuIiwidm0iLCJudW1TdG9yaWVzIiwibGVuZ3RoIiwic3Rvcmllc0RldGFpbHMiLCJnZXRTdG9yeURldGFpbHMiLCJzZWxlY3RlZFN0b3J5Iiwic3RvcnlBcnJheSIsImkiLCJzdG9yeURldGFpbHMiLCJ0aXRsZSIsInN5bm9wc2lzIiwicHVzaCIsImdldFNlbGVjdGVkU3RvcnkiLCJzZXRTZWxlY3RlZFN0b3J5IiwibnVtU2VsZWN0ZWQiLCJvcGVuQWRkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNsYXNzTmFtZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsImFkZFN0b3J5IiwibmV3U3RvcnkiLCJ2YWx1ZSIsImNsb3NlUG9wVXAiLCJzdG9yeVZpZXciLCJnZXRTdG9yeVZpZXciLCJzZXRTdG9yeVZpZXciLCJuZXdWaWV3IiwiJHN0YXRlIiwic3RvcnlOYW1lIiwic3RvcnlTeW5vcHNpcyIsImNoYXB0ZXJzIiwic3RvcnlJRCIsImxvYWRDaGFwdGVyRGF0YSIsImZvckRlbGV0aW9uIiwiZWRpdGVkQ2hhcHRlciIsImNoYW5nZURldGFpbHMiLCJuYW1lIiwidXBkYXRlU3RvcnkiLCJkZWxldGVJdGVtIiwidG9EZWxldGUiLCJzcGxpY2UiLCJ1cGRhdGVTdG9yaWVzIiwiZ28iLCJjaGFwdGVyTnVtIiwic3Vic3RyIiwicmVtb3ZlQ2hhcHRlciIsImNvbnRhaW5zIiwiY2hhbmdlQ2hhcHRlckRldGFpbHMiLCJudW1iZXIiLCJmb3JFYWNoIiwiaW5kZXgiLCJlZGl0Q2hhcHRlciIsImNoYW5nZVN0YXRlIiwib3BlbkFkZFBhbmVsIiwiYWRkQ2hhcHRlciIsIm51bUNoYXB0ZXIiLCJuZXdDaGFwdGVyIiwib3BlblJlbW92ZVBhbmVsIiwicXVlcnlTZWxlY3RvckFsbCIsImNsb3NlUmVtb3ZlUGFuZWwiLCJjaGFwdGVyTnVtYmVyIiwiZmFjdG9yeSIsInN0b3J5R2V0dGVyRmFjdG9yeSIsImdldFN0b3JpZXMiLCJnZXQiLCJzZXJ2aWNlIiwic3RvcnlHZXR0ZXIiLCJteVN0b3JpZXMiLCJ1cGRhdGVkU3RvcmllcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJwb3N0VG9DYWNoZSIsInVwZGF0ZWRTdG9yeSIsInBvc3RNZXNzYWdlIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7QUFPQUEsT0FBTyxDQUNOQyxNQURELENBQ1EsY0FEUixFQUN3QixDQUFDLFdBQUQsQ0FEeEIsRUFFQ0MsTUFGRCxDQUVRLENBQUMsZ0JBQUQsRUFBbUIsb0JBQW5CLEVBQXlDLFVBQVNDLGNBQVQsRUFBeUJDLGtCQUF6QixFQUE2Q0MsWUFBN0MsRUFBMkRDLEtBQTNELEVBQWtFO0FBQ2xIRixFQUFBQSxrQkFBa0IsQ0FBQ0csU0FBbkIsQ0FBNkIsR0FBN0IsRUFEa0gsQ0FHbEg7O0FBQ0FKLEVBQUFBLGNBQWMsQ0FBQ0ssS0FBZixDQUFxQixNQUFy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QUFDTixVQUFkLENBQXlCOEYsV0FBekIsQ0FBcUM1RSxFQUFFLENBQUNzRSxTQUF4QztBQUNBO0FBQ0QsR0FKRDtBQUtELENBckhzQixDQUR2QiIsImZpbGUiOiJhbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuXHRhcHAuanNcblx0U3RvcnkgTWFuYWdlciBNb2R1bGVcblx0XG5cdFdyaXR0ZW4gYnkgU2hpciBCYXIgTGV2XG4qL1xuXG5hbmd1bGFyXG4ubW9kdWxlKCdTdG9yeU1hbmFnZXInLCBbJ3VpLnJvdXRlciddKVxuLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsIGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRzdGF0ZVBhcmFtcywgJGh0dHApIHtcblx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXHRcblx0Ly9ob21lIHN0YXRlIChtYWluL2xpYnJhcnkgcGFnZSlcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG5cdFx0dGVtcGxhdGVVcmw6ICcvdmlld3MvbGlicmFyeU1nci5odG1sJyxcblx0XHR1cmw6ICcvJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRsb2FkRGF0YTogZnVuY3Rpb24oJGh0dHApIHtcblx0XHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC8nXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YS5zdG9yaWVzO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbnRyb2xsZXI6ICdsaWJyYXJ5Q3RybCBhcyBsaWJyYXJ5J1xuXHR9KTtcblx0XG5cdC8vYSBzdG9yeSdzIHBhZ2Vcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N0b3J5Jywge1xuXHRcdHRlbXBsYXRlVXJsOiAnL3ZpZXdzL3N0b3J5TWdyLmh0bWwnLFxuXHRcdHVybDogJy9zdG9yeS97aWR9Jyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRsb2FkRGF0YTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcykge1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwL3N0b3J5LycgKyAkc3RhdGVQYXJhbXMuaWRcblx0XHRcdFx0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhLnN0b3J5O1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbnRyb2xsZXI6ICdzdG9yeUN0cmwgYXMgc3RvcnknXG5cdH0pO1xuXHRcblx0Ly9hIHN0b3J5IGVkaXQgcGFnZVxuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZWRpdCcsIHtcblx0XHR0ZW1wbGF0ZVVybDogJy92aWV3cy9zdG9yeUVkaXQuaHRtbCcsXG5cdFx0dXJsOiAnL3N0b3J5L3tpZH0vZWRpdC1zdG9yeScsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0bG9hZERhdGE6IGZ1bmN0aW9uKCRodHRwLCAgJHN0YXRlUGFyYW1zKSB7XG5cdFx0XHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAvc3RvcnkvJyArICRzdGF0ZVBhcmFtcy5pZFxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGEuc3Rvcnk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y29udHJvbGxlcjogJ3N0b3J5Q3RybCBhcyBzdG9yeSdcblx0fSk7XG5cdFxuXHQvL2EgY2hhcHRlciBlZGl0IHBhZ2Vcblx0Ly9jaGlsZCBvZiB0aGUgc3RvcnkgZWRpdCBwYWdlXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdlZGl0Q2hhcHRlcicsIHtcblx0XHR0ZW1wbGF0ZVVybDogJy92aWV3cy9jaGFwdGVyRWRpdC5odG1sJyxcblx0XHR1cmw6Jy9zdG9yeS97aWR9L2VkaXQtc3RvcnkvZWRpdC1jaGFwdGVyL3tjaGFwdGVySUR9Jyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRsb2FkRGF0YTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcykge1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRcdFx0dXJsOiBgaHR0cDovL2xvY2FsaG9zdDo1MDAwL3N0b3J5LyR7JHN0YXRlUGFyYW1zLmlkfS9jaGFwdGVycy8keyRzdGF0ZVBhcmFtcy5jaGFwdGVySUR9YFxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGEuY2hhcHRlcjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9sbGVyOiAnc3RvcnlDdHJsIGFzIHN0b3J5J1xuXHR9KTtcbn1dKTtcblxuYW5ndWxhclxuLm1vZHVsZSgnU3RvcnlNYW5hZ2VyJykuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuLy9JbmplY3RpbmcgVUktUm91dGVyIHN0YXRlUGFyYW1zXG5hbmd1bGFyXG4ubW9kdWxlKCdTdG9yeU1hbmFnZXInKS4kaW5qZWN0ID0gWyckc3RhdGVQYXJhbXMnXTtcblxuLy8gcmVnaXN0ZXIgc2VydmljZSB3b3JrZXJcbnZhciBzZXJ2aWNlV29ya2VyO1xuaWYobmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIpXG5cdHtcblx0XHRuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcihcIi9zdy5qc1wiLCB7IHNjb3BlOiAnLycgfSkudGhlbihmdW5jdGlvbihyZWcpIHtcblx0XHRcdHNlcnZpY2VXb3JrZXIgPSByZWc7XG5cdFx0XHQvLyBpZiB0aGVyZSdzIG5vIHNlcnZpY2Ugd29ya2VyIGNvbnRyb2xsaW5nIHRoZSBwYWdlLCByZWxvYWQgdG8gbGV0IHRoZSBuZXcgc2VydmljZSB3b3JrZXIgdGFrZSBvdmVyXG5cdFx0XHRpZighbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIuY29udHJvbGxlcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0fVxuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuXHRcdFx0Y29uc29sZS5sb2coZXJyKTtcblx0XHR9KTtcblx0fSIsIi8qXG5cdGxpYnJhcnlDdHJsLmpzXG5cdFN0b3J5IE1hbmFnZXIgQ29udHJvbGxlclxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbi8vbGlicmFyeSBjb250cm9sbGVyXG4vL2NvbnRhaW5zIGFsbCB0aGUgc3RvdHJpZXMnIGJhc2ljIGRhdGFcbmFuZ3VsYXIubW9kdWxlKFwiU3RvcnlNYW5hZ2VyXCIpXG5cdC5jb250cm9sbGVyKFwibGlicmFyeUN0cmxcIiwgWydsaWJyYXJpYW4nLCAnbG9hZERhdGEnLCBmdW5jdGlvbihsaWJyYXJpYW4sIGxvYWREYXRhKSB7XG5cdFx0Ly92YXJpYWJsZSBkZWNsYXJhdGlvblxuXHRcdHZhciB2bSA9IHRoaXM7XG5cdFx0dGhpcy5zdG9yaWVzID0gbG9hZERhdGE7XG5cdFx0dGhpcy5udW1TdG9yaWVzID0gbG9hZERhdGEubGVuZ3RoO1xuXHRcdHRoaXMuc3Rvcmllc0RldGFpbHMgPSBnZXRTdG9yeURldGFpbHMoKTtcblx0XHR0aGlzLnNlbGVjdGVkU3RvcnkgPSAwO1xuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogZ2V0U3RvcnlEZXRhaWxzKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogR2V0cyB0aGUgZGV0YWlscyBvZiBlYWNoIHN0b3J5IGZyb20gdGhlIGxvYWREYXRhIHJlc29sdmUgYW5kIGFkZHMgdGhlaXJcblx0XHRcdFx0XHRcdFx0XHR0aXRsZSBhbmQgc3lub3BzaXMgdG8gdGhlIHN0b3JpZXNEZXRhaWxzIGFycmF5ICh1c2VkIGJ5IHRoZSB0ZW1wbGF0ZSkuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0ZnVuY3Rpb24gZ2V0U3RvcnlEZXRhaWxzKClcblx0XHR7XG5cdFx0XHR2YXIgc3RvcnlBcnJheSA9IFtdOyBcblx0XHRcdFxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHZtLm51bVN0b3JpZXM7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHN0b3J5RGV0YWlscyA9IGxvYWREYXRhW2ldO1xuXHRcdFx0XHR2YXIgc3RvcnkgPSB7XG5cdFx0XHRcdFx0dGl0bGU6IHN0b3J5RGV0YWlscy50aXRsZSwgXG5cdFx0XHRcdFx0c3lub3BzaXM6IHN0b3J5RGV0YWlscy5zeW5vcHNpcyxcblx0XHRcdFx0XHRpZDogc3RvcnlEZXRhaWxzLmlkXG5cdFx0XHRcdH07XG5cdFx0XHRcdHN0b3J5QXJyYXkucHVzaChzdG9yeSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBzdG9yeUFycmF5O1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogZ2V0U2VsZWN0ZWRTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IFJldHVybnMgdGhlIG51bWJlciBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuZ2V0U2VsZWN0ZWRTdG9yeSA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHRyZXR1cm4gdm0uc2VsZWN0ZWRTdG9yeTtcblx0XHR9XG5cblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IHNldFNlbGVjdGVkU3RvcnkoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBTZXRzIHRoZSBudW1iZXIgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzdG9yeS5cblx0XHRQYXJhbWV0ZXJzOiBudW1TZWxlY3RlZCAtIG5ldyBzZWxlY3RlZCBzdG9yeS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5zZXRTZWxlY3RlZFN0b3J5ID0gZnVuY3Rpb24obnVtU2VsZWN0ZWQpXG5cdFx0e1xuXHRcdFx0dm0uc2VsZWN0ZWRTdG9yeSA9IG51bVNlbGVjdGVkO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IG9wZW5BZGQoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBPcGVucyB0aGUgXCJhZGQgc3RvcnlcIiBwb3B1cC5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLm9wZW5BZGQgPSBmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbEJveFwiKS5jbGFzc05hbWUgPSBcIm9uXCI7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvZmZcIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvblwiKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBhZGRTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEFkZHMgYSBuZXcgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5hZGRTdG9yeSA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHR2YXIgbmV3U3RvcnkgPSB7XG5cdFx0XHRcdFwiaWRcIjogdm0ubnVtU3RvcmllcyArIDEsXG5cdFx0XHRcdFwidGl0bGVcIjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9yeVRpdGxlXCIpLnZhbHVlLFxuXHRcdFx0XHRcInN5bm9wc2lzXCI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcnlTeW5vcHNpc1wiKS52YWx1ZSxcblx0XHRcdFx0XCJjaGFwdGVyc1wiOiBbXVxuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0dm0uc3Rvcmllcy5wdXNoKG5ld1N0b3J5KTtcblx0XHRcdGxpYnJhcmlhbi5hZGRTdG9yeShuZXdTdG9yeSwgdm0uc3Rvcmllcyk7XG5cdFx0XHRcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvZmZcIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib2ZmXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGNsb3NlUG9wVXAoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBDbG9zZXMgdGhlIHBvcHVwIHdpdGhvdXQgYWRkaW5nIGEgbmV3IHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2xvc2VQb3BVcCA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib2ZmXCI7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHR9XG59XSk7IiwiLypcblx0c2V0dGluZ3NDdHJsLmpzXG5cdFN0b3J5IE1hbmFnZXIgQ29udHJvbGxlclxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbi8vY29udHJvbGxlciBmb3IgdGhlIHNldHRpbmdzIHBhZ2VcbmFuZ3VsYXIubW9kdWxlKFwiU3RvcnlNYW5hZ2VyXCIpXG5cdC5jb250cm9sbGVyKFwic2V0dGluZ3NDdHJsXCIsIFtmdW5jdGlvbigpIHtcblx0XHQvL2NoYXB0ZXJzIHZzIHBsb3QtbGluZXMgdmlld1xuXHRcdHZhciBzdG9yeVZpZXcgPSBcImNoYXB0ZXJzVmlld1wiO1xuXHRcdFxuXHRcdC8vZ2V0dGVyIGZvciB0aGUgc3RvcnlWaWV3XG5cdFx0dGhpcy5nZXRTdG9yeVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdG9yeVZpZXc7XG5cdFx0fVxuXHRcdFxuXHRcdC8vc2V0dGVyIGZvciB0aGUgc3RvcnlWaWV3XG5cdFx0dGhpcy5zZXRTdG9yeVZpZXcgPSBmdW5jdGlvbihuZXdWaWV3KSB7XG5cdFx0XHRzdG9yeVZpZXcgPSBuZXdWaWV3O1xuXHRcdH1cblx0fV0pOyIsIi8qXG5cdHN0b3J5Q3RybC5qc1xuXHRTdG9yeSBNYW5hZ2VyIENvbnRyb2xsZXJcblx0XG5cdFdyaXR0ZW4gYnkgU2hpciBCYXIgTGV2XG4qL1xuXG4vL3N0b3J5IG1hbmFnZXIgY29udHJvbGxlclxuLy9jb250YWlucyB0aGUgY3VycmVudGx5IHZpZXdlZCBzdG9yeVxuYW5ndWxhci5tb2R1bGUoJ1N0b3J5TWFuYWdlcicpXG5cdC5jb250cm9sbGVyKCdzdG9yeUN0cmwnLCBbJyRzdGF0ZVBhcmFtcycsICdsaWJyYXJpYW4nLCAnbG9hZERhdGEnLCAnJHN0YXRlJywgZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCBsaWJyYXJpYW4sIGxvYWREYXRhLCAkc3RhdGUpIHtcblx0XHQvL3ZhcmlhYmxlIGRlY2xhcmF0aW9uXG5cdFx0dmFyIHZtID0gdGhpcztcblx0XHR0aGlzLnN0b3J5RGV0YWlscyA9IGxvYWREYXRhO1xuXHRcdHRoaXMuc3RvcnlOYW1lID0gdGhpcy5zdG9yeURldGFpbHMudGl0bGU7XG5cdFx0dGhpcy5zdG9yeVN5bm9wc2lzID0gdGhpcy5zdG9yeURldGFpbHMuc3lub3BzaXM7XG5cdFx0dGhpcy5jaGFwdGVycyA9IHRoaXMuc3RvcnlEZXRhaWxzLmNoYXB0ZXJzO1xuXHRcdHRoaXMuc3RvcnlJRCA9IHRoaXMuc3RvcnlEZXRhaWxzLmlkO1xuXHRcdHRoaXMuY2hhcHRlciA9IGxvYWRDaGFwdGVyRGF0YSgpO1xuXHRcdHRoaXMuZm9yRGVsZXRpb247XG5cdFx0Ly90aGUgY2hhcHRlciBiZWluZyBlZGl0ZWQuXG5cdFx0dGhpcy5lZGl0ZWRDaGFwdGVyID0gJHN0YXRlUGFyYW1zLmNoYXB0ZXJJRDtcblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGxvYWRDaGFwdGVyRGF0YSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IENoZWNrcyB0byBzZWUgd2hldGhlciB0aGUgY3VycmVudCBwYWdlIGhhcyBhIFwiY2hhcHRlcklEXCIgdmFsdWUsXG5cdFx0XHRcdFx0XHRcdHdoaWNoIG1lYW5zIGl0J3MgYSBjaGFwdGVyLWVkaXQgcGFnZS4gSWYgaXQgaXMsIGZldGNoZXMgdGhlIGRhdGFcblx0XHRcdFx0XHRcdFx0b2YgdGhlIGNoYXB0ZXIgYmVpbmcgZWRpdGVkIGZvciB0aGUgdGVtcGxhdGUgdG8gZmlsbCBpbi5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHRmdW5jdGlvbiBsb2FkQ2hhcHRlckRhdGEoKSB7XG5cdFx0XHRpZigkc3RhdGVQYXJhbXMuY2hhcHRlcklEKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHZtLmNoYXB0ZXJzWyRzdGF0ZVBhcmFtcy5jaGFwdGVySUQgLSAxXTtcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGNoYW5nZURldGFpbHMoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBDaGFuZ2VzIHRoZSBuYW1lIGFuZCBzeW5vcHNpcyBvZiB0aGUgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5jaGFuZ2VEZXRhaWxzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2bS5zdG9yeU5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3J5VGl0bGVcIikudmFsdWU7XG5cdFx0XHR2bS5zdG9yeVN5bm9wc2lzID0gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcnlTeW5vcHNpc1wiKS52YWx1ZTtcblx0XHRcdHZtLnN0b3JpZXNbdm0uc3RvcnlJRC0xXS5uYW1lID0gdm0uc3RvcnlOYW1lO1xuXHRcdFx0dm0uc3Rvcmllc1t2bS5zdG9yeUlELTFdLnN5bm9wc2lzID0gdm0uc3RvcnlTeW5vcHNpcztcblx0XHRcdFxuXHRcdFx0bGlicmFyaWFuLnVwZGF0ZVN0b3J5KHZtLnN0b3J5RGV0YWlscyk7XG5cdFx0fTtcblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGRlbGV0ZUl0ZW0oKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBPcGVucyBhIHBvcHVwIHRvIGNvbmZpcm0gd2hldGhlciB0byBkZWxldGUgdGhlIHNlbGVjdGVkIGl0ZW0uXG5cdFx0UGFyYW1ldGVyczogdG9EZWxldGUgLSB0aGUgaXRlbSB3aGljaCBuZWVkcyB0byBiZSBkZWxldGVkLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmRlbGV0ZUl0ZW0gPSBmdW5jdGlvbih0b0RlbGV0ZSkge1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbEJveFwiKS5jbGFzc05hbWUgPSBcIm9uXCI7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZVBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvZmZcIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZVBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvblwiKTtcblx0XHRcdGlmKHR5cGVvZiB0b0RlbGV0ZSAhPSBcInN0cmluZ1wiKVxuXHRcdFx0XHR2bS5mb3JEZWxldGlvbiA9IFwiQWxsIGNoYXB0ZXJzXCI7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHZtLmZvckRlbGV0aW9uID0gdG9EZWxldGU7XG5cdFx0fTtcblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGRlbGV0ZSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IERlbGV0ZXMgd2hhdGV2ZXIgdGhlIHVzZXIgYXNrZWQgdG8gZGVsZXRlLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuZGVsZXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQvL2lmIHRoZSB1c2VyIHJlcXVlc3RlZCB0byBkZWxldGUgdGhlIHN0b3J5XG5cdFx0XHRpZih2bS5mb3JEZWxldGlvbiA9PSB2bS5zdG9yeU5hbWUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2bS5zdG9yaWVzLnNwbGljZSh2bS5zdG9yeUlELTEsIDEpO1xuXHRcdFx0XHRcdGxpYnJhcmlhbi51cGRhdGVTdG9yaWVzKHZtLnN0b3JpZXMpO1xuXHRcdFx0XHRcdCRzdGF0ZS5nbyhcImhvbWVcIik7XG5cdFx0XHRcdH1cblx0XHRcdC8vaWYgdGhlIHVzZXIgcmVxdWVzdGVkIHRvIGRlbGV0ZSBhbGwgdGhlIGNoYXB0ZXJzXG5cdFx0XHRlbHNlIGlmKHZtLmZvckRlbGV0aW9uID09IFwiQWxsIGNoYXB0ZXJzXCIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2bS5jaGFwdGVycyA9IFtdO1xuXHRcdFx0XHRcdHZtLnN0b3JpZXNbdm0uc3RvcnlJRC0xXS5jaGFwdGVycyA9IFtdO1xuXHRcdFx0XHRcdGxpYnJhcmlhbi51cGRhdGVTdG9yaWVzKHZtLnN0b3JpZXMpO1xuXHRcdFx0XHR9XG5cdFx0XHQvL2lmIGl0J3Mgbm90IGVpdGhlciBvZiB0aG9zZSwgdGhlIHVzZXIgcmVxdWVzdGVkIHRvIGRlbGV0ZSBhIGNoYXB0ZXJcblx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhciBjaGFwdGVyTnVtID0gdm0uZm9yRGVsZXRpb24uc3Vic3RyKDgsMSk7XG5cdFx0XHRcdFx0dm0ucmVtb3ZlQ2hhcHRlcihjaGFwdGVyTnVtKTtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjbG9zZVBvcFVwKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQWJvcnRzIGRlbGV0aW9uIGFuZCBjbG9zZXMgdGhlIHBvcHVwLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2xvc2VQb3BVcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbEJveFwiKS5jbGFzc05hbWUgPSBcIm9mZlwiO1xuXHRcdFx0XG5cdFx0XHQvL2lmIHRoZSBkZWxldGUgcG9wdXAgaXMgdGhlIG9uZSBmcm9tIHdoaWNoIHRoZSBmdW5jdGlvbiB3YXMgY2FsbGVkLCB0aGUgZnVuY3Rpb24gaGlkZXMgXG5cdFx0XHQvL2l0LlxuXHRcdFx0aWYoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVQb3BVcFwiKS5jbGFzc0xpc3QuY29udGFpbnMoXCJvblwiKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZVBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHRcdFx0fVxuXHRcdFx0Ly9pZiBpdCB3YXNuJ3QgdGhlIGRlbGV0ZSBwb3B1cCwgaXQgd2FzIHRoZSBcImFkZFwiIHBvcHVwLCBzbyB0aGUgZnVuY3Rpb25cblx0XHRcdC8vaGlkZXMgaXQgaW5zdGVhZFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib2ZmXCIpO1xuXHRcdFx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdFx0XHR9XG5cdFx0fTtcblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGNoYW5nZUNoYXB0ZXJEZXRhaWxzKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQ2hhbmdlcyB0aGUgbmFtZSBhbmQgc3lub3BzaXMgb2YgdGhlIHNlbGVjdGVkIGNoYXB0ZXIuXG5cdFx0UGFyYW1ldGVyczogTm9uZVxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmNoYW5nZUNoYXB0ZXJEZXRhaWxzID0gZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdHZhciBjaGFwdGVySUQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJJRFwiKS52YWx1ZTtcblx0XHRcdHZhciBlZGl0ZWRDaGFwdGVyID0gIHtcblx0XHRcdFx0aWQ6IGNoYXB0ZXJJRCxcblx0XHRcdFx0bnVtYmVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJOdW1cIikudmFsdWUsIFxuXHRcdFx0XHR0aXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVyVGl0bGVcIikudmFsdWUsIFxuXHRcdFx0XHRzeW5vcHNpczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVyU3lub3BzaXNcIikudmFsdWVcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly9pZiB0aGUgY2hhcHRlcidzIG51bWJlciB3YXNuJ3QgY2hhbmdlZFxuXHRcdFx0aWYoZWRpdGVkQ2hhcHRlci5udW1iZXIgPT0gdm0uY2hhcHRlci5udW1iZXIgJiYgZWRpdGVkQ2hhcHRlci5pZCA9PSB2bS5jaGFwdGVyLmlkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dm0uY2hhcHRlci5uYW1lID0gZWRpdGVkQ2hhcHRlci50aXRsZTtcblx0XHRcdFx0XHR2bS5jaGFwdGVyLnN5bm9wc2lzID0gZWRpdGVkQ2hhcHRlci5zeW5vcHNpcztcblx0XHRcdFx0XHR2bS5jaGFwdGVyc1t2bS5jaGFwdGVyLm51bWJlci0xXSA9IGVkaXRlZENoYXB0ZXI7XG5cdFx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vY2hlY2tzIHdoZXRoZXIgdGhlcmUncyBhbHJlYWR5IGEgY2hhcHRlciB0aGVyZVxuXHRcdFx0XHRcdC8vaWYgdGhlcmUgaXMsIHB1dCBpdCBpbiB0aGUgbmV3IGxvY2F0aW9uIGFuZCBtb3ZlIGFsbCBjaGFwdGVycyBmcm9tIHRoZXJlIG9uIGZvcndhcmRcblx0XHRcdFx0XHRpZih2bS5jaGFwdGVyc1t2bS5jaGFwdGVyLm51bWJlci0xXSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dm0uY2hhcHRlcnMuc3BsaWNlKHZtLmNoYXB0ZXIubnVtYmVyLTEsIDAsIGVkaXRlZENoYXB0ZXIpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0dm0uY2hhcHRlcnMuZm9yRWFjaChmdW5jdGlvbihjaGFwdGVyLCBpbmRleCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKGluZGV4ID4gdm0uY2hhcHRlci5udW1iZXIpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNoYXB0ZXIubnVtYmVyID0gaW5kZXggKyAxO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvL2lmIHRoZXJlIGlzbid0XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR2bS5jaGFwdGVyc1t2bS5jaGFwdGVyLm51bWJlci0xXS5udW1iZXIgPSBlZGl0ZWRDaGFwdGVyLm51bWJlcjtcblx0XHRcdFx0XHRcdFx0dm0uY2hhcHRlcnNbdm0uY2hhcHRlci5udW1iZXItMV0ubmFtZSA9IGVkaXRlZENoYXB0ZXIudGl0bGU7XG5cdFx0XHRcdFx0XHRcdHZtLmNoYXB0ZXJzW3ZtLmNoYXB0ZXIubnVtYmVyLTFdLnN5bm9wc2lzID0gZWRpdGVkQ2hhcHRlci5zeW5vcHNpcztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR2bS5zdG9yeURldGFpbHMuY2hhcHRlcnMgPSB2bS5jaGFwdGVycztcblx0XHRcdGxpYnJhcmlhbi5lZGl0Q2hhcHRlcihlZGl0ZWRDaGFwdGVyLCB2bS5zdG9yeUlEKTtcblx0XHRcdFxuXHRcdFx0dm0uY2hhbmdlU3RhdGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjaGFuZ2VTdGF0ZSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IE9uY2UgdGhlIHVzZXIgaXMgZG9uZSB1cGRhdGluZyB0aGUgY2hhcHRlciwgc2VuZHMgdGhlIHVzZXIgYmFjayB0byB0aGVcblx0XHRcdFx0XHRcdFx0c3RvcnkgcGFnZS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdCRzdGF0ZS5nbygnc3RvcnknLCB7aWQ6IHZtLnN0b3J5SUR9KTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBvcGVuQWRkUGFuZWwoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBPcGVucyB0aGUgcGFuZWwgYWxsb3dpbmcgdGhlIHVzZXIgdG8gaW5zZXJ0IHRoZSBkZXRhaWxzIGZvciB0aGUgbmV3XG5cdFx0XHRcdFx0XHRcdGNoYXB0ZXIuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5vcGVuQWRkUGFuZWwgPSBmdW5jdGlvbigpIHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvblwiO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib2ZmXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib25cIik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogYWRkQ2hhcHRlcigpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEFkZHMgYSBuZXcgY2hhcHRlci5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmFkZENoYXB0ZXIgPSBmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0Ly9jaGVja3Mgd2hldGhlciBhIG51bWJlciB3YXMgZW50ZXJlZCBmb3IgY2hhcHRlciBudW1iZXJcblx0XHRcdC8vaWYgdGhlcmUgd2FzLCBwbGFjZXMgdGhlIGNoYXB0ZXIgaW4gdGhlIGdpdmVuIHBsYWNlXG5cdFx0XHQvL2l0IHRoZXJlIHdhc24ndCwgc2ltcGx5IGFkZHMgaXQgYXQgdGhlIGVuZCBvZiB0aGUgY3VycmVudCBjaGFwdGVycyBhcnJheVxuXHRcdFx0dmFyIG51bUNoYXB0ZXIgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVySURcIikudmFsdWUpID8gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlcklEXCIpLnZhbHVlKSA6ICh2bS5jaGFwdGVycy5sZW5ndGggKyAxKTtcblx0XHRcdHZhciBuZXdDaGFwdGVyID0ge1xuXHRcdFx0XHRcdG51bWJlcjogbnVtQ2hhcHRlciwgXG5cdFx0XHRcdFx0dGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlclRpdGxlXCIpLnZhbHVlLCBcblx0XHRcdFx0XHRzeW5vcHNpczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVyU3lub3BzaXNcIikudmFsdWVcblx0XHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvL2NoZWNrcyBpZiB0aGVyZSdzIGFscmVhZHkgYSBjaGFwdGVyIHRoZXJlXG5cdFx0XHQvL2lmIHRoZXJlIGlzXG5cdFx0XHRpZih2bS5jaGFwdGVyc1tudW1DaGFwdGVyLTFdKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dm0uY2hhcHRlcnMuc3BsaWNlKG51bUNoYXB0ZXItMSwgMCwgbmV3Q2hhcHRlcik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dm0uY2hhcHRlcnMuZm9yRWFjaChmdW5jdGlvbihjaGFwdGVyLCBpbmRleCkge1xuXHRcdFx0XHRcdFx0Y2hhcHRlci5udW1iZXIgPSBpbmRleCArIDE7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdC8vaWYgdGhlcmUgaXNuJ3Rcblx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vYWRkcyB0aGUgY2hhcHRlciB0byB0aGUgYXJyYXkgaW4gdGhlIHN0b3J5IGNvbnRyb2xsZXIgYW5kIHNlbmRzIGl0IHRvIHRoZSBsaWJyYXJpYW5cblx0XHRcdFx0XHR2bS5jaGFwdGVycy5wdXNoKG5ld0NoYXB0ZXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdHZtLnN0b3J5RGV0YWlscy5jaGFwdGVycyA9IHZtLmNoYXB0ZXJzO1xuXHRcdFx0bGlicmFyaWFuLmFkZENoYXB0ZXIobmV3Q2hhcHRlciwgdm0uc3RvcnlJRCk7XG5cdFx0XHRcblx0XHRcdC8vcmVtb3ZlcyB0aGUgbW9kYWwgYm94IGFuZCBwb3B1cFxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbEJveFwiKS5jbGFzc05hbWUgPSBcIm9mZlwiO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib2ZmXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogb3BlblJlbW92ZVBhbmVsKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogT3BlbnMgdGhlIHBhbmVsIGFsbG93aW5nIHRoZSB1c2VyIHRvIGNob29zZSB3aGljaCBjaGFwdGVycyB0byBkZWxldGUuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5vcGVuUmVtb3ZlUGFuZWwgPSBmdW5jdGlvbigpIHtcblx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucmVtb3ZlXCIpLmZvckVhY2goZnVuY3Rpb24oY2hhcHRlcikge1xuXHRcdFx0XHRjaGFwdGVyLmNsYXNzTGlzdC5hZGQoXCJvblwiKTtcblx0XHRcdFx0Y2hhcHRlci5jbGFzc0xpc3QucmVtb3ZlKFwib2ZmXCIpO1xuXHRcdFx0fSlcblx0XHRcdFxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkb25lQnRuXCIpLmNsYXNzTGlzdC5hZGQoXCJvblwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9uZUJ0blwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib2ZmXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGNsb3NlUmVtb3ZlUGFuZWwoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBDbG9zZXMgdGhlIHBhbmVsIGFsbG93aW5nIHRoZSB1c2VyIHRvIGNob29zZSB3aGljaCBjaGFwdGVycyB0byBkZWxldGUuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5jbG9zZVJlbW92ZVBhbmVsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnJlbW92ZVwiKS5mb3JFYWNoKGZ1bmN0aW9uKGNoYXB0ZXIpIHtcblx0XHRcdFx0Y2hhcHRlci5jbGFzc0xpc3QuYWRkKFwib2ZmXCIpO1xuXHRcdFx0XHRjaGFwdGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHRcdH0pXG5cdFx0XHRcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9uZUJ0blwiKS5jbGFzc0xpc3QuYWRkKFwib2ZmXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkb25lQnRuXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiByZW1vdmVDaGFwdGVyKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogRGVsZXRlcyBhIGNoYXB0ZXIuXG5cdFx0UGFyYW1ldGVyczogY2hhcHRlck51bWJlciAtIG51bWJlciBvZiB0aGUgY2hhcHRlciB0byBkZWxldGUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMucmVtb3ZlQ2hhcHRlciA9IGZ1bmN0aW9uKGNoYXB0ZXJOdW1iZXIpXG5cdFx0e1xuXHRcdFx0dm0uY2hhcHRlcnMuc3BsaWNlKGNoYXB0ZXJOdW1iZXIsIDEpO1xuXHRcdFx0dm0uc3Rvcmllc1t2bS5zdG9yeUlELTFdLmNoYXB0ZXJzID0gdm0uY2hhcHRlcnM7XG5cdFx0XHRsaWJyYXJpYW4udXBkYXRlU3Rvcmllcyh2bS5zdG9yaWVzKTtcblx0XHR9XG59XSk7IiwiLypcblx0c3RvcnlHZXR0ZXIuanNcblx0U3RvcnkgTWFuYWdlciBGYWN0b3J5XG5cdFxuXHRXcml0dGVuIGJ5IFNoaXIgQmFyIExldlxuKi9cblxuYW5ndWxhci5tb2R1bGUoJ1N0b3J5TWFuYWdlcicpXG5cdC5mYWN0b3J5KCdzdG9yeUdldHRlcicsIFsnJGh0dHAnLCBmdW5jdGlvbiBzdG9yeUdldHRlckZhY3RvcnkoJGh0dHApIHtcblx0Ly9yZXR1cm5zIFxuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRTdG9yaWVzOiAgZnVuY3Rpb24gZ2V0U3RvcmllcygpIHtcblx0XHRcdFx0cmV0dXJuICRodHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDo1MDAwLycpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXSk7IiwiLypcblx0bGlicmFyaWFuLmpzXG5cdFN0b3J5IE1hbmFnZXIgU2VydmljZVxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbi8vbGlicmFyaWFuIHNlcnZpY2UgdG8gZGVhbCB3aXRoIGV4cG9ydGluZyB0aGUgY2hhbmdlcyB0aGUgdXNlciBtYWtlcyB0byB0aGVpciBzdG9yaWVzXG5hbmd1bGFyLm1vZHVsZSgnU3RvcnlNYW5hZ2VyJylcblx0LnNlcnZpY2UoJ2xpYnJhcmlhbicsIFsnJGh0dHAnLCAnc3RvcnlHZXR0ZXInLCBmdW5jdGlvbigkaHR0cCwgc3RvcnlHZXR0ZXIpIHtcblx0XHQvL3ZhcmlhYmxlIGRlY2xhcmF0aW9uXG5cdFx0dmFyIHZtID0gdGhpcztcblx0XHR0aGlzLm15U3Rvcmllcztcblx0XHR0aGlzLmdldFN0b3JpZXMgPSBzdG9yeUdldHRlci5nZXRTdG9yaWVzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0dm0ubXlTdG9yaWVzID0gcmVzcG9uc2UuZGF0YS5zdG9yaWVzO1xuXHRcdH0pO1xuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogYWRkU3RvcnkoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBBZGRzIGEgbmV3IHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IHN0b3J5IC0gdGhlIG5ldyBzdG9yeS4gXG5cdFx0XHRcdFx0XHRcdCAgIHVwZGF0ZWRTdG9yaWVzIC0gdGhlIHVwZGF0ZWQgc3RvcmllcyBhcnJheSAoaW5jbHVkaW5nIHRoZSBuZXcgc3RvcnkpLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmFkZFN0b3J5ID0gZnVuY3Rpb24oc3RvcnksIHVwZGF0ZWRTdG9yaWVzKVxuXHRcdHtcblx0XHRcdCRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAvJyxcblx0XHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeShzdG9yeSlcblx0XHRcdFx0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0dm0ubXlTdG9yaWVzLnN0b3JpZXMgPSB1cGRhdGVkU3Rvcmllcztcblx0XHRcdHZtLnBvc3RUb0NhY2hlKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogdXBkYXRlU3RvcnkoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBVcGRhdGVzIGFuIGV4aXN0aW5nIHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IHVwZGF0ZWRTdG9yeSAtIFVwZGF0ZWQgc3RvcnkgZGF0YS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy51cGRhdGVTdG9yeSA9IGZ1bmN0aW9uKHVwZGF0ZWRTdG9yeSlcblx0XHR7XG5cdFx0XHR2bS5teVN0b3JpZXMuc3Rvcmllc1t1cGRhdGVkU3RvcnkuaWQtMV0gPSB1cGRhdGVkU3Rvcnk7XG5cdFx0XHRcblx0XHRcdC8vIFNlbmRzIHRoZSBuZXcgc3RvcnkgdG8gdGhlIHNlcnZlclxuXHRcdFx0JGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRcdHVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS8ke3VwZGF0ZWRTdG9yeS5pZH1gLFxuXHRcdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRTdG9yeSlcblx0XHRcdFx0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0Ly8gVXBkYXRlcyB0aGUgc2VydmljZSB3b3JrZXJcblx0XHRcdHZtLnBvc3RUb0NhY2hlKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogYWRkQ2hhcHRlcigpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEFkZHMgYSBuZXcgY2hhcHRlci5cblx0XHRQYXJhbWV0ZXJzOiBjaGFwdGVyIC0gdGhlIG5ldyBjaGFwdGVyLlxuXHRcdFx0XHRcdFx0XHQgICBzdG9yeUlEIC0gdGhlIElEIG9mIHRoZSBzdG9yeS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5hZGRDaGFwdGVyID0gZnVuY3Rpb24oY2hhcHRlciwgc3RvcnlJRClcblx0XHR7XG5cdFx0XHR2bS5teVN0b3JpZXNbc3RvcnlJRC0xXS5jaGFwdGVycy5wdXNoKGNoYXB0ZXIpO1xuXHRcdFx0XG5cdFx0XHQvLyBTZW5kcyB0aGUgbmV3IGNoYXB0ZXIgdG8gdGhlIHNlcnZlclxuXHRcdFx0JGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRcdHVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS8ke3N0b3J5SUR9YCxcblx0XHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeShjaGFwdGVyKVxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGVzIHRoZSBzZXJ2aWNlIHdvcmtlclxuXHRcdFx0dm0ucG9zdFRvQ2FjaGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBlZGl0Q2hhcHRlcigpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEVkaXRzIGEgY2hhcHRlci5cblx0XHRQYXJhbWV0ZXJzOiBjaGFwdGVyIC0gdGhlIG5ldyBjaGFwdGVyLlxuXHRcdFx0XHRcdFx0XHQgICBzdG9yeUlEIC0gdGhlIElEIG9mIHRoZSBzdG9yeS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5lZGl0Q2hhcHRlciA9IGZ1bmN0aW9uKGNoYXB0ZXIsIHN0b3J5SUQpXG5cdFx0e1xuXHRcdFx0dm0ubXlTdG9yaWVzW3N0b3J5SUQtMV0uY2hhcHRlcnNbY2hhcHRlci5udW1iZXItMV0gPSBjaGFwdGVyO1xuXHRcdFx0XG5cdFx0XHQvLyBTZW5kcyB0aGUgbmV3IGNoYXB0ZXIgdG8gdGhlIHNlcnZlclxuXHRcdFx0JGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRcdHVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS8ke3N0b3J5SUR9L2NoYXB0ZXJzLyR7Y2hhcHRlci5udW1iZXJ9YCxcblx0XHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeShjaGFwdGVyKVxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGVzIHRoZSBzZXJ2aWNlIHdvcmtlclxuXHRcdFx0dm0ucG9zdFRvQ2FjaGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBwb3N0VG9DYWNoZSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IFNlbmRzIHRoZSB1cGRhdGVkIHN0b3JpZXMgb2JqZWN0IHRvIHRoZSBTZXJ2aWNlIFdvcmtlciBzbyB0aGV5XG5cdFx0XHRcdFx0XHRcdGNhbiBiZSBjYWNoZWQuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5wb3N0VG9DYWNoZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoc2VydmljZVdvcmtlcikge1xuXHRcdFx0XHRzZXJ2aWNlV29ya2VyLmNvbnRyb2xsZXIucG9zdE1lc3NhZ2Uodm0ubXlTdG9yaWVzKTtcblx0XHRcdH1cblx0XHR9XG59XSk7Il19
