const xss = require("xss");

const CommentsService = {
  getById(db, id) {
    return db
      .from("comments AS comm")
      .select(
        "comm.id",
        "comm.text",
        "comm.date_created",
        "comm.post_id",
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
      .leftJoin("users AS usr", "comm.user_id", "usr.id")
      .where("comm.id", id)
      .first();
  },

  insertComment(db, newComment) {
    return db
      .insert(newComment)
      .into("comments")
      .returning("*")
      .then(([comment]) => comment)
      .then(comment => CommentsService.getById(db, comment.id));
  },

  serializeComment(comment) {
    const { user } = comment;
    console.log(comment);
    return {
      id: comment.id,
      text: xss(comment.text),
      post_id: comment.post_id,
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

module.exports = CommentsService;
