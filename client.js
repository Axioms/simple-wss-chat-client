const readline = require('readline');
const colors = ["\x1b[31m", "\x1b[32m", "\x1b[33m", "\x1b[34m", "\x1b[35m", "\x1b[36m", "\x1b[37m"];
const clearInput = '\033[1A';
const resetColor = "\x1b[0m";
function askQuestion(query) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise(resolve => rl.question(query, ans => {
		rl.close();
		resolve(ans);
	}))
}

var user = {
	name: null,
	color: null,
	message: null
}

async function menu() {
	user.name = await askQuestion("username: ");

	for(let i = 0; i < colors.length; i++) {
		console.log(colors[i] + i + resetColor);
	}

	user.color = await askQuestion("color [0-6]: ");
	
	var lines = process.stdout.getWindowSize()[1];
	for (var i = 0; i < lines; i++) {
		console.log('\r\n');
	}
}

menu().then(() => {
	var socket = require('socket.io-client')('wss://axioms.ddns.net', {secure: true});
	var stdin = process.openStdin();



	stdin.addListener("data", function (d) {
		user.message = d.toString().trim();
		socket.emit('message', user);
	});

	socket.on('connect', function () {
		console.log("connected");
		socket.emit('join', user);
	});

	socket.on('disconnect', function () { 
		console.log("the server died :'(");
		socket.emit('leave', user);
	});

	socket.on('disconnecting', function () {
		socket.emit('leave', user);
	})
	socket.on('message', data => {
		if(data.name == user.name) {
			console.log(clearInput + colors[data.color] + data.name + ": " + resetColor + data.message);
		} else {
			console.log(colors[data.color] + data.name + ": " + resetColor + data.message);
		}
	});

	socket.on('join', data => {
		console.log(data);
	});

	socket.on('leave', data => {
		console.log(data);
	});
});