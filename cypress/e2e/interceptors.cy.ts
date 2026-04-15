/// <reference types="cypress" />

describe("Backend mock (GET + POST)", () => {
  it("GET /api/threads - keresés mock", () => {
    cy.fixture("testData").then(({ apiMocks }) => {
      const q = "react";
      const results = apiMocks.threadsSearchResults;

      cy.intercept("GET", "/api/threads*", {
        statusCode: 200,
        body: results,
      }).as("searchThreads");

      cy.visit(`/search?q=${q}`);
      cy.wait("@searchThreads");

      // UI check
      cy.contains(results[0].name).should("be.visible");
      cy.contains(results[0].description).should("be.visible");
    });
  });

  it("POST /api/login - login mock + token mentés", () => {
    cy.fixture("testData").then(({ apiMocks }) => {
      const loginResponse = apiMocks.loginSuccess;

      cy.intercept("POST", "/api/login", {
        statusCode: 200,
        body: loginResponse,
      }).as("login");

      cy.visit("/auth/login");

      cy.get('input[type="text"]').type(loginResponse.user.username);
      cy.get('input[type="password"]').type("any-password");
      cy.get('button[type="submit"]').click();

      cy.wait("@login");
      cy.location("pathname").should("eq", "/");
    });
  });
});