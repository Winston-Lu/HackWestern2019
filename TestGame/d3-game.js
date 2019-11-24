(function() {
    "use strict";
    let svg = d3.select("#game")
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

    svg.attr('height', '100%')

    let canMove = false;
    let backgroundNum = 0;
    let dialog = 0;
    let nextScene = svg.append('rect')
        .attr("width", 50)
        .attr("height", 50)
        .attr("x", 50)
        .attr("y", 50);
    let text1;
    let text2;
    let text3;
    let text4;
    let text5;
    let text6;
    let background = svg.append('svg:image').attr('xlink:href', 'images/stage/1.png');
    let girl = svg.append('svg:image').attr('xlink:href', 'images/sprites/girlright.gif');
    girl.attr("x", 160).attr("y", 390)
        .attr("width", 130).attr("height", 130)
        .attr("opacity", 0);
    let paddle = svg.append('svg:image');
    let hint = svg.append('svg:image').attr('xlink:href', 'images/sprites/glow.png')
        .attr("x", 50).attr("y", 600)
        .attr("width", 400).attr("height", 200).attr("opacity", 0);
    let nextDialog = false;

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
                    'xlink:href': 'images/sprites/idleleft.gif',
                    "opacity": "0",
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
        paddle: Paddle("left")(310, 390)
    };

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
                console.log("check");
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
        console.log(dialog);
        if (backgroundNum == 0 || backgroundNum == 1) {
            let paddle = d3.select('.left_paddle');
            if (dialog == 0) {
                backgroundNum++;
                background.attr('xlink:href', 'images/stage/2.png');
                girl.attr("opacity", 1);

                paddle.attr("opacity", "1");
                text1 = svg.append('svg:image').attr('xlink:href', 'images/text/1.png');
                text1.attr("x", 50).attr("y", 600)
                    .attr("width", 1000).attr("height", 200);
                dialog++;
            } else if (dialog == 1) {
                text1.attr("opacity", 0);
                text2 = svg.append('svg:image').attr('xlink:href', 'images/text/2.png');
                text2.attr("x", 50).attr("y", 600)
                    .attr("width", 1000).attr("height", 200).attr("opacity", 1);
                dialog++;
            } else if (dialog == 2) {
                canMove = true;
                text2.attr("opacity", 0);
                dialog++;
            }
        }
        if (backgroundNum == 2) {
            let paddle = d3.select('.left_paddle');
            if (dialog === 4) {
                text3.attr("opacity", 0);
                canMove = true;
                dialog++;
            } else if (dialog === 5 && paddle.attr("x") >= 430 && paddle.attr("y") >= 210 && paddle.attr("x") <= 600 && paddle.attr("y") <= 230) {
                text4 = svg.append('svg:image').attr('xlink:href', 'images/text/4.png');
                text4.attr("x", 50).attr("y", 600)
                    .attr("width", 1000).attr("height", 200).attr("opacity", 1);
                canMove = false;
                dialog++;
            } else if (dialog === 6) {
                text4.attr("opacity", 0);
                canMove = true;
                dialog += 2;
            }
        }
        if (backgroundNum === 3) {
            let paddle = d3.select('.left_paddle');
            if (dialog === 9) {
                text5.attr("opacity", 0);
                canMove = true;
                dialog++;
                hint.attr("opacity", 0.6).attr("x", 30).attr("y", 30).attr("width", 100);
            } else if (dialog === 10 && paddle.attr("x") >= 420 && paddle.attr("y") >= 210 && paddle.attr("x") <= 570 && paddle.attr("y") <= 240) {
                dialog++;
                hint.attr("opacity", 0.6).attr("x", 550).attr("y", 600);
            } else if (dialog === 11 && paddle.attr("x") >= 650 && paddle.attr("y") >= 370 && paddle.attr("x") <= 980 && paddle.attr("y") <= 590) {
                dialog++;
            }
        }
        if (backgroundNum === 4) {
            let paddle = d3.select('.left_paddle');
            if (dialog === 12 && paddle.attr('y') <= 260) {
                text6 = svg.append('svg:image').attr('xlink:href', 'images/text/6.png');
                text6.attr("x", 50).attr("y", 600)
                    .attr("width", 1000).attr("height", 200).attr("opacity", 1);
                canMove = false;
                dialog++;
            } else if (dialog === 13) {
                text6.attr("opacity", 0);
                canMove = true;
                dialog++;
            }
        }
        let paddle = d3.select('.left_paddle');
        switch (backgroundNum) {
            case 2:
                if (inRange(paddle, 370, 630, 180, 250) && dialog == 0) {
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
                    girl.attr("opacity", '0');
                    backgroundNum++;
                    background.attr('xlink:href', 'images/stage/3.png');
                    left.paddle(50, paddle.attr("y"));
                    if (dialog === 3) {
                        dialog++;
                        hint.attr("opacity", 0);
                        text3 = svg.append('svg:image').attr('xlink:href', 'images/text/3.png');
                        text3.attr("x", 50).attr("y", 600)
                            .attr("width", 1000).attr("height", 200).attr("opacity", 1);
                        canMove = false;
                    }
                }
                break;
            case 2:
                //Previous
                if (paddle.attr("x") < 50) {
                    backgroundNum--;
                    background.attr('xlink:href', 'images/stage/2.png');
                    left.paddle(830, 550);
                    girl.attr("opacity", '1');
                }
                //Next stage
                if (paddle.attr("x") > 850 && paddle.attr("y") > 270) {
                    backgroundNum++;
                    background.attr('xlink:href', 'images/stage/4.png');
                    left.paddle(50, 300);
                    if (dialog === 8) {
                        text5 = svg.append('svg:image').attr('xlink:href', 'images/text/5.png');
                        text5.attr("x", 50).attr("y", 600)
                            .attr("width", 1000).attr("height", 200).attr("opacity", 1);
                        canMove = false;
                        dialog++;
                    }
                }
                break;
            case 3:
                //Previous
                if (paddle.attr("x") < 50) {
                    backgroundNum--;
                    background.attr('xlink:href', 'images/stage/3.png');
                    left.paddle(850, 600);
                }
                //Next
                if (paddle.attr("x") > 1030) {
                    backgroundNum++;
                    background.attr('xlink:href', 'images/stage/5.png');
                    left.paddle(50, Math.max(250, paddle.attr("y")));
                }
            case 4:
                //Previous
                if (paddle.attr("x") < 50) {
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
        switch (backgroundNum) {
            case 0:
                return (false);
            case 1:
                if (newY <= 170) return (true); //wall
                else if (newX <= 240 && newY <= 370) return (true); //bed
                else if (newX <= 250 && newY <= 400 && newX >= 140) return (true);
                else return (false);
            case 2:
                if (newY <= 140) return (true); //wall
                if (newX >= 130 && newY >= 140 && newX <= 870 && newY <= 200) return (true); //sink
                else return (false);
            case 3:
                if (newX > 380 && newY > 20 && newX < 630 && newY < 210) return (true); //water can
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