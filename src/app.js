import tmi from 'tmi.js'
import axios from 'axios'
import config from './config/config.json'

// Define configuration options
const options = {
    options: {
        debug: true
    },
    connection: {
        reconnection: true,
        secure: true
    },
    identity: {
        username: config.twitch.bot.username,
        password: config.twitch.oauth
    },
    channels: config.twitch.channels
};

// Create a client with our options
const client = new tmi.client(options);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  console.log(context)

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '!stats') {
    const playerStats = getPlayerStats("origin", "T3M_HaxxouTV").then(res => {
        return getLastMatch(res)
    }).then(res => {
        if (res.stats.hasOwnProperty("winsWithFullSquad")) {
            return client.say(target, `Last game won`);
        } else {
            return client.say(target, `Last game lost`);
        }
    }).then(() => {
        console.log(`* Executed ${commandName} command`);    
    }).catch(err => {
        console.log(err)
    })
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
}

function getLastMatch(data) {
    return data.items[0].matches[0]
}

async function getPlayerStats(platform, platformUserIdentifier) {
    return await axios.get(`https://public-api.tracker.gg/v2/apex/standard/profile/${platform}/${platformUserIdentifier}/sessions`, {
        headers: {
            "Content-Type": "application/json",
            "TRN-Api-Key": config.tracker.apex.api_key
        }
    })
    .then((res) => {
        console.log(res)
        return res.data.data;
    }).catch((err) => {
        return console.log(err);
    })
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}