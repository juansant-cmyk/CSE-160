class Sphere {
  constructor() {
    this.type = "sphere";
    this.color = [1.0, 0.0, 0.0, 1.0];
    this.matrix = new Matrix4();

    this.vertices = [];
    this.normals = [];

    this.generateSphere();

    this.vertices = new Float32Array(this.vertices);
    this.normals = new Float32Array(this.normals);
  }

  generateSphere() {
    let latSteps = 24;
    let lonSteps = 24;

    for (let lat = 0; lat < latSteps; lat++) {
      let theta1 = lat * Math.PI / latSteps;
      let theta2 = (lat + 1) * Math.PI / latSteps;

      for (let lon = 0; lon < lonSteps; lon++) {
        let phi1 = lon * 2 * Math.PI / lonSteps;
        let phi2 = (lon + 1) * 2 * Math.PI / lonSteps;

        let p1 = this.getSpherePoint(theta1, phi1);
        let p2 = this.getSpherePoint(theta2, phi1);
        let p3 = this.getSpherePoint(theta2, phi2);
        let p4 = this.getSpherePoint(theta1, phi2);

        this.addTriangle(p1, p2, p3);
        this.addTriangle(p1, p3, p4);
      }
    }
  }

  getSpherePoint(theta, phi) {
    let x = Math.sin(theta) * Math.cos(phi);
    let y = Math.cos(theta);
    let z = Math.sin(theta) * Math.sin(phi);

    return [x, y, z];
  }

  addTriangle(p1, p2, p3) {
    this.vertices.push(...p1, ...p2, ...p3);

    // For a sphere centered at the origin, normal = position.
    this.normals.push(...p1, ...p2, ...p3);
  }

  render() {
    gl.uniform4f(
        u_FragColor,
        this.color[0],
        this.color[1],
        this.color[2],
        this.color[3]
    );

    gl.uniform1i(u_whichTexture, -2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(this.matrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    initArrayBuffer("a_Position", this.vertices, 3);
    initArrayBuffer("a_Normal", this.normals, 3);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}