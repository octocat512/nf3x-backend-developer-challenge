#  Backend Developer Challenge
I assume that the challenge is to build a custom oracle solution.

Code accompanies Unit Tests: Jest, Mocha, Chai
Clear documentation for API endpoints: Swagger
Performance metrics & how to measure it: PM2

## Requirements

- [Node v16+](https://nodejs.org/)
- [Docker](https://www.docker.com/)

## Running

_Easily set up a local development environment with single command!_

- clone the repo
- `npm run docker:dev` 🚀
- `npm run job:fetchPrice`
- `PORT=4001 npm run dev`

Visit [localhost:4000](http://localhost:4000/) or if using Postman grab [config](/postman).

### _What happened_ 💥

Containers created:

- Postgres database container (default credentials `user=walter`, `password=white` in [.env file](./.env))
- Node (v16 Alpine) container with running boilerplate RESTful API service
- and one Node container instance to run tests locally or in CI
