> Work in progress.

# ⛵️ CosmicSail

A while ago I found an old rusty rc sailboat on my attic without any controls or batteries.
So I decided to **burn my money** with making this boat as cool and advanced as possible...

At first I went over a few ordinary systems with radio control, but
I noticed very quickly that the problem with those radio controls is that they lose signal after about 50 meters.
It may was related to the antennas being located somewhat below the waterline, blocking the range.

That was a bit disappointing but nevertheless I brainstormed for a better solution and
came up with the idea of controlling the boat and its motors with a Raspberrypi.<br>
*You may wonder how the Raspberrypi is connected* to any kind of controller. (via radio? 😅)<br>
**No**, it turns out that most of the lakes in my area have quite a decent 4G coverage.
And that the Pi is compatible with Surfsticks. And my phone has a SIM card which is compatible with Surfsticks. 😏

## 📡 Connectivity

As I had to discover, you cannot open a WebSocket server from mobile phone network. This required me to use a proxy server,
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
The motor speed is controlled via PWM and the direction via standard GPIO outputs.
Sadly the L293D isn't actually rated for the power my motor requires, so it gets hot after a few minutes driving,
but for returning home that is enough.

**Sensors**<br>
I plan to use a Neo6m GPS module and a HMC5883L compass sensor for extended data and the autopilot.<br>
Speaking of autopilot: I have not yet determined which wind speed and direction sensor to use,
when it comes to autopilot sailing.

**Power**<br>
The raspberrypi and with it the servos as well as the sensors are powered by a pretty standard big powerbank,
providing enough power for hours of sailing. The motor, as mentioned above, is powered by some default AA batteries.

## 🤖 Autopilot

For the fun and exciting part I have to disappoint you because the autopilot conecpt is still in its early stages,
but will be discussed and explained soon. Stay tuned 📻

## 🚧 Going further

I am grateful for any type of feedback, inspiration or question regarding CosmicSail.<br>
Feel free to create an Issue to get in touch.

