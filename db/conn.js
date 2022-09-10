const { MongoClient } = require("mongodb");
const connectionString = "mongodb+srv://admin:admin@cluster0.b0egw.mongodb.net/msocket?retryWrites=true&w=majority";
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

module.exports = {

  getDb: function () {
    return client;
  },
};