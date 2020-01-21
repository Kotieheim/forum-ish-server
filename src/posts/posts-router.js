const express = require("express");
const path = require("path");
const PostService = require("./posts-service");
const { requireAuth } = require("../middleware/jwt-auth");
const postsRouter = express.Router();
const bodyParser = express.json;

postsRouter
  .route("/")
  .get((req, res, next) => {
    PostService.getAllPosts(req.app.get("db"))
      .then(posts => {
        res.json(posts.map(PostService.serializePost));
      })
      .catch(next);
  })
  .post(
    // requireAuth,
    bodyParser,
    (req, res, next) => {
      const { style, title, content } = req.body;
      const newPost = { style, title, content, author };

      for (const [key, value] of Object.entries(newPost))
        if (value == null)
          return res.status(400).json({
            error: `Missing '${key}' in request body`
          });

      newPost.author.id = req.user.id;
      console.log(newPost);
      PostService.insertPost(req.app.get("db", newPost))
        .then(post => {
          console.log(post);
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/post/${post.id}`))
            .json(PostService.serializePost(post));
        })
        .catch(next);
    }
  );

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
