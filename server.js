const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// Update CORS origin
app.use(cors({ origin: 'https://smart-university.vercel.app' }));

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: 'https://smart-university.vercel.app' } });

// Your existing Socket.IO handlers go here

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});