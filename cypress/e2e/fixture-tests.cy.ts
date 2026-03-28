describe("Communities with Fixture Data", () => {
  beforeEach(() => {
    cy.fixture('testData').then((data) => {
      cy.wrap(data).as('testData')
    })
    cy.visit("/all-communities")
  })

  it("should display communities from fixture", function() {
    // A fixture adat elérhető az this.testData-ból
    const communities = this.testData.communities

    // Ellenőrizzük, hogy legalább 2 közösség van
    expect(communities).to.have.length(2)
    
    // Ellenőrizzük az első közösség adatait
    expect(communities[0].name).to.equal("JavaScript Developers")
    expect(communities[0].users_count).to.equal(245)
  })
})
