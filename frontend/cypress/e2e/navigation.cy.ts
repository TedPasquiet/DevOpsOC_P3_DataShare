const API_BASE = 'http://localhost:8000';

describe('Navigation', () => {
  it('renders the home page at "/"', () => {
    cy.visit('/');
    cy.contains('Tu veux partager un fichier ?').should('be.visible');
    cy.get('.header-btn').should('have.text', 'Se connecter');
  });

  it('renders the same content at "/login"', () => {
    cy.visit('/login');
    cy.contains('Tu veux partager un fichier ?').should('be.visible');
    cy.get('.header-btn').should('have.text', 'Se connecter');
  });

  it('redirects unknown paths to "/"', () => {
    cy.visit('/unknown-route');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.contains('Tu veux partager un fichier ?').should('be.visible');
  });

  it('redirects "/mon-espace" to "/" when logged out', () => {
    cy.visit('/mon-espace');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });

  it('renders MonEspace at "/mon-espace" when logged in', () => {
    cy.intercept('GET', `${API_BASE}/files`, { statusCode: 200, body: [] }).as('getFiles');
    cy.loginAs('/mon-espace');
    cy.wait('@getFiles');
    cy.get('h2').should('have.text', 'Mes fichiers');
  });
});
