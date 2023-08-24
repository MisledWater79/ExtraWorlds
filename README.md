# ExtraWorlds (BETA & SEMI-STABLE)

This plugin is based off of [MultiWorlds](https://github.com/salasxd/multiworlds) by SalasCris and is heavily inspired by it. A lot of credit goes to him for the idea of this. This plugin is still in BETA stages but should have a first release soon. You might question what mine gives that MultiWorlds doesn't. The main thing is the ability to save the worlds properly, multiworlds sadly doesn't do this and can possibly currupt some of your worlds. Other things it adds/will add are:

🟢 Change world settings on creation

🟢 The ability to make Legacy/Infinite/Flat/Void worlds

🔴 The ability to work on custom IPs (I know it's pretty sad but I do plan on getting this done asap)

🔴 World specific addons and packs

🔴 Transfer data accross worlds such as player data or other data

🔴 Disabled nether & end

🔴 The ability to make custom superflats

🔴 Smart worlds that closes after no activity(Will have a setting to turn off)

> 🔴 Won't be in first release

> 🟢 Will be in first release

<details>
<summary><h1>Commands</h1></summary>

We won't have many commands since there's not much for commands, but here is a list of them anyway

## 🟢 /createworld

This one is pretty straight forward, it creates a world! Well more sends a form to you to setup the settings for a new world.

#### /createworld [worldName: string]

But wait! There's more! This one creates a default world with default settings and default addons/packs.

## 🟢 /transfer

This will pop up a form with a list of worlds! If you are a admin it will run the world, if clicked on, if it's not active! (will only work on the main world for the time being)

#### /transfer [worldName: string]

This skips the mess of a form and allows you to input a world name. Will not be case sensitive unless of course the is like a world called "New World" and another called "new world".

## 🟢 /worlds

An admin only command that allows you to start/stop/edit worlds

## 🔴 /world

Another admin only command that will provide most, if not, all world data you want.

</details>

# Some more info

Flat world's use server side chunk generation, which might cause lag with many players, would be best to limit the render distance. This will be togglable in world settings but will be on by default. This is because clients can't generate custom superflats. I have made a bug report for this and it is still in review, I will update this as soon as I can when it's fixed.

From testing, it seems each world will take up another 0.5GB of memory. This doesn't account for multiple people on at once, so it's expected that it will take up even more. I have a plan for smart worlds that will close after a while but that won't be til after first release.

# How to install

It's pretty simple to install, just open up a command prompt in you server folder and run `npm i @bdsx/extraworlds` It's that easy! ExtraWorlds will do all the set up.

### The following is not emplimented yet

Now I did say that there is no setup, and that is true, unless you are port fowarding to a custom IP. For this there will be a bit of setup and you can follow these steps:

1. Add `custom-ip=play.myserver.net` to your `server.properties` file
2. Depending on how many worlds you run, you'll need to port forward twice as many ports from the 19132 port. For example, if I had 3 worlds then I would open up ports 19132 to 19137.

That's it for setup, if you need any help at all with this you can contact me on discord `@misledwater79` and i'll try to respond asap.
