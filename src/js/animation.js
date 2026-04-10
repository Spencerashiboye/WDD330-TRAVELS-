export function animateCards(container) {
  if (!container) {
    return;
  }

  const cards = container.querySelectorAll('[data-animate-card]');
  cards.forEach((card, index) => {
    card.classList.remove('is-visible');
    card.style.setProperty('--delay', `${index * 70}ms`);
    window.requestAnimationFrame(() => {
      card.classList.add('is-visible');
    });
  });
}

export function pulseElement(element) {
  if (!element) {
    return;
  }

  element.classList.remove('pulse');
  void element.offsetWidth;
  element.classList.add('pulse');
}