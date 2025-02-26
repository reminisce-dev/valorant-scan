import { AtpAgent } from "@atproto/api";
import * as dotenv from "dotenv";
import * as process from "process";
import { fetchResults } from "./esports/results.ts";
import { fetchUpcoming } from "./esports/upcoming.ts";
import http from "http";

dotenv.config();

const PORT = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Valorant Scan is active.\n");
  })
  .listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });

// Create a Bluesky Agent
const agent = new AtpAgent({
  service: "https://bsky.social",
});

async function processMatchResults() {
  const message = await fetchResults();
  if (message) {
    console.log("Posting match result:", message);
    await agent.post({
      text: message,
    });
  } else {
    console.log("No new match results.");
  }
}

async function processUpcomingMatches() {
  const message = await fetchUpcoming();
  if (message) {
    console.log("Posting upcoming match:", message);
    await agent.post({
      text: message,
    });
  } else {
    console.log("No new upcoming matches.");
  }
}

async function main() {
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME!,
    password: process.env.BLUESKY_PASSWORD!,
  });

  console.log("Logged into Bluesky.");

  await processMatchResults();
  await processUpcomingMatches();

  setInterval(processMatchResults, 180000);
  setInterval(processUpcomingMatches, 180000);
}

main();
