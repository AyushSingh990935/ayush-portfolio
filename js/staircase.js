document.addEventListener('DOMContentLoaded', () => {
    // Ensure Three.js and GSAP are loaded
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Three.js or GSAP is not loaded. Staircase disabled.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. SETUP THREE.JS SCENE
    // ==========================================
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Set a very light, warm fog to fade out distant stairs
    scene.fog = new THREE.FogExp2(0xfaf9f6, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Initial camera position (standing at the top of the stairs)
    camera.position.set(0, 5, 10);
    camera.lookAt(0, -5, -10);

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ==========================================
    // 2. PROCEDURAL STAIRCASE GENERATION
    // ==========================================
    const stepsGroup = new THREE.Group();
    scene.add(stepsGroup);

    const totalSteps = 150;
    const stepWidth = 20;
    const stepHeight = 1;
    const stepDepth = 2;

    const stepMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1,
    });

    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff8c42, opacity: 0.3, transparent: true });

    for (let i = 0; i < totalSteps; i++) {
        // Step Mesh
        const geometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
        const step = new THREE.Mesh(geometry, stepMaterial);
        
        // Position each step slightly lower and further back
        step.position.set(0, -i * stepHeight, -i * stepDepth);
        stepsGroup.add(step);

        // Add sleek glowing wireframe edges (Peachweb aesthetic)
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, edgeMaterial);
        line.position.copy(step.position);
        stepsGroup.add(line);
    }

    // Floating particles/dust for ambiance
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        // Spread particles around the staircase
        posArray[i] = (Math.random() - 0.5) * 50; // x
        posArray[i + 1] = (Math.random() - 0.5) * 150; // y
        posArray[i + 2] = (Math.random() - 0.5) * 300; // z
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xff8c42,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // ==========================================
    // 3. LIGHTING
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffb75e, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff8c42, 1, 50);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // ==========================================
    // 4. ANIMATION LOOP
    // ==========================================
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Very slow ambient rotation for floating particles
        particlesMesh.rotation.y = elapsedTime * 0.05;
        
        // Gentle bobbing of the point light to simulate a floating lantern
        pointLight.position.y = camera.position.y + 2 + Math.sin(elapsedTime * 2) * 1;
        pointLight.position.z = camera.position.z - 5;

        renderer.render(scene, camera);
    }
    animate();

    // ==========================================
    // 5. GSAP SCROLL TRIGGERS
    // ==========================================
    
    // We map the total scrollable height to the camera walking down the stairs
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    
    // The camera will move this many steps down over the full scroll
    const stepsToTravel = totalSteps * 0.8; 
    
    ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth scrub
        onUpdate: (self) => {
            const progress = self.progress;
            
            // Calculate target position down the stairs
            // We want to walk down Y and forward Z
            const targetY = 5 - (progress * stepsToTravel * stepHeight);
            const targetZ = 10 - (progress * stepsToTravel * stepDepth);
            
            // Move camera
            camera.position.y = targetY;
            camera.position.z = targetZ;
            
            // Slightly tilt camera down as we progress, to create a sense of looking down the deep shaft
            const lookAtY = targetY - 5 - (progress * 15);
            camera.lookAt(0, lookAtY, targetZ - 10);
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
