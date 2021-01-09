using System;

using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System.Threading;
using System.Collections.Generic;
using System.Xml;

using WindowsInput;


namespace seleniumProj
{
    class ProgramKeyDown
    {
        static void Main(string[] args)
        {


            var inputSim = new InputSimulator();
            Thread.Sleep(3000);
            inputSim.Keyboard.KeyDown(WindowsInput.Native.VirtualKeyCode.LEFT);
            Thread.Sleep(1000);
            inputSim.Keyboard.KeyDown(WindowsInput.Native.VirtualKeyCode.LEFT);
            Thread.Sleep(1000);
            inputSim.Keyboard.KeyDown(WindowsInput.Native.VirtualKeyCode.RETURN);
            
            Console.WriteLine("finished");



        }
    }
}
