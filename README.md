# chat-server

## Objetivo del proyecto :dart:
Implementar un cliente/servidor con el protocolo IRC, en el cual un usuario puede chatear en tiempo real con otro (a través de una interfaz de línea de comandos). Luego, si se logra un funcionamiento óptimo, considerar la posibilidad de crear una extensión con la misma idea.

## Descripción :memo:
Este proyecto consta de un cliente y un servidor IRC que permiten a los usuarios conectarse a un servidor de chat IRC y comunicarse con otros usuarios en tiempo real. El cliente proporciona una interfaz de línea de comandos (CLI) para enviar y recibir mensajes, unirse a canales, gestionar usuarios, entre otras funcionalidades.

## Funcionalidades Principales :wrench:
- Conexión a un servidor IRC.
- Envío y recepción de mensajes en tiempo real.
- Unirse y salir de canales.
- Establecer mensaje de ausencia.
- Invitar usuarios a canales.
- Cambiar el apodo del usuario.
- Gestionar los privilegios de los usuarios en un canal (op/deop, voice/devoice).
- Mostrar información del servidor y de los usuarios.

## Requisitos :point_left:
- Node.js
- Bibliotecas npm: irc, chalk, figlet, prompts, gradient-string, readline

## Instalación :point_left:
1. Clona este repositorio en tu máquina local.
2. Instala las dependencias ejecutando `npm install` en el directorio raíz del proyecto.

## Uso :rocket:
1. Ejecuta el servidor usando `node server.js`.
2. Sigue las instrucciones para ingresar un nombre de usuario y contraseña.
3. Una vez conectado, podrás comenzar a chatear utilizando los comandos disponibles.

## Contribución :sunglasses:
Si deseas contribuir a este proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Haz tus cambios y realiza commits (`git commit -am 'Añadir nueva funcionalidad'`).
4. Sube tus cambios al repositorio (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Créditos :octocat:
Este proyecto fue desarrollado por [Lucas De Palma](https://github.com/DePalma2) y [Lukas Otero](https://github.com/lukasotero).
