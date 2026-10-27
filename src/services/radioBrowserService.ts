import { RadioStation } from '../data/radioStations';

const RADIO_BROWSER_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
];

let currentMirrorIndex = 0;

function getApiUrl(endpoint: string): string {
  const base = RADIO_BROWSER_MIRRORS[currentMirrorIndex];
  return `${base}${endpoint}`;
}

function mapApiStationToRadio(s: any): RadioStation {
  return {
    id: `rb-${s.stationuuid}`,
    name: (s.name || '').trim(),
    frequency: s.votes ? `${s.votes} votes • FM/Web` : 'FM / Web',
    genre: s.tags ? s.tags.split(',').slice(0, 2).join(', ') : 'Musique & Info',
    tag: 'regional',
    description: s.homepage || `Station radio diffusée en France (${s.state || 'National'}).`,
    streamUrl: s.url_resolved || s.url,
    coverUrl: s.favicon && s.favicon.startsWith('http') 
      ? s.favicon 
      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    location: s.state ? `${s.state}, France` : 'France',
    bitrate: s.bitrate ? `${s.bitrate} kbps ${s.codec || ''}` : '128 kbps MP3',
    votes: s.votes || 0,
  };
}

export async function searchOnlineFrenchRadios(query: string, limit = 50): Promise<RadioStation[]> {
  const cleanQuery = query.trim();
  const endpoint = cleanQuery
    ? `/json/stations/search?name=${encodeURIComponent(cleanQuery)}&country=France&limit=${limit}&order=votes&reverse=true`
    : `/json/stations/bycountry/France?limit=${limit}&order=votes&reverse=true`;

  for (let attempt = 0; attempt < RADIO_BROWSER_MIRRORS.length; attempt++) {
    try {
      const url = getApiUrl(endpoint);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'VibraApp/1.0',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const stations: any[] = await res.json();
      return stations
        .filter((s) => (s.url_resolved || s.url) && s.name && s.name.trim().length > 0)
        .map(mapApiStationToRadio);
    } catch (err) {
      console.warn(`Radio Browser mirror ${currentMirrorIndex} failed, trying next mirror...`, err);
      currentMirrorIndex = (currentMirrorIndex + 1) % RADIO_BROWSER_MIRRORS.length;
    }
  }

  return [];
}
