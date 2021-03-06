const { resolve } = require("path");
const ESXIController = require("./db");

const table = "ESXIHosts";
//inserting a VM
ESXIController.sqlInsertMachine = async (ESXI_IP, ESXI_USER, ESXI_PASSWORD) => {
  const exists = await ESXIController.sqlGetBySpecificValue("ESXI_IP", ESXI_IP);
  if (exists.length > 0) {
  } else {
    const ESXI_ID = await ESXIController.getIDNum("ESXI_ID");

    const insert = `INSERT INTO ${table} (ESXI_ID, ESXI_IP, ESXI_USER, ESXI_PASSWORD) VALUES(${
      ESXI_ID + 1
    }, "${ESXI_IP}", "${ESXI_USER}", "${ESXI_PASSWORD}")`;

    ESXIController.exec(insert);
    console.log(`${ESXI_IP} inserted to ${table} db`);
    return ESXI_ID + 1;
  }
};

ESXIController.deleteRowESXI = (collumn, value) => {
  const deleteSentence = `DELETE FROM ${table} WHERE ${collumn} = "${value}"`;
  ESXIController.exec(deleteSentence);
};

//getting all virtual machine by param;
ESXIController.sqlGetBySpecificValue = (collumn, value) => {
  const sentence = `SELECT * FROM ${table} WHERE ${collumn}="${value}";`;

  return new Promise((resolve, reject) => {
    ESXIController.all(sentence, (err, data) => {
      if (err) {
        console.log(err);
        reject("Couldent pull from db");
      } else {
        resolve(data);
      }
    });
  });
};

ESXIController.getIDNum = (collumn) => {
  const arr = [];
  const sentence = `SELECT ${collumn} FROM ${table} ;`;

  return new Promise((resolve, reject) => {
    ESXIController.all(sentence, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        let biggestId = 0;
        data.forEach((obj) => {
          if (biggestId < obj.ESXI_ID) {
            biggestId = obj.ESXI_ID;
          } else if (!obj.ESXI_ID) {
            biggestId = 1;
            resolve(biggestId);
          }
        });

        resolve(biggestId);
      }
      {
      }
    });
  });
};

module.exports = ESXIController;
