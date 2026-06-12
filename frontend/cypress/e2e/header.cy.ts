const API_BASE = 'http://localhost:8000';

describe('Header', () => {
  it('always displays the app title', () => {
    cy.visit('/login');
    cy.get('.header-title-btn').should('have.text', 'DataShare');
  });

  context('when the user is logged out', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('shows "Se connecter"', () => {
      cy.get('.header-btn').should('have.text', 'Se connecter');
    });

    it('opens the auth modal on button click', () => {
      cy.get('.header-btn').click();
      cy.get('.modal-backdrop').should('be.visible');
    });
  });

  context('when the user is logged in', () => {
    beforeEach(() => {
      cy.intercept('GET', `${API_BASE}/files`, { statusCode: 200, body: [] }).as('getFiles');
      cy.loginAs('/login');
    });

    it('shows "Mon espace"', () => {
      cy.get('.header-btn').should('have.text', 'Mon espace');
    });

    it('navigates to /mon-espace on button click', () => {
      cy.get('.header-btn').click();
      cy.wait('@getFiles');
      cy.url().should('include', '/mon-espace');
      cy.get('h2').should('have.text', 'Mes fichiers');
    });
  });
});
