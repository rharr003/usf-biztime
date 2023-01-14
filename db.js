/** Database setup for BizTime. */
const { Client } = require("pg");

let dbURI;

if (process.env.NODE_ENV === "test") {
  dbURI = "postgresql://rharr003:Dissidia1!@127.0.0.1:5432/biztime-test";
} else {
  dbURI = "postgresql://rharr003:Dissidia1!@127.0.0.1:5432/biztime";
}

let db = new Client({ connectionString: dbURI });

db.connect();

module.exports = db;
