let canvas;
let gl;

let a_Position;
let u_FragColor;
let u_Size;

let g_lastX = null;
let g_lastY = null;
let g_minDrawDistance = 0.40;

// Selected settings
let g_selectedType = 0; // 0: point, 1: triangle, 2: circle
let g_SelectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedSegments = 10;

// Arrays to store the list of shapes
let g_shapesList = [];

// Vertex shader program
const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }
`;

const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }
`;

function main() {
    console.log("main ran");
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    canvas.onmousedown = function(ev) {
        g_lastX = null;
        g_lastY = null;
        click(ev);
    };
    canvas.onmousemove = function(ev) {
        if (ev.buttons == 1) {
            click(ev);
        }
    };

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

function addActionsForHtmlUI() {
    document.getElementById('clearButton').onclick = function() {
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    document.getElementById('pointButton').onclick = function() {
        g_selectedType = 0;
    };

    document.getElementById('triangleButton').onclick = function() {
        g_selectedType = 1;
    };

    document.getElementById('circleButton').onclick = function() {
        g_selectedType = 2;
    };

    document.getElementById('redSlider').addEventListener('input', function() {
        g_SelectedColor[0] = this.value / 100;
    });

    document.getElementById('greenSlider').addEventListener('input', function() {
        g_SelectedColor[1] = this.value / 100;
    });

    document.getElementById('blueSlider').addEventListener('input', function() {
        g_SelectedColor[2] = this.value / 100;
    });

    document.getElementById('sizeSlider').addEventListener('input', function() {
        g_selectedSize = Number(this.value);
    });

    document.getElementById('segmentSlider').addEventListener('input', function() {
        g_selectedSegments = Number(this.value);
        console.log("Segments: " + g_selectedSegments);
    });
}

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    if (g_lastX !== null && g_lastY !== null) {
        let dx = x - g_lastX;
        let dy = y - g_lastY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < g_minDrawDistance) {
            return;
        }
    }

    g_lastX = x;
    g_lastY = y;

    if (g_selectedType === 0) {
        drawPoint(x, y);
    } else if (g_selectedType === 1) {
        drawTriangleAt(x, y);
    } else {
        drawCircleAt(x, y);
    }
}

function drawPoint(x, y) {
    gl.disableVertexAttribArray(a_Position);

    gl.vertexAttrib3f(a_Position, x, y, 0.0);
    gl.uniform4f(
        u_FragColor,
        g_SelectedColor[0],
        g_SelectedColor[1],
        g_SelectedColor[2],
        g_SelectedColor[3]
    );
    gl.uniform1f(u_Size, g_selectedSize);
    gl.drawArrays(gl.POINTS, 0, 1);
}

function drawTriangleAt(x, y) {
    const d = g_selectedSize / 200.0;
    const vertices = new Float32Array([
        x,     y + d,
        x - d, y - d,
        x + d, y - d
    ]);
    drawTriangle(vertices);
}

function drawCircleAt(x, y) {
    const radius = g_selectedSize / 200.0;
    const segments = Number(g_selectedSegments);
    const angleStep = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
        const angle1 = i * angleStep;
        const angle2 = (i + 1) * angleStep;

        const x1 = x;
        const y1 = y;
        const x2 = x + Math.cos(angle1) * radius;
        const y2 = y + Math.sin(angle1) * radius;
        const x3 = x + Math.cos(angle2) * radius;
        const y3 = y + Math.sin(angle2) * radius;

        drawTriangle(new Float32Array([
            x1, y1,
            x2, y2,
            x3, y3
        ]));
    }
}

function drawTriangle(vertices) {
    const n = 3;
    const vertexBuffer = gl.createBuffer();

    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(
        u_FragColor,
        g_SelectedColor[0],
        g_SelectedColor[1],
        g_SelectedColor[2],
        g_SelectedColor[3]
    );

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawMyPicture() {
    // SKY GRADIENT

    // top (lighter)
    g_SelectedColor = [1.0, 0.80, 0.55, 1.0];
    drawTriangle(new Float32Array([
        -1.0,  1.0,
        1.0,  1.0,
        -1.0,  0.0
    ]));

    // bottom (darker)
    g_SelectedColor = [1.0, 0.50, 0.30, 1.0];
    drawTriangle(new Float32Array([
        -1.0,  0.0,
        1.0,  1.0,
        1.0,  0.0
    ]));
   
    // ==== OCEAN ====

    // deep blue base
    g_SelectedColor = [0.15, 0.45, 0.75]
    drawTriangle(new Float32Array([
        -1.0,  0.0,
        1.0,  0.0,
        -1.0, -1.0
    ]));

    drawTriangle(new Float32Array([
        1.0,  0.0,
        1.0, -1.0,
        -1.0, -1.0
    ]));

    // ==== BOAT HULL ====

    // Left half
    g_SelectedColor = [0.85, 0.40, 0.20, 1.0];
    drawTriangle(new Float32Array([
        -0.60, -0.20,   // left top
        0.60, -0.20,   // right top
        -0.30, -0.35    // bottom left
    ]));

    // Right half
    g_SelectedColor = [0.75, 0.30, 0.18, 1.0];
    drawTriangle(new Float32Array([
        0.60, -0.20,   // right top
        0.30, -0.35,   // bottom right
        -0.30, -0.35    // bottom left
    ]));

    // Mast
    g_SelectedColor = [0.35, 0.20, 0.10, 1.0];

    drawTriangle(new Float32Array([
        -0.015, -0.20,
         0.015, -0.20,
        -0.015,  0.65
    ]));

    drawTriangle(new Float32Array([
         0.015, -0.20,
         0.015,  0.65,
        -0.015,  0.65
    ]));

    // Left sail (RAISED)
    g_SelectedColor = [1.00, 0.90, 0.30, 1.0];

    drawTriangle(new Float32Array([
         0.00,  0.55,
        -0.50, -0.05,
         0.00, -0.05
    ]));

    // Right sail (RAISED)
    g_SelectedColor = [0.30, 0.75, 1.00, 1.0];

    drawTriangle(new Float32Array([
         0.00,  0.55,
         0.45,  0.15,
         0.00,  0.15
    ]));

    g_SelectedColor = [0.20, 0.60, 0.85, 1.0];

    drawTriangle(new Float32Array([
         0.00,  0.15,
         0.45,  0.15,
         0.10, -0.05
    ]));

    // ===== WATER =====
    let start = -0.70;
    let width = 0.28;

    for (let i = 0; i < 5; i++) {
        let x = start + i * width;

        if (i % 2 === 0) {
            g_SelectedColor = [0.15, 0.55, 1.00, 1.0];
        } else {
            g_SelectedColor = [0.05, 0.35, 0.85, 1.0];
        }

        drawTriangle(new Float32Array([
            x, -0.45,
            x + width, -0.45,
            x + width / 2, -0.35
        ]));
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
}

function convertCoordinatesEventToGL(ev) {
    let x = ev.clientX;
    let y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    return [x, y];
}

function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let i = 0; i < g_shapesList.length; i++) {
        g_shapesList[i].render();
    }
}