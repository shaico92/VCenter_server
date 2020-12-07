const express = require("express");
const PORT = process.env.PORT || 4000;
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

app.listen(PORT, () => {
  console.log(`Server started ON PORT ${PORT}`);
});
