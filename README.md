# 👁️ WATCH - Social Media Platform

**WATCH** - Platform social media untuk berbagi momen, foto, dan cerita dengan semua orang.

![Logo](frontend/images/logo.svg)

## 🚀 Features

- ✅ **User Authentication** (Register/Login)
- ✅ **Create Posts** (Text + Image)
- ✅ **Like & Comment System**
- ✅ **Follow/Unfollow Users**
- ✅ **Stories** (24h auto-expire)
- ✅ **Explore Page** (Discover content)
- ✅ **Profile Pages**
- ✅ **Notifications**
- ✅ **Responsive Design**

## 🛠️ Tech Stack

- **Backend:** Flask (Python)
- **Database:** SQLite
- **Frontend:** HTML5, CSS3, Vanilla JS
- **Auth:** JWT Tokens
- **Storage:** Local file system

## 📦 Installation

```bash
# Clone repo
git clone https://github.com/crowfly22/watch-social.git
cd watch-social

# Install dependencies
pip install -r requirements.txt

# Run backend
cd backend
python app.py

# Open browser
http://localhost:5000
```

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/posts | Get all posts |
| POST | /api/posts | Create new post |
| POST | /api/posts/:id/like | Like/unlike post |
| GET | /api/users/:username | Get user profile |
| POST | /api/users/:id/follow | Follow/unfollow user |

## 🎨 Logo

Logo WATCH adalah **mata** yang melambangkan:
- 👁️ **Visibilitas** - Melihat semua konten
- 👁️ **Awareness** - Sadar akan sekitar
- 👁️ **Connection** - Terhubung dengan semua orang

## 📝 License

MIT License - Open source untuk semua!

---

**Dibuat dengan ❤️ oleh WATCH Team**