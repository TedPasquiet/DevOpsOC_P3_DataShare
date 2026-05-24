describe('Header', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the app title and the correct auth button', () => {
    cy.get('.header').within(() => {
      cy.get('h1').should('have.text', 'DataShare');
      // App.tsx renders <Header loggedIn={true} />, so we expect "Mon espace"
      cy.get('.header-btn').should('have.text', 'Mon espace');
    });
  });
});
