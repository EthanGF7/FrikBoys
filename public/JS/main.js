import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- BÚSQUEDA DE ELEMENTOS DEL DOM ---

const canvasContainer = document.querySelector('#canvas-container');
const canvas = document.querySelector('#modelo3d-canvas');

// Si no encuentra el canvas, detiene la ejecución para no dar errores
if (!canvas) {
    throw new Error('No se encontró el elemento canvas con id "modelo3d-canvas"');
}

// --- CONFIGURACIÓN DE LA ESCENA ---

const scene = new THREE.Scene();

// La cámara se ajustará al tamaño del contenedor, no de la ventana completa
const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true // Fondo transparente para que use el del CSS
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

// La ruta es la misma que antes, correcta desde tu archivo HTML
const modelPath = 'public\3dModels\StarWars\espadalaser_yoda.glb';

loader.load(
  modelPath,
  (gltf) => {
    const model = gltf.scene;
    // Centrar el modelo para que rote sobre su propio eje
    new THREE.Box3().setFromObject(model).getCenter(model.position).multiplyScalar(-1);
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('Un error ocurrió al cargar el modelo:', error);
  }
);

// --- ANIMACIÓN Y RESPONSIVIDAD ---

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Observador para reajustar el canvas si su contenedor cambia de tamaño
new ResizeObserver(() => {
    const { clientWidth, clientHeight } = canvasContainer;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
}).observe(canvasContainer);

// Inicia la animación
animate();