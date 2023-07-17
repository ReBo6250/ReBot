const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const token = 'MTEzMDI4MzIxOTQzOTMzMzQ2Nw.GB-Qzq.ElQSEQEyYPqwELRshoMMsa9D_fvBQs_d0m2ICI';
const botPrefix = '-rebot ';

const gameWordTriggers = ['game', 'raro', 'ra', 'g', 'laro', 'tara'];
const questionWordTriggers = ['ano', 'bakit', 'ket', 'ha', 'anu', 'saan', 'pano', 'panu'];
const allWordTriggers = [...gameWordTriggers, ...questionWordTriggers];

client.on('ready', () => {
  console.log(`${client.user.tag} is online`);
});

client.on('messageCreate', (message) => {
  if (message.content.startsWith(botPrefix)) {
    switchCaseCommand(message);
  }
  else {
    if (message.author.bot) return;

    for (let index = 0; index < allWordTriggers.length; index++) {
      const word = allWordTriggers[index];
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(message.content)) {
        if (gameWordTriggers.includes(word)) {
          replyToGameWordTriggers(message, word)
          return;
        }
        if (questionWordTriggers.includes(word)) {
          replyToQuestionWordTriggers(message, word)
          return;
        }
      }
    }
  }
});


client.login(token);






function replyToGameWordTriggers(message, word) {
  const replyTexts = [
    `${word} ka mag-isa`, 
    `gusto ko sana kaso ayaw ni JJ`,
    `maghuhugas pa ko pinggan`,
    `${word} ka!`,
    `set na!`,
    `${word}!`
  ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}


function replyToQuestionWordTriggers(message, word) {
  const replyTexts = [
    `ewan`, 
    `alam ko pero di ko sasabihin`,
    `sagot ko 42`
  ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}









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