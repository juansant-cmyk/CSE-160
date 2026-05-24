// Turtle.js
// Blocky turtle transferred from the original Assignment 2 animal to Assignment 4 lighting

var g_turtleAnimationOn = true;

var g_tailAngle = 0.0;
var g_leftFrontLegAngle = 0.0;
var g_leftFrontKneeAngle = 0.0;
var g_leftFrontFootAngle = 0.0;
var g_rightFrontLegAngle = 0.0;
var g_rightFrontKneeAngle = 0.0;
var g_rightFrontFootAngle = 0.0;
var g_leftBackLegAngle = 0.0;
var g_leftBackKneeAngle = 0.0;
var g_leftBackFootAngle = 0.0;
var g_rightBackLegAngle = 0.0;
var g_rightBackKneeAngle = 0.0;
var g_rightBackFootAngle = 0.0;

var g_bodyBounce = 0.0;
var g_headBob = 0.0;
var g_bodyWiggleAngle = 0.0;

var g_pokeAnimation = false;
var g_pokeStartTime = 0.0;
var g_pokeDuration = 2.5;
var g_pokeSpinAngle = 0.0;

function updateTurtleAnimationAngles() {
    let seconds = typeof g_seconds !== "undefined" ? g_seconds : performance.now() / 1000.0;

    if (g_turtleAnimationOn) {
        let walk = Math.sin(seconds * 3.0);
        let fastWalk = Math.sin(seconds * 6.0);

        g_leftFrontLegAngle = 25.0 * walk;
        g_rightBackLegAngle = 25.0 * walk;

        g_rightFrontLegAngle = -25.0 * walk;
        g_leftBackLegAngle = -25.0 * walk;

        g_leftFrontKneeAngle = 20.0 * Math.abs(walk);
        g_rightFrontKneeAngle = 20.0 * Math.abs(walk);
        g_leftBackKneeAngle = 20.0 * Math.abs(walk);
        g_rightBackKneeAngle = 20.0 * Math.abs(walk);

        g_leftFrontFootAngle = 15.0 * fastWalk;
        g_rightBackFootAngle = 15.0 * fastWalk;

        g_rightFrontFootAngle = -15.0 * fastWalk;
        g_leftBackFootAngle = -15.0 * fastWalk;

        g_tailAngle = 25.0 * Math.sin(seconds * 4.0);

        g_bodyBounce = 0.03 * Math.abs(Math.sin(seconds * 3.0));
        g_headBob = 0.03 * Math.sin(seconds * 3.0);
        g_bodyWiggleAngle = 2.0 * Math.sin(seconds * 2.5);
    }

    if (g_pokeAnimation) {
        let t = seconds - g_pokeStartTime;

        if (t < g_pokeDuration) {
            g_pokeSpinAngle = 720.0 * t;
            g_bodyBounce = 0.05 * Math.abs(Math.sin(t * 12.0));

            g_leftFrontLegAngle = 35.0 * Math.sin(t * 20.0);
            g_rightFrontLegAngle = -35.0 * Math.sin(t * 20.0);
            g_leftBackLegAngle = -35.0 * Math.sin(t * 20.0);
            g_rightBackLegAngle = 35.0 * Math.sin(t * 20.0);

            g_leftFrontKneeAngle = 25.0;
            g_rightFrontKneeAngle = 25.0;
            g_leftBackKneeAngle = 25.0;
            g_rightBackKneeAngle = 25.0;

            g_leftFrontFootAngle = -20.0;
            g_rightFrontFootAngle = -20.0;
            g_leftBackFootAngle = -20.0;
            g_rightBackFootAngle = -20.0;

            g_tailAngle = 45.0 * Math.sin(t * 18.0);
            g_bodyWiggleAngle = 0.0;
            g_headBob = 0.0;
        } else {
            g_pokeAnimation = false;
            g_pokeSpinAngle = 0.0;
            g_bodyBounce = 0.0;
            g_bodyWiggleAngle = 0.0;
            g_headBob = 0.0;
        }
    }
}

function startTurtlePokeAnimation() {
    g_pokeAnimation = true;
    g_pokeStartTime = typeof g_seconds !== "undefined" ? g_seconds : 0.0;
}

function drawTurtleLitCube(matrix, color) {
    let cube = new Cube();
    cube.color = color;
    cube.matrix = matrix;

    if (cube.normalMatrix) {
        cube.normalMatrix.setInverseOf(cube.matrix);
        cube.normalMatrix.transpose();
    }

    if (typeof cube.renderFast === "function") {
        cube.renderFast();
    } else {
        cube.render();
    }
}

function drawTurtle(baseMatrix) {
    let turtleBase = new Matrix4(baseMatrix || new Matrix4());

    turtleBase.translate(0.0, g_bodyBounce, 0.0);
    turtleBase.rotate(g_pokeSpinAngle, 0, 1, 0);
    turtleBase.rotate(g_bodyWiggleAngle, 0, 0, 1);

    // Shell
    let shell = new Matrix4(turtleBase);
    shell.translate(0.0, -0.18, 0.0);
    shell.scale(1.2, 1.0, 1.1);
    drawShellPrimitive(shell, [0.1, 0.55, 0.2, 1.0]);

    // Head
    let head = new Matrix4(turtleBase);
    head.translate(0.45, -0.05 + g_headBob, -0.15);
    head.rotate(-5, 0, 1, 0);
    head.scale(0.3, 0.25, 0.3);
    drawTurtleLitCube(head, [0.2, 0.8, 0.3, 1.0]);

    // Face attached to front of head.
    // Slightly outside the surface to prevent z-fighting.
    let leftEye = new Matrix4(head);
    leftEye.translate(1.03, 0.68, 0.25);
    leftEye.scale(0.10, 0.10, 0.08);
    drawTurtleLitCube(leftEye, [0.0, 0.0, 0.0, 1.0]);

    let rightEye = new Matrix4(head);
    rightEye.translate(1.03, 0.68, 0.62);
    rightEye.scale(0.10, 0.10, 0.08);
    drawTurtleLitCube(rightEye, [0.0, 0.0, 0.0, 1.0]);

    let smileLeft = new Matrix4(head);
    smileLeft.translate(1.04, 0.32, 0.38);
    smileLeft.scale(0.07, 0.18, 0.07);
    drawTurtleLitCube(smileLeft, [0.0, 0.0, 0.0, 1.0]);

    let smileBottom = new Matrix4(head);
    smileBottom.translate(1.04, 0.25, 0.45);
    smileBottom.scale(0.07, 0.07, 0.18);
    drawTurtleLitCube(smileBottom, [0.0, 0.0, 0.0, 1.0]);

    let smileRight = new Matrix4(head);
    smileRight.translate(1.04, 0.32, 0.60);
    smileRight.scale(0.07, 0.18, 0.07);
    drawTurtleLitCube(smileRight, [0.0, 0.0, 0.0, 1.0]);

    // Left Front Leg
    let leftFrontUpper = new Matrix4(turtleBase);
    leftFrontUpper.translate(0.25, -0.25, -0.45);
    leftFrontUpper.rotate(g_leftFrontLegAngle, 0, 0, 1);
    leftFrontUpper.translate(0.0, -0.10, 0.0);
    leftFrontUpper.scale(0.16, 0.14, 0.18);
    drawTurtleLitCube(leftFrontUpper, [0.15, 0.7, 0.25, 1.0]);

    let leftFrontLower = new Matrix4(leftFrontUpper);
    leftFrontLower.translate(0.0, -0.55, 0.0);
    leftFrontLower.rotate(g_leftFrontKneeAngle, 0, 0, 1);
    leftFrontLower.scale(0.75, 0.45, 0.85);
    drawTurtleLitCube(leftFrontLower, [0.12, 0.6, 0.22, 1.0]);

    let leftFrontFoot = new Matrix4(leftFrontLower);
    leftFrontFoot.translate(0.0, -0.45, 0.0);
    leftFrontFoot.rotate(g_leftFrontFootAngle, 0, 0, 1);
    leftFrontFoot.scale(1.05, 0.35, 1.05);
    drawTurtleLitCube(leftFrontFoot, [0.1, 0.55, 0.2, 1.0]);

    // Right Front Leg
    let rightFrontUpper = new Matrix4(turtleBase);
    rightFrontUpper.translate(0.25, -0.25, 0.25);
    rightFrontUpper.rotate(g_rightFrontLegAngle, 0, 0, 1);
    rightFrontUpper.translate(0.0, -0.10, 0.0);
    rightFrontUpper.scale(0.16, 0.14, 0.18);
    drawTurtleLitCube(rightFrontUpper, [0.15, 0.7, 0.25, 1.0]);

    let rightFrontLower = new Matrix4(rightFrontUpper);
    rightFrontLower.translate(0.0, -0.55, 0.0);
    rightFrontLower.rotate(g_rightFrontKneeAngle, 0, 0, 1);
    rightFrontLower.scale(0.75, 0.45, 0.85);
    drawTurtleLitCube(rightFrontLower, [0.12, 0.6, 0.22, 1.0]);

    let rightFrontFoot = new Matrix4(rightFrontLower);
    rightFrontFoot.translate(0.0, -0.45, 0.0);
    rightFrontFoot.rotate(g_rightFrontFootAngle, 0, 0, 1);
    rightFrontFoot.scale(1.05, 0.35, 1.05);
    drawTurtleLitCube(rightFrontFoot, [0.1, 0.55, 0.2, 1.0]);

    // Left Back Leg
    let leftBackUpper = new Matrix4(turtleBase);
    leftBackUpper.translate(-0.45, -0.25, -0.45);
    leftBackUpper.rotate(g_leftBackLegAngle, 0, 0, 1);
    leftBackUpper.translate(0.0, -0.10, 0.0);
    leftBackUpper.scale(0.16, 0.14, 0.18);
    drawTurtleLitCube(leftBackUpper, [0.15, 0.7, 0.25, 1.0]);

    let leftBackLower = new Matrix4(leftBackUpper);
    leftBackLower.translate(0.0, -0.55, 0.0);
    leftBackLower.rotate(g_leftBackKneeAngle, 0, 0, 1);
    leftBackLower.scale(0.75, 0.45, 0.85);
    drawTurtleLitCube(leftBackLower, [0.12, 0.6, 0.22, 1.0]);

    let leftBackFoot = new Matrix4(leftBackLower);
    leftBackFoot.translate(0.0, -0.45, 0.0);
    leftBackFoot.rotate(g_leftBackFootAngle, 0, 0, 1);
    leftBackFoot.scale(1.05, 0.35, 1.05);
    drawTurtleLitCube(leftBackFoot, [0.1, 0.55, 0.2, 1.0]);

    // Right Back Leg
    let rightBackUpper = new Matrix4(turtleBase);
    rightBackUpper.translate(-0.45, -0.25, 0.25);
    rightBackUpper.rotate(g_rightBackLegAngle, 0, 0, 1);
    rightBackUpper.translate(0.0, -0.10, 0.0);
    rightBackUpper.scale(0.16, 0.14, 0.18);
    drawTurtleLitCube(rightBackUpper, [0.15, 0.7, 0.25, 1.0]);

    let rightBackLower = new Matrix4(rightBackUpper);
    rightBackLower.translate(0.0, -0.55, 0.0);
    rightBackLower.rotate(g_rightBackKneeAngle, 0, 0, 1);
    rightBackLower.scale(0.75, 0.45, 0.85);
    drawTurtleLitCube(rightBackLower, [0.12, 0.6, 0.22, 1.0]);

    let rightBackFoot = new Matrix4(rightBackLower);
    rightBackFoot.translate(0.0, -0.45, 0.0);
    rightBackFoot.rotate(g_rightBackFootAngle, 0, 0, 1);
    rightBackFoot.scale(1.05, 0.35, 1.05);
    drawTurtleLitCube(rightBackFoot, [0.1, 0.55, 0.2, 1.0]);

    // Tail
    let tail = new Matrix4(turtleBase);
    tail.translate(-0.62, -0.05, -0.05);
    tail.rotate(g_tailAngle, 0, 1, 0);
    tail.translate(-0.15, 0.0, 0.0);
    tail.scale(0.18, 0.08, 0.10);
    drawTurtleLitCube(tail, [0.15, 0.7, 0.25, 1.0]);
}

function drawShellPrimitive(matrix, color) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    if (typeof u_NormalMatrix !== "undefined" && u_NormalMatrix) {
        let normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    }

    let A = [-0.5, 0.0, -0.35];
    let B = [ 0.5, 0.0, -0.35];
    let C = [ 0.5, 0.0,  0.35];
    let D = [-0.5, 0.0,  0.35];

    let E = [-0.35, 0.3, -0.25];
    let F = [ 0.35, 0.3, -0.25];
    let G = [ 0.35, 0.3,  0.25];
    let H = [-0.35, 0.3,  0.25];

    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

    drawTriangle3DWithAutoNormal([...A, ...B, ...F]);
    drawTriangle3DWithAutoNormal([...A, ...F, ...E]);

    drawTriangle3DWithAutoNormal([...D, ...H, ...G]);
    drawTriangle3DWithAutoNormal([...D, ...G, ...C]);

    drawTriangle3DWithAutoNormal([...A, ...E, ...H]);
    drawTriangle3DWithAutoNormal([...A, ...H, ...D]);

    drawTriangle3DWithAutoNormal([...B, ...C, ...G]);
    drawTriangle3DWithAutoNormal([...B, ...G, ...F]);

    drawTriangle3DWithAutoNormal([...E, ...F, ...G]);
    drawTriangle3DWithAutoNormal([...E, ...G, ...H]);

    drawTriangle3DWithAutoNormal([...A, ...D, ...C]);
    drawTriangle3DWithAutoNormal([...A, ...C, ...B]);
}

function drawTriangle3DWithAutoNormal(vertices) {
    let p0 = [vertices[0], vertices[1], vertices[2]];
    let p1 = [vertices[3], vertices[4], vertices[5]];
    let p2 = [vertices[6], vertices[7], vertices[8]];

    let u = [
        p1[0] - p0[0],
        p1[1] - p0[1],
        p1[2] - p0[2]
    ];

    let v = [
        p2[0] - p0[0],
        p2[1] - p0[1],
        p2[2] - p0[2]
    ];

    let n = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
    ];

    let length = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);

    if (length > 0.00001) {
        n[0] /= length;
        n[1] /= length;
        n[2] /= length;
    }

    let normals = [
        n[0], n[1], n[2],
        n[0], n[1], n[2],
        n[0], n[1], n[2]
    ];

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    if (typeof a_Normal !== "undefined" && a_Normal >= 0) {
        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}