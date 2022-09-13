const socket = io('http://localhost:3000');
const remoteId = document.getElementById('remoteId');
const btnCall = document.getElementById('btnCall');
const usernameInput = document.getElementById('username');
const btnRegister = document.getElementById('btnRegister');
const listUser = document.getElementById('listUser');
const chat = document.getElementById('chat');
const register = document.getElementById('register');
let isRegister = false;
function render() {
    if (isRegister) {
        chat.style.display = 'block';
        register.style.display = 'none';
    } else {
        chat.style.display = 'none';
        register.style.display = 'block';
    }
}
render();
socket.on('users_online', (users) => {
    let html = '';
    users.forEach((user) => {
        html += `<li id=${user.id}>${user.username}</li>`;
    });
    listUser.innerHTML = html;
});

socket.on('new_user', (newUser) => {
    console.log('New User', newUser);
});
socket.on('refresh_users_online', (users) => {
    listUser.innerHTML = '';
    let html = '';
    users.forEach((user) => {
        html += `<li>${user.username}</li>`;
    });
    listUser.innerHTML = html;
});

socket.on('oke', (msg) => {
    console.log('MSG', msg);
});

socket.on('register_failure', () => {
    alert('Username is already taken!');
});
socket.on('register_success', (user) => {
    isRegister = true;
    render();
});
socket.on('user_disconnect', (username) => {
    if (username) {
        alert(`${username} disconnected!`);
    }
});
function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

const peer = new Peer();
peer.on('open', (id) => {
    const my_peer = document.getElementById('my-peer');
    my_peer.textContent = 'Your ID: ' + id;
    btnRegister.onclick = function () {
        const username = usernameInput.value;
        socket.emit('register', { username, id });
    };
});

//Caller
btnCall.onclick = function () {
    const id = remoteId.value;
    openStream().then((stream) => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', (remoteStream) =>
            playStream('remoteStream', remoteStream),
        );
    });
};

peer.on('call', (call) => {
    openStream().then((stream) => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', (remoteStream) =>
            playStream('remoteStream', remoteStream),
        );
    });
});

listUser.addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
        const id = e.target.id;
        openStream().then((stream) => {
            playStream('localStream', stream);
            const call = peer.call(id, stream);
            call.on('stream', (remoteStream) =>
                playStream('remoteStream', remoteStream),
            );
        });
    }
});
