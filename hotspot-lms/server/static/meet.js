/* EduLAN Meet — WebRTC client (offline/local network) */

let localStream = null;
let ws = null;
let myId = '';
let roomId = '';
let myName = '';
let myRole = 'student';
let micOn = true;
let camOn = true;
let peers = new Map(); // peerId -> { pc, videoEl }
let chatOpen = true;

const ICE_CONFIG = { iceServers: [] }; // LAN only — no internet STUN needed

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function wsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws/meet`;
}

async function startPreview() {
  if (!window.isSecureContext) {
    showSecureWarning();
    return;
  }
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('previewVideo').srcObject = localStream;
    document.getElementById('meetLobbyHint').textContent = '✅ Kamera & mic siap';
  } catch (e) {
    document.getElementById('meetLobbyHint').textContent =
      '⚠️ Kamera/mic ditolak. Buka pengaturan browser → izinkan kamera & mic untuk situs ini.';
  }
}

async function showSecureWarning() {
  const el = document.getElementById('meetSecureWarning');
  el.classList.remove('hidden');
  let httpsUrl = `https://${location.hostname}:5443${location.pathname}${location.search}`;
  try {
    const info = await fetch('/api/network-info').then(r => r.json());
    if (info.meetUrl) httpsUrl = info.meetUrl;
    if (location.search) httpsUrl += location.search;
  } catch {}
  el.innerHTML = `
    <strong>⚠️ Kamera tidak bisa dipakai via HTTP di HP</strong>
    <p class="mt-xs">Browser HP memblokir kamera tanpa HTTPS. Gunakan link ini:</p>
    <a href="${httpsUrl}" class="meet-https-link">${httpsUrl}</a>
    <p class="text-xs mt-xs">Saat muncul peringatan sertifikat → pilih <strong>Lanjutkan</strong> / <strong>Advanced → Proceed</strong></p>
  `;
  document.getElementById('meetLobbyHint').textContent = 'Akses via HTTPS agar kamera bisa dipakai di HP.';
}

function createMeeting() {
  const code = generateRoomCode();
  document.getElementById('roomCodeInput').value = code;
  joinMeeting();
}

async function joinMeeting() {
  roomId = document.getElementById('roomCodeInput').value.trim().toUpperCase();
  if (!roomId) return showToast('Masukkan kode ruang', 'warning');

  if (!window.isSecureContext) {
    showSecureWarning();
    return showToast('Pakai HTTPS untuk kamera di HP', 'warning');
  }

  if (!localStream) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {
      return showToast('Izin kamera/mic diperlukan', 'error');
    }
  }

  connectWs();
}

function connectWs() {
  ws = new WebSocket(wsUrl());

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', roomId, name: myName, role: myRole }));
  };

  ws.onmessage = async (ev) => {
    const msg = JSON.parse(ev.data);
    switch (msg.type) {
      case 'joined':
        myId = msg.peerId;
        enterRoom(msg.peers);
        break;
      case 'peer-joined':
        await onPeerJoined(msg.peer);
        break;
      case 'peer-left':
        onPeerLeft(msg.peerId);
        break;
      case 'offer':
        await handleOffer(msg);
        break;
      case 'answer':
        await handleAnswer(msg);
        break;
      case 'ice-candidate':
        await handleIce(msg);
        break;
      case 'chat':
        appendMeetChat(msg.name, msg.message, msg.from === myId);
        break;
      case 'media-state':
        updatePeerMediaState(msg.from, msg.video, msg.audio);
        break;
      case 'error':
        showToast(msg.message, 'error');
        break;
    }
  };

  ws.onclose = () => {
    if (document.getElementById('meetRoom').classList.contains('hidden') === false) {
      showToast('Koneksi meeting terputus', 'warning');
    }
  };
}

function enterRoom(existingPeers) {
  document.getElementById('meetLobby').classList.add('hidden');
  document.getElementById('meetRoom').classList.remove('hidden');
  document.getElementById('meetRoomCode').textContent = roomId;
  addVideoTile(myId, myName, localStream, true);
  updateParticipantCount();
  appendMeetChat('Sistem', `Anda bergabung ke ruang ${roomId}`, false);

  existingPeers.forEach(p => createOfferTo(p.id, p.name));
}

function addVideoTile(peerId, name, stream, isLocal) {
  const grid = document.getElementById('meetVideoGrid');
  let tile = document.getElementById('tile-' + peerId);
  if (!tile) {
    tile = document.createElement('div');
    tile.className = 'meet-video-tile';
    tile.id = 'tile-' + peerId;
    tile.innerHTML = `
      <video autoplay playsinline ${isLocal ? 'muted' : ''}></video>
      <div class="meet-video-label">${escapeHtml(name)}${isLocal ? ' (Anda)' : ''}</div>
      <div class="meet-video-status" id="status-${peerId}"></div>
    `;
    grid.appendChild(tile);
  }
  const video = tile.querySelector('video');
  video.srcObject = stream;
}

function removeVideoTile(peerId) {
  document.getElementById('tile-' + peerId)?.remove();
}

function updateParticipantCount() {
  const count = document.getElementById('meetVideoGrid').childElementCount;
  document.getElementById('meetParticipantCount').textContent = count + ' peserta';
}

function updatePeerMediaState(peerId, video, audio) {
  const el = document.getElementById('status-' + peerId);
  if (!el) return;
  const parts = [];
  if (!audio) parts.push('🔇');
  if (!video) parts.push('📷 off');
  el.textContent = parts.join(' ');
}

function createPeerConnection(peerId, name) {
  const pc = new RTCPeerConnection(ICE_CONFIG);
  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.ontrack = (ev) => {
    const remoteStream = ev.streams[0];
    addVideoTile(peerId, name, remoteStream, false);
  };

  pc.onicecandidate = (ev) => {
    if (ev.candidate && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ice-candidate', roomId, to: peerId, candidate: ev.candidate
      }));
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      onPeerLeft(peerId);
    }
  };

  peers.set(peerId, { pc, name });
  return pc;
}

async function createOfferTo(peerId, name) {
  if (peers.has(peerId)) return;
  const pc = createPeerConnection(peerId, name);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  ws.send(JSON.stringify({ type: 'offer', roomId, to: peerId, sdp: offer }));
}

async function onPeerJoined(peer) {
  updateParticipantCount();
  appendMeetChat('Sistem', `${peer.name} bergabung`, false);
  // Wait for them to send offer to us (they initiate as newer peer)
}

async function handleOffer(msg) {
  const peerId = msg.from;
  let entry = peers.get(peerId);
  if (!entry) {
    const pc = createPeerConnection(peerId, 'Peserta');
    entry = peers.get(peerId);
  }
  const pc = entry.pc;
  await pc.setRemoteDescription(msg.sdp);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  ws.send(JSON.stringify({ type: 'answer', roomId, to: peerId, sdp: answer }));
}

async function handleAnswer(msg) {
  const entry = peers.get(msg.from);
  if (entry) await entry.pc.setRemoteDescription(msg.sdp);
}

async function handleIce(msg) {
  const entry = peers.get(msg.from);
  if (entry && msg.candidate) {
    try { await entry.pc.addIceCandidate(msg.candidate); } catch {}
  }
}

function onPeerLeft(peerId) {
  const entry = peers.get(peerId);
  if (entry) {
    entry.pc.close();
    peers.delete(peerId);
  }
  removeVideoTile(peerId);
  updateParticipantCount();
}

function toggleMic() {
  micOn = !micOn;
  localStream?.getAudioTracks().forEach(t => { t.enabled = micOn; });
  document.getElementById('micIcon').textContent = micOn ? '🎤' : '🔇';
  document.getElementById('btnToggleMic').classList.toggle('off', !micOn);
  sendMediaState();
}

function toggleCam() {
  camOn = !camOn;
  localStream?.getVideoTracks().forEach(t => { t.enabled = camOn; });
  document.getElementById('camIcon').textContent = camOn ? '📷' : '📷';
  document.getElementById('btnToggleCam').classList.toggle('off', !camOn);
  const tile = document.getElementById('tile-' + myId);
  if (tile) tile.classList.toggle('cam-off', !camOn);
  sendMediaState();
}

function sendMediaState() {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'media-state', roomId, video: camOn, audio: micOn }));
  }
}

function toggleMeetChat() {
  chatOpen = !chatOpen;
  document.getElementById('meetChatPanel').classList.toggle('hidden', !chatOpen);
}

function appendMeetChat(name, message, isSelf) {
  const box = document.getElementById('meetChatMessages');
  const el = document.createElement('div');
  el.className = 'meet-chat-msg' + (isSelf ? ' self' : '');
  el.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${escapeHtml(message)}</span>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

function sendMeetChat() {
  const input = document.getElementById('meetChatInput');
  const message = input.value.trim();
  if (!message || ws?.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type: 'chat', roomId, message }));
  appendMeetChat(myName + ' (Anda)', message, true);
  input.value = '';
}

function copyMeetLink() {
  const host = location.hostname;
  const port = location.protocol === 'https:' ? (location.port || '5443') : '5443';
  const link = `https://${host}:${port}/meet.html?room=${roomId}`;
  navigator.clipboard.writeText(link).then(() => showToast('Link HTTPS disalin!', 'success'));
}

function leaveMeeting() {
  peers.forEach(({ pc }) => pc.close());
  peers.clear();
  ws?.close();
  localStream?.getTracks().forEach(t => t.stop());
  localStream = null;
  location.href = myRole === 'teacher' ? '/teacher.html' : '/student.html';
}

function initMeet() {
  const user = JSON.parse(localStorage.getItem('hlms_user') || 'null');
  if (!user) { location.href = '/index.html'; return; }

  myName = user.name || user.username;
  myRole = user.role;

  document.getElementById('meetBackLink').href = myRole === 'teacher' ? '/teacher.html' : '/student.html';
  if (myRole === 'teacher') {
    document.getElementById('meetCreateSection').classList.remove('hidden');
  }

  const params = new URLSearchParams(location.search);
  const roomParam = params.get('room');
  if (roomParam) document.getElementById('roomCodeInput').value = roomParam.toUpperCase();

  document.getElementById('meetChatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendMeetChat(); }
  });

  startPreview();
}

initMeet();
