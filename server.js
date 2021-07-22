const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 5000;
const PublicDirectoryPath = path.join(__dirname, 'public');
app.use(express.static(PublicDirectoryPath));

// Initialize a new connection and server sends welcome msg to all clients

io.on('connection', (socket) => {
    console.log('New web-socket connection');

// to listen for username and room while joining
    socket.on('join', ({username,room}, callback) => {
     const {error,user} = addUser({id:socket.id,username,room});
        if (error) {
            return callback(error)
        }
     socket.join(user.room);
    // Types of communication ---> socket.emit,io.emit,socket.broadcast.emit, io.to.emit,socket.broadcast.to.emit
    socket.emit('message', generateMessage('Admin',`Welcome ${user.username.toUpperCase()} to the ${user.room} room!`));
    // server broadcasts msg when a new user joins
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
        room:user.room,
        users: getUsersInRoom(user.room)
    })
    callback();
})

// server listening on for new chat msg from clients  + profanity check
    socket.on('newChat', (msg, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username,msg));
        //callback('mil gaya mujhe');
        callback();
    });
// to get number of users in chat
    const usersInChatRoom = socket.client.conn.server.clientsCount;
    socket.broadcast.emit('message', usersInChatRoom);
// to share location message
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',
        generateLocationMessage(user.username,'https://google.com/maps?q=' + location.lat + ',' + location.long));
        callback('Location shared!');
    });
// separate event for location sharing message
// `https://google.com/maps?q=' ${location.lat},${location.long}`
    //socket.emit('locationMessage', 'lelo location');



// to send message when a user disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left the room!`))
       
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }
    })
})





server.listen(port, () => {
    console.log(`server has started on port ${port}`)
})