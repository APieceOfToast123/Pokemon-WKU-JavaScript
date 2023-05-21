class Sprite {
    constructor({ 
        position, 
        image, 
        frames = { max: 1, hold: 30}, 
        isVer2 = false,
        sprites, 
        isBG = false, 
        animate = false,
        rotation = 0
    }) {
        this.position = position;
        this.image = new Image();
        this.frames = { ...frames, val: 0, elapsed: 0 };
        this.isVer2 = isVer2;
        this.heightOffset = 1;
        this.frameWOffset = 0;
        this.frameHOffset = 0;
        this.isBG = isBG;
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }
        this.image.src = image.src;

        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation;
    }

    draw() {
        c.save();
        c.translate(this.position.x + this.width/2, this.position.y + this.height/2);
        c.rotate(this.rotation);
        c.translate(-this.position.x - this.width/2, -this.position.y - this.height/2);
        c.globalAlpha = this.opacity;

        if (this.isBG) {
            c.drawImage(
                this.image,
                this.frames.val * this.width,
                0,
                this.image.width / this.frames.max,
                this.image.height,
                this.position.x,
                this.position.y,
                canvas.width,
                canvas.height
            );
        } else if(this.isVer2){
            this.heightOffset = 4;
            this.widthOffset = this.image.width / this.frames.max;
            this.frameWOffset = this.image.width / this.frames.max;
            if(this.isVer2){
                if(this.frames.val >= 2){
                    c.drawImage(
                        this.image,
                        0,
                        this.frameHOffset * (this.image.width / this.frames.max),
                        this.image.width / this.frames.max,
                        this.image.height / 4,
                        this.position.x,
                        this.position.y + this.image.width / 4,
                        this.image.width / this.frames.max,
                        this.image.height / this.heightOffset
                    );
                } else{
                    c.drawImage(
                        this.image,
                        this.frames.val * this.width + this.frameWOffset,
                        this.frameHOffset * (this.image.width / this.frames.max),
                        this.image.width / this.frames.max,
                        this.image.height / 4,
                        this.position.x,
                        this.position.y + this.image.width / 4,
                        this.image.width / this.frames.max,
                        this.image.height / this.heightOffset
                    );
                }
            }
        } else {
            c.drawImage(
                this.image,
                this.frames.val * this.width + this.frameWOffset,
                this.frameHOffset * (this.image.width / this.frames.max),
                this.image.width / this.frames.max,
                this.image.height / this.heightOffset,
                this.position.x,
                this.position.y,
                this.image.width / this.frames.max,
                this.image.height / this.heightOffset
            );
        }
        c.restore();

        if (this.animate) {
            if (this.frames.max > 1) {
                this.frames.elapsed++;
            }

            if (this.frames.elapsed % this.frames.hold === 0) {
                if (this.frames.val < this.frames.max - 1) {
                    this.frames.val++;
                }
                else {
                    this.frames.val = 0;
                }
            }
        }
        else {
            this.frames.val = 0;
        }
    }    
}

class Monsters extends Sprite {
    constructor({
        position, 
        image, 
        frames = { max: 1, hold: 30}, 
        sprites, 
        isBG = false, 
        isVer2 = false,
        animate = false,
        rotation = 0,

        isEnemy = false,
        name,
        health = 45,
        attacks
    }){
        super({
            position, 
            image, 
            frames, 
            sprites, 
            isBG,
            isVer2, 
            animate,
            rotation
        })

        this.isEnemy = isEnemy;
        this.name = name;
        this.health = health;
        this.currentHP = health;
        this.attacks = attacks;
    }

    faint(){
        if(this.isEnemy){
            document.querySelector('#dialogueBox').innerHTML = this.name + ' is defeated.';
        }
        else{
            document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!';
        
        }
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this,{
            opacity: 0
        })
    }

    attack({attack, recipient, renderedSprites}){
        document.querySelector('#dialogueBox').style.display = 'block';
        document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name;

        let healthBar = '#enemyHPBarG';
        if(this.isEnemy) healthBar = '#playerHPBarG';
        recipient.currentHP -= attack.damage;

        let rotation = 1;
        if(this.isEnemy) rotation = -2.3;

        switch(attack.name) {

            // Tackle Attack Code Block
            case 'Tackle':
                const tl = gsap.timeline();
        
                let movementDistance = 20;
                if(this.isEnemy) movementDistance = -20;

                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance*3,
                    duration: 0.1,
                    onComplete: () => {
                        // Enemy gets hit
                        gsap.to(healthBar, {
                            width: (recipient.currentHP / recipient.health) * 100 + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 20,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.1
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.1
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })

                break;

            // Fireball Attack Code Block
            case 'Fireball':
                const fireballImage = new Image();
                fireballImage.src = './imgs/fireball.png';
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation
                });

                renderedSprites.splice(1, 0, fireball);

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () =>{
                        
                        renderedSprites.splice(1, 1);

                        // Enemy gets hit
                        gsap.to(healthBar, {
                            width: (recipient.currentHP / recipient.health) * 100 + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 20,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.1
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.1
                        })
                    }
                })
                break;
        }


    }
}

class Boundary {
    static width = 48;
    static height = 48;
    constructor({ position }) {
        this.position = position;
        this.width = 48;
        this.height = 48;
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}