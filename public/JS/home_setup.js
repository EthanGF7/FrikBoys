// public/JS/home_setup.js

// Importamos los datos de los productos y la función para cargar modelos
import { productos } from './Productos.js';
import { cargarModelo } from './threeViewer.js';

// --- CONFIGURACIÓN DEL CARRUSEL ---
// Aquí defines qué productos quieres mostrar en el carrusel de la página principal.
// Simplemente pon los 'id' de los productos que están en tu archivo Productos.js
const featuredProductIds = [
    "corazon-ironman",    // Marvel
    "pelota-futbol",      // Fútbol
    "sable-luke"          // Star Wars
];

// Función principal que se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.rail__track');
    if (!track) return; // Si no hay carrusel, no hacemos nada

    // 1. Limpiamos el carrusel por si había contenido de ejemplo en el HTML
    track.innerHTML = '';

    // 2. Buscamos los productos completos a partir de sus IDs
    const featuredProducts = featuredProductIds
        .map(id => productos.find(p => p.id === id))
        .filter(p => p); // Filtramos por si algún ID no se encontró

    // 3. Generamos el HTML de cada tarjeta y lo añadimos al carrusel
    featuredProducts.forEach(prod => {
        const cardHTML = `
            <article class="card" data-id="${prod.id}">
                <!-- Contenedor para el modelo 3D en lugar de la <img> -->
                <div id="carousel-model-${prod.id}" class="card-model-preview"></div>
                
                <div class="card__meta">
                    <h3 class="card__title">${prod.nombre}</h3>
                    <!-- El enlace ahora apunta a la página de categoría correcta -->
                    <a class="card__link" href="Pag${prod.categoria.charAt(0).toUpperCase() + prod.categoria.slice(1)}.html">Ver detalles</a>
                </div>
            </article>
        `;
        track.insertAdjacentHTML('beforeend', cardHTML);
    });

    // 4. Una vez que el HTML está en la página, cargamos los modelos 3D
    featuredProducts.forEach(prod => {
        if (prod.modelo) {
            cargarModelo(`carousel-model-${prod.id}`, prod.modelo, true); // true = modo preview
        }
    });
});