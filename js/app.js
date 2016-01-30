/**
 * app.js
 * A Frogger-style arcade game written in JavaScript and rendered on HTML5 <canvas>
 * Life and collision detection based off based of MDN's Gamedev Canvas tutorial
 * {@link https://developer.mozilla.org/en-US/docs/Games/Workflows/2D_Breakout_game_pure_JavaScript | MDN}
 */

/* GLOBAL VARIABLES
----------------------------------*/

// object literal to hold global vars
var app = {
    CANVAS_WIDTH: 505,
    CANVAS_HEIGHT: 606,
    allItems: [],
    allEnemies: [],
    ENEMY_WIDTH: 101,
    ENEMY_HEIGHT: 48,
    ENEMY_TOP_OFFSET: 72,
    ENEMY_LEFT_OFFSET: 0,
    PLAYER_WIDTH: 82,
    PLAYER_HEIGHT: 88,
    PLAYER_TOP_OFFSET: 51,
    PLAYER_LEFT_OFFSET: 10,
    TILE_WIDTH: 101,
    TILE_HEIGHT: 83,
    gameWon: false,
    gameOver: false,
    gameEasy: true,
    itemsConfig: [
        // [item, x, y] reminder: numbering starts with 0 and not 1
        ['heart', 2, 2], // 3rd col 3rd row
        ['heart', 4, 3], // 5th col 4th row
        ['shell', 1, 0], // 2nd col 1st row
        ['shell', 3, 1], // 4th col 2nd row
        ['shell', 0, 2], // 1st col 3rd row
        ['shell', 3, 3], // 4th col 4th row
        ['shell', 1, 4]  // 2nd col 5th row
    ],
    player: {},
    enemy: {},
    debugMode: false,
    on: document.getElementById('on'),
    off: document.getElementById('off'),
    easy: document.getElementById('easy'),
    hard: document.getElementById('hard')
};

/* DEBUG (show/hide box overlays)
----------------------------------*/

app.on.addEventListener('click', function(e) {
    app.debugMode = true;
    clearFocus();
});

app.off.addEventListener('click', function(e) {
    app.debugMode = false;
    clearFocus();
});

/* GAME DIFFICULTY
----------------------------------*/

app.easy.addEventListener('click', function(e) {
    app.gameEasy = true;
    clearFocus();
    app.player.reset();
    newGame();
});

app.hard.addEventListener('click', function(e) {
    app.gameEasy = false;
    clearFocus();
    app.player.reset();
    newGame();
});

/* HELPER FUNCTIONS
----------------------------------*/

/**
 * Returns a random integer between min (included) and max (included)
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random | MDN}
 * @param  {number} min
 * @param  {number} max
 * @return {number}
 */
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} // getRandomIntInclusive

/**
 * Blurs the whole browser window if active element is document body
 * (clears focus for current active element, ex: radio button)
 */
function clearFocus() {
    if (document.activeElement != document.body)
        document.activeElement.blur();
} // clearFocus

/**
 * Resets game difficulty to 'easy' and debug mode to 'off'
 */
function defaultOptions() {
    app.gameEasy = true;
    app.easy.checked = true;
    app.debugMode = false;
    app.off.checked = true;
    clearFocus();
} // defaultOptions

/**
 * Updates player item info on side canvas
 * @param  {string} type - Item type
 * @param  {string} text - Item total
 */
function updateSideCanvasText(type, text) {
    switch(type) {
        case 'heart' :
            sideCtx.font = 'italic bold 24px Verdana, Arial, Helvetica, Sans-serif';
            sideCtx.fillStyle = '#ff00cc';
            sideCtx.fillText(text, 65, 105);
        break;
        case 'shell':
            sideCtx.font = 'italic bold 24px Verdana, Arial, Helvetica, Sans-serif';
            sideCtx.fillStyle = '#0095dd';
            sideCtx.fillText(text, 65, 270);
        break;
    } // switch
} // updateSideCanvasText

/**
 * Draws winner screen
 */
function wonGame() {
    app.gameWon = true;
    app.allItems = [];
    app.allEnemies = [];
    ctx.clearRect(0, 0, app.CANVAS_WIDTH, app.CANVAS_HEIGHT);
    ctx.beginPath();
    ctx.rect(0, 0, app.CANVAS_WIDTH, app.CANVAS_HEIGHT);
    ctx.fillStyle = '#fff'; // orange overlay
    ctx.fill();
    ctx.closePath();
    ctx.font = 'bold 36px Verdana, Arial, Helvetica, Sans-serif';
    ctx.fillStyle = '#000';
    ctx.fillText('You are a Winner!!!', 62, 202);
    ctx.drawImage(Resources.get('images/winner.png'), 12, app.CANVAS_HEIGHT - 202);
    ctx.font = 'bold 18px Verdana, Arial, Helvetica, Sans-serif';
    ctx.fillText('PRESS SPACE TO PLAY AGAIN', 100, app.CANVAS_HEIGHT - 30);
} // wonGame

/**
 * Creates items, enemies, and player for the gameboard
 */
function newGame() {
    // Items
    for(var h = 0; h < app.itemsConfig.length; h++) {
        var item = app.itemsConfig[h];

        for(var i = 0; i < item.length; i++) {
            if(item[i] == 'heart') {
                var heartX = item[i+1] * app.TILE_WIDTH;
                var heartY = item[i+2] * app.TILE_HEIGHT;
                var heart = new Item(heartX, heartY, 45, 45, 30, 70, item[i]);
                app.allItems.push(heart);
                break; // jump out of the loop
            } // if heart

            if(item[i] == 'shell') {
                var shellX = item[i+1] * app.TILE_WIDTH;
                var shellY = item[i+2] * app.TILE_HEIGHT;
                var shell = new Item(shellX, shellY, 54, 54, 26, 64, item[i]);
                app.allItems.push(shell);
                break; // jump out of the loop
            } // if shell

        } // for item
    } // for app.itemsConfig

    // Player
    app.player = new Player();

    // Enemies
    for(var e = -1; e < 4; e++) {
        var enemyX = app.TILE_WIDTH * -1;
        var enemyY = (app.TILE_HEIGHT * (e + 1)); // rows 1-4
        var enemyS = getRandomIntInclusive(100,300);
        if(app.gameEasy && e === 0) enemyS = 0;  // no enemy
        if(app.gameEasy && e === 3) enemyS = 50; // slow enemy
        app.enemy = new Enemy(enemyX, enemyY, enemyS);
        app.allEnemies.push(app.enemy);
    }

} // newGame

/* GAME CLASSES
----------------------------------*/

/**
 * Items the player can gather in the game
 * @class Item
 * @param {number} x - Horizontal coordinate
 * @param {number} y - Vertical coordinate
 * @param {number} w - Width of item
 * @param {number} h - Height of item
 * @param {number} left - Left offset
 * @param {number} top - Top offset
 * @param {string} item - Name of item which corresponds to image filename
 */
var Item = function(x,y,w,h,left,top,item) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.width = w;
    this.height = h;
    this.leftOffset = left;
    this.topOffset = top;
    this.item = item;
    this.sprite = 'images/' + item + '.png';
    this.incrementer = 0;

    // bounding box (used in collision detection algorithm)
    this.left = this.x + this.leftOffset; // x
    this.top = this.y + this.topOffset;  // y
    this.right = this.left + this.width; // x + width
    this.bottom = this.top + this.height; // y + height
};

/**
 * Oscillate the item in place (update the item x and y coordinates)
 * @memberOf Item
 * {@link {http://www.kirupa.com/html5/introduction_to_easing_in_javascript.htm | Oscillation Formula}
 * @param {number} dt - A time delta between ticks
 */
Item.prototype.update = function(dt) {
    this.incrementer += 0.05;
    this.x += (Math.cos(this.incrementer)/4);
    this.y += (Math.sin(this.incrementer)/4);
    if(this.incrementer >= 6.28) {
        this.incrementer = 0;
        this.x = this.startX;
        this.y = this.startY;
    }
};

/**
 * Draw the item on the canvas
 * @memberOf Item
 */
Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

    if(app.debugMode) {
        ctx.beginPath();
        ctx.rect(this.left, this.top, this.width, this.height);
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // blue overlay
        ctx.fill();
        ctx.closePath();
    }
};

/**
 * Enemies our player must avoid
 * @class Enemy
 * @param {number} x - Horizontal coordinate
 * @param {number} y - Vertical coordinate
 * @param {number} s - Speed
 */
var Enemy = function(x,y,s) {
    this.x = x;
    this.y = y;
    this.speed = s;
    this.sprite = 'images/shark.png';
    this.spriteStart = 'images/shark.png';
    this.spriteHit = 'images/shark-hit.png';
    this.isColliding = false;

    // bounding box (used in collision detection algorithm)
    this.left = this.x + app.ENEMY_LEFT_OFFSET; // x
    this.top = this.y + app.ENEMY_TOP_OFFSET;  // y
    this.right = this.left + app.ENEMY_WIDTH; // x + width
    this.bottom = this.top + app.ENEMY_HEIGHT; // y + height
};

/**
 * Update the enemy's position, required method for game
 * Multiply movement by the dt parameter to ensure
 * the game runs at the same speed for all computers.
 * @memberOf Enemy
 * @param {number} dt - A time delta between ticks
 */
Enemy.prototype.update = function(dt) {

    // if colliding freeze movement
    if(!this.isColliding) this.x = this.x + (dt * this.speed);
    this.y = this.y;
    this.left = this.x + app.ENEMY_LEFT_OFFSET;
    this.top = this.y + app.ENEMY_TOP_OFFSET;
    this.right = this.left + app.ENEMY_WIDTH;
    this.bottom = this.top + app.ENEMY_HEIGHT;
    this.sprite = this.spriteStart;

    // if enemy is off the canvas, then reset position
    if(this.x > app.CANVAS_WIDTH) {
        // reset position by one tile off screen
        this.x = (app.TILE_WIDTH * -1) + (dt * this.speed);
    }

    // check for any collisions with the player
    this.isColliding = this.playerCollision(app.player);

    // change enemy sprite
    if(this.isColliding) this.sprite = this.spriteHit;

    // call player hit method only when not currently being hit
    if(this.isColliding && !app.player.hit) app.player.gotHit();
};

/**
 * Draw the enemy on the screen, required method for game
 * @memberOf Enemy
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

    if(app.debugMode) {
        ctx.beginPath();
        ctx.rect(this.x + app.ENEMY_LEFT_OFFSET,
                 this.y + app.ENEMY_TOP_OFFSET,
                 app.ENEMY_WIDTH,
                 app.ENEMY_HEIGHT);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // green overlay
        ctx.fill();
        ctx.closePath();
    }
};

/**
 * Detect when enemy collides with the player
 * @memberOf Enemy
 * {@link https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection | MDN}
 * @param {object} player
 */
Enemy.prototype.playerCollision = function(player) {
    // Bounding Box collision checks if the rectangles intersect
    // outsideBottom = Rect1.Bottom < Rect2.Top
    // outsideTop = Rect1.Top > Rect2.Bottom
    // outsideLeft = Rect1.Left > Rect2.Right
    // outsideRight = Rect1.Right < Rect2.Left
    // return NOT (outsideBottom OR outsideTop OR outsideLeft OR outsideRight)
    var outsideBottom = this.bottom <= player.top;
    var outsideTop = this.top >= player.bottom;
    var outsideLeft = this.left >= player.right;
    var outsideRight = this.right <= player.left;

    return !(outsideBottom || outsideTop || outsideLeft || outsideRight);
};

/**
 * The player, requires update(), render(), and handleinput() methods.
 * @class Player
 */
var Player = function() {
    this.sprite = 'images/girl-bubble.png';
    this.spriteStart = 'images/girl-bubble.png';
    this.spriteHit = 'images/girl-bubble-hit.png';
    this.spriteLife = 'images/girl-bubble-heart.png';
    this.spriteItem = 'images/girl-bubble-shell.png';
    this.displayImage = 'Start';
    this.displayTimer = 0;
    this.startX = 4 * app.TILE_WIDTH; // start in the 5th column
    this.startY = 5 * app.TILE_HEIGHT; // start in the 6th row
    this.x = this.startX;
    this.y = this.startY;
    this.rate = 0;
    this.hit = false;
    this.lives = 1;
    this.shells = 0;

    // bounding box (used in collision detection algorithm)
    this.left = this.x + app.PLAYER_LEFT_OFFSET; // x
    this.top = this.y + app.PLAYER_TOP_OFFSET;  // y
    this.right = this.left + app.PLAYER_WIDTH; // x + width
    this.bottom = this.top + app.PLAYER_HEIGHT; // y + height
};

/**
 * Resets player, clears items, and enemies
 */
Player.prototype.reset = function() {
    this.x = this.startX;
    this.y = this.startY;
    this.hit = false;
    this.sprite = this.spriteStart;
    this.displayImage = 'Start';
    this.displayTimer = 0;
    this.lives = 1;
    this.shells = 0;
    app.allItems = [];
    app.allEnemies = [];
};

/**
 * Resets player to start position, resets items, and resets enemies
 * Displays 'Game Over' message for 3 seconds and starts a new game
 * @memberOf Player
 */
Player.prototype.restart = function() {
    this.x = this.startX;
    this.y = this.startY;
    this.hit = false;
    this.sprite = this.spriteStart;
    this.displayImage = 'Start';
    this.displayTimer = 0;

    if(this.lives === 0) {
        this.lives = 1;
        this.shells = 0;
        app.gameOver = true;
        app.allItems = [];
        app.allEnemies = [];
        ctx.beginPath();
        ctx.rect(0, 0, app.CANVAS_WIDTH, app.CANVAS_HEIGHT);
        ctx.fillStyle = 'rgba(252, 154, 36, 1)'; // orange overlay
        ctx.fill();
        ctx.closePath();
        ctx.font = 'bold 36px Verdana, Arial, Helvetica, Sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText('GAME OVER', 140, app.CANVAS_HEIGHT / 2);

        // Display game over text for 3 seconds
        setTimeout( function() {
            ctx.clearRect(0, 0, app.CANVAS_WIDTH, app.CANVAS_HEIGHT);
            app.gameOver = false;
            newGame();
        }, 3000);
    } // if zero lives
};

/**
 * Updates bounding box coordinates and checks for item collisions
 * @memberOf Player
 * @param {number} dt - A time delta between ticks
 */
Player.prototype.update = function(dt) {
    // Used in move methods for smooth player movement
    this.rate = dt * 4;

    // Update player bounding box
    this.left = this.x + app.PLAYER_LEFT_OFFSET;
    this.top = this.y + app.PLAYER_TOP_OFFSET;
    this.right = this.left + app.PLAYER_WIDTH;
    this.bottom = this.top + app.PLAYER_HEIGHT;

    // Use default player sprite
    this.sprite = this.spriteStart;

    // Check if player picked up an item
    this.itemCollision();

    // Update the player sprite
    this.updateSprite();
};

/**
 * Sets the player sprite display
 * @memberOf Player
 */
Player.prototype.updateSprite = function() {
    var now = Math.floor(Date.now() / 1000);

    switch(this.displayImage) {
        case 'Life':
            if(this.displayTimer > now)
                this.sprite = this.spriteLife;
            break;
        case 'Item':
            if(this.displayTimer > now)
                this.sprite = this.spriteItem;
            break;
        case 'Hit':
            if(this.displayTimer > now)
                this.sprite = this.spriteHit;
            break;
        default: this.sprite = this.spriteStart;
    }
};

/**
 * Draws the player on screen
 * @memberOf Player
 */
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    updateSideCanvasText('heart','Life: ' + this.lives);
    updateSideCanvasText('shell','Shell: ' + this.shells);

    if(this.shells === 5) {
        defaultOptions();
        wonGame();
    }

    if(app.debugMode) {
        ctx.beginPath();
        ctx.rect(this.x + app.PLAYER_LEFT_OFFSET,
                 this.y + app.PLAYER_TOP_OFFSET,
                 app.PLAYER_WIDTH,
                 app.PLAYER_HEIGHT);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // yellow overlay
        ctx.fill();
        ctx.closePath();
    }
};

/**
 * Handles keyboard inputs
 * @memberOf Player
 * @param {string} k - Keycode of input
 */
Player.prototype.handleInput = function(k) {
    switch(k) {
        case 'stop': /* do nothing */ break;
        case 'left': this.moveLeft(); break;
        case 'right': this.moveRight(); break;
        case 'up': this.moveUp(); break;
        case 'down': this.moveDown(); break;
        case 'spacebar':
            if(app.gameWon) {
                app.gameWon = false;
                this.reset();
                newGame();
            }
        break;
    } // switch
};

/**
 * Moves the player left
 * Freezes player if hit
 * @memberOf Player
 */
Player.prototype.moveLeft = function() {
    if(this.x > 0 && !this.hit) {
        this.x -= this.rate * app.TILE_WIDTH;
    }
};

/**
 * Moves the player right
 * Freezes player if hit
 * @memberOf Player
 */
Player.prototype.moveRight = function() {
    // stop player when canvas width minus one tile width
    if (this.x < (app.CANVAS_WIDTH - app.TILE_WIDTH) && !this.hit) {
        this.x += this.rate * app.TILE_WIDTH;
    }
};

/**
 * Moves the player up
 * Freezes player if hit
 * @memberOf Player
 */
Player.prototype.moveUp = function() {
    if(this.y > -8 && !this.hit) {
        this.y -= this.rate * app.TILE_HEIGHT;
    }
};

/**
 * Moves the player down
 * Freezes player if hit
 * @memberOf Player
 */
Player.prototype.moveDown = function() {
    if(this.y < 432 && !this.hit) {
        this.y += this.rate * app.TILE_HEIGHT;
    }
};

/**
 * Minus player life and change sprite when player gets hit
 * @memberOf Player
 */
Player.prototype.gotHit = function() {
    // Save current 'this' to pass to global function
    var self = this;

    // Change player sprite
    this.displayImage = 'Hit';
    this.displayTimer = (Date.now() / 1000) + 1.1; // 1.1 seconds

    // Freeze the player
    this.hit = true;

    // Minus life
    if(this.lives > 0) this.lives--;

    // Wait 1.1 seconds then reset player position
    setTimeout( function() {
        self.restart();
    }, 1100);
};

/**
 * Checks if the player collided with an item and removes it
 * @memberOf Player
 */
Player.prototype.itemCollision = function() {
    for (var i = 0; i < app.allItems.length; i++) {
        var item = app.allItems[i];

        // bounding box collision test
        var outsideBottom = this.bottom <= item.top;
        var outsideTop = this.top >= item.bottom;
        var outsideLeft = this.left >= item.right;
        var outsideRight = this.right <= item.left;
        var boxIntersect = !(outsideBottom || outsideTop || outsideLeft || outsideRight);

        if (boxIntersect) {
            // remove the item
            app.allItems.splice(i,1);

            // change sprite to player holding item collected
            this.gotItem(item.item);
        } // if
    } // for
};

/**
 * Update player status based on item collected
 * @memberOf Player
 * @param {string} itemType
 */
Player.prototype.gotItem = function(itemType) {
    switch(itemType) {
        case 'shell':
            this.shells++;
            this.displayImage = 'Item';
            this.displayTimer = Math.floor(Date.now() / 1000) + 1; // 1 second
            break;
        case 'heart':
            this.lives++;
            this.displayImage = 'Life';
            this.displayTimer = Math.floor(Date.now() / 1000) + 1; // 1 second
            break;
    } // switch
};

/* EVENT HANDLERS
----------------------------------*/

/**
 * Listens for key presses and sends keycode to Player.handleInput() method.
 * @param  {document#event:keyup} event
 * @listens document#keyup
 */
document.addEventListener('keyup', function(e) {
    // if the user stops pressing an arrow key, then stop moving the player
    var allowedKeys = {
        37: 'stop',
        38: 'stop',
        39: 'stop',
        40: 'stop'
    };

    app.player.handleInput(allowedKeys[e.keyCode]);
}); // document.addEventListener keyup

/**
 * Listens for key presses and sends keycode to Player.handleInput() method.
 * @param  {document#event:keydown} event
 * @listens document#keydown
 */
document.addEventListener('keydown', function(e) {
    // if the user is pressing an arrow key, then move the player
    var allowedKeys = {
        32: 'spacebar',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    app.player.handleInput(allowedKeys[e.keyCode]);
}); // document.addEventListener keydown

/* INSTANTIATE OBJECTS
----------------------------------*/

newGame();
