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

    // --- BOTONES ---
    const btnLeft = document.createElement('button');
    btnLeft.className = 'control-btn btn-left';
    btnLeft.innerHTML = `<svg class="icon-arrow" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`; 

    const btnRight = document.createElement('button');
    btnRight.className = 'control-btn btn-right';
    btnRight.innerHTML = `<svg class="icon-arrow" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`; 

    const btnZoom = document.createElement('button');
    btnZoom.className = 'control-btn btn-zoom';
    btnZoom.title = "Modo Inspección (Zoom)";
    btnZoom.innerHTML = `<svg class="icon-zoom" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

    container.appendChild(btnLeft);
    container.appendChild(btnRight);
    container.appendChild(btnZoom);

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
    controls.enablePan = false; 

    // Variables de Límites (Se calcularán al cargar)
    // NORMAL: Rango muy corto
    let limitNormalMin = 0; 
    let limitNormalMax = 0;
    
    // LUPA: Rango enorme 
    let limitLupaMin = 0;   
    let limitLupaMax = 0;

    // --- MOVIMIENTO MANUAL ---
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

    // --- LOGICA DE LA LUPA ---
    let isZoomMode = false;

    btnZoom.addEventListener('click', (e) => {
        e.preventDefault();
        isZoomMode = !isZoomMode;

        if (isZoomMode) {
            // --- MODO LUPA ACTIVADO ---
            btnZoom.classList.add('active');
            controls.autoRotate = false;
            
            // Aplicamos los límites "GRANDES"
            controls.minDistance = limitLupaMin; 
            controls.maxDistance = limitLupaMax;

        } else {
            // --- MODO LUPA DESACTIVADO ---
            btnZoom.classList.remove('active');
            controls.autoRotate = true;
            
            // Aplicamos los límites 
            controls.minDistance = limitNormalMin;
            controls.maxDistance = limitNormalMax;
        }
    });

// --- CARGA DEL MODELO ---
    const loader = new GLTFLoader();
    loader.load(
        rutaModelo,
        (gltf) => {
            const model = gltf.scene;
            
            //Centrar y Calcular Bounding Box
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            model.position.x += (model.position.x - center.x);
            model.position.y += (model.position.y - center.y);
            model.position.z += (model.position.z - center.z);
            scene.add(model);

            //Análisis de Geometría
            const maxDim = Math.max(size.x, size.y, size.z);
            const minDim = Math.min(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            
            // Calculamos la proporción
            // Si el lado largo es 3 veces mayor que el corto, es alargado.
            const aspectRatio = maxDim / minDim;

            // --- CÁLCULO CÁMARA INICIAL ---
            let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
            cameraZ *= 1.6; // Distancia inicial cómoda con aire (como pediste antes)

            // --- DEFINICIÓN DE LÍMITES INTELIGENTES ---

            // MODO NORMAL
            limitNormalMin = cameraZ * 0.5;  
            limitNormalMax = cameraZ * 1.5;  

            // MODO LUPA 
            if (aspectRatio > 3) {
                // CASO ESPADA (Objeto fino y largo)
                // Podemos acercarnos mucho relativo al largo, porque es fino y no chocaremos.
                limitLupaMin = maxDim * 0.2; 
            } else {
                // CASO PELOTA (Objeto voluminoso)
                // El radio del objeto es aprox (maxDim / 2), es decir 0.5.
                // Si ponemos menos de 0.5, entramos dentro.
                // Ponemos 0.65 para quedarnos justo en la superficie sin atravesarla.
                limitLupaMin = maxDim * 0.65; 
            }

            // Límite lejano Lupa
            limitLupaMax = cameraZ * 3.0;

            // Posición Inicial
            camera.position.set(0, 0, cameraZ);
            camera.lookAt(0, 0, 0);

            // Aplicar configuración inicial
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