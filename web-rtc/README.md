# WebRTC Application

A decoupled WebRTC video calling application with separate backend (signaling server) and frontend (client).

## Project Structure

```
web-rtc/
├── backend/          # WebRTC signaling server (Node.js + Socket.io)
└── frontend/         # WebRTC client (React + TypeScript)
```

## Backend (Signaling Server)

### Setup

```bash
cd backend
npm install
cp .env.example .env
```

### Run Development Server

```bash
npm run dev
```

The server will run on `http://localhost:4000`

### Build for Production

```bash
npm run build
npm start
```

### Features

- Socket.io based signaling server
- Room management
- Peer connection handling
- Media state synchronization
- ICE candidate exchange

### API Endpoints

- `GET /health` - Health check endpoint

### Socket Events

**Client → Server:**

- `join-room` - Join a room
- `leave-room` - Leave a room
- `signal` - WebRTC signaling (offer/answer/ICE candidate)
- `media-state-changed` - Media state updates

**Server → Client:**

- `existing-peers` - List of peers already in the room
- `user-joined` - Notification when a user joins
- `user-left` - Notification when a user leaves
- `signal` - WebRTC signaling messages
- `peer-media-state-changed` - Media state updates from peers

## Frontend (Client)

### Setup

```bash
cd frontend
npm install
cp .env.example .env
```

### Run Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

### Features

- Video/audio calling with multiple participants
- Real-time peer-to-peer connections
- Media controls (mute/unmute audio and video)
- Room creation and joining
- Responsive grid layout for multiple participants

### Pages

- `/` - Home page (create or join room)
- `/room/:roomId` - Video call room

### Key Components

- `SocketContext` - Manages Socket.io connection
- `PeerContext` - Manages WebRTC peer connections
- `useWebRTC` - Main hook for WebRTC functionality
- `VideoPlayer` - Video player component
- `MediaControls` - Media control buttons

## Environment Variables

### Backend (.env)

```env
PORT=4000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_SOCKET_URL=http://localhost:4000
```

## How It Works

1. **User joins a room:**

   - Frontend connects to Socket.io server
   - Requests media permissions (camera/mic)
   - Joins room via `join-room` event

2. **Peer discovery:**

   - Server sends list of existing peers
   - Frontend creates RTCPeerConnection for each peer

3. **WebRTC handshake:**

   - Offer/Answer exchange via signaling server
   - ICE candidate exchange for NAT traversal
   - Direct peer-to-peer media streams established

4. **Media streaming:**
   - Local stream added to peer connections
   - Remote streams received and displayed
   - Media controls sync across all peers

## Tech Stack

### Backend

- Node.js
- Express
- Socket.io
- TypeScript

### Frontend

- React
- TypeScript
- Socket.io Client
- WebRTC API
- React Router
- Vite

## Development

### Running Both Services

Terminal 1 (Backend):

```bash
cd backend && npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend && npm run dev
```

## Future Enhancements

- [ ] Screen sharing
- [ ] Chat functionality
- [ ] Recording capabilities
- [ ] Virtual backgrounds
- [ ] Noise cancellation
- [ ] Grid/spotlight view toggle
- [ ] User authentication
- [ ] Room persistence
- [ ] TURN server for better connectivity
- [ ] Mobile responsive improvements
