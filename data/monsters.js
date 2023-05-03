const embyImage = new Image();
embyImage.src = './imgs/embySprite.png';

const draggleImage = new Image();
draggleImage.src = './imgs/draggleSprite.png';

const monsters = {

    Emby: {
        position: {
            x: 412,
            y: 519
        },
        image: {
            src:'./imgs/embySprite.png'
        },
        frames: {
            max: 4,
            hold: 25
        },
        animate: true,
        health: 60,
        name: 'Emby',
        attacks:[attacks.Tackle, attacks.Fireball]
    },

    Draggle: {
        position: {
            x: 1140,
            y: 182
        },
        image: {
            src:'./imgs/draggleSprite.png'
        },
        frames: {
            max: 4,
            hold: 60
        },
        animate: true,
        isEnemy: true,
        name: 'Draggle',
        attacks: [attacks.Tackle, attacks.Fireball]
    }
}