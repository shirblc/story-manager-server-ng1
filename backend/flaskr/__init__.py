from flask import Flask, request, jsonify, abort
from flask_cors import CORS

from models import database_setup, Story, Chapter, insert, update_chapters, delete_single, delete_all

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
    # Description: Adds a new story to the library.
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

    # Endpoint: PATCH /story/<story_id>
    # Description: Updates an existing story.
    # Parameters: story_id - the ID of the story to update.
    @app.route('/story/<story_id>', methods=['PATCH'])
    def update_story(story_id):
        updated_story = json.loads(request.data)
        story_details = Story.query.filter(Story.id == updated_story['id']).one_or_none()
        return_object = {}

        # If there's no story with that ID, abort
        if(story_details is None):
            abort(404)
        # Otherwise update the story
        else:
            story_details.title = updated_story['title']
            story_details.synopsis = updated_story['synopsis']

            # Try to update the database
            try:
                story_details.update()
                return_object = story_details.format()
            except:
                abort(500)

        return jsonify({
            'success': True,
            'story': return_object
        })

    # Endpoint: POST /story/<story_id>
    # Description: Adds a chapter to a story.
    # Parameters: story_id - the ID of the story to update.
    @app.route('/story/<story_id>', methods=['POST'])
    def add_chapter(story_id):
        new_chapter_data = json.loads(request.data)
        new_chapter = Chapter(number=new_chapter_data['number'], title=new_chapter_data['title'], synopsis=new_chapter_data['synopsis'], story_id=story_id)

        # Try to add the new chapter
        try:
            insert(new_chapter)
        except Exception as e:
            abort(500)

        return jsonify({
            'success': True,
            'updated': return_object
        })

    # Endpoint: DELETE /story/<story_id>
    # Description: Deletes a story.
    # Parameters: story_id - the ID of the story to delete.
    @app.route('/story/<story_id>', methods=['DELETE'])
    def delete_story(story_id):
        story = Story.query.filter(Story.id == story_id).one_or_none()

        # If a story with this ID doesn't exist, abort
        if(story is None):
            abort(404)
        # If there is a storry with that ID
        else:
            # Try to delete the story
            try:
                delete_single(Story, story_id)
            # If there's an error deleting, abort
            except Exception as e:
                abort(500)

        return jsonify({
            'success': True,
            'deleted': story_id
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


    # Endpoint: PATCH /story/<story_id>/chapters/<chapter_id>
    # Description: Edits an existing chapter.
    # Parameters: story_id - the ID of the story to fetch.
    #             chapter_id - the ID of the chapter to fetch.
    @app.route('/story/<story_id>/chapters/<chapter_number>', methods=['PATCH'])
    def edit_chapter(story_id, chapter_number):
        chapter = Chapter.query.filter(Chapter.story_id == story_id).filter(Chapter.number == chapter_number).one_or_none()
        edited_chapter = json.loads(request.data)
        return_chapter = {}

        # Checks whether this story has a chapter in that location
        if(chapter is None):
            abort(404)
        # If there is, updates the story
        else:
            # If the chapter number wasn't changed
            if(chapter.id == edited_chapter.id):
                chapter.number = edited_chapter.number
                chapter.title = edited_chapter.title
                chapter.synopsis = edited_chapter.synopsis

                # Try to update the database
                try:
                    chapter.update()
                    return_chapter = chapter.format()
                except Exception as e:
                    abort(500)
            # If the chapter number was changed
            else:
                original_chapter = Chapter.query.get(edited_chapter.id)
                chapters_to_shift = Chapter.query.filter(Chapter.story_id == story_id).filter(Chapter.number >= edited_chapter.number).all()

                for chapter in chapters_to_shift:
                    chapter.number += 1

                try:
                    update_chapters(chapters_to_shift)
                    return_chapter = original_chapter.format()
                except Exception as e:
                    abort(500)

        return jsonify({
            'success': True,
            'chapter': return_chapter
        })

    # Endpoint: DELETE /story/<story_id>/chapters/<chapter_number>
    # Description: Deletes a chapter.
    # Parameters: story_id - the ID of the story to delete.
    #             chapter_number - the number of the chapter to delete.
    @app.route('/story/<story_id>/chapters/<chapter_number>', methods=['DELETE'])
    def delete_chapter(story_id, chapter_number):
        chapter = Chapter.query.filter(Chapter.story_id == story_id).filter(Chapter.number == chapter_number).one_or_none()

        # If a chapter with that ID doesn't exist, abort
        if(chapter is None):
            abort(404)
        # If it does, try to delete it
        else:
            chapter_id = chapter.id

            # Try to delete the chapter
            try:
                delete_single(Chapter, chapter)
            # If there's an error deleting, abort
            except Exception as e:
                abort(500)

        return jsonify({
            'success': True,
            'deleted': chapter_id
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
