const readline = require('readline');
const irc = require('irc');
const chalk = require('chalk');
const figlet = require('figlet');
const prompts = require('prompts');

const hosts = [
  'irc.libera.chat',
  'irc.eu.libera.chat',
  'irc.us.libera.chat',
  'irc.au.libera.chat',
  'irc.ea.libera.chat',
  'irc.ipv4.libera.chat',
  'irc.ipv6.libera.chat'
];

const port = 6697;
const channels = ['#libera', '#linux'];

console.log(chalk.cyan(figlet.textSync('¡Chat IRC!', { horizontalLayout: 'full' })));

(async () => {
  const { username } = await prompts({
    type: 'text',
    name: 'username',
    message: 'Usuario:'
  });

  const { password } = await prompts({
    type: 'password',
    name: 'password',
    message: 'Contraseña:'
  });

  console.log(chalk.green(figlet.textSync(`¡Bienvenido ${username}!`, { horizontalLayout: 'full' })));
  runChatClient(username, password);
})();

const runChatClient = (username, password) => {

  const handleConnectionError = (error, host, client) => {
    clearInterval(spinner);
    console.log(`Error al conectar a ${host}`);
    client.disconnect();
  
    // Obtener el mensaje de error real del servidor IRC
    client.on('raw', (message) => {
      if (message.command === 'ERROR') {
        const errorMessage = message.args.join(' ');
  
        // Extraer información adicional sobre la prohibición
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
  
    connectToHost(index + 1);
  };
  

  const clientOptions = {
    port,
    userName: username,
    password,
    secure: true,
    channels
  };

  let connectedHost;
  let isAsciiDisplayed = false;
  let spinner;

  const startSpinner = () => {
    const spinnerFrames = ['-', '\\', '|', '/'];
    let frameIndex = 0;
    connectedHost = hosts[0]; // Inicializar con el primer host
  
    spinner = setInterval(() => {
      const connectingText = chalk.yellow('Conectando a ') + chalk.cyan(connectedHost);
      process.stdout.write(`${spinnerFrames[frameIndex % spinnerFrames.length]} ${connectingText}\r`);
      frameIndex++;
    }, 100);
  };
  const connectToHost = (index) => {
    if (index >= hosts.length) {
      console.log(chalk.red('No se pudo conectar a ningún host.'));
      process.exit(1);
    }

    const host = hosts[index];
    const client = new irc.Client(host, username, clientOptions);

    client.addListener('registered', () => {
      connectedHost = host;
      clearInterval(spinner);
      const connectedMessage = chalk.green(`Conectado a ${connectedHost}`);
      console.log(connectedMessage);
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
        console.log(chalk.cyan(figlet.textSync('¡Conexión IRC!', { horizontalLayout: 'full' })));
        isAsciiDisplayed = true;
      }
      const timestamp = getCurrentTimestamp();
      console.log(`[${timestamp}] [${to}] ${chalk.green('<' + username + '>')} ${message}`);
    });

    startSpinner();
  };

  connectToHost(0);
  
    const getRandomColor = () => {
      const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
      const randomIndex = Math.floor(Math.random() * colors.length);
      return colors[randomIndex];
    };
  
    const getCurrentTimestamp = () => {
      const date = new Date();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return chalk.dim(`${hours}:${minutes}:${seconds}`);
    };
  };
