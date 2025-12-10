document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.rail__track');
    const cards = Array.from(track.querySelectorAll('.card'));
    const prevButton = document.querySelector('.rail__btn.left');
    const nextButton = document.querySelector('.rail__btn.right');

    // Índice de la tarjeta actualmente centrada. Empezamos con la primera (0).
    let centerIndex = 0;
    const cardGap = 16; // 1rem en píxeles (basado en tu CSS: gap: 1rem)

    /**
     * Mueve el carrusel y actualiza las clases para el efecto de centrado grande.
     * @param {number} newIndex - El índice de la tarjeta que debe centrarse.
     */
    function updateCarousel(newIndex) {
        // Asegurar que el índice esté dentro de los límites
       if (newIndex < 0) {
            newIndex = cards.length - 1;
        } 
        // 2. Si el índice es mayor o igual al número total de tarjetas (estamos en el último y damos a Siguiente),
        //    volvemos al primer elemento (0).
        else if (newIndex >= cards.length) {
            newIndex = 0;
        }
        centerIndex = newIndex;

        // 1. Eliminar la clase de centrado de todas las tarjetas
        cards.forEach(card => card.classList.remove('card--center', 'card--side'));

        // 2. Aplicar la clase de centrado a la tarjeta actual
        const centeredCard = cards[centerIndex];
        centeredCard.classList.add('card--center');

        // 3. Aplicar la clase 'side' a los elementos no centrados para el hover
        cards.forEach((card, index) => {
            if (index !== centerIndex) {
                card.classList.add('card--side');
            }
        });

        // 4. Calcular el desplazamiento (scroll) para centrar la tarjeta
        // Obtenemos el ancho de la tarjeta. En tu CSS, el ancho no es fijo,
        // así que usamos el ancho real calculado por el navegador.
        const cardWidth = centeredCard.offsetWidth;
        
        // La mitad de la tarjeta más el espacio de los huecos a la izquierda
        const scrollPosition = (centerIndex * (cardWidth + cardGap)) - (track.offsetWidth / 2) + (cardWidth / 2);

        // Aplicamos el scroll con un desplazamiento suave (smooth)
        track.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });

        // 5. Deshabilitar los botones si llegamos a los límites
        prevButton.disabled = false;
        nextButton.disabled = false;
    }

    // Inicializar el carrusel al cargar la página
    updateCarousel(centerIndex);

    // Event Listeners para los botones de control
    prevButton.addEventListener('click', () => {
        updateCarousel(centerIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        updateCarousel(centerIndex + 1);
    });

    // Opcional: Centrar la tarjeta si se hace click en alguna tarjeta lateral
    cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (index !== centerIndex) {
                e.preventDefault(); // Evita que el enlace se active inmediatamente
                updateCarousel(index);
            }
        });
    });
});