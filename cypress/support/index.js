import './commands';

// Ignore uncaught exception so tests doesn't stop mid run
Cypress.on('uncaught:exception', () => false);

afterEach(() => {
  cy.get('.userName > .ant-dropdown-trigger', { timeout: 10000 }).click()
    .get('.ant-dropdown-menu-item > :nth-child(1)', { timeout: 10000 }).click();
});
