// Vertex shader
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;

    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }
`;

// Fragment shader
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    
    void main() {
        gl_FragColor = u_FragColor;
    }
`;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// Global controls
let g_globalAngleX = 0.0;
let g_globalAngleY = 0.0;
let g_animationOn = false;
let g_tailAngle = 0.0;
let g_leftFrontLegAngle = 0.0;
let g_leftFrontKneeAngle = 0.0;
let g_leftFrontFootAngle = 0.0;
let g_rightFrontLegAngle = 0.0;
let g_rightFrontKneeAngle = 0.0;
let g_rightFrontFootAngle = 0.0;
let g_leftBackLegAngle = 0.0;
let g_leftBackKneeAngle = 0.0;
let g_leftBackFootAngle = 0.0;
let g_rightBackLegAngle = 0.0;
let g_rightBackKneeAngle = 0.0;
let g_rightBackFootAngle = 0.0;

let g_mouseDown = false;
let g_lastMouseX = null;
let g_lastMouseY = null;

let g_pokeAnimation = false;
let g_pokeStartTime = 0.0;
let g_pokeDuration = 2.5;
let g_pokeSpinAngle = 0.0;

let g_bodyWiggleAngle = 0.0;
let g_bodyBounce = 0.0;
let g_headBob = 0.0;

// Animation time
let g_startTime = performance.now() / 1000.0; // Convert to seconds
let g_seconds = 0.0;

function setUpWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
    
    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Depth testing allows us to correctly render objects in 3D space by keeping track of the depth of each pixel.
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position, u_FragColor, u_ModelMatrix, and u_GlobalRotateMatrix
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');

    if (a_Position < 0 || !u_FragColor || !u_ModelMatrix || !u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of a shader variable');
        return;
    }

    let identity = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements);
}

function addActionForHtmlUI() {

    canvas.addEventListener("mousedown", function(ev) {
        if (ev.shiftKey) {
            ev.preventDefault();
            ev.stopImmediatePropagation();

            startPokeAnimation();
            return false;
        }
    }, true);

    canvas.onmousedown = function(ev) {
        g_mouseDown = true;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    };

    canvas.onmouseup = function() {
        g_mouseDown = false;
    };

    canvas.onmouseleave = function() {
        g_mouseDown = false;
    };

    canvas.onmousemove = function(ev) {
        if (g_mouseDown) {
            let dx = ev.clientX - g_lastMouseX;
            let dy = ev.clientY - g_lastMouseY;

            g_globalAngleY += dx * 0.5;
            g_globalAngleX += dy * 0.5;

            g_lastMouseX = ev.clientX;
            g_lastMouseY = ev.clientY;

            renderScene();
        }
    };

    document.getElementById("cameraXSlide").addEventListener('input', function() {
        g_globalAngleX = Number(this.value);
        renderScene();
    });

    document.getElementById("cameraYSlide").addEventListener('input', function() {
        g_globalAngleY = Number(this.value);
        renderScene();
    });

    document.getElementById("tailSlide").addEventListener('input', function() {
        g_tailAngle = this.value;
        renderScene();
    });

    document.getElementById("animationOnButton").onclick = function() {
        g_animationOn = true;
    };

    document.getElementById("animationOffButton").onclick = function() {
        g_animationOn = false;
    };

    document.getElementById("leftFrontLegSlide").addEventListener("input", function() {
        g_leftFrontLegAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("leftFrontKneeSlide").addEventListener("input", function() {
        g_leftFrontKneeAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("leftFrontFootSlide").addEventListener("input", function() {
        g_leftFrontFootAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("rightFrontLegSlide").addEventListener("input", function() {
        g_rightFrontLegAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("rightFrontKneeSlide").addEventListener("input", function() {
        g_rightFrontKneeAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("rightFrontFootSlide").addEventListener("input", function() {
        g_rightFrontFootAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("leftBackLegSlide").addEventListener("input", function() {
        g_leftBackLegAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("leftBackKneeSlide").addEventListener("input", function() {
        g_leftBackKneeAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("leftBackFootSlide").addEventListener("input", function() {
        g_leftBackFootAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("rightBackLegSlide").addEventListener("input", function() {
        g_rightBackLegAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("rightBackKneeSlide").addEventListener("input", function() {
        g_rightBackKneeAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("rightBackFootSlide").addEventListener("input", function() {
        g_rightBackFootAngle = Number(this.value);
        renderScene();
    });
}

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime; // Convert to seconds

    updateAnimationAngles();
    renderScene();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_animationOn) {
        let walk = Math.sin(g_seconds * 3);
        let fastWalk = Math.sin(g_seconds * 6);

        // Diagonal walking/swimming pattern
        g_leftFrontLegAngle = 25 * walk;
        g_rightBackLegAngle = 25 * walk;

        g_rightFrontLegAngle = -25 * walk;
        g_leftBackLegAngle = -25 * walk;

        // Knees bend during motion
        g_leftFrontKneeAngle = 20 * Math.abs(walk);
        g_rightFrontKneeAngle = 20 * Math.abs(walk);
        g_leftBackKneeAngle = 20 * Math.abs(walk);
        g_rightBackKneeAngle = 20 * Math.abs(walk);

        // Feet flap
        g_leftFrontFootAngle = 15 * fastWalk;
        g_rightBackFootAngle = 15 * fastWalk;

        g_rightFrontFootAngle = -15 * fastWalk;
        g_leftBackFootAngle = -15 * fastWalk;

        // Tail wag
        g_tailAngle = 25 * Math.sin(g_seconds * 4);
    }

   if (g_pokeAnimation) {
        let t = g_seconds - g_pokeStartTime;

        if (t < g_pokeDuration) {
            // Spin gets very fast, like a Mario shell
            g_pokeSpinAngle = 720 * t;

            // Small bounce while spinning
            g_bodyBounce = 0.05 * Math.abs(Math.sin(t * 12));

            // Pull limbs inward while spinning
            g_leftFrontLegAngle = 35 * Math.sin(t * 20);
            g_rightFrontLegAngle = -35 * Math.sin(t * 20);
            g_leftBackLegAngle = -35 * Math.sin(t * 20);
            g_rightBackLegAngle = 35 * Math.sin(t * 20);

            // Keep knees/feet tucked close
            g_leftFrontKneeAngle = 25;
            g_rightFrontKneeAngle = 25;
            g_leftBackKneeAngle = 25;
            g_rightBackKneeAngle = 25;

            g_leftFrontFootAngle = -20;
            g_rightFrontFootAngle = -20;
            g_leftBackFootAngle = -20;
            g_rightBackFootAngle = -20;

            // Tail spins/wags too
            g_tailAngle = 45 * Math.sin(t * 18);

            // No side wiggle for this one
            g_bodyWiggleAngle = 0;
            g_headBob = 0;
        } else {
            g_pokeAnimation = false;

            // Reset poke-only movement
            g_pokeSpinAngle = 0.0;
            g_bodyBounce = 0.0;
            g_bodyWiggleAngle = 0.0;
            g_headBob = 0.0;
        }
    }
}

function renderScene() {

    let startTime = performance.now();

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // global rotation from slider
    let globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
    globalRotMat.rotate(g_globalAngleY, 0, 1, 0);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // cube
    let body = new Matrix4();

    body.setTranslate(-0.5, -0.5, 0.0);
    body.scale(1.0, 1.0, 1.0);

    drawTurtle(body, [0.2, 0.8, 0.3, 1.0]);

    let duration = performance.now() - startTime;
    document.getElementById("performanceText").innerHTML =
    "ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration);
}

function drawCube(matrix, color) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    // Front face
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
    drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);

    // Back face, darker
    gl.uniform4f(u_FragColor, color[0]*0.7, color[1]*0.7, color[2]*0.7, color[3]);
    drawTriangle3D([0,0,1, 1,0,1, 1,1,1]);
    drawTriangle3D([0,0,1, 1,1,1, 0,1,1]);

    // Top face, lighter
    gl.uniform4f(u_FragColor, color[0]*1.1, color[1]*1.1, color[2]*1.1, color[3]);
    drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
    drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);

    // Bottom face, darker
    gl.uniform4f(u_FragColor, color[0]*0.5, color[1]*0.5, color[2]*0.5, color[3]);
    drawTriangle3D([0,0,0, 1,0,1, 0,0,1]);
    drawTriangle3D([0,0,0, 1,0,0, 1,0,1]);

    // Right face
    gl.uniform4f(u_FragColor, color[0]*0.85, color[1]*0.85, color[2]*0.85, color[3]);
    drawTriangle3D([1,0,0, 1,1,0, 1,1,1]);
    drawTriangle3D([1,0,0, 1,1,1, 1,0,1]);

    // Left face
    gl.uniform4f(u_FragColor, color[0]*0.6, color[1]*0.6, color[2]*0.6, color[3]);
    drawTriangle3D([0,0,0, 0,1,1, 0,1,0]);
    drawTriangle3D([0,0,0, 0,0,1, 0,1,1]);
}

function drawTriangle3D(vertices) {
    // Create a buffer object
    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    let n = vertices.length / 3; // Number of vertices
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    // Assign the buffer object to a_Position variable    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
    // Enable a_Position
    gl.enableVertexAttribArray(a_Position);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTurtle() {

    let turtleBase = new Matrix4();
    turtleBase.translate(0.0, g_bodyBounce, 0.0);
    turtleBase.rotate(g_pokeSpinAngle, 0, 1, 0);
    turtleBase.rotate(g_bodyWiggleAngle, 0, 0, 1);
    
    let shell = new Matrix4(turtleBase);
    shell.translate(0.0, -0.18, 0.0);
    shell.scale(1.2, 1.0, 1.1);
    drawShellPrimitive(shell, [0.1, 0.55, 0.2, 1.0]);

    // Head
    let head = new Matrix4(turtleBase);
    head.translate(0.45, -0.05 + g_headBob, -0.15);
    head.rotate(-5, 0, 1, 0);
    head.scale(0.3, 0.25, 0.3);
    drawCube(head, [0.2, 0.8, 0.3, 1.0]);

    // =======================
// Face attached to front of head
// =======================

    // Left eye
    let leftEye = new Matrix4(head);
    leftEye.translate(0.98, 0.68, 0.25);
    leftEye.scale(0.10, 0.10, 0.08);
    drawCube(leftEye, [0.0, 0.0, 0.0, 1.0]);

    // Right eye
    let rightEye = new Matrix4(head);
    rightEye.translate(0.98, 0.68, 0.62);
    rightEye.scale(0.10, 0.10, 0.08);
    drawCube(rightEye, [0.0, 0.0, 0.0, 1.0]);

    // U smile left side
    let smileLeft = new Matrix4(head);
    smileLeft.translate(1.0, 0.32, 0.38);
    smileLeft.scale(0.07, 0.18, 0.07);
    drawCube(smileLeft, [0.0, 0.0, 0.0, 1.0]);

    // U smile bottom
    let smileBottom = new Matrix4(head);
    smileBottom.translate(1.0, 0.25, 0.45);
    smileBottom.scale(0.07, 0.07, 0.18);
    drawCube(smileBottom, [0.0, 0.0, 0.0, 1.0]);

    // U smile right side
    let smileRight = new Matrix4(head);
    smileRight.translate(1.0, 0.32, 0.60);
    smileRight.scale(0.07, 0.18, 0.07);
    drawCube(smileRight, [0.0, 0.0, 0.0, 1.0]);

    // Left Front Leg
    let leftFrontUpper = new Matrix4(turtleBase);
    leftFrontUpper.translate(0.25, -0.25, -0.45);
    leftFrontUpper.rotate(g_leftFrontLegAngle, 0, 0, 1);
    leftFrontUpper.translate(0.0, -0.10, 0.0);
    leftFrontUpper.scale(0.16, 0.14, 0.18);
    drawCube(leftFrontUpper, [0.15, 0.7, 0.25, 1.0]);

    let leftFrontLower = new Matrix4(leftFrontUpper);
    leftFrontLower.translate(0.0, -0.55, 0.0);
    leftFrontLower.rotate(g_leftFrontKneeAngle, 0, 0, 1);
    leftFrontLower.scale(0.75, 0.45, 0.85);
    drawCube(leftFrontLower, [0.12, 0.6, 0.22, 1.0]);

    let leftFrontFoot = new Matrix4(leftFrontLower);
    leftFrontFoot.translate(0.0, -0.45, 0.0);
    leftFrontFoot.rotate(g_leftFrontFootAngle, 0, 0, 1);
    leftFrontFoot.scale(1.05, 0.35, 1.05);
    drawCube(leftFrontFoot, [0.1, 0.55, 0.2, 1.0]);

    // Right Front Leg
    let rightFrontUpper = new Matrix4(turtleBase);
    rightFrontUpper.translate(0.25, -0.25, 0.25);
    rightFrontUpper.rotate(g_rightFrontLegAngle, 0, 0, 1);
    rightFrontUpper.translate(0.0, -0.10, 0.0);
    rightFrontUpper.scale(0.16, 0.14, 0.18);
    drawCube(rightFrontUpper, [0.15, 0.7, 0.25, 1.0]);

    let rightFrontLower = new Matrix4(rightFrontUpper);
    rightFrontLower.translate(0.0, -0.55, 0.0);
    rightFrontLower.rotate(g_rightFrontKneeAngle, 0, 0, 1);
    rightFrontLower.scale(0.75, 0.45, 0.85);
    drawCube(rightFrontLower, [0.12, 0.6, 0.22, 1.0]);

    let rightFrontFoot = new Matrix4(rightFrontLower);
    rightFrontFoot.translate(0.0, -0.45, 0.0);
    rightFrontFoot.rotate(g_rightFrontFootAngle, 0, 0, 1);
    rightFrontFoot.scale(1.05, 0.35, 1.05);
    drawCube(rightFrontFoot, [0.1, 0.55, 0.2, 1.0]);

    // Left Back Leg
    let leftBackUpper = new Matrix4(turtleBase);
    leftBackUpper.translate(-0.45, -0.25, -0.45);
    leftBackUpper.rotate(g_leftBackLegAngle, 0, 0, 1);
    leftBackUpper.translate(0.0, -0.10, 0.0);
    leftBackUpper.scale(0.16, 0.14, 0.18);
    drawCube(leftBackUpper, [0.15, 0.7, 0.25, 1.0]);

    let leftBackLower = new Matrix4(leftBackUpper);
    leftBackLower.translate(0.0, -0.55, 0.0);
    leftBackLower.rotate(g_leftBackKneeAngle, 0, 0, 1);
    leftBackLower.scale(0.75, 0.45, 0.85);
    drawCube(leftBackLower, [0.12, 0.6, 0.22, 1.0]);

    let leftBackFoot = new Matrix4(leftBackLower);
    leftBackFoot.translate(0.0, -0.45, 0.0);
    leftBackFoot.rotate(g_leftBackFootAngle, 0, 0, 1);
    leftBackFoot.scale(1.05, 0.35, 1.05);
    drawCube(leftBackFoot, [0.1, 0.55, 0.2, 1.0]);

    // Right Back Leg
    let rightBackUpper = new Matrix4(turtleBase);
    rightBackUpper.translate(-0.45, -0.25, 0.25);
    rightBackUpper.rotate(g_rightBackLegAngle, 0, 0, 1);
    rightBackUpper.translate(0.0, -0.10, 0.0);
    rightBackUpper.scale(0.16, 0.14, 0.18);
    drawCube(rightBackUpper, [0.15, 0.7, 0.25, 1.0]);

    let rightBackLower = new Matrix4(rightBackUpper);
    rightBackLower.translate(0.0, -0.55, 0.0);
    rightBackLower.rotate(g_rightBackKneeAngle, 0, 0, 1);
    rightBackLower.scale(0.75, 0.45, 0.85);
    drawCube(rightBackLower, [0.12, 0.6, 0.22, 1.0]);

    let rightBackFoot = new Matrix4(rightBackLower);
    rightBackFoot.translate(0.0, -0.45, 0.0);
    rightBackFoot.rotate(g_rightBackFootAngle, 0, 0, 1);
    rightBackFoot.scale(1.05, 0.35, 1.05);
    drawCube(rightBackFoot, [0.1, 0.55, 0.2, 1.0]);

    // Tail joint at back of shell
    let tail = new Matrix4(turtleBase);
    tail.translate(-0.62, -0.05, -0.05);   // joint position
    tail.rotate(g_tailAngle, 0, 1, 0);     // wag left/right
    tail.translate(-0.15, 0.0, 0.0);       // extend tail away from body
    tail.scale(0.18, 0.08, 0.10);
    drawCube(tail, [0.15, 0.7, 0.25, 1.0]);
}

function drawShellPrimitive(matrix, color) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    // Bottom rectangle corners
    let A = [-0.5, 0.0, -0.35];
    let B = [ 0.5, 0.0, -0.35];
    let C = [ 0.5, 0.0,  0.35];
    let D = [-0.5, 0.0,  0.35];

    // Raised smaller top rectangle
    let E = [-0.35, 0.3, -0.25];
    let F = [ 0.35, 0.3, -0.25];
    let G = [ 0.35, 0.3,  0.25];
    let H = [-0.35, 0.3,  0.25];

    // Front side
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    drawTriangle3D([...A, ...B, ...F]);
    drawTriangle3D([...A, ...F, ...E]);

    // Back side
    gl.uniform4f(u_FragColor, color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, color[3]);
    drawTriangle3D([...D, ...H, ...G]);
    drawTriangle3D([...D, ...G, ...C]);

    // Left side
    gl.uniform4f(u_FragColor, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, color[3]);
    drawTriangle3D([...A, ...E, ...H]);
    drawTriangle3D([...A, ...H, ...D]);

    // Right side
    gl.uniform4f(u_FragColor, color[0] * 0.9, color[1] * 0.9, color[2] * 0.9, color[3]);
    drawTriangle3D([...B, ...C, ...G]);
    drawTriangle3D([...B, ...G, ...F]);

    // Top face
    gl.uniform4f(u_FragColor, color[0] * 1.1, color[1] * 1.1, color[2] * 1.1, color[3]);
    drawTriangle3D([...E, ...F, ...G]);
    drawTriangle3D([...E, ...G, ...H]);

    // Optional bottom face
    gl.uniform4f(u_FragColor, color[0] * 0.5, color[1] * 0.5, color[2] * 0.5, color[3]);
    drawTriangle3D([...A, ...D, ...C]);
    drawTriangle3D([...A, ...C, ...B]);
}

function startPokeAnimation() {
    g_pokeAnimation = true;
    g_pokeStartTime = g_seconds;

    g_bodyWiggleAngle = 0.0;
    g_bodyBounce = 0.0;
    g_headBob = 0.0;

    console.log("POKE ANIMATION STARTED");
}

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    canvas.mouseDown = function(ev) {
        if (ev.shiftKey) {
            g_pokeAnimation = true;
            g_pokeStartTime = g_seconds;
            console.log("Shift click event started!");
        }
    };

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Depth testing allows us to correctly render objects in 3D space by keeping track of the depth of each pixel.
    gl.enable(gl.DEPTH_TEST);


    // Connect shader variables to JavaScript variables
    connectVariablesToGLSL();

    // UI event listeners
    addActionForHtmlUI();

    // Set clear color and enable hidden surface removal
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    canvas.onmousedown = function(ev) {
        g_mouseDown = true;
        g_lastMouseX = ev.clientX;
        g_lastMouseY = ev.clientY;
    };

    canvas.onmouseup = function() {
        g_mouseDown = false;
    };

    canvas.onmouseleave = function() {
        g_mouseDown = false;
    };

    canvas.onmousemove = function(ev) {
        if (g_mouseDown) {
            let dx = ev.clientX - g_lastMouseX;
            let dy = ev.clientY - g_lastMouseY;

            g_globalAngleY += dx * 0.5;
            g_globalAngleX += dy * 0.5;

            g_lastMouseX = ev.clientX;
            g_lastMouseY = ev.clientY;

            renderScene();
        }
    };

    // Start aimation loop
    renderScene();

    requestAnimationFrame(tick);
}