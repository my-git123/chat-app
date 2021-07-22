// function to generate message
const generateMessage = (username,text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}
// function to generate location message
const generateLocationMessage = (username,url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}