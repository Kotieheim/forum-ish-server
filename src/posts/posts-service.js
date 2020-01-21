const xss = require("xss");

const PostsService = {
  getAllPosts(db) {
    return db
      .from("posts AS pst")
      .select(
        "pst.id",
        "pst.title",
        "pst.date_created",
        "pst.style",
        "pst.content",
        db.raw(`count(DISTINCT comm) AS number_of_comments`),
        db.raw(
          `json_strip_nulls(
                json_build_object(
                  'id', usr.id,
                  'user_name', usr.user_name,
                  'full_name', usr.full_name,
     
                  'date_created', usr.date_created,
                  'date_modified', usr.date_modified
                )
              ) AS "author"`
        )
      )
      .leftJoin("comments AS comm", "pst.id", "comm.post_id")
      .leftJoin("users AS usr", "pst.author_id", "usr.id")
      .groupBy("pst.id", "usr.id");
  },

  getById(db, id) {
    return PostsService.getAllPosts(db)
      .where("pst.id", id)
      .first();
  },
  insertPost(db, newPost) {
    return db
      .insert(newPost)
      .into("posts")
      .returning("*")
      .then(([post]) => post)
      .then(post => PostsService.getById(db, post.id));
  },
  // getUserPost(db, userId) {
  //   return PostsService.getAllPosts(db).where("user_id", userId);
  // },

  getCommentsForPost(db, post_id) {
    return db
      .from("comments AS comm")
      .select(
        "comm.id",
        "comm.text",
        "comm.date_created",
        db.raw(
          `json_strip_nulls(
                row_to_json(
                  (SELECT tmp FROM (
                    SELECT
                      usr.id,
                      usr.user_name,
                      usr.full_name,

                      usr.date_created,
                      usr.date_modified
                  ) tmp)
                )
              ) AS "user"`
        )
      )
      .where("comm.post_id", post_id)
      .leftJoin("users AS usr", "comm.user_id", "usr.id")
      .groupBy("comm.id", "usr.id");
  },
  insertPost(knex, newPost) {
    return knex
      .insert(newPost)
      .into("posts")
      .returning("*")
      .then(rows => {
        return rows[0];
      });
  },

  serializePost(post) {
    const { author } = post;
    console.log(author);
    return {
      id: post.id,
      style: post.style,
      title: xss(post.title),
      content: xss(post.content),
      date_created: new Date(post.date_created),
      number_of_comments: Number(post.number_of_comments) || 0,
      author: {
        id: author.id,
        user_name: author.user_name,
        full_name: author.full_name,

        date_created: new Date(author.date_created),
        date_modified: new Date(author.date_modified) || null
      }
    };
  },

  serializePostComment(comment) {
    const { user } = comment;
    return {
      id: comment.id,
      post_id: comment.post_id,
      text: xss(comment.text),
      date_created: new Date(comment.date_created),
      user: {
        id: user.id,
        user_name: user.user_name,
        full_name: user.full_name,

        date_created: new Date(user.date_created),
        date_modified: new Date(user.date_modified) || null
      }
    };
  }
};

module.exports = PostsService;
