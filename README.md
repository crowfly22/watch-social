# Orbit 100T - Creator Token Lab

Orbit 100T adalah proyek landing page interaktif yang terinspirasi dari halaman campaign token AI seperti `100t.xiaomimimo.com`, tetapi dibuat sebagai konsep kreatif independen untuk GitHub demo project.

> Catatan: proyek ini bukan situs resmi Xiaomi/MiMo, tidak memakai API Xiaomi, dan hanya memakai data simulasi.

## Ide Utama

Alih-alih membuat tiruan statis, proyek ini mengubah konsep giveaway token menjadi **mission control untuk kreator AI**:

- **Countdown real-time** sampai campaign selesai.
- **Live token vault** dengan angka token simulasi yang bergerak dinamis.
- **Creator scoring lab** untuk menghitung peluang/tier reward berdasarkan tipe kreator, tool AI, dan bukti karya.
- **Generated pitch** yang bisa dipakai untuk README, form grant, atau proposal komunitas.
- **Visual cyber-orbit** dengan matrix canvas background dan kartu glassmorphism.

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend lokal: Flask untuk serve static files
- Tidak perlu build tool atau database untuk demo landing page

## Menjalankan Lokal

```bash
pip install -r requirements.txt
cd backend
python app.py
```

Buka browser ke:

```text
http://localhost:5000
```

## Struktur Project

```text
frontend/
  index.html      # Landing page dan interactive lab
  css/style.css   # Cyber-orbit responsive UI
  js/app.js       # Countdown, token vault, scorer, matrix canvas
backend/
  app.py          # Flask static server + API lama repo
requirements.txt
```

## Pengembangan Lanjutan

- Hubungkan form ke database untuk menyimpan submission kreator.
- Tambahkan login GitHub dan verifikasi repository publik.
- Buat leaderboard kreator berdasarkan score dan bukti demo.
- Deploy frontend ke GitHub Pages atau backend Flask ke Render/Fly.io.

## License

MIT
