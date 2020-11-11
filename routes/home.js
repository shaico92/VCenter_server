var express = require("express");

var router = express.Router();
const ssh = require("../ssh/ssh");
const VMController = require("../db/VirtualMachines");
const ESXIController = require("../db/ESXI");
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    return res.status(200).json({});
  }
  next();
});

router.get("/", async (req, res) => {
  const VMs = await VMController.sqlGetAllVM(
    "VirtualMachines",

    "*"
  );
  const obj = {
    ESXI_ID: 26,
    ESXI_IP: "192.168.0.31",
    ESXI_USER: "root",
    ESXI_PASSWORD: "Aa123456&*",
  };
  const smth = await VMController.getVMCurrentStatus(
    "VirtualMachines",

    "*"
  );
  //ssh.getVMStatus(obj, 3);
  res.send(VMs);
});

router.post("/insertESXI", async (req, res) => {
  const ESXI_PROPS = req.body;

  const newID = await ESXIController.sqlInsertMachine(
    ESXI_PROPS.ESXI_IP,
    ESXI_PROPS.ESXI_USER,
    ESXI_PROPS.ESXI_PASSWORD
  );
  ESXI_PROPS.id = newID;
  ssh.get_vm_in_host(ESXI_PROPS);
});
router.post("/powerOnOff", async (req, res) => {
  let response = null;

  if (req.body.currentStatus === 1) {
    respose = await ssh.turn_off_selected_computer(req.body.id);
  } else {
    respose = await ssh.turn_on_selected_computer(req.body.id);
  }

  res.send(respose);
});

module.exports = router;
