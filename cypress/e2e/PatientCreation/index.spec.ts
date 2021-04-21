import moment from 'moment';

function buildRAMQ(ramqSuffix: number) {
  const ramqPrefix = 'TESC';
  return `${ramqPrefix}${moment().format('YYMMDD')}${ramqSuffix.toLocaleString('fr-CA', { minimumIntegerDigits: 2 })}`;
}

function buildMRN(mrnSuffix: number) {
  const mrnPrefix = 'CYPRESS';
  return `${mrnPrefix}${moment().format('YYMMDD')}${mrnSuffix.toLocaleString('fr-CA', { minimumIntegerDigits: 2 })}`;
}

describe('e2e: Patient Creation', () => {
  describe('should create a patient', () => {
    // @ts-ignore
    it('with a valid ramq', { retries: 10 }, () => {
      cy.start('/');
      cy.findByText(/nouvelle prescription/i).click();

      const runIndex = Math.floor(Math.random() * 100);
      const ramq = buildRAMQ(runIndex);

      cy.findByLabelText('RAMQ').type(ramq);
      cy.findByLabelText('RAMQ (confirmation)').type(ramq);

      cy.findByLabelText('Nom de famille').type('Test');
      cy.findByLabelText('Prénom').type('Cypress');
      cy.findByTestId('mrn-file').type(buildMRN(runIndex));
      cy.findByTestId('mrn-organization').click();
      cy.selectItem('mrn_organization', 0);
      cy.findByText('Soumettre').click();

      cy.findByText('TEST Cypress').should('be.visible');
      cy.findByText('Fermer').click();
    });
  });

  describe('should create a fetus', () => {
    // @ts-ignore
    it("with the mother's RAMQ", { retries: 10 }, () => {
      cy.start('/');
      cy.findByText(/nouvelle prescription/i).click();

      const runIndex = Math.floor(Math.random() * 100);
      const ramq = buildRAMQ(runIndex);

      cy.findByRole('dialog').findByText('Foetus').click();

      cy.findByLabelText('RAMQ').type(ramq);
      cy.findByLabelText('RAMQ (confirmation)').type(ramq);

      cy.findByLabelText('Nom de famille (mère)').type('Test');
      cy.findByLabelText('Prénom (mère)').type('Cypress');
      cy.findByText('Féminin').click();
      cy.findByTestId('mrn-file').type(buildMRN(runIndex));
      cy.findByTestId('mrn-organization')
        .click()
        .selectItem('mrn_organization', 0);

      cy.findByText('Soumettre').click();

      cy.findByText('TEST Cypress (foetus)').should('be.visible');
      cy.findByText('Fermer').click();
    });
  });
});
