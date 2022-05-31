/// <reference types="cypress" />

describe("useVanillaState", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000")
  })

  it("updates view when @rerender:increase() is called", () => {
    cy.get("#secret-view").should("have.text", "secret")
    cy.get("#count-view").should("have.text", 0)
    cy.get("#increase-action").click()
    cy.get("#secret-view").should("have.text", "secret")
    cy.get("#count-view").should("have.text", 1)
  })

  it("updates view when @rerender:decrease() is called", () => {
    cy.get("#secret-view").should("have.text", "secret")
    cy.get("#count-view").should("have.text", 0)
    cy.get("#decrease-action").click()
    cy.get("#secret-view").should("have.text", "secret")
    cy.get("#count-view").should("have.text", -1)
  })

  it("remains unchanged when silent() is called", () => {
    cy.get("#secret-view").should("have.text", "secret")
    cy.get("#count-view").should("have.text", 0)
    cy.get("#silent-action").click()
    cy.get("#secret-view").should("have.text", "secret")
    cy.get("#count-view").should("have.text", 0)
  })
})
