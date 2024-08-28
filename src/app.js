import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';

const flowBienvenida = addKeyword(['Hola', 'ola']).addAnswer('Hola, soy AviBot🤖', { delay: 500 });

const formatPhoneNumber = (number) => {
    return `521${number}@s.whatsapp.net`;
};

const main = async () => {
    const provider = createProvider(BaileysProvider);

    provider.initHttpServer(3002);

    provider.http?.server.post('/send-nota', handleCtx(async (bot, req, res) => {
        const { name, number, hotel, mediaURL } = req.body;
        const contact = formatPhoneNumber(number);
        const msj = `Hola ${name}, el hotel ${hotel} le envía su nota.`;

        // mensaje de bienvenida
        await bot.sendMessage(contact, msj, {});

        // envío del archivo
        if (mediaURL) {
            await bot.sendMessage(contact, '', {
                media: mediaURL
            });
        }

        res.end(`Mensaje y nota enviados a ${name || 'contacto predeterminado'}`);
    }));

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });
};

main();
