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
  this.storyName = this.storyDetails.name;
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
	librarian.js
	Story Manager Service
	
	Written by Shir Bar Lev
*/
//librarian service to deal with exporting the changes the user makes to their stories
angular.module('StoryManager').service('librarian', ['$http', function ($http) {
  //variable declaration
  var vm = this;
  this.myStories = {
    stories: []
  };
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
    vm.myStories.stories[storyID - 1].chapters.push(chapter); // Sends the new chapter to the server

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
    vm.myStories.stories[storyID - 1].chapters[chapter.number - 1] = chapter; // Sends the new chapter to the server

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnRyb2xsZXJzL2xpYnJhcnlDdHJsLmpzIiwiY29udHJvbGxlcnMvc2V0dGluZ3NDdHJsLmpzIiwiY29udHJvbGxlcnMvc3RvcnlDdHJsLmpzIiwic2VydmljZXMvbGlicmFyaWFuLmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIiRzdGF0ZVBhcmFtcyIsIiRodHRwIiwib3RoZXJ3aXNlIiwic3RhdGUiLCJ0ZW1wbGF0ZVVybCIsInVybCIsInJlc29sdmUiLCJsb2FkRGF0YSIsIm1ldGhvZCIsInRoZW4iLCJyZXNwb25zZSIsImRhdGEiLCJzdG9yaWVzIiwiY29udHJvbGxlciIsImlkIiwic3RvcnkiLCJjaGFwdGVySUQiLCJjaGFwdGVyIiwiJGluamVjdCIsInNlcnZpY2VXb3JrZXIiLCJuYXZpZ2F0b3IiLCJyZWdpc3RlciIsInNjb3BlIiwicmVnIiwid2luZG93IiwibG9jYXRpb24iLCJyZWxvYWQiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwibGlicmFyaWFuIiwidm0iLCJudW1TdG9yaWVzIiwibGVuZ3RoIiwic3Rvcmllc0RldGFpbHMiLCJnZXRTdG9yeURldGFpbHMiLCJzZWxlY3RlZFN0b3J5Iiwic3RvcnlBcnJheSIsImkiLCJzdG9yeURldGFpbHMiLCJ0aXRsZSIsInN5bm9wc2lzIiwicHVzaCIsImdldFNlbGVjdGVkU3RvcnkiLCJzZXRTZWxlY3RlZFN0b3J5IiwibnVtU2VsZWN0ZWQiLCJvcGVuQWRkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNsYXNzTmFtZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsImFkZFN0b3J5IiwibmV3U3RvcnkiLCJ2YWx1ZSIsImNsb3NlUG9wVXAiLCJzdG9yeVZpZXciLCJnZXRTdG9yeVZpZXciLCJzZXRTdG9yeVZpZXciLCJuZXdWaWV3IiwiJHN0YXRlIiwic3RvcnlOYW1lIiwibmFtZSIsInN0b3J5U3lub3BzaXMiLCJjaGFwdGVycyIsInN0b3J5SUQiLCJsb2FkQ2hhcHRlckRhdGEiLCJmb3JEZWxldGlvbiIsImVkaXRlZENoYXB0ZXIiLCJjaGFuZ2VEZXRhaWxzIiwidXBkYXRlU3RvcnkiLCJkZWxldGVJdGVtIiwidG9EZWxldGUiLCJzcGxpY2UiLCJ1cGRhdGVTdG9yaWVzIiwiZ28iLCJjaGFwdGVyTnVtIiwic3Vic3RyIiwicmVtb3ZlQ2hhcHRlciIsImNvbnRhaW5zIiwiY2hhbmdlQ2hhcHRlckRldGFpbHMiLCJudW1iZXIiLCJmb3JFYWNoIiwiaW5kZXgiLCJlZGl0Q2hhcHRlciIsImNoYW5nZVN0YXRlIiwib3BlbkFkZFBhbmVsIiwiYWRkQ2hhcHRlciIsIm51bUNoYXB0ZXIiLCJuZXdDaGFwdGVyIiwib3BlblJlbW92ZVBhbmVsIiwicXVlcnlTZWxlY3RvckFsbCIsImNsb3NlUmVtb3ZlUGFuZWwiLCJjaGFwdGVyTnVtYmVyIiwic2VydmljZSIsIm15U3RvcmllcyIsInVwZGF0ZWRTdG9yaWVzIiwiSlNPTiIsInN0cmluZ2lmeSIsInBvc3RUb0NhY2hlIiwidXBkYXRlZFN0b3J5IiwicG9zdE1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztBQU9BQSxPQUFPLENBQ05DLE1BREQsQ0FDUSxjQURSLEVBQ3dCLENBQUMsV0FBRCxDQUR4QixFQUVDQyxNQUZELENBRVEsQ0FBQyxnQkFBRCxFQUFtQixvQkFBbkIsRUFBeUMsVUFBU0MsY0FBVCxFQUF5QkMsa0JBQXpCLEVBQTZDQyxZQUE3QyxFQUEyREMsS0FBM0QsRUFBa0U7QUFDbEhGLEVBQUFBLGtCQUFrQixDQUFDRyxTQUFuQixDQUE2QixHQUE3QixFQURrSCxDQUdsSDs7QUFDQUosRUFBQUEsY0FBYyxDQUFDSyxLQUFmLENBQXFCLE1BQXJCLEVBQTZCO0FBQzVCQyxJQUFBQSxXQUFXLEVBQUUsd0JBRGU7QUFFNUJDLElBQUFBLEdBQUcsRUFBRSxHQUZ1QjtBQUc1QkMsSUFBQUEsT0FBTyxFQUFFO0FB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QUFDaUUsTUFBUixHQUFlLENBQXhELElBQTZEakUsT0FBN0QsQ0FERCxDQUdDOztBQUNBaEIsSUFBQUEsS0FBSyxDQUFDO0FBQ0pPLE1BQUFBLE1BQU0sRUFBRSxNQURKO0FBRUpILE1BQUFBLEdBQUcsd0NBQWlDNkQsT0FBakMsdUJBQXFEakQsT0FBTyxDQUFDaUUsTUFBN0QsQ0FGQztBQUdKdkUsTUFBQUEsSUFBSSxFQUFFdUYsSUFBSSxDQUFDQyxTQUFMLENBQWVsRixPQUFmO0FBSEYsS0FBRCxDQUFMLENBSUlSLElBSkosQ0FJUyxVQUFTQyxRQUFULEVBQW1CO0FBQzFCLGFBQU9BLFFBQVEsQ0FBQ0MsSUFBaEI7QUFDQSxLQU5GLEVBSkQsQ0FZQzs7QUFDQW9CLElBQUFBLEVBQUUsQ0FBQ3FFLFdBQUg7QUFDQSxHQWZEO0FBaUJBOzs7Ozs7Ozs7O0FBUUEsT0FBS0EsV0FBTCxHQUFtQixZQUFXO0FBQzdCLFFBQUdqRixhQUFILEVBQWtCO0FBQ2pCQSxNQUFBQSxhQUFhLENBQUNOLFVBQWQsQ0FBeUJ5RixXQUF6QixDQUFxQ3ZFLEVBQUUsQ0FBQ2lFLFNBQXhDO0FBQ0E7QUFDRCxHQUpEO0FBS0QsQ0FwSHNCLENBRHZCIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5cdGFwcC5qc1xuXHRTdG9yeSBNYW5hZ2VyIE1vZHVsZVxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbmFuZ3VsYXJcbi5tb2R1bGUoJ1N0b3J5TWFuYWdlcicsIFsndWkucm91dGVyJ10pXG4uY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJywgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJHN0YXRlUGFyYW1zLCAkaHR0cCkge1xuXHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cdFxuXHQvL2hvbWUgc3RhdGUgKG1haW4vbGlicmFyeSBwYWdlKVxuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcblx0XHR0ZW1wbGF0ZVVybDogJy92aWV3cy9saWJyYXJ5TWdyLmh0bWwnLFxuXHRcdHVybDogJy8nLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGxvYWREYXRhOiBmdW5jdGlvbigkaHR0cCkge1xuXHRcdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwLydcblx0XHRcdFx0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhLnN0b3JpZXM7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y29udHJvbGxlcjogJ2xpYnJhcnlDdHJsIGFzIGxpYnJhcnknXG5cdH0pO1xuXHRcblx0Ly9hIHN0b3J5J3MgcGFnZVxuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3RvcnknLCB7XG5cdFx0dGVtcGxhdGVVcmw6ICcvdmlld3Mvc3RvcnlNZ3IuaHRtbCcsXG5cdFx0dXJsOiAnL3N0b3J5L3tpZH0nLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGxvYWREYXRhOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG5cdFx0XHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAvc3RvcnkvJyArICRzdGF0ZVBhcmFtcy5pZFxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGEuc3Rvcnk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y29udHJvbGxlcjogJ3N0b3J5Q3RybCBhcyBzdG9yeSdcblx0fSk7XG5cdFxuXHQvL2Egc3RvcnkgZWRpdCBwYWdlXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdlZGl0Jywge1xuXHRcdHRlbXBsYXRlVXJsOiAnL3ZpZXdzL3N0b3J5RWRpdC5odG1sJyxcblx0XHR1cmw6ICcvc3Rvcnkve2lkfS9lZGl0LXN0b3J5Jyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRsb2FkRGF0YTogZnVuY3Rpb24oJGh0dHAsICAkc3RhdGVQYXJhbXMpIHtcblx0XHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS8nICsgJHN0YXRlUGFyYW1zLmlkXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YS5zdG9yeTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9sbGVyOiAnc3RvcnlDdHJsIGFzIHN0b3J5J1xuXHR9KTtcblx0XG5cdC8vYSBjaGFwdGVyIGVkaXQgcGFnZVxuXHQvL2NoaWxkIG9mIHRoZSBzdG9yeSBlZGl0IHBhZ2Vcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2VkaXRDaGFwdGVyJywge1xuXHRcdHRlbXBsYXRlVXJsOiAnL3ZpZXdzL2NoYXB0ZXJFZGl0Lmh0bWwnLFxuXHRcdHVybDonL3N0b3J5L3tpZH0vZWRpdC1zdG9yeS9lZGl0LWNoYXB0ZXIve2NoYXB0ZXJJRH0nLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGxvYWREYXRhOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG5cdFx0XHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdFx0XHR1cmw6IGBodHRwOi8vbG9jYWxob3N0OjUwMDAvc3RvcnkvJHskc3RhdGVQYXJhbXMuaWR9L2NoYXB0ZXJzLyR7JHN0YXRlUGFyYW1zLmNoYXB0ZXJJRH1gXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YS5jaGFwdGVyO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbnRyb2xsZXI6ICdzdG9yeUN0cmwgYXMgc3RvcnknXG5cdH0pO1xufV0pO1xuXG5hbmd1bGFyXG4ubW9kdWxlKCdTdG9yeU1hbmFnZXInKS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG4vL0luamVjdGluZyBVSS1Sb3V0ZXIgc3RhdGVQYXJhbXNcbmFuZ3VsYXJcbi5tb2R1bGUoJ1N0b3J5TWFuYWdlcicpLiRpbmplY3QgPSBbJyRzdGF0ZVBhcmFtcyddO1xuXG4vLyByZWdpc3RlciBzZXJ2aWNlIHdvcmtlclxudmFyIHNlcnZpY2VXb3JrZXI7XG5pZihuYXZpZ2F0b3Iuc2VydmljZVdvcmtlcilcblx0e1xuXHRcdG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKFwiL3N3LmpzXCIsIHsgc2NvcGU6ICcvJyB9KS50aGVuKGZ1bmN0aW9uKHJlZykge1xuXHRcdFx0c2VydmljZVdvcmtlciA9IHJlZztcblx0XHRcdC8vIGlmIHRoZXJlJ3Mgbm8gc2VydmljZSB3b3JrZXIgY29udHJvbGxpbmcgdGhlIHBhZ2UsIHJlbG9hZCB0byBsZXQgdGhlIG5ldyBzZXJ2aWNlIHdvcmtlciB0YWtlIG92ZXJcblx0XHRcdGlmKCFuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5jb250cm9sbGVyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0XHR9XG5cdFx0fSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH0pO1xuXHR9IiwiLypcblx0bGlicmFyeUN0cmwuanNcblx0U3RvcnkgTWFuYWdlciBDb250cm9sbGVyXG5cdFxuXHRXcml0dGVuIGJ5IFNoaXIgQmFyIExldlxuKi9cblxuLy9saWJyYXJ5IGNvbnRyb2xsZXJcbi8vY29udGFpbnMgYWxsIHRoZSBzdG90cmllcycgYmFzaWMgZGF0YVxuYW5ndWxhci5tb2R1bGUoXCJTdG9yeU1hbmFnZXJcIilcblx0LmNvbnRyb2xsZXIoXCJsaWJyYXJ5Q3RybFwiLCBbJ2xpYnJhcmlhbicsICdsb2FkRGF0YScsIGZ1bmN0aW9uKGxpYnJhcmlhbiwgbG9hZERhdGEpIHtcblx0XHQvL3ZhcmlhYmxlIGRlY2xhcmF0aW9uXG5cdFx0dmFyIHZtID0gdGhpcztcblx0XHR0aGlzLnN0b3JpZXMgPSBsb2FkRGF0YTtcblx0XHR0aGlzLm51bVN0b3JpZXMgPSBsb2FkRGF0YS5sZW5ndGg7XG5cdFx0dGhpcy5zdG9yaWVzRGV0YWlscyA9IGdldFN0b3J5RGV0YWlscygpO1xuXHRcdHRoaXMuc2VsZWN0ZWRTdG9yeSA9IDA7XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBnZXRTdG9yeURldGFpbHMoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBHZXRzIHRoZSBkZXRhaWxzIG9mIGVhY2ggc3RvcnkgZnJvbSB0aGUgbG9hZERhdGEgcmVzb2x2ZSBhbmQgYWRkcyB0aGVpclxuXHRcdFx0XHRcdFx0XHRcdHRpdGxlIGFuZCBzeW5vcHNpcyB0byB0aGUgc3Rvcmllc0RldGFpbHMgYXJyYXkgKHVzZWQgYnkgdGhlIHRlbXBsYXRlKS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHRmdW5jdGlvbiBnZXRTdG9yeURldGFpbHMoKVxuXHRcdHtcblx0XHRcdHZhciBzdG9yeUFycmF5ID0gW107IFxuXHRcdFx0XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdm0ubnVtU3RvcmllczsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgc3RvcnlEZXRhaWxzID0gbG9hZERhdGFbaV07XG5cdFx0XHRcdHZhciBzdG9yeSA9IHtcblx0XHRcdFx0XHR0aXRsZTogc3RvcnlEZXRhaWxzLnRpdGxlLCBcblx0XHRcdFx0XHRzeW5vcHNpczogc3RvcnlEZXRhaWxzLnN5bm9wc2lzLFxuXHRcdFx0XHRcdGlkOiBzdG9yeURldGFpbHMuaWRcblx0XHRcdFx0fTtcblx0XHRcdFx0c3RvcnlBcnJheS5wdXNoKHN0b3J5KTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0cmV0dXJuIHN0b3J5QXJyYXk7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBnZXRTZWxlY3RlZFN0b3J5KClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5nZXRTZWxlY3RlZFN0b3J5ID0gZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdHJldHVybiB2bS5zZWxlY3RlZFN0b3J5O1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogc2V0U2VsZWN0ZWRTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IFNldHMgdGhlIG51bWJlciBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IG51bVNlbGVjdGVkIC0gbmV3IHNlbGVjdGVkIHN0b3J5LlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLnNldFNlbGVjdGVkU3RvcnkgPSBmdW5jdGlvbihudW1TZWxlY3RlZClcblx0XHR7XG5cdFx0XHR2bS5zZWxlY3RlZFN0b3J5ID0gbnVtU2VsZWN0ZWQ7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogb3BlbkFkZCgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IE9wZW5zIHRoZSBcImFkZCBzdG9yeVwiIHBvcHVwLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMub3BlbkFkZCA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib25cIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9mZlwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9uXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGFkZFN0b3J5KClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQWRkcyBhIG5ldyBzdG9yeS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmFkZFN0b3J5ID0gZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdHZhciBuZXdTdG9yeSA9IHtcblx0XHRcdFx0XCJpZFwiOiB2bS5udW1TdG9yaWVzICsgMSxcblx0XHRcdFx0XCJ0aXRsZVwiOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3J5VGl0bGVcIikudmFsdWUsXG5cdFx0XHRcdFwic3lub3BzaXNcIjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9yeVN5bm9wc2lzXCIpLnZhbHVlLFxuXHRcdFx0XHRcImNoYXB0ZXJzXCI6IFtdXG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0XHR2bS5zdG9yaWVzLnB1c2gobmV3U3RvcnkpO1xuXHRcdFx0bGlicmFyaWFuLmFkZFN0b3J5KG5ld1N0b3J5LCB2bS5zdG9yaWVzKTtcblx0XHRcdFxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbEJveFwiKS5jbGFzc05hbWUgPSBcIm9mZlwiO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvZmZcIik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogY2xvc2VQb3BVcCgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IENsb3NlcyB0aGUgcG9wdXAgd2l0aG91dCBhZGRpbmcgYSBuZXcgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5jbG9zZVBvcFVwID0gZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvZmZcIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib2ZmXCIpO1xuXHRcdH1cbn1dKTsiLCIvKlxuXHRzZXR0aW5nc0N0cmwuanNcblx0U3RvcnkgTWFuYWdlciBDb250cm9sbGVyXG5cdFxuXHRXcml0dGVuIGJ5IFNoaXIgQmFyIExldlxuKi9cblxuLy9jb250cm9sbGVyIGZvciB0aGUgc2V0dGluZ3MgcGFnZVxuYW5ndWxhci5tb2R1bGUoXCJTdG9yeU1hbmFnZXJcIilcblx0LmNvbnRyb2xsZXIoXCJzZXR0aW5nc0N0cmxcIiwgW2Z1bmN0aW9uKCkge1xuXHRcdC8vY2hhcHRlcnMgdnMgcGxvdC1saW5lcyB2aWV3XG5cdFx0dmFyIHN0b3J5VmlldyA9IFwiY2hhcHRlcnNWaWV3XCI7XG5cdFx0XG5cdFx0Ly9nZXR0ZXIgZm9yIHRoZSBzdG9yeVZpZXdcblx0XHR0aGlzLmdldFN0b3J5VmlldyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHN0b3J5Vmlldztcblx0XHR9XG5cdFx0XG5cdFx0Ly9zZXR0ZXIgZm9yIHRoZSBzdG9yeVZpZXdcblx0XHR0aGlzLnNldFN0b3J5VmlldyA9IGZ1bmN0aW9uKG5ld1ZpZXcpIHtcblx0XHRcdHN0b3J5VmlldyA9IG5ld1ZpZXc7XG5cdFx0fVxuXHR9XSk7IiwiLypcblx0c3RvcnlDdHJsLmpzXG5cdFN0b3J5IE1hbmFnZXIgQ29udHJvbGxlclxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbi8vc3RvcnkgbWFuYWdlciBjb250cm9sbGVyXG4vL2NvbnRhaW5zIHRoZSBjdXJyZW50bHkgdmlld2VkIHN0b3J5XG5hbmd1bGFyLm1vZHVsZSgnU3RvcnlNYW5hZ2VyJylcblx0LmNvbnRyb2xsZXIoJ3N0b3J5Q3RybCcsIFsnJHN0YXRlUGFyYW1zJywgJ2xpYnJhcmlhbicsICdsb2FkRGF0YScsICckc3RhdGUnLCBmdW5jdGlvbigkc3RhdGVQYXJhbXMsIGxpYnJhcmlhbiwgbG9hZERhdGEsICRzdGF0ZSkge1xuXHRcdC8vdmFyaWFibGUgZGVjbGFyYXRpb25cblx0XHR2YXIgdm0gPSB0aGlzO1xuXHRcdHRoaXMuc3RvcnlEZXRhaWxzID0gbG9hZERhdGE7XG5cdFx0dGhpcy5zdG9yeU5hbWUgPSB0aGlzLnN0b3J5RGV0YWlscy5uYW1lO1xuXHRcdHRoaXMuc3RvcnlTeW5vcHNpcyA9IHRoaXMuc3RvcnlEZXRhaWxzLnN5bm9wc2lzO1xuXHRcdHRoaXMuY2hhcHRlcnMgPSB0aGlzLnN0b3J5RGV0YWlscy5jaGFwdGVycztcblx0XHR0aGlzLnN0b3J5SUQgPSB0aGlzLnN0b3J5RGV0YWlscy5pZDtcblx0XHR0aGlzLmNoYXB0ZXIgPSBsb2FkQ2hhcHRlckRhdGEoKTtcblx0XHR0aGlzLmZvckRlbGV0aW9uO1xuXHRcdC8vdGhlIGNoYXB0ZXIgYmVpbmcgZWRpdGVkLlxuXHRcdHRoaXMuZWRpdGVkQ2hhcHRlciA9ICRzdGF0ZVBhcmFtcy5jaGFwdGVySUQ7XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBsb2FkQ2hhcHRlckRhdGEoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBDaGVja3MgdG8gc2VlIHdoZXRoZXIgdGhlIGN1cnJlbnQgcGFnZSBoYXMgYSBcImNoYXB0ZXJJRFwiIHZhbHVlLFxuXHRcdFx0XHRcdFx0XHR3aGljaCBtZWFucyBpdCdzIGEgY2hhcHRlci1lZGl0IHBhZ2UuIElmIGl0IGlzLCBmZXRjaGVzIHRoZSBkYXRhXG5cdFx0XHRcdFx0XHRcdG9mIHRoZSBjaGFwdGVyIGJlaW5nIGVkaXRlZCBmb3IgdGhlIHRlbXBsYXRlIHRvIGZpbGwgaW4uXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0ZnVuY3Rpb24gbG9hZENoYXB0ZXJEYXRhKCkge1xuXHRcdFx0aWYoJHN0YXRlUGFyYW1zLmNoYXB0ZXJJRClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB2bS5jaGFwdGVyc1skc3RhdGVQYXJhbXMuY2hhcHRlcklEIC0gMV07XG5cdFx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjaGFuZ2VEZXRhaWxzKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQ2hhbmdlcyB0aGUgbmFtZSBhbmQgc3lub3BzaXMgb2YgdGhlIHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2hhbmdlRGV0YWlscyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dm0uc3RvcnlOYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9yeVRpdGxlXCIpLnZhbHVlO1xuXHRcdFx0dm0uc3RvcnlTeW5vcHNpcyA9ICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3J5U3lub3BzaXNcIikudmFsdWU7XG5cdFx0XHR2bS5zdG9yaWVzW3ZtLnN0b3J5SUQtMV0ubmFtZSA9IHZtLnN0b3J5TmFtZTtcblx0XHRcdHZtLnN0b3JpZXNbdm0uc3RvcnlJRC0xXS5zeW5vcHNpcyA9IHZtLnN0b3J5U3lub3BzaXM7XG5cdFx0XHRcblx0XHRcdGxpYnJhcmlhbi51cGRhdGVTdG9yeSh2bS5zdG9yeURldGFpbHMpO1xuXHRcdH07XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBkZWxldGVJdGVtKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogT3BlbnMgYSBwb3B1cCB0byBjb25maXJtIHdoZXRoZXIgdG8gZGVsZXRlIHRoZSBzZWxlY3RlZCBpdGVtLlxuXHRcdFBhcmFtZXRlcnM6IHRvRGVsZXRlIC0gdGhlIGl0ZW0gd2hpY2ggbmVlZHMgdG8gYmUgZGVsZXRlZC5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5kZWxldGVJdGVtID0gZnVuY3Rpb24odG9EZWxldGUpIHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvblwiO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib2ZmXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib25cIik7XG5cdFx0XHRpZih0eXBlb2YgdG9EZWxldGUgIT0gXCJzdHJpbmdcIilcblx0XHRcdFx0dm0uZm9yRGVsZXRpb24gPSBcIkFsbCBjaGFwdGVyc1wiO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHR2bS5mb3JEZWxldGlvbiA9IHRvRGVsZXRlO1xuXHRcdH07XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBkZWxldGUoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBEZWxldGVzIHdoYXRldmVyIHRoZSB1c2VyIGFza2VkIHRvIGRlbGV0ZS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly9pZiB0aGUgdXNlciByZXF1ZXN0ZWQgdG8gZGVsZXRlIHRoZSBzdG9yeVxuXHRcdFx0aWYodm0uZm9yRGVsZXRpb24gPT0gdm0uc3RvcnlOYW1lKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dm0uc3Rvcmllcy5zcGxpY2Uodm0uc3RvcnlJRC0xLCAxKTtcblx0XHRcdFx0XHRsaWJyYXJpYW4udXBkYXRlU3Rvcmllcyh2bS5zdG9yaWVzKTtcblx0XHRcdFx0XHQkc3RhdGUuZ28oXCJob21lXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHQvL2lmIHRoZSB1c2VyIHJlcXVlc3RlZCB0byBkZWxldGUgYWxsIHRoZSBjaGFwdGVyc1xuXHRcdFx0ZWxzZSBpZih2bS5mb3JEZWxldGlvbiA9PSBcIkFsbCBjaGFwdGVyc1wiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dm0uY2hhcHRlcnMgPSBbXTtcblx0XHRcdFx0XHR2bS5zdG9yaWVzW3ZtLnN0b3J5SUQtMV0uY2hhcHRlcnMgPSBbXTtcblx0XHRcdFx0XHRsaWJyYXJpYW4udXBkYXRlU3Rvcmllcyh2bS5zdG9yaWVzKTtcblx0XHRcdFx0fVxuXHRcdFx0Ly9pZiBpdCdzIG5vdCBlaXRoZXIgb2YgdGhvc2UsIHRoZSB1c2VyIHJlcXVlc3RlZCB0byBkZWxldGUgYSBjaGFwdGVyXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YXIgY2hhcHRlck51bSA9IHZtLmZvckRlbGV0aW9uLnN1YnN0cig4LDEpO1xuXHRcdFx0XHRcdHZtLnJlbW92ZUNoYXB0ZXIoY2hhcHRlck51bSk7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdFxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogY2xvc2VQb3BVcCgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEFib3J0cyBkZWxldGlvbiBhbmQgY2xvc2VzIHRoZSBwb3B1cC5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmNsb3NlUG9wVXAgPSBmdW5jdGlvbigpIHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvZmZcIjtcblx0XHRcdFxuXHRcdFx0Ly9pZiB0aGUgZGVsZXRlIHBvcHVwIGlzIHRoZSBvbmUgZnJvbSB3aGljaCB0aGUgZnVuY3Rpb24gd2FzIGNhbGxlZCwgdGhlIGZ1bmN0aW9uIGhpZGVzIFxuXHRcdFx0Ly9pdC5cblx0XHRcdGlmKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlUG9wVXBcIikuY2xhc3NMaXN0LmNvbnRhaW5zKFwib25cIikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZVBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvZmZcIik7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0XHRcdH1cblx0XHRcdC8vaWYgaXQgd2Fzbid0IHRoZSBkZWxldGUgcG9wdXAsIGl0IHdhcyB0aGUgXCJhZGRcIiBwb3B1cCwgc28gdGhlIGZ1bmN0aW9uXG5cdFx0XHQvL2hpZGVzIGl0IGluc3RlYWRcblx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHRcdFx0fVxuXHRcdH07XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjaGFuZ2VDaGFwdGVyRGV0YWlscygpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IENoYW5nZXMgdGhlIG5hbWUgYW5kIHN5bm9wc2lzIG9mIHRoZSBzZWxlY3RlZCBjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmVcblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5jaGFuZ2VDaGFwdGVyRGV0YWlscyA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHR2YXIgY2hhcHRlcklEID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVySURcIikudmFsdWU7XG5cdFx0XHR2YXIgZWRpdGVkQ2hhcHRlciA9ICB7XG5cdFx0XHRcdGlkOiBjaGFwdGVySUQsXG5cdFx0XHRcdG51bWJlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVyTnVtXCIpLnZhbHVlLCBcblx0XHRcdFx0dGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlclRpdGxlXCIpLnZhbHVlLCBcblx0XHRcdFx0c3lub3BzaXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlclN5bm9wc2lzXCIpLnZhbHVlXG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vaWYgdGhlIGNoYXB0ZXIncyBudW1iZXIgd2Fzbid0IGNoYW5nZWRcblx0XHRcdGlmKGVkaXRlZENoYXB0ZXIubnVtYmVyID09IHZtLmNoYXB0ZXIubnVtYmVyICYmIGVkaXRlZENoYXB0ZXIuaWQgPT0gdm0uY2hhcHRlci5pZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZtLmNoYXB0ZXIubmFtZSA9IGVkaXRlZENoYXB0ZXIudGl0bGU7XG5cdFx0XHRcdFx0dm0uY2hhcHRlci5zeW5vcHNpcyA9IGVkaXRlZENoYXB0ZXIuc3lub3BzaXM7XG5cdFx0XHRcdFx0dm0uY2hhcHRlcnNbdm0uY2hhcHRlci5udW1iZXItMV0gPSBlZGl0ZWRDaGFwdGVyO1xuXHRcdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL2NoZWNrcyB3aGV0aGVyIHRoZXJlJ3MgYWxyZWFkeSBhIGNoYXB0ZXIgdGhlcmVcblx0XHRcdFx0XHQvL2lmIHRoZXJlIGlzLCBwdXQgaXQgaW4gdGhlIG5ldyBsb2NhdGlvbiBhbmQgbW92ZSBhbGwgY2hhcHRlcnMgZnJvbSB0aGVyZSBvbiBmb3J3YXJkXG5cdFx0XHRcdFx0aWYodm0uY2hhcHRlcnNbdm0uY2hhcHRlci5udW1iZXItMV0pXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHZtLmNoYXB0ZXJzLnNwbGljZSh2bS5jaGFwdGVyLm51bWJlci0xLCAwLCBlZGl0ZWRDaGFwdGVyKTtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdHZtLmNoYXB0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcHRlciwgaW5kZXgpIHtcblx0XHRcdFx0XHRcdFx0XHRpZihpbmRleCA+IHZtLmNoYXB0ZXIubnVtYmVyKVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjaGFwdGVyLm51bWJlciA9IGluZGV4ICsgMTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly9pZiB0aGVyZSBpc24ndFxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dm0uY2hhcHRlcnNbdm0uY2hhcHRlci5udW1iZXItMV0ubnVtYmVyID0gZWRpdGVkQ2hhcHRlci5udW1iZXI7XG5cdFx0XHRcdFx0XHRcdHZtLmNoYXB0ZXJzW3ZtLmNoYXB0ZXIubnVtYmVyLTFdLm5hbWUgPSBlZGl0ZWRDaGFwdGVyLnRpdGxlO1xuXHRcdFx0XHRcdFx0XHR2bS5jaGFwdGVyc1t2bS5jaGFwdGVyLm51bWJlci0xXS5zeW5vcHNpcyA9IGVkaXRlZENoYXB0ZXIuc3lub3BzaXM7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dm0uc3RvcnlEZXRhaWxzLmNoYXB0ZXJzID0gdm0uY2hhcHRlcnM7XG5cdFx0XHRsaWJyYXJpYW4uZWRpdENoYXB0ZXIoZWRpdGVkQ2hhcHRlciwgdm0uc3RvcnlJRCk7XG5cdFx0XHRcblx0XHRcdHZtLmNoYW5nZVN0YXRlKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogY2hhbmdlU3RhdGUoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBPbmNlIHRoZSB1c2VyIGlzIGRvbmUgdXBkYXRpbmcgdGhlIGNoYXB0ZXIsIHNlbmRzIHRoZSB1c2VyIGJhY2sgdG8gdGhlXG5cdFx0XHRcdFx0XHRcdHN0b3J5IHBhZ2UuXG5cdFx0UGFyYW1ldGVyczogTm9uZVxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmNoYW5nZVN0YXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkc3RhdGUuZ28oJ3N0b3J5Jywge2lkOiB2bS5zdG9yeUlEfSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogb3BlbkFkZFBhbmVsKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogT3BlbnMgdGhlIHBhbmVsIGFsbG93aW5nIHRoZSB1c2VyIHRvIGluc2VydCB0aGUgZGV0YWlscyBmb3IgdGhlIG5ld1xuXHRcdFx0XHRcdFx0XHRjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMub3BlbkFkZFBhbmVsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib25cIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9mZlwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9uXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGFkZENoYXB0ZXIoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBBZGRzIGEgbmV3IGNoYXB0ZXIuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5hZGRDaGFwdGVyID0gZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdC8vY2hlY2tzIHdoZXRoZXIgYSBudW1iZXIgd2FzIGVudGVyZWQgZm9yIGNoYXB0ZXIgbnVtYmVyXG5cdFx0XHQvL2lmIHRoZXJlIHdhcywgcGxhY2VzIHRoZSBjaGFwdGVyIGluIHRoZSBnaXZlbiBwbGFjZVxuXHRcdFx0Ly9pdCB0aGVyZSB3YXNuJ3QsIHNpbXBseSBhZGRzIGl0IGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgY2hhcHRlcnMgYXJyYXlcblx0XHRcdHZhciBudW1DaGFwdGVyID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlcklEXCIpLnZhbHVlKSA/IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJJRFwiKS52YWx1ZSkgOiAodm0uY2hhcHRlcnMubGVuZ3RoICsgMSk7XG5cdFx0XHR2YXIgbmV3Q2hhcHRlciA9IHtcblx0XHRcdFx0XHRudW1iZXI6IG51bUNoYXB0ZXIsIFxuXHRcdFx0XHRcdHRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJUaXRsZVwiKS52YWx1ZSwgXG5cdFx0XHRcdFx0c3lub3BzaXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlclN5bm9wc2lzXCIpLnZhbHVlXG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly9jaGVja3MgaWYgdGhlcmUncyBhbHJlYWR5IGEgY2hhcHRlciB0aGVyZVxuXHRcdFx0Ly9pZiB0aGVyZSBpc1xuXHRcdFx0aWYodm0uY2hhcHRlcnNbbnVtQ2hhcHRlci0xXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZtLmNoYXB0ZXJzLnNwbGljZShudW1DaGFwdGVyLTEsIDAsIG5ld0NoYXB0ZXIpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZtLmNoYXB0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcHRlciwgaW5kZXgpIHtcblx0XHRcdFx0XHRcdGNoYXB0ZXIubnVtYmVyID0gaW5kZXggKyAxO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHQvL2lmIHRoZXJlIGlzbid0XG5cdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvL2FkZHMgdGhlIGNoYXB0ZXIgdG8gdGhlIGFycmF5IGluIHRoZSBzdG9yeSBjb250cm9sbGVyIGFuZCBzZW5kcyBpdCB0byB0aGUgbGlicmFyaWFuXG5cdFx0XHRcdFx0dm0uY2hhcHRlcnMucHVzaChuZXdDaGFwdGVyKTtcblx0XHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR2bS5zdG9yeURldGFpbHMuY2hhcHRlcnMgPSB2bS5jaGFwdGVycztcblx0XHRcdGxpYnJhcmlhbi5hZGRDaGFwdGVyKG5ld0NoYXB0ZXIsIHZtLnN0b3J5SUQpO1xuXHRcdFx0XG5cdFx0XHQvL3JlbW92ZXMgdGhlIG1vZGFsIGJveCBhbmQgcG9wdXBcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvZmZcIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IG9wZW5SZW1vdmVQYW5lbCgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IE9wZW5zIHRoZSBwYW5lbCBhbGxvd2luZyB0aGUgdXNlciB0byBjaG9vc2Ugd2hpY2ggY2hhcHRlcnMgdG8gZGVsZXRlLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMub3BlblJlbW92ZVBhbmVsID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnJlbW92ZVwiKS5mb3JFYWNoKGZ1bmN0aW9uKGNoYXB0ZXIpIHtcblx0XHRcdFx0Y2hhcHRlci5jbGFzc0xpc3QuYWRkKFwib25cIik7XG5cdFx0XHRcdGNoYXB0ZXIuY2xhc3NMaXN0LnJlbW92ZShcIm9mZlwiKTtcblx0XHRcdH0pXG5cdFx0XHRcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9uZUJ0blwiKS5jbGFzc0xpc3QuYWRkKFwib25cIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvbmVCdG5cIikuY2xhc3NMaXN0LnJlbW92ZShcIm9mZlwiKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBjbG9zZVJlbW92ZVBhbmVsKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQ2xvc2VzIHRoZSBwYW5lbCBhbGxvd2luZyB0aGUgdXNlciB0byBjaG9vc2Ugd2hpY2ggY2hhcHRlcnMgdG8gZGVsZXRlLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2xvc2VSZW1vdmVQYW5lbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yZW1vdmVcIikuZm9yRWFjaChmdW5jdGlvbihjaGFwdGVyKSB7XG5cdFx0XHRcdGNoYXB0ZXIuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdFx0Y2hhcHRlci5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0XHR9KVxuXHRcdFx0XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvbmVCdG5cIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9uZUJ0blwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogcmVtb3ZlQ2hhcHRlcigpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IERlbGV0ZXMgYSBjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IGNoYXB0ZXJOdW1iZXIgLSBudW1iZXIgb2YgdGhlIGNoYXB0ZXIgdG8gZGVsZXRlLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLnJlbW92ZUNoYXB0ZXIgPSBmdW5jdGlvbihjaGFwdGVyTnVtYmVyKVxuXHRcdHtcblx0XHRcdHZtLmNoYXB0ZXJzLnNwbGljZShjaGFwdGVyTnVtYmVyLCAxKTtcblx0XHRcdHZtLnN0b3JpZXNbdm0uc3RvcnlJRC0xXS5jaGFwdGVycyA9IHZtLmNoYXB0ZXJzO1xuXHRcdFx0bGlicmFyaWFuLnVwZGF0ZVN0b3JpZXModm0uc3Rvcmllcyk7XG5cdFx0fVxufV0pOyIsIi8qXG5cdGxpYnJhcmlhbi5qc1xuXHRTdG9yeSBNYW5hZ2VyIFNlcnZpY2Vcblx0XG5cdFdyaXR0ZW4gYnkgU2hpciBCYXIgTGV2XG4qL1xuXG4vL2xpYnJhcmlhbiBzZXJ2aWNlIHRvIGRlYWwgd2l0aCBleHBvcnRpbmcgdGhlIGNoYW5nZXMgdGhlIHVzZXIgbWFrZXMgdG8gdGhlaXIgc3Rvcmllc1xuYW5ndWxhci5tb2R1bGUoJ1N0b3J5TWFuYWdlcicpXG5cdC5zZXJ2aWNlKCdsaWJyYXJpYW4nLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcblx0XHQvL3ZhcmlhYmxlIGRlY2xhcmF0aW9uXG5cdFx0dmFyIHZtID0gdGhpcztcblx0XHR0aGlzLm15U3RvcmllcyA9IHtcblx0XHRcdHN0b3JpZXM6IFtdXG5cdFx0fTtcblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGFkZFN0b3J5KClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQWRkcyBhIG5ldyBzdG9yeS5cblx0XHRQYXJhbWV0ZXJzOiBzdG9yeSAtIHRoZSBuZXcgc3RvcnkuIFxuXHRcdFx0XHRcdFx0XHQgICB1cGRhdGVkU3RvcmllcyAtIHRoZSB1cGRhdGVkIHN0b3JpZXMgYXJyYXkgKGluY2x1ZGluZyB0aGUgbmV3IHN0b3J5KS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5hZGRTdG9yeSA9IGZ1bmN0aW9uKHN0b3J5LCB1cGRhdGVkU3Rvcmllcylcblx0XHR7XG5cdFx0XHQkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2xvY2FsaG9zdDo1MDAwLycsXG5cdFx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoc3RvcnkpXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdHZtLm15U3Rvcmllcy5zdG9yaWVzID0gdXBkYXRlZFN0b3JpZXM7XG5cdFx0XHR2bS5wb3N0VG9DYWNoZSgpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IHVwZGF0ZVN0b3J5KClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogVXBkYXRlcyBhbiBleGlzdGluZyBzdG9yeS5cblx0XHRQYXJhbWV0ZXJzOiB1cGRhdGVkU3RvcnkgLSBVcGRhdGVkIHN0b3J5IGRhdGEuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMudXBkYXRlU3RvcnkgPSBmdW5jdGlvbih1cGRhdGVkU3RvcnkpXG5cdFx0e1xuXHRcdFx0dm0ubXlTdG9yaWVzLnN0b3JpZXNbdXBkYXRlZFN0b3J5LmlkLTFdID0gdXBkYXRlZFN0b3J5O1xuXHRcdFx0XG5cdFx0XHQvLyBTZW5kcyB0aGUgbmV3IHN0b3J5IHRvIHRoZSBzZXJ2ZXJcblx0XHRcdCRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdFx0XHR1cmw6IGBodHRwOi8vbG9jYWxob3N0OjUwMDAvc3RvcnkvJHt1cGRhdGVkU3RvcnkuaWR9YCxcblx0XHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeSh1cGRhdGVkU3RvcnkpXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdC8vIFVwZGF0ZXMgdGhlIHNlcnZpY2Ugd29ya2VyXG5cdFx0XHR2bS5wb3N0VG9DYWNoZSgpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGFkZENoYXB0ZXIoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBBZGRzIGEgbmV3IGNoYXB0ZXIuXG5cdFx0UGFyYW1ldGVyczogY2hhcHRlciAtIHRoZSBuZXcgY2hhcHRlci5cblx0XHRcdFx0XHRcdFx0ICAgc3RvcnlJRCAtIHRoZSBJRCBvZiB0aGUgc3RvcnkuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuYWRkQ2hhcHRlciA9IGZ1bmN0aW9uKGNoYXB0ZXIsIHN0b3J5SUQpXG5cdFx0e1xuXHRcdFx0dm0ubXlTdG9yaWVzLnN0b3JpZXNbc3RvcnlJRC0xXS5jaGFwdGVycy5wdXNoKGNoYXB0ZXIpO1xuXHRcdFx0XG5cdFx0XHQvLyBTZW5kcyB0aGUgbmV3IGNoYXB0ZXIgdG8gdGhlIHNlcnZlclxuXHRcdFx0JGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRcdHVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS8ke3N0b3J5SUR9YCxcblx0XHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeShjaGFwdGVyKVxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGVzIHRoZSBzZXJ2aWNlIHdvcmtlclxuXHRcdFx0dm0ucG9zdFRvQ2FjaGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBlZGl0Q2hhcHRlcigpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEVkaXRzIGEgY2hhcHRlci5cblx0XHRQYXJhbWV0ZXJzOiBjaGFwdGVyIC0gdGhlIG5ldyBjaGFwdGVyLlxuXHRcdFx0XHRcdFx0XHQgICBzdG9yeUlEIC0gdGhlIElEIG9mIHRoZSBzdG9yeS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5lZGl0Q2hhcHRlciA9IGZ1bmN0aW9uKGNoYXB0ZXIsIHN0b3J5SUQpXG5cdFx0e1xuXHRcdFx0dm0ubXlTdG9yaWVzLnN0b3JpZXNbc3RvcnlJRC0xXS5jaGFwdGVyc1tjaGFwdGVyLm51bWJlci0xXSA9IGNoYXB0ZXI7XG5cdFx0XHRcblx0XHRcdC8vIFNlbmRzIHRoZSBuZXcgY2hhcHRlciB0byB0aGUgc2VydmVyXG5cdFx0XHQkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdFx0dXJsOiBgaHR0cDovL2xvY2FsaG9zdDo1MDAwL3N0b3J5LyR7c3RvcnlJRH0vY2hhcHRlcnMvJHtjaGFwdGVyLm51bWJlcn1gLFxuXHRcdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KGNoYXB0ZXIpXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdC8vIFVwZGF0ZXMgdGhlIHNlcnZpY2Ugd29ya2VyXG5cdFx0XHR2bS5wb3N0VG9DYWNoZSgpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IHBvc3RUb0NhY2hlKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogU2VuZHMgdGhlIHVwZGF0ZWQgc3RvcmllcyBvYmplY3QgdG8gdGhlIFNlcnZpY2UgV29ya2VyIHNvIHRoZXlcblx0XHRcdFx0XHRcdFx0Y2FuIGJlIGNhY2hlZC5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLnBvc3RUb0NhY2hlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZihzZXJ2aWNlV29ya2VyKSB7XG5cdFx0XHRcdHNlcnZpY2VXb3JrZXIuY29udHJvbGxlci5wb3N0TWVzc2FnZSh2bS5teVN0b3JpZXMpO1xuXHRcdFx0fVxuXHRcdH1cbn1dKTsiXX0=
