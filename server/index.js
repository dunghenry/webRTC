let usersOnline = [];
const io = require('socket.io')(process.env.PORT || 3000, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
});

io.on('connection', (socket) => {
    console.log(socket.id);
    console.log(usersOnline);
    socket.on('register', (user) => {
        const isExist = usersOnline.some((u) => u.username === user.username);
        if (isExist) {
            return socket.emit('register_failure');
        }
        socket.username = user.username;
        usersOnline.push(user);
        // console.log(usersOnline);
        // socket.emit('users_online', usersOnline);
        socket.emit('register_success', user);
        socket.broadcast.emit('new_user', user);
        io.sockets.emit('users_online', usersOnline);
        io.emit('oke', 'Hello, world!');
    });
    socket.on('disconnect', function () {
        if (usersOnline.length >= 1) {
            usersOnline.pop();
        }
        io.sockets.emit('refresh_users_online', usersOnline);
        socket.broadcast.emit('user_disconnect', socket.username);
    });
});
