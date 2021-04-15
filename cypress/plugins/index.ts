require('dotenv').config();

module.exports = (on: Cypress.PluginEvents, config: Cypress.ConfigOptions) => {
  if (!config.env) {
    config.env = {};
  }
  config.env.username = process.env.CYPRESS_USERNAME;
  config.env.password = process.env.CYPRESS_PASSWORD;

  return config;
};
