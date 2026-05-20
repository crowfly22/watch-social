from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
import jwt
import datetime
import os
import sqlite3
import uuid

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'watch-secret-key-2024'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Database setup
def get_db():
    conn = sqlite3.connect('watch.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                avatar TEXT DEFAULT 'default-avatar.png',
                bio TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                image TEXT,
                likes INTEGER DEFAULT 0,
                comments INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
            
            CREATE TABLE IF NOT EXISTS follows (
                follower_id INTEGER NOT NULL,
                following_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (follower_id, following_id),
                FOREIGN KEY (follower_id) REFERENCES users (id),
                FOREIGN KEY (following_id) REFERENCES users (id)
            );
            
            CREATE TABLE IF NOT EXISTS likes (
                user_id INTEGER NOT NULL,
                post_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, post_id),
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (post_id) REFERENCES posts (id)
            );
        ''')

# Auth middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token missing'}), 401
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = get_db().execute('SELECT * FROM users WHERE id = ?', (data['user_id'],)).fetchone()
        except:
            return jsonify({'message': 'Token invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not all([username, email, password]):
        return jsonify({'message': 'All fields required'}), 400
    
    hashed = generate_password_hash(password)
    
    try:
        with get_db() as conn:
            conn.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                        (username, email, hashed))
        return jsonify({'message': 'User created successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Username or email already exists'}), 409

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    with get_db() as conn:
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    
    if user and check_password_hash(user['password'], password):
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, app.config['SECRET_KEY'])
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'avatar': user['avatar']
            }
        })
    return jsonify({'message': 'Invalid credentials'}), 401

# Post routes
@app.route('/api/posts', methods=['GET'])
def get_posts():
    with get_db() as conn:
        posts = conn.execute('''
            SELECT p.*, u.username, u.avatar 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC 
            LIMIT 50
        ''').fetchall()
    
    return jsonify([{
        'id': p['id'],
        'content': p['content'],
        'image': p['image'],
        'likes': p['likes'],
        'comments': p['comments'],
        'created_at': p['created_at'],
        'user': {
            'username': p['username'],
            'avatar': p['avatar']
        }
    } for p in posts])

@app.route('/api/posts', methods=['POST'])
@token_required
def create_post(current_user):
    content = request.form.get('content', '')
    image = None
    
    if 'image' in request.files:
        file = request.files['image']
        if file.filename:
            filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image = filename
    
    with get_db() as conn:
        conn.execute('INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)',
                    (current_user['id'], content, image))
    
    return jsonify({'message': 'Post created'}), 201

@app.route('/api/posts/<int:post_id>/like', methods=['POST'])
@token_required
def like_post(current_user, post_id):
    with get_db() as conn:
        try:
            conn.execute('INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
                        (current_user['id'], post_id))
            conn.execute('UPDATE posts SET likes = likes + 1 WHERE id = ?', (post_id,))
            return jsonify({'message': 'Liked'}), 200
        except sqlite3.IntegrityError:
            conn.execute('DELETE FROM likes WHERE user_id = ? AND post_id = ?',
                        (current_user['id'], post_id))
            conn.execute('UPDATE posts SET likes = likes - 1 WHERE id = ?', (post_id,))
            return jsonify({'message': 'Unliked'}), 200

# User routes
@app.route('/api/users/<username>')
def get_profile(username):
    with get_db() as conn:
        user = conn.execute('SELECT id, username, avatar, bio, created_at FROM users WHERE username = ?',
                           (username,)).fetchone()
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        posts = conn.execute('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
                            (user['id'],)).fetchall()
        
        followers = conn.execute('SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
                                (user['id'],)).fetchone()['count']
        following = conn.execute('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
                                (user['id'],)).fetchone()['count']
    
    return jsonify({
        'user': {
            'username': user['username'],
            'avatar': user['avatar'],
            'bio': user['bio'],
            'created_at': user['created_at'],
            'followers': followers,
            'following': following
        },
        'posts': [{
            'id': p['id'],
            'content': p['content'],
            'image': p['image'],
            'likes': p['likes'],
            'created_at': p['created_at']
        } for p in posts]
    })

@app.route('/api/users/<int:user_id>/follow', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    if current_user['id'] == user_id:
        return jsonify({'message': 'Cannot follow yourself'}), 400
    
    with get_db() as conn:
        try:
            conn.execute('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
                        (current_user['id'], user_id))
            return jsonify({'message': 'Followed'}), 200
        except sqlite3.IntegrityError:
            conn.execute('DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
                        (current_user['id'], user_id))
            return jsonify({'message': 'Unfollowed'}), 200

if __name__ == '__main__':
    init_db()
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
