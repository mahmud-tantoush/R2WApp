module.exports = {
  logger: (message, logType, err) => {
    const d = new Date(Date.now()).toLocaleString();
    const fullMessage = `[${logType || 'LOG'}]  -  ${d}  -  ${message}`;
    if (logType === 'LOG' || logType == null) console.log(fullMessage);
    if (logType === 'WARNING') console.warn(fullMessage);
    if (logType === 'ERROR') console.error(fullMessage);
    if (err && process.env.NODE_ENV !== 'production') console.error(err);
  },
  logTypes: {
    LOG: 'LOG',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
  },
};
