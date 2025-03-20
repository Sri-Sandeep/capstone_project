from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    
    CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins
    db.init_app(app)
    migrate.init_app(app, db)
    
    from .routes import main_routes
    app.register_blueprint(main_routes)
    
    return app