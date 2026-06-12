/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Simulates an authenticated session by seeding `localStorage` with a JWT
       * before the app loads, and stubbing `GET /users/me`. Visits `path`.
       */
      loginAs(path: string, email?: string): Chainable<void>;
    }
  }
}

const API_BASE = 'http://localhost:8000';

Cypress.Commands.add('loginAs', (path: string, email = 'user@test.com') => {
  cy.intercept('GET', `${API_BASE}/users/me`, {
    statusCode: 200,
    body: { id: 1, email, createdAt: '2025-01-01T00:00:00.000Z' },
  }).as('getMe');

  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('jwt', 'fake-jwt-token');
    },
  });

  cy.wait('@getMe');
});

export {};
