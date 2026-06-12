const API_BASE = 'http://localhost:8000';

describe('MonEspace', () => {
  beforeEach(() => {
    cy.intercept('GET', `${API_BASE}/files`, {
      statusCode: 200,
      body: [
        {
          id: 1,
          token: 'tok-abc123',
          originalName: 'rapport.pdf',
          size: 2_500_000,
          mimeType: 'application/pdf',
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          expired: false,
          passwordProtected: false,
          tags: [],
          createdAt: new Date().toISOString(),
        },
      ],
    }).as('getFiles');

    cy.loginAs('/mon-espace');
    cy.wait('@getFiles');
  });

  it('renders the page heading', () => {
    cy.get('h2').should('have.text', 'Mes fichiers');
  });

  describe('responsive layout', () => {
    it('shows mobile header and hides desktop header on mobile viewport', () => {
      cy.viewport(375, 812);
      cy.get('.mon-espace-header').should('be.visible');
      cy.get('.hamburger-btn').should('be.visible');
      cy.get('.mon-espace-desktop-header').should('not.be.visible');
    });

    it('shows desktop header and hides mobile header on desktop viewport', () => {
      cy.viewport(1280, 800);
      cy.get('.mon-espace-desktop-header').should('be.visible');
      cy.contains('Ajouter des fichiers').should('be.visible');
      cy.contains('Déconnexion').should('be.visible');
      cy.get('.mon-espace-header').should('not.be.visible');
    });
  });
});
