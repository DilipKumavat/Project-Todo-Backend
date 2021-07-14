const express = require("express");
const cors = require("cors");
const db = require("./connection");
const routesUrl = require('./App');

const app = express();
app.use(express.json()); //added body key to request


app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use('/',routesUrl);
app.listen(9999, () => console.log("Server Started on port", 9999));
