# Gemastik26
Pak Suhadi selalu di hati

# 1. Install Docker Desktop dulu → restart PC

# 2. Clone & jalankan
git clone https://github.com/<username>/<repo>.git
 cd hotspot-lms
 docker compose up -d --build

# 3. Download model AI (sekali, ~5 GB)
docker compose exec ollama ollama pull qwen2.5:1.5b

# 4. Buka browser
# http://localhost:5000 → login guru → AI Assistant

masuk ke cd ../lms/server

nanti run npm run dev

kalau sukses muncul

 Meet signaling WebSocket ready at /ws/meet

 EduLAN HTTP (LMS) — port 5000
   HTTP:  http://localhost:5000
   HTTP Network: http://192.168.137.1:5000  (Local Area Connection* 2)
   HTTP Network: http://10.147.1.235:5000  (Wi-Fi)
 Meet signaling WebSocket ready at /ws/meet

 EduLAN HTTPS (Meet/kamera) — port 5443
   HTTPS:  https://localhost:5443
   HTTPS Network: https://192.168.137.1:5443  (Local Area Connection* 2)
   HTTPS Network: https://10.147.1.235:5443  (Wi-Fi)

 HP Meet: https://192.168.137.1:5443/meet.html
