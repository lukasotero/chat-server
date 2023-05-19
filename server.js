const { showWelcomeMessage, showUserStatus, sendMessage, handleInput, extractChannelsFromMotd, showAvailableChannels, joinDefaultChannel } = require('./helpers');

const {
  showHelpMenu
} = require('./help.js');

const irc = require('irc');
const chalk = require('chalk');
const figlet = require('figlet');
const prompts = require('prompts');
const gradient = require('gradient-string');
const readline = require('readline');

const host = '181.229.125.113'; 
const port = 8657;
const channels = ['#general', '#Help'];
let currentChannel = channels[0];
let client;
let isAsciiDisplayed = false;
let spinner;
let rl;

console.log(gradient.rainbow(figlet.textSync('¡Chat IRC!', {
  horizontalLayout: 'full'
})));

(async () => {
  const {
    username
  } = await prompts({
    type: 'text',
    name: 'username',
    message: 'Usuario:'
  });

  const {
    password
  } = await prompts({
    type: 'password',
    name: 'password',
    message: 'Contraseña:'
  });

  showWelcomeMessage(username);
  runChatClient(username, password);
})();

function runChatClient(username, password) {
  const clientOptions = {
    port,
    userName: username,
    password,
    channels
  };

  function startSpinner() {
    const spinnerFrames = ['-', '\\', '|', '/'];
    let frameIndex = 0;
  
    spinner = setInterval(() => {
      const connectingText = chalk.yellow('Conectando al host...');
      process.stdout.write(`${spinnerFrames[frameIndex % spinnerFrames.length]} ${connectingText}\r`);
      frameIndex++;
    }, 100);
  }

  function connectToHost() {
    client = new irc.Client(host, username, clientOptions);

    client.addListener('motd', (motd) => {
      availableChannels = extractChannelsFromMotd(motd);
      showAvailableChannels(availableChannels);
      joinDefaultChannel(client, availableChannels[0] || '#general');
    });

    client.addListener('registered', () => {
      connectedHost = host;
      clearInterval(spinner);
      const connectedMessage = chalk.green(`Conectado a ${connectedHost}`);
      console.log(connectedMessage);
      showUserStatus(client);

      const generalChannel = '#general';
      if (!channels.includes(generalChannel)) {
        client.join(generalChannel, () => {
          currentChannel = generalChannel;
          console.log(chalk.green(`Se ha creado la sala "${generalChannel}"`));
          rl.setPrompt(`${currentChannel}> `);
          rl.prompt();
        });
      } else {
        currentChannel = generalChannel;
        rl.setPrompt(`${currentChannel}> `);
        rl.prompt();
      }
      


      rl.question('', (message) => {
        sendMessage(client, currentChannel, message);
      });
      rl.setPrompt(`${currentChannel}> `);
      rl.prompt();
    });

    client.addListener('message', (from, to, message) => {
      const userColor = chalk[getRandomColor()];
      const timestamp = getCurrentTimestamp();

      console.log(`[${timestamp}] [${to}] ${userColor('<' + from + '>')} ${message}`);
    });

    client.addListener('error', (message) => {
      handleConnectionError(message, host, client);
    });

    client.addListener('selfMessage', (to, message) => {
      if (!isAsciiDisplayed) {
        isAsciiDisplayed = true;
      }
      const timestamp = getCurrentTimestamp();
      console.log(`[${timestamp}] [${to}] ${chalk.green('<' + username + '>')} ${message}`);
    });

    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      historySize: 0
    });

    rl.on('line', (input) => {
      handleInput(input);
    });

    connectionTimeout = setTimeout(() => {
      console.log(chalk.red('No se pudo conectar al host. La sesión se cerrará.'));
      process.exit(1);
    }, 120000); 

    startSpinner();
  }

  function handleConnectionError(error, host, client) {
    clearInterval(spinner);
    console.log(`Error al conectar a ${host}`);
    client.disconnect();
    client.on('raw', (message) => {
      if (message.command === 'ERROR') {
        const errorMessage = message.args.join(' ');
        const bannedRegex = /You are banned from this server- Your irc client seems broken and is flooding lots of channels\. Banned for \d+ min, if in error, please contact bans@libera\.chat\. \(\d+\/\d+\/\d+ \d+:\d+\)/;
        const match = errorMessage.match(bannedRegex);
        if (match) {
          const reason = 'Tu cliente IRC parece estar defectuoso y está inundando muchos canales.';
          console.log(chalk.red('¡Estás prohibido en este servidor!'));
          console.log(chalk.red(`Motivo: ${reason}`));
          console.log(chalk.red('Si esto es un error, por favor, contacta a bans@libera.chat.'));
          process.exit(1);
        } else {
          console.log(chalk.red(errorMessage));
          process.exit(1);
        }
      }
    });

    connectToHost();
  }

  connectToHost();
}

function getRandomColor() {
  const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

function getCurrentTimestamp() {
  const date = new Date();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return chalk.dim(`${hours}:${minutes}:${seconds}`);
}

