#!/usr/bin/env node
// Downloads all lots from the remote Supabase and saves to data/all-shop-lots.json

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pwihhhbomwxzznekueok.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWhoaGJvbXd4enpuZWt1ZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTgzNjMsImV4cCI6MjA4MTAzNDM2M30.S1aJOnJIdZY8WGVUUAbvMStxR4C5o2-3AkO6GgmkKYY';
const PAGE_SIZE = 1000;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: 'Bearer ' + SUPABASE_KEY,
};

async function get(path) {
  const res = await fetch(SUPABASE_URL + path, { headers });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + path);
  return res.json();
}

async function fetchAllLots() {
  let all = [];
  let offset = 0;
  while (true) {
    process.stdout.write(`\rFetching lots... ${all.length}`);
    const rows = await get(
      `/rest/v1/lots?select=id,slug,title,current_bid,end_time,status,category_id` +
      `&order=end_time.desc&limit=${PAGE_SIZE}&offset=${offset}`
    );
    if (!Array.isArray(rows) || rows.length === 0) break;
    all = all.concat(rows);
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  console.log(`\rFetched ${all.length} lots`);
  return all;
}

async function fetchImages(lotIds) {
  const map = new Map();
  const batchSize = 200;
  for (let i = 0; i < lotIds.length; i += batchSize) {
    const batch = lotIds.slice(i, i + batchSize);
    process.stdout.write(`\rFetching images... ${i}/${lotIds.length}`);
    const rows = await get(
      `/rest/v1/lot_images?select=lot_id,image_url,is_primary,order_position` +
      `&lot_id=in.(${batch.join(',')})` +
      `&order=lot_id.asc&order=is_primary.desc&order=order_position.asc`
    );
    (rows || []).forEach(img => {
      if (!map.has(img.lot_id)) map.set(img.lot_id, img.image_url);
    });
  }
  console.log(`\rFetched images for ${map.size} lots`);
  return map;
}

async function fetchCategories() {
  const rows = await get('/rest/v1/categories?select=id,name&limit=1000');
  const map = new Map();
  (rows || []).forEach(cat => map.set(cat.id, cat.name));
  return map;
}

async function main() {
  console.log('Starting download...');
  const lots = await fetchAllLots();
  const lotIds = lots.map(l => l.id);
  const [imageMap, categoryMap] = await Promise.all([
    fetchImages(lotIds),
    fetchCategories(),
  ]);

  // Assign fake end_times using same deterministic hash as lot-page-render.js resolveEndTime
  // Fixed base: 2026-03-20T00:00:00Z — must match FAKE_END_BASE in lot-page-render.js
  // Base = now, so all lots end 1h–14days from the moment this script runs
  const FAKE_END_BASE = Date.now();

  function fakeEndTime(lotId) {
    let seed = 0;
    const s = String(lotId || '');
    for (let i = 0; i < Math.min(16, s.length); i++) {
      seed = (seed * 31 + s.charCodeAt(i)) & 0x7fffffff;
    }
    const seed2 = (seed * 1664525 + 1013904223) & 0x7fffffff;
    const offsetMs = (1 + (seed % 335)) * 60 * 60 * 1000 + (seed2 % 3600) * 1000;
    return new Date(FAKE_END_BASE + offsetMs).toISOString();
  }

  const activeLots = lots.filter(l => (l.status || '').toLowerCase() === 'active');
  const endedLots  = lots.filter(l => (l.status || '').toLowerCase() !== 'active');

  const result = lots.map(lot => ({
    id: lot.id,
    slug: lot.slug,
    title: lot.title,
    currentBid: lot.current_bid || 0,
    startingBid: lot.current_bid || 0,
    endTime: (lot.status || '').toLowerCase() === 'active' ? fakeEndTime(lot.id) : (lot.end_time || ''),
    image: imageMap.get(lot.id) || 'logo1.svg',
    category: categoryMap.get(lot.category_id) || 'General',
    status: (lot.status || 'active').toLowerCase() === 'active' ? 'active' : 'ended',
  }));

  const outPath = path.join(__dirname, '../data/all-shop-lots.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\nSaved ${result.length} lots to data/all-shop-lots.json`);
  console.log(`Active: ${activeLots.length}, Ended: ${endedLots.length}`);

  // Write slim slug→endTime lookup for lot-page-render.js
  const endTimesMap = {};
  result.forEach(r => { if (r.slug) endTimesMap[r.slug] = r.endTime; });
  const etPath = path.join(__dirname, '../data/lot-end-times.json');
  fs.writeFileSync(etPath, JSON.stringify(endTimesMap));
  console.log(`Saved lot-end-times.json (${Object.keys(endTimesMap).length} entries)`);
}

main().catch(err => { console.error(err); process.exit(1); });
