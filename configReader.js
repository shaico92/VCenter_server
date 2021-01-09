const fs = require('fs');

const rawdata = fs.readFileSync('config.json');
const config = JSON.parse(rawdata);

exports.enableSSHPath= config.enableSSHPath;
exports.useHostName= config.hostname;

exports.enableRSAPath=config.enableRSAPath;
exports.puttyPath=config.puttyPath;
exports.plinkPath=config.plinkPath;




