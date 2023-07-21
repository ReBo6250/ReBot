// Discord
require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const botPrefix = '-rebot ';
client.login(process.env.token);

client.on('ready', () => {
  console.log(`${client.user.tag} is online`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith(botPrefix.toLowerCase())) { // Check if the message starts with the bot prefix
    switchCaseCommand(message);
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
const { setPrompt } = require('./data/scenario.js')

async function aiServerChat(message) {
  const messageContent = message.content.toLowerCase().replace(botPrefix, ''); // Trim bot prefix
  const currentTime = new Date().toLocaleString(); // Get the current date and time

  // If the user has a nickname, use it; otherwise, use the username
  const displayName = message.member.displayName;

  try {
    // Check if the user has any previous conversation
    const conversationRef = db.ref(`conversations/${message.guild.id}`);
    const conversationSnapshot = await conversationRef.once('value');
    let conversationData = conversationSnapshot.val() ? conversationSnapshot.val().conversation : [];

    // Add the user message to the conversation history with the current date and time
    conversationData.push({ role: 'user', userId: message.author.id, displayName: displayName, content: messageContent, timeSent: currentTime });

    // Create a list of previous user messages as context for AI response
    const context = conversationData.map(item => `\t${item.timeSent}\n${item.role} ${item.userId}(${item.displayName}): ${item.content}`).join('\n');
    // Make an API call to OpenAI to get the chat completion response
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-16k',
      messages: [{ role: "user", content: setPrompt(context) }],
      temperature: 0,
      top_p: 1,
      frequency_penalty: 1.0,
      presence_penalty: 1.0,
      max_tokens: 3000,
    });
    // Extract the response text from the completion
    const botResponse = completion.data.choices[0].message;

    // Add the bot's response to the conversation history with the current date and time
    conversationData.push(botResponse);

    // Save the updated conversation data to Firebase Realtime Database
    await conversationRef.set({ conversation: conversationData });

    // Reply to the message with the bot's response
    message.reply(botResponse);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Retry the request after a delay (e.g., 5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));
      // Retry the function call
      return aiServerChat(message);
    } else {
      // Handle other errors
      console.error('Error in AI chat:', error);
      return 'An error occurred while processing your message.';
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
  command = message.content.toLowerCase().replace(botPrefix.toLowerCase(), '')

  switch (command) {
    case 'logout':
      logOut(message);
      break;

    default:
      aiServerChat(message);
      break;
  }
}

