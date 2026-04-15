/// <reference types="cypress" />

describe("Backend mockolás intercepttel (GET + POST)", () => {
	beforeEach(() => {
		cy.clearLocalStorage();
	});

	it("GET /api/threads - keresésnél interceptorral ad vissza találatot", () => {
		cy.fixture("testData").then((data) => {
			const q = "react";
			const results = data.apiMocks.threadsSearchResults;

			cy.intercept(
				{
					method: "GET",
					pathname: "/api/threads",
				},
				(req) => {
					// A SearchThreads() duplázhatja a query paramot (pl. search=&search=react).
					// Cypress-ben a req.query nem mindig megbízható, ezért URL-ből parse-olunk.
					const url = new URL(req.url);
					const searches = url
						.searchParams
						.getAll("search")
						.map(String)
						.map((s) => s.trim())
						.filter(Boolean);
					if (searches.length > 0) {
						expect(searches).to.include(q);
					}

					req.reply({
						statusCode: 200,
						body: results,
						headers: { "content-type": "application/json" },
					});
				},
			).as("searchThreads");

			cy.visit(`/search?q=${q}`);
			cy.wait("@searchThreads");

			// UI ellenőrzés: a mockolt találat megjelenik.
			cy.contains(results[0].name).should("be.visible");
			cy.contains(results[0].description).should("be.visible");
		});
	});

	it("POST /api/login - bejelentkezés interceptorral, token localStorage-be kerül", () => {
		cy.fixture("testData").then((data) => {
			const loginResponse = data.apiMocks.loginSuccess;

			cy.intercept("POST", "**/api/login", (req) => {
				expect(req.body).to.have.property("username", loginResponse.user.username);
				expect(req.body).to.have.property("password");

				req.reply({
					statusCode: 200,
					body: loginResponse,
					headers: { "content-type": "application/json" },
				});
			}).as("login");

			cy.visit("/auth/login");

			// A Login oldalon 2 InputComponent van: username (text) és password.
			cy.get('input[type="text"]').first().type(loginResponse.user.username);
			cy.get('input[type="password"]').first().type("any-password");
			cy.get('button[type="submit"]').click();

			cy.wait("@login");
			cy.location("pathname").should("eq", "/");

			cy.window().then((win) => {
				expect(win.localStorage.getItem("jedligram_token")).to.eq(
					loginResponse.access_token,
				);
			});
		});
	});
});
