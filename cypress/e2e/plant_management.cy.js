// Regression tests — US: Aggiunta impianto e associazione a cliente
//
// Acceptance criteria coperti:
//  1. [POSITIVO] Form con dati dell'impianto — compilazione e salvataggio
//  2. [NEGATIVO] Associazione cliente obbligatoria — errore se assente
//  3. [POSITIVO] Dopo il salvataggio l'impianto compare nella dashboard
//  4. [POSITIVO] Un cliente non vede gli impianti di un altro cliente
//  5. [POSITIVO] Lazy removal — il cliente vede ancora l'impianto mentre
//               è sulla dashboard; scompare solo al successivo accesso

// Helper: login come utente con id dato
const loginAs = (userId) => {
  cy.visit('http://localhost:5173')
  cy.get(`[data-cy="login-user-${userId}"]`).click()
  cy.url().should('include', '/dashboard')
}

describe('Gestione Impianti', () => {

  // ✅ POSITIVO — il tecnico (id=2) può accedere alla sezione Admin
  it('[POSITIVO] Il tecnico vede la sezione Gestione Impianti in Admin', () => {
    loginAs(2)
    cy.contains('Admin').click()
    cy.url().should('include', '/admin')
    cy.contains('Gestione Impianti').should('be.visible')
    cy.get('[data-cy="add-plant-form"]').should('be.visible')
  })

  // ❌ NEGATIVO — cliente obbligatorio
  it('[NEGATIVO] Salvare senza selezionare il cliente mostra un errore', () => {
    loginAs(2)
    cy.contains('Admin').click()

    cy.get('[data-cy="add-plant-name"]').type('Impianto Test')
    cy.get('[data-cy="add-plant-expected"]').clear().type('80')
    // cliente NON selezionato
    cy.get('[data-cy="add-plant-submit"]').click()

    cy.get('[data-cy="add-plant-error"]')
      .should('be.visible')
      .and('contain', 'obbligatorio')
  })

  // ✅ POSITIVO — aggiunta impianto e comparsa in dashboard
  it('[POSITIVO] Un nuovo impianto aggiunto compare nella dashboard', () => {
    loginAs(2)
    cy.contains('Admin').click()

    cy.get('[data-cy="add-plant-name"]').type('Impianto Test Cypress')
    cy.get('[data-cy="add-plant-client"]').select('Cliente A')
    cy.get('[data-cy="add-plant-expected"]').clear().type('75')
    cy.get('[data-cy="add-plant-submit"]').click()

    cy.get('[data-cy="add-plant-success"]')
      .should('be.visible')
      .and('contain', 'Impianto Test Cypress')

    // Verifica che l'impianto appaia nella lista admin
    cy.contains('Impianto Test Cypress').should('be.visible')

    // Vai alla dashboard e verifica che l'impianto sia presente
    cy.contains('Dashboard').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Impianto Test Cypress').should('be.visible')
  })

  // ✅ POSITIVO — isolamento clienti
  it('[POSITIVO] Cliente A vede solo i propri impianti, non quelli di Cliente B', () => {
    // Impianti Cliente A: Roma (101), Napoli (103), Serra Firenze (105)
    // Impianti Cliente B: Milano (102), Torino (104)
    loginAs(3) // Cliente A

    cy.get('[data-cy="plant-card-101"]').should('be.visible')
    cy.get('[data-cy="plant-card-103"]').should('be.visible')
    cy.get('[data-cy="plant-card-105"]').should('be.visible')

    cy.get('[data-cy="plant-card-102"]').should('not.exist')
    cy.get('[data-cy="plant-card-104"]').should('not.exist')
  })

  // ✅ POSITIVO — isolamento clienti (simmetrico)
  it('[POSITIVO] Cliente B vede solo i propri impianti, non quelli di Cliente A', () => {
    loginAs(4) // Cliente B

    cy.get('[data-cy="plant-card-102"]').should('be.visible')
    cy.get('[data-cy="plant-card-104"]').should('be.visible')

    cy.get('[data-cy="plant-card-101"]').should('not.exist')
    cy.get('[data-cy="plant-card-103"]').should('not.exist')
    cy.get('[data-cy="plant-card-105"]').should('not.exist')
  })

  // ✅ POSITIVO — rimozione: impianto non visibile al responsabile dopo remove
  it('[POSITIVO] Il responsabile non vede più un impianto dopo averlo rimosso', () => {
    loginAs(1) // responsabile
    cy.contains('Admin').click()

    // Rimuovi Impianto Roma (id=101, appartiene a Cliente A)
    cy.get('[data-cy="admin-remove-plant-101"]').click()

    // Il badge "In rimozione" deve comparire nella tabella
    cy.get('[data-cy="admin-plant-row-101"]').should('contain', 'In rimozione')

    // Nella dashboard il responsabile non deve più vedere l'impianto 101
    cy.contains('Dashboard').click()
    cy.get('[data-cy="plant-card-101"]').should('not.exist')
  })

  // ✅ POSITIVO — lazy removal: il cliente vede ancora l'impianto mentre è sulla dashboard
  it('[POSITIVO] Il cliente vede ancora l\'impianto mentre è sulla dashboard dopo la rimozione admin', () => {
    // 1. Cliente A entra sulla dashboard → snapshot preso al mount
    loginAs(3)
    cy.get('[data-cy="plant-card-101"]').should('be.visible')

    // 2. Mentre il cliente è sulla dashboard, l'admin marca l'impianto 101 come pendingDeletion
    //    tramite l'accesso diretto allo store (esposto su window in modalità DEV)
    cy.window().then(win => {
      win.__solarStore.removePlant(101)
    })

    // 3. La vista non deve aggiornarsi immediatamente (lazy)
    cy.get('[data-cy="plant-card-101"]').should('be.visible')
  })

  // ✅ POSITIVO — lazy removal: dopo re-login il cliente NON vede l'impianto rimosso
  it('[POSITIVO] Dopo aver effettuato di nuovo il login, il cliente non vede l\'impianto rimosso', () => {
    // Admin rimuove 101
    loginAs(1)
    cy.contains('Admin').click()
    cy.get('[data-cy="admin-remove-plant-101"]').click()
    cy.get('[data-cy="admin-plant-row-101"]').should('contain', 'In rimozione')

    // Cliente A si ri-autentica (simula "refresh")
    cy.get('[data-cy="logout-btn"]').click()
    cy.get('[data-cy="login-user-3"]').click()
    cy.url().should('include', '/dashboard')

    // L'impianto rimosso NON deve comparire
    cy.get('[data-cy="plant-card-101"]').should('not.exist')
  })

})
