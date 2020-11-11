const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/machines.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the machines database.");
});

db.initialize = () => {
  const sqlCreateVMTable = `CREATE TABLE IF NOT EXISTS VirtualMachines (
    ESXI_ID int,
    VMid int,
    VM_name varchar(255),
    vmStatus int

);`;

  const sqlCreateESXIhostTable = `CREATE TABLE IF NOT EXISTS ESXIHosts (
    
  ESXI_ID int,
  ESXI_IP varchar(255),
  ESXI_USER varchar(255),
  ESXI_PASSWORD varchar(255)
);`;

  db.exec(sqlCreateVMTable);
  db.exec(sqlCreateESXIhostTable);
};

// db.sqlInsertMachineVM = (ESXI_ID, VMid, VM_name) => {
//   const insert = `INSERT INTO VirtualMachines (ESXI_ID,VMid,VM_name,vmStatus) VALUES(${ESXI_ID}, ${VMid}, "${VM_name}",${0})`;

//   db.exec(insert);
//   console.log(`${ESXI_ID} ${VMid}, "${VM_name}" inserted to db`);
// };
// db.sqlInsertESXI = (ESXI_ID, ESXI_IP, ESXI_USER, ESXI_PASSWORD) => {
//   const insert = `INSERT INTO ESXIHosts (ESXI_ID, ESXI_IP, ESXI_USER, ESXI_PASSWORD) VALUES(${ESXI_ID}, "${ESXI_IP}", "${ESXI_USER}", "${ESXI_PASSWORD}")`;

//   db.exec(insert);
//   console.log("host inserted to db");
// };

module.exports = db;
