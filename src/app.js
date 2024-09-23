import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';

const formatPhoneNumber = (number) => {
    return `521${number}@s.whatsapp.net`;
};

const main = async () => {
    const provider = createProvider(BaileysProvider);

    provider.initHttpServer(3003);

    provider.http?.server.post('/send-note', handleCtx(async (bot, req, res) => {
        const { number, message, mediaURL } = req.body;
        const contact = formatPhoneNumber(number);

        try {
            // Personalizar el mensaje con el nombre del hotel

            // Enviar mensaje personalizado
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

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });
};

main();
