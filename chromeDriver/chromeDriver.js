var assert = require("assert");
const webdriver = require("selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until;

const WAIT = 10000;
exports.chromeO = require("selenium-webdriver/chrome");
const sleep = require("thread-sleep");
const options = new this.chromeO.Options();

options.addArguments("--ignore-certificate-errors");

const chrome = new webdriver.Builder().withCapabilities(options).build();
const actions = chrome.actions();

chrome.manage().setTimeouts({ implicit: 3000 });

chrome.jsExecuter = (command) => {
  console.log(command);

  chrome.execute(command).then(function (return_value) {
    console.log("returned ", return_value);
  });
};

chrome.findElmByid = (id) => {
  return new Promise((resolve)=>{
    const elm = chrome.wait(until.elementLocated(By.id(id)), WAIT);
    if (elm) {
      resolve(elm)
    }else{
      resolve(null)
    }
  })
};

chrome.hoverTo = async(elm) => {
  await actions.move({ origin: elm }).perform();
};

chrome.findElmByText = (text) => {
  const elm = chrome.wait(until.elementLocated(By.linkText(text)), WAIT);
  return elm;
};

chrome.clickBtn = async(cssSelector) => {
  const elm = chrome.wait(until.elementLocated(By.css(cssSelector)), WAIT);
  await elm.click();
};

chrome.getAllElm = (cssSelector)=>{
return new Promise((resolve)=>{
  const list = chrome.findElements(By.css(cssSelector))
  resolve(list)
})
}


chrome.clickElm = (elm) => {
  
  return new Promise((resolve)=>{
    if (elm) {
      elm.click();
      resolve(1)
    }else{
      resolve(null)
    }
  })
};
chrome.clickAndMove = (elm) => {
  actions.move({ origin: elm }).perform();
};

chrome.sendKeys = (id, keys) => {
  const webElm = chrome.wait(until.elementLocated(By.id(id)), WAIT);
  webElm.sendKeys(keys);
};
chrome.sendKeyscss = (css, keys) => {
  const webElm = chrome.wait(until.elementLocated(By.css(css)), WAIT);
  webElm.sendKeys(keys);
};

;


//Actions for this host
chrome.findElmBycss = (cssSelector, val) => {
  return new Promise((resolve)=>{
    let elm = null;
  if (val) {
    elm = chrome
      .wait(until.elementLocated(By.css(cssSelector)), WAIT)
      .then(() => {
        if (elm) {
          chrome.executeScript(
            `document.querySelector("span[class='esx-icon-service-ssh']").click()`
          );
          resolve(1);
        }
      });
  } else {
    elm = chrome.wait(until.elementLocated(By.css(cssSelector)), WAIT);
  }
  
  })
};


chrome.loginHost=(hostIp,username,password)=>{
  return new Promise(async(resolve)=>{
    let elm;
  chrome.get(`https://${hostIp}/ui/#/login`);

  await chrome.sendKeys("username", username);
  await chrome.sendKeys("password", password);

  elm =await chrome.findElmByid(`submit`);
    
  await chrome.clickElm(elm);
  await console.log("after login");
  elm =await  chrome.findElmBycss("a[title='Actions for this host']");

  await chrome.jsExecuter(`const s = document.querySelectorAll("a[title='Actions for this host']");`);
  await chrome.jsExecuter(`s[0].click();`);
    if (elm) {

      resolve(elm)
    } else {
      resolve(null)
    }


  })
}

module.exports = chrome;
