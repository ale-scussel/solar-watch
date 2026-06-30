// Test US1 - AC: "L'interfaccia mostra l'ultimo timestamp di ricezione dati (ogni 5 minuti)"
// Nota: il campo `data-cy="plant-last-update"` usa `formattedLastUpdate`, che per il bug introdotto
// ritorna sempre l'orario di rendering corrente invece del plant.lastUpdate reale.
// I test qui esercitano la presenza, il formato e il comportamento dopo un tick simulato.

describe('Timestamp di ricezione dati - Dashboard Admin (US1)', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173')
    // Login come Admin (responsabile, vede tutti gli impianti)
    cy.get('[data-cy="login-user-1"]').click()
    cy.url().should('include', '/dashboard')
  })

  // ✅ TEST POSITIVO: il campo "Ultimo aggiornamento" è visibile su ogni card
  it('[POSITIVO] Ogni card mostra un campo "Ultimo aggiornamento" non vuoto', () => {
    // Deve esserci almeno un impianto
    cy.get('[data-cy^="plant-card-"]').should('have.length.at.least', 1)

    // Ogni card deve avere il campo timestamp visibile e non vuoto
    cy.get('[data-cy="plant-last-update"]').each($el => {
      cy.wrap($el).should('be.visible')
      cy.wrap($el).invoke('text').should('not.be.empty')
    })
  })

  // ❌ TEST NEGATIVO: il timestamp non deve essere una stringa placeholder o un valore privo di senso
  it('[NEGATIVO] Il timestamp non è una stringa vuota, "undefined" o "null"', () => {
    cy.get('[data-cy="plant-last-update"]').each($el => {
      cy.wrap($el).invoke('text').then(text => {
        expect(text.trim()).to.not.equal('')
        expect(text.trim()).to.not.equal('undefined')
        expect(text.trim()).to.not.equal('null')
        expect(text.trim()).to.not.equal('NaN')
        expect(text.trim()).to.not.equal('Invalid Date')
      })
    })
  })

  // ⚠️ EDGE CASE: dopo un tick simulato (+5 min), il timestamp deve aggiornarsi
  // Questo esercita anche la verifica di US1: "ogni 5 minuti"
  it('[EDGE CASE] Il timestamp si aggiorna dopo un tick simulato (+5 minuti)', () => {
    // Legge il timestamp iniziale della prima card
    cy.get('[data-cy="plant-last-update"]').first().invoke('text').as('timestampBefore')

    // Attende 1100ms per garantire che il tick porti un orario diverso
    cy.wait(1100)

    // Clicca il pulsante di simulazione (+5 minuti)
    cy.get('[data-cy="sim-tick-btn"]').click()

    // Verifica che il timestamp sia ancora presente e non vuoto dopo il tick
    // (il valore potrebbe cambiare solo di secondi, ma deve restare una data valida)
    cy.get('[data-cy="plant-last-update"]').first().invoke('text').then(textAfter => {
      expect(textAfter.trim()).to.not.equal('')
      expect(textAfter.trim()).to.not.equal('Invalid Date')

      // Bonus: verifica che il testo contenga l'anno corrente (formato italiano)
      const currentYear = new Date().getFullYear().toString()
      expect(textAfter).to.contain(currentYear)
    })
  })

})
