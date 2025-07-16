
import * as THREE from 'three';

export default class GameScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        this.scene.fog = new THREE.Fog(0x111111, 0, 150);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Start position is now at the center of the new baseplate
        this.camera.position.set(0, 10, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.setupLights();
        this.createLevel();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);
    }

    createLevel() {
        const arenaSize = 100;
        const wallHeight = 10;
        const wallThickness = 2;

        // Floor - The Standard Baseplate
        const floorGeometry = new THREE.PlaneGeometry(arenaSize, arenaSize);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.9 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Add a grid for a "test environment" feel
        const grid = new THREE.GridHelper(arenaSize, arenaSize, 0x444444, 0x444444);
        grid.position.y = 0.01; // Place it just above the floor
        this.scene.add(grid);

        // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8
        });
        const wallGeometry = new THREE.BoxGeometry(arenaSize, wallHeight, wallThickness);

        // Wall 1 (Back)
        const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall1.position.set(0, wallHeight / 2, -arenaSize / 2);
        wall1.castShadow = true;
        wall1.receiveShadow = true;
        this.scene.add(wall1);

        // Wall 2 (Front)
        const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall2.position.set(0, wallHeight / 2, arenaSize / 2);
        wall2.castShadow = true;
        wall2.receiveShadow = true;
        this.scene.add(wall2);

        // Wall 3 (Left)
        const wall3 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall3.position.set(-arenaSize / 2, wallHeight / 2, 0);
        wall3.rotation.y = Math.PI / 2;
        wall3.castShadow = true;
        wall3.receiveShadow = true;
        this.scene.add(wall3);
        
        // Wall 4 (Right)
        const wall4 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall4.position.set(arenaSize / 2, wallHeight / 2, 0);
        wall4.rotation.y = Math.PI / 2;
        wall4.castShadow = true;
        wall4.receiveShadow = true;
        this.scene.add(wall4);
    }

    getScene() { return this.scene; }
    getCamera() { return this.camera; }
    getRenderer() { return this.renderer; }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
