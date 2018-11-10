
const server = require('./lib/server');

const init = function(){
  server.init();
};

init();

module.exports = {
    init: init,
};