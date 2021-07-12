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

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locMsgTemplate = document.querySelector('#loc-message-template').innerHTML;

// render messages using msg template
socket.on('message', (data) => {
    //console.log(data);
    const html = Mustache.render(messageTemplate, {
        message:data
    });
    $messages.insertAdjacentHTML("beforeend",html);
});
// render share loc messages using loc-msg template
socket.on('locationMessage', (url) => {
    //console.log(url);
    const html = Mustache.render(locMsgTemplate, {url});
    $messages.insertAdjacentHTML("beforeend",html)
})

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
})
// *******************how to filter bad words *******************
// const naughtyWords = require("naughty-words");
//const filter = new Filter()
//filter.addWords(...naughtyWords.pt) //pt is for portuguese