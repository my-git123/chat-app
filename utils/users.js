// Define functions to addUser,removeUser,getUser, getUsersInRoom

const users = [];

//addUser

const addUser = ({id, username, room}) => {
    // clean data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate data
    if (!username || !room) {
        return {
            error: 'Username and room is required'
        }
    }

    // check for existing user
    const existingUser = users.find(user => {
        return user.room === room && user.username === username
    });

    // validate username
    if (existingUser) {
        return {
            error:'username is already in use!'
        }
    }
    // store user
    const user = {id, username, room}
    users.push(user);
    return {user}

}

// removeUser
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        return users.splice(index,1)[0] //splice is used to remove index from an array
    }

}

// getUser
const getUser = (id) => {
    return users.find(user => user.id === id);
}

// getUsersInRoom
const getUsersInRoom = (room) => {
room = room.trim().toLowerCase();
const roomUsers =  users.filter(user => user.room === room);
if (roomUsers.length === 0) {
    return {
        error: 'No users in this room'
    }
}
    return roomUsers

}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

