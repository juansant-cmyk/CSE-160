import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// Create basic scene
const scene = new THREE.Scene();

// Skybox
const cubeTextureLoader = new THREE.CubeTextureLoader();

const skyboxTexture = cubeTextureLoader
    .setPath("assets/skybox/")
    .load([
        "px.png",
        "nx.png",
        "py.png",
        "ny.png",
        "pz.png",
        "nz.png"
    ]);

    scene.background = skyboxTexture;

// Camera
const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(7, 5, 9);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Mouse controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// Light for MeshStandardMaterial
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(3, 5, 4);
scene.add(light);

// Textures
const textureLoader = new THREE.TextureLoader();

const interiorTex = textureLoader.load('assets/textures/interior.jpg');
interiorTex.wrapS = THREE.RepeatWrapping;
interiorTex.wrapT = THREE.RepeatWrapping;
interiorTex.repeat.set(4, 4);

const floorTexture = textureLoader.load('assets/textures/floor.jpg');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 8);

const panelTexture = textureLoader.load('assets/textures/wall_panel.jpeg');
panelTexture.wrapS = THREE.RepeatWrapping;
panelTexture.wrapT = THREE.RepeatWrapping;
panelTexture.repeat.set(3, 1);

const stoneTexture = textureLoader.load('assets/textures/stone.jpg');
stoneTexture.wrapS = THREE.RepeatWrapping;
stoneTexture.wrapT = THREE.RepeatWrapping;
stoneTexture.repeat.set(2, 2);

const rugTexture = textureLoader.load('assets/textures/rug.jpg');
rugTexture.wrapS = THREE.RepeatWrapping;
rugTexture.wrapT = THREE.RepeatWrapping;
rugTexture.repeat.set(2, 2);


// Materials
const wallPanelMaterial = new THREE.MeshStandardMaterial({
    map: panelTexture,
    color: 0x8a6a45,
    roughness: 0.35,
    metalness: 0.0
});

const rugMaterial = new THREE.MeshStandardMaterial({
    map: rugTexture,
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.0
});

const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    color: 0xf2d6a2,
    roughness: 0.32,
    metalness: 0.0
});

const wallMaterial = new THREE.MeshStandardMaterial({
    map: interiorTex,
    color: 0xf8f7f0,
    roughness: 0.2
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd9f2ff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.05,
    metalness: 0,
    depthWrite: false
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    map: stoneTexture,
    color: 0xffffff,
    roughness: 0.65,
    metalness: 0.0
});

const oceanMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f83b7,
    roughness: 0.45,
    metalness: 0.05
});

// Add meshes/room objects to the scene

const roomWidth = 14;
const roomDepth = 10;
const roomHeight = 4;
const wallThickness = 0.2;

const floorGeometry = new THREE.BoxGeometry(roomWidth, wallThickness, roomDepth);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0, -wallThickness / 2, 0);
floor.receiveShadow = true;
scene.add(floor);

const backWallGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness);
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.set(0, roomHeight / 2, -roomDepth / 2 + wallThickness / 2);
backWall.receiveShadow = true;
scene.add(backWall);

const leftWallGeometry = new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth);
const leftWall= new THREE.Mesh(leftWallGeometry, wallMaterial);
leftWall.position.set(-roomWidth / 2 + wallThickness / 2, roomHeight / 2, 0);
leftWall.receiveShadow = true;
scene.add(leftWall);

const rightWallGeometry = new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth / 2);
const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
rightWall.position.set(roomWidth / 2 - wallThickness / 2, roomHeight / 2, -roomDepth / 4);
rightWall.receiveShadow = true;
// scene.add(rightWall);

const glassGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, 0.08);
const glassWall = new THREE.Mesh(glassGeometry, glassMaterial);
glassWall.position.set(0, roomHeight / 2, roomDepth / 2);
scene.add(glassWall);

const ceilingGeometry = new THREE.BoxGeometry(roomWidth, wallThickness, roomDepth);
const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial);
ceiling.position.set(0, roomHeight + wallThickness / 2, 0);
ceiling.receiveShadow = true;
scene.add(ceiling);

// Window frame pieces
const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
    metalness: 0.6
});

function addFrame(x, y, z, sx, sy, sz) {
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        frameMaterial
    );
    frame.position.set(x, y, z);
    frame.castShadow = true;
    scene.add(frame);
}

// Window frame settings
const frameThickness = 0.06;
const frameDepth = 0.10;
const frameZ = roomDepth / 2 + 0.08;


// Vertical outer frames
addFrame(
    -roomWidth / 2 + frameThickness / 2,
    roomHeight / 2,
    frameZ,
    frameThickness,
    roomHeight,
    frameDepth
);

addFrame(
    roomWidth / 2 - frameThickness / 2,
    roomHeight / 2,
    frameZ,
    frameThickness,
    roomHeight,
    frameDepth
);

// Interior vertical dividers
addFrame(
    -roomWidth / 6,
    roomHeight / 2,
    frameZ,
    frameThickness,
    roomHeight,
    frameDepth
);

addFrame(
    roomWidth / 6,
    roomHeight / 2,
    frameZ,
    frameThickness,
    roomHeight,
    frameDepth
);

// Pendant Lights above Dining Table

const cordMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.5,
    metalness: 0.5
});

const shadeMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.35,
    metalness: 0.4
});

const bulbMaterial = new THREE.MeshBasicMaterial({
    color: 0xffddaa
});

const pendantLights = [];

function addPendantLight(x, z) {
    // Cord
    const cordGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1.0, 16);
    const cord = new THREE.Mesh(cordGeometry, cordMaterial);
    cord.position.set(x, roomHeight - 0.5, z);
    cord.castShadow = true;
    scene.add(cord);

    // Lamp shade
    const shadeGeometry = new THREE.ConeGeometry(0.35, 0.45, 32, 1, true);
    const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shade.position.set(x, roomHeight - 1.15, z);
    shade.rotation.x = Math.PI;
    shade.castShadow = true;
    scene.add(shade);

    // Bulb
    const bulbGeometry = new THREE.SphereGeometry(0.12, 24, 16);
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.set(x, roomHeight - 1.25, z);
    scene.add(bulb);

    // Small point light from bulb
    const bulbLight = new THREE.PointLight(0xffcc88, 0.45, 5);
    bulbLight.position.copy(bulb.position);
    scene.add(bulbLight);

    pendantLights.push(bulbLight);
}

// Three pendant lights above where the dining table will go
addPendantLight(-1.2, 0);
addPendantLight(0, 0);
addPendantLight(1.2, 0);

// Corner Plant

const potMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8a088,
    roughness: 0.6,
    metalness: 0.0
});

const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b2f25,
    roughness: 0.7,
    metalness: 0.0
});

const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f6b3f,
    roughness: 0.75,
    metalness: 0.0
});

// Plant position near left back corner
const plantX = -roomWidth / 2 + 0.9;
const plantZ = -roomDepth / 2 + 0.9;

// Pot
const potGeometry = new THREE.CylinderGeometry(0.35, 0.45, 0.55, 32);
const pot = new THREE.Mesh(potGeometry, potMaterial);
pot.position.set(plantX, 0.28, plantZ);
pot.castShadow = true;
pot.receiveShadow = true;
scene.add(pot);

// Stem
const stemGeometry = new THREE.CylinderGeometry(0.05, 0.07, 1.1, 16);
const stem = new THREE.Mesh(stemGeometry, stemMaterial);
stem.position.set(plantX, 1.05, plantZ);
stem.castShadow = true;
scene.add(stem);

// Leaves as flattened spheres
function addLeaf(xOffset, yOffset, zOffset, rotX, rotY, rotZ) {
    const leafGeometry = new THREE.SphereGeometry(0.35, 24, 16);
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

    leaf.position.set(
        plantX + xOffset,
        1.45 + yOffset,
        plantZ + zOffset
    );

    leaf.scale.set(0.35, 0.08, 0.9);
    leaf.rotation.set(rotX, rotY, rotZ);

    leaf.castShadow = true;
    scene.add(leaf);
}

addLeaf(0.00, 0.10, 0.35, 0.4, 0.0, 0.0);
addLeaf(0.00, 0.05, -0.35, -0.4, 0.0, 0.0);
addLeaf(0.35, 0.00, 0.00, 0.0, 0.4, 0.6);
addLeaf(-0.35, 0.00, 0.00, 0.0, -0.4, -0.6);
addLeaf(0.25, 0.28, 0.25, 0.3, 0.5, 0.7);
addLeaf(-0.25, 0.28, -0.25, -0.3, -0.5, -0.7);

// Fireplace
const fireplaceX = -roomWidth / 2 + wallThickness + 0.03;
const fireplaceY = 1.0;
const fireplaceZ = 0;

// Materials
const fireplaceFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.35,
    metalness: 0.25
});

const fireplaceInteriorMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.8,
    metalness: 0.0
});

const emberMaterial = new THREE.MeshBasicMaterial({
    color: 0xff5a1f
});

const flameMaterial = new THREE.MeshBasicMaterial({
    color: 0xffb347,
    transparent: true,
    opacity: 0.85
});

// Fireplace black backing panel
const fireplaceBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 1.4, 2.4),
    fireplaceInteriorMaterial
);
fireplaceBack.position.set(fireplaceX, fireplaceY, fireplaceZ);
scene.add(fireplaceBack);

// Top frame
const fireplaceTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.12, 2.6),
    fireplaceFrameMaterial
);
fireplaceTop.position.set(fireplaceX + 0.03, fireplaceY + 0.75, fireplaceZ);
fireplaceTop.castShadow = true;
scene.add(fireplaceTop);

// Bottom frame / hearth
const fireplaceBottom = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.16, 2.8),
    fireplaceFrameMaterial
);
fireplaceBottom.position.set(fireplaceX + 0.12, fireplaceY - 0.75, fireplaceZ);
fireplaceBottom.castShadow = true;
fireplaceBottom.receiveShadow = true;
scene.add(fireplaceBottom);

// Left side frame
const fireplaceLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 1.5, 0.12),
    fireplaceFrameMaterial
);
fireplaceLeft.position.set(fireplaceX + 0.03, fireplaceY, fireplaceZ - 1.25);
fireplaceLeft.castShadow = true;
scene.add(fireplaceLeft);

// Right side frame
const fireplaceRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 1.5, 0.12),
    fireplaceFrameMaterial
);
fireplaceRight.position.set(fireplaceX + 0.03, fireplaceY, fireplaceZ + 1.25);
fireplaceRight.castShadow = true;
scene.add(fireplaceRight);

// Logs
const logMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a321d,
    roughness: 0.8
});

function addLog(y, z, rotZ) {
    const log = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 1.1, 16),
        logMaterial
    );

    log.position.set(fireplaceX + 0.18, y, z);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = rotZ;
    log.castShadow = true;
    scene.add(log);
}

addLog(0.42, fireplaceZ - 0.25, 0.25);
addLog(0.42, fireplaceZ + 0.25, -0.25);

// Flames as small cones
function addFlame(z, height, scale) {
    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.12 * scale, height, 24),
        flameMaterial
    );

    flame.position.set(fireplaceX + 0.24, 0.62, z);
    flame.rotation.z = -Math.PI / 2;
    scene.add(flame);

    return flame;
}

const flame1 = addFlame(fireplaceZ - 0.25, 0.45, 1.0);
const flame2 = addFlame(fireplaceZ, 0.6, 1.2);
const flame3 = addFlame(fireplaceZ + 0.25, 0.42, 0.9);

// Warm fireplace light
const fireplaceLight = new THREE.PointLight(0xff7a2f, 1.0, 4);
fireplaceLight.position.set(fireplaceX + 0.45, 0.75, fireplaceZ);
scene.add(fireplaceLight);

// Load the .obj for dining table

const tableGroup = new THREE.Group();
scene.add(tableGroup);

const mtlLoader = new MTLLoader();
mtlLoader.setPath('assets/models/diningtable/');

mtlLoader.load('table_chair.mtl', function(materials) {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('assets/models/diningtable/');

    objLoader.load('table_chair.obj', function(model) {
        model.rotation.y = Math.PI / 2;
        const tableMaterial = materials.materials.tableWood;

        model.traverse(function(child) {
            if (child.isMesh) {
                child.material = tableMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        model.position.sub(center);

        const maxHorizontalSize = Math.max(size.x, size.z);
        const targetSize = 4.5;
        const scaleFactor = targetSize / maxHorizontalSize;

        tableGroup.scale.setScalar(scaleFactor)
        
        tableGroup.position.set(
            0,
            (size.y * scaleFactor) / 2,
            0
        );

        tableGroup.add(model);
    });
});

// Fireplace Frame
const stoneX = fireplaceX ;
const stoneY = fireplaceY;
const stoneZ = fireplaceZ;

// Large stone backing panel behind fireplace
const stoneBackPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 2.1, 3.3),
    stoneMaterial
);

stoneBackPanel.position.set(
    stoneX - 0.03,
    stoneY,
    stoneZ
);

stoneBackPanel.castShadow = true;
stoneBackPanel.receiveShadow = true;
scene.add(stoneBackPanel);

// Top stone ledge
const stoneTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.18, 3.5),
    stoneMaterial
);

stoneTop.position.set(
    stoneX + 0.12,
    stoneY + 1.1,
    stoneZ
);

stoneTop.castShadow = true;
stoneTop.receiveShadow = true;
scene.add(stoneTop);

// Bottom stone hearth
const stoneBottom = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.18, 3.6),
    stoneMaterial
);

stoneBottom.position.set(
    stoneX + 0.25,
    stoneY - 1.05,
    stoneZ
);

stoneBottom.castShadow = true;
stoneBottom.receiveShadow = true;
scene.add(stoneBottom);

//  Modern wall panel along back wall
const wallPanelGeometry = new THREE.BoxGeometry(
    4.0,          // width of panel
    roomHeight,   // same height as back wall
    0.08          // thin depth
);

const wallPanel = new THREE.Mesh(wallPanelGeometry, wallPanelMaterial);

// Place the panel slightly in front of the back wall
wallPanel.position.set(
    -3.2,
    2.0,
    -roomDepth / 2 + wallThickness + 0.04
);

wallPanel.castShadow = true;
wallPanel.receiveShadow = true;

scene.add(wallPanel);

// Load rug/carpet .obj

const rugObjLoader = new OBJLoader();

rugObjLoader.load(
    'assets/models/rug/carpet.obj',

    function(rug) {
        rug.traverse(function(child) {
            if (child.isMesh) {
                child.material = rugMaterial;
                child.castShadow = false;
                child.receiveShadow = true;
            }
        });

        // Scale the dining rug
        rug.scale.set(2.5, 1.0, 2.2);

        // Place slightly above the floor
        rug.position.set(0, 0.025, 0);

        scene.add(rug);
    },

    function(xhr) {
        console.log("Rug loading:", (xhr.loaded / xhr.total * 100) + "%");
    },

    function(error) {
        console.error("Rug failed to load:", error);
    }
);

// Load wall clock .obj
const clockObjLoader = new OBJLoader();

clockObjLoader.load(
    'assets/models/clock/wall_clock.obj',

    function(clock) {
        const clockMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.35,
            metalness: 0.25
        });

        clock.traverse(function(child) {
            if (child.isMesh) {
                child.material = clockMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(clock);

        // Measure model
        const box = new THREE.Box3().setFromObject(clock);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        // Center the model around its own origin
        clock.position.x -= center.x;
        clock.position.y -= center.y;
        clock.position.z -= center.z;

        // Scale it to a reasonable wall-clock size
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 0.75;
        const scaleFactor = targetSize / maxDimension;

        clock.scale.setScalar(scaleFactor);

        // above-left of the fireplace, slightly in front of left wall
        clock.position.set(
            fireplaceX + 0.12,
            fireplaceY + 1.55,
            fireplaceZ + 3.25
        );

        // Rotate so it sticks flat onto the left wall and faces into the room
        clock.rotation.y = Math.PI / 2;

        console.log("Wall clock loaded");
    },

    function(xhr) {
        console.log("Clock loading:", (xhr.loaded / xhr.total * 100) + "%");
    },

    function(error) {
        console.error("Clock failed to load:", error);
    }
);

// Load .glb bookshelf

const gltfLoader = new GLTFLoader();

gltfLoader.load(
    'assets/models/bookshelf/bookshelf.glb',

    function(gltf) {
        const bookshelf = gltf.scene;

        bookshelf.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(bookshelf);

        // Measure model
        const box = new THREE.Box3().setFromObject(bookshelf);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        // Center model around its own origin
        bookshelf.position.x -= center.x;
        bookshelf.position.z -= center.z;
        bookshelf.position.y -= box.min.y;

        // Scale to room size
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 2.4;
        const scaleFactor = targetSize / maxDimension;

        bookshelf.scale.setScalar(scaleFactor);

        // Place against back wall
        bookshelf.position.set(
            3.8,
            0,
            -roomDepth / 2 + wallThickness + 0.25
        );

        // Rotate if needed so it faces into the room
        bookshelf.rotation.y = Math.PI / 2;
    },

    function(xhr) {
        console.log("Bookshelf loading:", (xhr.loaded / xhr.total * 100) + "%");
    },

    function(error) {
        console.error("Bookshelf failed to load:", error);
    }
);

// Animated Ocean
const oceanShaderUniforms = {
    uTime: { value: 0.0 }
};

const animatedOceanMaterial = new THREE.ShaderMaterial({
    uniforms: oceanShaderUniforms,

    vertexShader: `
        uniform float uTime;

        varying vec2 vUv;
        varying float vWave;

        void main() {
            vUv = uv;

            vec3 pos = position;

            float wave1 = sin(pos.x * 0.45 + uTime * 1.2) * 0.18;
            float wave2 = sin(pos.y * 0.75 + uTime * 0.8) * 0.10;
            float wave3 = sin((pos.x + pos.y) * 0.35 + uTime * 1.6) * 0.08;

            pos.z += wave1 + wave2 + wave3;
            vWave = pos.z;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,

    fragmentShader: `
        varying vec2 vUv;
        varying float vWave;

        void main() {
            vec3 deepBlue = vec3(0.02, 0.16, 0.45);
            vec3 midBlue = vec3(0.05, 0.35, 0.75);
            vec3 highlight = vec3(0.55, 0.78, 1.0);

            float waveBrightness = smoothstep(-0.15, 0.25, vWave);

            vec3 color = mix(deepBlue, midBlue, vUv.y);
            color = mix(color, highlight, waveBrightness * 0.35);

            gl_FragColor = vec4(color, 1.0);
        }
    `,

    side: THREE.DoubleSide
});

const animatedOceanGeometry = new THREE.PlaneGeometry(100, 60, 80, 80);
const animatedOcean = new THREE.Mesh(animatedOceanGeometry, animatedOceanMaterial);

animatedOcean.rotation.x = -Math.PI / 2;
animatedOcean.position.set(4, -0.40, 10);

scene.add(animatedOcean);


// Visible Sun
const sunDirection = new THREE.Vector3(0, 0.10, 1).normalize();

// Position of the visible sun and the real light
const sunLightPosition = sunDirection.clone().multiplyScalar(80);

// Creates a radial texture for one layer of the sun
function createRadialSunTexture(stops) {
    const size = 512;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
    );

    for (const stop of stops) {
        gradient.addColorStop(stop.offset, stop.color);
    }

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function makeSunLayer(texture, scale, useAdditive = true) {
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: useAdditive ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.copy(sunLightPosition);
    sprite.scale.set(scale, scale, 1);
    return sprite;
}

// Outer haze
const sunOuterGlowTexture = createRadialSunTexture([
    { offset: 0.00, color: "rgba(255, 210, 120, 0.10)" },
    { offset: 0.20, color: "rgba(255, 185, 95, 0.16)" },
    { offset: 0.45, color: "rgba(255, 160, 75, 0.20)" },
    { offset: 0.72, color: "rgba(255, 135, 60, 0.12)" },
    { offset: 1.00, color: "rgba(255, 110, 50, 0.0)" }
]);

// Main body
const sunMidGlowTexture = createRadialSunTexture([
    { offset: 0.00, color: "rgba(255, 238, 180, 0.92)" },
    { offset: 0.25, color: "rgba(255, 205, 110, 0.95)" },
    { offset: 0.55, color: "rgba(255, 175, 80, 0.90)" },
    { offset: 0.80, color: "rgba(255, 145, 55, 0.32)" },
    { offset: 1.00, color: "rgba(255, 120, 45, 0.0)" }
]);

// Center
const sunCoreTexture = createRadialSunTexture([
    { offset: 0.00, color: "rgba(255, 248, 230, 0.98)" },
    { offset: 0.38, color: "rgba(255, 235, 190, 0.95)" },
    { offset: 0.62, color: "rgba(255, 210, 140, 0.55)" },
    { offset: 1.00, color: "rgba(255, 180, 110, 0.0)" }
]);

const sunOuterGlow = makeSunLayer(sunOuterGlowTexture, 32, false);
const sunMidGlow = makeSunLayer(sunMidGlowTexture, 22, true);
const sunCore = makeSunLayer(sunCoreTexture, 9, true);

sunOuterGlow.renderOrder = 1;
sunMidGlow.renderOrder = 2;
sunCore.renderOrder = 3;

scene.add(sunOuterGlow, sunMidGlow, sunCore);


// Lighting

// Soft fill light so the room is not pitch black
const ambientLight = new THREE.AmbientLight(0xffffff, 0.20);

// Fake sky/ocean bounced light
const hemiLight = new THREE.HemisphereLight(
    0xffd8b0,
    0x5a6470,
    0.70
);

// Main sunlight
const sunLight = new THREE.DirectionalLight(0xffb46a, 1.45);
sunLight.position.copy(sunLightPosition);

sunLight.target.position.set(0, 1.5, 0);

sunLight.castShadow = true;

sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;

sunLight.shadow.camera.left = -8;
sunLight.shadow.camera.right = 8;
sunLight.shadow.camera.top = 8;
sunLight.shadow.camera.bottom = -8;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 100;

scene.add(ambientLight, hemiLight, sunLight, sunLight.target);

// Toggle Q sound effect
const toggleClickSound = new Audio('assets/sounds/click.mp3');
toggleClickSound.volume = 0.45;

function playToggleClick() {
    toggleClickSound.currentTime = 0;
    toggleClickSound.play();
}
// Day/Night Toggle (Wow! Feature)

let isNightMode = false;

function setSunVisible(isVisible) {
    sunOuterGlow.visible = isVisible;
    sunMidGlow.visible = isVisible;
    sunCore.visible = isVisible;
}

// Night Stars

const starCount = 650;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;

    // Spread stars outside and above the room/window
    starPositions[i3 + 0] = (Math.random() - 0.5) * 120; // x
    starPositions[i3 + 1] = Math.random() * 45 + 10;     // y
    starPositions[i3 + 2] = Math.random() * 80 + 15;      // z, outside window
}

starGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    transparent: true,
    opacity: 0.0,
    depthWrite: false
});

const stars = new THREE.Points(starGeometry, starMaterial);
stars.visible = false;

scene.add(stars);

function applyDayNightMode() {
    if (isNightMode) {
        // Night mode
        scene.background = new THREE.Color(0x0b1020);

        sunLight.intensity = 0.0;
        sunLight.visible = false;
        ambientLight.intensity = 0.08;
        hemiLight.intensity = 0.18;

        pendantLights.forEach(function(light) {
            light.intensity = 1.15;
        });

        fireplaceLight.intensity = 1.45;

        setSunVisible(false);

        stars.visible = true;
        starMaterial.opacity = 0.85;

        console.log("Night mode enabled");
    } else {
        // Day / sunset mode
        scene.background = skyboxTexture;

        sunLight.intensity = 1.45;
        ambientLight.intensity = 0.20;
        hemiLight.intensity = 0.70;

        pendantLights.forEach(function(light) {
            light.intensity = 0.45;
        });

        fireplaceLight.intensity = 0.85;

        setSunVisible(true);

        stars.visible = false;
        starMaterial.opacity = 0.0;

        console.log("Day mode enabled");
    }
}

window.addEventListener("keydown", function(event) {
    if (event.key === "e" || event.key === "E") {
        playToggleClick();
        isNightMode = !isNightMode;
        applyDayNightMode();
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    oceanShaderUniforms.uTime.value += 0.016;

    flame1.scale.y = 1.0 + Math.sin(Date.now() * 0.006) * 0.12;
    flame2.scale.y = 1.0 + Math.sin(Date.now() * 0.008) * 0.15;
    flame3.scale.y = 1.0 + Math.sin(Date.now() * 0.007) * 0.10;

    fireplaceLight.intensity = 0.9 + Math.sin(Date.now() * 0.01) * 0.15;

    controls.update();
    renderer.render(scene, camera);
    
}

animate();