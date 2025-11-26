// public/JS/threeViewer.js
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

let animationId = null;
let renderer = null;

export function cargarModelo(containerId, rutaModelo) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`El contenedor #${containerId} no existe.`);
        return;
    }

    //Limpieza
    if (renderer) {
        if (animationId) cancelAnimationFrame(animationId);
        container.innerHTML = ''; 
        renderer = null;
    }

    //Escena
    const scene = new THREE.Scene();
    
    // Color de fondo gris oscuro
    scene.background = new THREE.Color(0x404040); 

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.outputEncoding = THREE.sRGBEncoding; 
    
    container.appendChild(renderer.domElement);

    // Luz ambiental suave 
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Luz Principal 
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    // Luz de relleno 
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // --- CONTROLES ---
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // Suavizado del movimiento (inercia)
    controls.enableDamping = true;
    
    // Rotación automática (si no tocas nada)
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Esto impide mover el modelo fuera del centro 
    controls.enablePan = false;

    //Velocidad de giro al arrastrar con el ratón
    controls.rotateSpeed = 0.4; 

    //Limitar el zoom 
    controls.minDistance = 35;
    controls.maxDistance = 50;

    //Cargar modelo
    const loader = new GLTFLoader();
    
    loader.load(
        rutaModelo,
        (gltf) => {
            const model = gltf.scene;

            // Centrado y escalado del modelo automaticamente
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
            console.error('Error cargando el modelo:', error);
            container.innerHTML = '<p style="color:white; text-align:center; padding-top:20px;">Error al cargar modelo 3D</p>';
        }
    );

    //Animacion
    function animate() {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    //Responsive
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