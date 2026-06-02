describe('Header', () => {
  it('always displays the app title', () => {
    cy.visit('/login');
    cy.get('.header h1').should('have.text', 'DataShare');
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
    // beforeEach(() => {
    //   // TODO: replace with real session setup once auth is implemented
    // });

    // it('shows "Mon espace"', () => {
    //   cy.get('.header-btn').should('have.text', 'Mon espace');
    // });

    // it('navigates to /mon-espace on button click', () => {
    //   cy.get('.header-btn').click();
    //   cy.url().should('include', '/mon-espace');
    // });
  });
});
