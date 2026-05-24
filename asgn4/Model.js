class Model {
    constructor(objPath) {
        this.type = "model";
        this.color = [0.8, 0.8, 0.8, 1.0];
        this.textureNum = -2;
        this.matrix = new Matrix4();

        this.vertices = [];
        this.normals = [];
        this.uvs = [];

        this.loaded = false;

        this.loadOBJ(objPath);
    }

    async loadOBJ(objPath) {
        const response = await fetch(objPath);
        const text = await response.text();

        this.parseOBJ(text);

        this.vertices = new Float32Array(this.vertices);
        this.normals = new Float32Array(this.normals);
        this.uvs = new Float32Array(this.uvs);

        this.loaded = true;

        console.log("OBJ loaded:", objPath);
        console.log("vertices:", this.vertices.length / 3);
        console.log("normals:", this.normals.length / 3);
    }

    parseOBJ(text) {
        const tempVertices = [];
        const tempNormals = [];

        const lines = text.split("\n");

        for (let line of lines) {
            line = line.trim();

            if (line.length === 0 || line.startsWith("#")) {
                continue;
            }

            const parts = line.split(/\s+/);

            if (parts[0] === "v") {
                tempVertices.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            }

            else if (parts[0] === "vn") {
                tempNormals.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            }

            else if (parts[0] === "f") {
                const face = parts.slice(1);

                // Triangulate faces with more than 3 vertices.
                for (let i = 1; i < face.length - 1; i++) {
                    this.addFaceVertex(face[0], tempVertices, tempNormals);
                    this.addFaceVertex(face[i], tempVertices, tempNormals);
                    this.addFaceVertex(face[i + 1], tempVertices, tempNormals);
                }
            }
        }
    }

    addFaceVertex(faceVertex, tempVertices, tempNormals) {
        // Supported formats:
        // v
        // v//vn
        // v/vt/vn
        // v/vt
        const indices = faceVertex.split("/");

        const vertexIndex = parseInt(indices[0]) - 1;
        const normalIndex = indices.length >= 3 && indices[2] !== ""
            ? parseInt(indices[2]) - 1
            : -1;

        const vertex = tempVertices[vertexIndex];
        this.vertices.push(vertex[0], vertex[1], vertex[2]);

        if (normalIndex >= 0 && tempNormals[normalIndex]) {
            const normal = tempNormals[normalIndex];
            this.normals.push(normal[0], normal[1], normal[2]);
        } else {
            // Fallback normal if OBJ has no normals.
            this.normals.push(0, 1, 0);
        }

        // Dummy UVs because shader expects a_UV.
        this.uvs.push(0, 0);
    }

    render() {
        if (!this.loaded) {
            return;
        }

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