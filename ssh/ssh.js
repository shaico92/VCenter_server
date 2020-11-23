const cp = require("child_process");
const { stdout, stderr, stdin } = require("process");
const ESXIController = require("../db/ESXI");
const VMController = require("../db/VirtualMachines");
const db = require("../db/db");
const { realpathSync } = require("fs");
const { resolve } = require("path");
const { exec } = require("../db/db");
const { SIGINT } = require("constants");

const exec_options = {
  cwd: null,
  env: null,
  encoding: "utf8",
  timeout: 0,
  maxBuffer: 200 * 1024,
  killSignal: "SIGTERM",
};
let tempArr = [];

const ESXI_GET_MACHINES = "vim-cmd vmsvc/getallvm";
const CONNECT_METHOD = "-ssh";
const POWER_ON_METHOD = "vim-cmd vmsvc/power.on";
const POWER_OFF_METHOD = "vim-cmd vmsvc/power.off";
const TOOL = "plink.exe ";
const GET_MACHINE_STATE = "vim-cmd vmsvc/power.getstate";

exports.turn_on_selected_computer = async (id) => {
  const hostId = await VMController.sqlGet(
    "VirtualMachines",
    id,
    "VMid",
    "ESXI_ID"
  );
  const host = await ESXIController.sqlGetBySpecificValue(
    "ESXI_ID",
    hostId[0].ESXI_ID
  );
  const commandToTurnOnComputer = `${TOOL} ${CONNECT_METHOD} ${host[0].ESXI_USER}@${host[0].ESXI_IP} -pw "${host[0].ESXI_PASSWORD}" -batch ${POWER_ON_METHOD} `;

  cp.exec(commandToTurnOnComputer + id, exec_options, (err, stdout, stderr) => {
    return stdout;
  });
};
exports.turn_off_selected_computer = async (id) => {
  const hostId = await VMController.sqlGet(
    "VirtualMachines",
    id,
    "VMid",
    "ESXI_ID"
  );
  const VMname = await VMController.sqlGet(
    "VirtualMachines",
    id,
    "VMid",
    "VM_name"
  );
  const host = await ESXIController.sqlGetBySpecificValue(
    "ESXI_ID",
    hostId[0].ESXI_ID
  );
  ///sad
  return new Promise((resolve, reject) => {
    const commandToTurnOffComputer = `${TOOL} ${CONNECT_METHOD} ${host[0].ESXI_USER}@${host[0].ESXI_IP} -pw "${host[0].ESXI_PASSWORD}" -batch ${POWER_OFF_METHOD} `;
    cp.exec(
      commandToTurnOffComputer + id,
      exec_options,
      (err, stdout, stderr) => {
        resolve(stdout + VMname[0].VM_name + " -" + id);
      }
    );
  });
};
//s

exports.check_ssh_enabled = (host) => {
  return new Promise((resolve) => {
    const check_ssh_enabled = `${TOOL} ${CONNECT_METHOD} ${host.ESXI_USER}@${host.ESXI_IP} -pw "${host.ESXI_PASSWORD}"`;
    cp.exec(check_ssh_enabled, exec_options, (err, stdout, stderr) => {
      if (err) {
        console.log(stderr);
        resolve(0);
      } else {
        console.log(stdout);
        resolve(1);
      }
    });
  });
};

exports.get_vm_in_host = (host) => {
  console.log(host);
  const commandToGetMachines = `${TOOL} ${CONNECT_METHOD} ${host.ESXI_USER}@${host.ESXI_IP} -pw "${host.ESXI_PASSWORD}" -batch ${ESXI_GET_MACHINES} `;
  cp.exec(commandToGetMachines, exec_options, (err, stdout, stderr) => {
    for (let index = 0; index < stdout.length; index++) {
      const element = stdout.split("\n");
      const currentPosition = index;

      if (currentPosition > 0 && currentPosition < element.length - 1) {
        tempArr.push(element[index]);
      }
    }

    tempArr.forEach(async (el) => {
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
    });
  });
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
      } else {
        if (stdout.includes("Powered on")) {
          VMController.setVMStatus(host.ESXI_ID, vmId, 1);
          resolve(1);
        } else {
          VMController.setVMStatus(host.ESXI_ID, vmId, 0);
          resolve(0);
        }
      }
    });
  });
};
