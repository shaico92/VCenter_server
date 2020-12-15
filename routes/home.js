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


const enableSSH =(hostIp, username, password) => {
  return new Promise( async(resolve) => {
    const chromeDriver = require("../chromeDriver/chromeDriver");
    let elm;

    // chromeDriver.get(`https://${hostIp}/ui/#/login`);

    // chromeDriver.sendKeys("username", username);
    // chromeDriver.sendKeys("password", password);

    // elm =await chromeDriver.findElmByid(`submit`);

    // await chromeDriver.clickElm(elm);

    // elm =await  chromeDriver.findElmBycss("a[title='Actions for this host']");
    elm = await chromeDriver.loginHost(hostIp, username, password);



    chromeDriver.clickElm(elm);

    elm =await chromeDriver.findElmBycss("span[class='esx-icon-host-services']");
    chromeDriver.hoverTo(elm);

    const sshEnabled =await  chromeDriver.findElmBycss(
      "span[class='esx-icon-service-ssh']",
      1
    );

    if (sshEnabled === 1) {
      resolve(1);
      chromeDriver.quit();
      
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
    if (sshEnabled) {
      ssh.get_vm_status(host[0], element.VMid);
    }else{
      res.status(400).send({message:`no SSH enabled in host with host: ${host[0].ESXI_IP} status is not valid`})
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
    
    res.status(400).send({message:`no lan connection with host: ${ip} please enable lan connection before continue`})
    //res.send("no lan connection please enable lan connection before continue");
  }
  //
  

})


router.post("/insertESXI", async (req, res) => {
  console.log("now in /insertESXI");
  const ESXI_PROPS = req.body;
  

  const finish=await  ssh.check_ssh_enabled(ESXI_PROPS);
  if (finish) {
    const newID = await ESXIController.sqlInsertMachine(
      ESXI_PROPS.ESXI_IP,
      ESXI_PROPS.ESXI_USER,
      ESXI_PROPS.ESXI_PASSWORD
    );
    if (newID) {
      ESXI_PROPS.ESXI_ID = newID;
  
      ssh.firstAuth(ESXI_PROPS);
  
  const added=     await ssh.get_vm_in_host(ESXI_PROPS);
      if (added) {
        ESXI_PROPS.ESXI_ID = newID;
      const VMS = await VMController.sqlGetVM(
        "VirtualMachines",
        "ESXI_ID",
        ESXI_PROPS.ESXI_ID,
        "*"
      );  
      const tempArr=[]
        VMS.forEach((elm,i)=>{
          
            console.log(elm);

            const obj = {
              vmName:elm.VM_name,vmId:elm.VMid,vmStatus:elm.vmStatus
            }
            tempArr.push(obj);

        })

      ESXI_PROPS.vms = tempArr;
      res.send(ESXI_PROPS);
      }    
    } else {
      res.status(400).send({message:`The host: ${ESXI_PROPS.ESXI_IP} already exists`})
    }  
  }else{
    res.status(400).send({message:`no SSH enabled in host with host: ${ESXI_PROPS.ESXI_IP} please enable SSH connection before continue`})
  }

  
});
router.post("/powerOnOff", async (req, res) => {
  let response = null;

  if (req.body.currentStatus === 1) {
    respose = await ssh.turn_off_selected_computer(req.body.hostIP,req.body.vmName,req.body.id);
  } else {
    respose = await ssh.turn_on_selected_computer(req.body.hostIP,req.body.vmName,req.body.id);
  }

  res.send(respose);
});

module.exports = router;
