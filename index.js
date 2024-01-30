const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const {connection}=require('./db');
const {userRouter}=require('./routes/user.routes');
const {auth}=require('./middleware/auth.middleware');
// const Redis = require("ioredis");

// const redis = new Redis({
//     port : "13881",
//     host : "redis-13881.c301.ap-south-1-1.ec2.cloud.redislabs.com",
//     password : "iuIcoRFsH3WwAlScP2KkuBM9CpNGhKTu"
// });

const app = express();
app.use(express.json());
app.use('/user',userRouter);
const server = http.createServer(app);
const io = socketIO(server);


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (userData) => {
        socket.username = userData.username;
        socket.avatar = 'default-avatar.jpg'; // Set a default avatar
        io.emit('chat message', {
            user: 'System',
            message: `${userData.username} has joined the chat`,
            avatar: socket.avatar,
            online: true,
            timestamp: new Date()
        });
    });

    socket.on('chat message', (messageData) => {
        const timestamp = new Date();
        io.emit('chat message', {
            user: socket.username,
            message: messageData.message,
            avatar: messageData.avatar || socket.avatar,
            online: true,
            timestamp
        });
    });

    socket.on('update avatar', (data) => {
        socket.avatar = data.avatar;
        const timestamp = new Date();
        io.emit('chat message', {
            user: 'System',
            message: `${socket.username} updated their avatar`,
            avatar: socket.avatar,
            online: true,
            timestamp
        });
    });
    socket.on('delete message', (messageId) => {
        // Emit a 'message deleted' event to inform clients
        io.emit('message deleted', messageId);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        const timestamp = new Date();
        io.emit('chat message', {
            user: 'System',
            message: `${socket.username} has left the chat`,
            avatar: socket.avatar,
            online: false,
            timestamp
        });
    });
});


app.get('/mychat',auth,(req,res)=>{
    res.json({msg:"hi"});
})


const PORT = process.env.PORT || 3000;

server.listen(PORT, async() => {
    await connection;
    console.log("connected to db");
       
    console.log(`Server is running on http://localhost:${PORT}`);
});
