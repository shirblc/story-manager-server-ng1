from flask import Flask, request, jsonify, abort

from models import db_setup, Story, Chapter

# Create Flask app
def create_app():
    app = Flask('__name__')

    # Routes
    # -----------------------------------------------------------------
    # Home route
    @app.route('/')
    def index():
        return jsonify({
            'success': True
        })

    # Story route
    @app.route('/story/<story_id>')
    def get_story(story_id):
        story = Story.query.filter(Story.id == story_id).one_or_none()

        # If a story with this ID doesn't exist
        if(story is None):
            abort(404)
        else:
            formatted_story = story.format()

        return jsonify({
            'success': True,
            'story': formatted_story
        })


    return app
