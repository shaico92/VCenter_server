var express = require("express");

var router = express.Router();
const ssh = require("../ssh/ssh");
const VMController = require("../db/VirtualMachines");
const ESXIController = require("../db/ESXI");
const VMControl = require("../db/VirtualMachines");

const initDriver = () => {
  return "../chromeDriver/chromeDriver";
};

const getParam = () => {
  const chromeDriver = require(initDriver());

  return chromeDriver;
};

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
  // const VMs = await VMController.sqlGetAllVM(
  //   "VirtualMachines",

  //   "*"
  // );

  const PreRunvms = await VMController.joinVMandESXI("ESXI_ID");

  PreRunvms.forEach(async (element) => {
    const host = await ESXIController.sqlGetBySpecificValue(
      "ESXIHosts",
      "ESXI_IP",
      element.ESXI_IP
    );
    ssh.get_vm_status(host[0], element.VMid);
  });

  //
  const vms = await VMController.joinVMandESXI("ESXI_ID");
  res.send(vms);
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
  ESXI_PROPS.id = newID;
  const VMS = await VMController.sqlGet(
    "VirtualMachines",
    "ESXI_ID",
    ESXI_PROPS.id,
    "*"
  );
  ESXI_PROPS.vms = VMS;
  res.send(ESXI_PROPS);
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

router.get("/gethostUi", (req, res) => {
  // driver.get(

  const chromeDriver = getParam();

  chromeDriver.get("https://192.168.10.170/ui/#/login");
  chromeDriver.click("#details-button");
  chromeDriver.click("#proceed-link");

  chromeDriver.sendKeys("input#username", "root");

  // chromeDriver.sendKeys("Aa123456&*", "#password");
  // chromeDriver.click("#submit");
});

module.exports = router;
