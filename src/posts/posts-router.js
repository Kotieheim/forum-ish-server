const express = require("express");
const path = require("path");
const PostService = require("./posts-service");
const { requireAuth } = require("../middleware/jwt-auth");
const postsRouter = express.Router();
const bodyParser = express.json();

postsRouter
  .route("/")
  .get((req, res, next) => {
    PostService.getAllPosts(req.app.get("db"))
      .then(posts => {
        res.json(posts.map(PostService.serializePost));
      })
      .catch(next);
  })
  .post(requireAuth, bodyParser, (req, res, next) => {
    const { title, style, content } = req.body;

    const newPost = {
      title: title,
      style: style,
      content: content
    };
    for (const [key, value] of Object.entries(newPost))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    newPost.author_id = req.user.id;
    PostService.insertPost(req.app.get("db"), newPost).then(post => {
      res.status(201);
      res.json();
    });
  });

postsRouter
  .route("/:post_id")
  .all(checkPostExists)
  .get((req, res) => {
    console.log(res.post);
    res.json(PostService.serializePost(res.post));
  })
  .delete(requireAuth, (req, res, next) => {
    console.log(
      "REQ USER ID",
      req.user.id,
      "RES AUTHOR ID",
      res.post.author.id
    );
    if (req.user.id !== res.post.author.id)
      return res.status(400).json({
        error: `Cannot delete other users posts`
      });

    PostService.deletePost(req.app.get("db"), req.params.post_id)
      .then(numRowsAffected => {
        res
          .status(204)
          .send(`Post with id:${req.params.post_id} delete`)
          .end();
      })
      .catch(next);
  });

postsRouter
  .route("/:post_id/comments")
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
