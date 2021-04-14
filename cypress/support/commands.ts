import '@testing-library/cypress/add-commands';

// Add Custom commands here and their types in `./index.d.ts`

Cypress.Commands.add('start', (path: string) => {
  cy.viewport('macbook-13');
  cy.visit(path);

  cy.findByLabelText(/email address/i).type(Cypress.env('username'));
  cy.findByLabelText(/password/i).type(Cypress.env('password'));
  cy.get('button[type="submit"]').click();

  cy.intercept('https://patient.qa.clin.ferlab.bio/patient/search').as('search-request');
  cy.wait('@search-request');
  cy.findByText('Patients').should('be.visible');
  return cy;
});

Cypress.Commands.add('logout', () => {
  cy.get('.userName > .ant-dropdown-trigger', { timeout: 10000 }).click()
    .get('.ant-dropdown-menu-item > :nth-child(1)', { timeout: 10000 }).click();
});
