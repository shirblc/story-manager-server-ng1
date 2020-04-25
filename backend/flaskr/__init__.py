from flask import Flask, request, jsonify, abort

from models import database_setup, Story, Chapter, insert, update, delete_single, delete_all

# Create Flask app
def create_app():
    app = Flask('__name__')
    database_setup(app)

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

    # Endpoint: POST /
    # Description: Adds a new story to the library or updates an existing story.
    # Parameters: None.
    @app.route('/', methods=['POST'])
    def addStory():
        new_story_data = json.loads(request.data)
        story_details = Story.query.filter(Story.id == new_story_data['id']).one_or_none()

        # Check whether it's a new story or the user is trying to update an existing story
        # If the user is creating a new story
        if(story_details is None):
            new_story = Story(title=new_story_data['title'], synopsis=new_story_dat['synopsis'])
            # Try to add the new story
            try:
                insert(new_story)
            except:
                abort(500)
        # If the user is updating an existing story
        else:
            story_details.title = new_story_data['title']
            story_details.synopsis = new_story_data['synopsis']
            # Try to update the story
            try:
                update(story_details)
            except:
                abort(500)

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
    # Bad request error handler
    @app.errorhandler(400)
    def bad_request(error):
        jsonify({
            'success': False,
            'code': 400,
            'message': 'Bad request. Check your request format.'
        }), 400

    # Not found error handler
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'code': 404,
            'message': 'The resource you were looking for cannot be found.'
            }), 404

    # Unprocessable error handler
    @app.errorhandler(422)
    def unprocessable(error):
        return jsonify({
            'success': False,
            'code': 422,
            'message': 'Unprocessable request.'
            }), 422

    # Internal server error handler
    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            'success': False,
            'code': 500,
            'message': 'An internal server error occurred.'
        }), 500


    return app
