const socket = io('http://localhost:3000');

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
});

const remoteId = document.getElementById('remoteId');
const btnCall = document.getElementById('btnCall');

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
