let canvas;
let gl;

let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;

let camera;

let keys = {};

let isMouseDown = false;
let lastMouseX = null;

let mouseLookEnabled = false;
let mouseSensitivity = 0.15;

let blocks = [];

let creativeMode = false;

let a_UV;
let u_whichTexture;
let u_uvScale;

let u_sampler0;
let u_sampler1;
let u_sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;
let u_Sampler8;

let turtleWalkAngle = 0;
let turtleX = 0;
let turtleZ = 0;
let turtleDirection = 180;
let turtleSpeed = 0.007;

let map = Array.from({ length: 32 }, () => Array(32).fill(0));

let coins = [
    { x: -10, z: -10, collected: false },
    { x: -5, z: -6, collected: false },
    { x: 4, z: -9, collected: false },
    { x: 10, z: -5, collected: false },
    { x: -12, z: 2, collected: false },
    { x: -6, z: 8, collected: false },
    { x: 3, z: 6, collected: false },
    { x: 9, z: 10, collected: false },
    { x: 13, z: 3, collected: false },
    { x: 0, z: -13, collected: false },
];

let coinSpinAngle = 0;

let coinsCollected = 0;
let totalCoins = 10;


// Main road
for (let z = 0; z < 32; z++) {
    map[z][15] = 1;
    map[z][16] = 1;
}

// Cross road
for (let x = 0; x < 32; x++) {
    map[15][x] = 1;
    map[16][x] = 1;
}

// Corner buildings
map[3][3] = 4;
map[3][4] = 4;
map[4][3] = 4;
map[4][4] = 4;

map[3][27] = 4;
map[3][28] = 4;
map[4][27] = 4;
map[4][28] = 4;

map[27][3] = 4;
map[27][4] = 4;
map[28][3] = 4;
map[28][4] = 4;

map[27][27] = 4;
map[27][28] = 4;
map[28][27] = 4;
map[28][28] = 4;

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }
`;

const FSHADER_SOURCE = `
    precision mediump float;

    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
    uniform sampler2D u_Sampler6;
    uniform sampler2D u_Sampler7;
    uniform sampler2D u_Sampler8;

    uniform int u_whichTexture;
    uniform float u_uvScale;

    varying vec2 v_UV;

    void main() {
        if (u_whichTexture == -1) {
            gl_FragColor = u_FragColor;
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV * u_uvScale);
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV * u_uvScale);
        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV * u_uvScale);
        } else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);
        } else if (u_whichTexture == 4) {
            gl_FragColor = texture2D(u_Sampler4, v_UV);
        } else if (u_whichTexture == 5) {
            gl_FragColor = texture2D(u_Sampler5, v_UV);
        } else if (u_whichTexture == 6) {
            gl_FragColor = texture2D(u_Sampler6, v_UV);
        } else if (u_whichTexture == 7) {
            gl_FragColor = texture2D(u_Sampler7, v_UV);
        } else if (u_whichTexture == 8) {
            gl_FragColor = texture2D(u_Sampler8, v_UV * u_uvScale);
        } else {
            gl_FragColor = u_FragColor;
        }
    }
`;

function main() {
    canvas = document.getElementById('webgl');
    document.getElementById("coinScore").textContent = coinsCollected;


    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    connectVariablesToGLSL();
    initTextures();

    canvas.onclick = function() {
        bgm.play();
    };

    camera = new Camera();
    camera.updateProjection(canvas);
    camera.lockToGround();

    document.addEventListener("keydown", function(ev) {
        keys[ev.key.toLowerCase()] = true;
        if (creativeMode && ev.key.toLowerCase() === "f") {
            addBlock();
        }

        if (creativeMode && ev.key.toLowerCase() === "r") {
            deleteBlock();
        }
    });

    document.addEventListener("keyup", function(ev) {
        keys[ev.key.toLowerCase()] = false;
    });

    window.addEventListener("blur", function() {
        keys = {};
    });

    document.addEventListener("keydown", function(ev) {
        if (ev.key.toLowerCase() === "m") {
            mouseLookEnabled = !mouseLookEnabled;

            if (mouseLookEnabled) {
                canvas.requestPointerLock();
                console.log("Mouse look ON");
            } else {
                document.exitPointerLock();
                console.log("Mouse look OFF");
            }
        }
    });

    document.addEventListener("pointerlockchange", function() {
        mouseLookEnabled = document.pointerLockElement === canvas;
    });

    function mouseMove(ev) {
        if (!mouseLookEnabled) return;
        if (document.pointerLockElement !== canvas) return;

        camera.panHorizontal(-ev.movementX * mouseSensitivity);
        camera.panVertical(-ev.movementY * mouseSensitivity);
    }

    canvas.addEventListener("click", function() {
        console.log("canvas clicked");
        canvas.requestPointerLock();
    });

    document.addEventListener("pointerlockchange", function() {
        console.log("pointer lock element:", document.pointerLockElement);
    });

    document.addEventListener("mousemove", mouseMove);

    document.addEventListener("keydown", function(ev) {
        keys[ev.key.toLowerCase()] = true;

        if (ev.key.toLowerCase() === "c") {
            creativeMode = !creativeMode;

            if (!creativeMode) {
                camera.eye.elements[1] = 1;
                camera.at.elements[1] = 1;
            }

            console.log("Creative Mode:", creativeMode);
        }
    });
    showGamePopup("Collect all 10 coins to win!");
    tick();
}

function drawBlockOutline() {
    let pos = getBlockInFront();

    let x = pos.x;
    let y = pos.y;
    let z = pos.z;

    let s = 1.02;

    let vertices = new Float32Array([
        // bottom square
        x, y, z,   x+s, y, z,
        x+s, y, z, x+s, y, z+s,
        x+s, y, z+s, x, y, z+s,
        x, y, z+s, x, y, z,

        // top square
        x, y+s, z,   x+s, y+s, z,
        x+s, y+s, z, x+s, y+s, z+s,
        x+s, y+s, z+s, x, y+s, z+s,
        x, y+s, z+s, x, y+s, z,

        // vertical edges
        x, y, z,   x, y+s, z,
        x+s, y, z, x+s, y+s, z,
        x+s, y, z+s, x+s, y+s, z+s,
        x, y, z+s, x, y+s, z+s
    ]);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform1i(u_whichTexture, -1);
    gl.uniform1f(u_uvScale, 1.0);
    gl.uniform4f(u_FragColor, 1, 0, 0, 1.0);

    let identity = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements);

    gl.drawArrays(gl.LINES, 0, vertices.length / 3);
}

function mouseMove(ev) {
    if (document.pointerLockElement !== canvas) return;

    console.log("mouse moved:", ev.movementX, ev.movementY);

    camera.panHorizontal(-ev.movementX * mouseSensitivity);
    camera.panVertical(-ev.movementY * mouseSensitivity);
}

function connectVariablesToGLSL() {
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    a_UV = gl.getAttribLocation(gl.program, "a_UV");
    u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
    u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
    u_Sampler3 = gl.getUniformLocation(gl.program, "u_Sampler3");
    u_Sampler4 = gl.getUniformLocation(gl.program, "u_Sampler4");
    u_Sampler5 = gl.getUniformLocation(gl.program, "u_Sampler5");
    u_Sampler6 = gl.getUniformLocation(gl.program, "u_Sampler6");
    u_Sampler7 = gl.getUniformLocation(gl.program, "u_Sampler7");
    u_Sampler8 = gl.getUniformLocation(gl.program, "u_Sampler8");
    u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
    u_uvScale = gl.getUniformLocation(gl.program, "u_uvScale");
}

function updateMovement() {
    if (keys['w']) camera.moveForward();
    if (keys['s']) camera.moveBackwards();
    if (keys['a']) camera.moveLeft();
    if (keys['d']) camera.moveRight();
    if (keys['q']) camera.panLeft();
    if (keys['e']) camera.panRight();

    if (keys[" "]) camera.moveUp(); // Space = ascend
    if (keys["shift"]) camera.moveDown(); // Shift = descend

    if (creativeMode) {
        if (keys[" "]) camera.moveUp();
        if (keys["shift"]) camera.moveDown();
    } else {
        camera.lockToGround();
    }
}

function tick() {
    updateMovement();
    coinSpinAngle += 2;
    turtleWalkAngle += 3;
    if (coinsCollected >= totalCoins) {
        updateTurtleMovement();
    }
    checkCoinCollection();

    renderScene();

    requestAnimationFrame(tick);
}

function updateTurtleMovement() {
    let radians = turtleDirection * Math.PI / 180;

    turtleX += Math.sin(radians) * turtleSpeed;
    turtleZ += Math.cos(radians) * turtleSpeed;

    // turn around when near map edges
    if (turtleX > 14 || turtleX < -14 || turtleZ > 14 || turtleZ < -14) {
        turtleDirection += 120 + Math.random() * 120;
    }

    turtleWalkAngle += 3;
}

function renderScene() {
    gl.clearColor(0.5, 0.7, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

    drawSkybox();
    drawGround();
    drawMap();
    if (coinsCollected >= totalCoins) {
        drawTurtle(turtleX, turtleZ);
    }
    if (creativeMode) {
        drawBlockOutline();
    }
    if (mapEffectActive) {
        drawMapEffect();
    }
    drawCoins();
}

function drawTurtle(x, z) {
    let bob = Math.sin(turtleWalkAngle * Math.PI / 180) * 0.08;
    let legSwing = Math.sin(turtleWalkAngle * Math.PI / 180) * 25;

    let body = new Cube();
    body.color = [0.1, 0.6, 0.2, 1.0];
    body.textureNum = -1;
    body.matrix.translate(x - 0.75, 0.35 + bob, z - 0.75);
    body.matrix.scale(1.5, 0.45, 1.5);
    body.render();

    let shell = new Cube();
    shell.color = [0.05, 0.35, 0.1, 1.0];
    shell.textureNum = -1;
    shell.matrix.translate(x - 0.5, 0.75 + bob, z - 0.5);
    shell.matrix.scale(1.0, 0.35, 1.0);
    shell.render();

    let head = new Cube();
    head.color = [0.15, 0.8, 0.25, 1.0];
    head.textureNum = -1;
    head.matrix.translate(x - 0.25, 0.45 + bob, z - 1.15);
    head.matrix.scale(0.5, 0.5, 0.5);
    head.render();

    // LEFT EYE
    let leftEye = new Cube();
    leftEye.color = [0, 0, 0, 1];
    leftEye.textureNum = -1;

    leftEye.matrix.translate(x - 0.15, 0.75 + bob, z - 1.16);
    leftEye.matrix.scale(0.06, 0.06, 0.02);

    leftEye.render();

    // RIGHT EYE
    let rightEye = new Cube();
    rightEye.color = [0, 0, 0, 1];
    rightEye.textureNum = -1;

    rightEye.matrix.translate(x + 0.15, 0.75 + bob, z - 1.16);
    rightEye.matrix.scale(0.06, 0.06, 0.02);

    rightEye.render();

    // SMILE CENTER
    let smile = new Cube();
    smile.color = [0, 0, 0, 1];
    smile.textureNum = -1;

    smile.matrix.translate(x - 0.08, 0.55 + bob, z - 1.16);
    smile.matrix.scale(0.16, 0.03, 0.02);

    smile.render();

    // LEFT SMILE CORNER
    let smileLeft = new Cube();
    smileLeft.color = [0, 0, 0, 1];
    smileLeft.textureNum = -1;

    smileLeft.matrix.translate(x - 0.12, 0.58 + bob, z - 1.16);
    smileLeft.matrix.rotate(-25, 0, 0, 1);
    smileLeft.matrix.scale(0.05, 0.03, 0.02);

    smileLeft.render();

    // RIGHT SMILE CORNER
    let smileRight = new Cube();
    smileRight.color = [0, 0, 0, 1];
    smileRight.textureNum = -1;

    smileRight.matrix.translate(x + 0.07, 0.56 + bob, z - 1.16);
    smileRight.matrix.rotate(25, 0, 0, 1);
    smileRight.matrix.scale(0.05, 0.03, 0.02);

    smileRight.render();

    drawTurtleLeg(x - 0.65, z - 0.55, legSwing, bob);
    drawTurtleLeg(x + 0.45, z - 0.55, -legSwing, bob);
    drawTurtleLeg(x - 0.65, z + 0.45, -legSwing, bob);
    drawTurtleLeg(x + 0.45, z + 0.45, legSwing, bob);
}

function drawTurtleLeg(x, z, angle, bob) {
    let leg = new Cube();
    leg.color = [0.12, 0.55, 0.2, 1.0];
    leg.textureNum = -1;

    leg.matrix.translate(x, 0.25 + bob, z);
    leg.matrix.rotate(angle, 1, 0, 0);
    leg.matrix.scale(0.3, 0.25, 0.45);

    leg.render();
}

function drawCoins() {
    for (let coin of coins) {
        if (coin.collected) continue;

        let c = new Cube();

        c.color = [1.0, 0.75, 0.0, 1.0];
        c.textureNum = -1;

        c.matrix.translate(coin.x, 0.7, coin.z);
        c.matrix.rotate(coinSpinAngle, 0, 1, 0);
        c.matrix.scale(0.35, 0.35, 0.08);

        c.render();
    }
}

function checkCoinCollection() {
    let playerX = camera.eye.elements[0];
    let playerZ = camera.eye.elements[2];

    for (let coin of coins) {
        if (coin.collected) continue;

        let dx = playerX - coin.x;
        let dz = playerZ - coin.z;
        let distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 1.0) {
            coin.collected = true;
            coinsCollected++;

            coinSound.currentTime = 0;
            coinSound.play();

            document.getElementById("coinScore").textContent = coinsCollected;
            if (coinsCollected === totalCoins && !allCoinsMessageShown) {
                allCoinsMessageShown = true;

                winSound.currentTime = 0;
                winSound.play();

                mapEffectActive = true;
                mapEffectStartTime = performance.now() / 1000.0;

                showGamePopup("You've collected 10 coins! Go to the center to see what's new ;)");
            }
        }
    }
}

function initTextures() {
    let pavement = new Image();
    pavement.onload = function() {
        loadTexture(pavement, 0);
    };
    pavement.src = "textures/pavement.png";

    let road = new Image();
    road.onload = function() {
        loadTexture(road, 1);
    };
    road.src = "textures/road.jpg";

    let building = new Image();
    building.onload = function() {
        loadTexture(building, 2);
    };
    building.src = "textures/building.jpg";

    let bush = new Image();
    bush.onload = function() {
        loadTexture(bush, 8);
    };
    bush.src = "textures/bush.jpg"

    loadSkyboxTexture("textures/skybox/sky_front.bmp", 3, u_Sampler3);
    loadSkyboxTexture("textures/skybox/sky_right.bmp", 4, u_Sampler4);
    loadSkyboxTexture("textures/skybox/sky_back (mirrored).jpg", 5, u_Sampler5);
    loadSkyboxTexture("textures/skybox/sky_left (mirrored).jpg", 6, u_Sampler6);
    loadSkyboxTexture("textures/skybox/sky_top.bmp", 7, u_Sampler7);
}

function drawSkybox() {

    let size = 500;
    let half = size / 2;

    // FRONT (-Z)
    drawSkyFace(
        3,
        -half,
        -half,
        -half,
        size,
        size,
        0.1
    );

    // BACK (+Z)
    drawSkyFace(
        5,
        -half,
        -half,
        half,
        size,
        size,
        0.1
    );

    // LEFT (-X)
    drawSkyFace(
        6,
        -half,
        -half,
        -half,
        0.1,
        size,
        size
    );

    // RIGHT (+X)
    drawSkyFace(
        4,
        half,
        -half,
        -half,
        0.1,
        size,
        size
    );

    // TOP (+Y)
    drawSkyFace(
        7,
        -half,
        half,
        -half,
        size,
        0.1,
        size
    );
}

function drawSkyFace(textureNum, x, y, z, sx, sy, sz, mirror=false) {
    let face = new Cube();

    face.textureNum = textureNum;
    face.uvScale = 1;
    face.mirrorUV = mirror;

    face.matrix.translate(x, y, z);
    face.matrix.scale(sx, sy, sz);

    face.render();
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function loadTexture(image, textureUnit) {
    let texture = gl.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    if (textureUnit === 0) {
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(u_Sampler0, 0);
    } else if (textureUnit === 1) {
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(u_Sampler1, 1);
    } else if (textureUnit === 2) {
        gl.activeTexture(gl.TEXTURE2);
        gl.uniform1i(u_Sampler2, 2);
    } else if (textureUnit === 3) {
        gl.activeTexture(gl.TEXTURE3);
        gl.uniform1i(u_Sampler3, 3);
    }
    else if (textureUnit === 8) {
        gl.activeTexture(gl.TEXTURE8);
        gl.uniform1i(u_Sampler8, 8);
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        image
    );

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        if (textureUnit === 2 || textureUnit === 3 || textureUnit === 8) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}

function loadSkyboxTexture(path, textureUnit, sampler) {

    let image = new Image();

    image.onload = function() {

        let texture = gl.createTexture();

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        gl.activeTexture(gl.TEXTURE0 + textureUnit);

        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            image
        );

        gl.uniform1i(sampler, textureUnit);
    };

    image.src = path;
}

function drawGround() {
    let ground = new Cube();

    ground.color = [0.3, 0.8, 0.3, 1.0];

    ground.textureNum = 0;
    ground.uvScale = 24;

    ground.matrix.translate(-16, -0.05, -16);
    ground.matrix.scale(32, 0.1, 32);

    ground.render();
}

function drawSky() {
    let sky = new Cube();
    sky.color = [0.5, 0.7, 1.0, 1.0];

    sky.textureNum = 3;
    sky.uvScale = 1;

    sky.matrix.translate(-500, -500, -500);
    sky.matrix.scale(1000, 1000, 1000);

    sky.render();
}

function drawMap() {

    // Roads
    let road1 = new Cube();
    road1.color = [0.02, 0.02, 0.02, 1];
    road1.textureNum = 1;   // road texture
    road1.uvScale = 1;      // stretch road texture instead of tiling
    road1.matrix.translate(-1, 0.03, -16);
    road1.matrix.scale(2, 0.05, 32);
    road1.render();

    // Buildings
    let buildings = [
        [-11, -11, 2, 5, 2],
        [-7, -10, 2, 3, 2],
        [7, -11, 2, 6, 2],
        [11, -7, 2, 4, 2],

        [-11, 7, 2, 4, 2],
        [-7, 11, 2, 7, 2],
        [7, 8, 2, 3, 2],
        [11, 11, 2, 5, 2],
    ];

    for (let i = 0; i < buildings.length; i++) {

        let b = buildings[i];

        let building = new Cube();

        building.color = [0.3, 0.3, 0.38, 1];

        building.matrix.translate(
            b[0],
            0,
            b[1]
        );

        building.matrix.scale(
            b[2],
            b[3],
            b[4]
        );

        building.textureNum = 2;
        building.uvScale = 0.5;

        building.render();
    }

// Bushes along the road
let bushes = [
    [-3, -12],
    [2, -4],
    [-3, 4],
    [2, 12],
];

for (let i = 0; i < bushes.length; i++) {

    let bush = new Cube();

    bush.color = [0.1, 0.5, 0.1, 1];

    bush.textureNum = 8;
    bush.uvScale = 1;

    bush.matrix.translate(
        bushes[i][0],
        0,
        bushes[i][1]
    );

    bush.matrix.scale(
        1,
        0.8,
        3
    );

    bush.render();
}

    for (let i = 0; i < blocks.length; i++) {
        let b = blocks[i];

        let block = new Cube();
        block.color = [0.6, 0.35, 0.15, 1];

        block.matrix.translate(b.x, b.y, b.z);
        block.render();
    }
}

function getBlockInFront() {
    let f = camera.getForwardVector();

    let x = Math.round(camera.eye.elements[0] + f.elements[0] * 3);
    let y = Math.round(camera.eye.elements[1] + f.elements[1] * 3);
    let z = Math.round(camera.eye.elements[2] + f.elements[2] * 3);

    if (y < 0) y = 0;

    return { x, y, z };
}

function addBlock() {
    let pos = getBlockInFront();

    blocks.push(pos);
}

function deleteBlock() {
    let pos = getBlockInFront();

    for (let i = blocks.length - 1; i >= 0; i--) {
        if (
            blocks[i].x === pos.x &&
            blocks[i].y === pos.y &&
            blocks[i].z === pos.z
        ) {
            blocks.splice(i, 1);
            return;
        }
    }
}

function drawTestWalls() {
    let wall1 = new Cube();
    wall1.color = [0.6, 0.4, 0.25, 1.0];
    wall1.matrix.translate(0, 0, 0);
    wall1.render();

    let wall2 = new Cube();
    wall2.color = [0.6, 0.4, 0.25, 1.0];
    wall2.matrix.translate(2, 0, 0);
    wall2.render();

    let wall3 = new Cube();
    wall3.color = [0.6, 0.4, 0.25, 1.0];
    wall3.matrix.translate(0, 1, 0);
    wall3.render();
}