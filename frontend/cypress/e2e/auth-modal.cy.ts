describe('AuthModal', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('opens the modal when the header button is clicked', () => {
    cy.get('.header-btn').click();
    cy.get('.modal-backdrop').should('be.visible');
    cy.get('h2').should('have.text', 'Connexion');
  });

  it('login form accepts email and password input', () => {
    cy.get('.header-btn').click();
    cy.get('#login-email').type('user@test.com');
    cy.get('#login-password').type('secret123');
    cy.get('#login-email').should('have.value', 'user@test.com');
    cy.get('#login-password').should('have.value', 'secret123');
  });

  it('switches to the register form', () => {
    cy.get('.header-btn').click();
    cy.contains('button', 'Créer un compte').click();
    cy.get('h2').should('have.text', 'Créer un compte');
    cy.get('#register-email').should('be.visible');
    cy.get('#register-password').should('be.visible');
    cy.get('#register-confirm').should('be.visible');
  });

  it('register form accepts input in all three fields', () => {
    cy.get('.header-btn').click();
    cy.contains('button', 'Créer un compte').click();
    cy.get('#register-email').type('new@test.com');
    cy.get('#register-password').type('pass1234');
    cy.get('#register-confirm').type('pass1234');
    cy.get('#register-email').should('have.value', 'new@test.com');
    cy.get('#register-password').should('have.value', 'pass1234');
    cy.get('#register-confirm').should('have.value', 'pass1234');
  });

  it('switches back to the login form from register', () => {
    cy.get('.header-btn').click();
    cy.contains('button', 'Créer un compte').click();
    cy.contains('button', "J'ai déjà un compte").click();
    cy.get('h2').should('have.text', 'Connexion');
  });

  it('closes when clicking the backdrop', () => {
    cy.get('.header-btn').click();
    cy.get('.modal-backdrop').click({ force: true });
    cy.get('.modal-backdrop').should('not.exist');
  });

  it('does not close when clicking inside the modal card', () => {
    cy.get('.header-btn').click();
    cy.get('.modal-card').click();
    cy.get('.modal-backdrop').should('be.visible');
  });
});
