const express = require("express");

const bodyParser = require("body-parser");
const app = express();

const db = require("./db/db");
db.initialize();

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
//db.exec("SELECT name FROM machines.db WHERE type='table';");

// plink -ssh root@192.168.0.31 -pw "Aa123456&*" -batch vim-cmd vmsvc/getallvm
//plink -ssh root@192.168.0.31 -pw "Aa123456&*" -batch vim-cmd vmsvc/power.on 7

//get_vm_in_host(hostProperties);

const home = require("./routes/home");

app.use(home);

app.listen(4000, () => {
  console.log("Server started");
});


const srv = app.listen(8080, () => {
  console.log("Server cosing :(");
  srv.close();
});

