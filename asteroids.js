//Reference: "Make JavaScript Asteroids in One Video", Derek Banas, https://www.youtube.com/watch?v=HWuU5ly0taA
const canvasWidth = 1400;
const canvasHeight = 900;
const nbOfAsteroids = 8;

let canvas;
let ctx;
let keys=[];
let ship;
let bullets = [];
let asteroids = [];
let score = 0;
let lives = 3;
let killed = false;

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
      this.sound.play();
    }
    this.stop = function () {
      this.sound.pause();
    }
}
const soundFire = new sound("fire.mp3");
const soundAsteroidHit = new sound("asteroidHit.mp3");
const soundShipHit = new sound("shipHit.mp3");
const soundYouWin = new sound("youWin.mp3");
const soundYouLoose = new sound("youLoose.mp3");

document.addEventListener('DOMContentLoaded', SetupCanvas);

function SetupCanvas() {
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.fillSytle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ship = new Ship();
    for (let i = 0; i < nbOfAsteroids; i++) {
        asteroids.push(new Asteroid());
        
    }
    document.body.addEventListener("keydown", function(e){
        //console.log("down e.keyCode = " + e.keyCode)
        keys[e.keyCode] = true;
    });
    document.body.addEventListener("keyup", function(e){
        console.log("up e.keyCode = " + e.keyCode)
        keys[e.keyCode] = false;
        if(e.keyCode === 13) {//32 = spacebar, 13 = enter
            if(killed) {
                killed = false;
                Render();
            } 
            if(lives > 0){
                soundFire.play();
            }
            bullets.push(new Bullet(ship.yaw_deg));
            
        }
    });
    Render();
}

class Ship {
    constructor(){
        this.x = canvasWidth/2;
        this.y = canvasHeight/2;
        this.movingForward = false;
        this.speed = 0.1;
        this.velX = 0;
        this.velY = 0;
        this.rotateSpeed_degps = 2;
        this.radius = 15;
        this.yaw_deg = 0;
        this.strokeColor = 'white';
        this.noseX = canvasWidth/2+this.radius;
        this.noseY = canvasHeight/2;
    }

    Rotate(dir) {
        this.yaw_deg += this.rotateSpeed_degps * dir;
        //console.log("angle_deg = " + this.angle_deg);
    }

    Update() {
        let yaw_rad = this.yaw_deg * Math.PI/180;      
        if(this.movingForward) {
            this.velX += this.speed * Math.cos(yaw_rad);
            this.velY += this.speed * Math.sin(yaw_rad);
        }
        if(this.x < this.radius) {
            this.x = canvasWidth;
        }
        if(this.x > canvasWidth) {
            this.x = this.radius;
        }
        if(this.y < this.radius) {
            this.y = canvasHeight;
        }
        if(this.y > canvasHeight) {
            this.y = this.radius;
        }
        this.velX *= 0.99;
        this.velY *= 0.99;
        this.x -= this.velX;
        this.y -= this.velY; 
    }

    Draw() {
        //Angle between vertices of the ship
        let vertAngle_rad = (Math.PI*2)/3;
        let yaw_rad = this.yaw_deg*Math.PI/180; 
        ctx.strokeStyle = this.strokeColor;
        //Draw ship lines
        ctx.beginPath();
        this.noseX = this.x - this.radius * Math.cos(yaw_rad);
        this.noseY = this.y - this.radius * Math.sin(yaw_rad);
        ctx.moveTo(this.noseX, this.noseY);
        ctx.lineTo(this.x - this.radius * Math.cos(vertAngle_rad * 1 + yaw_rad), 
            this.y - this.radius * Math.sin(vertAngle_rad * 1 + yaw_rad));
        ctx.lineTo(this.x, this.y );
        ctx.lineTo(this.x - this.radius * Math.cos(vertAngle_rad * 2 + yaw_rad), 
            this.y - this.radius * Math.sin(vertAngle_rad * 2 + yaw_rad));     
        ctx.closePath(); //draws line between last and first vertex
        ctx.stroke();
        //Draw red circle at the nose of ship
        ctx.beginPath();
        const circleRadius = 2;
        const startAngle_rad = 0;     
        const endAngle_rad = 2*Math.PI;     
        ctx.arc(this.noseX, this.noseY, circleRadius, startAngle_rad, endAngle_rad);
        ctx.fillStyle = "red";
        ctx.fill();
    }
}

class Bullet {
    constructor(yaw_deg) {
        this.x = ship.noseX;
        this.y = ship.noseY;
        this.yaw_deg = yaw_deg;
        this.height = 4;
        this.width = 4;
        this.speed = 7;
    }
    Update() {
        let yaw_rad = this.yaw_deg * Math.PI / 180;
        this.x -= this.speed*Math.cos(yaw_rad);
        this.y -= this.speed*Math.sin(yaw_rad);
    }
    Draw() {
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Asteroid {
    constructor(x, y, radius, level, collisionRadius) {
        this.x = x || Math.floor(Math.random()*canvasWidth);
        this.y = y || Math.floor(Math.random()*canvasHeight);
        //Make sure no asteroid spawns near ship spawn location
        if(Math.abs(this.x - canvasWidth/2) < 2*ship.radius && Math.abs(this.x - canvasWidth/2) < 2*ship.radius) {
            console.log("Asteroid near ship spawn location, changing x to zero");
            this.x = 0;
        }
        this.speed = 2;
        this.radius = radius || 50;
        this.yaw_deg = Math.floor(Math.random()*359);
        this.strokeColor = "white";
        this.numberOfSides = 7; //6 = Hexagon
        this.collisionRadius = collisionRadius || 46;
        this.level = level || 1;
    }
    Update() {
        let yaw_rad = Math.PI/180*this.yaw_deg;
        this.x += Math.cos(yaw_rad)*this.speed;
        this.y += Math.sin(yaw_rad)*this.speed;
        if(this.x < this.radius) {
            this.x = canvasWidth;
        }
        if(this.x > canvasWidth) {
            this.x = this.radius;
        }
        if(this.y < this.radius) {
            this.y = canvasHeight;
        }
        if(this.y > canvasHeight) {
            this.y = this.radius;
        }
    }

    Draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.strokeColor;
        let vertAngle_rad = 2*Math.PI/this.numberOfSides; 
        let yaw_rad = Math.PI/180*this.yaw_deg;
        for (let i = 0; i < this.numberOfSides; i++) {
            ctx.lineTo(this.x - this.radius*Math.cos(vertAngle_rad*i + yaw_rad),
                this.y - this.radius*Math.sin(vertAngle_rad*i + yaw_rad));
        }
        ctx.closePath();
        ctx.stroke();
    }
}

function CircleCollision(x1, y1, r1, x2, y2, r2) {
    let radiusSum = r1+r2;
    let xDiff = x1-x2;
    let yDiff = y1-y2;
    return (radiusSum > Math.sqrt(xDiff*xDiff + yDiff*yDiff));
}

function showTextOnScreen(text, x, y, font) {
    //console.log("show text: " + text);
    ctx.fillStyle = "white";
    ctx.font = font;    
    ctx.fillText(text, x, y);
}

function clearScreen() {
    //ctx.clearRect(0,0,canvasWidth, canvasHeight); //Does not work in Chrome browser
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

// Handles drawing life ships on screen
function DrawLifeShips(){
    let startX = 1350;
    let startY = 10;
    let points = [[9, 9], [-9, 9]];
    ctx.strokeStyle = 'white'; // Stroke color of ships
    // Cycle through all live ships remaining
    for(let i = 0; i < lives; i++){
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        // Cycle through all other points
        for(let j = 0; j < points.length; j++){
            ctx.lineTo(startX + points[j][0], startY + points[j][1]);
        }
        // Draw from last point to 1st origin point
        ctx.closePath();
        // Stroke the ship shape white
        ctx.stroke();
        // Move next shape 30 pixels to the left
        startX -= 30;
    }
}

function Render() {
    clearScreen();
    showTextOnScreen('SCORE: ' + score.toString(), 20, 35, "21px Arial");

    // If no lives signal game over
    if(lives <= 0){
        showTextOnScreen("GAME OVER", canvasWidth / 2 - 150, canvasHeight / 2, '50px Arial');
        soundYouLoose.play();
        return;
    } else if (killed) {
        showTextOnScreen("You got hit. Lives = " + lives + ". Press enter...", canvasWidth / 2 - 350, canvasHeight / 2, '50px Arial');
        return;
    }
    DrawLifeShips();

    ship.movingForward = keys[87]; //87 = w
    if (keys[68]) { //68 = d
        ship.Rotate(1);
    }
    if (keys[65]) { //65 = a
        ship.Rotate(-1);
    }    
    if(asteroids.length !== 0) {
        for (let i = 0; i < asteroids.length; i++) {            
            if(CircleCollision(ship.x, ship.y, 11, asteroids[i].x, asteroids[i].y, asteroids[i].collisionRadius)){
                showTextOnScreen("Ship collided with asteroid #" + i);
                ship.x = canvasWidth/2;
                ship.y = canvasHeight/2;
                ship.velX = 0;
                ship.velY = 0;
                //Move asteroid away to prevent multiple hits when hit occured at screen center
                asteroids[i].x -= 200;
                asteroids[i].y -= 200;
                lives--;
                killed = true;
                soundShipHit.play();
            }            
        }        
    } else {
        showTextOnScreen("YOU WIN!", canvasWidth / 2 - 150, canvasHeight / 2, '50px Arial');
        showTextOnScreen("Refresh page to restart game.", canvasWidth / 2 - 350, canvasHeight / 2 + 50, '50px Arial');
        soundYouWin.play();
        return;
    }

    if(asteroids.length !== 0 && bullets.length !== 0) {
        loop1:
        for (let i = 0; i < asteroids.length; i++) {
            for (let j = 0; j < bullets.length; j++) {
                if(CircleCollision(bullets[j].x, bullets[j].y, 3, asteroids[i].x, asteroids[i].y, 
                    asteroids[i].collisionRadius)) {
                    showTextOnScreen("Bullet collided with asteroid #" + i);
                    if(asteroids[i].level === 1) {//break asteroid down
                            asteroids.push(new Asteroid(asteroids[i].x-5, asteroids[i].y-5, 25, 2, 22));
                            asteroids.push(new Asteroid(asteroids[i].x+5, asteroids[i].y+5, 25, 2, 22));
                        } else if(asteroids[i].level === 2) {
                            asteroids.push(new Asteroid(asteroids[i].x-5, asteroids[i].y-5, 15, 3, 12));
                            asteroids.push(new Asteroid(asteroids[i].x+5, asteroids[i].y+5, 15, 3, 12));
                        }
                        asteroids.splice(i, 1);
                        bullets.splice(j, 1);
                        score += 20;
                        soundAsteroidHit.play();
                        break loop1;
                    }                
            }      
        }
    }
        
    ship.Update();
    ship.Draw();

    if(bullets.length !== 0) {
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].Update();
            bullets[i].Draw();             
        }
    }
    if(asteroids.length !== 0) {
        for (let i = 0; i < asteroids.length; i++) {
            asteroids[i].Update();
            asteroids[i].Draw();             
        }
    }
    requestAnimationFrame(Render);
}