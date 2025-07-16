import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import GameScene from '../components/venge/GameScene';
import PlayerController from '../components/venge/PlayerController';

// Simple PointerLockControls implementation
class PointerLockControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.isLocked = false;
        
        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);
        
        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 10;
        this.yawObject.add(this.pitchObject);
        
        this.PI_2 = Math.PI / 2;
        
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onPointerlockChange = this.onPointerlockChange.bind(this);
        this.onPointerlockError = this.onPointerlockError.bind(this);
        
        document.addEventListener('pointerlockchange', this.onPointerlockChange, false);
        document.addEventListener('pointerlockerror', this.onPointerlockError, false);
    }
    
    onMouseMove(event) {
        if (!this.isLocked) return;
        
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        
        this.yawObject.rotation.y -= movementX * 0.002;
        this.pitchObject.rotation.x -= movementY * 0.002;
        
        this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x));
    }
    
    onPointerlockChange() {
        if (document.pointerLockElement === this.domElement) {
            this.isLocked = true;
            document.addEventListener('mousemove', this.onMouseMove, false);
        } else {
            this.isLocked = false;
            document.removeEventListener('mousemove', this.onMouseMove, false);
        }
    }
    
    onPointerlockError() {
        console.error('Pointer lock error');
    }
    
    lock() {
        this.domElement.requestPointerLock();
    }
    
    unlock() {
        document.exitPointerLock();
    }
    
    getObject() {
        return this.yawObject;
    }
    
    moveForward(distance) {
        const vector = new THREE.Vector3(0, 0, -1);
        vector.applyQuaternion(this.yawObject.quaternion);
        this.yawObject.position.addScaledVector(vector, distance);
    }
    
    moveRight(distance) {
        const vector = new THREE.Vector3(1, 0, 0);
        vector.applyQuaternion(this.yawObject.quaternion);
        this.yawObject.position.addScaledVector(vector, distance);
    }
    
    dispose() {
        document.removeEventListener('pointerlockchange', this.onPointerlockChange, false);
        document.removeEventListener('pointerlockerror', this.onPointerlockError, false);
        document.removeEventListener('mousemove', this.onMouseMove, false);
    }
}

export default function Venge() {
    const mountRef = useRef(null);
    const [isLocked, setIsLocked] = useState(false);
    const gameRef = useRef({});

    useEffect(() => {
        if (!mountRef.current) return;

        const gameScene = new GameScene();
        const scene = gameScene.getScene();
        const camera = gameScene.getCamera();
        const renderer = gameScene.getRenderer();
        
        mountRef.current.appendChild(renderer.domElement);

        const playerController = new PlayerController(camera, scene, renderer.domElement);
        const controls = new PointerLockControls(camera, renderer.domElement);
        
        scene.add(controls.getObject());

        // Store references
        gameRef.current = { gameScene, playerController, controls, renderer, scene, camera };

        const onLock = () => setIsLocked(true);
        const onUnlock = () => setIsLocked(false);
        
        const checkLockState = () => {
            if (document.pointerLockElement === renderer.domElement) {
                setIsLocked(true);
            } else {
                setIsLocked(false);
            }
        };
        
        document.addEventListener('pointerlockchange', checkLockState);

        let lastTime = performance.now();

        const animate = () => {
            const animationFrameId = requestAnimationFrame(animate);
            gameRef.current.animationFrameId = animationFrameId;
            
            const time = performance.now();
            const delta = (time - lastTime) / 1000;

            playerController.update(delta, controls);
            renderer.render(scene, camera);
            lastTime = time;
        };

        animate();

        const handleResize = () => {
            gameScene.onWindowResize();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            if (gameRef.current.animationFrameId) {
                cancelAnimationFrame(gameRef.current.animationFrameId);
            }
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('pointerlockchange', checkLockState);
            if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
            controls.dispose();
            playerController.dispose();
            renderer.dispose();
        };
    }, []);

    const handleClick = () => {
        if (gameRef.current.controls) {
            gameRef.current.controls.lock();
        }
    };

    return (
        <div 
            ref={mountRef} 
            style={{ width: '100vw', height: '100vh', cursor: 'pointer', background: '#111' }}
            onClick={handleClick}
        >
            {!isLocked && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontSize: '24px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '20px',
                    borderRadius: '10px',
                    zIndex: 1000
                }}>
                    <h1>VENGE</h1>
                    <p>Click to Play</p>
                    <p style={{fontSize: '16px', marginTop: '20px'}}>
                        WASD to Move<br/>
                        SPACE to Jump<br/>
                        MOUSE to Look
                    </p>
                </div>
            )}
            {isLocked && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '4px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000
                }} />
            )}
        </div>
    );
}
