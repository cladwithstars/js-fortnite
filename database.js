var express = require("express");
var app = express();
var init_db = require("./db.js");
var md5 = require("md5");

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('public/db/aa.sqlite3');
db.serialize(function () {

});

var bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

var HTTP_PORT = process.env.PORT || 8081;

// Start server
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});
app.post("/api/user", (req, res, next) => {
  var name = req.body.name;
  var score = req.body.killed;

  db.run(
    `UPDATE users set 
           age = coalesce(?,score), 
          
           WHERE name = coalesce(?,name)`,
    [score, name],
    (err, result) => {
      if (err) {
        res.status(400).json({
          error: res.message
        });
        return;
      }
      res.json({
        message: "success",
        data: data
      });
    }
  );
});
app.get("/api/users", (req, res, next) => {
  var sql = "select * from Users";

  username = req.query.username;
  password = req.query.password;
  console.log(username+password);
  db.all(sql, function (err, rows) {
    if (err) {
      res.status(400).json({
        error: err.message
      });
      return;
    }
    var response = {result: ""};
    for(var i = 0; i < rows.length; i++){
      if (rows[i].name == username) {
        console.log(rows[i]+'123');
        if (rows[i].password == password) {
          console.log(rows[i]);
          response.result = "success";
          break;
        } else {
          response.result = "iv_pass";
        }
      } else {
        response.result = "iv_name";
      }
    }

    res.json(response);

  });
});

app.get("/game", (req, res, next) => {
  res.render("game");
});

app.get("/index", (req, res) => {
  res.render("register");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/api/user/:id", (req, res, next) => {
  var sql = "select * from users where id = ?";
  var params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({
        error: err.message
      });
      return;
    }
    res.json({
      message: "success",
      data: row
    });
  });
});

app.get("/api/user/", (req, res, next) => {

  sql = "INSERT INTO users(name, password) VALUES(?, ?)";
  username = req.query.username;
  password = req.query.password;
  db.run(sql, [username, password], function (err, row) {
    if (err) {
      res.status(400).json({
        error: err.message
      });
      return;
    }

    res.json({
      "name": username,
      "result": "success"
    });
  });
});

app.patch("/api/user/:id", (req, res, next) => {
  var data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password ? md5(req.body.password) : undefined
  };
  db.run(
    `UPDATE user set 
           name = coalesce(?,name), 
           email = COALESCE(?,email), 
           password = coalesce(?,password) 
           WHERE id = ?`,
    [data.name, data.email, data.password, req.params.id],
    (err, result) => {
      if (err) {
        res.status(400).json({
          error: res.message
        });
        return;
      }
      res.json({
        message: "success",
        data: data
      });
    }
  );
});

app.delete("/api/user/:id", (req, res, next) => {
  db.run("DELETE FROM user WHERE id = ?", req.params.id, function (err, result) {
    if (err) {
      res.status(400).json({
        error: res.message
      });
      return;
    }
    res.json({
      message: "deleted",
      rows: this.changes
    });
  });
});

// Root path
app.get("/", (req, res, next) => {
  var data = {
    message: "Ok"
  };
  res.render('index', data);
});
