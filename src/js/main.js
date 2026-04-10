import { animateCards, pulseElement } from './animation.js';
import { getDestinationDetails, prefetchDestinationDetails } from './api.js';
import {
  clearCompareFlights,
  getStoredState,
  saveRecentSearch,
  toggleCompareFlight,
  toggleFavoriteDestination,
  toggleFavoriteFlight
} from './data.js';
import { setupEventHandlers } from './events.js';
import { DESTINATIONS, FILTERS, ORIGIN_AIRPORTS, findDestinationById } from './travelData.js';
import {
  renderCompare,
  renderDestinationDetails,
  renderDestinationGrid,
  renderFavorites,
  renderFilterChips,
  renderFlightDestinationOptions,
  renderFlightResults,
  renderOriginOptions,
  renderRecentSearches
} from './ui.js';

const storageState = getStoredState();

const state = {
  activeFilter: 'all',
  compareFlights: storageState.compareFlights,
  destinationDetails: {},
  favoriteDestinations: storageState.favoriteDestinations,
  favoriteFlights: storageState.favoriteFlights,
  flightResults: [],
  recentSearches: storageState.recentSearches,
  searchTerm: '',
  selectedDestinationId: DESTINATIONS[0].id
};

const elements = {
  compareResults: document.getElementById('compare-results'),
  destinationDetails: document.getElementById('destination-details'),
  destinationGrid: document.getElementById('destination-grid'),
  destinationInput: document.getElementById('destination-input'),
  dateInput: document.getElementById('date-input'),
  favoritesContent: document.getElementById('favorites-content'),
  filterChips: document.getElementById('filter-chips'),
  flightResults: document.getElementById('flight-results'),
  liveRegion: document.getElementById('live-region'),
  originInput: document.getElementById('origin-input'),
  recentSearches: document.getElementById('recent-searches')
};

function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 35);
  return date.toISOString().split('T')[0];
}

function setStatus(message) {
  elements.liveRegion.textContent = '';
  window.requestAnimationFrame(() => {
    elements.liveRegion.textContent = message;
  });
}

function getFilteredDestinations() {
  const normalizedTerm = state.searchTerm.trim().toLowerCase();

  return DESTINATIONS.filter((destination) => {
    const matchesFilter = state.activeFilter === 'all' || destination.tags.includes(state.activeFilter);
    const haystack = `${destination.city} ${destination.country} ${destination.region} ${destination.tags.join(' ')}`.toLowerCase();
    const matchesSearch = !normalizedTerm || haystack.includes(normalizedTerm);
    return matchesFilter && matchesSearch;
  });
}

function seedNumber(seed) {
  return [...seed].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 17), 0);
}

function buildFlightResults({ origin, destination, departureDate, travelers, cabin }) {
  const destinationData = findDestinationById(destination);
  const date = new Date(`${departureDate}T00:00:00`);
  const daysUntilDeparture = Math.max(1, Math.round((date.getTime() - Date.now()) / 86400000));
  const seasonFactor = [1.08, 1.04, 1.02, 0.98, 0.96, 0.94, 0.97, 1.01, 1.05, 1.08, 1.1, 1.12][date.getMonth()];
  const advanceFactor = daysUntilDeparture < 21 ? 1.18 : daysUntilDeparture < 45 ? 1.06 : 0.93;
  const cabinFactor = { economy: 1, premium: 1.34, business: 1.95 }[cabin] ?? 1;

  return [0, 1, 2].map((index) => {
    const seed = seedNumber(`${origin}${destinationData.id}${departureDate}${index}`);
    const airline = ['Aurora Air', 'Meridian Atlantic', 'Sunline', 'Blue Atlas'][seed % 4];
    const stopsCount = seed % 3;
    const totalMinutes = 420 + (seed % 280) + index * 35;
    const totalPrice = Math.round(
      (destinationData.baseFlightPrice + (seed % 110) + index * 48) *
        seasonFactor *
        advanceFactor *
        cabinFactor *
        Math.max(1, travelers * 0.92)
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const duration = `${hours}h ${minutes}m`;
    const stops = stopsCount === 0 ? 'Nonstop' : `${stopsCount} stop${stopsCount > 1 ? 's' : ''}`;
    const summary = `${travelers} traveler${travelers > 1 ? 's' : ''} in ${cabin} from ${origin} to ${destinationData.city} with ${airline}.`;

    return {
      airline,
      departureDate,
      destinationCode: destinationData.airportCode,
      destinationId: destinationData.id,
      duration,
      id: `${origin}-${destinationData.id}-${departureDate}-${cabin}-${index}`,
      originCode: origin,
      stops,
      summary,
      totalPrice
    };
  });
}

function syncFlightForm(destinationId = state.selectedDestinationId) {
  elements.originInput.innerHTML = renderOriginOptions(ORIGIN_AIRPORTS, ORIGIN_AIRPORTS[0].code);
  elements.destinationInput.innerHTML = renderFlightDestinationOptions(DESTINATIONS, destinationId);
  if (!elements.dateInput.value) {
    elements.dateInput.value = getDefaultDate();
  }
}

function renderSearchControls() {
  elements.filterChips.innerHTML = renderFilterChips(FILTERS, state.activeFilter);
  elements.recentSearches.innerHTML = renderRecentSearches(state.recentSearches);
}

function renderDestinations() {
  const filteredDestinations = getFilteredDestinations();
  elements.destinationGrid.innerHTML = renderDestinationGrid(
    filteredDestinations,
    state.favoriteDestinations,
    state.destinationDetails,
    state.selectedDestinationId
  );
  animateCards(elements.destinationGrid);
}

function renderDetails() {
  const destination = findDestinationById(state.selectedDestinationId);
  const isFavorite = state.favoriteDestinations.some((item) => item.id === state.selectedDestinationId);
  elements.destinationDetails.innerHTML = renderDestinationDetails(
    destination,
    state.destinationDetails[state.selectedDestinationId],
    isFavorite
  );
}

function renderFlights() {
  elements.flightResults.innerHTML = renderFlightResults(
    state.flightResults,
    state.compareFlights,
    state.favoriteFlights
  );
  animateCards(elements.flightResults);
}

function renderCompareSection() {
  elements.compareResults.innerHTML = renderCompare(state.compareFlights);
  animateCards(elements.compareResults);
}

function renderFavoritesSection() {
  elements.favoritesContent.innerHTML = renderFavorites(
    state.favoriteDestinations,
    state.favoriteFlights
  );
  animateCards(elements.favoritesContent);
}

function updateAllSections() {
  renderSearchControls();
  renderDestinations();
  renderDetails();
  renderFlights();
  renderCompareSection();
  renderFavoritesSection();
  syncFlightForm();
}

async function loadDestinationDetails(destinationId) {
  const destination = findDestinationById(destinationId);
  if (!destination) {
    return;
  }

  state.selectedDestinationId = destinationId;
  renderDestinations();
  renderDetails();

  if (!state.destinationDetails[destinationId]) {
    const details = await getDestinationDetails(destination);
    state.destinationDetails = {
      ...state.destinationDetails,
      [destinationId]: details
    };
  }

  renderDestinations();
  renderDetails();
}

function toggleDestinationFavorite(destinationId) {
  const destination = findDestinationById(destinationId);
  const details = state.destinationDetails[destinationId];
  state.favoriteDestinations = toggleFavoriteDestination({
    airportCode: destination.airportCode,
    blurb: destination.blurb,
    city: destination.city,
    country: destination.country,
    id: destination.id,
    imageUrl: details?.imageUrl ?? ''
  });
  renderDestinations();
  renderDetails();
  renderFavoritesSection();
  setStatus(`${destination.city} ${
    state.favoriteDestinations.some((item) => item.id === destination.id) ? 'saved to' : 'removed from'
  } favorites.`);
}

function toggleFlightFavorite(flightId) {
  const flight =
    state.flightResults.find((item) => item.id === flightId) ||
    state.compareFlights.find((item) => item.id === flightId);
  if (!flight) {
    return;
  }

  state.favoriteFlights = toggleFavoriteFlight(flight);
  renderFlights();
  renderFavoritesSection();
  setStatus(`Route ${flight.originCode} to ${flight.destinationCode} updated in favorites.`);
}

function toggleFlightCompareState(flightId) {
  const flight =
    state.flightResults.find((item) => item.id === flightId) ||
    state.compareFlights.find((item) => item.id === flightId);
  if (!flight) {
    return;
  }

  state.compareFlights = toggleCompareFlight(flight);
  renderFlights();
  renderCompareSection();
  pulseElement(elements.compareResults.closest('.panel'));
  setStatus(`Route ${flight.originCode} to ${flight.destinationCode} updated in comparison.`);
}

function clearCompareState() {
  state.compareFlights = clearCompareFlights();
  renderFlights();
  renderCompareSection();
  setStatus('Flight comparison cleared.');
}

function handleSearchTerm(term) {
  state.searchTerm = term;
  if (term) {
    state.recentSearches = saveRecentSearch(term);
  }

  const filteredDestinations = getFilteredDestinations();
  if (filteredDestinations[0]) {
    state.selectedDestinationId = filteredDestinations[0].id;
    loadDestinationDetails(filteredDestinations[0].id);
  }

  renderSearchControls();
  renderDestinations();
  setStatus(term ? `Showing destinations matching ${term}.` : 'Showing all destinations.');
}

function handleFilterChange(filterId) {
  state.activeFilter = filterId;
  const filteredDestinations = getFilteredDestinations();
  if (filteredDestinations[0]) {
    loadDestinationDetails(filteredDestinations[0].id);
  } else {
    renderDestinations();
    renderDetails();
  }
  renderSearchControls();
}

function handleFlightSearch(search) {
  state.flightResults = buildFlightResults(search);
  renderFlights();
  pulseElement(elements.flightResults.closest('.panel'));
  setStatus(`Built ${state.flightResults.length} route options to ${findDestinationById(search.destination).city}.`);
}

function handlePlanFlight(destinationId) {
  state.selectedDestinationId = destinationId;
  syncFlightForm(destinationId);
  document.getElementById('flights')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  loadDestinationDetails(destinationId);
}

function handleSurprise() {
  const pool = getFilteredDestinations().length ? getFilteredDestinations() : DESTINATIONS;
  const surprise = pool[Math.floor(Math.random() * pool.length)];
  loadDestinationDetails(surprise.id);
  handlePlanFlight(surprise.id);
  setStatus(`Surprise destination selected: ${surprise.city}.`);
}

function initialize() {
  elements.dateInput.value = getDefaultDate();
  updateAllSections();

  setupEventHandlers({
    onCompareClear: clearCompareState,
    onDestinationFavorite: toggleDestinationFavorite,
    onDestinationSelect: (destinationId) => {
      loadDestinationDetails(destinationId);
      document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    onFilterChange: handleFilterChange,
    onFlightCompare: toggleFlightCompareState,
    onFlightFavorite: toggleFlightFavorite,
    onFlightSearch: handleFlightSearch,
    onPlanFlight: handlePlanFlight,
    onSearchTerm: handleSearchTerm,
    onSurprise: handleSurprise
  });

  loadDestinationDetails(state.selectedDestinationId);

  prefetchDestinationDetails(DESTINATIONS).then((results) => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const destination = DESTINATIONS[index];
        state.destinationDetails = {
          ...state.destinationDetails,
          [destination.id]: result.value
        };
      }
    });

    renderDestinations();
    renderDetails();
  });
}

initialize();