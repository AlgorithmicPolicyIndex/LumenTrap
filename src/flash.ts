import {
	setBrightnessPercentage,
	turnOff,
	turnOn,
	findDevices
} from "litra";

const devices = findDevices();

const [INITIAL, DURATION, INTENSITY] = [
	parseInt(process.env.FLASH_INITIAL!),
	parseInt(process.env.FLASH_DURATION!),
	parseInt(process.env.FLASH_INTENSITY!)
];

const TOTAL = INITIAL + DURATION + INITIAL;

export function flashBang() {
	console.log("[FLASH] Activated");

	const start = Date.now();

	const interval = setInterval(() => {
		const elapsed = Date.now() - start;

		if (elapsed >= TOTAL) {
			devices.forEach((d) => {
				setBrightnessPercentage(d, 0);
				turnOff(d);
			});

			clearInterval(interval);
			return;
		}

		const env = envelope(elapsed);
		const value = Math.min(INTENSITY, env * INTENSITY);

		devices.forEach((d) => {
			turnOn(d);
			setBrightnessPercentage(d, value);
		});

	}, 16);
}

function envelope(elapsed: number) {
	if (elapsed < INITIAL) return elapsed / INITIAL;
	if (elapsed < INITIAL + DURATION) return 1;
	if (elapsed < TOTAL)
		return 1 - (elapsed - INITIAL - DURATION) / INITIAL;

	return 0;
}