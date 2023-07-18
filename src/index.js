require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const {Configuration, OpenAIApi} = require("openai")
const configuration = new Configuration({ apiKey: process.env.apiKey })

const openai = new OpenAIApi(configuration)
const botPrefix = '-rebot ';

const specialWordTriggers = ['haha', 'hahaha', 'sino ka', 'dn', 'marben', 'rebo', 'rebot', 'umalis', 'tae', 'bruh', 'wag', 'hoy', 'nigga', 'sad', 'sadge', 'hin', 'gomen', 'hbd', 'happy birthday', 'bertdey', 'berdei', 'bts', 'kpop', 'i love you', 'mahal kita', 'aishiteru', 'ha'];
const gameWordTriggers = ['tara', 'game', 'raro', 'ra', 'g', 'laro', 'tara', 'what', 'wut', 'nani', 'set'];
const questionWordTriggers = ['?','kailan', 'kelan', 'bat', 'ano', 'bakit', 'ket', 'anu', 'saan', 'pano', 'panu', 'anong', 'anung', 'paano', 'paanong', 'panung', 'panong', 'saan'];
const insultWordTriggers = ['gae', 'gay', 'pink', 'yellow', 'red', 'black', 'violet', 'purple', 'pilay', 'mama', 'pangit', 'panget', 'bot', 'weak', 'talo'];
const curseWordTriggers = ['fuck', 'gagi', 'gago', 'shit', 'tanga', 'putang ina', 'pota'];
const greetingsWordTriggers = ['oi', 'hey', 'uy', 'hi', 'hello', 'balita', 'musta', 'ey'] ;
const apologizingWordTriggers = ['sori', 'sorna', 'sorry', 'sensya'];
const partingWordTriggers = ['bye'];
const allWordTriggers = [...gameWordTriggers, ...questionWordTriggers, ...insultWordTriggers, ...curseWordTriggers, ...greetingsWordTriggers, ...specialWordTriggers];

client.login(process.env.token);


client.on('ready', () => {
  console.log(`${client.user.tag} is online`);
});


async function aiChat(message) {
  try {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: message.content,
        max_tokens: 3000
    })
    message.reply(completion.data.choices[0].text)
  }catch (e) {
      console.log(e)
  }
}

function switchCaseCommand(message) {
  command = message.content.replace(botPrefix, '')

  switch (command) {
    case 'logout':
      logOut(message);
      break;
  
    default:
      aiChat(message);
      break;
  }
}


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
        if (specialWordTriggers.includes(word)) {
          replyToSpecialWordTriggers(message, word)
          return;
        }
        if (gameWordTriggers.includes(word)) {
          replyToGameWordTriggers(message, word)
          return;
        }
        if (questionWordTriggers.includes(word)) {
          replyToQuestionWordTriggers(message, word)
          return;
        }
        if (insultWordTriggers.includes(word)) {
          replyToInsultWordTriggers(message, word)
          return;
        }
        if (curseWordTriggers.includes(word)) {
          replyToCurseWordTriggers(message, word)
          return;
        }
        if (apologizingWordTriggers.includes(word)) {
          replyToApologizingWordTriggers(message, word)
          return;
        }
        if (greetingsWordTriggers.includes(word)) {
          replyToGreetingsWordTriggers(message, word)
          return;
        }
        if (partingWordTriggers.includes(word)) {
          replyToPartingWordTriggers(message, word)
          return;
        }
      }
    }
  }
});






function replyToGameWordTriggers(message, word) {
  const replyTexts = [ `${word} ka mag-isa`, `Gusto ko sana kaso ayaw ni JJ`, `Maghuhugas pa ko pinggan`, `${word} ka!`, `Set na!`, `${word}!` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

function replyToQuestionWordTriggers(message, word) {
  const replyTexts = [ `Ewan`, `${word}?`, `Gamit ka calcu`, `Alam ko pero di ko sasabihin`, `Sagot ko ${Math.floor(Math.random() * 100)}` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

function replyToInsultWordTriggers(message, word) {
  const replyTexts = [ `Mama mo ${word}!`, `Mas ${word} ka!`, `Oof!` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

function replyToCurseWordTriggers(message, word) {
  const replyTexts = [ `Oi bawal yan`, `Ah?`, `Mahal din kita`, `Mama may nagmumura o`, `Ano pong lingwahe yan?` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

function replyToApologizingWordTriggers(message, word) {
  const replyTexts = [ `Pinapatawad na kita`, `Apology accepted!`, `Di kita mapapatawad!`, `${word} mo mama mo! >:(` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

function replyToGreetingsWordTriggers(message, word) {
  const replyTexts = [ `Hey`, `Uyyyy`, `Balita?`, `Musta na!`, `Long time no see! (?)` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

function replyToPartingWordTriggers(message, word) {
  const replyTexts = [ `Bawal umales!`, `Umales panget!`, `Oi bawal umales!`, `Luh?!`, `Pinagbabawalan kitang umalis.` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

function replyToSpecialWordTriggers(message, word) {
  let replyTexts = [];
  switch (word.toLowerCase()) {
    case 'hbd':
    case 'berdei':
    case 'happy birthday':
    case 'happy birthday':
    case 'bertdey':
      replyTexts = [ `Uy birthday!`, `We? Birthday mo ngayooon?`, `Hapi berdey!`, `Magsosoli na ako ng walis tingting`, `Happy birthday so much!` ]
      break;

    case 'bts':
    case 'kpop':
    case 'tae':
      replyTexts = [ `Yok`, `Eww!`, `Disgust`, `Wews` ]
      break;
    case 'bruh':
      replyTexts = [ `Bruh!`]
      break;
    case 'wag':
      replyTexts = [ `Sige`, `OK di na`, `de, wala` ]
      break;
    case 'aishiteru':
      replyTexts = [ `Kyah~!`, `Doki~!`, `Kyun~!`, `Kanojo ga aru no de, gomen!` ]
      break;

    case 'hoy':
      replyTexts = [ `Pinoy ako~!` ]
      break;

    case 'marben':
    case 'rebo':
    case 'rebot':
      replyTexts = [ `Wala pa kong ginagawa`, `Inosente ako`, `Uy! Natawag ako` ]
      break;
    case 'sino ka':
      replyTexts = [ `Ako ikaw mula sa future` ]
      break;

    case 'nigga':
      replyTexts = [ `Ah~!`, `AAAAAAAAAAAAAAAAH!`, `Aa Aa Aaaah!` ]
      break;

    case 'i love you':
    case 'mahal kita':
      replyTexts = [ `Kyah~!`, `Doki~!`, `Kyun~!` ]
      break;
      
    case 'ha':
        replyTexts = [ `Hatdog!`, `Halaman!`, `Hangin!`, `Halimaw`, `Habagat` ]
        break;

    case 'haha':
    case 'hahaha':
      replyTexts = [ `Tawa ka d'yan a`, `Funny ane?`, `Luh di naman nakakatawa e`, `HAHAHA!`, `Ha Ha Ha` ]
      break;

    case 'gomen':
        replyTexts = [ `Yurusanai!`, `Yurusan!`, `Yurusan zo!` ]
        break;

    case 'sad':
    case 'hin':
    case 'sadge':
        replyTexts = [ `Sad XD`, `Hin :(((`, `Pien~! :(` ]
        break;

    case 'umalis':
        replyTexts = [ `Pabalikin mo bilis` ]
        break;

    case 'dn':
        replyTexts = [ `DN ka na naman~`, `Dragon Nest pa more`, `DN pa more!` ]
        break;

    default:
        replyTexts = [ `Wews` ]
        break;
  }

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
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