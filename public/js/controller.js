let stage = null;
view = null;
interval = null;
INTERVAL_TIME = 20;

function setupGame() {
	stage = new Stage(document.getElementById('stage'), document.getElementById('minimap'),
		document.getElementById('info'));
	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', moveByKey);
	document.addEventListener('click', shootClick);
	document.addEventListener('keyup', switchGun);
	document.addEventListener('keyup', dropWall);
}

function startGame() {
	interval = setInterval(
		function () {
			stage.update();
			stage.step();
			stage.draw();
		}, INTERVAL_TIME
	);
}

function pauseGame() {
	clearInterval(interval);
	interval = null;
}

function dropWall(event) {
	var key = event.key;
	if (key == 'f' || key == 'F') {
		stage.player.build();
	}
	stage.dx = 0;
	stage.dy = 0;
}

function switchGun(event) {
	var key = event.key;
	if (key == 'h' || key == 'H') {
		if (stage.player.currWeapon == "Rifle") {
			if (stage.player.hasShotgun) {
				stage.player.currWeapon = "Shotgun";
			} else if (stage.player.hasRocket) {
				stage.player.currWeapon = "Rocket";
			}
		} else if (stage.player.currWeapon == "Shotgun") {
			if (stage.player.hasRocket) {
				stage.player.currWeapon = "Rocket";
			} else if (stage.player.hasRifle) {
				stage.player.currWeapon = "Rifle";
			}
		} else {
			if (stage.player.hasRifle) {
				stage.player.currWeapon = "Rifle";
			} //case where holding rocket
			else if (stage.player.hasShotgun) {
				stage.player.currWeapon = "Shotgun";
			}
		}
	}
}

function moveByKey(event) {
	var key = event.key;
	var moveMap = {
		'a': {
			"dx": -1,
			"dy": 0
		},
		's': {
			"dx": 0,
			"dy": 1
		},
		'd': {
			"dx": 1,
			"dy": 0
		},
		'w': {
			"dx": 0,
			"dy": -1
		}
	};

	if (key in moveMap) {
		if (stage.player.walkSlow) {
			stage.dx = moveMap[key].dx * 3;
			stage.dy = moveMap[key].dy * 3;
		} else {
			stage.dx = moveMap[key].dx * 20;
			stage.dy = moveMap[key].dy * 20;
		}
	}
}

function shootClick(evt) {
	var rect = document.getElementById('stage').getBoundingClientRect();
	stage.player.shoot(evt.clientX - rect.left, evt.clientY - rect.top);
}
