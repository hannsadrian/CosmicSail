**Scientific value:**
This project is subject to a thesis I write/wrote in 10th grade of my school career.
You can find the thesis relevant documents under `science/` as soon as the writing is completed 🙌<br>
The paper addresses the possibility of replacing global freight shipment with autonomous sailing vessels
which would only transport small amounts of cargo but though could be environmentally friendly and save costs of crew. 

![Boat in action](http://cosmicsail.online/bg.JPG)

# ⛵️ CosmicSail

A while ago I found an old rusty rc sailboat on my attic without any controls or batteries.
So I decided to **burn my money** with making this boat as cool and advanced as possible...

At first I went over a few ordinary systems with radio control, but
I noticed very quickly that the problem with those radio controls is that they lose signal after about 50 meters.
In my case that may was related to the antennas being located somewhat below the waterline, blocking the signal.

That was a bit disappointing but nevertheless I brainstormed for a better solution and
came up with the idea of controlling the boat and its motors with a Raspberrypi.<br>
*You may wonder how the Raspberrypi is connected* to any kind of controller. (via radio? 😅)<br>
**No**, it turns out that most of the lakes in my area have quite a decent 4G coverage.
And that the Pi is compatible with Surfsticks. And my phone has a SIM card which is compatible with Surfsticks. 😏<br>
In the future I am planning to use [hologram.io](https://hologram.io) as SIM card provider, 
so that users don't have to put their personal SIM in the boat.

## 📡 Connectivity

As I had to discover, you *cannot* open a WebSocket server from mobile phone network. This required me to use a proxy server,
instead of a direct connection to the boat.
All the realtime transmission happens over Socket.io which is adopted by frameworks for many different languages.
Here is a simple connection diagram:

`🎮 Client/Phone` ↔️ `📟 Proxy/Server` ↔️ `⛵️ Boat`

## 🎚 Hardware

**Sail and Rudder**<br>
Those two motors are servo motors which can be easily controlled via PWM signals from the Raspberry.

**Motor**<br>
The main engine requires a bit more power than the raspberry can provide,
so I decided to use a L293D microcontroller with external AA batteries.
Sadly the L293D isn't actually rated for the power my motor requires,
so it got hot after a few minutes of driving and even melted parts of the breadboard it was mounted to 🔥
Since then I've replaced the L293D with a professional motor controller, the
[WP1060](https://www.krickshop.de/Elektronik-Motoren/RC-Fernsteuerungen-Zubehoer/Elektronische-Fahrtregler/Fahrtregler-Quicrun-WP1060-Brushed.htm?a=article&ProdNr=67051&p=350).

**PWM Signals**<br>
Emitting PWM Signals from the Pi is very easy, but because it does use a digital clock cycle, the signal can be fuzzy.
Furthermore, the amount of concurrent signals you can emit from the Pi is very limited.
I am currently using the [PCA9685](https://www.adafruit.com/product/815).
It is resolving all the issues of PWM Signals from the Pi.

**Sensors**<br>
I plan to use a Neo6m GPS module and a QMC5883L compass sensor for extended metadata and the autopilot.<br>
Speaking of autopilot: I have not yet determined which wind speed and direction sensor to use,
when it comes to autopilot sailing. However it should also be possible to query wind directions from a weather service,
but that wouldn't include local changes in the wind and needs to be tested for accuracy and functionality.

**Power**<br>
The raspberrypi and with it the servos as well as the sensors are powered by a pretty standard big powerbank,
providing enough power for hours of sailing. The motor, is powered by a [LiPo 2S 7.4V/1500mAh](https://www.krickshop.de/Elektronik-Motoren/Akkus-Ladetechnik/LiPo-Akku-7-4V-1500-mAh-15-C.htm?a=article&ProdNr=646090&p=365) battery.

## 🤖 Autopilot

As of now, the forces on sails that the boat experiences in the real world can be simulated 
right on the chip inside the boat. This enables easy debugging and development of the autopilot. 

## 🚧 Going further

I am grateful for any type of feedback, inspiration or question regarding CosmicSail.<br>
Feel free to create an issue or mail me to get in touch.

