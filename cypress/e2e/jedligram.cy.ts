describe("Jedligram UI Tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Should load the home page and display hero section", () => {
    // Ellenőrizzük, hogy az oldal betöltött-e
    cy.get("body").should("be.visible");
    
    // Ellenőrizzük, hogy vannak komponensek a főoldalon
    cy.contains("Üdvözlünk").should("exist");
  });
});
