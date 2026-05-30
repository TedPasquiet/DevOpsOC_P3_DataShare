describe('Telechargement', () => {
  context('Fichier protégé — sans mot de passe', () => {
    beforeEach(() => {
      cy.visit('/telechargement?protected=true&days=3');
    });

    it('affiche le titre "Télécharger un fichier"', () => {
      cy.contains('Télécharger un fichier').should('be.visible');
    });

    it('affiche la ligne fichier avec nom et taille', () => {
      cy.get('.telechargement-file-name').should('be.visible');
      cy.get('.telechargement-file-size').should('contain', 'Mo');
    });

    it('affiche le callout info bleu avec le délai d\'expiration', () => {
      cy.contains('Ce fichier expirera dans 3 jours.').should('be.visible');
    });

    it('affiche le champ mot de passe', () => {
      cy.get('input[type="password"]').should('be.visible');
      cy.get('input[type="password"]').should('have.attr', 'placeholder', 'Saisissez le mot de passe...');
    });

    it('le bouton "Télécharger" est disabled tant que le mot de passe est vide', () => {
      cy.contains('button', 'Télécharger').should('be.disabled');
    });
  });

  context('Fichier protégé — avec mot de passe saisi', () => {
    beforeEach(() => {
      cy.visit('/telechargement?protected=true&days=3');
    });

    it('active le bouton "Télécharger" après saisie du mot de passe', () => {
      cy.get('input[type="password"]').type('monmotdepasse');
      cy.contains('button', 'Télécharger').should('not.be.disabled');
    });

    it('désactive à nouveau le bouton si le mot de passe est effacé', () => {
      cy.get('input[type="password"]').type('secret');
      cy.contains('button', 'Télécharger').should('not.be.disabled');
      cy.get('input[type="password"]').clear();
      cy.contains('button', 'Télécharger').should('be.disabled');
    });
  });

  context('Fichier non protégé — expire demain', () => {
    beforeEach(() => {
      cy.visit('/telechargement?protected=false&days=1');
    });

    it('affiche le callout warning orange "Ce fichier expirera demain."', () => {
      cy.contains('Ce fichier expirera demain.').should('be.visible');
    });

    it('n\'affiche pas de champ mot de passe', () => {
      cy.get('input[type="password"]').should('not.exist');
    });

    it('le bouton "Télécharger" est directement actif', () => {
      cy.contains('button', 'Télécharger').should('not.be.disabled');
    });
  });

  context('Fichier expiré', () => {
    beforeEach(() => {
      cy.visit('/telechargement?expired=true');
    });

    it('affiche le callout erreur rouge', () => {
      cy.contains('Ce fichier n\'est plus disponible en téléchargement car il a expiré.').should('be.visible');
    });

    it('n\'affiche pas de ligne fichier', () => {
      cy.get('.telechargement-file-row').should('not.exist');
    });

    it('n\'affiche pas de bouton "Télécharger"', () => {
      cy.contains('button', 'Télécharger').should('not.exist');
    });
  });

  context('Viewport mobile (390×844)', () => {
    beforeEach(() => {
      cy.viewport(390, 844);
    });

    it('affiche la carte avec le titre en large sur mobile (protégé)', () => {
      cy.visit('/telechargement?protected=true&days=3');
      cy.get('.telechargement-card-title').should('be.visible');
      cy.get('.telechargement-card').should('be.visible');
    });

    it('affiche le callout warning en pleine largeur sur mobile', () => {
      cy.visit('/telechargement?protected=false&days=1');
      cy.contains('Ce fichier expirera demain.').should('be.visible');
      cy.contains('button', 'Télécharger').should('not.be.disabled');
    });
  });
});
