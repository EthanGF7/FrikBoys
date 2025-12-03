// public/JS/ThreeViewr.js
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

let animationId = null;
let renderer = null;

const SPEED_NORMAL = -2.0;  

export function cargarModelo(containerId, rutaModelo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (renderer) {
        if (animationId) cancelAnimationFrame(animationId);
        renderer = null;
    }
    container.innerHTML = ''; 
    container.style.position = 'relative';

    // --- 1. BOTONES IZQUIERDA / DERECHA ---
    const btnLeft = document.createElement('button');
    btnLeft.className = 'control-btn btn-left';
    btnLeft.innerHTML = `<svg class="icon-arrow" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`; 

    const btnRight = document.createElement('button');
    btnRight.className = 'control-btn btn-right';
    btnRight.innerHTML = `<svg class="icon-arrow" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`; 

    // --- 2. BOTÓN LUPA (ZOOM) ---
    const btnZoom = document.createElement('button');
    btnZoom.className = 'control-btn btn-zoom';
    btnZoom.title = "Modo Inspección (Zoom)";
    btnZoom.innerHTML = `<svg class="icon-zoom" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

    // --- 3. BOTÓN MANO (PANEO) - NUEVO ---
    const btnHand = document.createElement('button');
    btnHand.className = 'control-btn btn-hand';
    btnHand.title = "Mover Modelo (Mano)";
    btnHand.innerHTML = `
        <svg class="icon-hand" viewBox="0 0 24 24">
            <path d="M18 9c0-.55-.45-1-1-1s-1 .45-1 1v5.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V6c0-.55-.45-1-1-1s-1 .45-1 1v7.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V5c0-.55-.45-1-1-1s-1 .45-1 1v8.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V7c0-.55-.45-1-1-1s-1 .45-1 1v8.65c0 2.49 1.46 4.69 3.63 5.75l.12.06.6.29c.14.07.29.1.45.1 1.63 0 3.09-1.03 3.59-2.58l.75-2.26c.26-.79.4-1.61.4-2.43V9zM9 13.97V19l-3.23-1.62C4.7 16.85 4 15.65 4 14.28c0-.65.25-1.27.71-1.73l.66-.66c.26-.26.66-.3.96-.1l2.67 1.78v.4z"/>
        </svg>`;

    container.appendChild(btnLeft);
    container.appendChild(btnRight);
    container.appendChild(btnZoom);
    container.appendChild(btnHand); // Agregamos el nuevo botón

    // --- ESCENA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x404545); 

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding; 
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
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
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = SPEED_NORMAL; 
    
    // Por defecto NO se puede mover (Solo girar)
    controls.enablePan = false; 

    // Variables de Límites
    let limitNormalMin = 0; 
    let limitNormalMax = 0;
    let limitLupaMin = 0;   
    let limitLupaMax = 0;

    // --- MOVIMIENTO MANUAL (FLECHAS) ---
    const rotateHorizontal = (direction) => {
        const step = Math.PI / 6; 
        const angleOffset = (direction === 'left') ? -step : step;
        const x = camera.position.x;
        const z = camera.position.z;
        const cos = Math.cos(angleOffset);
        const sin = Math.sin(angleOffset);
        camera.position.x = x * cos - z * sin;
        camera.position.z = x * sin + z * cos;
        camera.lookAt(0, 0, 0);
    };

    btnLeft.addEventListener('click', (e) => { e.preventDefault(); rotateHorizontal('left'); });
    btnRight.addEventListener('click', (e) => { e.preventDefault(); rotateHorizontal('right'); });

    // --- ESTADOS ---
    let isZoomMode = false;
    let isHandMode = false;

    // --- LÓGICA DE LA LUPA ---
    btnZoom.addEventListener('click', (e) => {
        e.preventDefault();
        isZoomMode = !isZoomMode;

        if (isZoomMode) {
            btnZoom.classList.add('active');
            controls.autoRotate = false; // Zoom para la rotación
            controls.minDistance = limitLupaMin; 
            controls.maxDistance = limitLupaMax;
        } else {
            btnZoom.classList.remove('active');
            // Solo volvemos a girar si no estamos moviendo con la mano
            if (!isHandMode) controls.autoRotate = true;
            controls.minDistance = limitNormalMin;
            controls.maxDistance = limitNormalMax;
        }
    });

    // --- LÓGICA DE LA MANO (NUEVO) ---
    btnHand.addEventListener('click', (e) => {
        e.preventDefault();
        isHandMode = !isHandMode;

        if (isHandMode) {
            // MODO MANO ACTIVADO
            btnHand.classList.add('active');
            controls.enablePan = true;  // Habilitamos mover
            controls.autoRotate = false; // Paramos rotación
            
            // CAMBIO DE COMPORTAMIENTO DEL MOUSE:
            // Clic Izquierdo = MOVER (Pan)
            // Clic Derecho = GIRAR (Rotate)
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.ROTATE
            };
            // Para móviles (1 dedo mueve)
            controls.touches = {
                ONE: THREE.TOUCH.PAN,
                TWO: THREE.TOUCH.DOLLY_PAN
            };

        } else {
            // MODO MANO DESACTIVADO
            btnHand.classList.remove('active');
            controls.enablePan = false; // Bloqueamos mover

            // RECENTRAR EL MODELO AUTOMÁTICAMENTE
            // Esto evita que se quede "fuera del escenario"
            controls.target.set(0, 0, 0); 

            // RESTAURAR COMPORTAMIENTO NORMAL:
            // Clic Izquierdo = GIRAR
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };
            controls.touches = {
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
            };

            // Reactivar giro automático si no está la lupa puesta
            if (!isZoomMode) controls.autoRotate = true;
        }
    });

    // --- CARGA DEL MODELO ---
    const loader = new GLTFLoader();
    loader.load(
        rutaModelo,
        (gltf) => {
            const model = gltf.scene;
            
            // Centrar y Bounding Box
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            model.position.x += (model.position.x - center.x);
            model.position.y += (model.position.y - center.y);
            model.position.z += (model.position.z - center.z);
            scene.add(model);

            // Cálculos
            const maxDim = Math.max(size.x, size.y, size.z);
            const minDim = Math.min(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const aspectRatio = maxDim / minDim;

            // Distancia Inicial con aire
            let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
            cameraZ *= 1.6; 

            // --- LÍMITES INTELIGENTES ---

            // MODO NORMAL
            limitNormalMin = cameraZ * 0.5;  
            limitNormalMax = cameraZ * 1.5;  

            // MODO LUPA 
            if (aspectRatio > 3) { // Espada
                limitLupaMin = maxDim * 0.2; 
            } else { // Pelota
                limitLupaMin = maxDim * 0.65; 
            }
            limitLupaMax = cameraZ * 3.0;

            // Configuración Inicial
            camera.position.set(0, 0, cameraZ);
            camera.lookAt(0, 0, 0);

            controls.minDistance = limitNormalMin;
            controls.maxDistance = limitNormalMax;
            
            controls.update();
        },
        undefined,
        (error) => { console.error(error); }
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