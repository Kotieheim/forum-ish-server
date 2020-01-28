# Forum-ish API

API for app [Forum-ish](https://forum-ish.kotieheim.now.sh/)

## Open Endpoints

Open endpoints require no Authentication.

- Register: `POST /api/register/`
- Login : `POST /api/login/`
- Landing Page: `GET /api/posts/`
- Post Page : `GET /api/posts/postId/`

## Endpoints that require Authentication

- Commenting: `POST /api/comments`
- Add Post: `POST /api/posts/postId/`

### Current User related

Forms that will only be available when logged in.

- Comment Form: `POST /api/comments`
- Add Post Form: `POST /api/posts/postId/`

### Technologies Used

Node.js, Express.js, Heroku, SQL and PostgreSQL
