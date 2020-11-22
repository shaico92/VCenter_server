var express = require("express");

var router = express.Router();
const ssh = require("../ssh/ssh");
const VMController = require("../db/VirtualMachines");
const ESXIController = require("../db/ESXI");
const VMControl = require("../db/VirtualMachines");

const { route } = require("express/lib/router");
const { threadId } = require("worker_threads");

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

const enableSSH = (hostIp, username, password) => {
  return new Promise(async(resolve) => {
    const chromeDriver = require("../chromeDriver/chromeDriver");
    let elm;

    chromeDriver.get(`https://${hostIp}/ui/#/login`);

    chromeDriver.sendKeys("username", username);
    chromeDriver.sendKeys("password", password);

    elm = chromeDriver.findElmByid(`submit`);

    chromeDriver.clickElm(elm);

     elm = chromeDriver.findElmBycss("a[title='Actions for this host']");
     chromeDriver.clickElm(elm);

    // elm = chromeDriver.findElmBycss("span[class='esx-icon-host-services']");
    // chromeDriver.hoverTo(elm);

  const sshEnabled= await    chromeDriver.findElmBycss("span[class='esx-icon-service-ssh']", 1);
    
    if (sshEnabled===1) {
      chromeDriver.quit();
      resolve(1);  
    }
    
    
  });
};

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
    const isSshEnabled =await ssh.check_ssh_enabled(host[0]);
    if (isSshEnabled === 1) {
      ssh.get_vm_status(host[0], element.VMid);
    } else {
      
      throw new Error("cant connect by ssh to get current status");
      res.send(`please enable ssh for ${host[0].ESXI_IP}`);
    }
  });

  //
  const vms = await VMController.joinVMandESXI("ESXI_ID");
  res.send(vms);
});

router.post("/deleteHost", async (req, res) => {
  const whoToDelete = req.body;
  
  
  
  
  
  
  const host = await ESXIController.sqlGetBySpecificValue(
    "ESXIHosts",
    "ESXI_IP",
    
  );
  console.log(host);
  if (host) {
    VMControl.deleteRow("ESXI_ID",host.ESXI_ID);
  ESXIController.deleteRow("ESXI_ID",whoToDelete.hostip);
  }else{

  }
  res.send(`${whoToDelete.hostip} deleted from records`);
});

router.post("/insertESXI", async (req, res) => {
  console.log("now in /insertESXI");
  const ESXI_PROPS = req.body;
  const isSshEnabled =await ssh.check_ssh_enabled(ESXI_PROPS);
  if (isSshEnabled === 0) {
    console.log("ssh is not enabled now enabling please wait");
    const ssh_enabled = await enableSSH(
      ESXI_PROPS.ESXI_IP,
      ESXI_PROPS.ESXI_USER,
      ESXI_PROPS.ESXI_PASSWORD
      
    );
    if (ssh_enabled === 1) {
      console.log("ssh is now enabled continue");
      const newID = await ESXIController.sqlInsertMachine(
        ESXI_PROPS.ESXI_IP,
        ESXI_PROPS.ESXI_USER,
        ESXI_PROPS.ESXI_PASSWORD
      );
      ESXI_PROPS.id = newID;

        ssh.firstAuth(ESXI_PROPS);

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
      
      res.end()
    }
  } else {
    console.log("SSH enabled without selenium inserting host");
    const newID = await ESXIController.sqlInsertMachine(
      ESXI_PROPS.ESXI_IP,
      ESXI_PROPS.ESXI_USER,
      ESXI_PROPS.ESXI_PASSWORD
    );
    ESXI_PROPS.id = newID;
    ssh.firstAuth(ESXI_PROPS);
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
    res.end()
  }
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
