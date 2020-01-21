const knex = require("knex");
const helpers = require("./test-helpers");
const app = require("../src/app");

describe("Posts Endpoints", () => {
  let db;

  const { testUsers, testComments, testPosts } = helpers.makePostFixtures();

  before("Make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("GET /posts", () => {
    context(`Given no posts`, () => {
      it(`it responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/posts")
          .expect(200, []);
      });
    });
    context("Given there are posts in the database", () => {
      beforeEach("insert post", () =>
        helpers.seedPostTables(db, testUsers, testPosts, testComments)
      );
      it("responds with 200 and all of the articles", () => {
        const expectedPosts = testPosts.map(post =>
          helpers.makeExpectedPost(testUsers, post, testComments)
        );
        return supertest(app)
          .get("/api/posts")
          .expect(200, expectedPosts);
      });
    });
    // describe('POST /posts', () => {
    //     context('insert post', () =>
    //     helpers.seedPostTables(
    //         db,
    //         testUsers,
    //         testPosts,
    //     ))
    //     it('Makes a post, responds with 201 and the new comment', function() {
    //         this.retries(3)
    //         const testPost = testPosts[0]
    //         const testUser = testUsers[0]
    //         const newPost = {

    //         }
    //     })
    // })
  });
});
