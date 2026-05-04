// WATCH Social Media App
const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let authToken = localStorage.getItem('token');

// Initialize
window.onload = () => {
    if (!authToken) {
        showAuth();
    } else {
        loadFeed();
    }
};

// Navigation
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    
    if (page === 'home') loadFeed();
    if (page === 'profile') loadProfile();
}

// Auth
function showAuth() {
    document.getElementById('auth-modal').classList.add('active');
}

function closeAuth() {
    document.getElementById('auth-modal').classList.remove('active');
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');
    event.target.classList.add('active');
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, email, password})
        });
        const data = await res.json();
        
        if (res.ok) {
            alert('Registration successful! Please login.');
            showTab('login');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        
        if (res.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', authToken);
            closeAuth();
            loadFeed();
            updateUI();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Feed
async function loadFeed() {
    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();
        
        const feed = document.getElementById('feed');
        feed.innerHTML = posts.map(post => `
            <div class="post">
                <div class="post-header">
                    <div class="post-avatar">👤</div>
                    <div>
                        <div class="post-user">${post.user.username}</div>
                        <div class="post-time">${formatTime(post.created_at)}</div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                ${post.image ? `<img src="${API_URL}/uploads/${post.image}" class="post-image">` : ''}
                <div class="post-actions-bar">
                    <button onclick="likePost(${post.id})">❤️ ${post.likes}</button>
                    <button>💬 ${post.comments}</button>
                    <button>🔄 Share</button>
                </div>
                <div class="post-likes">${post.likes} likes</div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading feed:', err);
    }
}

// Create Post
async function createPost() {
    const content = document.getElementById('post-content').value;
    const imageInput = document.getElementById('post-image');
    
    if (!content && !imageInput.files[0]) {
        alert('Please add content or image');
        return;
    }
    
    const formData = new FormData();
    formData.append('content', content);
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }
    
    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${authToken}`},
            body: formData
        });
        
        if (res.ok) {
            document.getElementById('post-content').value = '';
            imageInput.value = '';
            document.getElementById('image-preview').innerHTML = '';
            showPage('home');
            loadFeed();
        }
    } catch (err) {
        alert('Error creating post: ' + err.message);
    }
}

// Like Post
async function likePost(postId) {
    if (!authToken) {
        showAuth();
        return;
    }
    
    try {
        await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${authToken}`}
        });
        loadFeed();
    } catch (err) {
        console.error('Error liking post:', err);
    }
}

// Profile
async function loadProfile() {
    if (!currentUser) return;
    
    document.getElementById('profile-username').textContent = currentUser.username;
    // Load user's posts
}

// UI Updates
function updateUI() {
    if (currentUser) {
        // Update profile info
    }
}

// Helpers
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Image preview
document.getElementById('post-image')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image-preview').innerHTML = `
                <img src="${e.target.result}" style="max-width: 200px; border-radius: 10px; margin-top: 10px;">
            `;
        };
        reader.readAsDataURL(file);
    }
});

// Search
function search() {
    const query = document.getElementById('search-input').value;
    // Implement search functionality
    alert('Search: ' + query);
}

// Logout
function logout() {
    localStorage.removeItem('token');
    authToken = null;
    currentUser = null;
    showAuth();
}