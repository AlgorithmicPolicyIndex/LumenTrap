# LumenTrap
beeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

This program uses almost exclusively the .env file.  
It will be your friend.  

This was written for a [Streamer: ShadowDrift3r](https://twitch.tv/shadowdrift3r) because he asked me.

the .env file will look like this  
```dotenv
CHANNEL=
REWARD=

# How strong is the flash
# We loop through this, 0-INTENSITY, for INITIAL, until max which is when DURATION activates.
FLASH_INTENSITY=90
# These are in milliseconds
# How long it takes from 0-100
FLASH_INITIAL=50
# How long the flash lasts before it returns to 0
FLASH_DURATION=2000
```

`npm install` to install all packages needed.  

Set your channel name to your twitch **USERNAME**.  
> *this command will build and start the script*

run `npm run test` and then activate the channel point reward you want to be tied to this.  
In your terminal you will get a message similar to this `Reward ${_type} used by ${_userData}`  
`_type` will be your Channel Point ID, or in the `.env`, `REWARD`

INTENSITY, INITIAL and DURATION are all stuff specifically for the lights. The comments explain it, but here's another.
`INTENSITY`: The peak percentage brightness of the light.
`INITIAL`: How long it takes from 0, to reach the peak brightness (also how long it takes to reach 0, from the peak brightness.)
`DURATION`: How long the light stays at peak brightness, before it starts to dim.