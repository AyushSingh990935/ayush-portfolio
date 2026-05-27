/**
 * webgl-core.js — Strategic Neural Network
 * A living intelligence network of interconnected nodes that responds
 * to mouse movement and scroll position. Replaces the burst planner.
 *
 * Dependencies: Three.js r128, GSAP 3.12+, ScrollTrigger
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // GUARD CHECKS
    // ==========================================
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Three.js or GSAP missing. WebGL neural network disabled.');
        return;
    }
    gsap.registerPlugin(ScrollTrigger);

    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================
    // 1. SCENE SETUP
    // ==========================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.0015);

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Master group for scroll choreography
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // ==========================================
    // 2. NEURAL NETWORK NODES
    // ==========================================
    const NODE_COUNT = 80;
    const nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.3, 12, 12);
    const nodeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xff9f5a,
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.7
    });

    for (let i = 0; i < NODE_COUNT; i++) {
        const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());

        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 60 - 20;

        mesh.position.set(x, y, z);

        // Store original position and random phase for oscillation
        mesh.userData = {
            originX: x,
            originY: y,
            originZ: z,
            phase: Math.random() * Math.PI * 2
        };

        networkGroup.add(mesh);
        nodes.push(mesh);
    }

    // ==========================================
    // 3. CONNECTION LINES
    // ==========================================
    const CONNECTION_DISTANCE = 12;
    const linePositions = [];

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].position.x - nodes[j].position.x;
            const dy = nodes[i].position.y - nodes[j].position.y;
            const dz = nodes[i].position.z - nodes[j].position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < CONNECTION_DISTANCE) {
                linePositions.push(
                    nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
                    nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
                );
            }
        }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(linePositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff9f5a,
        transparent: true,
        opacity: 0.06
    });

    const connectionLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    networkGroup.add(connectionLines);

    // ==========================================
    // 4. AMBIENT PARTICLES
    // ==========================================
    const PARTICLE_COUNT = 1000;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        particlePositions[i3]     = (Math.random() - 0.5) * 100;
        particlePositions[i3 + 1] = (Math.random() - 0.5) * 100;
        particlePositions[i3 + 2] = (Math.random() - 0.5) * 80 - 20;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.08,
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // ==========================================
    // 5. LIGHTING
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const warmLight = new THREE.PointLight(0xff9f5a, 1.5, 80);
    warmLight.position.set(15, 10, 10);
    scene.add(warmLight);

    const coolLight = new THREE.PointLight(0x60a5fa, 1.5, 80);
    coolLight.position.set(-15, -10, -10);
    scene.add(coolLight);

    // Interactive cursor light
    const cursorLight = new THREE.PointLight(0xffffff, 1, 50);
    scene.add(cursorLight);

    // ==========================================
    // 6. MOUSE TRACKING
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ==========================================
    // 7. ANIMATION LOOP
    // ==========================================
    const clock = new THREE.Clock();
    const baseCameraX = camera.position.x;
    const baseCameraY = camera.position.y;

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Smooth mouse easing
        targetMouseX += (mouseX - targetMouseX) * 0.03;
        targetMouseY += (mouseY - targetMouseY) * 0.03;

        if (!prefersReducedMotion) {
            // Node oscillation — gentle vertical bob
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const data = node.userData;

                // Gentle Y oscillation
                node.position.y = data.originY + Math.sin(time * 0.5 + data.phase) * 0.015;

                // Pulsing scale
                const scaleFactor = 1 + Math.sin(time * 1.5 + i) * 0.15;
                node.scale.setScalar(scaleFactor);
            }

            // Slowly rotate particles
            particleSystem.rotation.y = time * 0.01;
        }

        // Cursor light follows mouse relative to camera
        cursorLight.position.x = camera.position.x + targetMouseX * 20;
        cursorLight.position.y = camera.position.y + targetMouseY * 15;
        cursorLight.position.z = camera.position.z - 10;

        // Subtle camera parallax from mouse
        camera.position.x += (baseCameraX + targetMouseX * 2 - camera.position.x) * 0.03;
        camera.position.y += (baseCameraY + targetMouseY * 2 - camera.position.y) * 0.03;

        renderer.render(scene, camera);
    }
    animate();

    // ==========================================
    // 8. SCROLL CHOREOGRAPHY (GSAP ScrollTrigger)
    // ==========================================
    if (!prefersReducedMotion) {
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2,
            onUpdate: (self) => {
                const progress = self.progress; // 0 → 1

                // Rotate the entire network
                networkGroup.rotation.y = progress * Math.PI * 0.5;
                networkGroup.rotation.x = progress * Math.PI * 0.15;

                // Scale network: recedes into background
                const networkScale = 1 - progress * 0.4; // 1 → 0.6
                networkGroup.scale.setScalar(networkScale);

                // Push the network deeper
                networkGroup.position.z = progress * -30;

                // Camera moves in slightly — "flying through" effect
                camera.position.z = 30 - progress * 15; // 30 → 15
            }
        });
    }

    // ==========================================
    // 9. RESIZE HANDLER
    // ==========================================
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
});
