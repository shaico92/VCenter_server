const cp = require("child_process");

const ESXIController = require("../db/ESXI");
const VMController = require("../db/VirtualMachines");
const db = require("../db/db");
const config = require('../configReader');
const { SIGINT } = require("constants");

const exec_options = {
  cwd: null,
  env: null,
  encoding: "utf8",
  timeout: 0,
  maxBuffer: 200 * 1024,
  killSignal: "SIGTERM",
};


const ESXI_GET_MACHINES = "vim-cmd vmsvc/getallvm";
const SESSION_FINISHED = `SESSION_FINISHED`;
const CONNECT_METHOD = "-ssh";
const POWER_ON_METHOD = "vim-cmd vmsvc/power.on";
const POWER_OFF_METHOD = "vim-cmd vmsvc/power.off";
const TOOL = `${config.plinkPath}\\plink.exe `;
const PUTTY = `${config.puttyPath}\\putty.exe `;
const GET_MACHINE_STATE = "vim-cmd vmsvc/power.getstate";
const TEST_ECHO = "test login";
//const CHROME_PROGRAM = `${process.cwd()}\\enableSSH\\bin\\Debug\\net5.0\\enableSSH.exe`;
const CHROME_PROGRAM = `${config.enableSSHPath}\\enableSSH.exe`;
//const RSA_ACCEPT_PROGRAM= `${process.cwd()}\\enableRSAKey\\bin\\Debug\\net5.0\\enableRSAKey.exe`;
const RSA_ACCEPT_PROGRAM= `${config.enableRSAPath}\\enableRSAKey.exe`;
exports.turn_on_selected_computer = async (hostip,vmName,id) => {
  const host = await ESXIController.sqlGetBySpecificValue(
    "ESXI_IP",
    hostip
  );
  return new Promise((resolve, reject) => {
    const commandToTurnOffComputer = `${TOOL} ${CONNECT_METHOD} ${host[0].ESXI_USER}@${hostip} -pw "${host[0].ESXI_PASSWORD}" -batch ${POWER_ON_METHOD} `;
    cp.exec(
      commandToTurnOffComputer + id,
      exec_options,
      async(err, stdout, stderr) => {
     await   resolve(stdout + vmName + " -" + id);
      }
    );
  });
};
exports.turn_off_selected_computer = async (hostip,vmName,id) => {
  
  const host = await ESXIController.sqlGetBySpecificValue(
    "ESXI_IP",
    hostip
  );
  
  return new Promise((resolve, reject) => {
    const commandToTurnOffComputer = `${TOOL} ${CONNECT_METHOD} ${host[0].ESXI_USER}@${hostip} -pw "${host[0].ESXI_PASSWORD}" -batch ${POWER_OFF_METHOD} `;
    cp.exec(
      commandToTurnOffComputer + id,
      exec_options,
      async(err, stdout, stderr) => {
     await   resolve(stdout + vmName + " -" + id);
      }
    );
  });
};
//

exports.enableSSH=(hostip,user,pass)=>{

  const executeChromeDriver = `${CHROME_PROGRAM} ${hostip} ${user} "${pass}"`;
  return new Promise((resolve, reject) => {
    
    cp.exec(
      executeChromeDriver,
      exec_options,
      async(err, stdout, stderr) => {
         if(stdout.includes(SESSION_FINISHED)){
          await  resolve(1);    
        }else{
          await  resolve(null);    
        }
      
      }
    );
  });
  

}

exports.killChromeDriver=(hostip,user,pass)=>{

  const killChromeDriver = `taskkill /im chrome.exe /f `;
  const killChrome = `taskkill /im chromedriver.exe /f `;
  
    
    cp.exec(
      killChromeDriver,
      exec_options,
      async(err, stdout, stderr) => {
         await stdout;
      
      }
    );
    cp.exec(
      killChrome,
      exec_options,
      async(err, stdout, stderr) => {
         await stdout;
      
      }
    );
      
    }
exports.check_ssh_enabled = (host) => {
  return new Promise((resolve) => {
    const check_ssh_enabled = `${TOOL} ${CONNECT_METHOD} ${host.ESXI_USER}@${host.ESXI_IP} -pw "${host.ESXI_PASSWORD}" -batch echo ${TEST_ECHO}`;
      cp.exec(check_ssh_enabled, exec_options, async(err, stdout, stderr) => {
      if (stdout.includes(TEST_ECHO)) {
     await   resolve(1)
      }else{
        await  resolve(null)
      }
    });
  });
};

exports.storeServerKey=async(host)=>{

  // return new Promise((resolve) => {
    //const storeKey = `${PUTTY} ${CONNECT_METHOD} ${host.ESXI_USER}@${host.ESXI_IP} -pw "${host.ESXI_PASSWORD}" /y `;
    const storeKey = `start ${PUTTY} ${CONNECT_METHOD} ${host.ESXI_USER}@${host.ESXI_IP} -pw "${host.ESXI_PASSWORD}" `;
    const killexe = `taskkill /im putty.exe /f`;
   await   cp.exec(storeKey, async(err, stdout, stderr) => {
      
    });
  // });

    const executeRSA =`${RSA_ACCEPT_PROGRAM}`;

    return new Promise(async(resolve)=>{
      await cp.exec(executeRSA,exec_options,async(err,stdout,stderr)=>{
        if (stdout.includes("finished")) {
          setTimeout(async()=>{
            await   cp.exec(killexe, async(err, stdout, stderr) => {
      
            },3000);
          })
          await resolve(1);
        }
      })
    })
  

}

exports.checkLanConnection = ip=>{
  return new Promise(async(resolve)=>{const command = `ping ${ip}`;
  await cp.exec(command,exec_options,(err,stdout,stderr)=>{
    if (err) {
      console.log(stderr);
      console.log(err.message);
      resolve(null) ;
    }else{
      console.log(stdout);
      resolve(1) ;
    }
  })})
}

exports.get_vm_in_host = (host) => {
  const tempArr = [];
  return new Promise((resolve)=>{
    console.log(host);
  const commandToGetMachines = ` ${TOOL} ${CONNECT_METHOD} ${host.ESXI_USER}@${host.ESXI_IP} -pw "${host.ESXI_PASSWORD}" -batch ${ESXI_GET_MACHINES} `;
   cp.exec(commandToGetMachines, exec_options, (err, stdout, stderr) => {
    for (let index = 0; index < stdout.length; index++) {
      const element = stdout.split("\n");
      const currentPosition = index;

      if (currentPosition > 0 && currentPosition < element.length - 1) {
        tempArr.push(element[index]);
      }
    }

    tempArr.forEach(async (el, i) => {
      const computer = {};
      for (let index = 0; index < el.length; index++) {
        el = el.replace(" ", "#");
      }

      let computerName = "";

      for (let index = 0; index < el.length; index++) {
        if (el[index] === "[") {
          break;
        }
        computerName = computerName + el[index];
      }

      let id = "";

      for (let index = 0; index < computerName.length; index++) {
        if (computerName[index] === "#") {
          break;
        } else {
          id = id + computerName[index];
        }
      }

      computerName = computerName.replace(id, "");
      computerName = computerName.replace(/#/g, "");

      computer.name = computerName;
      computer.id = id;

      const tempComputerID = Number(computer.id);
      
      const VMStatus = await this.get_vm_status(host, tempComputerID);
      VMController.sqlInsertMachineVM(
        host.ESXI_ID,
        tempComputerID,
        computer.name,
        VMStatus
      );
      console.log(i);
      if  (tempArr.length-1===i) {
        await  resolve(1);    
      }
    });
    
  });
  })
};

exports.firstAuth = (host) => {
  return new Promise((resolve) => {
    const connect = `${TOOL} ${CONNECT_METHOD} ${host.ESXI_USER}@${host.ESXI_IP} -pw "${host.ESXI_PASSWORD}"`;

    cp.exec(connect, exec_options, (err, stdout, stderr) => {
      if (err) {
        console.log(stderr);
      } else {
        if (stdout.includes("Store key in cache? (y/n)")) {
          stdin("y");
          stdin(SIGINT);
        }
      }
    });
  });
};

exports.get_vm_status = (host, vmId) => {
  return new Promise((resolve, reject) => {
    const commandToGetStatus = `${TOOL} ${CONNECT_METHOD} ${host.ESXI_USER}@${host.ESXI_IP} -pw "${host.ESXI_PASSWORD}" -batch ${GET_MACHINE_STATE} ${vmId}`;
    cp.exec(commandToGetStatus, exec_options, (err, stdout, stderr) => {
      if (err) {
        console.log(stderr);
        resolve(null)
      } else {
        if (stdout.includes("Powered on")) {
          VMController.setVMStatus(host.ESXI_ID, vmId, 1);
          //console.log(`${vmId} status is on`);
          resolve(1);
        } else {
          VMController.setVMStatus(host.ESXI_ID, vmId, 0);
          //console.log(`${vmId} status is off`);
          resolve(0);
        }
      }
    });
  });
};
