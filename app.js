var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var fs = require("fs");

var routes = require("./routes/index");
var form = require("./routes/form");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use("/form", form);

var port = 3000;
app.listen(port, function () {
  var dir = "./uploadFiles";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  console.log("server on! http://localhost:" + port);
});
