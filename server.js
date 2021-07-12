const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Initialize a new connection and server sends welcome msg to all clients

io.on('connection', (socket) => {
    console.log('New web-socket connection');
    socket.emit('message', 'Welcome!!');
// server broadcasts msg when a new user joins
    socket.broadcast.emit('message', 'A new user has joined!');
// server listening on for new chat msg from clients  + profanity check
    socket.on('newChat', (msg, callback) => {
        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        io.emit('message', msg);
        //callback('mil gaya mujhe');
        callback();
    });
// to get number of users in chat
    const usersInChatRoom = socket.client.conn.server.clientsCount;
    socket.broadcast.emit('message', usersInChatRoom);
// to share location
    socket.on('sendLocation', (location, callback) => {
        io.emit('locationMessage', 'https://google.com/maps?q=' + location.lat + ',' + location.long);
        callback('Location shared!');
    });
// separate event for location sharing message
// `https://google.com/maps?q=' ${location.lat},${location.long}`
    //socket.emit('locationMessage', 'lelo location');



// to send message when a user disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A User has left the chat room!')
    })
})



const port = process.env.PORT || 5000;
const PublicDirectoryPath = path.join(__dirname, 'public');
app.use(express.static(PublicDirectoryPath));


server.listen(port, () => {
    console.log(`server has started on port ${port}`)
})