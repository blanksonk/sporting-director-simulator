// Pass 1 stub — returns empty array. Pass 2 will scrape SoFIFA here.
exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify([]),
});
