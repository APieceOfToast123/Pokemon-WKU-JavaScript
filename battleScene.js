const battleBackgroundImage = new Image();
battleBackgroundImage.src = './imgs/battleBackground.png';

const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage,
    isBG: true
});

let draggle;
let emby;
let renderedSprites;
let battleAnimationId;
let queue;

function initBattle(){
    document.querySelector('#userInterface').style.display = 'block';
    document.querySelector('#dialogueBox').style.display = 'none';
    document.querySelector('#enemyHPBarG').style.width = '100%';
    document.querySelector('#playerHPBarG').style.width = '100%';
    document.querySelector('#attackBox').replaceChildren();

    draggle = new Monsters(monsters.Draggle);
    emby = new Monsters(monsters.Emby);
    renderedSprites = [draggle, emby];
    queue = [];

    emby.attacks.forEach((attack) => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        document.querySelector('#attackBox').append(button);
    });

    // Event listeners for attack buttons 
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (e) => {

            const selectedAttack = attacks[e.currentTarget.innerHTML];
            emby.attack({
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites
            });

            const randomAttack = 
                draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                });
            });
        })

        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector('#attackType').innerHTML = selectedAttack.type;
            document.querySelector('#attackType').style.color = selectedAttack.color;
            document.querySelector('#attackType').style.fontSize = '3.2em';
            // document.querySelector('#attackDamage').innerHTML = "Damage: " + selectedAttack.damage;
            // document.querySelector('#attackDamage').style.fontSize = '2em';
        })
    })
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
    renderedSprites.forEach(sprite => {
        sprite.draw();
    });
    document.querySelector('#userInterface').style.display = 'block';
}

animate();
// initBattle();
// animateBattle();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Event listeners for the dialogue box
let inputEnable = true;
document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if (inputEnable) {
        inputEnable = false;
        
        if (draggle.currentHP <= 0) {
            sleep(1000).then(() => {
                draggle.faint();

                sleep(1000).then(() => {
                    gsap.to('#flash', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId);
                            animate();
                            document.querySelector('#userInterface').style.display = 'none';
                            gsap.to('#flash', {
                                opacity: 0
                            })

                            battle.initiated = false;
                        }
                    });
                })
            })
        }

        if (emby.currentHP <= 0) {
            sleep(1000).then(() => {
                emby.faint();

                sleep(1000).then(() => {
                    gsap.to('#flash', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId);
                            animate();
                            document.querySelector('#userInterface').style.display = 'none';
                            gsap.to('#flash', {
                                opacity: 0
                            })

                            battle.initiated = false;
                        }
                    });
                })
            })
        }

        else {
            sleep(700).then(() => {
                if (queue.length > 0) {
                    if(draggle.currentHP > 0){
                        queue[0]();
                    }
                    queue.shift();
                    sleep(700).then(() => {
                        inputEnable = true;
                    })
                }
                else {
                    document.querySelector('#dialogueBox').style.display = 'none';
                    inputEnable = true;
                }
            })
        }
    }
})