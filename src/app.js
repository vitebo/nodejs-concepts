const express = require("express");
const cors = require("cors");

const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());
app.use(logRequests);
app.use("/repositories/:id", validateExistingRepository);

const repositories = [];

function logRequests(request, response, next) {
  if (app.get('env') === 'test') return next();
  const { method, url } = request;
  const logLabel = `[${method}] ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

function validateExistingRepository(request, response, next) {
  const { id } = request.params;
  const index = repositories.findIndex(repo => repo.id === id);
  if (index < 0) response.status(400).json({ error: "project not found" })
  request.repositoryIndex = index;
  next();
}

app.get("/repositories", (request, response) => {
  response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = {
    id: uuid(),
    likes: 0,
    title,
    url,
    techs,
  };
  repositories.push(repository);
  response.status(200).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { repositoryIndex } = request;
  const { title, url, techs } = request.body;
  const currentRepository = repositories[repositoryIndex];
  const updatedRepository = { ...currentRepository, title, url, techs };
  repositories[repositoryIndex] = updatedRepository;
  response.status(200).json(updatedRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { repositoryIndex } = request;
  repositories.splice(repositoryIndex, 1);
  response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { repositoryIndex } = request;
  const repository = repositories[repositoryIndex];
  repository.likes += 1;
  response.status(200).send(repository);
});

module.exports = app;
