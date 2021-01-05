using System;

using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System.Threading;

namespace enableSSH
{
    class Program
    {
        static void Main(string[] args)
        {

            //Console.WriteLine(args[0]);


            ChromeOptions chromeOptions = new ChromeOptions();
            chromeOptions.AddArguments("--ignore-certificate-errors");
            IWebDriver driver = new ChromeDriver(chromeOptions);
            driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(30);
            IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
            string homeURL = "https://192.168.10.170";



            driver.Navigate().GoToUrl(homeURL);

            // IReadOnlyList<IWebElement> webElements = driver.FindElements(By.CssSelector("input[class='form-input']"));
            IWebElement username;
            IWebElement password;
            IWebElement submit;
            IWebElement settings;
            IWebElement enableSSHbtn;
            string jsCommand = "document.querySelectorAll('.esx-icon-service-ssh')[0].click();";
            string jsCommand3 = "console.log('sdad')";

            username = driver.FindElement(By.CssSelector("#username"));
            password = driver.FindElement(By.CssSelector("#password"));
            submit = driver.FindElement(By.CssSelector("#submit"));
            username.SendKeys("root");
            password.SendKeys("Aa123456&*");
            submit.Click();


            settings = driver.FindElement(By.CssSelector("a[title='Actions for this host']"));
            settings.Click();

            // enableSSHbtn = driver.FindElement(By.CssSelector("esx-icon-service-ssh"));
            // enableSSHbtn.Click();
            Thread.Sleep(2000);
            js.ExecuteScript(jsCommand);

            Thread.Sleep(4000);
            driver.Quit();
            //enableSSHbtn.Click();
            // webElements[0].SendKeys(name);
            // webElements[1].SendKeys(id);
            // IWebElement el = driver.FindElement(By.CssSelector("input[class='form-input number-form-input']"));

            // el.SendKeys(temp);
            // el = driver.FindElement(By.CssSelector("div[class='Select Select--single']"));

            // el.Click();

            // var inputSim = new InputSimulator();
            // inputSim.Keyboard.KeyDown(WindowsInput.Native.VirtualKeyCode.DOWN);
            // inputSim.Keyboard.KeyDown(WindowsInput.Native.VirtualKeyCode.DOWN);
            // inputSim.Keyboard.KeyDown(WindowsInput.Native.VirtualKeyCode.RETURN);
            // el = driver.FindElement(By.CssSelector("div[class='form-submit-btn']"));

            // el.Click();
            // Thread.Sleep(3000);
            // driver.Quit();




        }
    }
}
