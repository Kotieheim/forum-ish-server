const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users Endpoints", function() {
  let db;

  const { testUsers } = helpers.makePostFixtures();
  const testUser = testUsers[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`POST /api/users`, () => {
    context(`User validation`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
      const requiredFields = ["user_name", "password", "full_name"];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_name: "test user_name",
          password: "test password",
          full_name: "test full_name"
        };
        it(`responds with 400 required error when '${field} is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
        it(`responds with 400 'Username already taken' when user_name isn't unique`, () => {
          const duplicateUser = {
            user_name: testUser.user_name,
            password: "11AAaa!!",
            full_name: "test full_name"
          };
          return supertest(app)
            .post("/api/users")
            .send(duplicateUser)
            .expect(400, { error: `Username already taken` });
        });
      });
    });
  });
});
