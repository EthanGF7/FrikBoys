// public/JS/home_setup.js

// Importamos los datos de los productos y la función para cargar modelos
import { productos } from './Productos.js';
import { cargarModelo } from './threeViewer.js';

// --- CONFIGURACIÓN DEL CARRUSEL ---
const featuredProductIds = [
    "corazon-ironman",
    "pelota-futbol",
    "sable-luke"
];

// ======================================================================
// FUNCIÓN DEL CARRUSEL (Lógica de carousel.js movida aquí)
// ======================================================================
function initializeCarousel() {
    const track = document.querySelector('.rail__track');
    if (!track) return;

    // AHORA SÍ: Seleccionamos los elementos DESPUÉS de haberlos creado.
    const cards = Array.from(track.querySelectorAll('.card'));
    const prevButton = document.querySelector('.rail__btn.left');
    const nextButton = document.querySelector('.rail__btn.right');

    // Si por alguna razón no hay tarjetas, ocultamos los botones y salimos.
    if (cards.length === 0) {
        if (prevButton) prevButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
        return;
    }

    let centerIndex = 0;
    const cardGap = 16; // 1rem

    function updateCarousel(newIndex) {
        if (newIndex < 0) {
            newIndex = cards.length - 1;
        } else if (newIndex >= cards.length) {
            newIndex = 0;
        }
        centerIndex = newIndex;

        const centeredCard = cards[centerIndex];
        
        cards.forEach((card, index) => {
            card.classList.remove('card--center', 'card--side');
            if (index === centerIndex) {
                card.classList.add('card--center');
            } else {
                card.classList.add('card--side');
            }
        });

        const cardWidth = centeredCard.offsetWidth;
        const scrollPosition = (centerIndex * (cardWidth + cardGap)) - (track.offsetWidth / 2) + (cardWidth / 2);

        track.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    // Event Listeners para los botones
    prevButton.addEventListener('click', () => {
        updateCarousel(centerIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        updateCarousel(centerIndex + 1);
    });

    // Event Listeners para las tarjetas
    cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (index !== centerIndex) {
                e.preventDefault();
                updateCarousel(index);
            }
        });
    });

    // Inicializar el carrusel al cargar la página
    updateCarousel(centerIndex);
}


// ======================================================================
// EJECUCIÓN PRINCIPAL
// ======================================================================
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.rail__track');
    if (!track) return;

    // 1. Limpiamos el carrusel
    track.innerHTML = '';

    // 2. Buscamos los productos y generamos el HTML
    const featuredProducts = featuredProductIds
        .map(id => productos.find(p => p.id === id))
        .filter(p => p);

    featuredProducts.forEach(prod => {
        const cardHTML = `
            <article class="card" data-id="${prod.id}">
                <div id="carousel-model-${prod.id}" class="card-model-preview"></div>
                <div class="card__meta">
                    <h3 class="card__title">${prod.nombre}</h3>
                    <a class="card__link" href="Pag${prod.categoria.charAt(0).toUpperCase() + prod.categoria.slice(1)}.html">Ver detalles</a>
                </div>
            </article>
        `;
        track.insertAdjacentHTML('beforeend', cardHTML);
    });

    // 3. Cargamos los modelos 3D en las tarjetas recién creadas
    featuredProducts.forEach(prod => {
        if (prod.modelo) {
            cargarModelo(`carousel-model-${prod.id}`, prod.modelo, true);
        }
    });

    // 4. ¡AHORA SÍ! Una vez que todo está creado, inicializamos la animación del carrusel.
    initializeCarousel();
});