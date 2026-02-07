import { config } from "dotenv";
import path from "node:path";

import { getUserId } from "./twitchApi";
import { initEventSub } from "./eventSub";
import { flashBang } from "./flash";
import {initBotTokens} from "./botHandler";

config({ path: path.join(__dirname, "..", ".env") });

async function main() {
	await initBotTokens();

	// 1. Get broadcaster ID
	const channel = process.env.CHANNEL!;

	console.log("[BOOT] Resolving user ID...");

	const userId = await getUserId(channel);

	console.log("[BOOT] User ID:", userId);

	// 2. Start EventSub
	await initEventSub({
		userId,
		onRedeem: (event) => {

			const rewardId = event.reward.id;

			if (!process.env.REWARD) {
				console.log(
					`[REDEEM] ${event.user_name}: ${event.reward.title} (${event.reward.id})`
				);
			}

			if (rewardId === process.env.REWARD) {
				flashBang();
			}
		}
	});
}

main().catch(console.error);