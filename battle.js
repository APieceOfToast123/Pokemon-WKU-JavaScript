const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1440;
canvas.height = 830;

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i));
}

const battleZones = [];
const boundaries = [];
const offset = {
    x: -47.5,
    y: -115
}

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )

    })
})

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )

    })
})

c.fillStyle = 'black';
c.fillRect(0, 0, canvas.width, canvas.height);

const image = new Image();
image.src = './imgs/Pokemon WKU Map.png';

const foregroundImage1 = new Image;
foregroundImage1.src = './imgs/Foreground Map.png';

const foregroundImage2 = new Image;
foregroundImage2.src = './imgs/Foreground Map2.png';

const playerDownImage = new Image;
playerDownImage.src = './imgs/playerDown.png';

const playerUpImage = new Image;
playerUpImage.src = './imgs/playerUp.png';

const playerLeftImage = new Image;
playerLeftImage.src = './imgs/playerLeft.png';

const playerRightImage = new Image;
playerRightImage.src = './imgs/playerRight.png';

const player = new Sprite({
    position: {
        x: canvas.width / 2 - (192 / 4) / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 30
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground1 = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage1
})

const foreground2 = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage2
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

const movables = [
    background,
    ...boundaries,
    foreground1,
    foreground2,
    ...battleZones
]

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height * 0.6 <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    document.querySelector('#userInterface').style.display = 'none';
    document.querySelector('#count').style.display = 'flex';

    background.draw();
    boundaries.forEach(boundary => {
        boundary.draw();
    })
    battleZones.forEach(battleZone => {
        battleZone.draw();
    })
    player.draw();
    foreground1.draw();
    foreground2.draw();

    let moving = true;
    player.animate = false;

    if (battle.initiated) return;

    // Activate a battle
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
            const overlappingArea = 
            (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
                Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
                    Math.max(player.position.y, battleZone.position.y));
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: battleZone
                }) &&
                overlappingArea > (player.width * player.height) / 2 &&
                Math.random() < 0.012
            ) {
                //deactivate current animation loop
                window.cancelAnimationFrame(animationId);

                audio.Map.stop();
                audio.initBattle.play();
                audio.battle.play();
                
                battle.initiated = true;

                gsap.to('#flash', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.18,
                    onComplete() {
                        gsap.to('#flash', {
                            opacity: 1,
                            duration: 0.18,
                            onComplete() {
                                audio.initBattle.stop();
                                audio.Map.play();
                                //activate a new animation loop
                                initBattle();
                                animateBattle();
                                gsap.to('#flash', {
                                    opacity: 0,
                                    duration: 0.18
                                })
                            }
                        })
                    }
                })
                break;
            }
        }
    }

    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true;
        player.image = player.sprites.up;

        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 1
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }

        }

        if (moving) {
            movables.forEach((movable) => {
                movable.position.y += 1
            })
        }
    }
    else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 1,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }

        }

        if (moving) {
            movables.forEach((movable) => {
                movable.position.x += 1;
            })
        }
    }
    else if (keys.s.pressed && lastKey === 's') {
        player.animate = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 1
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }

        }

        if (moving) {
            movables.forEach((movable) => {
                movable.position.y -= 1;
            })
        }
    }
    else if (keys.d.pressed && lastKey === 'd') {
        player.animate = true;
        player.image = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 1,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }

        }

        if (moving) {
            movables.forEach((movable) => {
                movable.position.x -= 1;
            })
        }
    }

}

animate();

let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w'
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a'
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's'
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd'
            break;
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
})

let clicked = false;
addEventListener('click', () => {
    if(!clicked){
        audio.Map.play();
        clicked = true;
    }
});