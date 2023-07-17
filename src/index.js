const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const token = 'MTEzMDI4MzIxOTQzOTMzMzQ2Nw.GB-Qzq.ElQSEQEyYPqwELRshoMMsa9D_fvBQs_d0m2ICI'
const botPrefix = '-rebot '

const wordTriggers = ['pink', 'red', 'blue', 'yellow']

client.on('ready', () => {
  console.log(`${client.user.tag} is online`);
});

client.on('messageCreate', (message) => {
  if (message.content.startsWith(botPrefix)) {
    switchCaseCommand(message);
  }
});


client.login(token);


function switchCaseCommand(message) {
  command = message.content.replace(botPrefix, '')

  switch (command) {
    case 'logout':
      logOut(message);
      break;
  
    default:
      break;
  }

  
}

function replyWithPromise(message, content) {
  return new Promise((resolve, reject) => {
    try {
      message.reply(content).then((sentMessage) => {
        resolve(sentMessage);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function logOut (message) {
  try {
    const sentMessage = await replyWithPromise(message, 'Bye!');
    console.log(`${client.user.tag} is offline`);
    client.destroy();
  } catch (error) {
    console.error('Error sending reply:', error);
  }
}