// Regression tests — Bug: alert duplicati per la stessa condizione
//
// Approccio black-box: i test interagiscono esclusivamente tramite UI,
// senza conoscere nomi di impianti, ID o stato interno dello store.
//
// Con il bug originale ogni tick in condizione di sottoproduzione aggiungeva
// un nuovo alert di soglia. Con la fix l'alert di soglia viene emesso una sola
// volta per periodo continuativo di sottoproduzione.

describe('Deduplicazione Alert — Regressione Bug', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173')
    // Login come responsabile (unico ruolo che vede il pannello alert)
    cy.get('[data-cy="login-user-1"]').click()
    cy.url().should('include', '/dashboard')
  })

  // ✅ POSITIVO – nessun messaggio di alert è identico a un altro già presente nel pannello
  it('[POSITIVO] Nessun alert ha un messaggio duplicato dopo molti tick', () => {
    // 25 tick: abbondanti per far scattare soglie e alert predittivi su qualunque impianto
    Cypress._.times(25, () => cy.get('[data-cy="sim-tick-btn"]').click())

    cy.get('[data-cy="alerts-panel"]').should('be.visible')

    cy.get('[data-cy="alert-item"]').then($items => {
      // Ogni alert mostra: badge tipo + messaggio + orario
      // Usiamo solo il testo del messaggio (secondo <span> dentro il flex) per il confronto
      const messages = [...$items].map(el => {
        // Il testo completo dell'item; rimuoviamo spazi extra per normalizzare
        return el.innerText.replace(/\s+/g, ' ').trim()
      })
      const unique = new Set(messages)
      expect(messages.length, 'nessun alert duplicato nel pannello').to.equal(unique.size)
    })
  })

  // ❌ NEGATIVO – il conteggio degli alert di soglia (threshold) non deve crescere
  //              dopo che la condizione è già stata segnalata
  it('[NEGATIVO] Il conteggio degli alert di soglia rimane stabile dopo il primo trigger', () => {
    // Eseguiamo abbastanza tick da far scattare almeno un alert di soglia
    Cypress._.times(10, () => cy.get('[data-cy="sim-tick-btn"]').click())

    cy.get('[data-cy="alerts-panel"]').should('be.visible')

    // Contiamo gli alert di tipo "threshold" visibili in questo momento
    cy.get('[data-cy="alert-item"]')
      .filter(':contains("threshold")')
      .its('length')
      .as('thresholdCountBaseline')

    // Eseguiamo altri 15 tick: la stessa condizione persiste per gli stessi impianti
    Cypress._.times(15, () => cy.get('[data-cy="sim-tick-btn"]').click())

    // Il numero di alert threshold non deve essere aumentato
    cy.get('@thresholdCountBaseline').then(baseline => {
      cy.get('[data-cy="alert-item"]')
        .filter(':contains("threshold")')
        .should('have.length', baseline)
    })
  })

})
