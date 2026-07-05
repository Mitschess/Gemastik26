"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMeetSignaling = setupMeetSignaling;
exports.getActiveRooms = getActiveRooms;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const rooms = new Map();
function send(ws, data) {
    if (ws.readyState === ws_1.WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}
function broadcast(room, data, excludeId) {
    for (const [id, peer] of room.peers) {
        if (id !== excludeId)
            send(peer.ws, data);
    }
}
function peerInfo(peer) {
    return { id: peer.id, name: peer.name, role: peer.role, video: peer.video, audio: peer.audio };
}
function leaveRoom(peerId) {
    for (const [roomId, room] of rooms) {
        const peer = room.peers.get(peerId);
        if (!peer)
            continue;
        room.peers.delete(peerId);
        broadcast(room, { type: 'peer-left', peerId });
        if (room.peers.size === 0)
            rooms.delete(roomId);
        break;
    }
}
function setupMeetSignaling(wss) {
    wss.on('connection', (ws) => {
        let peerId = '';
        ws.on('message', (raw) => {
            var _a;
            let msg;
            try {
                msg = JSON.parse(raw.toString());
            }
            catch (_b) {
                return;
            }
            switch (msg.type) {
                case 'join': {
                    const roomId = String(msg.roomId || '').trim().toUpperCase();
                    if (!roomId)
                        return send(ws, { type: 'error', message: 'Room ID kosong' });
                    peerId = (0, uuid_1.v4)();
                    let room = rooms.get(roomId);
                    if (!room) {
                        room = { id: roomId, hostId: peerId, peers: new Map() };
                        rooms.set(roomId, room);
                    }
                    const peer = {
                        id: peerId,
                        ws,
                        name: String(msg.name || 'Peserta'),
                        role: String(msg.role || 'student'),
                        roomId,
                        video: true,
                        audio: true
                    };
                    room.peers.set(peerId, peer);
                    const existing = [...room.peers.values()]
                        .filter(p => p.id !== peerId)
                        .map(peerInfo);
                    send(ws, { type: 'joined', peerId, roomId, peers: existing });
                    broadcast(room, {
                        type: 'peer-joined',
                        peer: peerInfo(peer)
                    }, peerId);
                    break;
                }
                case 'offer':
                case 'answer':
                case 'ice-candidate': {
                    const target = (_a = rooms.get(msg.roomId)) === null || _a === void 0 ? void 0 : _a.peers.get(msg.to);
                    if (target) {
                        send(target.ws, Object.assign(Object.assign({}, msg), { from: peerId }));
                    }
                    break;
                }
                case 'chat': {
                    const room = rooms.get(msg.roomId);
                    if (!room)
                        return;
                    const peer = room.peers.get(peerId);
                    if (!peer)
                        return;
                    broadcast(room, {
                        type: 'chat',
                        from: peerId,
                        name: peer.name,
                        message: String(msg.message || ''),
                        time: new Date().toISOString()
                    });
                    break;
                }
                case 'media-state': {
                    const room = rooms.get(msg.roomId);
                    if (!room)
                        return;
                    const peer = room.peers.get(peerId);
                    if (!peer)
                        return;
                    peer.video = !!msg.video;
                    peer.audio = !!msg.audio;
                    broadcast(room, {
                        type: 'media-state',
                        from: peerId,
                        video: peer.video,
                        audio: peer.audio
                    }, peerId);
                    break;
                }
            }
        });
        ws.on('close', () => {
            if (peerId)
                leaveRoom(peerId);
        });
    });
    console.log('📹 Meet signaling WebSocket ready at /ws/meet');
}
function getActiveRooms() {
    return [...rooms.entries()].map(([id, room]) => ({
        id,
        participants: room.peers.size
    }));
}
