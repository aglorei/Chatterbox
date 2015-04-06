var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	app = express();

app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded({ extended:true }));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// set root route
app.get('/', function (request, response){
	response.render('index');
});

var server = app.listen(8000, function (){
	console.log('listening to 8000');
});

// Chatroom

var io = require('socket.io').listen(server);

var usernames = {};
var usercount = 0;

io.on('connection', function (socket){
	console.log('sockets turned on', socket.id);

	var addedUser = false;

	io.emit('initialize_broadcast', {usercount: usercount});

	socket.on('add_user', function(username){
		addedUser = true;
		// add user to global username list
		usernames[username] = username;
		usercount ++;
		// store username in socket session
		socket.username = username;
		// emit to other users that user has connected
		io.emit('user_joined', {username: socket.username, usercount: usercount});
	});

	socket.on('disconnect', function (){
		console.log('user disconnected', socket.id);
		if (addedUser)
		{
			// delete user from global username list
			delete usernames[socket.username];
			usercount --;

			io.emit('user_left', {username: socket.username, usercount: usercount});
		}
	});

	socket.on('add_message', function(data){
		io.emit('new_message', data);
	});
});