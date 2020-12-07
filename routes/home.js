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
  return new Promise(async (resolve) => {
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

    const sshEnabled = await chromeDriver.findElmBycss(
      "span[class='esx-icon-service-ssh']",
      1
    );

    if (sshEnabled === 1) {
      chromeDriver.quit();
      resolve(1);
    }
  });
};

router.get("/", async (req, res) => {
  

  const PreRunvms = await VMController.joinVMandESXI("ESXI_ID");

  PreRunvms.forEach(async (element) => {
    const host = await ESXIController.sqlGetBySpecificValue(
      "ESXI_IP",
      element.ESXI_IP
    );
    const sshEnabled = await ssh.check_ssh_enabled(host[0]);
    if (sshEnabled===1) {
      ssh.get_vm_status(host[0], element.VMid);
    }else{
        console.log('no ssh');
    }
    
  });

  //
  const vms = await VMController.joinVMandESXI("ESXI_ID");

  let tempIP;
  const obj = { vms: [] };

  const hosts = [];
  vms.forEach((element) => {
    if (!hosts.length > 0) {
      hosts.push({ ip: element.ESXI_IP, vms: [] });
      tempIP = element.ESXI_IP;
    } else {
      if (tempIP !== element.ESXI_IP) {
        hosts.push({ ip: element.ESXI_IP, vms: [] });
        tempIP = element.ESXI_IP;
      }
    }
  });

  vms.forEach((element) => {
    hosts.forEach((host) => {
      if (host.ip === element.ESXI_IP) {
        host.vms.push({
          vmName: element.VM_name,
          vmId: element.VMid,
          vmStatus: element.vmStatus,
        });
      }
    });
  });
  res.send(hosts);
  
});

router.post("/deleteHost", async (req, res) => {
  const whoToDelete = req.body.ip;

  const host = await ESXIController.sqlGetBySpecificValue("ESXI_IP",whoToDelete);
  console.log(host);
  if (host) {
    VMControl.deleteRow("ESXI_ID", host[0].ESXI_ID);
    ESXIController.deleteRowESXI("ESXI_IP", whoToDelete);
  } else {
  }
  res.send(whoToDelete);
});


router.post('/checkSSH/:ip',async(req,res)=>{
  const ip = req.params.ip;
  const obj = req.body
  const ping=await ssh.checkLanConnection(ip);
  if (ping) {
   const finish=await  enableSSH(ip,obj.user,obj.pass);
   if (finish) {
    res.send("enabling ssh on esxi completed!") 
   }
  } else {
    console.log("no lan connection please enable lan connection before continue");
    res.send("no lan connection please enable lan connection before continue");
  }
  //
  

})


router.post("/insertESXI", async (req, res) => {
  console.log("now in /insertESXI");
  const ESXI_PROPS = req.body;

  const newID = await ESXIController.sqlInsertMachine(
    ESXI_PROPS.ESXI_IP,
    ESXI_PROPS.ESXI_USER,
    ESXI_PROPS.ESXI_PASSWORD
  );
  if (newID) {
    ESXI_PROPS.ESXI_ID = newID;

    ssh.firstAuth(ESXI_PROPS);

    ssh.get_vm_in_host(ESXI_PROPS);
    ESXI_PROPS.ESXI_ID = newID;
    const VMS = await VMController.sqlGet(
      "VirtualMachines",
      "ESXI_ID",
      ESXI_PROPS.ESXI_ID,
      "*"
    );
    ESXI_PROPS.vms = VMS;
    res.send(ESXI_PROPS);
  } else {
    res.send("Machine already exists");
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
