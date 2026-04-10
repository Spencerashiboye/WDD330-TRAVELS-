function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function setupEventHandlers(handlers) {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }

    const { action, destinationId, flightId, filter, scrollTarget, term } = button.dataset;

    if (scrollTarget) {
      scrollToSection(scrollTarget);
    }

    if (action === 'filter') {
      handlers.onFilterChange(filter);
    }

    if (action === 'select-destination') {
      handlers.onDestinationSelect(destinationId);
    }

    if (action === 'favorite-destination') {
      handlers.onDestinationFavorite(destinationId);
    }

    if (action === 'favorite-flight') {
      handlers.onFlightFavorite(flightId);
    }

    if (action === 'compare-flight') {
      handlers.onFlightCompare(flightId);
    }

    if (action === 'remove-compare') {
      handlers.onFlightCompare(flightId);
    }

    if (action === 'plan-flight') {
      handlers.onPlanFlight(destinationId);
    }

    if (action === 'recent-search') {
      handlers.onSearchTerm(term);
    }

    if (action === 'clear-compare') {
      handlers.onCompareClear();
    }

    if (button.id === 'surprise-button') {
      handlers.onSurprise();
    }
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id === 'destination-search-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      handlers.onSearchTerm(String(formData.get('destinationSearch') ?? '').trim());
    }

    if (event.target.id === 'flight-search-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      handlers.onFlightSearch({
        origin: String(formData.get('origin') ?? ''),
        destination: String(formData.get('destination') ?? ''),
        departureDate: String(formData.get('departureDate') ?? ''),
        travelers: Number(formData.get('travelers') ?? '1'),
        cabin: String(formData.get('cabin') ?? 'economy')
      });
    }
  });
}