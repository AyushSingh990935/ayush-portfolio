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
    scene.fog = new THREE.FogExp2(0x050505, 0.002);

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

    // ==========================================
    // 2. ECOSYSTEM GENERATION
    // ==========================================
    const ecosystemGroup = new THREE.Group();
    scene.add(ecosystemGroup);

    // A. Interconnected Data Nodes
    const nodeCount = 150;
    const nodeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const nodeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xff8c42,
        emissiveIntensity: 0.2,
        roughness: 0.2,
        metalness: 0.8
    });

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
        // Spread nodes out over a long tunnel
        mesh.position.set(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * -400 // Deep Z space
        );
        ecosystemGroup.add(mesh);
        nodes.push(mesh);
    }

    // Connect close nodes with glowing lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffb75e, transparent: true, opacity: 0.15 });
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];

    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const dist = nodes[i].position.distanceTo(nodes[j].position);
            if (dist < 15) {
                linePositions.push(
                    nodes[i].position.x, nodes[i].position.y, nodes[i].position.z,
                    nodes[j].position.x, nodes[j].position.y, nodes[j].position.z
                );
            }
        }
    }
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    ecosystemGroup.add(lines);

    // B. Floating Glass Geometries (Strategy / Abstract forms)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9, // glass-like
        ior: 1.5,
        thickness: 0.5,
        envMapIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    const geometries = [
        new THREE.IcosahedronGeometry(3, 0),
        new THREE.TorusKnotGeometry(2, 0.5, 100, 16),
        new THREE.OctahedronGeometry(4, 0)
    ];

    const floatingObjects = [];
    for (let i = 0; i < 15; i++) {
        const geo = geometries[Math.floor(Math.random() * geometries.length)];
        const mesh = new THREE.Mesh(geo, glassMaterial);
        
        mesh.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40,
            -20 - (Math.random() * 350)
        );
        
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        
        // Store random rotation speeds
        mesh.userData = {
            rx: (Math.random() - 0.5) * 0.01,
            ry: (Math.random() - 0.5) * 0.01
        };
        
        ecosystemGroup.add(mesh);
        floatingObjects.push(mesh);
    }

    // C. Ambient Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 1500;
    const posArr = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        posArr[i] = (Math.random() - 0.5) * 150; // x
        posArr[i+1] = (Math.random() - 0.5) * 100; // y
        posArr[i+2] = (Math.random() - 0.5) * -450; // z
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // ==========================================
    // 3. LIGHTING
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff8c42, 2, 100);
    pointLight1.position.set(10, 10, -50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 100);
    pointLight2.position.set(-10, -10, -150);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffb75e, 2, 100);
    pointLight3.position.set(0, 20, -250);
    scene.add(pointLight3);

    // Mouse Tracking Light
    const cursorLight = new THREE.PointLight(0xffffff, 1.5, 30);
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

        // Ease mouse position
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Move cursor light (relative to camera)
        cursorLight.position.x = camera.position.x + targetX * 15;
        cursorLight.position.y = camera.position.y + targetY * 10;
        cursorLight.position.z = camera.position.z - 10;

        // Slowly rotate ecosystem
        ecosystemGroup.rotation.y = Math.sin(time * 0.05) * 0.1;
        ecosystemGroup.rotation.z = Math.cos(time * 0.05) * 0.05;

        // Animate nodes pulsing
        nodes.forEach((node, i) => {
            node.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.2);
        });

        // Rotate floating glass objects
        floatingObjects.forEach(obj => {
            obj.rotation.x += obj.userData.rx;
            obj.rotation.y += obj.userData.ry;
            obj.position.y += Math.sin(time + obj.position.x) * 0.01;
        });

        // Slowly move particles
        particleSystem.rotation.y = time * 0.02;

        // Subtle camera pan based on mouse to create parallax depth
        camera.position.x += (targetX * 2 - (camera.position.x % 100)) * 0.05;
        camera.position.y += (targetY * 2 - (camera.position.y % 100)) * 0.05;

        renderer.render(scene, camera);
    }
    animate();

    // ==========================================
    // 5. GSAP NARRATIVE SCROLL
    // ==========================================
    
    // Total depth of our ecosystem
    const maxZ = -400; 

    ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self) => {
            const p = self.progress;
            // Fly forward through the ecosystem
            gsap.to(camera.position, {
                z: p * maxZ,
                duration: 0.5,
                ease: 'power1.out',
                overwrite: 'auto'
            });

            // Add barrel roll / cinematic camera tilts
            gsap.to(camera.rotation, {
                z: Math.sin(p * Math.PI * 2) * 0.1,
                x: Math.sin(p * Math.PI) * -0.1,
                duration: 0.5,
                ease: 'power1.out',
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
