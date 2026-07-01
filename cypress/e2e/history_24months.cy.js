// Regression tests — Storico: limite massimo di 24 mesi + accesso cliente
//
// Approccio black-box: i test interagiscono esclusivamente tramite UI.
//
// Requisiti verificati:
//  1. Il campo "data inizio" ha attributo min pari a 24 mesi fa.
//  2. Il preset 24M mostra tutte le 24 righe disponibili.
//  3. Impostando dateFrom precedente al minimo il filtro lo clampizza a 24 mesi.
//  4. Il cliente (role: cliente) può accedere allo storico.
//  5. Il cliente vede nel selettore solo i propri impianti.
//  6. Il filtro per intervallo di date restituisce risultati coerenti.

// Helpers ─────────────────────────────────────────────────────────────────────
function isoDate(date) {
  return date.toISOString().split('T')[0]
}

function monthsAgo(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Storico Impianti — Limite 24 Mesi', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173')
    cy.get('[data-cy="login-user-1"]').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Storico').click()
    cy.url().should('include', '/history')
  })

  // ✅ POSITIVO — il campo data-inizio ha min = 24 mesi fa
  it('[POSITIVO] Il campo data inizio ha attributo min pari a 24 mesi fa', () => {
    const expectedMin = isoDate(monthsAgo(24))
    cy.get('[data-cy="history-date-from"]')
      .should('have.attr', 'min', expectedMin)
  })

  // ✅ POSITIVO — il preset 24M mostra tutte le righe disponibili
  it('[POSITIVO] Il preset 24M visualizza tutte le 24 righe dello storico', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)
    cy.get('[data-cy="history-preset-24m"]').click()

    // Lo store genera esattamente 24 entry mensili per impianto
    cy.get('[data-cy="history-total-count"]').should('have.text', '24')
    // Con PAGE_SIZE=20 la prima pagina ha 20 righe
    cy.get('[data-cy="history-row"]').should('have.length', 20)
  })

  // ❌ NEGATIVO — forzando dateFrom oltre il minimo non si ottengono righe extra
  it('[NEGATIVO] Impostando dateFrom oltre 24 mesi il conteggio non supera quello a 24 mesi', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)

    // Baseline con 24 mesi
    cy.get('[data-cy="history-preset-24m"]').click()
    cy.get('[data-cy="history-total-count"]')
      .invoke('text').then(baseline => {

        // Forza dateFrom a 36 mesi fa via invoke (aggira il min HTML)
        cy.get('[data-cy="history-date-from"]')
          .invoke('val', isoDate(monthsAgo(36)))
          .trigger('input')
          .trigger('change')

        cy.get('[data-cy="history-total-count"]')
          .invoke('text')
          .then(after => {
            expect(Number(after)).to.be.at.most(Number(baseline))
          })
      })
  })

  // ✅ POSITIVO — filtro su 3 mesi restituisce meno righe che su 24 mesi
  it('[POSITIVO] Il preset 3M restituisce meno righe del preset 24M', () => {
    cy.get('[data-cy="history-plant-select"]').select(1)

    cy.get('[data-cy="history-preset-24m"]').click()
    cy.get('[data-cy="history-total-count"]').invoke('text').then(full => {
      cy.get('[data-cy="history-preset-3m"]').click()
      cy.get('[data-cy="history-total-count"]').invoke('text').then(partial => {
        expect(Number(partial)).to.be.lessThan(Number(full))
      })
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Storico Impianti — Accesso Cliente', () => {

  // ✅ POSITIVO — il cliente vede il link Storico nella nav
  it('[POSITIVO] Il cliente vede il link Storico nella navigazione', () => {
    cy.visit('http://localhost:5173')
    cy.get('[data-cy="login-user-3"]').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Storico').should('be.visible')
  })

  // ✅ POSITIVO — il cliente può accedere alla pagina /history
  it('[POSITIVO] Il cliente accede alla pagina storico senza essere reindirizzato', () => {
    cy.visit('http://localhost:5173')
    cy.get('[data-cy="login-user-3"]').click()
    cy.contains('Storico').click()
    cy.url().should('include', '/history')
    cy.contains('Storico Dati Impianti').should('be.visible')
  })

  // ✅ POSITIVO — il cliente vede solo i propri impianti nel selettore
  it('[POSITIVO] Cliente A vede solo i propri 3 impianti nel selettore storico', () => {
    cy.visit('http://localhost:5173')
    cy.get('[data-cy="login-user-3"]').click()
    cy.contains('Storico').click()

    // Cliente A (id:3) possiede: Roma (101), Napoli (103), Serra Firenze (105)
    cy.get('[data-cy="history-plant-select"] option').should('have.length', 4) // 3 impianti + opzione vuota
    cy.get('[data-cy="history-plant-select"]').contains('Impianto Roma').should('exist')
    cy.get('[data-cy="history-plant-select"]').contains('Impianto Napoli').should('exist')
    cy.get('[data-cy="history-plant-select"]').contains('Serra Firenze').should('exist')
    cy.get('[data-cy="history-plant-select"]').contains('Impianto Milano').should('not.exist')
    cy.get('[data-cy="history-plant-select"]').contains('Impianto Torino').should('not.exist')
  })

  // ✅ POSITIVO — il cliente vede i dati del proprio impianto
  it('[POSITIVO] Cliente A vede i dati storici del proprio impianto', () => {
    cy.visit('http://localhost:5173')
    cy.get('[data-cy="login-user-3"]').click()
    cy.contains('Storico').click()

    cy.get('[data-cy="history-plant-select"]').select(1)
    cy.get('[data-cy="history-preset-24m"]').click()
    cy.get('[data-cy="history-total-count"]').invoke('text').then(count => {
      expect(Number(count)).to.be.greaterThan(0)
    })
    cy.get('[data-cy="history-row"]').should('have.length.greaterThan', 0)
  })
})

