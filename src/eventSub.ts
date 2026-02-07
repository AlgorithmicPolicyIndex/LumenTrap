import WebSocket from "ws";
import fetch from "node-fetch";

let ws: WebSocket | null = null;

interface EventSubOptions {
	userId: string;
	onRedeem: (event: any) => void;
}

export async function initEventSub(opts: EventSubOptions) {
	return new Promise<void>((resolve) => {
		ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

		ws.on("open", () => {
			console.log("[EventSub] Connected");
		});

		ws.on("message", async (data) => {
			const msg = JSON.parse(data.toString());

			if (msg.metadata.message_type === "session_welcome") {
				const sessionId = msg.payload.session.id;

				console.log("[EventSub] Session:", sessionId);

				await subscribe(opts.userId, sessionId);

				resolve();
			}

			if (msg.metadata.message_type === "notification") {
				opts.onRedeem(msg.payload.event);
			}
		});
	});
}

async function subscribe(userId: string, sessionId: string) {
	const res = await fetch(
		"https://api.twitch.tv/helix/eventsub/subscriptions",
		{
			method: "POST",
			headers: {
				"Client-ID": process.env.CLIENT_ID!,
				"Authorization": `Bearer ${process.env.BOT_ACCESS!}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				type: "channel.channel_points_custom_reward_redemption.add",
				version: "1",
				condition: {
					broadcaster_user_id: userId
				},
				transport: {
					method: "websocket",
					session_id: sessionId
				}
			})
		}
	);

	const json = await res.json();
	console.log("[EventSub] Subscribed:", json.data?.[0]?.id);
}