const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat('en-US');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${dateString}T00:00:00`));
}

function renderEmptyState(title, copy) {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(copy)}</p>
    </div>
  `;
}

export function renderFilterChips(filters, activeFilter) {
  return filters
    .map(
      (filter) => `
        <button
          type="button"
          class="chip${filter.id === activeFilter ? ' is-active' : ''}"
          data-action="filter"
          data-filter="${escapeHtml(filter.id)}"
          aria-pressed="${String(filter.id === activeFilter)}"
        >
          ${escapeHtml(filter.label)}
        </button>
      `
    )
    .join('');
}

export function renderRecentSearches(searches) {
  if (!searches.length) {
    return '';
  }

  return `
    <p>Recent searches</p>
    ${searches
      .map(
        (term) => `
          <button type="button" class="chip" data-action="recent-search" data-term="${escapeHtml(term)}">
            ${escapeHtml(term)}
          </button>
        `
      )
      .join('')}
  `;
}

export function renderDestinationGrid(destinations, favorites, detailsMap, selectedId) {
  if (!destinations.length) {
    return renderEmptyState('No matches found', 'Try a broader search or clear the active filter.');
  }

  return destinations
    .map((destination) => {
      const isFavorite = favorites.some((item) => item.id === destination.id);
      const details = detailsMap[destination.id];
      const visual = details?.imageUrl
        ? `<img src="${details.imageUrl}" alt="${escapeHtml(destination.city)} city view" />`
        : `
          <div class="destination-fallback">
            <div>
              <strong>${escapeHtml(destination.city)}</strong>
              <p>${escapeHtml(destination.tagline)}</p>
            </div>
          </div>
        `;

      return `
        <article class="destination-card${destination.id === selectedId ? ' is-selected' : ''}" data-animate-card>
          <div class="destination-visual">${visual}</div>
          <div class="destination-body">
            <div class="destination-meta">
              <div>
                <p class="section-kicker">${escapeHtml(destination.region)}</p>
                <h3 class="card-title">${escapeHtml(destination.city)}, ${escapeHtml(destination.country)}</h3>
              </div>
              <button
                type="button"
                class="icon-button${isFavorite ? ' is-active' : ''}"
                data-action="favorite-destination"
                data-destination-id="${escapeHtml(destination.id)}"
                aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                aria-pressed="${String(isFavorite)}"
              >
                ${isFavorite ? '★' : '☆'}
              </button>
            </div>

            <p>${escapeHtml(destination.blurb)}</p>
            <div class="destination-tags">
              ${destination.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="card-actions">
              <button type="button" class="card-button primary-button" data-action="select-destination" data-destination-id="${escapeHtml(destination.id)}">
                View details
              </button>
              <button type="button" class="card-button ghost-button" data-action="plan-flight" data-destination-id="${escapeHtml(destination.id)}">
                Plan route
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

export function renderDestinationDetails(destination, details, isFavorite) {
  if (!destination) {
    return renderEmptyState('Choose a destination', 'Selecting a card loads destination details here.');
  }

  if (!details) {
    return renderEmptyState('Loading destination details', 'Fetching the latest travel context for this city.');
  }

  const facts = [
    ['Capital', details.countryFacts?.capital ?? 'Not listed'],
    ['Currency', details.countryFacts?.currency ?? 'Not listed'],
    ['Languages', details.countryFacts?.languages ?? 'Not listed'],
    ['Population', numberFormatter.format(details.countryFacts?.population ?? 0)],
    ['Best Months', destination.bestMonths],
    ['Airport', destination.airportCode]
  ];

  return `
    <article class="detail-card">
      <div class="detail-media">
        ${details.imageUrl ? `<img src="${details.imageUrl}" alt="${escapeHtml(destination.city)} skyline or cityscape" />` : ''}
      </div>
      <div class="detail-body">
        <div class="detail-topline">
          <div>
            <p class="section-kicker">${escapeHtml(destination.region)}</p>
            <h3 class="detail-title">${escapeHtml(destination.city)}, ${escapeHtml(destination.country)}</h3>
          </div>
          <button
            type="button"
            class="icon-button${isFavorite ? ' is-active' : ''}"
            data-action="favorite-destination"
            data-destination-id="${escapeHtml(destination.id)}"
            aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
            aria-pressed="${String(isFavorite)}"
          >
            ${isFavorite ? '★' : '☆'}
          </button>
        </div>

        <p class="detail-summary">${escapeHtml(details.summary || details.teleportSummary || destination.blurb)}</p>

        <div class="facts-grid">
          ${facts
            .map(
              ([label, value]) => `
                <div class="fact">
                  <span class="fact-label">${escapeHtml(label)}</span>
                  <strong>${escapeHtml(value)}</strong>
                </div>
              `
            )
            .join('')}
        </div>

        <div>
          <h4>Destination highlights</h4>
          <div class="highlights-grid">
            ${(details.highlights?.length
              ? details.highlights
              : [{ label: 'Travel fit', score: 8.1 }, { label: 'Local flavor', score: 8.4 }])
              .map(
                (highlight) => `
                  <article class="highlight-card">
                    <strong>${escapeHtml(highlight.label)}</strong>
                    <span>${escapeHtml(String(highlight.score))}/10</span>
                  </article>
                `
              )
              .join('')}
          </div>
        </div>

        <div class="card-actions">
          <button type="button" class="primary-button" data-action="plan-flight" data-destination-id="${escapeHtml(destination.id)}">
            Search flights to ${escapeHtml(destination.city)}
          </button>
        </div>
      </div>
    </article>
  `;
}

export function renderFlightDestinationOptions(destinations, selectedId) {
  return destinations
    .map(
      (destination) => `
        <option value="${escapeHtml(destination.id)}"${destination.id === selectedId ? ' selected' : ''}>
          ${escapeHtml(destination.city)}, ${escapeHtml(destination.country)}
        </option>
      `
    )
    .join('');
}

export function renderOriginOptions(origins, selectedCode) {
  return origins
    .map(
      (origin) => `
        <option value="${escapeHtml(origin.code)}"${origin.code === selectedCode ? ' selected' : ''}>
          ${escapeHtml(origin.city)} (${escapeHtml(origin.code)})
        </option>
      `
    )
    .join('');
}

export function renderFlightResults(flights, compareFlights, favoriteFlights) {
  if (!flights.length) {
    return renderEmptyState('No flight search yet', 'Use the planner above to build route options.');
  }

  return `
    <div class="flight-results-grid">
      ${flights
        .map((flight) => {
          const inCompare = compareFlights.some((item) => item.id === flight.id);
          const isFavorite = favoriteFlights.some((item) => item.id === flight.id);

          return `
            <article class="flight-card" data-animate-card>
              <div class="flight-body">
                <div class="price-row">
                  <div>
                    <p class="section-kicker">${escapeHtml(flight.airline)}</p>
                    <h3 class="flight-title">${escapeHtml(flight.originCode)} to ${escapeHtml(flight.destinationCode)}</h3>
                  </div>
                  <strong>${currencyFormatter.format(flight.totalPrice)}</strong>
                </div>
                <p class="flight-summary">${escapeHtml(flight.summary)}</p>
                <div class="route-tags">
                  <span>${escapeHtml(flight.duration)}</span>
                  <span>${escapeHtml(flight.stops)}</span>
                  <span>${escapeHtml(formatDate(flight.departureDate))}</span>
                </div>
                <div class="flight-actions">
                  <button type="button" class="ghost-button" data-action="compare-flight" data-flight-id="${escapeHtml(flight.id)}">
                    ${inCompare ? 'Remove compare' : 'Add compare'}
                  </button>
                  <button type="button" class="ghost-button" data-action="favorite-flight" data-flight-id="${escapeHtml(flight.id)}">
                    ${isFavorite ? 'Saved' : 'Save route'}
                  </button>
                </div>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

export function renderCompare(compareFlights) {
  if (!compareFlights.length) {
    return renderEmptyState('Nothing to compare yet', 'Add up to four routes from the flight results section.');
  }

  return `
    <div class="compare-actions">
      <button type="button" class="ghost-button" data-action="clear-compare">Clear comparison</button>
    </div>
    <div class="compare-grid">
      ${compareFlights
        .map(
          (flight) => `
            <article class="compare-card" data-animate-card>
              <div class="compare-body">
                <div class="compare-heading">
                  <h3 class="compare-title">${escapeHtml(flight.originCode)} to ${escapeHtml(flight.destinationCode)}</h3>
                  <strong>${currencyFormatter.format(flight.totalPrice)}</strong>
                </div>
                <p class="compare-copy">${escapeHtml(flight.summary)}</p>
                <ul class="meta-list">
                  <li>Carrier: ${escapeHtml(flight.airline)}</li>
                  <li>Travel time: ${escapeHtml(flight.duration)}</li>
                  <li>Stops: ${escapeHtml(flight.stops)}</li>
                  <li>Departure: ${escapeHtml(formatDate(flight.departureDate))}</li>
                </ul>
                <button type="button" class="ghost-button" data-action="remove-compare" data-flight-id="${escapeHtml(flight.id)}">
                  Remove route
                </button>
              </div>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

export function renderFavorites(favoriteDestinations, favoriteFlights) {
  if (!favoriteDestinations.length && !favoriteFlights.length) {
    return renderEmptyState('No favorites saved', 'Use the star and save buttons to build a shortlist.');
  }

  return `
    <div class="favorites-grid">
      ${favoriteDestinations
        .map(
          (destination) => `
            <article class="favorite-card" data-animate-card>
              <div class="favorite-body">
                <div class="favorite-heading">
                  <h3 class="favorite-title">${escapeHtml(destination.city)}, ${escapeHtml(destination.country)}</h3>
                  <span class="mini-pill">${escapeHtml(destination.airportCode)}</span>
                </div>
                <p class="favorite-meta">${escapeHtml(destination.blurb)}</p>
              </div>
            </article>
          `
        )
        .join('')}
      ${favoriteFlights
        .map(
          (flight) => `
            <article class="favorite-card" data-animate-card>
              <div class="favorite-body">
                <div class="favorite-heading">
                  <h3 class="favorite-title">${escapeHtml(flight.originCode)} to ${escapeHtml(flight.destinationCode)}</h3>
                  <span class="mini-pill">${currencyFormatter.format(flight.totalPrice)}</span>
                </div>
                <p class="favorite-meta">${escapeHtml(flight.summary)}</p>
              </div>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}