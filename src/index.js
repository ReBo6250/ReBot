// Discord
require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const botPrefix = '-rebot ';

const specialWordTriggers = ['haha', 'hahaha', 'sino ka', 'dn', 'marben', 'rebo', 'rebot', 'umalis', 'tae', 'bruh', 'wag', 'hoy', 'nigga', 'sad', 'sadge', 'hin', 'gomen', 'hbd', 'happy birthday', 'bertdey', 'berdei', 'bts', 'kpop', 'i love you', 'mahal kita', 'aishiteru', 'ha'];
const gameWordTriggers = ['tara', 'game', 'raro', 'ra', 'g', 'laro', 'tara', 'what', 'wut', 'nani', 'set'];
const questionWordTriggers = ['kailan', 'kelan', 'bat', 'ano', 'bakit', 'ket', 'anu', 'saan', 'pano', 'panu', 'anong', 'anung', 'paano', 'paanong', 'panung', 'panong', 'saan'];
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

client.on('messageCreate', (message) => {
  if (message.content.startsWith(botPrefix.toLowerCase())) {
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

function switchCaseCommand(message) {
  command = message.content.toLowerCase().replace(botPrefix.toLowerCase(), '')

  switch (command) {
    case 'logout':
      logOut(message);
      break;
  
    default:
      aiChat(message);
      break;
  }
}




// Firebase Database
const admin = require('firebase-admin');
const serviceAccount = require('./data/rebot-85-firebase-adminsdk-o3g9o-4753ebf10a.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://rebot-85-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
  const db = admin.database();

// OpenAI
const {Configuration, OpenAIApi} = require("openai")
const configuration = new Configuration({ organization: process.env.org,  apiKey: process.env.apiKey })
const openai = new OpenAIApi(configuration)


// Functions
async function aiChat(message) {
  const messageContent = message.content.toLowerCase().replace(botPrefix, '');
  const userId = message.author.id;
  const currentTime = new Date().toLocaleString(); // Get the current date and time

  try {
    // Check if the user has any previous conversation
    const conversationRef = db.ref('conversations/' + userId);
    const conversationSnapshot = await conversationRef.once('value');
    let conversationData = conversationSnapshot.val() ? conversationSnapshot.val().conversation : [];

    // Add the user message to the conversation history with the current date and time
    conversationData.push({ role: 'user', content: messageContent, timeSent: currentTime });

    // Create a list of previous user messages as context for AI response
    const context = conversationData.map(item => item.content).join('\n');

    // Make an API call to OpenAI to get the chat completion response
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-16k',
      
      messages: [
        {role: "user", content: context}
      ],
      temperature: 0,
      top_p: 1,
      frequency_penalty: 1.0,
      presence_penalty: 0,
      max_tokens: 3000,
    });

    // Extract the response text from the completion
    const botResponse = completion.data.choices[0].message;

    // Add the bot's response to the conversation history with the current date and time
    conversationData.push({ role: 'assistant', content: botResponse, timeSent: currentTime });

    // Save the updated conversation data to Firebase Realtime Database
    await conversationRef.set({ conversation: conversationData });

    // Reply to the message with the bot's response
    message.reply(botResponse);
  } catch (error) {
    console.error('Error in AI chat:', error);
    return 'An error occurred while processing your message.';
  }
}





// Function for replying to game word triggers
function replyToGameWordTriggers(message, word) {
  const replyTexts = [ `${word} ka mag-isa`, `Gusto ko sana kaso ayaw ni JJ`, `Maghuhugas pa ko pinggan`, `${word} ka!`, `Set na!`, `${word}!` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

// Function for replying to question word triggers
function replyToQuestionWordTriggers(message, word) {
  const replyTexts = [ `Ewan`, `${word}?`, `Gamit ka calcu`, `Alam ko pero di ko sasabihin`, `Sagot ko ${Math.floor(Math.random() * 100)}` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

// Function for replying to insult word triggers
function replyToInsultWordTriggers(message, word) {
  const replyTexts = [ `Mama mo ${word}!`, `Mas ${word} ka!`, `Oof!` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

// Function for replying to curse word triggers
function replyToCurseWordTriggers(message, word) {
  const replyTexts = [ `Oi bawal yan`, `Ah?`, `Mahal din kita`, `Mama may nagmumura o`, `Ano pong lingwahe yan?` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

// Function for replying to apologizing word triggers
function replyToApologizingWordTriggers(message, word) {
  const replyTexts = [ `Pinapatawad na kita`, `Apology accepted!`, `Di kita mapapatawad!`, `${word} mo mama mo! >:(` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

// Function for replying to greetings word triggers
function replyToGreetingsWordTriggers(message, word) {
  const replyTexts = [ `Hey`, `Uyyyy`, `Balita?`, `Musta na!`, `Long time no see! (?)` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

// Function for replying to parting word triggers
function replyToPartingWordTriggers(message, word) {
  const replyTexts = [ `Bawal umales!`, `Umales panget!`, `Oi bawal umales!`, `Luh?!`, `Pinagbabawalan kitang umalis.` ]

  message.reply(replyTexts[Math.floor(Math.random() * replyTexts.length)]);
}

// Function for replying to special word triggers
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
    await replyWithPromise(message, 'Bye!');
    console.log(`${client.user.tag} is offline`);
    client.destroy();
  } catch (error) {
    console.error('Error sending reply:', error);
  }
}