import '@testing-library/cypress/add-commands';

// Add Custom commands here and their types in `./index.d.ts`

Cypress.Commands.add('start', (path: string, withLogin: boolean = false) => {
  cy.visit(path);
  cy.intercept({
    method: 'GET',
    url: `${Cypress.env('patientFhirUrl')}/search?page=1&size=25&type=prescriptions`,
  }).as('search-request');

  if (withLogin) {
    cy.get('#username').type(Cypress.env('username'));
    cy.get('#password').type(Cypress.env('password'));
    cy.get('button[type="submit"]').click();
  }

  cy.wait('@search-request').its('request.headers.authorization').as('auth-token');
  cy.findByText('Patients et prescriptions').should('be.visible');
  return cy;
});

Cypress.Commands.add('logout', () => {
  cy.get('.userName > :nth-child(1) > .ant-dropdown-trigger', { timeout: 10000 }).click()
    .get('#logout-button', { timeout: 10000 }).click();

  cy.findByText('Enter your credentials to log in').should('be.visible');
  return cy;
});

Cypress.Commands.add('selectItem', (name: string, index: number) => {
  cy.get(`#${name}_list + .rc-virtual-list .ant-select-item-option-content`)
    .eq(index).click();
  return cy;
});

Cypress.Commands.add('deletePatient', (patientId: string) => cy.get('@auth-token').then((token) => {
  cy.request({
    method: 'DELETE',
    url: `https://fhir.qa.clin.ferlab.bio/fhir/Patient/${patientId}`,
    headers: {
      authorization: token,
    },
  }).as('delete-patient');
  cy.wait('@delete-patient');
}));
