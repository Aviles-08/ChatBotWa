import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import contacts from './contacts.js'; // const contacts = {'name': '521xxxxxxxxxx@s.whatsapp.net'}

// Flow padre
const flowBienvenida = addKeyword(['Hola', 'ola']).addAnswer('Hola, soy AviBot🤖', { delay: 500 });

const main = async () => {
    const provider = createProvider(BaileysProvider);

    provider.initHttpServer(3002);

    // Ruta para enviar mensaje a un contacto específico o al contacto predeterminado
    provider.http?.server.post('/send-message/:name?/:action?', handleCtx(async (bot, req, res) => {
        const { name, action } = req.params;
        const contact = contacts[name] || contacts['default'];
        const body = req.body;
        const msj = body.msj || `Mensaje de prueba para ${name || 'contacto predeterminado'}`;
        const mediaURL = body.mediaURL;

        if (action === 'Doc' && mediaURL) {
            // Si se pasa la acción "Doc" y una mediaURL, se envía el archivo
            await bot.sendMessage(contact, msj, {
                media: mediaURL
            });
            res.end(`Mensaje con media enviado a ${name || 'contacto predeterminado'}`);
        } else {
            // Si no hay "Doc" o mediaURL, solo envía el mensaje
            await bot.sendMessage(contact, msj, {});
            res.end(`Mensaje enviado a ${name || 'contacto predeterminado'}`);
        }
    }));

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });
};

main();
