document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Three.js or GSAP missing. WebGL ecosystem disabled.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. SCENE SETUP
    // ==========================================
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    // Deep dark background with subtle fog
    scene.fog = new THREE.FogExp2(0x050505, 0.003);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const ecosystemGroup = new THREE.Group();
    scene.add(ecosystemGroup);

    // ==========================================
    // 2. THE PLANNER & BURST GEOMETRY
    // ==========================================
    // We create a cohesive "Planner" tablet/grid out of 200 glass fragments.
    // As the user scrolls, it will explode into the background.
    
    const pieceCount = 200;
    const pieces = [];
    const pieceGeo = new THREE.BoxGeometry(0.9, 0.9, 0.1);
    
    // Premium Glass Material
    const pieceMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: 0xff9f5a,
        emissiveIntensity: 0.15,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.9, // Glass effect
        ior: 1.5,
        clearcoat: 1.0
    });

    const cols = 20;
    const rows = 10;
    const startX = -((cols - 1) * 1) / 2;
    const startY = ((rows - 1) * 1) / 2;

    for (let i = 0; i < pieceCount; i++) {
        const mesh = new THREE.Mesh(pieceGeo, pieceMat);
        
        // Initial Grid Position (The Planner)
        const col = i % cols;
        const row = Math.floor(i / cols);
        const initX = startX + col * 1;
        const initY = startY - row * 1;
        const initZ = -15; // Hovering in front of the camera initially
        
        // Target Exploded Position (The Network Ecosystem)
        const targetX = (Math.random() - 0.5) * 200;
        const targetY = (Math.random() - 0.5) * 150;
        const targetZ = -50 - (Math.random() * 450);

        // Random rotation for the burst
        const rotX = Math.random() * Math.PI * 4;
        const rotY = Math.random() * Math.PI * 4;
        const rotZ = Math.random() * Math.PI * 4;
        
        mesh.position.set(initX, initY, initZ);
        
        // Store properties for GSAP interpolation
        mesh.userData = {
            initX, initY, initZ,
            targetX, targetY, targetZ,
            rotX, rotY, rotZ,
            floatSpeed: Math.random() * 2 + 1,
            floatOffset: Math.random() * Math.PI * 2
        };
        
        ecosystemGroup.add(mesh);
        pieces.push(mesh);
    }

    // Ambient Particles (Data Dust)
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 1500;
    const posArr = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        posArr[i] = (Math.random() - 0.5) * 200;
        posArr[i+1] = (Math.random() - 0.5) * 150;
        posArr[i+2] = (Math.random() - 0.5) * -500;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // ==========================================
    // 3. LIGHTING
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff9f5a, 2, 100);
    pointLight1.position.set(10, 10, -30);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x60a5fa, 2, 150);
    pointLight2.position.set(-20, -10, -100);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffb75e, 2, 200);
    pointLight3.position.set(0, 20, -300);
    scene.add(pointLight3);

    // Interactive Cursor Light
    const cursorLight = new THREE.PointLight(0xffffff, 1.5, 40);
    scene.add(cursorLight);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // ==========================================
    // 4. ANIMATION LOOP
    // ==========================================
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Mouse tracking easing
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Move cursor light
        cursorLight.position.x = camera.position.x + targetX * 20;
        cursorLight.position.y = camera.position.y + targetY * 15;
        cursorLight.position.z = camera.position.z - 15;

        // Ambient floating motion for exploded pieces
        pieces.forEach(mesh => {
            const data = mesh.userData;
            // Only apply heavy float when they are exploded (deeper Z)
            const floatAmount = Math.max(0, (data.initZ - mesh.position.z) / 100);
            mesh.position.y += Math.sin(time * data.floatSpeed + data.floatOffset) * 0.02 * floatAmount;
        });

        // Rotate particles slowly
        particleSystem.rotation.y = time * 0.02;

        // Subtle parallax pan based on mouse
        camera.position.x += (targetX * 3 - (camera.position.x % 100)) * 0.05;
        camera.position.y += (targetY * 3 - (camera.position.y % 100)) * 0.05;

        renderer.render(scene, camera);
    }
    animate();

    // ==========================================
    // 5. GSAP SCROLL CHOREOGRAPHY (THE BURST)
    // ==========================================
    const maxZ = -400; // Total depth of the camera journey

    ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5, // Smooth scrubbing
        onUpdate: (self) => {
            const p = self.progress;

            // 1. The Burst Physics
            // We want the planner to shatter and scatter within the first 30% of scroll
            const burstProgress = Math.min(p / 0.3, 1);
            const easeBurst = 1 - Math.pow(1 - burstProgress, 3); // easeOutCubic

            pieces.forEach(mesh => {
                const data = mesh.userData;
                // Interpolate from Planner grid to scattered network
                mesh.position.x = data.initX + (data.targetX - data.initX) * easeBurst;
                mesh.position.y = data.initY + (data.targetY - data.initY) * easeBurst;
                mesh.position.z = data.initZ + (data.targetZ - data.initZ) * easeBurst;
                
                // Spin them as they fly out
                mesh.rotation.x = data.rotX * easeBurst;
                mesh.rotation.y = data.rotY * easeBurst;
                mesh.rotation.z = data.rotZ * easeBurst;
            });

            // 2. Camera Flight
            // Fly forward through the newly formed scattered ecosystem
            gsap.to(camera.position, {
                z: p * maxZ,
                duration: 0.5,
                overwrite: 'auto'
            });

            // Cinematic tilts
            gsap.to(camera.rotation, {
                z: Math.sin(p * Math.PI * 2) * 0.1,
                x: Math.sin(p * Math.PI) * -0.1,
                duration: 0.5,
                overwrite: 'auto'
            });
        }
    });

    // ==========================================
    // 6. RESIZE HANDLER
    // ==========================================
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
