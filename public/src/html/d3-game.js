let googleVoice = "testing";

(function() {
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
    let text1;
    let text2;
    let text3;
    let text4;
    let text4_5;
    let text5;
    let text6;
    let isWilted = false;
    let background = svg.append('svg:image').attr('xlink:href', 'images/stage/1.png');
    let girl = svg.append('svg:image').attr('xlink:href', 'images/sprites/girlright.gif');
    girl.attr("x", 160).attr("y", 390)
        .attr("width", 130).attr("height", 130)
        .attr("opacity", 0);
    let player = svg.append('svg:image');
    let hint = svg.append('svg:image').attr('xlink:href', 'images/sprites/glow.png')
        .attr("x", 50).attr("y", 600)
        .attr("width", 400).attr("height", 200).attr("opacity", 0);
    let mic;
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
        // generates a player, returns function for updating its position
        Player = function(which) {
            let width = 0,
                area = svg.append('rect')
                .classed('area', true)
                .attr({ width: width * 7 }),
                player = svg.append('svg:image')
                .classed('player', true)
                .classed(which + "_player", true)
                .attr({
                    'xlink:href': 'images/sprites/idleleft.gif',
                    "opacity": "0",
                }),
                update = function(x, y) {
                    let height = Screen().height * 0.15;
                    player.attr({
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
        player: Player("left")(310, 390)
    };

    let facingRight = true;
    let isWalking = false;
    let isStanding = true;

    function movePlayer() {
        let player = d3.select('.left_player');
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


                let playerDy = 10 * ((directionUp ? -1 : 0) + (directionDown ? 1 : 0));
                let playerDx = 10 * ((directionLeft ? -1 : 0) + (directionRight ? 1 : 0));

                if (playerDx > 0 || (playerDy != 0 && facingRight)) {
                    if (isStanding || !facingRight) player.attr('xlink:href', `images/sprites/walkright.gif`);
                    facingRight = true;
                } else if (playerDx < 0 || (playerDy != 0 && !facingRight)) {
                    if (isStanding || facingRight) player.attr('xlink:href', `images/sprites/walkleft.gif`);
                    facingRight = false;
                }
                isStanding = false;
                isWalking = true;

                let newPlayerY = Math.max(margin.top,
                    Math.min(parse(player.attr("y")) + playerDy,
                        650));

                let newPlayerX = Math.max(margin.left,
                    Math.min(parse(player.attr("x")) + playerDx,
                        1040));
                if (!blockedArea(player, playerDx, playerDy)) left.player(newPlayerX, newPlayerY);
                checkTransistion();
            }
        }
        if (currentKeysPressed.length === 0) {
            if (facingRight) {
                if (isWalking) {
                    player.attr('xlink:href', `images/sprites/idleright.gif`);
                }
            } else {
                if (isWalking) {
                    player.attr('xlink:href', `images/sprites/idleleft.gif`);
                }
            }
            isWalking = false;
            isStanding = true;
        }
    }

    svg.on("click", async function() {

        //await $.get('getVoice', (data) => {
        //    googleVoice = data;
        //})

        console.log(googleVoice);
        if (backgroundNum == 0 || backgroundNum == 1) {
            let player = d3.select('.left_player');
            if (dialog == 0) {
                backgroundNum++;
                background.attr('xlink:href', 'images/stage/2.png');
                girl.attr("opacity", 1);

                player.attr("opacity", "1");
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
            } else if (dialog == 14 && player.attr("x") >= 480 && player.attr("y") >= 180 && player.attr("x") <= 600 && player.attr("y") <= 260) {
                dialog++
                backgroundNum = 25;
                background.attr('xlink:href', 'images/stage/art1.png');
                player.attr("opacity", 0);
                girl.attr("opacity", 0);
                hint.attr("opacity", 0);
            }
        }
        if (backgroundNum == 2) {
            let player = d3.select('.left_player');
            if (dialog === 4) {
                text3.attr("opacity", 0);
                canMove = true;
                dialog++;
            } else if (dialog === 5 && player.attr("x") >= 430 && player.attr("y") >= 210 && player.attr("x") <= 600 && player.attr("y") <= 230) {
                text4 = svg.append('svg:image').attr('xlink:href', 'images/text/4.png');
                text4.attr("x", 50).attr("y", 600)
                    .attr("width", 1000).attr("height", 200).attr("opacity", 1);
                canMove = false;
                dialog++;
            } else if (dialog === 6) {
                text4.attr("opacity", 0);
                text4_5 = svg.append('svg:image').attr('xlink:href', 'images/text/4.5.png');
                text4_5.attr("x", 50).attr("y", 600).attr("width", 1000).attr("height", 200).attr("opacity", 1);
                mic = svg.append('svg:image').attr('xlink:href', 'images/mic.svg');
                mic.attr("x", 80).attr("y", 620).attr("width", 150).attr("height", 150).attr("opacity", 1);
                dialog++;
            } else if (dialog === 7) {
                //if (googleVoice.includes("water")) {
                text4_5.attr("opacity", 0);
                mic.attr("opacity", 0);
                canMove = true;
                dialog += 2;
                //}
            }
        }
        if (backgroundNum === 3) {
            let player = d3.select('.left_player');
            if (dialog === 9 && player.attr("x") >= 420 && player.attr("y") >= 210 && player.attr("x") <= 570 && player.attr("y") <= 260) {
                hint.attr("opacity", 0.6).attr("x", 650).attr("y", 500).attr("width", 400);
                dialog++;
            } else if (dialog == 10) {
                text5 = svg.append('svg:image').attr('xlink:href', 'images/text/5.png');
                text5.attr("x", 50).attr("y", 600)
                    .attr("width", 1000).attr("height", 200).attr("opacity", 1);
                canMove = false;
                dialog++;
                hint.attr("opacity", 0);
                background.attr('xlink:href', 'images/stage/4wilted.png');
                isWilted = true;
            } else if (dialog === 11 && player.attr("x") >= 650 && player.attr("y") >= 370 && player.attr("x") <= 980 && player.attr("y") <= 590) {
                text5.attr("opacity", 0);
                canMove = true;
                dialog++;
            }
        }
        if (backgroundNum === 4) {
            let player = d3.select('.left_player');
            if (dialog === 12 && (player.attr('y') <= 260 || (player.attr('x') >= 430 && player.attr('x' <= 720) && player.attr('y') >= 240 && player.attr('y') <= 400))) {
                text6 = svg.append('svg:image').attr('xlink:href', 'images/text/6.png');
                text6.attr("x", 50).attr("y", 600)
                    .attr("width", 1000).attr("height", 200).attr("opacity", 1);
                canMove = false;
                dialog++;
                hint.attr("opacity", 0);
            } else if (dialog === 13) {
                text6.attr("opacity", 0);
                canMove = true;
                dialog++;
                hint.attr("opacity", 0.6).attr("x", -80).attr("y", 500).attr("width", 400);
            }
        }
        if (backgroundNum == 25) {
            background.attr('xlink:href', 'images/stage/art1.png').attr("width", 1130).attr("height", 800);
            backgroundNum++;
        } else if (backgroundNum == 26) {
            background.attr('xlink:href', 'images/stage/art2.png').attr("width", 1130).attr("height", 800);
            backgroundNum++;
        } else if (backgroundNum == 27) {
            background.attr('xlink:href', 'images/stage/art3.png').attr("width", 1130).attr("height", 800);
            backgroundNum++;
        } else if (backgroundNum == 28) {
            background.attr('xlink:href', 'images/stage/art4.png').attr("width", 1130).attr("height", 800);
        }
        let player = d3.select('.left_player');
        switch (backgroundNum) {
            case 2:
                if (inRange(player, 370, 630, 180, 250) && dialog == 0) {
                    dialog++;
                }
        }
    });

    function checkTransistion() {
        let player = d3.select('.left_player');
        switch (backgroundNum) {
            case 1:
                if (player.attr("x") > 840 && player.attr("y") > 480) {
                    girl.attr("opacity", '0');
                    backgroundNum++;
                    background.attr('xlink:href', 'images/stage/3.png');
                    left.player(50, player.attr("y"));
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
                if (player.attr("x") < 50) {
                    backgroundNum--;
                    background.attr('xlink:href', 'images/stage/2.png');
                    left.player(830, 550);
                    girl.attr("opacity", '1');
                    if (dialog == 14) {
                        hint.attr("opacity", 0.6).attr("x", 525).attr("y", 240).attr("width", 110);
                    }
                }
                //Next stage
                if (player.attr("x") > 850 && player.attr("y") > 270) {
                    backgroundNum++;
                    if (isWilted) background.attr('xlink:href', 'images/stage/4wilted.png');
                    else background.attr('xlink:href', 'images/stage/4.png');
                    left.player(50, 300);
                    if (dialog === 9) {
                        hint.attr("opacity", 0.6).attr("x", 470).attr("y", 250).attr("width", 110);
                    } else if (dialog == 14) {
                        hint.attr("opacity", 0.6);
                    }
                }
                break;
            case 3:
                //Previous
                if (player.attr("x") < 50) {
                    backgroundNum--;
                    background.attr('xlink:href', 'images/stage/3.png');
                    left.player(850, 600);
                    if (dialog != 14) hint.attr("opacity", 0);
                    else hint.attr("opacity", 0.6);
                }
                //Next
                if (player.attr("x") > 1030) {
                    backgroundNum++;
                    background.attr('xlink:href', 'images/stage/5.png');
                    left.player(50, Math.max(250, player.attr("y")));
                    if (dialog === 12) {
                        hint.attr("opacity", 0.6).attr("x", 430).attr("y", 300).attr("width", 280);
                    }
                }
            case 4:
                //Previous
                if (player.attr("x") < 50) {
                    backgroundNum--;
                    if (isWilted) background.attr('xlink:href', 'images/stage/4wilted.png');
                    else background.attr('xlink:href', 'images/stage/4.png');
                    left.player(1030, player.attr("y"));
                    if (dialog != 14) hint.attr("opacity", 0);
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
            movePlayer();
            return false;
        }, 500);
    };
    run();
})();

document.body.addEventListener('touchstart', function(e) { e.preventDefault(); });
