import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import http from 'http';

const formatPhoneNumber = (number) => {
    return `521${number}@s.whatsapp.net`;
};

const main = async () => {
    const provider = createProvider(BaileysProvider);
    
    const server = http.createServer(provider.http?.app);
    provider.initHttpServer(3002);

    provider.http?.server.post('/send-note', handleCtx(async (bot, req, res) => {
        const { number, message, mediaURL } = req.body;
        const contact = formatPhoneNumber(number);

	console.log(req.body);

        try {
            // Enviar mensaje de bienvenida
            await bot.sendMessage(contact, message, {});
            console.log('Mensaje enviado:', message);

            // Enviar archivo si existe una URL
            if (mediaURL) {
                await bot.sendMessage(contact, '', { media: mediaURL });
                console.log('Archivo enviado:', mediaURL);
            }

            // Responder con éxito
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: 200,
                status_message: 'Ok',
                texto: 'Mensaje enviado y archivo adjuntado (*≧ω≦)'
            }));

        } catch (error) {
            console.error('Error al enviar mensaje o archivo:', error);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({
                status: 500,
                status_message: 'Error',
                texto: 'Error al enviar el mensaje o archivo (｡•́︿•̀｡)',
                error: error.message
            }));
        }
    }));

    provider.http?.server.post('/send-message', handleCtx(async (bot, req, res) => {
        const { number, message } = req.body;
        const contact = formatPhoneNumber(number);

        try {
            await bot.sendMessage(contact, message, {});
            console.log('Mensaje enviado:', message);

            // Responder con éxito
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: 200,
                status_message: 'Ok',
                texto: 'Mensaje enviado (*≧ω≦)'
            }));

        } catch (error) {
            console.error('Error al enviar mensaje:', error);

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({
                status: 500,
                status_message: 'Error',
                texto: 'Error al enviar el mensaje (｡•́︿•̀｡)',
                error: error.message
            }));
        }
    }));

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });

    // Manejar señales de terminación SIGTERM y SIGINT
    const shutdown = () => {
        console.log('Recibida señal de terminación. Cerrando servidor...');

        // Cerrar el servidor HTTP
        server.close(() => {
            console.log('Servidor HTTP cerrado.');
            process.exit(0);
        });

        // O bien, si necesitas forzar el cierre
        setTimeout(() => {
            console.error('Forzando el cierre...');
            process.exit(1);
        }, 5000); // Espera de 5 segundos antes de forzar el cierre
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

};

main();
