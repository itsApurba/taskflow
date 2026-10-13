const cors = require("cors");
const { corsOrigins } = require("./vars");

/** CORS limited to CORS_ORIGIN when it is set, open otherwise (local dev). */
module.exports = cors(corsOrigins.length ? { origin: corsOrigins } : undefined);
