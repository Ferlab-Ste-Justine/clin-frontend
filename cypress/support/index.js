import './commands';

// Ignore uncaught exception so tests doesn't stop mid run
Cypress.on('uncaught:exception', () => false);

before(() => {
  cy.start('/', true);
});

after(() => {
  cy.logout();
});
