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
    let dialog = 0;
    let nextScene = svg.append('rect')
        .attr("width", 50)
        .attr("heigh", 50)
        .attr("x", 50)
        .attr("y", 50);
    let paddle = svg.append('svg:image');
    let background = svg.append('svg:image').attr('xlink:href', 'images/stage/1.png');

    // When a key is pressed, add it to the current keys array for further tracking
    d3.select("body").on("keydown", function() {
        if (currentKeysPressed.indexOf(d3.event.keyCode) != -1) { return }
        currentKeysPressed.push(d3.event.keyCode);
    });

    // When the key is relased, remove it from the array.
    d3.select("body").on("keyup", function() {
        currentKeysPressed.splice(currentKeysPressed.indexOf(d3.event.keyCode), 1);
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
                        650));

                let newPaddleX = Math.max(margin.left,
                    Math.min(parse(paddle.attr("x")) + paddleDx,
                        1040));
                if (!blockedArea(paddle, paddleDx, paddleDy)) left.paddle(newPaddleX, newPaddleY);
                checkTransistion();
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

    svg.on("click", function() {
        if (backgroundNum == 0) {
            let paddle = d3.select('.left_paddle');
            backgroundNum++;
            background.attr('xlink:href', 'images/stage/2.png');
            canMove = true;
            paddle.attr("opacity", "1");
            return;
        }
        let paddle = d3.select('.left_paddle');
        switch (backgroundNum) {
            case 2:
                if (inRange(paddle, 370, 630, 180, 250) && dialog == 0) {
                    console.log("speech 1");
                    dialog++;
                }
        }
    });

    function checkTransistion() {
        let paddle = d3.select('.left_paddle');
        console.log("x: " + paddle.attr("x") + " y: " + paddle.attr("y"));
        switch (backgroundNum) {
            case 1:
                if (paddle.attr("x") > 840 && paddle.attr("y") > 480) {
                    console.log("Transistion");
                    backgroundNum++;
                    background.attr('xlink:href', 'images/stage/3.png');
                    left.paddle(50, 600);
                }
                break;
            case 2:
                //Previous
                if (paddle.attr("x") < 50) {
                    console.log("Transistion");
                    backgroundNum--;
                    background.attr('xlink:href', 'images/stage/2.png');
                    left.paddle(830, 550);
                }
                //Next stage
                if (paddle.attr("x") > 850 && paddle.attr("y") > 270) {
                    console.log("Transistion");
                    backgroundNum++;
                    background.attr('xlink:href', 'images/stage/4.png');
                    left.paddle(50, 300);
                }
                break;
            case 3:
                //Previous
                if (paddle.attr("x") < 50) {
                    console.log("Transistion");
                    backgroundNum--;
                    background.attr('xlink:href', 'images/stage/3.png');
                    left.paddle(850, 600);
                }
                //Next
                if (paddle.attr("x") > 1030) {
                    console.log("Transistion");
                    backgroundNum++;
                    background.attr('xlink:href', 'images/stage/5.png');
                    left.paddle(50, Math.max(250, paddle.attr("y")));
                }
            case 4:
                //Previous
                if (paddle.attr("x") < 50) {
                    console.log("Transistion");
                    backgroundNum--;
                    background.attr('xlink:href', 'images/stage/4.png');
                    left.paddle(1030, paddle.attr("y"));
                }
        }
    }

    function inRange(sprite, minX, maxX, minY, maxY) {
        return (sprite.attr("x") <= maxX && sprite.attr("x") >= minX && sprite.attr("y") > minY && sprite.attr("y") < maxY);
    }

    function blockedArea(sprite, dx, dy) {
        let newX = parseInt(sprite.attr("x")) + parseInt(dx);
        let newY = parseInt(sprite.attr("y")) + parseInt(dy);
        console.log(newX + ' ' + newY);
        switch (backgroundNum) {
            case 0:
                return (false);
            case 1:
                if (newY <= 170) return (true); //wall
                else if (newX <= 240 && newY <= 370) return (true); //bed
                else return (false);
            case 2:
                if (newY <= 140) return (true); //wall
                if (newX >= 130 && newY >= 140 && newX <= 870 && newY <= 200) return (true); //sink
                else return (false);
            case 3:
                if (newX > 380 && newY > 20 && newX < 630 && newY < 190) return (true);
                return (false);
            case 4:
                if (newY <= 230) return (true);
                return (false);
        }
    }

    function run() {
        d3.timer(function() {
            movePaddle();
            return false;
        }, 500);
    };
    run();
})();

document.body.addEventListener('touchstart', function(e) { e.preventDefault(); });