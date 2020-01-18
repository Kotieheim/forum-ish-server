module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_TOKEN: process.env.API_TOKEN || "dummy-api-token",
  DB_URL:
    process.env.DB_URL ||
    "postgresql://dunder_mifflin:password@localhost/forum-ish",
  TEST_DB_URL:
    process.env.TEST_DB_URL ||
    "postgresql://dunder_mifflin:password@localhost/forum-ish",
  CLIENT_ORIGIN: "http://localhost:3000",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret"
};
