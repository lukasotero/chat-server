async function showHelpMenu() {
    const choices = [{
            title: '/away [message]',
            description: 'Establecer mensaje de ausencia'
        },
        {
            title: '/deop <nick>',
            description: 'Quitar estado de operador a un usuario en este canal'
        },
        {
            title: '/devoice <nick>',
            description: 'Quitar estado de voz a un usuario en este canal'
        },
        {
            title: '/disconnect',
            description: 'Desconectarse del servidor'
        },
        {
            title: '/help',
            description: 'Mostrar menú de ayuda'
        },
        {
            title: '/invite <nick>',
            description: 'Invitar a un usuario al canal'
        },
        {
            title: '/join <name> [password]',
            description: 'Unirse a un canal'
        },
        {
            title: '/kick <nick> [comment]',
            description: 'Expulsar a un usuario del canal'
        },
        {
            title: '/mode [target] [modes] [mode args...]',
            description: 'Consultar o cambiar el modo de un canal o usuario'
        },
        {
            title: '/motd [server]',
            description: 'Obtener el Mensaje del Día'
        },
        {
            title: '/msg <target> <message>',
            description: 'Enviar un mensaje a un apodo o canal'
        },
        {
            title: '/nick <nick>',
            description: 'Cambiar apodo actual'
        },
        {
            title: '/notice <target> <message>',
            description: 'Enviar un aviso a un apodo o canal'
        },
        {
            title: '/op <nick>',
            description: 'Dar estado de operador a un usuario en este canal'
        },
        {
            title: '/part [reason]',
            description: 'Salir de un canal'
        },
        {
            title: '/quit',
            description: 'Salir del chat'
        },
        {
            title: '/reconnect',
            description: 'Reconectarse al servidor'
        },
        {
            title: '/unvoice <nick>',
            description: 'Quitar a un usuario de la lista de usuarios con voz'
        },
        {
            title: '/voice <nick>',
            description: 'Dar estado de voz a un usuario en este canal'
        },
        {
            title: '/who <mask>',
            description: 'Obtener una lista de usuarios'
        },
        {
            title: '/whois <nick>',
            description: 'Obtener información sobre un usuario'
        },
        {
            title: '/whowas <nick> [count]',
            description: 'Obtener información sobre un usuario desconectado'
        },
        {
            title: '/list [filter]',
            description: 'Obtener una lista de canales de la red'
        },
    ];

    const options = choices.map(choice => choice.title);
    const index = await prompts({
        type: 'select',
        name: 'index',
        message: 'Seleccione un comando para obtener más información:',
        choices: options,
    });

    const selectedChoice = choices[index.index];
    console.log(`Comando: ${selectedChoice.title}`);
    console.log(`Descripción: ${selectedChoice.description}`);
}

module.exports = { showHelpMenu }