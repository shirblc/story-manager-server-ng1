from flask import Flask, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

# Database configuration
databate_username = os.environ.get('DBUSERNAME')
database_name = 'story_manager'
database_path = 'postgres://{}@localhost:5432/{}'.format(databate_username, databate_name)

db = SQLAlchemy()

# Database setup
def database_setup(app):
	app.config["SQLALCHEMY_DATABASE_URI"] = database_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    migrate = Migrate(app, db)

# Models
# -----------------------------------------------------------------
# Story Model
class Story(db.Model):
    __tablename__ = 'stories'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    synopsis = db.Column(db.String(240))
    chapters = db.relationship('Chapter', backref='story_id')

    # Get formatted story
    def format(self):
        story = {}
        story['id'] = self.id
        story['title'] = self.title
        story['synopsis'] = self.synopsis
        story['chapters'] = []

        # Format the story's chapters
        for chapter in self.chapters:
            story['chapters'].append({
                'id': chapter.id,
                'number': chapter.number,
                'title': chapter.title,
                'synopsis': chapter.synopsis
            })

        return story

# Chapter Model
class Chapter(db.Model):
    __tablename__ = 'chapters'
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer)
    title = db.Column(db.String(120), nullable=False)
    synopsis = db.Column(db.String(240))
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'))

    # Get formatted chapter
    def format(self):
        chapter = {}
        chapter['id'] = self.id
        chapter['number'] = self.number
        chapter['title'] = self.title
        chapter['synopsis'] = self.synopsis

        return chapter


# Database management methods
# -----------------------------------------------------------------
# Method: Insert
# Description: Inserts a new record into the database.
# Parameters: Object to insert (either story or chapter).
def insert(obj):
	add_obj = {}
	
	# Try to add the object to the database
	try:
		db.session.add(obj)
		db.session.commit()
		added_obj = obj.format()
	# If there's an error, abort and rollback
	except Exception as e:
		db.session.rollback()
	# Close the connection either way
	finally:
		db.session.close()
		
	return jsonify({
		'success': True,
		'added': added_obj
	})


# Method: Update
# Description: Updates an existing database record.
# Parameters: Object to update (either story or chapter).
def update(obj):
	updated_obj = {}
	
	# Try to update the object's data in the database
	try:
		db.session.add(obj)
		db.session.commit()
		updated_obj = obj.format()
	# If there's an error, abort and rollback
	except Exception as e:
		db.session.rollback()
	# Close the connection either way
	finally:
		db.session.close()
	
	return jsonify({
		'success': True,
		'updated': updated_obj
	})


# Method: Delete_single
# Description: Deletes a single object from the database.
# Parameters: ID and type of the object to delete.
def delete_single(obj_type, obj_id):
	to_delete = {}
	
	# Checks whether the object the user is trying to delete is a story or a chapter
	if(obj_type is 'Story'):
		to_delete = db.session.query(Story).filter(Story.id == obj_id).one_or_none()
	else:
		to_delete = db.session.query(Chapter).filter(Chapter.id == obj_id).one_or_none()
	
	# If there's no record with that ID
	if(to_delete is None):
		abort(404)
	
	# Try to update the object's data in the database
	try:
		db.session.delete(to_delete)
		db.session.commit()
	# If there's an error, abort and rollback
	except Exception as e:
		db.session.rollback()
	# Close the connection either way
	finally:
		db.session.close()
	
	return jsonify({
		'success': True,
		'deleted': obj_id
	})


# Method: delete_all
# Description: Deletes all fitting objects (a story's chapters or all stories) from the database.
# Parameters: Type of the object to delete; Story ID if the object to delete is a story's chapters.
def delete_all(obj_type, story_id=None):
	# If the user asked to delete all stories
	if(obj_type is 'Story'):
		# Try to delete all stories and chapters
		try:
			db.session.query(Story).delete()
			db.session.query(Chapter).delete()
			db.session.commit()
		# If there's an error, rollback
		except Exception as e:
			db.session.rollback()
		# Close the connection either way
		finally:
			db.session.close()
	# Otherwise the user asked to delete all chapters of the currently open story
	else:
		# Try to delete all the chapters of selected story
		try:
			db.session.query(Chapter).filter(Chapter.story_id == story_id).delete()
			db.session.commit()
		# If there's an error, rollback
		except Exception as e:
			db.session.rollback()
		# Close the connection either way
		finally:
			db.session.close()
			
	return jsonify({
		'success': True,
		'story_id': story_id
	})