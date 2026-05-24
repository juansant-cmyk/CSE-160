let canvas;
let gl;

let a_Position;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_NormalMatrix;
let u_LightPos;
let u_CameraPos;
let u_LightColor;

let u_lightOn;
let u_normalOn

let g_lightOn = true;
let g_normalOn = false;

let u_spotLightOn;
let u_SpotLightPos;
let u_SpotLightDir;
let u_SpotCutoff;

let g_spotLightOn = true;
let g_spotLightPos = [0, 3, 3];
let g_spotLightDir = [0, -1, -1]; // points downward and forward
let g_spotCutoff = 0.85;          // cosine cutoff; higher = narrower cone

let g_lightColor = [1.0, 1.0, 1.0];

let a_UV;

let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

let g_lightPos = [0, 2.5, 2];
let g_lightAnimation = true;
let g_seconds = 0;
let g_startTime = performance.now() / 1000.0;

let g_model;

let g_globalAngle = 0;

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_NormalMatrix;

    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec3 v_VertPos;

    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;

        v_UV = a_UV;

        // world-space vertex position
        v_VertPos = vec3(u_ModelMatrix * a_Position);

        // world-space normal
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    }
`;

const FSHADER_SOURCE = `
    precision mediump float;

    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec3 v_VertPos;

    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;

    uniform vec3 u_LightPos;
    uniform vec3 u_CameraPos;
    uniform vec3 u_LightColor;

    uniform bool u_lightOn;
    uniform bool u_normalOn;

    uniform bool u_spotLightOn;
    uniform vec3 u_SpotLightPos;
    uniform vec3 u_SpotLightDir;
    uniform float u_SpotCutoff;

    void main() {
        vec4 baseColor;

        if (u_whichTexture == -2) {
        baseColor = u_FragColor;
        } else if (u_whichTexture == 0) {
        baseColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 1) {
        baseColor = texture2D(u_Sampler1, v_UV);
        } else {
        baseColor = u_FragColor;
        }

        // normal visualization mode
        if (u_normalOn) {
            vec3 normalColor = normalize(v_Normal) * 0.5 + 0.5;
            gl_FragColor = vec4(normalColor, 1.0);
            return;
        }

        // lighting off mode
        if (!u_lightOn) {
            gl_FragColor = baseColor;
            return;
        }

        vec3 N = normalize(v_Normal);
        vec3 L = normalize(u_LightPos - v_VertPos);

        // Ambient
        vec3 ambient = 0.25 * baseColor.rgb;

        // Diffuse
        float nDotL = max(dot(N, L), 0.0);
        vec3 diffuse = nDotL * baseColor.rgb * u_LightColor;

        // Specular
        vec3 R = reflect(-L, N);
        vec3 E = normalize(u_CameraPos - v_VertPos);
        float specAmount = pow(max(dot(E, R), 0.0), 32.0);
        vec3 specular = 0.5 * specAmount * u_LightColor;

        vec3 spotLighting = vec3(0.0);

        if (u_spotLightOn) {
            vec3 spotLightVector = normalize(u_SpotLightPos - v_VertPos);

            // Direction from spotlight toward the fragment.
            vec3 fromSpotToFrag = normalize(v_VertPos - u_SpotLightPos);

            float spotDot = dot(fromSpotToFrag, normalize(u_SpotLightDir));

            if (spotDot > u_SpotCutoff) {
                float spotDiffuseAmount = max(dot(N, spotLightVector), 0.0);
                vec3 spotDiffuse = spotDiffuseAmount * baseColor.rgb;

                vec3 spotReflect = reflect(-spotLightVector, N);
                float spotSpecAmount = pow(max(dot(E, spotReflect), 0.0), 32.0);
                vec3 spotSpecular = 0.5 * spotSpecAmount * vec3(1.0, 1.0, 1.0);

                float spotIntensity = smoothstep(u_SpotCutoff, 1.0, spotDot);

                spotLighting = spotIntensity * (spotDiffuse + spotSpecular);
            }
        }

        vec3 finalColor = ambient + diffuse + specular + spotLighting;

        gl_FragColor = vec4(finalColor, baseColor.a);
    }
`;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    gl.clearColor(0.1, 0.15, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    initTextures();

    requestAnimationFrame(tick);
    }

    function initTextures() {
    loadTexture("img/floor.jpg", 0);
    loadTexture("img/wall.jpg", 1);
    }

    g_model = new Model("obj/benchy.obj");

    function loadTexture(imagePath, textureUnit) {
    let image = new Image();

    image.onload = function() {
        console.log("Loaded texture:", imagePath, image.width, image.height);
        sendTextureToGLSL(image, textureUnit);
        renderScene();
    };

    image.onerror = function() {
        console.error("Failed to load texture:", imagePath);
    };

    image.src = imagePath;
}

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;

    updateAnimationAngles();

    updateTurtleAnimationAngles();

    renderScene();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_lightAnimation) {
        g_lightPos[0] = 3.0 * Math.cos(g_seconds);
        g_lightPos[2] = 3.0 * Math.sin(g_seconds);

        // Let Y slider still control height during animation.
        g_lightPos[1] = Number(document.getElementById("lightSlideY").value);
    }
}

function drawLightMarker() {
    let light = new Cube();

    light.color = [g_lightColor[0], g_lightColor[1], g_lightColor[2], 1.0];
    light.textureNum = -2;

    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(0.2, 0.2, 0.2);

    light.render();
}
function sendTextureToGLSL(image, textureUnit) {
    let texture = gl.createTexture();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    if (textureUnit === 0) {
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(u_Sampler0, 0);
    } else if (textureUnit === 1) {
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(u_Sampler1, 1);
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Safe for any image dimensions.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
    );
}

function setupWebGL() {
    canvas = document.getElementById("webgl");
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

    if (!gl) {
        console.log("Failed to get WebGL context.");
        return;
    }
}

function addActionsForHtmlUI() {
    document.getElementById("angleSlide").addEventListener("input", function() {
        g_globalAngle = Number(this.value);
        renderScene();
    });

    document.getElementById("lightSlideX").addEventListener("input", function() {
    if (!g_lightAnimation) {
        g_lightPos[0] = Number(this.value);
        renderScene();
    }
    });

    document.getElementById("lightSlideY").addEventListener("input", function() {
        g_lightPos[1] = Number(this.value);
        renderScene();
    });

    document.getElementById("lightSlideZ").addEventListener("input", function() {
        if (!g_lightAnimation) {
            g_lightPos[2] = Number(this.value);
            renderScene();
        }
    });

    document.getElementById("lightAnimOn").onclick = function() {
        g_lightAnimation = true;
    };

    document.getElementById("lightAnimOff").onclick = function() {
        g_lightAnimation = false;
    };

    document.getElementById("lightOn").onclick = function() {
        g_lightOn = true;
        renderScene();
    };

    document.getElementById("lightOff").onclick = function() {
        g_lightOn = false;
        renderScene();
    };

    document.getElementById("normalOn").onclick = function() {
        g_normalOn = true;
        renderScene();
    };

    document.getElementById("normalOff").onclick = function() {
        g_normalOn = false;
        renderScene();
    };

    document.getElementById("spotLightOn").onclick = function() {
    g_spotLightOn = true;
        renderScene();
    };

    document.getElementById("spotLightOff").onclick = function() {
        g_spotLightOn = false;
        renderScene();
    };

    document.getElementById("lightRed").addEventListener("input", function() {
        g_lightColor[0] = Number(this.value);
        renderScene();
    });

    document.getElementById("lightGreen").addEventListener("input", function() {
        g_lightColor[1] = Number(this.value);
        renderScene();
    });

    document.getElementById("lightBlue").addEventListener("input", function() {
        g_lightColor[2] = Number(this.value);
        renderScene();
    });
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders.");
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    a_UV = gl.getAttribLocation(gl.program, "a_UV");
    a_Normal = gl.getAttribLocation(gl.program, "a_Normal");

    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");

    u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
    u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");

    u_LightPos = gl.getUniformLocation(gl.program, "u_LightPos");
    u_CameraPos = gl.getUniformLocation(gl.program, "u_CameraPos");
    u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
    
    u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
    u_normalOn = gl.getUniformLocation(gl.program, "u_normalOn");

    u_spotLightOn = gl.getUniformLocation(gl.program, "u_spotLightOn");
    u_SpotLightPos = gl.getUniformLocation(gl.program, "u_SpotLightPos");
    u_SpotLightDir = gl.getUniformLocation(gl.program, "u_SpotLightDir");
    u_SpotCutoff = gl.getUniformLocation(gl.program, "u_SpotCutoff");

    if (a_Position < 0 || a_UV < 0 ||
        a_Normal < 0 || !u_LightPos ||
        !u_CameraPos || !u_LightColor ||
        !u_FragColor || !u_ModelMatrix ||
        !u_GlobalRotateMatrix || !u_Sampler0 ||
        !u_Sampler1 || !u_whichTexture ||
        !u_lightOn || !u_normalOn) {
        console.log("Failed to connect variables to GLSL.");
    }
}

function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 100);

    let viewMat = new Matrix4();
    viewMat.setLookAt(
        0, 2.5, 7,
        0, 0.5, 0,
        0, 1, 0
    );

    let rotMat = new Matrix4();
    rotMat.setRotate(g_globalAngle, 0, 1, 0);

    let globalRotMat = new Matrix4();
    globalRotMat.set(projMat);
    globalRotMat.multiply(viewMat);
    globalRotMat.multiply(rotMat);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_CameraPos, 0, 2.5, 7);
    gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);


    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform1i(u_normalOn, g_normalOn);

    gl.uniform1i(u_spotLightOn, g_spotLightOn);
    gl.uniform3f(u_SpotLightPos, g_spotLightPos[0], g_spotLightPos[1], g_spotLightPos[2]);
    gl.uniform3f(u_SpotLightDir, g_spotLightDir[0], g_spotLightDir[1], g_spotLightDir[2]);
    gl.uniform1f(u_SpotCutoff, g_spotCutoff);

    drawWorld();
    drawSphere();
    drawModel();
    drawLightMarker();

    let turtleMatrix = new Matrix4();
    turtleMatrix.translate(-1.2, -0.45, 0.0);
    turtleMatrix.scale(0.8, 0.8, 0.8);
    drawTurtle(turtleMatrix);
}

function drawModel() {
    if (!g_model || !g_model.loaded) {
        return;
    }

    g_model.color = [0.8, 0.8, 0.8, 1.0];
    g_model.textureNum = -2;

    g_model.matrix = new Matrix4();

    g_model.matrix.translate(-2.2, -0.5, 0.5);

    g_model.matrix.scale(0.18, 0.18, 0.18);

    g_model.matrix.rotate(90, 0, 1, 0);

    g_model.render();
}

function drawWorld() {
  // Floor
  let floor = new Cube();
  floor.color = [0.45, 0.8, 0.25, 1.0];
  floor.textureNum = 0;
  floor.matrix.translate(0, -0.55, 0);
  floor.matrix.scale(8, 0.1, 8);
  floor.render();

  // Back wall
  let backWall = new Cube();
  backWall.color = [0.45, 0.35, 0.25, 1.0];
  backWall.textureNum = 1;
  backWall.matrix.translate(0, 1.45, -4);
  backWall.matrix.scale(8, 4, 0.1);
  backWall.render();

  // Left wall
  let leftWall = new Cube();
  leftWall.color = [0.55, 0.42, 0.28, 1.0];
  leftWall.textureNum = 1;
  leftWall.matrix.translate(-4, 1.45, 0);
  leftWall.matrix.scale(0.1, 4, 8);
  leftWall.render();

  // Optional right wall, comment out if you only want two walls.
  let rightWall = new Cube();
  rightWall.color = [0.35, 0.3, 0.24, 1.0];
  rightWall.textureNum = 1;
  rightWall.matrix.translate(4, 1.45, 0);
  rightWall.matrix.scale(0.1, 4, 8);
  rightWall.render();
}

function drawSphere() {
  let sphere = new Sphere();
  sphere.color = [1.0, 0.15, 0.05, 1.0];
  sphere.matrix.translate(0, 0.65, 0);
  sphere.matrix.scale(1.2, 1.2, 1.2);
  sphere.render();
}