const destinationCache = new Map();

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

async function fetchJson(url, errorMessage) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json();
}

async function fetchTeleportImage(slug) {
  const data = await fetchJson(
    `https://api.teleport.org/api/urban_areas/slug:${slug}/images/`,
    'Unable to load Teleport destination images.'
  );

  return {
    imageUrl: data.photos?.[0]?.image?.web ?? '',
    imageAttribution:
      data.photos?.[0]?.attributions?.map((item) => stripHtml(item.attribution)).join(' ') ?? ''
  };
}

async function fetchTeleportScores(slug) {
  const data = await fetchJson(
    `https://api.teleport.org/api/urban_areas/slug:${slug}/scores/`,
    'Unable to load Teleport destination scores.'
  );

  const highlights = (data.categories ?? [])
    .slice()
    .sort((left, right) => right.score_out_of_10 - left.score_out_of_10)
    .slice(0, 4)
    .map((item) => ({
      label: item.name,
      score: Number(item.score_out_of_10.toFixed(1))
    }));

  return {
    teleportSummary: stripHtml(data.summary),
    highlights
  };
}

async function fetchCountryFacts(country) {
  const data = await fetchJson(
    `https://restcountries.com/v3.1/name/${encodeURIComponent(
      country
    )}?fullText=true&fields=name,capital,region,subregion,population,currencies,languages,flags,timezones`,
    'Unable to load country information.'
  );

  const [countryData] = data;
  const firstCurrency = Object.values(countryData.currencies ?? {})[0];

  return {
    countryName: countryData.name?.common ?? country,
    capital: countryData.capital?.[0] ?? 'Not listed',
    region: countryData.region ?? 'Not listed',
    subregion: countryData.subregion ?? 'Not listed',
    population: countryData.population ?? 0,
    currency: firstCurrency
      ? `${firstCurrency.name} (${firstCurrency.symbol ?? 'n/a'})`
      : 'Not listed',
    languages: Object.values(countryData.languages ?? {}).join(', ') || 'Not listed',
    flag: countryData.flags?.svg ?? ''
  };
}

async function fetchCitySummary(city) {
  const data = await fetchJson(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`,
    'Unable to load destination summary.'
  );

  return data.extract ?? '';
}

export async function getDestinationDetails(destination) {
  if (destinationCache.has(destination.id)) {
    return destinationCache.get(destination.id);
  }

  const request = Promise.allSettled([
    fetchTeleportImage(destination.slug),
    fetchTeleportScores(destination.slug),
    fetchCountryFacts(destination.country),
    fetchCitySummary(destination.city)
  ]).then((results) => {
    const [imageResult, scoreResult, countryResult, summaryResult] = results;
    const imageData = imageResult.status === 'fulfilled' ? imageResult.value : {};
    const scoreData = scoreResult.status === 'fulfilled' ? scoreResult.value : {};
    const countryData = countryResult.status === 'fulfilled' ? countryResult.value : {};
    const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : destination.blurb;

    return {
      imageAttribution: imageData.imageAttribution ?? '',
      imageUrl: imageData.imageUrl ?? '',
      summary,
      teleportSummary: scoreData.teleportSummary ?? destination.blurb,
      highlights: scoreData.highlights ?? [],
      countryFacts: countryData
    };
  });

  destinationCache.set(destination.id, request);
  return request;
}

export function prefetchDestinationDetails(destinations) {
  return Promise.allSettled(destinations.map((destination) => getDestinationDetails(destination)));
}