const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname."todoApplication.db");
app.use(express.json());
let db = null;

const dbInitialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DbError:${e.message}`);
    process.exit(1);
  }
};

dbInitialize();

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasStatusOnly = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriorityOnly = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getSqlQuery = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatus(request.query):
      getSqlQuery = `
            SELECT *
            FROM 
            todo
            WHERE 
            todo LIKE "%${search_q}%"
            AND status="${status}"
            AND priority="${priority}";
            `;
      break;
    case hasStatusOnly(request.query):
      getSqlQuery = `
            SELECT *
            FROM 
            todo
            WHERE
            todo LIKE "%${search_q}%"
            status ="${status}";
            `;
      break;
    case hasPriorityOnly(request.query):
      getSqlQuery = `
            SELECT *
            FROM 
            todo
            WHERE 
            todo LIKE "%${search_q}%"
            priority="${priority}";
            `;
      break;
    default:
      getSqlQuery = `
            SELECT *
            FROM 
            todo
            WHERE 
            todo LIKE "%${search_q}%";
            `;
  }
  data = await db.all(getSqlQuery);
  response.send(data);
});
