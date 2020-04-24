from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()

# Database setup
def database_setup(app):
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
