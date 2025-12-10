// Importamos la lista de productos y la función del visor
import { productos } from './Productos.js';
import { cargarModelo } from './threeViewer.js';
import { addToCart } from './cart.js';

// ==================== GALERÍA ====================
const gallery = document.getElementById('gallery');

// Renderizar las tarjetas
if (gallery) {
    // 1. Filtramos primero los productos de Marvel
    const marvelProducts = productos.filter(p => p.categoria === 'marvel');

    // 2. Generamos el HTML (Sustituyendo la IMG por el DIV del modelo)
    marvelProducts.forEach(p => {
        const card = `
            <div class="product-card" data-id="${p.id}">
                <div id="preview-${p.id}" class="card-model-preview"></div>
                <h3>${p.nombre}</h3>
                <p class="precio">${p.precio.toFixed(2)} €</p>
                <button class="btn-ver">Ver modelo 3D</button>
            </div>
        `;
        gallery.insertAdjacentHTML('beforeend', card);
    });

    // 3. Cargamos los modelos en miniatura (Modo Preview = true)
    marvelProducts.forEach(p => {
        cargarModelo(`preview-${p.id}`, p.modelo, true);
    });
}

// ==================== MODAL ====================
// Crear el HTML del modal si no existe
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
            
            // Guardar producto actual
            window.currentProduct = prod;
            
            // Mostrar Modal
            modal.style.display = 'block';

            // INICIAR EL VISOR 3D CENTRALIZADO (Modo Full = false)
            // Usamos requestAnimationFrame para asegurar que el modal ya es visible y tiene tamaño
            requestAnimationFrame(() => {
                cargarModelo('visor3d', prod.modelo, false);
            });
        }
    });
}

// Cerrar Modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('visor3d').innerHTML = '';
});

window.addEventListener('click', e => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.getElementById('visor3d').innerHTML = '';
    }
});

// Botón Carrito
document.getElementById('btn-carrito').addEventListener('click', () => {
  if(window.currentProduct){
    addToCart(window.currentProduct);
    alert(`${window.currentProduct.nombre} añadido al carrito.`);
  }
  modal.style.display = 'none';
});