const { default: sleep } = require("thread-sleep");

const chromeDriver = require("./chromeDriver/chromeDriver");
const killLMS  = async()=>{


    
    


    
 await   chromeDriver.get(`http://lms/`);
  await  sleep(3000);
 await   chromeDriver.get(`http://lms/StatusMonitoring`);
 await   sleep(3000);
await    chromeDriver.get(`http://lms/Schedule`);
await    sleep(3000);
 await   chromeDriver.get(`http://lms/TestPlan`);
 await   sleep(3000);
 await   chromeDriver.get(`http://lms/DeviceConfiguration`);
  await  sleep(3000);
 await   chromeDriver.get(`http://lms/TechnicianPage`);
 await   sleep(3000);
 await   chromeDriver.get(`http://lms/SAPMalfunctions`);
 await   sleep(3000);
 await   chromeDriver.get(`http://lms/VideoScreens`);
 await   sleep(3000);
 await   chromeDriver.get(`http://lms/Bit`);
 await   sleep(3000);
await    chromeDriver.get(`http://lms/Settings`);
 await   sleep(3000);
 await   chromeDriver.get(`http://lms/About`);
 await   sleep(3000);
    

    




}


function getRandomArbitrary(min, max) {
    const num=Math.random() * (max - min) + min;
    return num.toFixed(1);
  }



// chromeDriver.get(`https://forms.monday.com/forms/e39ecf87f3a02f4d93cff3e1f84dc2a7`);

    const monday = async()=>{
        const list = await chromeDriver.getAllElm("input[class='form-input']");
        

        list.forEach((element,i) => {
            switch (i) {
                case 0:
                    element.sendKeys("שי כהן")        
                    break;
                    case 1:
                        element.sendKeys("204139026")        
                        break;
                     
                default:
                    break;
            }
            
        });
        const num =getRandomArbitrary(35.5,36.5)
        chromeDriver.sendKeyscss("input[class='form-input number-form-input']", num);
        const list_ = await chromeDriver.getAllElm("span[class='Select-arrow-zone']");
        list_.forEach((element,i) => {
           console.log(i);
            switch (i) {
                case 3:
                    element.click()
                    sleep(3000)
                    element.sendKeys(Keys.ARROW_DOWN)
                    element.sendKeys(Keys.ARROW_DOWN)
                 
                    break;
            
                default:
                    break;
            }
            
        });
        
        chromeDriver.jsExecuter("const shai =div[aria-activedescendant='react-select-5--option-0']")
            chromeDriver.jsExecuter("element.dispatchEvent(new KeyboardEvent('keypress',{'key':'a'}));")
            chromeDriver.jsExecuter(`document.addEventListener("keypress", function(event) {
                console.log("clicked")
            });`)
        chromeDriver.clickBtn("div[aria-activedescendant='react-select-5--option-2']");
        

    }

//monday();



 
    let num =0;
		while (num<=100){
			 killLMS();
			console.log(num);
			num++;
			
			
		}
	
 
    // chromeDriver.sendKeys("username", username);
    // chromeDriver.sendKeys("password", password);

    // elm =await chromeDriver.findElmByid(`submit`);

    // await chromeDriver.clickElm(elm);