let users = require("./api/users");
let tweets = require("./api/tweet");


module.exports = (app) => {
  app.use("/api/users", users);
  app.use("/api/tweets", tweets);
}