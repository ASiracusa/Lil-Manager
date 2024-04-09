const express = require("express");
const db_conn = require('./db_connection');
require('dotenv').config();
const app = express();

app.listen(3000, () => {
  console.log("Project is running!");
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

const sh = require("./spoolhelpers.js");
const sf = require("./spoolfunctions.js");

client.on("ready", () => {
  
  console.log("Starting bot.");
  client.user.setPresence({ activity: null });
  
});

client.on("messageCreate", (message) => {
  
  // recognize a message as a command
  if (message.content.length > 0 && message.content[0] === "~" && message.content[1] !== "~") {
    
    // split parameters by spaces
    const preParams = message.content.split(" ");
    const params = [];
    preParams.forEach((preParam) => {
      params.push(preParam.replaceAll("_", " "));
    });
    params[0] = params[0].toLowerCase();

    // checks if command is unrecognized
    if (!Object.keys(sh.commandInfo).includes(params[0])) {
      message.channel.send("Unrecognized command **" + (params[0].substring(1, params[0].length)) + "**.");
      return;
    }
    var command = sh.commandInfo[params[0]];

    // checks param count and conditions
    if (sh.pcheckCount(message, params)) return;
    var checks = command["checks"];
    for (var c = 0; c < checks.length; c++) {
      var check = checks[c];
      if (check["function"](message, params, check["params"])) return;
    }

    command["function"](message, params, db_conn);
    
  }

});

client.login(process.env.TOKEN);
