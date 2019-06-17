function randint(n) {
	return Math.round(Math.random() * n);
}

function rand(n) {
	return Math.random() * n;
}

function randValue(val) {
	return Math.floor((Math.random() * val));
}

class Stage {
	constructor(canvas, minimap, info) {
		this.canvas = canvas;
		this.minimap = minimap;
		this.info = info;
		this.killed = 0;
		this.flag = true; //keep track if if the game is still going on
		this.isTreeCollision = false;

		this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
		this.player = null; // a special actor, the player
		this.bullets = []; //keep track of all the bullets currently on the stage

		// the logical width and height of the stage
		this.width = canvas.getBoundingClientRect().width;
		this.height = canvas.getBoundingClientRect().height;
		this.infoWidth = info.getBoundingClientRect().width;
		this.infoHeight = info.getBoundingClientRect().height;
		this.miniMapWidth = minimap.getBoundingClientRect().width;
		this.miniMapHeight = minimap.getBoundingClientRect().height;
		this.fieldWidth = 1000;
		this.fieldHeight = 1000;
		this.rate = 100 * this.miniMapWidth / this.width;

		this.stageLeft = 0;
		this.stageTop = 0;
		this.xOffset = 0;
		this.yOffset = 0;

		this.dx = 0;
		this.dy = 0;

		//add a pond 
		var p = new Pond(this, new Pair(100, 500));
		this.addActor(p);
		this.pond = p;

		//add special box to get wire material
 
		var t = new WireBox(this, new Pair(700, 100));
		this.addActor(t);

		// Add the player to the center of the stage
		this.addPlayer(new Player(this, Math.floor(this.width / 2), Math.floor(this.height / 2)));

		//add a jetpack 
		var jetpack = new Jetpack(this, new Pair(210, 500));
		this.addActor(jetpack);

		//add a rocket
		var rocket = new Rocket(this, new Pair(210, 220));
		this.addActor(rocket);
		
		var r = new Rocket(this, new Pair(1100, 0));
		this.addActor(r);

		var r2 = new Rocket(this, new Pair(1500, 1500));
		
		//add a shotgun 
		var total = 7;
		while (total > 0) {
			var s = new Shotgun(this, new Pair(Math.random()*3000, Math.random()*3000)); 
			this.addActor(s);
			total--;
			}

		var shotgun = new Shotgun(this, new Pair(650, 400));
		this.addActor(shotgun);

		//add a rifle 
		var rifle = new Rifle(this, new Pair(300, 390));
		this.addActor(rifle);

		//add ammo and health boxes to the stage 
		var total = 8;
		while (total > 0) {
			if (total % 2 == 0) {
				var type = "ammo";
			} else {
				var type = "health";
			}
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			var box = new Box(this, new Pair(x, y), type);
			this.addActor(box);
			total--;
		}

		//add some trees
		var total = 4;
		var p = [new Pair(0, 0), new Pair(1000, 0), new Pair(0, 1000), new Pair(1000, 1000)]
		while (total > 0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			var tree = new Tree(this, p[total - 1]);
			this.addActor(tree);
			total--;
		}

		var total = 500; 
		while (total > 0) {
			var tree = new Tree(this, new Pair(Math.random()*8000, Math.random()*8000));
			this.addActor(tree); 
			total--;}
		//add in some special opponents, devils
		var total = 5;
		while (total > 0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if (this.getActor(x, y) === null) {
				var velocity = new Pair(Math.random() * 10, Math.random() * 10);
				var position = new Pair(x, y);
				var d = new Devil(this, position, velocity);
				this.addActor(d);
				total--;
			}
		}
		// Add in some reguler Opponents  
		var total = 10;
		while (total > 0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if (this.getActor(x, y) === null) {
				var velocity = new Pair(Math.random() * 5, Math.random() * 5);
				var radius = 30;
				var colour = 'blue';

				var position = new Pair(x, y);
				var o = new Opponent(this, position, velocity, colour, radius);
				this.addActor(o);
				total--;
			}
		}
	}
	getRandPos() {
		var fieldX = Math.floor((Math.random() * this.fieldWidth));
		var fieldY = Math.floor((Math.random() * this.fieldHeight));
		var x = fieldX - this.stageLeft;
		var y = fieldY - this.stageTop;
		return {
			fx: fieldX,
			fy: fieldY,
			x: x,
			y: y
		}
	}

	checkGameOver() {
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i] instanceof Opponent || this.actors[i] instanceof Devil) {
				return null;
			}
		}
		alert("Victory royale!");
		this.flag = false;
	}

	addPlayer(player) {
		//this.addActor(player);
		this.player = player;
	}

	removePlayer() {
		//this.removeActor(this.player);
		this.player = null;
	}

	addActor(actor) {
		this.actors.push(actor);
	}

	removeActor(actor) {
		var index = this.actors.indexOf(actor);
		if (index != -1) {
			this.actors.splice(index, 1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step() {
		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].step();
		}
		for (var j = 0; j < this.bullets.length; j++) {
			this.bullets[j].step();
		}

		this.player.step();
		if (this.flag) {
			this.checkGameOver();
		} //check if the player won the game
	}

	draw() {
		var context = this.canvas.getContext('2d');
		var infoContext = this.info.getContext('2d');
		var miniMapContext = this.minimap.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		infoContext.clearRect(0, 0, this.infoWidth, this.infoHeight);
		miniMapContext.clearRect(0, 0, this.miniMapWidth, this.miniMapHeight);

		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].position.x += this.xOffset;
			this.actors[i].position.y += this.yOffset;
			this.actors[i].draw(context, miniMapContext);
		}

		this.player.draw(context, miniMapContext);

		for (var j = 0; j < this.bullets.length; j++) {
			// this.bullets[j].position.x += this.xOffset;
			// this.bullets[j].position.y += this.yOffset;
			this.bullets[j].draw(context);
		}

		this.xOffset = 0;
		this.yOffset = 0;

		context.font = "10px Arial";
		context.fillText("Avoid collision with the moving zombies. Watch out they can shoot too. Shoot by clicking. Press 'h' to change weapons, 'f' to build.", 10, 30);

		infoContext.font = "normal 20px Verdana";
		infoContext.fillText("Rifle ammo: " + this.player.rifleAmmo, 10, 30);
		infoContext.fillText("Shotgun ammo : " + this.player.shotgunAmmo, 10, 50);
		infoContext.fillText("Rocket ammo: " + this.player.rocketAmmo, 10, 70);
		infoContext.fillText("Health: " + this.player.health, 10, 90);
		infoContext.fillText("Current weapon: " + this.player.currWeapon, 10, 110);
		infoContext.fillText("Wire material: " + this.player.wire, 10, 130);
		infoContext.fillText("Kills: " + this.killed, 10, 150);
	}
	update() {
		for (var i in this.actors) {
			this.actors[i].position.x -= this.dx;
			this.actors[i].position.y -= this.dy;
		}
		for (var j in this.bullets) {
			this.bullets[j].position.x -= this.dx;
			this.bullets[j].position.y -= this.dy;
		}
	}
	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x, y) {
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i].x == x && this.actors[i].y == y) {
				return this.actors[i];
			}
		}
		if (this.player.xPos == x && this.player.yPos == y) {
			return this.player;
		}
		return null;
	}
} // End Class Stage

class Pond {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
	}
	draw(context, miniContext) {
		var p = document.getElementById("pond");
		context.drawImage(p, this.position.x, this.position.y, 400, 400);
		miniContext.drawImage(p, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100,
			400 * this.stage.rate / 100, 400 * this.stage.rate / 100);
	}
	step() {}
}

//a special type of AI 
class Devil {
	constructor(stage, position, velocity) {
		this.stage = stage;
		this.position = position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.velocity = velocity;
		this.radius = 30;
		this.ammo = 200;
		this.health = 200;
		this.isDead = false;
		this.lastShot = 1; // keep track of whether AI should shoot. If this num mod 100 == 0, shoot
	}

	attack() {
		//var x = this.stage.player.xPos;
		//var y = this.stage.player.yPos;
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs(this.position.x - x) < 200 && Math.abs(this.position.y - y) < 200) {
			var pos = new Pair(this.position.x, this.position.y);
			var dest = new Pair(x, y);
			var b = new Bullet(this.stage, pos, this, dest, 3, 10);
			this.stage.bullets.push(b);
			this.ammo--;
		}
	}

	headTo(position) {
		this.velocity.x = (position.x - this.position.x);
		this.velocity.y = (position.y - this.position.y);
		this.velocity.normalize();
	}

	getShot(damage) {
		this.health = this.health - damage;
		if (this.health == 0 || this.health < 0) {
			this.isDead = true;
			this.stage.removeActor(this);
			this.stage.killed += 1;
		}
	}

	//the AI does damage by colliding with the player.
	// this function also checks collision of AI with wall that player built
	checkCollision() {
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs(this.position.x - x) < 50 && Math.abs(this.position.y - y) < 50) {
			this.stage.player.getShot(10);
			this.position.x -= 80;
			this.position.y -= 80;
		}
	}

	draw(context, miniContext) {
		var d = document.getElementById("devil");
		context.drawImage(d, this.position.x, this.position.y, 45, 45);
		miniContext.drawImage(d, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100, 45 * this.stage.rate / 100, 45 * this.stage.rate / 100);
	}

	step() {
		this.lastShot++;
		if (this.lastShot % 40 == 0) {
			this.attack();
		} //the AI should shoot in intervals when player is nearby and not shoot at beginning
		this.position.x = this.position.x + this.velocity.x;
		this.position.y = this.position.y + this.velocity.y;

		this.checkCollision(); // each step, check if the AI collided with anything on the stage
		// bounce off the walls
		if (this.position.x < -1000) {
			this.position.x = -1000;
			this.velocity.x = -Math.abs(this.velocity.x);
		}
		if (this.position.x > 1000) {
			this.position.x = 1000;
			this.velocity.x = -Math.abs(this.velocity.x);
		}
		if (this.position.y < -1000) {
			this.position.y = -1000;
			this.velocity.y = -Math.abs(this.velocity.y);
		}
		if (this.position.y > 1000) {
			this.position.y = 1000;
			this.velocity.y = -Math.abs(this.velocity.y);
		}
		this.intPosition();
	}
	intPosition() {
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
}

//this class is a special box that gives you the ability to build a (barbed wire) fence
class WireBox {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
		this.actualPos = position;
	}
	draw(context, miniContext) {
		var t = document.getElementById("box");
		context.drawImage(t, this.position.x, this.position.y, 70, 70);
		miniContext.drawImage(t, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100, 70 * this.stage.rate / 100, 70 * this.stage.rate / 100);
	}
	checkCollision() {
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs(this.position.x - x) < 50 && Math.abs(this.position.y - y) < 50) {
			alert("you've acquired some barbed wire material. Press 'f' to build a barbed wire fence - it does 15 damage to a zombie."); //alert the user: you can now build
			this.stage.player.wire += 100;
			var index = this.stage.actors.indexOf(this);
			this.stage.actors.splice(index, 1);
		}
	}

	step() {
		this.checkCollision();
	}
}
class Wire {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
		this.actualPos = position;
		this.health = 100;
	}
	draw(context, miniContext) {
		var w = document.getElementById("wire");
		context.drawImage(w, this.position.x, this.position.y, 50, 50);
		miniContext.drawImage(w, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100, 50 * this.stage.rate / 100, 50 * this.stage.rate / 100);
	}
	getShot(damage) {
		this.health -= damage;
		if (this.health < 1) {
			var index = this.stage.actors.indexOf(this);
			this.stage.actors.splice(index, 1);
		}
	}
	step() {
		this.checkCollision();
	}
	checkCollision() {
		for (var i = 0; i < this.stage.actors.length; i++) {
			if (this.stage.actors[i] instanceof Opponent || this.stage.actors[i] instanceof Devil) {
				if (Math.abs(this.position.x - this.stage.actors[i].position.x) < 30 && Math.abs(this.position.y - this.stage.actors[i].position.y) < 30) {
					var opp = this.stage.actors[i];
					this.stage.actors[i].getShot(15); // barbed wire does 15 damage
					if (opp.isDead) {
						this.stage.player.kills += 1;
					}
					var index = this.stage.actors.indexOf(this); //remove barbed wire when AI steps on it 
					this.stage.actors.splice(index, 1);
				}
			}
		}
	}
}
//the jetpack object doesn't dissappear. If player walks over it, he's teleported (flies) across the screen
class Jetpack {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
	}

	draw(context, miniContext) {
		var j = document.getElementById("jetpack");
		context.drawImage(j, this.position.x, this.position.y, 70, 70);
		miniContext.drawImage(j, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100,
			70 * this.stage.rate / 100, 70 * this.stage.rate / 100);
	}

	checkCollision() {
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs(this.position.x - x) < 70 && Math.abs(this.position.y - y) < 70) {

			this.stage.player.xPos = 50; //transport the player to top right of screen - fly on jetpack
			this.stage.player.yPos = 50;
		}
	}

	step() {
		this.checkCollision();
	}

}
class Rifle {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
		this.actualPos = position;
		this.flag = true;
	}
	draw(context, miniContext) {
		var r = document.getElementById("rifle");
		context.drawImage(r, this.position.x, this.position.y, 70, 70);
		miniContext.drawImage(r, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100, 70 * this.stage.rate / 100, 70 * this.stage.rate / 100);
	}
	step() {
		if (this.flag)
			this.checkCollision();
	}
	checkCollision() {
		var x = this.stage.width / 2;
		var y = this.stage.width / 2;
		if (Math.abs(this.position.x - x) < 70 && Math.abs(this.position.y - y) < 70) {
			var index = this.stage.actors.indexOf(this);
			this.stage.actors.splice(index, 1);
			//this.position.x = this.stage.player.xPos + 20;
			//this.position.y = this.stage.player.yPos;
			this.owner = this.stage.player;
			this.stage.player.weapons.push(this);
			this.stage.player.currWeapon = "Rifle";
			this.stage.player.hasRifle = true;
			//this.stage.player.Rifle = this;
			this.stage.player.rifleAmmo += 80;
			this.flag = false;
		}
	}
}

class Shotgun {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
		this.actualPos = position;
		this.owner = null;
		this.flag = true; //keep track of whether we need to check for pick up
	}

	draw(context, miniContext) {
		var r = document.getElementById("shotgun");
		context.drawImage(r, this.position.x, this.position.y, 90, 70);
		miniContext.drawImage(r, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100, 90 * this.stage.rate / 100, 70 * this.stage.rate / 100);
	}

	step() {
		if (this.flag) {
			this.checkCollision();
		}
	}

	checkCollision() {
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs(this.position.x - x) < 70 && Math.abs(this.position.y - y) < 70) {
			var index = this.stage.actors.indexOf(this);
			this.stage.actors.splice(index, 1);
			//this.position.x = this.stage.player.xPos + 20;
			//this.position.y = this.stage.player.yPos;
			this.owner = this.stage.player;
			this.stage.player.weapons.push(this);
			this.stage.player.currWeapon = "Shotgun";
			this.stage.player.hasShotgun = true;
			//this.player.Shotgun = this;
			this.stage.player.shotgunAmmo += 30;
			this.flag = false;
		}
	}
}

//if you pick up the rocket object, you get unlimted rocket ammo while holding. The catch: can't drop/change the weapon unless you hop on jetpack
class Rocket {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
		this.actualPos = position;
		this.owner = null;
		this.flag = true;
	}
	draw(context, miniContext) {
		var r = document.getElementById("rocket");
		context.drawImage(r, this.position.x, this.position.y, 80, 60);
		miniContext.drawImage(r, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100, 80 * this.stage.rate / 100, 60 * this.stage.rate / 100);
	}
	//step() {return null;} 

	step() {
		if (this.flag) {
			this.checkCollision();
		}
	}
	checkCollision() {
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs(this.position.x - x) < 70 && Math.abs(this.position.y - y) < 70) {
			var index = this.stage.actors.indexOf(this);
			this.stage.actors.splice(index, 1);
			//this.position.x = this.stage.player.xPos + 20;
			//this.position.y = this.stage.player.yPos;
			this.owner = this.stage.player;
			this.stage.player.weapons.push(this);
			this.stage.player.currWeapon = "Rocket";
			this.stage.player.hasRocket = true;
			//this.stage.player.Rocket = this;
			this.stage.player.rocketAmmo += 12;
			this.flag = false;
		}
	}
}
//Tree is the obstacle on the map. Can't move through them. Other than that, no function. 
class Tree {
	constructor(stage, position) {
		this.stage = stage;
		this.position = position;
		this.actualPos = position;
	}

	draw(context, miniContext) {
		var box = document.getElementById("tree");
		context.drawImage(box, this.position.x, this.position.y, 50, 50);
		miniContext.drawImage(box, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100, 50 * this.stage.rate / 100, 50 * this.stage.rate / 100);
	}
	//trees can be destroyed
	getShot(damage) {
		var index = this.stage.actors.indexOf(this);
		this.stage.actors.splice(index, 1);
	}

	step() {
		this.checkCollision();
	}

	//handle collision of player with tree, bounce off tree if get too close
	checkCollision() {
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs(this.position.x - x) < 80 && Math.abs(this.position.y - y) < 80) {
			if (x < this.position.x && y < this.position.y) {
				this.stage.player.xPos -= 60;
				this.stage.player.yPos -= 60;
			} else if (x < this.position.x && y > this.position.y) {
				this.stage.player.xPos -= 60;
				this.stage.player.yPos += 60;
			} else if (x > this.position.x && y > this.position.y) {
				this.stage.player.xPos += 60;
				this.stage.player.yPos += 60;
			} else {
				this.stage.player.xPos += 60;
				this.stage.player.yPos -= 60;
			}
		}
	}

	intPosition() {
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
} //End Tree class 		

//this class handles the boxes that contain health or ammo
class Box {
	constructor(stage, position, object) {
		this.stage = stage;
		this.position = position;
		this.actualPos = position;
		this.object = object; //contents of the box. Ammo or health? 
	}

	draw(context, miniContext) {
		if (this.object == "health") {
			var im = "healthBox";
		} else {
			var im = "box";
		}
		var b = document.getElementById(im);
		context.drawImage(b, this.position.x, this.position.y, 50, 50);
		miniContext.drawImage(b, this.position.x * this.stage.rate / 100, this.position.y * this.stage.rate / 100, 50 * this.stage.rate / 100, 50 * this.stage.rate / 100);
	}
	//if the player walks over ("collides with") the box, then player gets the contents of the box in inventory
	checkCollision() {
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs((this.position.x + 25) - x) < 70 && Math.abs((this.position.y + 25) - y) < 70) {
			if (this.object == "ammo") {
				var r = Math.floor(Math.random() * 3);

				if (r == 0) {
					this.stage.player.rifleAmmo += 50;
				} else if (r == 1) {
					this.stage.player.shotgunAmmo += 20;
				} else if (r == 2) {
					this.stage.player.rocketAmmo += 10;
				} else if (r == 4) {
					this.stage.player.rifleAmmo += 20;
					this.stage.player.shotgunAmmo += 10;
					this.stage.player.rocketAmmo += 5;
				}
			} else {
				this.stage.player.health = 100;
			}
			var index = this.stage.actors.indexOf(this);
			this.stage.actors.splice(index, 1);
		}
	}
	//player can also shoot box to get the contents
	getShot(damage) {
		var index = this.stage.actors.indexOf(this);
		this.stage.actors.splice(index, 1);
	}
	step() {
		this.checkCollision();
	}
	intPosition() {
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

}
//End Box class	

//player class
class Player {
	constructor(stage, xPos, yPos) {
		this.stage = stage;
		this.xPos = xPos;
		this.yPos = yPos;
		this.radius = 50;
		this.rate = this.stage.rate;
		this.health = 100;
		this.colour = 'black';
		this.currWeapon = null; // the current weapon the player is holding. Start with nothing.
		this.rifleAmmo = 0;
		this.weapons = []; //store weapons the player has in a list 
		this.shotgunAmmo = 0;
		this.rocketAmmo = 0;
		this.wire = 0;
		this.hasRocket = false;
		this.hasShotgun = false;
		this.hasRifle = false;
		this.kills = 0; //keep track of how many kills the player has
		this.walkSlow = false; //if the player is in the pond or nearby, change this to true.
	}
	//if the player is in the pond, while the player is in the pond move slowly
	inPond() {
		var xPos = this.stage.pond.position.x;
		var yPos = this.stage.pond.position.y;
		console.log("Pond: x = ", xPos, ", y = ", yPos);
		if ((this.stage.width / 2 - xPos) < 340 && (this.stage.width / 2 - xPos) > 100 && (this.stage.height / 2 - yPos) > 120 && (this.stage.height / 2 - yPos) < 350) {
			this.walkSlow = true;
			console.log("In Pond");
		} else {
			this.walkSlow = false;
		}
	}
	//player can build a barbed wire fence if has material to do so. By pressing 'f' key.
	build() {
		if (this.wire > 0) {
			var w = new Wire(this.stage, new Pair(this.stage.width / 2 + 20, this.stage.height / 2 + 20)); //drop a barbed wire where the player is standing currently
			this.stage.addActor(w);
			this.wire--;
		}
	}

	draw(context, miniContext) {
		context.fillStyle = this.colour;
		miniContext.fillStyle = this.colour;
		context.beginPath();
		this.stage.xOffset = (this.stage.width / 2 - this.xPos);
		this.stage.yOffset = (this.stage.width / 2 - this.yPos);

		context.arc(this.stage.width / 2 - this.radius / 2, this.stage.width / 2 - this.radius / 2, 50, 0, 2 * Math.PI, false);
		context.fill();
		miniContext.beginPath();
		miniContext.arc(this.stage.miniMapWidth / 2 - this.radius * this.rate / 200, this.stage.miniMapHeight / 2 - this.radius * this.rate / 200, 50 * this.rate / 100, 0, 2 * Math.PI);
		miniContext.fill();
	}

	getShot(damage) {
		this.health = this.health - damage;
		if (this.health == 0 || this.health < 0) { //dead 
			this.stage.removePlayer();
			var request = new XMLHttpRequest();
			console.log(this);
			var obj = {
				name: document.cookie.substr(document.cookie.indexOf(';')+2),
				killed: this.stage.killed
			}
			console.log(obj);
			request.open('POST', '/api/user',  true);
			request.send(obj);
			console.log(obj);
			alert("you died!");
		}
	}
	//move player with wasd
	move(stage, x, y) {
		if (this.walkSlow) {
			this.xPos += x * 3;
			this.xActualPos -= x * 3;
			this.yPos += y * 3;
			this.yActualPos -= y * 3;
		} else {
			this.xPos += x * 20;
			this.xActualPos -= x * 20;
			this.yPos += y * 20;
			this.yActualPos -= y * 20;
		}
	}

	step() {
		this.inPond(); // check if the player is in the pond. If so, move slow. 
		if (this.xPos > 1000) {
			this.xPos = 1000;}
		else if (this.xPos < 0) {
			this.xPos = 0;}
		else if (this.yPos > 1000) {
			this.yPos = 1000;}
		else if (this.yPos < 0) {
			this.yPos = 0;}
	}

	//x and y are the coordinates of the mouse click in shoot(x, y)...
	//break shooting into three cases depending on what gun the player is currently holding
	shoot(x, y) {
		var w = this.currWeapon;
		console.log("From (", this.stage.width / 2, ", ", this.stage.height / 2, ") to (", x, ", ", y, ")");

		var position = new Pair(this.stage.width / 2, this.stage.width / 2);
		var destination = new Pair(x, y); //where the bullet is heading

		if (w == "Rifle" && this.rifleAmmo > 0) {
			var b = new Bullet(this.stage, position, this, destination, 25, 5);
			this.stage.bullets.push(b);
			this.rifleAmmo--;
		} else if (w == "Shotgun" && this.shotgunAmmo > 0) {
			var b = new Bullet(this.stage, position, this, destination, 50, 10);
			this.stage.bullets.push(b);
			this.shotgunAmmo--;
		} else if (w == "Rocket" && this.rocketAmmo > 0) {
			var b = new Bullet(this.stage, position, this, destination, 100, 40);
			var c = new Bullet(this.stage, position, this, destination, 100, 40);
			this.stage.bullets.push(b);
			this.stage.bullets.push(c); //rocket fires two bullets
			this.rocketAmmo--;
		}
	}
}
//End Player class 


//this class captures the bullets on the stage
class Bullet {
	constructor(stage, position, owner, destination, damage, size) {
		this.stage = stage;
		this.owner = owner; // who fired the bullet? 
		this.damage = damage; // the damage of the bullet;
		this.destination = destination; // where is the bullet headed? (mouse click determines this in player case)
		this.position = position; // current position of the bullet on the canvas: (x, y) coordinate
		this.actualPos = position;
		this.radius = size; //size of the bullet
		this.intPosition();
		this.velocity = new Pair(5, 5);
		this.colour = "black";
	}

	headTo() {
		this.position.x += (this.destination.x - this.position.x) / 3;
		this.position.y += (this.destination.y - this.position.y) / 3;
	}

	step() {
		if (Math.abs(this.destination.x - this.position.x) < 1 && Math.abs(this.destination.y - this.position.y) < 1) {
			var index = this.stage.bullets.indexOf(this); //the bullet reached its destination, so remove it from the stage (limited projectile)
			this.stage.bullets.splice(index, 1);
			return null;
		}
		this.intPosition();
		this.checkImpact(); // check if bullet hit any target (other than who fired the bullet)
		this.headTo(); //the bullet heads to its destination each step
	}
	//handles bullet actually making impact with an object (actor/player) on the stage
	checkImpact() {
		var pos = this.position;
		var p = this.stage.player;
		var owner = this.owner;

		var distX = Math.abs(this.stage.width / 2 - pos.x);
		var distY = Math.abs(this.stage.height / 2 - pos.y);
		if (distX < 50 && distY < 50 && owner != p) {
			var index = this.stage.bullets.indexOf(this);
			this.stage.bullets.splice(index, 1);
			p.getShot(this.damage);
			this.damage = 0; //set damage to 0 on impact
		}

		for (var i = 0; i < this.stage.actors.length; i++) {
			var opponent = this.stage.actors[i];
			if (opponent instanceof Rocket || opponent instanceof Rifle || opponent instanceof Shotgun) {} else {
				var distanceX = Math.abs(opponent.position.x - pos.x);
				var distanceY = Math.abs(opponent.position.y - pos.y);
				if (distanceX < 30 && distanceY < 30 && owner != opponent) {
					var index = this.stage.bullets.indexOf(this);
					this.stage.bullets.splice(index, 1);
					if (opponent instanceof Box) { //shooting a Box is a specical case. The player, in this case, gets what's inside the box
						if (opponent.object == "ammo") {
							owner.rifleAmmo += 100;
							owner.shotgunAmmo += 50;
						} else if (opponent.object == "health") {
							owner.health += 100;
						}
					}

					opponent.getShot(this.damage); //call the getShot method of opponent so opponent loses health,etc
					if (opponent instanceof Devil || opponent instanceof Opponent) {
						if (opponent.isDead) {
							this.stage.player.kills += 1;
						}
					}
					this.stage.bullets.splice(index, 1);
					this.damage = 0; //make sure bullet only does damage to one person 
				}
			}
		}
	}

	intPosition() {
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	draw(context) {
		context.fillStyle = this.colour;
		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath();
		context.arc(this.position.x - this.radius / 2, this.position.y - this.radius / 2, this.radius, 0, 2 * Math.PI, false);
		context.fill();
	}
}

class Pair {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	toString() {
		return "(" + this.x + "," + this.y + ")";
	}

	normalize() {
		var magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x = this.x / magnitude;
		this.y = this.y / magnitude;
	}
}
// End Pair class 

//AI class
class Opponent {
	constructor(stage, position, velocity, colour, radius) {
		this.stage = stage;
		this.position = position;
		this.actualPos = position;
		this.intPosition(); // this.x, this.y are int version of this.position

		this.velocity = velocity;
		this.colour = colour;
		this.radius = radius;

		this.ammo = 200;
		this.health = 100;
		this.isDead = false;
		this.lastShot = 1; // keep track of whether AI should shoot. If this num mod 100 == 0, shoot
	}

	//handles AI shooting the player when player is nearby
	attack() {
		//var x = this.stage.player.xPos;
		//var y = this.stage.player.yPos;
		var x = this.stage.width / 2;
		var y = this.stage.height / 2;
		if (Math.abs(this.position.x - x) < 250 && Math.abs(this.position.y - y) < 250) {
			var pos = new Pair(this.position.x, this.position.y);
			var dest = new Pair(x, y);
			var b = new Bullet(this.stage, pos, this, dest, 2, 10);
			this.stage.bullets.push(b);
			this.ammo--;
		}
	}

	headTo(position) {
		this.velocity.x = (position.x - this.position.x);
		this.velocity.y = (position.y - this.position.y);
		this.velocity.normalize();
	}
	//handles AI getting shot, losing health depending on the damage level of the bullet
	getShot(damage) {
		this.health = this.health - damage;
		if (this.health == 0 || this.health < 0) {
			this.isDead = true;
			this.stage.killed += 1;
			this.stage.removeActor(this);
		}
	}
	toString() {
		return this.position.toString() + " " + this.velocity.toString();
	}
	//the AI (zombie) does damage by colliding with the player.
	// this function also checks collision of AI with wire fence that player built
	checkCollision() {
		//var x = this.stage.player.xPos;
		//var y = this.stage.player.yPos;
		var x = this.stage.width / 2;
		var y = this.stage.width / 2;
		if (Math.abs(this.position.x - x) < 50 && Math.abs(this.position.y - y) < 50) {
			this.stage.player.getShot(10);
			this.position.x -= 80;
			this.position.y -= 80;
		}
		for (var i = 0; i < this.stage.actors.length; i++) {
			if (this.stage.actors[i] instanceof Wire) {
				var x = this.stage.actors[i].position.x;
				var y = this.stage.actors[i].position.y;
				if (Math.abs(this.position.x - x) < 80 && Math.abs(this.position.x - y) < 80) {
					this.stage.actors.splice(i, 1);
					this.getShot(15);
				}
			}
		}
	}

	step() {
		this.lastShot++;
		if (this.lastShot % 20 == 0) {
			this.attack();
		} //the AI should shoot in intervals when player is nearby
		this.position.x = this.position.x + this.velocity.x;
		this.position.y = this.position.y + this.velocity.y;

		this.checkCollision(); // each step, check if the AI collided with anything on the stage
		// bounce off the walls
		if (this.position.x < -1000) {
			this.position.x = -1000;
			this.velocity.x = Math.abs(this.velocity.x);
		}
		if (this.position.x > 1000) {
			this.position.x = 1000; //this.stage.width;
			this.velocity.x = -Math.abs(this.velocity.x);
		}
		if (this.position.y < -1000) {
			this.position.y = -1000;
			this.velocity.y = Math.abs(this.velocity.y);
		}
		if (this.position.y > 1000) {
			this.position.y = 1000; //this.stage.height;
			this.velocity.y = -Math.abs(this.velocity.y);
		}
		this.intPosition();
	}
	intPosition() {
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}
	draw(context, miniContext) {
		context.fillStyle = this.colour;
		miniContext.fillStyle = this.colour;
		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath();
		context.arc(this.x - this.radius / 2, this.y - this.radius / 2, this.radius, 0, 2 * Math.PI, false);
		context.fill();
		miniContext.beginPath();
		miniContext.arc(this.x * this.stage.rate / 100 - this.radius * this.stage.rate / 200, this.y * this.stage.rate / 100 - this.radius * this.stage.rate / 200, this.radius * this.stage.rate / 100, 0, 2 * Math.PI);
		miniContext.fill();
	}
}
