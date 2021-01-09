const express = require("express");
const PORT = process.env.PORT || 4000;

const bodyParser = require("body-parser");
const app = express();

const db = require("./db/db");
db.initialize();

app.use(bodyParser.urlencoded({ extended: false }));


app.use(bodyParser.json());


const home = require("./routes/home");

app.use(home);

app.listen(PORT,() => {
  console.log(`Server started ON PORT ${PORT}\n if designetad for production
   should use hostname input write in config.json: "hostname":true`);
});


//const fs = require('fs');
