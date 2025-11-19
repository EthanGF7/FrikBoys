// ../JS/main.js
document.addEventListener('DOMContentLoaded', () => {
  const rails = document.querySelectorAll('.rail');

  rails.forEach(rail => {
    const track = rail.querySelector('.rail__track');
    const prev = rail.querySelector('.rail__btn--prev');
    const next = rail.querySelector('.rail__btn--next');

    if (!track || !prev || !next) return;

    const scrollBy = () => Math.max(250, track.clientWidth * 0.6);

    prev.addEventListener('click', () => {
      track.scrollBy({ left: -scrollBy(), behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
      track.scrollBy({ left: scrollBy(), behavior: 'smooth' });
    });

    // Arrastrar con ratón para UX suave
    let isDown = false, startX = 0, scrollLeft = 0;
    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.classList.add('grabbing');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('grabbing'); });
    track.addEventListener('mouseup', () => { isDown = false; track.classList.remove('grabbing'); });
    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2;
      track.scrollLeft = scrollLeft - walk;
    });
  });
});
