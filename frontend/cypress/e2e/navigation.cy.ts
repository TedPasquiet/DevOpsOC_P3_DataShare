describe('Navigation', () => {
  it('redirects "/" to "/login"', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('redirects unknown paths to "/login"', () => {
    cy.visit('/unknown-route');
    cy.url().should('include', '/login');
  });

  it('renders the login page content at "/login"', () => {
    cy.visit('/login');
    cy.contains('Tu veux partager un fichier ?').should('be.visible');
    cy.get('.header-btn').should('have.text', 'Se connecter');
  });

  it('renders MonEspace at "/mon-espace"', () => {
    cy.visit('/mon-espace');
    cy.get('h1').should('have.text', 'Mon Espace');
  });
});
