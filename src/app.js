require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const authRouter = require("./auth/auth-router");
const postsRouter = require("./posts/posts-router");
const commentsRouter = require("./comments/comments-router");
const usersRouter = require("./users/users-router");

const app = express();
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(cors());

app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

module.exports = app;
