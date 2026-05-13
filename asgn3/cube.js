let g_cubeUVBuffer = null;

let g_cubeUVs = new Float32Array([
    0,0, 1,1, 1,0,
    0,0, 0,1, 1,1,

    0,0, 1,0, 1,1,
    0,0, 1,1, 0,1,

    0,0, 0,1, 1,1,
    0,0, 1,1, 1,0,

    0,0, 1,0, 1,1,
    0,0, 1,1, 0,1,

    0,0, 0,1, 1,1,
    0,0, 1,1, 1,0,

    0,0, 1,0, 1,1,
    0,0, 1,1, 0,1
]);

class Cube {
    constructor() {
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.textureNum = -1;
        this.uvScale = 1;
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        
        gl.uniform1f(u_uvScale, this.uvScale);
        gl.uniform1i(u_whichTexture, this.textureNum);

        drawTriangle3D([
            0, 0, 0,   1, 1, 0,   1, 0, 0,
            0, 0, 0,   0, 1, 0,   1, 1, 0,

            0, 0, 1,   1, 0, 1,   1, 1, 1,
            0, 0, 1,   1, 1, 1,   0, 1, 1,

            0, 1, 0,   0, 1, 1,   1, 1, 1,
            0, 1, 0,   1, 1, 1,   1, 1, 0,

            0, 0, 0,   1, 0, 0,   1, 0, 1,
            0, 0, 0,   1, 0, 1,   0, 0, 1,

            1, 0, 0,   1, 1, 0,   1, 1, 1,
            1, 0, 0,   1, 1, 1,   1, 0, 1,

            0, 0, 0,   0, 0, 1,   0, 1, 1,
            0, 0, 0,   0, 1, 1,   0, 1, 0
        ]);
    }
}

function drawTriangle3D(vertices) {
    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // UV buffer
    if (g_cubeUVBuffer === null) {
        g_cubeUVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, g_cubeUVs, gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeUVBuffer);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}