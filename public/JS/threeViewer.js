// public/JS/threeViewer.js  ← versión SIN módulos (funciona con file://)
function cargarModelo(containerId, rutaModelo) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  // Cargar Three.js y complementos directamente en el <head>
  const scriptThree = document.createElement("script");
  scriptThree.src = "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.min.js";
  scriptThree.onload = () => cargaTodo();
  document.head.appendChild(scriptThree);

  function cargaTodo() {
    const scriptGLTF = document.createElement("script");
    scriptGLTF.src = "https://cdn.jsdelivr.net/npm/three@0.168.0/examples/js/loaders/GLTFLoader.min.js";
    scriptGLTF.onload = () => iniciarVisor();
    document.head.appendChild(scriptGLTF);
  }

  function iniciarVisor() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
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
    loader.load(rutaModelo, (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.5 / maxDim;
      model.scale.multiplyScalar(scale);
      model.position.copy(center).multiplyScalar(-scale);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }
}

// Lo dejamos disponible globalmente
window.cargarModelo = cargarModelo;