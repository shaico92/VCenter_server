var assert = require("assert");
const webdriver = require("selenium-webdriver"),
  By = webdriver.By,
  until = webdriver.until;

const WAIT = 40000;
exports.chromeO = require("selenium-webdriver/chrome");
const sleep = require("thread-sleep");
const options = new this.chromeO.Options();

options.addArguments("--ignore-certificate-errors");

const chrome = new webdriver.Builder().withCapabilities(options).build();
const actions = chrome.actions();

chrome.manage().setTimeouts({ implicit: 3000 });

chrome.jsExecuter = (command) => {
  console.log(command);

  chrome.executeAsyncScript(command).then(function (return_value) {
    console.log("returned ", return_value);
  });
};

chrome.findElmByid = (id) => {
  const elm = chrome.wait(until.elementLocated(By.id(id)), WAIT);
  return elm;
};

chrome.hoverTo = (elm) => {
  actions.move({ origin: elm }).perform();
};

chrome.findElmByText = (text) => {
  const elm = chrome.wait(until.elementLocated(By.linkText(text)), WAIT);
  return elm;
};

chrome.clickBtn = (cssSelector) => {
  const elm = chrome.wait(until.elementIsEnabled(By.css(cssSelector)));
  elm.click();
};

chrome.clickElm = (elm) => {
  console.log(elm);
  elm.click();
};
chrome.clickAndMove = (elm) => {
  actions.move({ origin: elm }).perform();
};

chrome.sendKeys = (id, keys) => {
  const webElm = chrome.wait(until.elementLocated(By.id(id)), WAIT);
  webElm.sendKeys(keys);
};

//Actions for this host
chrome.findElmBycss = (cssSelector, val) => {
  let elm = null;
  if (val) {
    elm = chrome
      .wait(until.elementLocated(By.css(cssSelector)), WAIT)
      .then(() => {
        if (elm) {
          chrome.executeScript(
            `document.querySelector("span[class='esx-icon-service-ssh']").click()`
          );
        }
      });
  } else {
    elm = chrome.wait(until.elementLocated(By.css(cssSelector)), WAIT);
  }
  return elm;
};

module.exports = chrome;
