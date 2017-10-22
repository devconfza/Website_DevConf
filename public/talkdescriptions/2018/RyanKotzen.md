### About the talk

![](http://forum.kerbalspaceprogram.com/uploads/monthly_02_2016/helmet2.jpg.8f411f96275691f576624cded3a109b8.jpg)

Since the dawn of man (And indeed, Kerbalkind), we have looked up at the moon and stars and wondered ... is there cheese out there? Seeing as how modern science has yet to answer this question sufficiently we set out to see for ourselves.

In spaceflight people use physical switches, dials, buttons and readouts to pilot their vessels. In the game Kerbal Space Program you use a mouse and keyboard. In order to get a more authentic experience, we set out to build a [KSP Control Board](https://www.google.co.za/search?q=ksp+control+board&source=lnms&tbm=isch&sa=X&ved=0ahUKEwj5h8HHn7PTAhUMCsAKHdgyB1sQ_AUICCgB&biw=1920&bih=950).

As you can see from some of the sample pictures, a few people have managed this before. However most of it is written using C# since that is what the game is written in. Because JavaScript is awesome, we set out to use that instead.

There is a mod for the game called [KRPC](https://krpc.github.io/krpc/) which allows you to use [Google Protocol buffers](https://developers.google.com/protocol-buffers/) and [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) to communicate with the game remotely. We wrote a [node.js module](https://www.npmjs.com/package/krpc-node) that can be included in any regular app. Using this module, and [Johnny-Five](http://johnny-five.io/) we wrote a node.js script that can interface with the Arduino. The Arduino in turn interacts with the various physical switches, buttons, joysticks, sensors and a LCD. 

In addition we wrote an auto-pilot script that is capable of doing SpaceX Falcon 9 style return to launch site mission using a script written purely in JavaScript.  

##### The Mk I
![](http://i.imgur.com/nC94m8P.jpg)

###### The Mk II
![](https://i.imgur.com/fM9Em8E.jpg)

### About Ryan
Ryan Kotzen is a recovering enterprise developer. Ryan joined Entelect in 2009 fresh out of varsity (UJ) and has been there ever since. He has worked in a wide range of domains including fintech, health, employee and customer loyalty, gamification, event management, and retail. Ryan started his career in .Net and was part of the founding of the start-up Encentivize where he gained a wealth of knowledge about JavaScript and the MEAN stack. As an Engineering coach within Liberty dHub, Ryan has had an opportunity to deliver a mobile app written in React-Native and exercise his automation and DevOps skills, dabbling in Python, Ruby and GO. He has a passion for teaching and coaching others. When not developing software, Ryan likes to spend his time playing Kerbal Space Program and engaging in the Warhammer 40k hobby.

### About Jake
