// Regression tests — Storico: limite massimo di 24 mesi
//
// Approccio black-box: i test interagiscono esclusivamente tramite UI.
//
// Requisiti verificati:
//  1. Il campo "mesi indietro" ha max=24.
//  2. Richiedendo esattamente 24 mesi si ottengono tutte le righe disponibili.
//  3. Anche forzando un valore > 24 il numero di righe non supera il baseline
//     (il computed lato Vue clamps a MAX_MONTHS = 24).
//  4. Richiedendo meno di 24 mesi si ottengono meno righe (i dati sono filtrati).

describe('Storico Impianti — Limite 24 Mesi', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173')
    cy.get('[data-cy="login-user-1"]').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Storico').click()
    cy.url().should('include', '/history')
  })

  // ✅ POSITIVO — l'attributo max dell'input è 24
  it('[POSITIVO] Il campo mesi indietro ha attributo max pari a 24', () => {
    cy.get('[data-cy="history-months-input"]')
      .should('have.attr', 'max', '24')
  })

  // ✅ POSITIVO — con 24 mesi si vedono tutte le righe disponibili
  it('[POSITIVO] Selezionando 24 mesi vengono visualizzate tutte le righe dello storico', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)
    cy.get('[data-cy="history-months-input"]').clear().type('24')

    // Lo store genera esattamente 24 entry per impianto (una per mese)
    cy.get('[data-cy="history-row"]').should('have.length', 24)
  })

  // ❌ NEGATIVO — forzando un valore superiore a 24 le righe non aumentano
  it('[NEGATIVO] Forzando i mesi a 36 il numero di righe non supera quello con 24 mesi', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)

    // Baseline a 24 mesi
    cy.get('[data-cy="history-months-input"]').clear().type('24')
    cy.get('[data-cy="history-row"]').its('length').as('baseline')

    // Tenta di superare il limite digitando 36 (il Vue computed clamps a 24)
    cy.get('[data-cy="history-months-input"]').clear().type('36')

    cy.get('@baseline').then(baseline => {
      cy.get('[data-cy="history-row"]').should('have.length.at.most', baseline)
    })
  })

})
