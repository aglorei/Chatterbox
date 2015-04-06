	$(document).ready(function(){

		// initialize variables
		var socket = io.connect(),
			username,
			connected = false,
			currentInput = $('#username-input').focus();

		$('#message-group').hide();

		// username submit
		$('#username-input').on('keypress', function (event){
			if (event.which == 13)
			{
				setUsername($(this));
				return false;
			}
		});

		// message submit
		$('#message-input').on('keypress', function (event){
			if (event.which == 13)
			{
				setMessage($(this));
				return false;
			}
		});

		// set new client username
		function setUsername () {
			username = cleanInput($('#username-input').val().trim());

			// username validation
			if (username)
			{
				// change username-group to welcome
				$('#username-group').fadeOut('slow', function (){
					$(this).html('<p class="text-primary">Welcome, ' + username + '!</p>').fadeIn();
				});
				// show message form
				$('#message-group').fadeIn();
				$('#message-input').focus();

				socket.emit('add_user', username);
				connected = true;
			}
		}

		// set new message
		function setMessage () {
			var message = cleanInput($('#message-input').val().trim());

			// message validation
			if (message && connected)
			{
				socket.emit('add_message', {username: username, message: message});

				$('#message-input').val('').focus();
			}
		}

		// prevents input from having injected markup
		function cleanInput (input) {
			return $('<div/>').text(input).text();
		}

		// initial broadcast containing current usercount
		socket.on('initialize_broadcast', function (data){
			$('#usercount').html(data.usercount);
		});

		// receives broadcast when any user joins
		socket.on('user_joined', function (data){
			$('#usercount').html(data.usercount);
			$('#messages').prepend('<p class="text-success">'+data.username+' has joined the chatroom.</p>');
		});

		// receives broadcast when any user leaves
		socket.on('user_left', function (data){
			$('#usercount').html(data.usercount);
			$('#messages').prepend('<p class="text-danger">'+data.username+' has left the chatroom.</p>');
		});

		// receives broadcast from any new messages
		socket.on('new_message', function (data){
			$('#messages').prepend('<p>'+data.username+': '+data.message+'</p>');
		});
	});