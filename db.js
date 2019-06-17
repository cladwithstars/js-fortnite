var fs = require('fs');
var sqlSchema = fs.readFileSync('public/db/db_schema.sql').toString();

module.exports = function (db) {
  db.serialize(function () {
    db.run(sqlSchema);
  });
};
