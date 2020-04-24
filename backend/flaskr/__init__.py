from flask import Flask, request, jsonify, abort

from models import db_setup, Story, Chapter

# Create Flask app
def create_app():
    app = Flask('__name__')

    # Routes
    # -----------------------------------------------------------------
    # Endpoint: GET /
    # Description: Gets all stories in the library.
    # Parameters: None.
    @app.route('/')
    def index():
        return jsonify({
            'success': True
        })

    # Endpoint: GET /story/<story_id>
    # Description: Gets the details of a specific story, including its chapters.
    # Parameters: story_id - the ID of the story to fetch.
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


    # Error Handlers
    # -----------------------------------------------------------------
    # Not found error handler
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'code': 404,
            'message': 'The resource you were looking for cannot be found.'
            }), 404


    return app
