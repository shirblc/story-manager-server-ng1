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

# Chapter Model
class Chapter(db.Model):
    __tablename__ = 'chapters'
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer)
    title = db.Column(db.String(120), nullable=False)
    synopsis = db.Column(db.String(240))
    story_id = db.Column(db.Integer, db.ForeignKey('stories.id'))
