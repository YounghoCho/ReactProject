/**
 * Appserver code
 */
const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
let path = require("path");
const app = express();

/**
 * set global letiables
 */
global._path = {
  home: __dirname,
  client:
    __dirname +
    (process.env.NODE_ENV == "production" ? "/client" : "/client/build")
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(compression());
app.use(express.static(_path.client));

app.use((err, req, res, next) => {
  console.error("=================================================");
  console.error("time : " + new Date().toString());
  console.error("name : Exception");
  console.error("-------------------------------------------------");
  console.error(err.stack);
  console.error("=================================================");
  res.statusCode = 500;
  res.send(err.stack);
});

process.on("uncaughtException", err => {
  console.error("\n\n");
  console.error("=================================================");
  console.error("time : " + new Date().toString());
  console.error("name : UncaughtException");
  console.error("-------------------------------------------------");
  console.error(err.stack);
  console.error("=================================================\n\n");
});

app.listen(process.env.PORT, () =>
  console.log(`ka-app-server listening at port ${process.env.PORT}`)
);

app.get("*", (req, res) => {
  res.sendFile(path.join(_path.client + "/index.html"));
});
