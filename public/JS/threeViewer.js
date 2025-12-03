// public/JS/threeViewer.js
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

let animationId = null;
let renderer = null;

// Giro automático (Negativo para ir de derecha a izquierda)
const SPEED_NORMAL = -2.0;  

export function cargarModelo(containerId, rutaModelo) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`El contenedor #${containerId} no existe.`);
        return;
    }

    // Limpieza
    if (renderer) {
        if (animationId) cancelAnimationFrame(animationId);
        renderer = null;
    }
    container.innerHTML = ''; 
    container.style.position = 'relative';

    // --- INYECCIÓN DE BOTONES ---
    
    // 1. Flecha Izquierda
    const btnLeft = document.createElement('button');
    btnLeft.className = 'control-btn btn-left';
    btnLeft.title = "Girar Izquierda";
    btnLeft.innerHTML = `
        <svg class="icon-arrow" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>`; 

    // 2. Flecha Derecha
    const btnRight = document.createElement('button');
    btnRight.className = 'control-btn btn-right';
    btnRight.title = "Girar Derecha";
    btnRight.innerHTML = `
        <svg class="icon-arrow" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>`; 

    container.appendChild(btnLeft);
    container.appendChild(btnRight);

    // --- ESCENA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x404545); 

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding; 
    
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // --- CONTROLES ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = SPEED_NORMAL; 
    controls.enablePan = false; 
    controls.rotateSpeed = 0.4; 
    controls.minDistance = 35; 
    controls.maxDistance = 50; 

    // --- LÓGICA DE MOVIMIENTO ---
    
    // Rotación Horizontal
    const rotateHorizontal = (direction) => {
        const step = Math.PI / 4; 
        const angleOffset = (direction === 'left') ? -step : step;

        const x = camera.position.x;
        const z = camera.position.z;

        const cos = Math.cos(angleOffset);
        const sin = Math.sin(angleOffset);

        camera.position.x = x * cos - z * sin;
        camera.position.z = x * sin + z * cos;
        
        camera.lookAt(0, 0, 0);
    };

    // --- EVENTOS ---

    btnLeft.addEventListener('click', (e) => {
        e.preventDefault();
        rotateHorizontal('left');
    });

    btnRight.addEventListener('click', (e) => {
        e.preventDefault();
        rotateHorizontal('right');
    });

    // --- CARGA DEL MODELO ---
    const loader = new GLTFLoader();
    loader.load(
        rutaModelo,
        (gltf) => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            model.position.x += (model.position.x - center.x);
            model.position.y += (model.position.y - center.y);
            model.position.z += (model.position.z - center.z);

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
            cameraZ *= 2.0; 
            camera.position.z = cameraZ;

            const minZ = box.min.z;
            const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;
            camera.far = cameraToFarEdge * 3;
            camera.updateProjectionMatrix();

            scene.add(model);
        },
        undefined,
        (error) => {
            console.error('Error:', error);
            container.innerHTML = '<p style="color:white; text-align:center; padding-top:20px;">Error al cargar modelo</p>';
        }
    );

    function animate() {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    const resizeObserver = new ResizeObserver(() => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);
}