const LS_KEY = 'ds-high-contrast';

describe('High contrast mode', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('is off by default', () => {
    cy.get('html').should('not.have.attr', 'data-high-contrast');
    cy.get('.hc-toggle').should('have.attr', 'aria-pressed', 'false');
  });

  it('toggles high contrast mode on click', () => {
    cy.get('.hc-toggle').click();
    cy.get('html').should('have.attr', 'data-high-contrast', '');
    cy.get('.hc-toggle').should('have.attr', 'aria-pressed', 'true');
    cy.get('.hc-toggle').should('have.class', 'hc-toggle--active');

    cy.get('.hc-toggle').click();
    cy.get('html').should('not.have.attr', 'data-high-contrast');
    cy.get('.hc-toggle').should('have.attr', 'aria-pressed', 'false');
  });

  it('persists the preference across page reloads', () => {
    cy.get('.hc-toggle').click();
    cy.get('html').should('have.attr', 'data-high-contrast', '');
    cy.window().its('localStorage').invoke('getItem', LS_KEY).should('eq', '1');

    cy.reload();

    cy.get('html').should('have.attr', 'data-high-contrast', '');
    cy.get('.hc-toggle').should('have.attr', 'aria-pressed', 'true');
  });

  it('persists when navigating between pages', () => {
    cy.get('.hc-toggle').click();
    cy.get('html').should('have.attr', 'data-high-contrast', '');

    cy.visit('/telechargement');
    cy.get('html').should('have.attr', 'data-high-contrast', '');
    cy.get('.hc-toggle').should('have.attr', 'aria-pressed', 'true');
  });
});
