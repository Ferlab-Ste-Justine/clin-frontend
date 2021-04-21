describe('Patient Search', () => {
  it.skip('should load the page', () => {
    cy.start('/');

    cy.findByText('Patients et prescriptions').should('be.visible');
    cy.get('.bp3-table-cell .ant-checkbox-input').should('have.length', 25);
  });
});
