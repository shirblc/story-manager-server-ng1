from flask import Flask, request, jsonify, abort
from flask_cors import CORS

from models import database_setup, Story, Chapter, insert, update, delete_single, delete_all

# Create Flask app
def create_app():
    app = Flask('__name__')
    database_setup(app)
    CORS(app)

    # Adds CORS headers
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')

        return response

    # Format and paginate stories
    def paginate_stories(stories, current_page):
        stories_per_page = 10
        start_index = stories_per_page * (current_page - 1)
        formatted_stories = []

        for story in stories:
            formatted_story = {
                'id': story.id,
                'title': story.title,
                'synopsis': story.synopsis
            }
            formatted_stories.append(formatted_story)

        return formatted_stories[start_index:(start_index+9)]

    # Routes
    # -----------------------------------------------------------------
    # Endpoint: GET /
    # Description: Gets all stories in the library.
    # Parameters: None.
    @app.route('/')
    def index():
        stories = Story.query.all()
        current_page = request.args.get('page', 1, type=int)
        paginated_stories = paginate_stories(stories, current_page)

        return jsonify({
            'success': True,
            'stories': paginated_stories
        })

    # Endpoint: POST /
    # Description: Adds a new story to the library or updates an existing story.
    # Parameters: None.
    @app.route('/', methods=['POST'])
    def addStory():
        new_story_data = json.loads(request.data)
        new_story = Story(title=new_story_data['title'], synopsis=new_story_dat['synopsis'])

        # Try to add the new story
        try:
            insert(new_story)
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

    # Endpoint: POST /story/<story_id>
    # Description: Updates an existing story.
    # Parameters: story_id - the ID of the story to update.
    @app.route('/story/<story_id>', methods=['POST'])
    def edit_story(story_id):
        new_story_details = json.loads(request.data)
        story_details = Story.query.filter(Story.id == new_story_data['id']).one_or_none()

        story_details.title = new_story_details['title']
        story_details.synopsis = new_story_details['synopsis']

        # Try to update the story
        try:
            update(story_details)
            formatted_story = story_details.format()
        except:
            abort(500)

        return jsonify({
            'success': True,
            'story': formatted_story
        })

    # Endpoint: GET /story/<story_id>/chapters/<chapter_id>
    # Description: Gets the details of a specific chapter within a story.
    # Parameters: story_id - the ID of the story to fetch.
    #             chapter_id - the ID of the chapter to fetch.
    @app.route('/story/<story_id>/chapters/<chapter_number>')
    def get_chapter(story_id, chapter_number):
        chapter = Chapter.query.filter(Chapter.story_id == story_id).filter(Chapter.number == chapter_number).one_or_none()

        # Checks whether this story has a chapter in that location
        if(chapter is None):
            abort(404)
        else:
            formatted_chapter = chapter.format()

        return jsonify({
            'success': True,
            'chapter': formatted_chapter
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
