import fetch from "node-fetch";
import {config} from "dotenv";
import path from "node:path";
config({ path: path.join(__dirname, "..", ".env") });

const CLIENT_ID = process.env.CLIENT_ID!;
const TOKEN = process.env.BOT_ACCESS!;

export async function getUserId(username: string): Promise<string> {
	const res = await fetch(
		`https://api.twitch.tv/helix/users?login=${username.toLowerCase()}`,
		{
			headers: {
				"Client-ID": CLIENT_ID,
				"Authorization": `Bearer ${TOKEN}`
			}
		}
	);

	const json = await res.json();

	if (!json.data?.length) {
		throw new Error("User not found: " + username);
	}

	return json.data[0].id;
}