var context = require.context('./app/tests', true, /.+\.spec\.jsx?$/);
context.keys().forEach(context);
module.exports = context;
