const app = require("../src/app");

describe("App", () => {
  it('GET / respondes with 200 containing "Hello, world!"', () => {
    supertest(app)
      .get("/")
      .expect(200, "Hello, world!");
  });
  it("GET /api/ responds with 200 and being true", () => {
    supertest(app)
      .get("/api/*")
      .expect(200, true);
  });
});
