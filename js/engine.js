/**
 * Game engine provided by Udacity
 * See original source:
 * {@link  https://github.com/udacity/frontend-nanodegree-arcade-game | GitHub}.
 */

/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        sideCanvas = doc.createElement('canvas'),
        sideCtx = sideCanvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    canvas.id = 'gameboard';
    doc.getElementById('canvasContainer').appendChild(canvas);

    // side canvas to display game info
    sideCanvas.width = 202;
    sideCanvas.height = canvas.height;
    sideCanvas.id = 'gameboardinfo';
    doc.getElementById('canvasContainer').appendChild(sideCanvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        if(!gameOver) {
            update(dt);
            render();
        }

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data.
     */
    function update(dt) {
        updateEntities(dt);
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object.
     */
    function updateEntities(dt) {
        player.update(dt);
        allItems.forEach(function(item) {
            item.update(dt);
        });
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/rock-top.png',
                'images/sandy-block.png',
                'images/sandy-block.png',
                'images/sandy-rock.png',
                'images/sandy-block.png',
                'images/rock-bottom.png'
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        // Draw over the side canvas
        if(debugMode) {
            sideCtx.beginPath();
            sideCtx.rect(0, 0, 202, canvas.height);
            sideCtx.fillStyle = 'rgba(204, 204, 204, 1)'; // gray overlay
            sideCtx.fill();
            sideCtx.closePath();
            sideCtx.font = '16px Arial, Helvetica, Sans-serif';
            sideCtx.fillStyle = '#ff0000';
            sideCtx.fillText('Canvas ID: gameboardinfo', 8, 20);
        } // if debugMode
        else {
            sideCtx.beginPath();
            sideCtx.rect(0, 0, 202, canvas.height);
            sideCtx.fillStyle = 'rgba(252, 241, 219, 1)'; // matches page background
            sideCtx.fill();
            sideCtx.closePath();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Heart and Shell info
        sideCtx.drawImage(Resources.get('images/heart-small.png'), 20, 82);
        sideCtx.drawImage(Resources.get('images/shell-small.png'), 20, 242);

        // Directions
        sideCtx.font = 'bold 14px Arial, Helvetica, Sans-serif';
        sideCtx.fillStyle = '#000';
        sideCtx.fillText('DIRECTIONS', 20, 400);
        sideCtx.font = '14px Arial, Helvetica, Sans-serif';
        sideCtx.fillText('Use the arrows keys to', 20, 420);
        sideCtx.fillText('move up, left, right, down.', 20, 440);
        sideCtx.fillText('Collect hearts to add lives.', 20, 480);
        sideCtx.fillText('Collect all the shells to win.', 20, 520);


        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        // Draw coral on the main canvas
        ctx.drawImage(Resources.get('images/coral01.png'), 404, 0);
        ctx.drawImage(Resources.get('images/coral02.png'), 0, 108);
        ctx.drawImage(Resources.get('images/coral03.png'), 202, 108);
        ctx.drawImage(Resources.get('images/coral04.png'), 304, 108);
        ctx.drawImage(Resources.get('images/coral05.png'), 101, 275);
        ctx.drawImage(Resources.get('images/coral06.png'), 404, 192);
        ctx.drawImage(Resources.get('images/coral07.png'), 101, 360);
        ctx.drawImage(Resources.get('images/coral08.png'), 202, 360);
        ctx.drawImage(Resources.get('images/coral09.png'), 1, 370);
        ctx.drawImage(Resources.get('images/coral10.png'), 308, 372);

        // Draw over the main canvas
        if(debugMode) {
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 204, 204, 0.5)'; // pink overlay
            ctx.fill();
            ctx.closePath();
            ctx.font = '16px Arial, Helvetica, Sans-serif';
            ctx.fillStyle = '#ff0000';
            ctx.fillText('Canvas ID: gameboard', 8, 20);
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        allItems.forEach(function(item) {
            item.render();
        });

        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/rock-top.png',
        'images/sandy-rock.png',
        'images/sandy-block.png',
        'images/rock-bottom.png',
        'images/girl-bubble.png',
        'images/girl-bubble-hit.png',
        'images/girl-bubble-heart.png',
        'images/girl-bubble-shell.png',
        'images/heart.png',
        'images/heart-small.png',
        'images/shell.png',
        'images/shell-small.png',
        'images/shark.png',
        'images/shark-hit.png',
        'images/winner.png',
        'images/coral01.png',
        'images/coral02.png',
        'images/coral03.png',
        'images/coral04.png',
        'images/coral05.png',
        'images/coral06.png',
        'images/coral07.png',
        'images/coral08.png',
        'images/coral09.png',
        'images/coral10.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    global.sideCtx = sideCtx;
    global.canvasW = canvas.width;
    global.canvasH = canvas.height;
})(this);
