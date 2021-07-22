const socket = io();
// ****************************************************************************
// socket.on('countUpdated', (count) => {
//     console.log('count is updated!!', count)
// });

// document.querySelector("#increment").addEventListener('click', () => {
//     console.log('clicked!');
//     socket.emit('increment');
// });
//************************************************************************* */

// Define elements for easy form manipulatin
const $messageForm = document.querySelector("#chat");
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locMsgTemplate = document.querySelector('#loc-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// options
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix:true});
// Auto-scrolling
const autoScroll = () => {
    // new message
    const $newMessage = $messages.lastElementChild;
    // height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    // visible height
    const visibleHeight = $messages.offsetHeight;
    // total height of message container
    const containerHeight = $messages.scrollHeight;
    // how far scrolled from top
    const scrollOffset = $messages.scrollTop + visibleHeight;
    // check if we r at bottom before last message was added
     if (Math.round(containerHeight - newMessageHeight) <= Math.round(scrollOffset)) {
         $messages.scrollTop = $messages.scrollHeight;
     } 
  
}

// another way to implement autoscroll
// const autoScroll = () => {
//     const element=$messages.lastElementChild;
//     element.scrollIntoView(false);
//     // element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
// }

// render messages using msg template
socket.on('message', (data) => {
    console.log(data);
    const html = Mustache.render(messageTemplate, {
        username:data.username,
        createdAt:moment(data.createdAt).format('h:mm a'),
        message:data.text
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoScroll();
});
// render share loc messages using loc-msg template
socket.on('locationMessage', (data) => {
    console.log(data);
    const html = Mustache.render(locMsgTemplate, {
        username:data.username,
        url:data.url,
        createdAt:moment(data.createdAt).format('h:mm a')});
    $messages.insertAdjacentHTML("beforeend",html)
    autoScroll();
});
// render sidebar using sidebar template
socket.on('roomData', (data) => {
    const html = Mustache.render(sidebarTemplate,{
        room:data.room,
        users:data.users
    });
    $sidebar.innerHTML = html
});


$messageForm.addEventListener('submit',(e) => {
    e.preventDefault();
    // Disable the submit button
    $messageFormButton.setAttribute('disabled', 'disabled');
    //const msg = document.querySelector('input').value
    const msg = e.target.elements.chatMsg.value
    socket.emit('newChat', msg, (error) => {
        //Enable the submit button for next chat
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = ''
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log('chat msg was delivered!');
    });
});




$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geo-location is not supported by ur browser');
    }
    //disable button
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const long =position.coords.longitude;
        //console.log(position);
        socket.emit('sendLocation', {lat,long}, (ackMsg) => {
            //Enable the button for next location fetch
           $sendLocationButton.removeAttribute('disabled');
            console.log(ackMsg);
        })
    })
});

// emit event to send username and room to join
socket.emit('join', {username,room},(error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});








// *******************how to filter bad words *******************
// const naughtyWords = require("naughty-words");
//const filter = new Filter()
//filter.addWords(...naughtyWords.pt) //pt is for portuguese