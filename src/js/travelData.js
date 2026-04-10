export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'culture', label: 'Culture' },
  { id: 'food', label: 'Food' },
  { id: 'coastal', label: 'Coastal' },
  { id: 'nature', label: 'Nature' },
  { id: 'budget', label: 'Budget' },
  { id: 'family', label: 'Family' }
];

export const ORIGIN_AIRPORTS = [
  { code: 'JFK', city: 'New York' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'ATL', city: 'Atlanta' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'DFW', city: 'Dallas' }
];

export const DESTINATIONS = [
  {
    airportCode: 'LIS',
    baseFlightPrice: 560,
    bestMonths: 'Apr-Jun, Sep-Oct',
    blurb: 'Sunlit viewpoints, tiled streets, and easy day trips make Lisbon an approachable city break.',
    city: 'Lisbon',
    country: 'Portugal',
    id: 'lisbon',
    region: 'Europe',
    slug: 'lisbon',
    tagline: 'Atlantic light, late dinners, and tram climbs.',
    tags: ['culture', 'food', 'coastal', 'budget']
  },
  {
    airportCode: 'CDG',
    baseFlightPrice: 680,
    bestMonths: 'Apr-Jun, Sep-Nov',
    blurb: 'Paris blends iconic landmarks with neighborhoods that still reward wandering without a plan.',
    city: 'Paris',
    country: 'France',
    id: 'paris',
    region: 'Europe',
    slug: 'paris',
    tagline: 'Museums, cafe terraces, and river walks.',
    tags: ['culture', 'food', 'family']
  },
  {
    airportCode: 'HND',
    baseFlightPrice: 940,
    bestMonths: 'Mar-May, Oct-Nov',
    blurb: 'Tokyo pairs intense city energy with quiet shrines, excellent transit, and unmatched food culture.',
    city: 'Tokyo',
    country: 'Japan',
    id: 'tokyo',
    region: 'Asia',
    slug: 'tokyo',
    tagline: 'Neon districts, precision transit, and hidden calm.',
    tags: ['culture', 'food', 'family']
  },
  {
    airportCode: 'AMS',
    baseFlightPrice: 645,
    bestMonths: 'Apr-Jun, Sep-Oct',
    blurb: 'Amsterdam is compact, bike-friendly, and strong for museum days mixed with relaxed canal evenings.',
    city: 'Amsterdam',
    country: 'Netherlands',
    id: 'amsterdam',
    region: 'Europe',
    slug: 'amsterdam',
    tagline: 'Canals, galleries, and slow mornings.',
    tags: ['culture', 'family', 'budget']
  },
  {
    airportCode: 'YVR',
    baseFlightPrice: 520,
    bestMonths: 'May-Sep',
    blurb: 'Vancouver balances urban comfort with direct access to mountains, water, and scenic day trips.',
    city: 'Vancouver',
    country: 'Canada',
    id: 'vancouver',
    region: 'North America',
    slug: 'vancouver',
    tagline: 'Forest edges, city views, and outdoor range.',
    tags: ['nature', 'family', 'coastal']
  },
  {
    airportCode: 'SIN',
    baseFlightPrice: 880,
    bestMonths: 'Feb-Apr',
    blurb: 'Singapore is efficient, food-driven, and ideal for travelers who want a polished base in Southeast Asia.',
    city: 'Singapore',
    country: 'Singapore',
    id: 'singapore',
    region: 'Asia',
    slug: 'singapore',
    tagline: 'Garden architecture, hawker centers, and easy logistics.',
    tags: ['food', 'family', 'culture']
  }
];

export function findDestinationById(destinationId) {
  return DESTINATIONS.find((destination) => destination.id === destinationId);
}