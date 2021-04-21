/* eslint-disable @typescript-eslint/no-unused-vars */
declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to visit a page and log to clin
     * @example cy.start('/')
     * @param path url to visit
     * @param withLogin Only use this in development. Skips the login form if the user is already logged in when creating a test
     */
     start(path: string, withLogin?: boolean): Chainable<Element>

     /**
      * Custom command to log the user out
      */
     logout(): Chainable<Element>

     /**
      *
      * @param name Name of the `Select` given by the `FormItem`. `['file', 'organization']` gives `'file_organization'`
      * @param index based 0 index of the wanted element in the list
      */
     selectItem(name: string, index: number): Chainable<Element>

     /**
      * Sends a delete request for a given patient
      * @param patientId
      */
     deletePatient(patientId: string): Chainable<any>
  }
}
