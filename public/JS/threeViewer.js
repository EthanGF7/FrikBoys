// public/JS/threeViewer.js
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

/**
 * Función principal para cargar modelos 3D.
 * @param {string} containerId - ID del div donde va el visor.
 * @param {string} rutaModelo - Ruta del archivo .glb/.gltf.
 * @param {boolean} esPreview - Si es true, carga modo tarjeta (sin botones, transparente). Si es false, modo modal completo.
 */
export function cargarModelo(containerId, rutaModelo, esPreview = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Limpieza y Configuración Inicial
    container.innerHTML = ''; 
    container.style.position = 'relative';

    // Variables de estado específicas para esta instancia
    let animationId;
    let isZoomMode = false;
    let isHandMode = false;
    
    // Límites de Zoom (se calcularán al cargar el modelo)
    let limitNormalMin = 0;
    let limitNormalMax = 0;
    let limitLupaMin = 0;
    let limitLupaMax = 0;

    // ==========================================
    // 2. CREACIÓN DE BOTONES (Solo si NO es preview)
    // ==========================================
    let btnLeft, btnRight, btnZoom, btnHand;

    if (!esPreview) {
        // Flecha Izquierda
        btnLeft = document.createElement('button');
        btnLeft.className = 'control-btn btn-left';
        btnLeft.innerHTML = `<svg class="icon-arrow" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`; 

        // Flecha Derecha
        btnRight = document.createElement('button');
        btnRight.className = 'control-btn btn-right';
        btnRight.innerHTML = `<svg class="icon-arrow" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`; 

        // Lupa (Zoom)
        btnZoom = document.createElement('button');
        btnZoom.className = 'control-btn btn-zoom';
        btnZoom.title = "Modo Inspección (Zoom)";
        btnZoom.innerHTML = `<svg class="icon-zoom" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

        // Mano (Paneo)
        btnHand = document.createElement('button');
        btnHand.className = 'control-btn btn-hand';
        btnHand.title = "Mover Modelo (Mano)";
        btnHand.innerHTML = `
            <svg class="icon-hand" viewBox="0 0 24 24">
                <path d="M18 9c0-.55-.45-1-1-1s-1 .45-1 1v5.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V6c0-.55-.45-1-1-1s-1 .45-1 1v7.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V5c0-.55-.45-1-1-1s-1 .45-1 1v8.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V7c0-.55-.45-1-1-1s-1 .45-1 1v8.65c0 2.49 1.46 4.69 3.63 5.75l.12.06.6.29c.14.07.29.1.45.1 1.63 0 3.09-1.03 3.59-2.58l.75-2.26c.26-.79.4-1.61.4-2.43V9zM9 13.97V19l-3.23-1.62C4.7 16.85 4 15.65 4 14.28c0-.65.25-1.27.71-1.73l.66-.66c.26-.26.66-.3.96-.1l2.67 1.78v.4z"/>
            </svg>`;

        container.appendChild(btnLeft);
        container.appendChild(btnRight);
        container.appendChild(btnZoom);
        container.appendChild(btnHand);
    }

    // ==========================================
    // 3. ESCENA, CÁMARA Y RENDERER
    // ==========================================
    const scene = new THREE.Scene();
    
    // Si es preview (carta), fondo transparente. Si es modal, fondo gris.
    if (!esPreview) {
        scene.background = new THREE.Color(0x404545); 
    } else {
        scene.background = null; // Transparencia
    }

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // alpha: true es clave para la transparencia en las cartas
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding; 
    container.appendChild(renderer.domElement);

    // ==========================================
    // 4. LUCES (Igual que versión vieja)
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // ==========================================
    // 5. CONTROLES (OrbitControls)
    // ==========================================
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;

    // Configuración según el modo
    if (esPreview) {
        // --- CONFIGURACIÓN CARTA (PREVIEW) ---
        controls.autoRotateSpeed = -4.0; // Gira más rápido
        controls.enableZoom = false;     
        controls.enablePan = false;      
        controls.enableRotate = false;   // Desactivamos interacción manual para no molestar al scroll
    } else {
        // --- CONFIGURACIÓN MODAL ---
        controls.autoRotateSpeed = -2.0; 
        controls.enablePan = false; // Por defecto false, se activa con el botón Mano
    }

    // ==========================================
    // 6. LÓGICA DE BOTONES (Solo Modal)
    // ==========================================
    if (!esPreview) {

        // --- Rotación Manual (Flechas) ---
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

        btnLeft.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); rotateHorizontal('left'); });
        btnRight.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); rotateHorizontal('right'); });

        // --- Botón Zoom ---
        btnZoom.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isZoomMode = !isZoomMode;

            if (isZoomMode) {
                btnZoom.classList.add('active');
                controls.autoRotate = false;
                controls.minDistance = limitLupaMin; 
                controls.maxDistance = limitLupaMax;
            } else {
                btnZoom.classList.remove('active');
                // Si no estamos en modo mano, volvemos a rotar
                if (!isHandMode) controls.autoRotate = true;
                controls.minDistance = limitNormalMin;
                controls.maxDistance = limitNormalMax;
            }
        });

        // --- Botón Mano ---
        btnHand.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isHandMode = !isHandMode;

            if (isHandMode) {
                // ACTIVAR MANO
                btnHand.classList.add('active');
                controls.enablePan = true;  
                controls.autoRotate = false; 
                
                // Mapeo avanzado de ratón
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.PAN,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.ROTATE
                };
                controls.touches = {
                    ONE: THREE.TOUCH.PAN,
                    TWO: THREE.TOUCH.DOLLY_PAN
                };
            } else {
                // DESACTIVAR MANO
                btnHand.classList.remove('active');
                controls.enablePan = false; 
                controls.target.set(0, 0, 0); // Recentrar

                // Restaurar mapeo normal
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.ROTATE,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.PAN
                };
                controls.touches = {
                    ONE: THREE.TOUCH.ROTATE,
                    TWO: THREE.TOUCH.DOLLY_PAN
                };

                if (!isZoomMode) controls.autoRotate = true;
            }
        });
    }

    // ==========================================
    // 7. CARGA DEL MODELO Y CÁLCULOS
    // ==========================================
    const loader = new GLTFLoader();
    loader.load(
        rutaModelo,
        (gltf) => {
            const model = gltf.scene;
            
            // Centrar modelo
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            model.position.x += (model.position.x - center.x);
            model.position.y += (model.position.y - center.y);
            model.position.z += (model.position.z - center.z);
            scene.add(model);

            // Cálculos de cámara
            const maxDim = Math.max(size.x, size.y, size.z);
            const minDim = Math.min(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const aspectRatio = maxDim / minDim;

            let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
            cameraZ *= 1.6; // Un poco de aire

            // Configuración inicial de cámara
            camera.position.set(0, 0, cameraZ);
            camera.lookAt(0, 0, 0);

            // Solo calculamos límites complejos si NO es preview
            if (!esPreview) {
                limitNormalMin = cameraZ * 0.5;  
                limitNormalMax = cameraZ * 1.5;  

                // Lógica inteligente para Espada vs Pelota
                if (aspectRatio > 3) { 
                    limitLupaMin = maxDim * 0.2; 
                } else { 
                    limitLupaMin = maxDim * 0.65; 
                }
                limitLupaMax = cameraZ * 3.0;

                // Aplicar límites iniciales
                controls.minDistance = limitNormalMin;
                controls.maxDistance = limitNormalMax;
            }

            controls.update();
        },
        undefined,
        (error) => { console.error("Error cargando:", error); }
    );

    // ==========================================
    // 8. BUCLE DE ANIMACIÓN
    // ==========================================
    function animate() {
        // Guardamos el ID en una variable local para poder cancelarla si hiciera falta
        // (aunque en este diseño cada contenedor se gestiona solo)
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // ==========================================
    // 9. RESPONSIVE (ResizeObserver)
    // ==========================================
    const resizeObserver = new ResizeObserver(() => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if(width && height) {
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    });
    resizeObserver.observe(container);
}