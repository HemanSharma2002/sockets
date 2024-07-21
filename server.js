// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const socketIo = require('socket.io');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on("send-message",(message)=>{
        socket.broadcast.emit("recieve-message",message)
        socket.emit("recieve-message",message)
    })
    socket.on("set-username",username=>{
        socket.username=username
        console.log(`${username} joined the chat`);
        socket.broadcast.emit("welcome",`${username} enter the chat`)
    })
    socket.on('disconnect', () => {
      console.log(`${socket.id} , ${socket.username} disconnected`);
      socket.broadcast.emit("user-disconnected",`${socket.username} left the chat`)
    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('Server is running on http://localhost:3000');
  });
});
