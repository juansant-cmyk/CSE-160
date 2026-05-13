class Camera {
    constructor() {
        this.fov = 60;

        this.eye = new Vector3([0, 1, 5]);
        this.at = new Vector3([0, 1, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.speed = 0.08;
        this.alpha = 2;

        this.pitch = 0;

        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();

        this.updateView();
    }

    panMouse(dx) {
        let sensitivity = 0.01;
        this.pan(-dx * sensitivity);
    }

    panHorizontal(angle) {
        this.pan(angle);
    }

    panVertical(angle) {
        this.pitch += angle;

        if (this.pitch > 89) this.pitch = 89;
        if (this.pitch < -89) this.pitch = -89;

        let forward = this.getForwardVector();

        let fx = forward.elements[0];
        let fy = forward.elements[1];
        let fz = forward.elements[2];

        let horizontalDist = Math.sqrt(fx * fx + fz * fz);

        fy = Math.sin(this.pitch * Math.PI / 180);
        horizontalDist = Math.cos(this.pitch * Math.PI / 180);

        let length = Math.sqrt(fx * fx + fz * fz);

        if (length > 0.0001) {
            fx = (fx / length) * horizontalDist;
            fz = (fz / length) * horizontalDist;
        }

        this.at.elements[0] = this.eye.elements[0] + fx;
        this.at.elements[1] = this.eye.elements[1] + fy;
        this.at.elements[2] = this.eye.elements[2] + fz;

        this.updateView();
    }

    updateView() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    updateProjection(canvas) {
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }

    getForwardVector() {
        let f = new Vector3([
            this.at.elements[0] - this.eye.elements[0],
            this.at.elements[1] - this.eye.elements[1],
            this.at.elements[2] - this.eye.elements[2]
        ]);

        f.normalize();
        return f;
    }
    lockToGround() {
        let lookX = this.at.elements[0] - this.eye.elements[0];
        let lookY = this.at.elements[1] - this.eye.elements[1];
        let lookZ = this.at.elements[2] - this.eye.elements[2];

        this.eye.elements[1] = 1;

        this.at.elements[0] = this.eye.elements[0] + lookX;
        this.at.elements[1] = this.eye.elements[1] + lookY;
        this.at.elements[2] = this.eye.elements[2] + lookZ;

        this.updateView();
    }

    moveForward() {
        let f = this.getForwardVector();
        this.moveBy(f.elements[0], f.elements[1], f.elements[2]);
    }

    moveBackwards() {
        let f = this.getForwardVector();
        this.moveBy(-f.elements[0], -f.elements[1], -f.elements[2]);
    }

    moveUp() {
        this.eye.elements[1] += this.speed;
        this.at.elements[1] += this.speed;
        this.updateView();
    }

    moveDown() {
        this.eye.elements[1] -= this.speed;
        this.at.elements[1] -= this.speed;
        this.updateView();
    }

    moveLeft() {
        let f = this.getForwardVector();

        let sx = this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1];
        let sy = this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2];
        let sz = this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0];

        let s = new Vector3([sx, sy, sz]);
        s.normalize();

        this.moveBy(s.elements[0], s.elements[1], s.elements[2]);
    }

    moveRight() {
        let f = this.getForwardVector();

        let sx = f.elements[1] * this.up.elements[2] - f.elements[2] * this.up.elements[1];
        let sy = f.elements[2] * this.up.elements[0] - f.elements[0] * this.up.elements[2];
        let sz = f.elements[0] * this.up.elements[1] - f.elements[1] * this.up.elements[0];

        let s = new Vector3([sx, sy, sz]);
        s.normalize();

        this.moveBy(s.elements[0], s.elements[1], s.elements[2]);
    }

    moveBy(x, y, z) {
        this.eye.elements[0] += x * this.speed;
        this.eye.elements[1] += y * this.speed;
        this.eye.elements[2] += z * this.speed;

        this.at.elements[0] += x * this.speed;
        this.at.elements[1] += y * this.speed;
        this.at.elements[2] += z * this.speed;

        this.updateView();
    }

    panLeft() {
        this.pan(this.alpha);
    }

    panRight() {
        this.pan(-this.alpha);
    }

    pan(angle) {
        let f = this.getForwardVector();

        let rotation = new Matrix4();
        rotation.setRotate(angle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let newF = rotation.multiplyVector3(f);

        this.at.elements[0] = this.eye.elements[0] + newF.elements[0];
        this.at.elements[1] = this.eye.elements[1] + newF.elements[1];
        this.at.elements[2] = this.eye.elements[2] + newF.elements[2];

        this.updateView();
    }
}