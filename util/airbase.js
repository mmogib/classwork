const Airtable = require("airtable");
Airtable.configure({
  // endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

module.exports = (base) => Airtable.base(base);
