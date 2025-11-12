// MODIFICADO: Importamos Three.js y sus módulos desde un CDN (Skypack)
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

// --- BÚSQUEDA DE ELEMENTOS DEL DOM ---

const canvasContainer = document.querySelector('#canvas-container');
const canvas = document.querySelector('#modelo3d-canvas');

// Si no encuentra el canvas, detiene la ejecución para no dar errores
if (!canvasContainer || !canvas) {
    console.error('No se encontraron los elementos #canvas-container o #modelo3d-canvas. Asegúrate de que están en tu HTML.');
} else {
    // --- CONFIGURACIÓN DE LA ESCENA ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);

    // --- CONTROLES E ILUMINACIÓN ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // --- CARGA DEL MODELO 3D ---
    const loader = new GLTFLoader();
    const modelPath = '../Models3d/StarWars/espadalaser_yoda.glb';

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        new THREE.Box3().setFromObject(model).getCenter(model.position).multiplyScalar(-1);
        scene.add(model);
        console.log("Modelo cargado con éxito!");
      },
      undefined,
      (error) => {
        console.error('Error al cargar el modelo 3D. Verifica que la ruta es correcta:', modelPath, error);
      }
    );

    // --- ANIMACIÓN Y RESPONSIVIDAD ---
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    new ResizeObserver(() => {
        const { clientWidth, clientHeight } = canvasContainer;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight);
    }).observe(canvasContainer);

    animate();
}