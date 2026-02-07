import http from "http";
import path from "path";
import fs from "node:fs";

async function getOAuthCode(): Promise<string> {
	return new Promise((resolve) => {
		const server = http.createServer((req, res) => {
			const url = new URL(req.url!, "http://localhost");
			const code = url.searchParams.get("code");

			res.writeHead(200, { "Content-Type": "text/plain" });
			res.end("Authorization successful! You can close this window.");

			server.close();
			resolve(code || "");
		});

		server.listen(3000, () => {
			console.log("OAuth listener running");
		});
	});
}

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000"; // MUST MATCH REDIRECT IN TWITCH DEVELOPER CENTER

async function getBroadcasterTokens(): Promise<{ access_token: string, refresh_token: string } | void> {
	if (!CLIENT_ID || !CLIENT_SECRET) {
		return console.error("Unable to proceed. Please verify Client ID and Client Secret are set in the .env");
	}

	const scopes = [
		"channel:read:redemptions",
	].join("+");
	const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scopes}`;

	console.log("Open this URL in your browser and authorize your channel:");
	console.log(authUrl);

	const code = await getOAuthCode();

	if (!code) throw new Error("No authorization code received.");

	const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token`, {
		method: "POST",
		body: new URLSearchParams({
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			code: code,
			grant_type: "authorization_code",
			redirect_uri: REDIRECT_URI
		})
	});

	const tokenData = await tokenRes.json();
	if (!tokenData.access_token || !tokenData.refresh_token) {
		throw new Error(`Failed to get tokens: ${JSON.stringify(tokenData)}`);
	}

	const envPath = path.join(__dirname, "..", ".env");
	let envContent = fs.readFileSync(envPath, "utf-8");

	envContent = envContent
	.replace(/BOT_ACCESS=.*/g, `BOT_ACCESS=${tokenData.access_token}`)
	.replace(/REFRESH_TOKEN=.*/g, `REFRESH_TOKEN=${tokenData.refresh_token}`);

	fs.writeFileSync(envPath, envContent);

	process.env.BOT_ACCESS = tokenData.access_token;
	process.env.REFRESH_TOKEN = tokenData.refresh_token;

	console.log("Received User Token & updated .env");

	return {
		access_token: tokenData.access_token,
		refresh_token: tokenData.refresh_token
	};
}

async function refreshUserToken(): Promise<string> {
	const res = await fetch("https://id.twitch.tv/oauth2/token", {
		method: "POST",
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: process.env.REFRESH_TOKEN!,
			client_id: process.env.CLIENT_ID!,
			client_secret: process.env.CLIENT_SECRET!,
		}),
	});

	const data = await res.json();
	if (!data.access_token || !data.refresh_token) {
		throw new Error(`Failed to refresh token: ${JSON.stringify(data)}`);
	}

	const envPath = path.join(__dirname, "..", ".env");
	let envContent = fs.readFileSync(envPath, "utf-8");

	envContent = envContent
	.replace(/BOT_ACCESS=.*/g, `BOT_ACCESS=${data.access_token}`)
	.replace(/REFRESH_TOKEN=.*/g, `REFRESH_TOKEN=${data.refresh_token}`);

	fs.writeFileSync(envPath, envContent);

	process.env.USER_ACCESS_TOKEN = data.access_token;
	process.env.REFRESH_TOKEN = data.refresh_token;

	console.log("Refreshed User Token & updated .env");
	return data.access_token;
}

export async function initBotTokens(): Promise<string | void> {
	if (process.env.BOT_ACCESS || process.env.REFRESH_TOKEN) {
		console.log("Broadcaster tokens found, refreshing...");
		return refreshUserToken(); // auto-refresh
	} else {
		console.log("No broadcaster tokens found, manual authorization required...");
		const tokens = await getBroadcasterTokens(); // only needed once
		if (tokens?.access_token) return tokens.access_token;

		return;
	}
}