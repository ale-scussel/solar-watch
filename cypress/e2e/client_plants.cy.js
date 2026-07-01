describe('Isolamento Impianti Cliente (US2)', () => {
  it('Verifica che il Cliente A veda solo i propri impianti (3 su 5)', () => {
    cy.visit('http://localhost:5173')

    // Login Cliente A (id: 3)
    cy.get('[data-cy="login-user-3"]').click()
    cy.url().should('include', '/dashboard')

    // Cliente A ha 3 impianti: Roma, Napoli, Serra Firenze
    cy.get('[data-cy^="plant-card-"]').should('have.length', 3)
    cy.contains('Impianto Roma').should('be.visible')
    cy.contains('Impianto Napoli').should('be.visible')
    cy.contains('Serra Firenze').should('be.visible')

    // Non deve vedere Milano o Torino
    cy.contains('Impianto Milano').should('not.exist')
    cy.contains('Impianto Torino').should('not.exist')

    // Logout
    cy.get('[data-cy="logout-btn"]').click()
  })

  it('Verifica che il Cliente B veda solo i propri impianti (2 su 5)', () => {
    cy.visit('http://localhost:5173')

    // Login Cliente B (id: 4)
    cy.get('[data-cy="login-user-4"]').click()
    cy.url().should('include', '/dashboard')

    // Cliente B ha 2 impianti: Milano, Torino
    cy.get('[data-cy^="plant-card-"]').should('have.length', 2)
    cy.contains('Impianto Milano').should('be.visible')
    cy.contains('Impianto Torino').should('be.visible')

    // Non deve vedere Roma, Napoli, Serra Firenze
    cy.contains('Impianto Roma').should('not.exist')
    cy.contains('Impianto Napoli').should('not.exist')
    cy.contains('Serra Firenze').should('not.exist')
  })
})
