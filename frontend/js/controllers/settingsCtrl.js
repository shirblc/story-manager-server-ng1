/*
	settingsCtrl.js
	Story Manager Controller
	
	Written by Shir Bar Lev
*/

//controller for the settings page
angular.module("StoryManager")
	.controller("settingsCtrl", [function() {
		//chapters vs plot-lines view
		var storyView = "chaptersView";
		
		//getter for the storyView
		this.getStoryView = function() {
			return storyView;
		}
		
		//setter for the storyView
		this.setStoryView = function(newView) {
			storyView = newView;
		}
	}]);