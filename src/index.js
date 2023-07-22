// General
const { prompt, botName, botPrefix } = require('./data/constants.js')
const { replaceDataInFirebase, getDataFromFirebase, saveDataToFirebase } = require('./data/utils.js')



// Discord
require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login(process.env.token);

client.on('ready', () => {
  console.log(`${client.user.tag} is online`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith(botPrefix.toLowerCase())) { // Check if the message starts with the bot prefix
    switchCaseCommand(message);
  }
  else {
    const settings = await getDataFromFirebase(db, `conversations/${message.guild.id}/settings`);
    if (settings.isReading) { saveConversation(message, false) }
  }
});


// Firebase Database
const admin = require('firebase-admin');
const serviceAccount = require('./data/rebot-85-firebase-adminsdk-o3g9o-4753ebf10a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL
});
const db = admin.database();


// OpenAI
const { Configuration, OpenAIApi } = require("openai")
const configuration = new Configuration({ organization: process.env.org, apiKey: process.env.apiKey })
const openai = new OpenAIApi(configuration)

async function saveConversation(message, saveBotResponse = true) {
  const currentTime = new Date().toLocaleString(); // Get the current date and time
  const displayName = message.member.displayName;

  conversationData = await getDataFromFirebase(db, `conversations/${message.guild.id}/conversation`);

  // Add the user message to the conversation history with the current date and time
  conversationData.push({ role: 'user', userId: message.author.id, displayName: displayName, content: message.content, timeSent: currentTime });

  // Create a list of previous user messages as context for AI response
  let context = conversationData.map(item => `${item.timeSent ? '\n' : ''}${item.timeSent ? `${item.timeSent}\n` : ''}${item.role == 'assistant' ? botName : item.role}${item.userId ? ` ${item.userId}` : ''}${item.displayName ? `(${item.displayName})` : ''}: ${item.content}\n`).join('');
  // Make an API call to OpenAI to get the chat completion response
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo-16k',
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: context }
    ],
    temperature: 1,
    top_p: 0.5,
    frequency_penalty: 1.0,
    presence_penalty: 1.0,
    max_tokens: 4096,
  });
  // Extract the response text from the completion
  let botResponse = completion.data.choices[0].message;
  botResponse.content = botResponse.content.replace(`${botName}: `, ''); // Trim <Bot Name>: in its response content
  // Add the bot's response to the conversation history with the current date and time
  if (saveBotResponse) { conversationData.push(botResponse); }

  // Save the updated conversation data to Firebase Realtime Database
  await saveDataToFirebase(db, `conversations/${message.guild.id}/conversation`, conversationData)
  return {context, botResponse};
}

async function aiServerChatReply(message) {
  try {
    const conversation = await saveConversation(message, true)

    // Reply to the message with the bot's response
    message.reply(conversation.botResponse);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Retry the request after a delay (e.g., 5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));
      // Retry the function call
      return aiServerChatReply(message);
    } else {
      // Handle other errors
      console.error('Error in AI chat:', error);
      message.reply('An error occurred while processing your message.');
    }
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

async function startReading(message) {
  try {
    await replyWithPromise(message, 'I will now start reading the upcoming messages!');
    replaceDataInFirebase(db, `conversations/${message.guild.id}/settings`, {isReading: true})
  } catch (error) {
    console.error('Error:', error);
  }
}
async function stopReading(message) {
  try {
    await replyWithPromise(message, 'I will now stop the upcoming messages!');
    replaceDataInFirebase(db, `conversations/${message.guild.id}/settings`, {isReading: false})
  } catch (error) {
    console.error('Error:', error);
  }
}


async function logOut(message) {
  try {
    await replyWithPromise(message, 'Bye!');
    console.log(`${client.user.tag} is offline`);
    client.destroy();
  } catch (error) {
    console.error('Error sending reply:', error);
  }
}

function switchCaseCommand(message) {
  message.content = message.content.toLowerCase().replace(botPrefix, ''); // Trim bot prefix

  switch (message.content) {
    case 'logout':
      logOut(message);
      break;
    case 'start reading':
      startReading(message);
      break;
    case 'stop reading':
      stopReading(message);
      break;
    default:
      aiServerChatReply(message);
      break;
  }
}

