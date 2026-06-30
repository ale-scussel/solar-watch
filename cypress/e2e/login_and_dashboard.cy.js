describe('SolarWatch QA Test', () => {
  it('Esegue il login come Responsabile e visualizza la dashboard', () => {
    // Visita l'homepage
    cy.visit('http://localhost:5173')

    // Verifica che ci sia il testo di benvenuto
    cy.contains('Benvenuto in SolarWatch').should('be.visible')

    // Trova l'utente Admin (id: 1) e clicca per fare login
    cy.get('[data-cy="login-user-1"]').click()

    // Verifica che l'URL sia cambiato in /dashboard
    cy.url().should('include', '/dashboard')

    // Verifica che il menu contenga i link per il Responsabile
    cy.contains('Dashboard').should('be.visible')
    cy.contains('Storico').should('be.visible')
    cy.contains('Report').should('be.visible')
    cy.contains('Admin').should('be.visible')

    // Verifica che ci sia almeno un impianto nella lista
    cy.get('[data-cy^="plant-card-"]').should('have.length.at.least', 1)
    
    // Simula l'avanzamento del tempo cliccando sul devtool 6 volte (30 minuti) per triggerare un alert
    for(let i=0; i<7; i++) {
        cy.get('[data-cy="sim-tick-btn"]').click()
    }
    
    // Verifica che appaia il pannello degli alert
    cy.get('[data-cy="alerts-panel"]').should('be.visible')
  })
})
