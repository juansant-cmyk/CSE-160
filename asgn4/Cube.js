class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;

    this.vertices = new Float32Array([
      // Front face
      -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,   0.5, 0.5, 0.5,
      -0.5,-0.5, 0.5,   0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,

      // Back face
       0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,
       0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5,

      // Top face
      -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,   0.5, 0.5,-0.5,
      -0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,

      // Bottom face
      -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,
      -0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,

      // Right face
       0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5,
       0.5,-0.5, 0.5,   0.5, 0.5,-0.5,   0.5, 0.5, 0.5,

      // Left face
      -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  -0.5, 0.5, 0.5,
      -0.5,-0.5,-0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5
    ]);

    this.normals = new Float32Array([
      // Front
      0,0,1,  0,0,1,  0,0,1,
      0,0,1,  0,0,1,  0,0,1,

      // Back
      0,0,-1,  0,0,-1,  0,0,-1,
      0,0,-1,  0,0,-1,  0,0,-1,

      // Top
      0,1,0,  0,1,0,  0,1,0,
      0,1,0,  0,1,0,  0,1,0,

      // Bottom
      0,-1,0,  0,-1,0,  0,-1,0,
      0,-1,0,  0,-1,0,  0,-1,0,

      // Right
      1,0,0,  1,0,0,  1,0,0,
      1,0,0,  1,0,0,  1,0,0,

      // Left
      -1,0,0,  -1,0,0,  -1,0,0,
      -1,0,0,  -1,0,0,  -1,0,0
    ]);

    this.uvs = new Float32Array([
    // Front
    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    // Back
    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    // Top
    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    // Bottom
    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    // Right
    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1,

    // Left
    0,0,  1,0,  1,1,
    0,0,  1,1,  0,1
    ]);
  }

  render() {
    gl.uniform4f(
        u_FragColor,
        this.color[0],
        this.color[1],
        this.color[2],
        this.color[3]
    );

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(this.matrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    initArrayBuffer("a_Position", this.vertices, 3);
    initArrayBuffer("a_UV", this.uvs, 2);
    initArrayBuffer("a_Normal", this.normals, 3);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}

function initArrayBuffer(attributeName, data, num) {
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.log("Failed to create buffer.");
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  let attribute = gl.getAttribLocation(gl.program, attributeName);
  gl.vertexAttribPointer(attribute, num, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribute);

  return true;
}