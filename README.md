# Empty Site

## Version

Version 1.

## Desciption

An empty site template for any use. Comes fully equipped with Gulp and several of its plugins (see Dependencies) to make your workflow quicker.

**Important!** This version was built for Adobe Dreamweaver or Adobe Brackets users. Therefore it doesn't include several important tools:

1. Linting - Both Dreamweaver and Brackets have linting built into their interface, using the popular ESLint. As such, there was no need to install the Gulp-ESLint extension.
2. Live Editing - Both Dreamweaver and Brackets have Live Editing built into their interface (as "Real-time Preview". As such, there was no need to install the BrowserSync extension.
3. Sass - Both Dreamweaver and Brackets come with a build-in Sass/SCSS/Less conversion tool. As such, there was no need to install the Gulp-Sass extension.

## Contents

### Development Mode

The Developmnt Mode folder (parent folder) includes:

1. **CSS Folder** - For Sass files output.
2. **Sass Folder** - For the project's Sass files.
3. **JS Folder** - For all scripts.
4. **Node Modules Folder** - 
5. **IMG Folder** - For all images.
6. **Tests Folder** -
7. **Dist Folder** - See "Production Mode"

As well as the files:

1. **gulpfile.js** -
2. **index.html** -
3. **package.json** and **package-lock.json** -
4. **README.md** -

### Production Mode

To make it easier to prerpare for distribution, the site includes a seperate distribution folder, to the files are exported once they're run through Gulp. This is the "dist" folder.
The distribution folder already includes a CSS folder and a JS folder, for the site's CSS and JavaScript (respectively). A Gulp task deals particulalry with adding the photos folder and the index HTML file to the distribution folder every time they're changed.

## Dependencies

The site uses several tools to maximize compatibility:

1. **Gulp** - Gulp enables running tasks automatically. You can read more on the [Gulp website](https://gulpjs.com). Gulp is a Node.js tool, so it requires installing Node.
2. **Gulp-Autoprefixer** - A Gulp plugin which adds the necessary browser prefixes to the CSS file. For more info check the [Gulp-Autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer) page on NPM.
3. **Gulp-Babel** - A Gulp plugin for the transpiler Babel. Converts the current ES version to the highly supported ES5. For more info check the plugin's [GitHub](https://github.com/babel/gulp-babel) repository.
4. **Gulp-Concat** - A Gulp plugin which combines all the ES5 JavaScript (Babel's output) files into one file. For more info check the [Gulp-concat](https://www.npmjs.com/package/gulp-concat) page on NPM.
5. **Gulp-Uglify** - A Gulp plugin which minimises the single JavaScript file (Concat's output). For more info check the [Gulp-uglify](https://www.npmjs.com/package/gulp-uglify) page on NPM.
6. **Gulp-Sourcemaps** - A Gulp plugin utilizing the source maps tool. For more info check the [Gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps) page on NPM.