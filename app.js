const serverInitialize = require("./server");
const config = require("./config");
const { logger } = require("./logger");

(async () => {
  try {
    /* ====== Start Server ====== */
    const server = await serverInitialize();
    return server.listen(config.PORT, (request, result) => {
      logger(`Starting Server on port ${config.PORT}`);
      logger(`Debug mode ${process.env.DEBUG ? "ON" : "OFF"}`);
    });
  } catch (e) {
    // Deal with the fact the chain failed
  }
})();
