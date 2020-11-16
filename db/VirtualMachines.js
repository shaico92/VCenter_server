const ssh = require("../ssh/ssh");
const VMControl = require("./db");

const ESXIController = require("../db/ESXI");
const { table } = require("console");
const { resolve } = require("path");
const VMTable = "VirtualMachines";
const VM_name = "VM_name";
const VMid = "VMid";
const vmStatus = "vmStatus";
//inserting a VM
VMControl.sqlInsertMachineVM = (ESXI_ID, VMid, VM_name) => {
  const insert = `INSERT INTO VirtualMachines (ESXI_ID,VMid,VM_name,vmStatus) VALUES(${ESXI_ID}, ${VMid}, "${VM_name}",${0})`;

  VMControl.exec(insert);
  console.log(`${ESXI_ID} ${VMid}, "${VM_name}" inserted to db`);
};
//getting all virtual machine by param;
VMControl.sqlGet = async (table, collumn, value, paramToget) => {
  const sentence = `SELECT ${paramToget} FROM ${table} WHERE ${collumn}=${value};`;
  return new Promise((resolve, reject) => {
    VMControl.all(sentence, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        resolve(data);
      }
    });
  });
};

VMControl.sqlGetAllVM = (table, paramToget) => {
  const sentence = `SELECT ${paramToget} FROM ${table} ;`;

  return new Promise((resolve, reject) => {
    VMControl.all(sentence, (err, data) => {
      if (err) {
        console.log(err);
        reject("Couldent pull from db");
      } else {
        resolve(data);
      }
    });
  });
};

VMControl.joinVMandESXI = (collumn) => {
  const sentenct = `SELECT ESXI_IP ,${VM_name},${vmStatus},${VMid} FROM ${VMTable} JOIN ESXIHosts ON ESXIHosts.${collumn}=${VMTable}.${collumn}`;
  return new Promise((resolve) => {
    VMControl.all(sentenct, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        resolve(data);
      }
    });
  });
};

VMControl.setVMStatus = (hostid, id, status) => {
  const sentence = `UPDATE VirtualMachines
    SET vmStatus = ${status} WHERE VMid=${id} AND ESXI_ID=${hostid} ;`;

  VMControl.exec(sentence);
};

VMControl.getVMCurrentStatus = async (table, paramToget) => {
  const sentence = `SELECT ${paramToget} FROM ${table} ;`;

  const p = new Promise((resolve, reject) => {
    VMControl.all(sentence, (err, data) => {
      if (err) {
        console.log(err);
        reject("Couldent pull from db");
      } else {
        resolve(data);
      }
    });
  });
  const arr = await p;

  arr.forEach(async (element) => {
    const host = await ESXIController.sqlGetBySpecificValue(
      "ESXIHosts",
      "ESXI_ID",
      element.ESXI_ID
    );
    if (ssh.get_vm_status) {
      const res = await ssh.get_vm_status(host[0], element.VMid);
      if (res === 1) {
        VMControl.setVMStatus(element.VMid, res);
      }
    }
  });
};

module.exports = VMControl;
