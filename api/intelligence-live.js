const PORTS = [
  { id: 'port-hercule', name: 'Port Hercule', city: 'Monaco', path: 'port-hercule', lat: 43.7369, lng: 7.4254, radius: 0.0022, status: 'In port' },
  { id: 'port-vauban', name: 'Port Vauban', city: 'Antibes', path: 'port-vauban', lat: 43.5824, lng: 7.1274, radius: 0.0026, status: 'In port' },
  { id: 'cannes-vieux-port', name: 'Cannes Vieux Port', city: 'Cannes', path: 'cannes-vieux-port', lat: 43.5501, lng: 7.0156, radius: 0.0019, status: 'In port' },
  { id: 'port-canto', name: 'Port Canto', city: 'Cannes', path: 'port-canto', lat: 43.5427, lng: 7.0352, radius: 0.0019, status: 'In port' },
  { id: 'golfe-juan-anchorage', name: 'Golfe-Juan Anchorage', city: 'Golfe-Juan', path: 'golfe-juan-anchorage', lat: 43.5639, lng: 7.0734, radius: 0.0065, status: 'At anchor' },
  { id: 'port-de-saint-tropez', name: 'Port de Saint-Tropez', city: 'Saint-Tropez', path: 'port-de-saint-tropez', lat: 43.2713, lng: 6.6385, radius: 0.0020, status: 'In port' },
  { id: 'port-de-nice', name: 'Port de Nice', city: 'Nice', path: 'port-de-nice', lat: 43.6963, lng: 7.2867, radius: 0.0021, status: 'In port' },
  { id: 'villefranche-anchorage', name: 'Villefranche-sur-Mer Anchorage', city: 'Villefranche-sur-Mer', path: 'villefranche-anchorage', lat: 43.6998, lng: 7.3156, radius: 0.0065, status: 'At anchor' },
  { id: 'port-de-fontvieille', name: 'Port de Fontvieille', city: 'Monaco', path: 'port-de-fontvieille', lat: 43.7284, lng: 7.4168, radius: 0.0016, status: 'In port' }
];

const FALLBACK = [
  ['ATLANTIS II',116,'Port Hercule','Monaco',43.7369,7.4254,'Bermuda'],
  ['DRIZZLE',91,'Port Hercule','Monaco',43.7373,7.4247,'Malta'],
  ['LIONHEART',90,'Port Hercule','Monaco',43.7362,7.4260,'Malta'],
  ['SYNTHESIS',74,'Port Vauban','Antibes',43.5824,7.1274,'Marshall Islands'],
  ['AXIOMA',72,'Port Vauban','Antibes',43.5820,7.1266,'Malta'],
  ['SIBELLE',69,'Port Vauban','Antibes',43.5830,7.1280,'Cayman Islands'],
  ['ARADOS',47,'Cannes Vieux Port','Cannes',43.5501,7.0156,''],
  ['HATT MILL',46,'Cannes Vieux Port','Cannes',43.5496,7.0162,''],
  ["O'LION",42,'Cannes Vieux Port','Cannes',43.5507,7.0149,''],
  ['ARROW',75,'Port Canto','Cannes',43.5427,7.0352,''],
  ['YALLA',73,'Port Canto','Cannes',43.5422,7.0345,''],
  ['WILLOW',42,'Port Canto','Cannes',43.5433,7.0359,''],
  ['PARATI',40,'Golfe-Juan Anchorage','Golfe-Juan',43.5639,7.0734,''],
  ['AB INITIO',40,'Golfe-Juan Anchorage','Golfe-Juan',43.5662,7.0754,''],
  ['MY DADDY SHANE',35,'Golfe-Juan Anchorage','Golfe-Juan',43.5616,7.0716,''],
  ['LUNA',115,'Port de Saint-Tropez','Saint-Tropez',43.2713,6.6385,''],
  ['HANUMAN',42,'Port de Saint-Tropez','Saint-Tropez',43.2708,6.6392,''],
  ['RAINBOW',40,'Port de Saint-Tropez','Saint-Tropez',43.2719,6.6378,''],
  ['CHRISTINA O',99,'Port de Nice','Nice',43.6963,7.2867,''],
  ['QU2',40,'Port de Nice','Nice',43.6969,7.2874,''],
  ['ALALYA',47,'Port de Nice','Nice',43.6957,7.2859,''],
  ['FORCE BLUE',71,'Villefranche-sur-Mer Anchorage','Villefranche-sur-Mer',43.6998,7.3156,''],
  ['RHINO',47,'Villefranche-sur-Mer Anchorage','Villefranche-sur-Mer',43.7020,7.3179,''],
  ['ORAS',40,'Villefranche-sur-Mer Anchorage','Villefranche-sur-Mer',43.6975,7.3130,'']
].map((x, i) => ({
  id: 'fallback-' + i,
  name: x[0], length: x[1], port: x[2], city: x[3], lat: x[4], lng: x[5], flag: x[6],
  status: x[2].includes('Anchorage') ? 'At anchor' : 'In port',
  precision: 'snapshot', source: 'Public AIS-derived harbour snapshot'
}));

function normalizeName(value='') {
  return value.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, '');
}

function hashUnit(value='') {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function coarsePosition(port, name) {
  const a = hashUnit(name + ':a') * Math.PI * 2;
  const r = Math.sqrt(hashUnit(name + ':r')) * port.radius;
  return {
    lat: port.lat + Math.sin(a) * r,
    lng: port.lng + Math.cos(a) * r / Math.cos(port.lat * Math.PI / 180)
  };
}

function decodeEntities(s='') {
  return s
    .replace(/&nbsp;/g,' ')
    .replace(/&amp;/g,'&')
    .replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'")
    .replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>');
}

function htmlToLines(html='') {
  const text = decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi,' ')
      .replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<br\s*\/?>/gi,'\n')
      .replace(/<\/(?:p|div|li|tr|td|th|h1|h2|h3|section)>/gi,'\n')
      .replace(/<[^>]+>/g,' ')
  );
  return text.split(/\n+/).map(x => x.replace(/\s+/g,' ').trim()).filter(Boolean);
}

function parseHarbour(html, port) {
  const lines = htmlToLines(html);
  const here = lines.findIndex(x => /^Here now$/i.test(x));
  if (here < 0) return [];
  let start = lines.findIndex((x, i) => i > here && /^Alongside$/i.test(x));
  if (start < 0) start = here;
  start += 1;
  let end = lines.findIndex((x, i) => i > start && (/^Recent movements$/i.test(x) || /^Together,/i.test(x)));
  if (end < 0) end = lines.length;
  const out = [];
  for (let i = start; i < end - 1; i++) {
    if (!/^\d+(?:\.\d+)?\s*m$/i.test(lines[i + 1] || '')) continue;
    const name = lines[i];
    const length = Number((lines[i + 1].match(/[\d.]+/) || [0])[0]);
    if (!name || !length) continue;
    const flag = lines[i + 2] || '';
    const arrived = lines[i + 3] || '';
    const alongside = lines[i + 4] || '';
    const pos = coarsePosition(port, name);
    out.push({
      id: port.id + '-' + normalizeName(name),
      name, length, flag, arrived, alongside,
      port: port.name, city: port.city, status: port.status,
      lat: pos.lat, lng: pos.lng,
      precision: 'harbour', source: 'Superyacht Watch · AIS-derived harbour status'
    });
    i += 4;
  }
  return out;
}

async function fetchHarbour(port) {
  const url = 'https://superyachtwatch.com/marina/' + port.path;
  const r = await fetch(url, {
    headers: {
      'accept': 'text/html,application/xhtml+xml',
      'user-agent': 'KOMO-Intelligence/1.0 (+private operational dashboard)'
    },
    signal: AbortSignal.timeout(9000)
  });
  if (!r.ok) throw new Error(port.id + ' upstream ' + r.status);
  return parseHarbour(await r.text(), port);
}

async function fetchExactAIS() {
  const key = process.env.VESSELFINDER_API_KEY || process.env.VESSELFINDER_USERKEY;
  if (!key) return { active: false, byName: new Map(), provider: null };
  const url = 'https://api.vesselfinder.com/livedata?userkey=' + encodeURIComponent(key) + '&format=json&interval=120&errormode=409';
  const r = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error('VesselFinder ' + r.status);
  const rows = await r.json();
  if (!Array.isArray(rows)) throw new Error('VesselFinder invalid response');
  const byName = new Map();
  for (const row of rows) {
    const ais = row?.AIS || {};
    const name = normalizeName(ais.NAME || row?.MASTERDATA?.NAME || '');
    if (!name || !Number.isFinite(Number(ais.LATITUDE)) || !Number.isFinite(Number(ais.LONGITUDE))) continue;
    byName.set(name, row);
  }
  return { active: true, byName, provider: 'VesselFinder LiveData' };
}

function enrichWithAIS(yachts, exact) {
  if (!exact.active) return yachts;
  return yachts.map(y => {
    const row = exact.byName.get(normalizeName(y.name));
    if (!row) return y;
    const a = row.AIS || {};
    const m = row.MASTERDATA || {};
    return {
      ...y,
      lat: Number(a.LATITUDE),
      lng: Number(a.LONGITUDE),
      speed: Number.isFinite(Number(a.SPEED)) ? Number(a.SPEED) : null,
      course: Number.isFinite(Number(a.COURSE)) ? Number(a.COURSE) : null,
      heading: Number.isFinite(Number(a.HEADING)) ? Number(a.HEADING) : null,
      destination: a.DESTINATION || '',
      aisTimestamp: a.TIMESTAMP || '',
      imo: a.IMO || m.IMO || null,
      mmsi: a.MMSI || null,
      manager: m.MANAGER || '',
      registeredOwner: m.OWNER || '',
      builder: m.BUILDER || '',
      built: m.BUILT || null,
      precision: 'ais',
      source: 'VesselFinder LiveData + public superyacht harbour index'
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const started = Date.now();
  let harbourResults = [];
  let upstreamErrors = [];

  const settled = await Promise.allSettled(PORTS.map(fetchHarbour));
  for (let i = 0; i < settled.length; i++) {
    const r = settled[i];
    if (r.status === 'fulfilled') harbourResults.push(...r.value);
    else upstreamErrors.push({ port: PORTS[i].name, error: String(r.reason?.message || r.reason) });
  }

  let exact = { active: false, byName: new Map(), provider: null };
  let aisError = null;
  try { exact = await fetchExactAIS(); }
  catch (e) { aisError = String(e?.message || e); }

  let yachts = harbourResults.length ? harbourResults : FALLBACK;
  yachts = enrichWithAIS(yachts, exact)
    .filter(y => Number(y.length) >= 24)
    .sort((a,b) => Number(b.length) - Number(a.length));

  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.status(200).json({
    updatedAt: new Date().toISOString(),
    yachts,
    meta: {
      live: harbourResults.length > 0,
      exactAIS: exact.active,
      exactProvider: exact.provider,
      baseProvider: 'Superyacht Watch public AIS-derived harbour status',
      baseRefresh: 'hourly upstream',
      appRefreshSeconds: 120,
      precision: exact.active ? 'mixed: exact AIS where matched, harbour-level otherwise' : 'harbour-level',
      vesselCount: yachts.length,
      upstreamErrors,
      aisError,
      durationMs: Date.now() - started
    }
  });
}
