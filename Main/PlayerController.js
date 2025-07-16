
import * as THREE from 'three';

export default class PlayerController {
    constructor(camera, scene, domElement) {
        this.camera = camera;
        this.scene = scene;
        this.domElement = domElement;

        this.playerHeight = 1.8;
        this.playerSpeed = 15.0; // Increased speed
        this.jumpHeight = 9.0; // Adjusted jump height
        this.gravity = -30.0; // Increased gravity for less floaty feel

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        this.collidableObjects = [];
        this.scene.traverse((child) => {
            if (child.isMesh) {
                this.collidableObjects.push(child);
            }
        });

        // Raycaster to detect ground
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, this.playerHeight / 2 + 0.2);

        this.addEventListeners();
    }

    addEventListeners() {
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
            case 'Space':
                if (this.canJump) this.velocity.y += this.jumpHeight;
                this.canJump = false;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }

    update(delta, controls) {
        if (!controls.isLocked) return;

        // Apply gravity
        this.velocity.y += this.gravity * delta;

        // Get movement direction from keyboard input
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize(); // ensures consistent movement speed in all directions

        // Calculate actual move amount for this frame
        const moveZ = this.direction.z * this.playerSpeed * delta;
        const moveX = this.direction.x * this.playerSpeed * delta;
        
        // Apply horizontal movement
        controls.moveForward(moveZ);
        controls.moveRight(moveX);
        
        // Apply vertical movement (falling)
        controls.getObject().position.y += this.velocity.y * delta;

        // Ground collision detection
        this.raycaster.ray.origin.copy(controls.getObject().position);
        this.raycaster.ray.origin.y -= this.playerHeight / 2 - 0.1; // Ray starts just above feet
        const intersections = this.raycaster.intersectObjects(this.collidableObjects, false);

        const onObject = intersections.length > 0;

        if (onObject) {
            // If we are on an object, stop downward velocity and allow jumping
            this.velocity.y = Math.max(0, this.velocity.y);
            this.canJump = true;
        }

        // Prevent falling through the absolute floor
        if (controls.getObject().position.y < this.playerHeight / 2) {
            this.velocity.y = 0;
            controls.getObject().position.y = this.playerHeight / 2;
            this.canJump = true;
        }
    }
}
