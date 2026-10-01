const https = require('https');

function searchPexels(query) {
  return new Promise((resolve) => {
    const req = https.get(
      'https://www.pexels.com/search/' + encodeURIComponent(query) + '/',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          const matches =
            d.match(
              /https:\/\/images\.pexels\.com\/photos\/[0-9]+\/pexels-photo-[0-9]+\.jpeg\?[^"'<> ]+/g
            ) || [];
          const clean = [...new Set(matches)].map((u) => {
            return u.split('?')[0] + '?auto=compress&cs=tinysrgb&w=700';
          });
          resolve(clean);
        });
      }
    );
    req.on('error', () => resolve([]));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

async function run() {
  console.log('Testing Pexels search queries:');
  const queries = ['chicken curry', 'paneer tikka', 'biryani', 'noodles', 'gulab jamun'];
  for (const q of queries) {
    const res = await searchPexels(q);
    console.log(q, '->', res.length, res[0] || 'none');
  }
}

run();
