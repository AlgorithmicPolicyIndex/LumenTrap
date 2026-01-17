import { Client } from "tmi.js";
import { config } from "dotenv";
import path = require("node:path");
import {findDevices, setBrightnessPercentage, turnOff, turnOn} from "litra";
config({ path: path.join(__dirname, "..", ".env") });

const client = new Client({
	// * This is to handle bot accounts,
	// See https://github.com/AlgorithmicPolicyIndex/ChatPlays/blob/main/src/Services.ts#L39-L64
	// for more details.
	// It is NOT required for this app to work.

	// options: {
	// 	clientId: process.env.CLIENT_ID,
	// }
	// identity: {
	// 	username: process.env.CLIENT_USERNAME,
	// 	password: process.env.CLIENT_PASSWORD,
	// }
	connection: {
		reconnect: true,
		secure: true,
	},
	channels: [ process.env.CHANNEL! ]
});
client.connect().then((fullfilled) => {
	console.log(fullfilled);
}, (onrejected) => {
	console.error(onrejected);
});

const devices = findDevices();
//DEBUG const devices = Array.from({ length: 10 }, (_, i) => i);
const [INITIAL, DURATION, INTENSITY] = [
	parseInt(process.env.FLASH_INITIAL!),
	parseInt(process.env.FLASH_DURATION!),
	parseInt(process.env.FLASH_INTENSITY!)
];
const TOTAL = INITIAL + DURATION + INITIAL;

// We're going to use Channel Points for this.
// You're going to have to set this manually,
// since I can not exactly check what channel reward you want to use.
client.on("redeem", async (_channel, _username, _type, _userData) => {
	// Use this to find your Reward ID
	// Once you find it, place into .env. and remove this line. if you want.
	console.log(`Reward ${_type} used by ${_userData}`);

	if (_type !== process.env.REWARD) return;

	console.log(`${_username} has decided "FUCK YOU" and has flash-banged you.`)

	const start = Date.now();
	const interval = setInterval(() => {
		const elapsed = Date.now() - start;
		if (elapsed >= TOTAL) {
			devices.forEach((device) => {
				//DEBUG console.log(`Device-${device} lowered to 0, turning off.`);
				setBrightnessPercentage(device, 0);
				turnOff(device);
			});
			clearInterval(interval);
			return;
		}

		const env = envolope(elapsed);
		const value = Math.max(0, Math.min(INTENSITY, env * INTENSITY));
		devices.forEach((device) => {
			//DEBUG console.log(`Device-${device} set to ${value}`);
			turnOn(device);
			setBrightnessPercentage(device, value);
		});
	}, 16);
});

function envolope(elapsed: number): number {
	if (elapsed < INITIAL) return elapsed / INITIAL;
	if (elapsed < INITIAL + DURATION) return 1;
	if (elapsed < TOTAL) return 1 - (elapsed - INITIAL - DURATION) / INITIAL;
	return 0;
}