import os
import logging
import sys
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from werkzeug.middleware.proxy_fix import ProxyFix

# Add parent directory to path to allow absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import db

load_dotenv()

migrate = Migrate()


def create_app():
    # Set template and static folders to root for compatibility with existing admin templates
    app = Flask(__name__, 
                template_folder='../templates',
                static_folder='../static')

    # Security Headers
    Talisman(app, content_security_policy=None) # CSP handled by Netlify/Frontend mostly

    # Rate Limiting
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )

    # =========================
    # REQUIRED ENV VARIABLES
    # =========================

    SECRET_KEY = os.getenv("SECRET_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")
    FRONTEND_URL = os.getenv("FRONTEND_URL")

    if not SECRET_KEY:
        SECRET_KEY = "dev-secret-key" # Fallback for local
        print("WARNING: SECRET_KEY missing, using dev default")

    if DATABASE_URL:
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
        elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+psycopg://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    else:
        # Fallback to local SQLite if no remote DB is set
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'instance', 'farm_data.db')
        DATABASE_URL = f"sqlite:///{db_path}"
        print(f"WARNING: DATABASE_URL missing, using local SQLite: {DATABASE_URL}")

    if not FRONTEND_URL:
        FRONTEND_URL = "http://localhost:5173"
        print("WARNING: FRONTEND_URL missing, using localhost default")

    # =========================
    # APP CONFIG
    # =========================

    app.config["SECRET_KEY"] = SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SECURE"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    # =========================
    # REVERSE PROXY FIX
    # =========================

    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # =========================
    # CORS
    # =========================

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [FRONTEND_URL, "https://radiant-kleicha-d978e8.netlify.app", "https://farmate-admin.netlify.app"]
            },
            r"/admin/*": {
                "origins": [FRONTEND_URL, "https://radiant-kleicha-d978e8.netlify.app", "https://farmate-admin.netlify.app"]
            }
        },
        supports_credentials=True
    )

    # =========================
    # DATABASE
    # =========================

    db.init_app(app)
    migrate.init_app(app, db)

    # =========================
    # LOGGING
    # =========================

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s"
    )

    # =========================
    # HEALTH CHECK
    # =========================

    @app.route("/health")
    def health():
        return jsonify({
            "status": "ok",
            "service": "farmate-backend"
        }), 200

    # =========================
    # REGISTER ROUTES
    # =========================

    from backend.routes.ai_routes import ai_routes
    from backend.routes.admin import admin_routes

    app.register_blueprint(ai_routes)
    app.register_blueprint(admin_routes)

    # =========================
    # SERVE FRONTEND
    # =========================

    from flask import send_from_directory

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            # Check if it's an API route or admin template route
            # If not, serve index.html from React dist
            # For now, let's assume if it's not found in static, we try to serve the old templates
            # But the React app is meant to be the main UI at /
            dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist')
            if os.path.exists(os.path.join(dist_path, 'index.html')):
                if path != "" and os.path.exists(os.path.join(dist_path, path)):
                    return send_from_directory(dist_path, path)
                return send_from_directory(dist_path, 'index.html')
            
            # Fallback to old home if React is not built
            from flask import redirect, url_for
            try:
                return redirect(url_for('admin_routes.admin_home'))
            except:
                return "Admin Dashboard (Flask) fallback - React build not found", 404

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
