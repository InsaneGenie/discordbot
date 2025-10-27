import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import cron from "node-cron";
import fs from "fs";
import 'dotenv/config';

import express from "express";
const app = express();
app.get("/", (req, res) => res.send("✅ Bot is alive"));
app.listen(3000, () => console.log("🌐 Web server running"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages
  ],
});

// replace this with your own Discord user ID
const OWNER_ID = "262663950921891841"; 

let counter = 66;

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // load previous count
  if (fs.existsSync("count.txt")) {
    counter = parseInt(fs.readFileSync("count.txt", "utf-8"), 10);
  }

  // send daily DM + update status
  cron.schedule("0 9 * * *", async () => {
    counter++;
    fs.writeFileSync("count.txt", counter.toString());
    await sendDailyMessage(counter);
    await updateStatus(counter);
  });

  // initial send & status
  await sendDailyMessage(counter);
  await updateStatus(counter);
});

async function sendDailyMessage(day) {
  try {
    const user = await client.users.fetch(OWNER_ID);
    await user.send(`<:2575_Suicidekanna:854350005262090280> It’s **Day ${day}** of unemployment. Update your status idiot. <:2575_Suicidekanna:854350005262090280>`);
    console.log(`📩 Sent DM for Day ${day}`);
  } catch (err) {
    console.error("❌ Failed to send DM:", err);
  }
}

async function updateStatus(day) {
  await client.user.setPresence({
    activities: [{ name: `Day ${day}`, type: ActivityType.Streaming }],
    status: "online",
  });
}

client.login(process.env.TOKEN);
