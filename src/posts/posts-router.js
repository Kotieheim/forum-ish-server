const express = require("express");
const PostService = require("./posts-service");
const { requireAuth } = require("../middleware/jwt-auth");
const postsRouter = express.Router();
const bodyParser = express.json;

postsRouter
  .route("/")
  // .all(requireAuth)
  .get((req, res, next) => {
    PostService.getAllPosts(req.app.get("db"))
      .then(posts => {
        res.json(posts.map(PostService.serializePost));
      })
      .catch(next);
  });

postsRouter
  .route("/:post_id")
  .all(checkPostExists)
  .get((req, res) => {
    res.json(PostService.serializePost(res.post));
  });

postsRouter
  .route("/:post_id/comments/")
  .all(checkPostExists)
  .get((req, res, next) => {
    PostService.getCommentsForPost(req.app.get("db"), req.params.post_id)
      .then(comments => {
        res.json(comments.map(PostService.serializePostComment));
      })
      .catch(next);
  });

async function checkPostExists(req, res, next) {
  try {
    const post = await PostService.getById(
      req.app.get("db"),
      req.params.post_id
    );

    if (!post)
      return res.status(404).json({
        error: `Post doesn't exist`
      });
    res.post = post;
    next();
  } catch (error) {
    next(error);
  }
}
module.exports = postsRouter;
