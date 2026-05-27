import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
    // Only init if canvas exists and not on very small devices
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || window.innerWidth < 768) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    
    // Add very light fog to blend into the #faf9f6 background
    scene.fog = new THREE.Fog(0xfaf9f6, 10, 40);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Transparent background
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // MATERIALS
    // Elegant frosted glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.3,
        transmission: 0.8, // glass-like
        thickness: 0.5,
        envMapIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });

    // Accent warm material
    const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0xffb86c,
        roughness: 0.2,
        metalness: 0.1
    });

    // Accent dark material
    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.4,
        metalness: 0.5
    });

    // GEOMETRIES
    const shapes = [];
    const geometries = [
        new THREE.IcosahedronGeometry(1.2, 0),
        new THREE.TorusGeometry(1, 0.3, 16, 100),
        new THREE.OctahedronGeometry(1.5, 0),
        new THREE.TetrahedronGeometry(1.2, 0),
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.CylinderGeometry(0.8, 0.8, 2, 32)
    ];

    const materials = [glassMaterial, glassMaterial, accentMaterial, darkMaterial, glassMaterial];

    // Create 12 floating objects
    for (let i = 0; i < 12; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const mat = materials[Math.floor(Math.random() * materials.length)];
        
        const mesh = new THREE.Mesh(geo, mat);
        
        // Random position spread across the screen
        mesh.position.x = (Math.random() - 0.5) * 35;
        mesh.position.y = (Math.random() - 0.5) * 35;
        mesh.position.z = (Math.random() - 0.5) * 15 - 5; // Slightly pushed back
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        // Store individual rotation speeds and float offsets
        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.01,
            rotSpeedY: (Math.random() - 0.5) * 0.01,
            floatSpeed: 0.001 + Math.random() * 0.002,
            floatOffset: Math.random() * Math.PI * 2,
            initialY: mesh.position.y
        };
        
        scene.add(mesh);
        shapes.push(mesh);
    }

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2);
    dirLight1.position.set(10, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff7e67, 1.5);
    dirLight2.position.set(-10, -20, -10);
    scene.add(dirLight2);

    // MOUSE PARALLAX
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.001;
        mouseY = (event.clientY - windowHalfY) * 0.001;
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // Ease mouse targets
        targetX = mouseX * 2;
        targetY = mouseY * 2;
        
        // Camera parallax based on mouse
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        // Animate shapes
        shapes.forEach(shape => {
            // Rotate
            shape.rotation.x += shape.userData.rotSpeedX;
            shape.rotation.y += shape.userData.rotSpeedY;
            
            // Floating up and down
            shape.position.y = shape.userData.initialY + Math.sin(time * shape.userData.floatSpeed * 1000 + shape.userData.floatOffset) * 1.5;
        });

        renderer.render(scene, camera);
    }

    animate();

    // RESIZE EVENT
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
