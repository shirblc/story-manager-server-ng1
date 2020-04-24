from flask import Flask, request, jsonify

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


    return app
