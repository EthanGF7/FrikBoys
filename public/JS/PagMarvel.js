// public/JS/PagMarvel.js  ← VERSIÓN COMPLETA Y AUTÓNOMA (funciona con doble clic)
const marvelProducts = [
  {
    id: "corazon-ironman",
    nombre: "Reactor Arc – Corazón de Iron Man",
    precio: 84.99,
    imagen: "public/Models3D/Marvel/preview_corazon.jpg",
    modelo: "../Models3D/Marvel/corazonIronman.glb",
    descripcion: "Réplica exacta del reactor de arco que mantiene con vida a Tony Stark. Impreso en 3D con detalle extremo y acabado metálico brillante."
  },
  
];

// ==================== GALERÍA ====================
const main = document.querySelector('main');
let gallery = document.getElementById('gallery');
if (!gallery) {
  gallery = document.createElement('section');
  gallery.id = 'gallery';
  gallery.className = 'gallery';
  main.appendChild(gallery);
}

marvelProducts.forEach(p => {
  const card = `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
      <h3>${p.nombre}</h3>
      <p class="precio">${p.precio.toFixed(2)} €</p>
      <button class="btn-ver">Ver modelo 3D</button>
    </div>
  `;
  gallery.insertAdjacentHTML('beforeend', card);
});

// ==================== MODAL ====================
if (!document.getElementById('modal')) {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="modal" class="modal">
      <div class="modal-content">
        <span class="close">×</span>
        <div class="modal-grid">
          <div id="visor3d" class="visor3d"></div>
          <div class="info">
            <h2 id="modal-nombre"></h2>
            <p id="modal-precio" class="precio"></p>
            <p id="modal-desc"></p>
            <button id="btn-carrito" class="btn-carrito">Añadir al carrito</button>
          </div>
        </div>
      </div>
    </div>
  `);
}
const modal = document.getElementById('modal');

// ==================== VISOR 3D ====================
// Cargamos Three.js + GLTFLoader + OrbitControls dinámicamente
let threeLoaded = false;
function cargarThreeSiNoEsta() {
  if (threeLoaded) return;
  threeLoaded = true;

  const s1 = document.createElement('script');
  s1.src = 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.min.js';
  s1.onload = () => {
    const s2 = document.createElement('script');
    s2.src = 'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/js/loaders/GLTFLoader.min.js';
    s2.onload = () => {
      const s3 = document.createElement('script');
      s3.src = 'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/js/controls/OrbitControls.min.js';
      document.head.appendChild(s3);
    };
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
}

function cargarModelo(containerId, rutaModelo) {
  cargarThreeSiNoEsta();
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<p style="color:white; text-align:center; padding:2rem;">Cargando modelo 3D...</p>';

  setTimeout(() => { // Damos tiempo a que se carguen los scripts
    if (typeof THREE === 'undefined') {
      container.innerHTML = '<p style="color:red;">Error cargando Three.js</p>';
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const loader = new THREE.GLTFLoader();
    loader.load(rutaModelo,
      gltf => {
        const model = gltf.scene;
        scene.add(model);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / maxDim;
        model.scale.multiplyScalar(scale);
        model.position.copy(center).multiplyScalar(-scale);
      },
      undefined,
      err => {
        container.innerHTML = `<p style="color:red;">Modelo no encontrado<br>${rutaModelo}</p>`;
        console.error(err);
      }
    );

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }, 500);
}

// ==================== EVENTOS ====================
gallery.addEventListener('click', e => {
  const card = e.target.closest('.product-card');
  if (!card) return;
  const id = card.dataset.id;
  const prod = marvelProducts.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('modal-nombre').textContent = prod.nombre;
  document.getElementById('modal-precio').textContent = prod.precio.toFixed(2) + ' €';
  document.getElementById('modal-desc').textContent = prod.descripcion;
  cargarModelo('visor3d', prod.modelo);
  modal.style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

document.getElementById('btn-carrito').addEventListener('click', () => {
  const nombre = document.getElementById('modal-nombre').textContent;
  const precio = document.getElementById('modal-precio').textContent;
  alert(`${nombre} añadido al carrito por ${precio}`);
  modal.style.display = 'none';
});