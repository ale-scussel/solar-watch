import { mount } from 'cypress/vue'
import PlantCard from '../../src/components/PlantCard.vue'

// Fixture: impianto connesso e performante
const connectedPlant = {
  id: 101,
  name: 'Impianto Roma',
  connected: true,
  currentProduction: 100,
  expectedProduction: 100,
  underperformanceMinutes: 0,
  lastUpdate: new Date('2026-07-01T10:00:00').getTime()
}

// Fixture: impianto disconnesso e sotto-performante
const disconnectedPlant = {
  id: 102,
  name: 'Impianto Milano',
  connected: false,
  currentProduction: 30,
  expectedProduction: 100,
  underperformanceMinutes: 45,
  lastUpdate: new Date('2026-07-01T09:30:00').getTime()
}

describe('PlantCard', () => {
  it('mostra il nome dell\'impianto', () => {
    mount(PlantCard, { props: { plant: connectedPlant } })
    cy.get('[data-cy="plant-name"]').should('contain.text', 'Impianto Roma')
  })

  it('mostra il badge CONNESSO quando l\'impianto è online', () => {
    mount(PlantCard, { props: { plant: connectedPlant } })
    cy.get('[data-cy="plant-status"]')
      .should('contain.text', 'CONNESSO')
      .and('have.class', 'bg-green-500')
  })

  it('mostra il badge DISCONNESSO quando l\'impianto è offline', () => {
    mount(PlantCard, { props: { plant: disconnectedPlant } })
    cy.get('[data-cy="plant-status"]')
      .should('contain.text', 'DISCONNESSO')
      .and('have.class', 'bg-red-500')
  })

  it('applica il bordo verde se connesso, rosso se disconnesso', () => {
    mount(PlantCard, { props: { plant: connectedPlant } })
    cy.get(`[data-cy="plant-card-${connectedPlant.id}"]`)
      .should('have.class', 'border-green-400')

    mount(PlantCard, { props: { plant: disconnectedPlant } })
    cy.get(`[data-cy="plant-card-${disconnectedPlant.id}"]`)
      .should('have.class', 'border-red-400')
  })

  it('mostra il valore di produzione corrente', () => {
    mount(PlantCard, { props: { plant: connectedPlant } })
    cy.get('[data-cy="plant-production"]').should('contain.text', '100')
  })

  it('mostra il valore di produzione attesa', () => {
    mount(PlantCard, { props: { plant: connectedPlant } })
    cy.get('[data-cy="plant-expected"]').should('contain.text', '100')
  })

  it('mostra "Ottimale (0 min)" quando underperformanceMinutes è 0', () => {
    mount(PlantCard, { props: { plant: connectedPlant } })
    cy.get('[data-cy="underperformance-time"]').should('contain.text', 'Ottimale (0 min)')
  })

  it('mostra "Sotto soglia da X min" quando l\'impianto è sotto-performante', () => {
    mount(PlantCard, { props: { plant: disconnectedPlant } })
    cy.get('[data-cy="underperformance-time"]')
      .should('contain.text', 'Sotto soglia da 45 min')
  })

  it('mostra il timestamp dell\'ultimo aggiornamento', () => {
    mount(PlantCard, { props: { plant: connectedPlant } })
    cy.get('[data-cy="plant-last-update"]').should('not.be.empty')
  })
})
