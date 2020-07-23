var _ = require('lodash');

function Action(type, status, start_date) {
  _.extend(this, {
    type: type,
    status: status,
    start_date: start_date
  });
}

module.exports = Action;