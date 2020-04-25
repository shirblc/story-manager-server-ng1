# Story Manager

## Version

Version 1 (currently in development).

Built using the [gulp-site-template](https://github.com/shirblc/gulp-site-template) repo.

A version of the [story-manager](https://github.com/shirblc/story-manager) repo, including server-side programming and setup.

## Requirements

- Python 3

## Installation and Usage

### Developers

1. Download or clone the repo.
2. cd into the project directory.
3. cd into backend.
4. Run ```pip install -r requirements.txt``` to install dependencies.
5. Update the database URI to match your system.
  - The username is stored in an environment variable.
6. Run flask with:
  - ```export FLASK_APP=flaskr```
  - ```export FLASK_ENV=development``` (Recommended)
  - ```flask run```
7. Update your database using ```flask migrate upgrade```

### Users

**Not yet ready for users!**

## Contents

The app contains several files and folders:

1. **flaskr** - The folder containing the main application file (**__init__.py**). This file contains all endpoints and error handlers.
2. **Migrations** - The folder containing all database migrations.
3. **Models.py** - The file containing SQLAlchemy models, as well as all database-related methods.

## Dependencies

The site uses several tools to maximise compatibility:

1. **Flask** - Flask is a microframework used to build and run the local server on which the app is running. For full Flask documentation, try the [Flask website](https://flask.palletsprojects.com/en/1.1.x/). Flask is a Python framework, so it requires installing Python (or Python3).

2. **Flask-SQLAlchemy** - This application uses the SQLAlchemy ORM in order to interact with the database, using the Flask-SQLAlchemy extension. You can read more about SQLAlchemy (including API documentation) on the [SQLAlchemy website](https://docs.sqlalchemy.org/en/13/), and about Flask-SQLAlchemy on the [Flask-SQLAlchemy website](https://flask-sqlalchemy.palletsprojects.com/en/2.x/).

3. **Flask-Migrate** - This application uses Flask-Migrate in order to manage model versions. You can read more on the [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/) website.


## Known Issues

There are no current issues at the time.
