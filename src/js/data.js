const FAVORITE_DESTINATIONS_KEY = 'travelHub.favoriteDestinations';
const FAVORITE_FLIGHTS_KEY = 'travelHub.favoriteFlights';
const RECENT_SEARCHES_KEY = 'travelHub.recentSearches';
const COMPARE_FLIGHTS_KEY = 'travelHub.compareFlights';

function readCollection(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredState() {
  return {
    favoriteDestinations: readCollection(FAVORITE_DESTINATIONS_KEY),
    favoriteFlights: readCollection(FAVORITE_FLIGHTS_KEY),
    recentSearches: readCollection(RECENT_SEARCHES_KEY),
    compareFlights: readCollection(COMPARE_FLIGHTS_KEY)
  };
}

export function saveRecentSearch(term) {
  const nextSearches = [term, ...readCollection(RECENT_SEARCHES_KEY).filter((item) => item !== term)].slice(
    0,
    5
  );
  writeCollection(RECENT_SEARCHES_KEY, nextSearches);
  return nextSearches;
}

export function toggleFavoriteDestination(destination) {
  const current = readCollection(FAVORITE_DESTINATIONS_KEY);
  const exists = current.some((item) => item.id === destination.id);
  const next = exists ? current.filter((item) => item.id !== destination.id) : [...current, destination];
  writeCollection(FAVORITE_DESTINATIONS_KEY, next);
  return next;
}

export function toggleFavoriteFlight(flight) {
  const current = readCollection(FAVORITE_FLIGHTS_KEY);
  const exists = current.some((item) => item.id === flight.id);
  const next = exists ? current.filter((item) => item.id !== flight.id) : [...current, flight];
  writeCollection(FAVORITE_FLIGHTS_KEY, next);
  return next;
}

export function toggleCompareFlight(flight) {
  const current = readCollection(COMPARE_FLIGHTS_KEY);
  const exists = current.some((item) => item.id === flight.id);
  const next = exists ? current.filter((item) => item.id !== flight.id) : [...current, flight].slice(0, 4);
  writeCollection(COMPARE_FLIGHTS_KEY, next);
  return next;
}

export function clearCompareFlights() {
  writeCollection(COMPARE_FLIGHTS_KEY, []);
  return [];
}