// Importamos la lista de productos y la función del visor
import { productos } from './Productos.js';
import { cargarModelo } from './threeViewer.js';
import { addToCart } from './cart.js';

const gallery = document.getElementById('gallery');

// ==================== GALERÍA (con previews 3D) ====================
if (gallery) {
    // 1. Primero generamos todo el HTML de las tarjetas
    const starWarsProducts = productos.filter(p => p.categoria === 'starwars');
    
    starWarsProducts.forEach(p => {
        // En lugar de <img>, usamos un div con un ID único para el modelo
        const card = `
            <div class="product-card" data-id="${p.id}">
                <div id="preview-${p.id}" class="card-model-preview"></div>
                <h3>${p.nombre}</h3>
                <p class="precio">${p.precio.toFixed(2)} €</p>
                <button class="btn-ver">Ver detalles</button>
            </div>
        `;
        gallery.insertAdjacentHTML('beforeend', card);
    });

    // 2. Una vez que el HTML existe en el DOM, cargamos los modelos en bucle
    starWarsProducts.forEach(p => {
        // Llamamos a cargarModelo en modo PREVIEW (true)
        // Esto cargará el modelo sin botones y rotando
        cargarModelo(`preview-${p.id}`, p.modelo, true);
    });
}

// ==================== MODAL ====================
// Crear el HTML del modal si no existe (o puedes tenerlo fijo en el HTML)
if (!document.getElementById('modal')) {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="modal" class="modal">
      <div class="modal-content">
        <span class="close">×</span>
        <div class="modal-grid">
          <!-- Contenedor para el 3D -->
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
const closeModal = document.querySelector('.close');

// ==================== EVENTOS ====================

// Abrir Modal al hacer click en una tarjeta
if (gallery) {
    gallery.addEventListener('click', e => {
        // Detectar si el click fue dentro de una tarjeta
        const card = e.target.closest('.product-card');
        if (!card) return;

        const id = card.dataset.id;
        const prod = productos.find(p => p.id === id);

        if (prod) {
            // Llenar datos
            document.getElementById('modal-nombre').textContent = prod.nombre;
            document.getElementById('modal-precio').textContent = prod.precio.toFixed(2) + ' €';
            document.getElementById('modal-desc').textContent = prod.descripcion;
          // Guardar producto actual para usar en el botón "Añadir al carrito"
          window.currentProduct = prod;
            
            // Mostrar Modal
            modal.style.display = 'block';

            // INICIAR EL VISOR 3D CENTRALIZADO
            // Le pasamos el ID del div y la ruta del modelo
            // Ejecutamos en el siguiente frame para asegurar tamaños calculados
            requestAnimationFrame(() => {
                cargarModelo('visor3d', prod.modelo, false);
            });
        }
    });
}

// Cerrar Modal
if (closeModal) {
  closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
      // Limpiar el contenedor 3D
      const v = document.getElementById('visor3d');
      if (v) v.innerHTML = '';
  });
}

window.addEventListener('click', e => {
    if (e.target === modal) {
        modal.style.display = 'none';
        const v = document.getElementById('visor3d');
        if (v) v.innerHTML = '';
    }
});

// Botón Carrito
const btnCarrito = document.getElementById('btn-carrito');
if (btnCarrito) {
  btnCarrito.addEventListener('click', () => {
    if(window.currentProduct){
      addToCart(window.currentProduct);
      alert(`${window.currentProduct.nombre} añadido al carrito.`);
    }
    modal.style.display = 'none';
    const v = document.getElementById('visor3d');
    if (v) v.innerHTML = '';
  });
}