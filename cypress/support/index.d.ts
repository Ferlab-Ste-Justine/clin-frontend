/* eslint-disable @typescript-eslint/no-unused-vars */
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to visit a page and log to clin
     * @example cy.start('/')
     */
     start(path: string): Chainable<Element>
  }
}
