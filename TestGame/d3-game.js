(function() {
    "use strict";
    let svg = d3.select("main")
        .append("svg"),
        margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        parse = function(N) {
            return Number(N.replace("px", ""));
        },
        currentKeysPressed = [];

    let canMove = false;
    let backgroundNum = 0;
    let nextScene = svg.append('rect')
        .attr("width", 50)
        .attr("heigh", 50)
        .attr("x", 50)
        .attr("y", 50);
    let paddle = svg.append('svg:image');
    let background = svg.append('svg:image')
        .attr('xlink:href', 'images/stage/1.png');

    // Add support for movement by keys
    // When a key is pressed, add it to the current keys array for further tracking
    d3.select("body").on("keydown", function() {
        if (currentKeysPressed.indexOf(d3.event.keyCode) != -1) { return }
        currentKeysPressed.push(d3.event.keyCode);
    });

    // When the key is relased, remove it from the array.
    d3.select("body").on("keyup", function() {
        currentKeysPressed.splice(currentKeysPressed.indexOf(d3.event.keyCode), 1);
    });
    svg.on("click", function() {
        if (backgroundNum == 0) {
            let paddle = d3.select('.left_paddle');
            backgroundNum++;
            background.attr('xlink:href', 'images/stage/2.png');
            canMove = true;
            paddle.attr("opacity", "1");
        }
    });
    // always returns current SVG dimensions
    let Screen = function() {
            return {
                width: parse(svg.style("width")),
                height: parse(svg.style("height"))
            };
        },
        // generates a paddle, returns function for updating its position
        Paddle = function(which) {
            let width = 0,
                area = svg.append('rect')
                .classed('area', true)
                .attr({ width: width * 7 }),
                paddle = svg.append('svg:image')
                .classed('paddle', true)
                .classed(which + "_paddle", true)
                .attr({
                    'xlink:href': 'images/sprites/idleright.gif',
                    "opacity": "0"
                }),
                update = function(x, y) {
                    let height = Screen().height * 0.15;
                    paddle.attr({
                        x: x,
                        y: y,
                        height: height
                    });
                    area.attr({
                        x: x - width * 5 / 2,
                        y: y,
                        height: height
                    });
                    return update;
                };
            return update;
        };


    // generate starting scene
    let left = {
        paddle: Paddle("left")(Screen().height / 2, Screen().height / 2)
    };
    let svg1 = d3.select('body').append('svg').attr({
        width: 300,
        height: 300,
        border: '1px solid #ccc'
    });



    // detect window resize events (also captures orientation changes)
    d3.select(window).on('resize', function() {
        let screen = Screen();
        left.paddle(screen.width / 2, screen.height / 2);
    });

    // Check if the paddle needs to be moved depending on current key presses
    let facingRight = true;
    let isWalking = false;
    let isStanding = true;

    function movePaddle() {
        let paddle = d3.select('.left_paddle');
        for (let i = 0; i < currentKeysPressed.length; i++) {
            let currentKeyPressed = currentKeysPressed[i];
            /*  Key Codes:
             *   87 = W
             *   65 = A
             *   83 = S
             *   68 = D
             *   38 = Up Arrow
             *   37 = Left
             *   40 = Down Arrow
             *   39 = Right Arrow
             */
            if (currentKeyPressed && [38, 40, 83, 87, 37, 65, 39, 68].indexOf(currentKeyPressed) != -1 && canMove) {
                let directionUp = [38, 87].indexOf(currentKeyPressed) != -1;
                let directionDown = [40, 83].indexOf(currentKeyPressed) != -1;
                let directionLeft = [37, 65].indexOf(currentKeyPressed) != -1;
                let directionRight = [39, 68].indexOf(currentKeyPressed) != -1;


                let paddleDy = 10 * ((directionUp ? -1 : 0) + (directionDown ? 1 : 0));
                let paddleDx = 10 * ((directionLeft ? -1 : 0) + (directionRight ? 1 : 0));

                if (paddleDx > 0 || (paddleDy != 0 && facingRight)) {
                    if (isStanding || !facingRight) paddle.attr('xlink:href', `images/sprites/walkright.gif`);
                    facingRight = true;
                } else if (paddleDx < 0 || (paddleDy != 0 && !facingRight)) {
                    if (isStanding || facingRight) paddle.attr('xlink:href', `images/sprites/walkleft.gif`);
                    facingRight = false;
                }
                isStanding = false;
                isWalking = true;

                let newPaddleY = Math.max(margin.top,
                    Math.min(parse(paddle.attr("y")) + paddleDy,
                        Screen().height - Screen().height * 0.003 - paddle.attr("height")));

                let newPaddleX = Math.max(margin.left,
                    Math.min(parse(paddle.attr("x")) + paddleDx,
                        Screen().width - Screen().width * 0.04 - paddle.attr("width")));
                left.paddle(newPaddleX, newPaddleY);
            }
        }
        if (currentKeysPressed.length === 0) {
            if (facingRight) {
                if (isWalking) {
                    paddle.attr('xlink:href', `images/sprites/idleright.gif`);
                }
            } else {
                if (isWalking) {
                    paddle.attr('xlink:href', `images/sprites/idleleft.gif`);
                }
            }
            isWalking = false;
            isStanding = true;
        }
    }



    // start animation timer that runs until a player scores
    // then reset ball and start again
    function run() {
        d3.timer(function() {
            movePaddle();
            return false;
        }, 500);
    };
    run();
})();

document.body.addEventListener('touchstart', function(e) { e.preventDefault(); });