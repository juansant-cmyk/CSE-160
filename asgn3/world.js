let bgm = new Audio('sounds/bgm.mp3');

bgm.loop = true;
bgm.volume = 0.4; // 0.0 - 1.0

let coinSound = new Audio('sounds/coin.mp3');

coinSound.volume = 0.5;

let allCoinsMessageShown = false;
let winSound = new Audio("sounds/win.mp3");
winSound.volume = 0.7;

let mapEffectActive = false;
let mapEffectStartTime = 0;
let mapEffectDuration = 3.0; 

function drawMapEffect() {
    let currentTime = performance.now() / 1000.0;
    let elapsed = currentTime - mapEffectStartTime;

    if (elapsed > mapEffectDuration) {
        mapEffectActive = false;
        return;
    }

    let pulse = Math.sin(elapsed * 8) * 0.5 + 0.5;
    let alpha = 0.15 + pulse * 0.25;

    let glow = new Cube();
    glow.color = [1.0, 0.85, 0.1, alpha];
    glow.textureNum = -1;

    glow.matrix.translate(-16, 0.08, -16);
    glow.matrix.scale(32, 0.03, 32);

    glow.render();
}

function showGamePopup(message) {

    let popup = document.getElementById("gamePopup");

    popup.textContent = message;

    popup.style.display = "block";

    requestAnimationFrame(() => {
        popup.style.opacity = "1";
    });

    // stays visible longer
    setTimeout(function() {
        popup.style.opacity = "0";
    }, 5000); // was 3000

    setTimeout(function() {
        popup.style.display = "none";
    }, 6500); // accounts for fade out
}