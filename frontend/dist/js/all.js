"use strict";

/*
	app.js
	Story Manager Module
	
	Written by Shir Bar Lev
*/
angular.module('StoryManager', ['ui.router']).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider, $http) {
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
      loadData: function loadData($http) {
        return $http({
          method: 'GET',
          url: 'http://localhost:5000/story/{id}'
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
      loadData: function loadData($http) {
        return $http({
          method: 'GET',
          url: 'http://localhost:5000/story/{id}'
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
      loadData: function loadData($http) {
        return $http({
          method: 'GET',
          url: 'http://localhost:5000/story/{id}/chapters/{chapterID}'
        }).then(function (response) {
          return response.data.chapter;
        });
      }
    },
    controller: 'storyCtrl as story'
  });
}]);
angular.module('StoryManager').$inject = ['$http']; // register service worker

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNvbnRyb2xsZXJzL2xpYnJhcnlDdHJsLmpzIiwiY29udHJvbGxlcnMvc2V0dGluZ3NDdHJsLmpzIiwiY29udHJvbGxlcnMvc3RvcnlDdHJsLmpzIiwic2VydmljZXMvbGlicmFyaWFuLmpzIl0sIm5hbWVzIjpbImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkc3RhdGVQcm92aWRlciIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIiRodHRwIiwib3RoZXJ3aXNlIiwic3RhdGUiLCJ0ZW1wbGF0ZVVybCIsInVybCIsInJlc29sdmUiLCJsb2FkRGF0YSIsIm1ldGhvZCIsInRoZW4iLCJyZXNwb25zZSIsImRhdGEiLCJzdG9yaWVzIiwiY29udHJvbGxlciIsInN0b3J5IiwiY2hhcHRlciIsIiRpbmplY3QiLCJzZXJ2aWNlV29ya2VyIiwibmF2aWdhdG9yIiwicmVnaXN0ZXIiLCJzY29wZSIsInJlZyIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVsb2FkIiwiZXJyIiwiY29uc29sZSIsImxvZyIsImxpYnJhcmlhbiIsInZtIiwibnVtU3RvcmllcyIsImxlbmd0aCIsInN0b3JpZXNEZXRhaWxzIiwiZ2V0U3RvcnlEZXRhaWxzIiwic2VsZWN0ZWRTdG9yeSIsInN0b3J5QXJyYXkiLCJpIiwic3RvcnlEZXRhaWxzIiwidGl0bGUiLCJzeW5vcHNpcyIsImlkIiwicHVzaCIsImdldFNlbGVjdGVkU3RvcnkiLCJzZXRTZWxlY3RlZFN0b3J5IiwibnVtU2VsZWN0ZWQiLCJvcGVuQWRkIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNsYXNzTmFtZSIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsImFkZFN0b3J5IiwibmV3U3RvcnkiLCJ2YWx1ZSIsImNsb3NlUG9wVXAiLCJzdG9yeVZpZXciLCJnZXRTdG9yeVZpZXciLCJzZXRTdG9yeVZpZXciLCJuZXdWaWV3IiwiJHN0YXRlUGFyYW1zIiwiJHN0YXRlIiwic3RvcnlOYW1lIiwibmFtZSIsInN0b3J5U3lub3BzaXMiLCJjaGFwdGVycyIsInN0b3J5SUQiLCJsb2FkQ2hhcHRlckRhdGEiLCJmb3JEZWxldGlvbiIsImVkaXRlZENoYXB0ZXIiLCJjaGFwdGVySUQiLCJjaGFuZ2VEZXRhaWxzIiwidXBkYXRlU3RvcnkiLCJkZWxldGVJdGVtIiwidG9EZWxldGUiLCJzcGxpY2UiLCJ1cGRhdGVTdG9yaWVzIiwiZ28iLCJjaGFwdGVyTnVtIiwic3Vic3RyIiwicmVtb3ZlQ2hhcHRlciIsImNvbnRhaW5zIiwiY2hhbmdlQ2hhcHRlckRldGFpbHMiLCJudW1iZXIiLCJmb3JFYWNoIiwiaW5kZXgiLCJlZGl0Q2hhcHRlciIsImNoYW5nZVN0YXRlIiwib3BlbkFkZFBhbmVsIiwiYWRkQ2hhcHRlciIsIm51bUNoYXB0ZXIiLCJuZXdDaGFwdGVyIiwib3BlblJlbW92ZVBhbmVsIiwicXVlcnlTZWxlY3RvckFsbCIsImNsb3NlUmVtb3ZlUGFuZWwiLCJjaGFwdGVyTnVtYmVyIiwic2VydmljZSIsIm15U3RvcmllcyIsInVwZGF0ZWRTdG9yaWVzIiwiSlNPTiIsInN0cmluZ2lmeSIsInBvc3RUb0NhY2hlIiwidXBkYXRlZFN0b3J5IiwicG9zdE1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztBQU9BQSxPQUFPLENBQ05DLE1BREQsQ0FDUSxjQURSLEVBQ3dCLENBQUMsV0FBRCxDQUR4QixFQUVDQyxNQUZELENBRVEsQ0FBQyxnQkFBRCxFQUFtQixvQkFBbkIsRUFBeUMsVUFBU0MsY0FBVCxFQUF5QkMsa0JBQXpCLEVBQTZDQyxLQUE3QyxFQUFvRDtBQUNwR0QsRUFBQUEsa0JBQWtCLENBQUNFLFNBQW5CLENBQTZCLEdBQTdCLEVBRG9HLENBR3BHOztBQUNBSCxFQUFBQSxjQUFjLENBQUNJLEtBQWYsQ0FBcUIsTUFBckIsRUFBNkI7QUFDNUJDLElBQUFBLFdBQVcsRUFBRSx3QkFEZTtBQUU1QkMsSUFBQUEsR0FBRyxFQUFFLEdBRnVCO0FBRzVCQyxJQUFBQSxPQUFPLEVBQUU7QUFDUkMsTUFBQUEsUUFB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QUFMLENBSUlOLElBSkosQ0FJUyxVQUFTQyxRQUFULEVBQW1CO0FBQzFCLGFBQU9BLFFBQVEsQ0FBQ0MsSUFBaEI7QUFDQSxLQU5GLEVBSkQsQ0FZQzs7QUFDQWtCLElBQUFBLEVBQUUsQ0FBQ3dFLFdBQUg7QUFDQSxHQWZEO0FBaUJBOzs7Ozs7Ozs7O0FBUUEsT0FBS0EsV0FBTCxHQUFtQixZQUFXO0FBQzdCLFFBQUdwRixhQUFILEVBQWtCO0FBQ2pCQSxNQUFBQSxhQUFhLENBQUNKLFVBQWQsQ0FBeUIwRixXQUF6QixDQUFxQzFFLEVBQUUsQ0FBQ29FLFNBQXhDO0FBQ0E7QUFDRCxHQUpEO0FBS0QsQ0FwSHNCLENBRHZCIiwiZmlsZSI6ImFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5cdGFwcC5qc1xuXHRTdG9yeSBNYW5hZ2VyIE1vZHVsZVxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbmFuZ3VsYXJcbi5tb2R1bGUoJ1N0b3J5TWFuYWdlcicsIFsndWkucm91dGVyJ10pXG4uY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJywgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGh0dHApIHtcblx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXHRcblx0Ly9ob21lIHN0YXRlIChtYWluL2xpYnJhcnkgcGFnZSlcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG5cdFx0dGVtcGxhdGVVcmw6ICcvdmlld3MvbGlicmFyeU1nci5odG1sJyxcblx0XHR1cmw6ICcvJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRsb2FkRGF0YTogZnVuY3Rpb24oJGh0dHApIHtcblx0XHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC8nXG5cdFx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YS5zdG9yaWVzO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbnRyb2xsZXI6ICdsaWJyYXJ5Q3RybCBhcyBsaWJyYXJ5J1xuXHR9KTtcblx0XG5cdC8vYSBzdG9yeSdzIHBhZ2Vcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N0b3J5Jywge1xuXHRcdHRlbXBsYXRlVXJsOiAnL3ZpZXdzL3N0b3J5TWdyLmh0bWwnLFxuXHRcdHVybDogJy9zdG9yeS97aWR9Jyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRsb2FkRGF0YTogZnVuY3Rpb24oJGh0dHApIHtcblx0XHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS97aWR9J1xuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGEuc3Rvcnk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y29udHJvbGxlcjogJ3N0b3J5Q3RybCBhcyBzdG9yeSdcblx0fSk7XG5cdFxuXHQvL2Egc3RvcnkgZWRpdCBwYWdlXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdlZGl0Jywge1xuXHRcdHRlbXBsYXRlVXJsOiAnL3ZpZXdzL3N0b3J5RWRpdC5odG1sJyxcblx0XHR1cmw6ICcvc3Rvcnkve2lkfS9lZGl0LXN0b3J5Jyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRsb2FkRGF0YTogZnVuY3Rpb24oJGh0dHApIHtcblx0XHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS97aWR9J1xuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGEuc3Rvcnk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y29udHJvbGxlcjogJ3N0b3J5Q3RybCBhcyBzdG9yeSdcblx0fSk7XG5cdFxuXHQvL2EgY2hhcHRlciBlZGl0IHBhZ2Vcblx0Ly9jaGlsZCBvZiB0aGUgc3RvcnkgZWRpdCBwYWdlXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdlZGl0Q2hhcHRlcicsIHtcblx0XHR0ZW1wbGF0ZVVybDogJy92aWV3cy9jaGFwdGVyRWRpdC5odG1sJyxcblx0XHR1cmw6Jy9zdG9yeS97aWR9L2VkaXQtc3RvcnkvZWRpdC1jaGFwdGVyL3tjaGFwdGVySUR9Jyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRsb2FkRGF0YTogZnVuY3Rpb24oJGh0dHApIHtcblx0XHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS97aWR9L2NoYXB0ZXJzL3tjaGFwdGVySUR9J1xuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGEuY2hhcHRlcjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb250cm9sbGVyOiAnc3RvcnlDdHJsIGFzIHN0b3J5J1xuXHR9KTtcbn1dKTtcblxuYW5ndWxhclxuLm1vZHVsZSgnU3RvcnlNYW5hZ2VyJykuJGluamVjdCA9IFsnJGh0dHAnXTtcblxuLy8gcmVnaXN0ZXIgc2VydmljZSB3b3JrZXJcbnZhciBzZXJ2aWNlV29ya2VyO1xuaWYobmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIpXG5cdHtcblx0XHRuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcihcIi9zdy5qc1wiLCB7IHNjb3BlOiAnLycgfSkudGhlbihmdW5jdGlvbihyZWcpIHtcblx0XHRcdHNlcnZpY2VXb3JrZXIgPSByZWc7XG5cdFx0XHQvLyBpZiB0aGVyZSdzIG5vIHNlcnZpY2Ugd29ya2VyIGNvbnRyb2xsaW5nIHRoZSBwYWdlLCByZWxvYWQgdG8gbGV0IHRoZSBuZXcgc2VydmljZSB3b3JrZXIgdGFrZSBvdmVyXG5cdFx0XHRpZighbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIuY29udHJvbGxlcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcblx0XHRcdFx0fVxuXHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuXHRcdFx0Y29uc29sZS5sb2coZXJyKTtcblx0XHR9KTtcblx0fSIsIi8qXG5cdGxpYnJhcnlDdHJsLmpzXG5cdFN0b3J5IE1hbmFnZXIgQ29udHJvbGxlclxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbi8vbGlicmFyeSBjb250cm9sbGVyXG4vL2NvbnRhaW5zIGFsbCB0aGUgc3RvdHJpZXMnIGJhc2ljIGRhdGFcbmFuZ3VsYXIubW9kdWxlKFwiU3RvcnlNYW5hZ2VyXCIpXG5cdC5jb250cm9sbGVyKFwibGlicmFyeUN0cmxcIiwgWydsaWJyYXJpYW4nLCAnbG9hZERhdGEnLCBmdW5jdGlvbihsaWJyYXJpYW4sIGxvYWREYXRhKSB7XG5cdFx0Ly92YXJpYWJsZSBkZWNsYXJhdGlvblxuXHRcdHZhciB2bSA9IHRoaXM7XG5cdFx0dGhpcy5zdG9yaWVzID0gbG9hZERhdGE7XG5cdFx0dGhpcy5udW1TdG9yaWVzID0gbG9hZERhdGEubGVuZ3RoO1xuXHRcdHRoaXMuc3Rvcmllc0RldGFpbHMgPSBnZXRTdG9yeURldGFpbHMoKTtcblx0XHR0aGlzLnNlbGVjdGVkU3RvcnkgPSAwO1xuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogZ2V0U3RvcnlEZXRhaWxzKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogR2V0cyB0aGUgZGV0YWlscyBvZiBlYWNoIHN0b3J5IGZyb20gdGhlIGxvYWREYXRhIHJlc29sdmUgYW5kIGFkZHMgdGhlaXJcblx0XHRcdFx0XHRcdFx0XHR0aXRsZSBhbmQgc3lub3BzaXMgdG8gdGhlIHN0b3JpZXNEZXRhaWxzIGFycmF5ICh1c2VkIGJ5IHRoZSB0ZW1wbGF0ZSkuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0ZnVuY3Rpb24gZ2V0U3RvcnlEZXRhaWxzKClcblx0XHR7XG5cdFx0XHR2YXIgc3RvcnlBcnJheSA9IFtdOyBcblx0XHRcdFxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHZtLm51bVN0b3JpZXM7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHN0b3J5RGV0YWlscyA9IGxvYWREYXRhW2ldO1xuXHRcdFx0XHR2YXIgc3RvcnkgPSB7XG5cdFx0XHRcdFx0dGl0bGU6IHN0b3J5RGV0YWlscy50aXRsZSwgXG5cdFx0XHRcdFx0c3lub3BzaXM6IHN0b3J5RGV0YWlscy5zeW5vcHNpcyxcblx0XHRcdFx0XHRpZDogc3RvcnlEZXRhaWxzLmlkXG5cdFx0XHRcdH07XG5cdFx0XHRcdHN0b3J5QXJyYXkucHVzaChzdG9yeSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBzdG9yeUFycmF5O1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogZ2V0U2VsZWN0ZWRTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IFJldHVybnMgdGhlIG51bWJlciBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuZ2V0U2VsZWN0ZWRTdG9yeSA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHRyZXR1cm4gdm0uc2VsZWN0ZWRTdG9yeTtcblx0XHR9XG5cblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IHNldFNlbGVjdGVkU3RvcnkoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBTZXRzIHRoZSBudW1iZXIgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzdG9yeS5cblx0XHRQYXJhbWV0ZXJzOiBudW1TZWxlY3RlZCAtIG5ldyBzZWxlY3RlZCBzdG9yeS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5zZXRTZWxlY3RlZFN0b3J5ID0gZnVuY3Rpb24obnVtU2VsZWN0ZWQpXG5cdFx0e1xuXHRcdFx0dm0uc2VsZWN0ZWRTdG9yeSA9IG51bVNlbGVjdGVkO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IG9wZW5BZGQoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBPcGVucyB0aGUgXCJhZGQgc3RvcnlcIiBwb3B1cC5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLm9wZW5BZGQgPSBmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbEJveFwiKS5jbGFzc05hbWUgPSBcIm9uXCI7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvZmZcIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvblwiKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBhZGRTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEFkZHMgYSBuZXcgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5hZGRTdG9yeSA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHR2YXIgbmV3U3RvcnkgPSB7XG5cdFx0XHRcdFwiaWRcIjogdm0ubnVtU3RvcmllcyArIDEsXG5cdFx0XHRcdFwidGl0bGVcIjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9yeVRpdGxlXCIpLnZhbHVlLFxuXHRcdFx0XHRcInN5bm9wc2lzXCI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcnlTeW5vcHNpc1wiKS52YWx1ZSxcblx0XHRcdFx0XCJjaGFwdGVyc1wiOiBbXVxuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0dm0uc3Rvcmllcy5wdXNoKG5ld1N0b3J5KTtcblx0XHRcdGxpYnJhcmlhbi5hZGRTdG9yeShuZXdTdG9yeSwgdm0uc3Rvcmllcyk7XG5cdFx0XHRcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibW9kYWxCb3hcIikuY2xhc3NOYW1lID0gXCJvZmZcIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib2ZmXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGNsb3NlUG9wVXAoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBDbG9zZXMgdGhlIHBvcHVwIHdpdGhvdXQgYWRkaW5nIGEgbmV3IHN0b3J5LlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2xvc2VQb3BVcCA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib2ZmXCI7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9mZlwiKTtcblx0XHR9XG59XSk7IiwiLypcblx0c2V0dGluZ3NDdHJsLmpzXG5cdFN0b3J5IE1hbmFnZXIgQ29udHJvbGxlclxuXHRcblx0V3JpdHRlbiBieSBTaGlyIEJhciBMZXZcbiovXG5cbi8vY29udHJvbGxlciBmb3IgdGhlIHNldHRpbmdzIHBhZ2VcbmFuZ3VsYXIubW9kdWxlKFwiU3RvcnlNYW5hZ2VyXCIpXG5cdC5jb250cm9sbGVyKFwic2V0dGluZ3NDdHJsXCIsIFtmdW5jdGlvbigpIHtcblx0XHQvL2NoYXB0ZXJzIHZzIHBsb3QtbGluZXMgdmlld1xuXHRcdHZhciBzdG9yeVZpZXcgPSBcImNoYXB0ZXJzVmlld1wiO1xuXHRcdFxuXHRcdC8vZ2V0dGVyIGZvciB0aGUgc3RvcnlWaWV3XG5cdFx0dGhpcy5nZXRTdG9yeVZpZXcgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzdG9yeVZpZXc7XG5cdFx0fVxuXHRcdFxuXHRcdC8vc2V0dGVyIGZvciB0aGUgc3RvcnlWaWV3XG5cdFx0dGhpcy5zZXRTdG9yeVZpZXcgPSBmdW5jdGlvbihuZXdWaWV3KSB7XG5cdFx0XHRzdG9yeVZpZXcgPSBuZXdWaWV3O1xuXHRcdH1cblx0fV0pOyIsIi8qXG5cdHN0b3J5Q3RybC5qc1xuXHRTdG9yeSBNYW5hZ2VyIENvbnRyb2xsZXJcblx0XG5cdFdyaXR0ZW4gYnkgU2hpciBCYXIgTGV2XG4qL1xuXG4vL3N0b3J5IG1hbmFnZXIgY29udHJvbGxlclxuLy9jb250YWlucyB0aGUgY3VycmVudGx5IHZpZXdlZCBzdG9yeVxuYW5ndWxhci5tb2R1bGUoJ1N0b3J5TWFuYWdlcicpXG5cdC5jb250cm9sbGVyKCdzdG9yeUN0cmwnLCBbJyRzdGF0ZVBhcmFtcycsICdsaWJyYXJpYW4nLCAnbG9hZERhdGEnLCAnJHN0YXRlJywgZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCBsaWJyYXJpYW4sIGxvYWREYXRhLCAkc3RhdGUpIHtcblx0XHQvL3ZhcmlhYmxlIGRlY2xhcmF0aW9uXG5cdFx0dmFyIHZtID0gdGhpcztcblx0XHR0aGlzLnN0b3J5RGV0YWlscyA9IGxvYWREYXRhO1xuXHRcdHRoaXMuc3RvcnlOYW1lID0gdGhpcy5zdG9yeURldGFpbHMubmFtZTtcblx0XHR0aGlzLnN0b3J5U3lub3BzaXMgPSB0aGlzLnN0b3J5RGV0YWlscy5zeW5vcHNpcztcblx0XHR0aGlzLmNoYXB0ZXJzID0gdGhpcy5zdG9yeURldGFpbHMuY2hhcHRlcnM7XG5cdFx0dGhpcy5zdG9yeUlEID0gdGhpcy5zdG9yeURldGFpbHMuaWQ7XG5cdFx0dGhpcy5jaGFwdGVyID0gbG9hZENoYXB0ZXJEYXRhKCk7XG5cdFx0dGhpcy5mb3JEZWxldGlvbjtcblx0XHQvL3RoZSBjaGFwdGVyIGJlaW5nIGVkaXRlZC5cblx0XHR0aGlzLmVkaXRlZENoYXB0ZXIgPSAkc3RhdGVQYXJhbXMuY2hhcHRlcklEO1xuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogbG9hZENoYXB0ZXJEYXRhKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQ2hlY2tzIHRvIHNlZSB3aGV0aGVyIHRoZSBjdXJyZW50IHBhZ2UgaGFzIGEgXCJjaGFwdGVySURcIiB2YWx1ZSxcblx0XHRcdFx0XHRcdFx0d2hpY2ggbWVhbnMgaXQncyBhIGNoYXB0ZXItZWRpdCBwYWdlLiBJZiBpdCBpcywgZmV0Y2hlcyB0aGUgZGF0YVxuXHRcdFx0XHRcdFx0XHRvZiB0aGUgY2hhcHRlciBiZWluZyBlZGl0ZWQgZm9yIHRoZSB0ZW1wbGF0ZSB0byBmaWxsIGluLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdGZ1bmN0aW9uIGxvYWRDaGFwdGVyRGF0YSgpIHtcblx0XHRcdGlmKCRzdGF0ZVBhcmFtcy5jaGFwdGVySUQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdm0uY2hhcHRlcnNbJHN0YXRlUGFyYW1zLmNoYXB0ZXJJRCAtIDFdO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogY2hhbmdlRGV0YWlscygpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IENoYW5nZXMgdGhlIG5hbWUgYW5kIHN5bm9wc2lzIG9mIHRoZSBzdG9yeS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmNoYW5nZURldGFpbHMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZtLnN0b3J5TmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcnlUaXRsZVwiKS52YWx1ZTtcblx0XHRcdHZtLnN0b3J5U3lub3BzaXMgPSAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9yeVN5bm9wc2lzXCIpLnZhbHVlO1xuXHRcdFx0dm0uc3Rvcmllc1t2bS5zdG9yeUlELTFdLm5hbWUgPSB2bS5zdG9yeU5hbWU7XG5cdFx0XHR2bS5zdG9yaWVzW3ZtLnN0b3J5SUQtMV0uc3lub3BzaXMgPSB2bS5zdG9yeVN5bm9wc2lzO1xuXHRcdFx0XG5cdFx0XHRsaWJyYXJpYW4udXBkYXRlU3Rvcnkodm0uc3RvcnlEZXRhaWxzKTtcblx0XHR9O1xuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogZGVsZXRlSXRlbSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IE9wZW5zIGEgcG9wdXAgdG8gY29uZmlybSB3aGV0aGVyIHRvIGRlbGV0ZSB0aGUgc2VsZWN0ZWQgaXRlbS5cblx0XHRQYXJhbWV0ZXJzOiB0b0RlbGV0ZSAtIHRoZSBpdGVtIHdoaWNoIG5lZWRzIHRvIGJlIGRlbGV0ZWQuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuZGVsZXRlSXRlbSA9IGZ1bmN0aW9uKHRvRGVsZXRlKSB7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib25cIjtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9mZlwiKTtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlUG9wVXBcIikuY2xhc3NMaXN0LmFkZChcIm9uXCIpO1xuXHRcdFx0aWYodHlwZW9mIHRvRGVsZXRlICE9IFwic3RyaW5nXCIpXG5cdFx0XHRcdHZtLmZvckRlbGV0aW9uID0gXCJBbGwgY2hhcHRlcnNcIjtcblx0XHRcdGVsc2Vcblx0XHRcdFx0dm0uZm9yRGVsZXRpb24gPSB0b0RlbGV0ZTtcblx0XHR9O1xuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogZGVsZXRlKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogRGVsZXRlcyB3aGF0ZXZlciB0aGUgdXNlciBhc2tlZCB0byBkZWxldGUuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5kZWxldGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdC8vaWYgdGhlIHVzZXIgcmVxdWVzdGVkIHRvIGRlbGV0ZSB0aGUgc3Rvcnlcblx0XHRcdGlmKHZtLmZvckRlbGV0aW9uID09IHZtLnN0b3J5TmFtZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZtLnN0b3JpZXMuc3BsaWNlKHZtLnN0b3J5SUQtMSwgMSk7XG5cdFx0XHRcdFx0bGlicmFyaWFuLnVwZGF0ZVN0b3JpZXModm0uc3Rvcmllcyk7XG5cdFx0XHRcdFx0JHN0YXRlLmdvKFwiaG9tZVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0Ly9pZiB0aGUgdXNlciByZXF1ZXN0ZWQgdG8gZGVsZXRlIGFsbCB0aGUgY2hhcHRlcnNcblx0XHRcdGVsc2UgaWYodm0uZm9yRGVsZXRpb24gPT0gXCJBbGwgY2hhcHRlcnNcIilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZtLmNoYXB0ZXJzID0gW107XG5cdFx0XHRcdFx0dm0uc3Rvcmllc1t2bS5zdG9yeUlELTFdLmNoYXB0ZXJzID0gW107XG5cdFx0XHRcdFx0bGlicmFyaWFuLnVwZGF0ZVN0b3JpZXModm0uc3Rvcmllcyk7XG5cdFx0XHRcdH1cblx0XHRcdC8vaWYgaXQncyBub3QgZWl0aGVyIG9mIHRob3NlLCB0aGUgdXNlciByZXF1ZXN0ZWQgdG8gZGVsZXRlIGEgY2hhcHRlclxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGNoYXB0ZXJOdW0gPSB2bS5mb3JEZWxldGlvbi5zdWJzdHIoOCwxKTtcblx0XHRcdFx0XHR2bS5yZW1vdmVDaGFwdGVyKGNoYXB0ZXJOdW0pO1xuXHRcdFx0XHR9XG5cdFx0fTtcblx0XHRcblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGNsb3NlUG9wVXAoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBBYm9ydHMgZGVsZXRpb24gYW5kIGNsb3NlcyB0aGUgcG9wdXAuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5jbG9zZVBvcFVwID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib2ZmXCI7XG5cdFx0XHRcblx0XHRcdC8vaWYgdGhlIGRlbGV0ZSBwb3B1cCBpcyB0aGUgb25lIGZyb20gd2hpY2ggdGhlIGZ1bmN0aW9uIHdhcyBjYWxsZWQsIHRoZSBmdW5jdGlvbiBoaWRlcyBcblx0XHRcdC8vaXQuXG5cdFx0XHRpZihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZVBvcFVwXCIpLmNsYXNzTGlzdC5jb250YWlucyhcIm9uXCIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGVQb3BVcFwiKS5jbGFzc0xpc3QuYWRkKFwib2ZmXCIpO1xuXHRcdFx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlUG9wVXBcIikuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHQvL2lmIGl0IHdhc24ndCB0aGUgZGVsZXRlIHBvcHVwLCBpdCB3YXMgdGhlIFwiYWRkXCIgcG9wdXAsIHNvIHRoZSBmdW5jdGlvblxuXHRcdFx0Ly9oaWRlcyBpdCBpbnN0ZWFkXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvZmZcIik7XG5cdFx0XHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRQb3BVcFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwib25cIik7XG5cdFx0XHRcdH1cblx0XHR9O1xuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogY2hhbmdlQ2hhcHRlckRldGFpbHMoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBDaGFuZ2VzIHRoZSBuYW1lIGFuZCBzeW5vcHNpcyBvZiB0aGUgc2VsZWN0ZWQgY2hhcHRlci5cblx0XHRQYXJhbWV0ZXJzOiBOb25lXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuY2hhbmdlQ2hhcHRlckRldGFpbHMgPSBmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIGNoYXB0ZXJJRCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlcklEXCIpLnZhbHVlO1xuXHRcdFx0dmFyIGVkaXRlZENoYXB0ZXIgPSAge1xuXHRcdFx0XHRpZDogY2hhcHRlcklELFxuXHRcdFx0XHRudW1iZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2hhcHRlck51bVwiKS52YWx1ZSwgXG5cdFx0XHRcdHRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJUaXRsZVwiKS52YWx1ZSwgXG5cdFx0XHRcdHN5bm9wc2lzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJTeW5vcHNpc1wiKS52YWx1ZVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvL2lmIHRoZSBjaGFwdGVyJ3MgbnVtYmVyIHdhc24ndCBjaGFuZ2VkXG5cdFx0XHRpZihlZGl0ZWRDaGFwdGVyLm51bWJlciA9PSB2bS5jaGFwdGVyLm51bWJlciAmJiBlZGl0ZWRDaGFwdGVyLmlkID09IHZtLmNoYXB0ZXIuaWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2bS5jaGFwdGVyLm5hbWUgPSBlZGl0ZWRDaGFwdGVyLnRpdGxlO1xuXHRcdFx0XHRcdHZtLmNoYXB0ZXIuc3lub3BzaXMgPSBlZGl0ZWRDaGFwdGVyLnN5bm9wc2lzO1xuXHRcdFx0XHRcdHZtLmNoYXB0ZXJzW3ZtLmNoYXB0ZXIubnVtYmVyLTFdID0gZWRpdGVkQ2hhcHRlcjtcblx0XHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly9jaGVja3Mgd2hldGhlciB0aGVyZSdzIGFscmVhZHkgYSBjaGFwdGVyIHRoZXJlXG5cdFx0XHRcdFx0Ly9pZiB0aGVyZSBpcywgcHV0IGl0IGluIHRoZSBuZXcgbG9jYXRpb24gYW5kIG1vdmUgYWxsIGNoYXB0ZXJzIGZyb20gdGhlcmUgb24gZm9yd2FyZFxuXHRcdFx0XHRcdGlmKHZtLmNoYXB0ZXJzW3ZtLmNoYXB0ZXIubnVtYmVyLTFdKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHR2bS5jaGFwdGVycy5zcGxpY2Uodm0uY2hhcHRlci5udW1iZXItMSwgMCwgZWRpdGVkQ2hhcHRlcik7XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHR2bS5jaGFwdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNoYXB0ZXIsIGluZGV4KSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYoaW5kZXggPiB2bS5jaGFwdGVyLm51bWJlcilcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hhcHRlci5udW1iZXIgPSBpbmRleCArIDE7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vaWYgdGhlcmUgaXNuJ3Rcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHZtLmNoYXB0ZXJzW3ZtLmNoYXB0ZXIubnVtYmVyLTFdLm51bWJlciA9IGVkaXRlZENoYXB0ZXIubnVtYmVyO1xuXHRcdFx0XHRcdFx0XHR2bS5jaGFwdGVyc1t2bS5jaGFwdGVyLm51bWJlci0xXS5uYW1lID0gZWRpdGVkQ2hhcHRlci50aXRsZTtcblx0XHRcdFx0XHRcdFx0dm0uY2hhcHRlcnNbdm0uY2hhcHRlci5udW1iZXItMV0uc3lub3BzaXMgPSBlZGl0ZWRDaGFwdGVyLnN5bm9wc2lzO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdHZtLnN0b3J5RGV0YWlscy5jaGFwdGVycyA9IHZtLmNoYXB0ZXJzO1xuXHRcdFx0bGlicmFyaWFuLmVkaXRDaGFwdGVyKGVkaXRlZENoYXB0ZXIsIHZtLnN0b3J5SUQpO1xuXHRcdFx0XG5cdFx0XHR2bS5jaGFuZ2VTdGF0ZSgpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IGNoYW5nZVN0YXRlKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogT25jZSB0aGUgdXNlciBpcyBkb25lIHVwZGF0aW5nIHRoZSBjaGFwdGVyLCBzZW5kcyB0aGUgdXNlciBiYWNrIHRvIHRoZVxuXHRcdFx0XHRcdFx0XHRzdG9yeSBwYWdlLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmVcblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHN0YXRlLmdvKCdzdG9yeScsIHtpZDogdm0uc3RvcnlJRH0pO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IG9wZW5BZGRQYW5lbCgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IE9wZW5zIHRoZSBwYW5lbCBhbGxvd2luZyB0aGUgdXNlciB0byBpbnNlcnQgdGhlIGRldGFpbHMgZm9yIHRoZSBuZXdcblx0XHRcdFx0XHRcdFx0Y2hhcHRlci5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLm9wZW5BZGRQYW5lbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbEJveFwiKS5jbGFzc05hbWUgPSBcIm9uXCI7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvZmZcIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvblwiKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBhZGRDaGFwdGVyKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQWRkcyBhIG5ldyBjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IE5vbmUuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuYWRkQ2hhcHRlciA9IGZ1bmN0aW9uKClcblx0XHR7XG5cdFx0XHQvL2NoZWNrcyB3aGV0aGVyIGEgbnVtYmVyIHdhcyBlbnRlcmVkIGZvciBjaGFwdGVyIG51bWJlclxuXHRcdFx0Ly9pZiB0aGVyZSB3YXMsIHBsYWNlcyB0aGUgY2hhcHRlciBpbiB0aGUgZ2l2ZW4gcGxhY2Vcblx0XHRcdC8vaXQgdGhlcmUgd2Fzbid0LCBzaW1wbHkgYWRkcyBpdCBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGNoYXB0ZXJzIGFycmF5XG5cdFx0XHR2YXIgbnVtQ2hhcHRlciA9IChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJJRFwiKS52YWx1ZSkgPyAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVySURcIikudmFsdWUpIDogKHZtLmNoYXB0ZXJzLmxlbmd0aCArIDEpO1xuXHRcdFx0dmFyIG5ld0NoYXB0ZXIgPSB7XG5cdFx0XHRcdFx0bnVtYmVyOiBudW1DaGFwdGVyLCBcblx0XHRcdFx0XHR0aXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGFwdGVyVGl0bGVcIikudmFsdWUsIFxuXHRcdFx0XHRcdHN5bm9wc2lzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNoYXB0ZXJTeW5vcHNpc1wiKS52YWx1ZVxuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vY2hlY2tzIGlmIHRoZXJlJ3MgYWxyZWFkeSBhIGNoYXB0ZXIgdGhlcmVcblx0XHRcdC8vaWYgdGhlcmUgaXNcblx0XHRcdGlmKHZtLmNoYXB0ZXJzW251bUNoYXB0ZXItMV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2bS5jaGFwdGVycy5zcGxpY2UobnVtQ2hhcHRlci0xLCAwLCBuZXdDaGFwdGVyKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR2bS5jaGFwdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNoYXB0ZXIsIGluZGV4KSB7XG5cdFx0XHRcdFx0XHRjaGFwdGVyLm51bWJlciA9IGluZGV4ICsgMTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0Ly9pZiB0aGVyZSBpc24ndFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly9hZGRzIHRoZSBjaGFwdGVyIHRvIHRoZSBhcnJheSBpbiB0aGUgc3RvcnkgY29udHJvbGxlciBhbmQgc2VuZHMgaXQgdG8gdGhlIGxpYnJhcmlhblxuXHRcdFx0XHRcdHZtLmNoYXB0ZXJzLnB1c2gobmV3Q2hhcHRlcik7XG5cdFx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dm0uc3RvcnlEZXRhaWxzLmNoYXB0ZXJzID0gdm0uY2hhcHRlcnM7XG5cdFx0XHRsaWJyYXJpYW4uYWRkQ2hhcHRlcihuZXdDaGFwdGVyLCB2bS5zdG9yeUlEKTtcblx0XHRcdFxuXHRcdFx0Ly9yZW1vdmVzIHRoZSBtb2RhbCBib3ggYW5kIHBvcHVwXG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1vZGFsQm94XCIpLmNsYXNzTmFtZSA9IFwib2ZmXCI7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5hZGQoXCJvZmZcIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZFBvcFVwXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvblwiKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBvcGVuUmVtb3ZlUGFuZWwoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBPcGVucyB0aGUgcGFuZWwgYWxsb3dpbmcgdGhlIHVzZXIgdG8gY2hvb3NlIHdoaWNoIGNoYXB0ZXJzIHRvIGRlbGV0ZS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLm9wZW5SZW1vdmVQYW5lbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5yZW1vdmVcIikuZm9yRWFjaChmdW5jdGlvbihjaGFwdGVyKSB7XG5cdFx0XHRcdGNoYXB0ZXIuY2xhc3NMaXN0LmFkZChcIm9uXCIpO1xuXHRcdFx0XHRjaGFwdGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJvZmZcIik7XG5cdFx0XHR9KVxuXHRcdFx0XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvbmVCdG5cIikuY2xhc3NMaXN0LmFkZChcIm9uXCIpO1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkb25lQnRuXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJvZmZcIik7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogY2xvc2VSZW1vdmVQYW5lbCgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IENsb3NlcyB0aGUgcGFuZWwgYWxsb3dpbmcgdGhlIHVzZXIgdG8gY2hvb3NlIHdoaWNoIGNoYXB0ZXJzIHRvIGRlbGV0ZS5cblx0XHRQYXJhbWV0ZXJzOiBOb25lLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmNsb3NlUmVtb3ZlUGFuZWwgPSBmdW5jdGlvbigpIHtcblx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucmVtb3ZlXCIpLmZvckVhY2goZnVuY3Rpb24oY2hhcHRlcikge1xuXHRcdFx0XHRjaGFwdGVyLmNsYXNzTGlzdC5hZGQoXCJvZmZcIik7XG5cdFx0XHRcdGNoYXB0ZXIuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdFx0fSlcblx0XHRcdFxuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkb25lQnRuXCIpLmNsYXNzTGlzdC5hZGQoXCJvZmZcIik7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvbmVCdG5cIikuY2xhc3NMaXN0LnJlbW92ZShcIm9uXCIpO1xuXHRcdH1cblx0XHRcblx0XHQvKlxuXHRcdEZ1bmN0aW9uIE5hbWU6IHJlbW92ZUNoYXB0ZXIoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBEZWxldGVzIGEgY2hhcHRlci5cblx0XHRQYXJhbWV0ZXJzOiBjaGFwdGVyTnVtYmVyIC0gbnVtYmVyIG9mIHRoZSBjaGFwdGVyIHRvIGRlbGV0ZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5yZW1vdmVDaGFwdGVyID0gZnVuY3Rpb24oY2hhcHRlck51bWJlcilcblx0XHR7XG5cdFx0XHR2bS5jaGFwdGVycy5zcGxpY2UoY2hhcHRlck51bWJlciwgMSk7XG5cdFx0XHR2bS5zdG9yaWVzW3ZtLnN0b3J5SUQtMV0uY2hhcHRlcnMgPSB2bS5jaGFwdGVycztcblx0XHRcdGxpYnJhcmlhbi51cGRhdGVTdG9yaWVzKHZtLnN0b3JpZXMpO1xuXHRcdH1cbn1dKTsiLCIvKlxuXHRsaWJyYXJpYW4uanNcblx0U3RvcnkgTWFuYWdlciBTZXJ2aWNlXG5cdFxuXHRXcml0dGVuIGJ5IFNoaXIgQmFyIExldlxuKi9cblxuLy9saWJyYXJpYW4gc2VydmljZSB0byBkZWFsIHdpdGggZXhwb3J0aW5nIHRoZSBjaGFuZ2VzIHRoZSB1c2VyIG1ha2VzIHRvIHRoZWlyIHN0b3JpZXNcbmFuZ3VsYXIubW9kdWxlKCdTdG9yeU1hbmFnZXInKVxuXHQuc2VydmljZSgnbGlicmFyaWFuJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XG5cdFx0Ly92YXJpYWJsZSBkZWNsYXJhdGlvblxuXHRcdHZhciB2bSA9IHRoaXM7XG5cdFx0dGhpcy5teVN0b3JpZXMgPSB7XG5cdFx0XHRzdG9yaWVzOiBbXVxuXHRcdH07XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBhZGRTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IEFkZHMgYSBuZXcgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogc3RvcnkgLSB0aGUgbmV3IHN0b3J5LiBcblx0XHRcdFx0XHRcdFx0ICAgdXBkYXRlZFN0b3JpZXMgLSB0aGUgdXBkYXRlZCBzdG9yaWVzIGFycmF5IChpbmNsdWRpbmcgdGhlIG5ldyBzdG9yeSkuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuYWRkU3RvcnkgPSBmdW5jdGlvbihzdG9yeSwgdXBkYXRlZFN0b3JpZXMpXG5cdFx0e1xuXHRcdFx0JGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMC8nLFxuXHRcdFx0XHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KHN0b3J5KVxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHR2bS5teVN0b3JpZXMuc3RvcmllcyA9IHVwZGF0ZWRTdG9yaWVzO1xuXHRcdFx0dm0ucG9zdFRvQ2FjaGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiB1cGRhdGVTdG9yeSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IFVwZGF0ZXMgYW4gZXhpc3Rpbmcgc3RvcnkuXG5cdFx0UGFyYW1ldGVyczogdXBkYXRlZFN0b3J5IC0gVXBkYXRlZCBzdG9yeSBkYXRhLlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLnVwZGF0ZVN0b3J5ID0gZnVuY3Rpb24odXBkYXRlZFN0b3J5KVxuXHRcdHtcblx0XHRcdHZtLm15U3Rvcmllcy5zdG9yaWVzW3VwZGF0ZWRTdG9yeS5pZC0xXSA9IHVwZGF0ZWRTdG9yeTtcblx0XHRcdFxuXHRcdFx0Ly8gU2VuZHMgdGhlIG5ldyBzdG9yeSB0byB0aGUgc2VydmVyXG5cdFx0XHQkaHR0cCh7XG5cdFx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdFx0dXJsOiBgaHR0cDovL2xvY2FsaG9zdDo1MDAwL3N0b3J5LyR7dXBkYXRlZFN0b3J5LmlkfWAsXG5cdFx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkodXBkYXRlZFN0b3J5KVxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGVzIHRoZSBzZXJ2aWNlIHdvcmtlclxuXHRcdFx0dm0ucG9zdFRvQ2FjaGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBhZGRDaGFwdGVyKClcblx0XHRGdW5jdGlvbiBEZXNjcmlwdGlvbjogQWRkcyBhIG5ldyBjaGFwdGVyLlxuXHRcdFBhcmFtZXRlcnM6IGNoYXB0ZXIgLSB0aGUgbmV3IGNoYXB0ZXIuXG5cdFx0XHRcdFx0XHRcdCAgIHN0b3J5SUQgLSB0aGUgSUQgb2YgdGhlIHN0b3J5LlxuXHRcdC0tLS0tLS0tLS0tLS0tLS1cblx0XHRQcm9ncmFtbWVyOiBTaGlyIEJhciBMZXYuXG5cdFx0Ki9cblx0XHR0aGlzLmFkZENoYXB0ZXIgPSBmdW5jdGlvbihjaGFwdGVyLCBzdG9yeUlEKVxuXHRcdHtcblx0XHRcdHZtLm15U3Rvcmllcy5zdG9yaWVzW3N0b3J5SUQtMV0uY2hhcHRlcnMucHVzaChjaGFwdGVyKTtcblx0XHRcdFxuXHRcdFx0Ly8gU2VuZHMgdGhlIG5ldyBjaGFwdGVyIHRvIHRoZSBzZXJ2ZXJcblx0XHRcdCRodHRwKHtcblx0XHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdFx0XHR1cmw6IGBodHRwOi8vbG9jYWxob3N0OjUwMDAvc3RvcnkvJHtzdG9yeUlEfWAsXG5cdFx0XHRcdFx0ZGF0YTogSlNPTi5zdHJpbmdpZnkoY2hhcHRlcilcblx0XHRcdFx0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0Ly8gVXBkYXRlcyB0aGUgc2VydmljZSB3b3JrZXJcblx0XHRcdHZtLnBvc3RUb0NhY2hlKCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8qXG5cdFx0RnVuY3Rpb24gTmFtZTogZWRpdENoYXB0ZXIoKVxuXHRcdEZ1bmN0aW9uIERlc2NyaXB0aW9uOiBFZGl0cyBhIGNoYXB0ZXIuXG5cdFx0UGFyYW1ldGVyczogY2hhcHRlciAtIHRoZSBuZXcgY2hhcHRlci5cblx0XHRcdFx0XHRcdFx0ICAgc3RvcnlJRCAtIHRoZSBJRCBvZiB0aGUgc3RvcnkuXG5cdFx0LS0tLS0tLS0tLS0tLS0tLVxuXHRcdFByb2dyYW1tZXI6IFNoaXIgQmFyIExldi5cblx0XHQqL1xuXHRcdHRoaXMuZWRpdENoYXB0ZXIgPSBmdW5jdGlvbihjaGFwdGVyLCBzdG9yeUlEKVxuXHRcdHtcblx0XHRcdHZtLm15U3Rvcmllcy5zdG9yaWVzW3N0b3J5SUQtMV0uY2hhcHRlcnNbY2hhcHRlci5udW1iZXItMV0gPSBjaGFwdGVyO1xuXHRcdFx0XG5cdFx0XHQvLyBTZW5kcyB0aGUgbmV3IGNoYXB0ZXIgdG8gdGhlIHNlcnZlclxuXHRcdFx0JGh0dHAoe1xuXHRcdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0XHRcdHVybDogYGh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9zdG9yeS8ke3N0b3J5SUR9L2NoYXB0ZXJzLyR7Y2hhcHRlci5udW1iZXJ9YCxcblx0XHRcdFx0XHRkYXRhOiBKU09OLnN0cmluZ2lmeShjaGFwdGVyKVxuXHRcdFx0XHR9KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGVzIHRoZSBzZXJ2aWNlIHdvcmtlclxuXHRcdFx0dm0ucG9zdFRvQ2FjaGUoKTtcblx0XHR9XG5cdFx0XG5cdFx0Lypcblx0XHRGdW5jdGlvbiBOYW1lOiBwb3N0VG9DYWNoZSgpXG5cdFx0RnVuY3Rpb24gRGVzY3JpcHRpb246IFNlbmRzIHRoZSB1cGRhdGVkIHN0b3JpZXMgb2JqZWN0IHRvIHRoZSBTZXJ2aWNlIFdvcmtlciBzbyB0aGV5XG5cdFx0XHRcdFx0XHRcdGNhbiBiZSBjYWNoZWQuXG5cdFx0UGFyYW1ldGVyczogTm9uZS5cblx0XHQtLS0tLS0tLS0tLS0tLS0tXG5cdFx0UHJvZ3JhbW1lcjogU2hpciBCYXIgTGV2LlxuXHRcdCovXG5cdFx0dGhpcy5wb3N0VG9DYWNoZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoc2VydmljZVdvcmtlcikge1xuXHRcdFx0XHRzZXJ2aWNlV29ya2VyLmNvbnRyb2xsZXIucG9zdE1lc3NhZ2Uodm0ubXlTdG9yaWVzKTtcblx0XHRcdH1cblx0XHR9XG59XSk7Il19
