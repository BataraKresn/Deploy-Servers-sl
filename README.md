
# Trigger Deploy

A full-stack application to trigger and monitor deployments.

## Struktur

- **`app/`**: Next.js frontend (Pages Router) untuk antarmuka pengguna.
- **`backend/`**: Aplikasi Flask (Python) sebagai API backend.
- **`docker-compose.yml`**: Orkestrasi frontend dan backend.
- **`deploy.sh`**: Skrip deployment yang dijalankan backend.
- **`servers.json`**: Daftar server tujuan deploy.
- **`trigger-logs/`**: Folder untuk log hasil deployment.
- **`components/`, `hooks/`, `lib/`**: Kode pendukung frontend.

## Cara Menjalankan

1. **Prasyarat**: Pastikan Docker dan Docker Compose sudah terinstall.
2. **Set Environment Variable**: Buat file `.env` di folder `backend` dan isi dengan:
   ```
   DEPLOY_TOKEN=your_super_secret_token_here
   ```
3. **Buat Skrip Eksekusi**: Jalankan `chmod +x deploy.sh` di terminal.
4. **Build & Jalankan**: Dari root folder, jalankan:
   ```
   docker-compose up --build
   ```
5. **Akses**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`

## Catatan

- Pastikan file `servers.json` sudah terisi dengan data server yang valid.
- Log hasil deployment akan tersimpan di folder `trigger-logs/`.
- Untuk update dependensi frontend, gunakan `pnpm install`.
