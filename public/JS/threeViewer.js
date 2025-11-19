// Importamos las librerías directamente (igual que en tu archivo de Star Wars)
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

// Variable global para guardar la referencia a la animación y poder detenerla si cerramos el modal
let animationId = null;
let renderer = null;

export function cargarModelo(containerId, rutaModelo) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`El contenedor #${containerId} no existe.`);
        return;
    }

    // 1. LIMPIEZA: Si ya había un canvas previo, lo borramos para no tener duplicados
    if (renderer) {
        // Cancelar animación anterior
        if (animationId) cancelAnimationFrame(animationId);
        // Limpiar el contenedor
        container.innerHTML = ''; 
        renderer = null;
    }

    // 2. ESCENA BÁSICA
    const scene = new THREE.Scene();
    // Fondo oscuro suave (puedes poner alpha: true en el renderer si prefieres transparente)
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5; // Posición inicial, luego se ajustará automáticamente

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 3. LUCES
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // 4. CONTROLES
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // 5. CARGAR MODELO
    const loader = new GLTFLoader();
    
    loader.load(
        rutaModelo,
        (gltf) => {
            const model = gltf.scene;

            // CENTRADO Y ESCALADO AUTOMÁTICO
            // Esto asegura que el modelo se vea bien sin importar su tamaño original
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // Resetear posición del modelo para que su centro sea (0,0,0)
            model.position.x += (model.position.x - center.x);
            model.position.y += (model.position.y - center.y);
            model.position.z += (model.position.z - center.z);

            // Ajustar la cámara según el tamaño del objeto
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
            cameraZ *= 2.5; // Multiplicador para alejar un poco la cámara
            camera.position.z = cameraZ;

            const minZ = box.min.z;
            const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;
            camera.far = cameraToFarEdge * 3;
            camera.updateProjectionMatrix();

            scene.add(model);
            console.log(`Modelo cargado: ${rutaModelo}`);
        },
        (xhr) => {
            // Progreso (opcional)
            // console.log((xhr.loaded / xhr.total * 100) + '% cargado');
        },
        (error) => {
            console.error('Error cargando el modelo:', error);
            container.innerHTML = '<p style="color:white; text-align:center;">Error al cargar modelo 3D</p>';
        }
    );

    // 6. ANIMACIÓN
    function animate() {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // 7. RESPONSIVE
    // Usamos ResizeObserver para detectar cambios en el contenedor (ej. abrir modal)
    const resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);
}