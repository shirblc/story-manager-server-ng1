# Story Manager

## Version

Version 1 (currently in development).

Built using the [gulp-site-template](https://github.com/shirblc/gulp-site-template) repo.

## Desciption

A story manager app for writers to keep track of their current stories and plotlines. It's currently possible to set a story's basic details and the basic details for each chapter within it. You can create as many stories as you like.

The app utilises AngularJS for its build and the build tool Gulp for automated tasks.

## Requirements

- Node.js

## Installation and Usage

### Developers

1. Download or clone the repo.
2. cd into the project directory.
3. Run ```npm install``` to install dependencies.
4. Open index.html.

### Users

1. Download or clone the repo.
2. cd into the project directory.
3. cd into 'dist' directory.
4. Open index.html.

## Contents

The app contains a Story Manager module (in app.js), which contains two controllers for two templates:

1. **libraryMgr** + **libraryCtrl** - Displays the name and synopsis of each added story. Allows users to add and deletec stories.
2. **storyMgr** + **storyCtrl** - Displays the name and synopsis of each chapter within the currently open story. Allows users to edit a story's details, as well sa adding, deleting and editing chapters' details.
3. **settings** + **settingsCtrl** - Allows the users to change several of the app's settings. Still in development.

The app also contains a service, **librarian**, which is responsible for getting a story's or a library's data and posting changes to the JSON file containing the library information (data/stories.JSON).

## Dependencies

The site uses several tools to maximize compatibility:

1. **Gulp** - Gulp enables running tasks automatically. You can read more on the [Gulp website](https://gulpjs.com). Gulp is a Node.js tool, so it requires installing Node.
2. **Gulp-Postcss** with **Autoprefixer** Plugin - A Gulp plugin which adds the necessary browser prefixes to the CSS file. For more info check the [Gulp-postcss](https://www.npmjs.com/package/gulp-postcss) page and the [Autoprefixer](https://www.npmjs.com/package/autoprefixer) page on NPM.
3. **Gulp-Babel** - A Gulp plugin for the transpiler Babel. Converts the current ES version to the highly supported ES5. For more info check the plugin's [GitHub](https://github.com/babel/gulp-babel) repository.
4. **Gulp-Concat** - A Gulp plugin which combines all the ES5 JavaScript (Babel's output) files into one file. For more info check the [Gulp-concat](https://www.npmjs.com/package/gulp-concat) page on NPM.
5. **Gulp-Uglify** - A Gulp plugin which minimises the single JavaScript file (Concat's output). For more info check the [Gulp-uglify](https://www.npmjs.com/package/gulp-uglify) page on NPM.
6. **Gulp-Sourcemaps** - A Gulp plugin utilizing the source maps tool. For more info check the [Gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps) page on NPM.
7. **Gulp-order** - A gulp plugin to set the order in which the JavaScript files will be concatenated. For more info, check the [Gulp-order](https://github.com/sirlantis/gulp-order) GitHub page.
8. **Gulp-Jasmine-Browser** - A headless browser extension for the unit-testing tool Jasmine. The site also includes **Jasmine-core** and **Puppeteer** in order to execute Jasmine tests from the command line. For more info check the [Gulp-jasmine-browser](https://www.npmjs.com/package/gulp-jasmine-browser) page on NPM or the [Jasmine documentation](https://jasmine.github.io/) page.

## Known Issues

There are no current issues at the time.