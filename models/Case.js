var _ = require('lodash');

function Case(caseId, location, start_date) {
  _.extend(this, {
    caseId: caseId,
    location: location,
    start_date: start_date
  });
}

module.exports = Case;