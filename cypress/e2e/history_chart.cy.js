// Regression tests — Grafico storico impianti (rappresentazione grafica)
//
// Approccio black-box: i test interagiscono esclusivamente tramite UI.
//
// Requisiti verificati:
//  1. Il grafico appare dopo la selezione dell'impianto con dati disponibili.
//  2. I tre pulsanti di configurazione del tipo (Linea, Barre, Torta) sono presenti.
//  3. Il tipo di default è "Linea" (pulsante attivo al caricamento).
//  4. Selezionando "Barre" il pulsante diventa attivo e il canvas è visibile.
//  5. Selezionando "Torta" il pulsante diventa attivo e il canvas è visibile.
//  6. Cambiando il range di date il grafico si aggiorna (canvas rimane visibile).
//  7. [NEGATIVO] Il grafico NON appare se nessun impianto è selezionato.
//  8. [NEGATIVO] Il grafico NON appare se il range di date non contiene dati.

// ── Helpers ───────────────────────────────────────────────────────────────────
function isoDate(date) {
  return date.toISOString().split('T')[0]
}

function loginAndGoToHistory(userSelector = '[data-cy="login-user-1"]') {
  cy.visit('http://localhost:5173')
  cy.get(userSelector).click()
  cy.url().should('include', '/dashboard')
  cy.contains('Storico').click()
  cy.url().should('include', '/history')
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Storico Impianti — Grafico', () => {

  beforeEach(() => {
    loginAndGoToHistory()
  })

  // ❌ NEGATIVO — senza impianto selezionato il grafico non è visibile
  it('[NEGATIVO] Il grafico non viene mostrato se nessun impianto è selezionato', () => {
    cy.get('[data-cy="history-chart"]').should('not.exist')
    cy.get('[data-cy="chart-type-selector"]').should('not.exist')
  })

  // ✅ POSITIVO — dopo la selezione il grafico appare con il canvas
  it('[POSITIVO] Il grafico appare dopo aver selezionato un impianto con dati', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)
    cy.get('[data-cy="history-preset-24m"]').click()

    cy.get('[data-cy="history-chart"]').should('be.visible')
    cy.get('[data-cy="history-chart"] canvas').should('exist')
  })

  // ✅ POSITIVO — i tre pulsanti di tipo sono tutti presenti
  it('[POSITIVO] I pulsanti Linea, Barre e Torta sono tutti presenti nel selettore', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)

    cy.get('[data-cy="chart-type-line"]').should('be.visible').and('contain.text', 'Linea')
    cy.get('[data-cy="chart-type-bar"]').should('be.visible').and('contain.text', 'Barre')
    cy.get('[data-cy="chart-type-pie"]').should('be.visible').and('contain.text', 'Torta')
  })

  // ✅ POSITIVO — il tipo di default al caricamento è "Linea"
  it('[POSITIVO] Il tipo di grafico predefinito è Linea', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)

    // Il pulsante "line" deve avere la classe di stato attivo
    cy.get('[data-cy="chart-type-line"]').should('have.class', 'bg-primary')
    cy.get('[data-cy="chart-type-bar"]').should('not.have.class', 'bg-primary')
    cy.get('[data-cy="chart-type-pie"]').should('not.have.class', 'bg-primary')
  })

  // ✅ POSITIVO — cliccando "Barre" il pulsante diventa attivo
  it('[POSITIVO] Selezionando Barre il pulsante diventa attivo e il canvas rimane visibile', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)
    cy.get('[data-cy="history-preset-24m"]').click()

    cy.get('[data-cy="chart-type-bar"]').click()

    cy.get('[data-cy="chart-type-bar"]').should('have.class', 'bg-primary')
    cy.get('[data-cy="chart-type-line"]').should('not.have.class', 'bg-primary')
    cy.get('[data-cy="history-chart"] canvas').should('exist')
  })

  // ✅ POSITIVO — cliccando "Torta" il pulsante diventa attivo
  it('[POSITIVO] Selezionando Torta il pulsante diventa attivo e il canvas rimane visibile', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)
    cy.get('[data-cy="history-preset-24m"]').click()

    cy.get('[data-cy="chart-type-pie"]').click()

    cy.get('[data-cy="chart-type-pie"]').should('have.class', 'bg-primary')
    cy.get('[data-cy="chart-type-bar"]').should('not.have.class', 'bg-primary')
    cy.get('[data-cy="history-chart"] canvas').should('exist')
  })

  // ✅ POSITIVO — alternare tra tutti e tre i tipi mantiene il canvas visibile
  it('[POSITIVO] Alternare tra tutti e tre i tipi mantiene sempre il canvas visibile', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)
    cy.get('[data-cy="history-preset-24m"]').click()

    cy.get('[data-cy="chart-type-bar"]').click()
    cy.get('[data-cy="history-chart"] canvas').should('exist')

    cy.get('[data-cy="chart-type-pie"]').click()
    cy.get('[data-cy="history-chart"] canvas').should('exist')

    cy.get('[data-cy="chart-type-line"]').click()
    cy.get('[data-cy="history-chart"] canvas').should('exist')
  })

  // ✅ POSITIVO — cambiando il range di date il grafico rimane visibile
  it('[POSITIVO] Cambiando range di date il grafico si aggiorna e rimane visibile', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)
    cy.get('[data-cy="history-preset-24m"]').click()
    cy.get('[data-cy="history-chart"]').should('be.visible')

    cy.get('[data-cy="history-preset-3m"]').click()
    cy.get('[data-cy="history-chart"]').should('be.visible')
    cy.get('[data-cy="history-chart"] canvas').should('exist')
  })

  // ❌ NEGATIVO — range di date futuro non mostra dati né grafico
  it('[NEGATIVO] Con un range di date che non contiene dati il grafico scompare', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)

    // Imposta un range di date nel futuro (nessun dato disponibile)
    const futureFrom = isoDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    const futureTo   = isoDate(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000))

    cy.get('[data-cy="history-date-from"]').invoke('val', futureFrom).trigger('input').trigger('change')
    cy.get('[data-cy="history-date-to"]').invoke('val', futureTo).trigger('input').trigger('change')

    cy.get('[data-cy="history-chart"]').should('not.exist')
    cy.get('[data-cy="history-total-count"]').should('have.text', '0')
  })
})
