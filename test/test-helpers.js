const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: "test-user-1",
      full_name: "Test user 1",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z")
    },
    {
      id: 2,
      user_name: "test-user-2",
      full_name: "Test user 2",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z")
    },
    {
      id: 3,
      user_name: "test-user-3",
      full_name: "Test user 3",
      password: "password",
      date_created: new Date("2029-01-22T16:28:32.615Z")
    }
  ];
}

function makePostsArray(users) {
  return [
    {
      id: 1,
      title: "First test",
      style: "Music",
      author_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?"
    },
    {
      id: 2,
      title: "Second test",
      style: "School",
      author_id: users[1].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?"
    },
    {
      id: 3,
      title: "Third test",
      style: "News",
      author_id: users[2].id,
      date_created: new Date("2029-01-22T16:28:32.615Z"),
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?"
    }
  ];
}
function makeCommentsArray(users, posts) {
  return [
    {
      id: 1,
      text: "First test comment!",
      post_id: posts[0].id,
      user_id: users[0].id,
      date_created: new Date("2029-01-22T16:28:32.615Z")
    },
    {
      id: 2,
      text: "Second test comment!",
      post_id: posts[0].id,
      user_id: users[1].id,
      date_created: new Date("2029-01-22T16:28:32.615Z")
    },
    {
      id: 3,
      text: "Third test comment!",
      post_id: posts[0].id,
      user_id: users[2].id,
      date_created: new Date("2029-01-22T16:28:32.615Z")
    }
  ];
}

function makeExpectedPost(users, post, comments = []) {
  const author = users.find(user => user.id === post.author_id);

  const number_of_comments = comments.filter(
    comment => comment.post_id === post.id
  ).length;

  return {
    id: post.id,
    style: post.style,
    title: post.title,
    content: post.content,
    date_created: post.date_created.toISOString(),
    number_of_comments,
    author: {
      id: author.id,
      user_name: author.user_name,
      full_name: author.full_name,
      date_created: author.date_created.toISOString(),
      date_modified: author.date_modified || null
    }
  };
}
function makeExpectedPostComments(users, postId, comments) {
  const expectedComments = comments.filter(
    comment => comment.post_id === postId
  );

  return expectedComments.map(comment => {
    const commentUser = users.find(user => user.id === comment.user_id);
    return {
      id: comment.id,
      text: comment.text,
      date_created: comment.date_created.toISOString(),
      user: {
        id: commentUser.id,
        user_name: commentUser.user_name,
        full_name: commentUser.full_name,
        date_created: commentUser.date_created.toISOString(),
        date_modified: commentUser.date_modified || null
      }
    };
  });
}
function cleanTables(db) {
  return db.transaction(trx =>
    trx
      .raw(
        `TRUNCATE
          posts,
          users,
          comments
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE posts_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE comments_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('posts_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
          trx.raw(`SELECT setval('comments_id_seq', 0)`)
        ])
      )
  );
}
function makePostFixtures() {
  const testUsers = makeUsersArray();
  const testPosts = makePostsArray(testUsers);
  const testComments = makeCommentsArray(testUsers, testPosts);
  return { testUsers, testPosts, testComments };
}
function seedUsers(db, users) {
  const preppedUser = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into("users")
    .insert(preppedUser)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}
function seedPostTables(db, users, posts, comments = []) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into("posts").insert(posts);
    await trx.raw(`SELECT setval('posts_id_seq', ?)`, [
      posts[posts.length - 1].id
    ]);
    if (comments.length) {
      await trx.into("comments").insert(comments);
      await trx.raw(`SELECT setval('comments_id_seq', ?)`, [
        comments[comments.length - 1].id
      ]);
    }
  });
}
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: "HS256"
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeExpectedPost,
  makeExpectedPostComments,
  makeCommentsArray,
  makePostsArray,
  makeUsersArray,
  cleanTables,
  makePostFixtures,
  seedUsers,
  seedPostTables,
  makeAuthHeader
};
