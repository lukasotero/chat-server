const readline = require('readline');
const irc = require('irc');
const chalk = require('chalk');


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
const channels = ['#libera', '#linux']; // Agrega los canales a los que deseas unirte

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Usuario: ', (username) => {
  rl.question('Contraseña: ', (password) => {
    rl.close();

    // Función para generar un color aleatorio
    const getRandomColor = () => {
      const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];
      const randomIndex = Math.floor(Math.random() * colors.length);
      return colors[randomIndex];
    };

    // Función para intentar conectar a los hosts disponibles
    const connectToHost = (index) => {
      if (index >= hosts.length) {
        console.log('No se pudo conectar a ningún host.');
        process.exit(1);
      }

      const host = hosts[index];
      const client = new irc.Client(host, username, {
        port,
        userName: username,
        password,
        secure: true,
        channels
      });

      client.addListener('registered', () => {
        console.log(`Conectado a ${host}`);
      });

      client.addListener('message', (from, to, message) => {
        const userColor = chalk[getRandomColor()];

        console.log(`[${to}] ${userColor('<' + from + '>')} ${message}`);
      });

      client.addListener('error', (message) => {
        console.log(`Error al conectar a ${host}: ${message}`);
        client.disconnect();
        connectToHost(index + 1);
      });
    };

    connectToHost(0);
  });
});