// public/JS/threeViewer.js
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

// No usamos variables globales aquí para permitir múltiples visores a la vez

export function cargarModelo(containerId, rutaModelo, esPreview = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Limpiamos el contenedor por si había algo antes
    container.innerHTML = ''; 
    container.style.position = 'relative';

    // ==========================================
    // 1. SOLO CREAMOS BOTONES SI NO ES PREVIEW
    // ==========================================
    let btnLeft, btnRight, btnZoom, btnHand;

    if (!esPreview) {
        // --- BOTONES IZQUIERDA / DERECHA ---
        btnLeft = document.createElement('button');
        btnLeft.className = 'control-btn btn-left';
        btnLeft.innerHTML = `<svg class="icon-arrow" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`; 

        btnRight = document.createElement('button');
        btnRight.className = 'control-btn btn-right';
        btnRight.innerHTML = `<svg class="icon-arrow" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`; 

        // --- BOTÓN LUPA ---
        btnZoom = document.createElement('button');
        btnZoom.className = 'control-btn btn-zoom';
        btnZoom.innerHTML = `<svg class="icon-zoom" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

        // --- BOTÓN MANO ---
        btnHand = document.createElement('button');
        btnHand.className = 'control-btn btn-hand';
        btnHand.innerHTML = `<svg class="icon-hand" viewBox="0 0 24 24"><path d="M18 9c0-.55-.45-1-1-1s-1 .45-1 1v5.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V6c0-.55-.45-1-1-1s-1 .45-1 1v7.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V5c0-.55-.45-1-1-1s-1 .45-1 1v8.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V7c0-.55-.45-1-1-1s-1 .45-1 1v8.65c0 2.49 1.46 4.69 3.63 5.75l.12.06.6.29c.14.07.29.1.45.1 1.63 0 3.09-1.03 3.59-2.58l.75-2.26c.26-.79.4-1.61.4-2.43V9zM9 13.97V19l-3.23-1.62C4.7 16.85 4 15.65 4 14.28c0-.65.25-1.27.71-1.73l.66-.66c.26-.26.66-.3.96-.1l2.67 1.78v.4z"/></svg>`;

        container.appendChild(btnLeft);
        container.appendChild(btnRight);
        container.appendChild(btnZoom);
        container.appendChild(btnHand);
    }

    // --- ESCENA ---
    const scene = new THREE.Scene();
    // Si es preview, fondo transparente o gris claro, si es modal, gris oscuro
    if(esPreview) {
        scene.background = null; // Transparente para que se vea bien en la carta
    } else {
        scene.background = new THREE.Color(0x404545); 
    }

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // IMPORTANTE: alpha: true permite fondo transparente
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding; 
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    // --- CONTROLES ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.autoRotate = true;
    
    // CONFIGURACIÓN SEGÚN MODO
    if (esPreview) {
        controls.autoRotateSpeed = -4.0; // Gira un poco más rápido en la carta
        controls.enableZoom = false;     // No zoom
        controls.enablePan = false;      // No mover
        // Opcional: Desactivar interacción del mouse en la carta para que solo se vea
        controls.enableRotate = false;   
    } else {
        controls.autoRotateSpeed = -2.0; 
        controls.enablePan = false; 
    }

    // --- LÓGICA DE BOTONES (SOLO SI NO ES PREVIEW) ---
    if (!esPreview) {
        // Variables de estado local
        let isZoomMode = false;
        let isHandMode = false;
        let limitNormalMin = 0, limitNormalMax = 0, limitLupaMin = 0, limitLupaMax = 0;

        // ... (Aquí va toda tu lógica de botones original, pero referenciando variables locales)
        // Por brevedad, he omitido copiar toda la lógica de botones que ya tenías, 
        // pero asegúrate de que usen las variables 'controls', 'camera', etc. de ESTA función.
        
        // Ejemplo simple para que funcione el giro manual:
        const rotateHorizontal = (direction) => {
             const step = Math.PI / 6; 
             const angleOffset = (direction === 'left') ? -step : step;
             const x = camera.position.x;
             const z = camera.position.z;
             camera.position.x = x * Math.cos(angleOffset) - z * Math.sin(angleOffset);
             camera.position.z = x * Math.sin(angleOffset) + z * Math.cos(angleOffset);
             camera.lookAt(0, 0, 0);
        };
        btnLeft.addEventListener('click', (e) => { e.stopPropagation(); rotateHorizontal('left'); });
        btnRight.addEventListener('click', (e) => { e.stopPropagation(); rotateHorizontal('right'); });
        
        // Recuerda añadir aquí el resto de tus Listeners de Zoom y Mano que tenías
        // asegurándote de usar e.stopPropagation() para que no se cierre el modal si tocas un botón.
    }

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
            scene.add(model);

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
            cameraZ *= 1.6; 

            camera.position.set(0, 0, cameraZ);
            camera.lookAt(0, 0, 0);
            controls.update();
        },
        undefined,
        (error) => { console.error("Error cargando modelo:", error); }
    );

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Resize
    new ResizeObserver(() => {
        if (!container) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    }).observe(container);
}