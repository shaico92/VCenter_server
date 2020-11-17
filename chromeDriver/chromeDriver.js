const { Builder, By } = require("selenium-webdriver");

exports.driver = new Builder().forBrowser("chrome").build();

exports.get = (url) => {
  this.driver.get(url);
};

exports.sendKeys = async (cssSelector, keys) => {
  this.driver.findElement(By.css(cssSelector)).sendKeys(keys);
};

exports.click = (cssSelector) => {
  this.driver.findElement(By.css(cssSelector)).click();
};
exports.wait = (time) => {
  this.driver.manage().setTimeouts({
    implicit: time * 1000,
  });
};
