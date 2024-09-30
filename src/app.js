import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import contacts from './contacts.js'; // Define tus contactos en este archivo

// Flow para el bot
const flowBienvenida = addKeyword(['Hola', 'ola']).addAnswer('Hola, soy AviBot🤖', { delay: 500 });

// Función para formatear el número de WhatsApp
const formatPhoneNumber = (number) => {
    return `521${number}@s.whatsapp.net`;
};

// Contactos definidos en el archivo 'contacts.js'
/*
contacts.js
export default {
  'Avi': '5219991234567@s.whatsapp.net',
  'Mich': {
    name: 'Michelle',
    phoneNumber: '5219997654321'
  }
};
*/

const main = async () => {
    const provider = createProvider(BaileysProvider);
    
    // Inicializa el servidor HTTP en el puerto 3002
    provider.initHttpServer(3002);

    // Ruta para enviar un contacto específico a un contacto objetivo
    provider.http?.server.post('/send-contact/:target', handleCtx(async (bot, req, res) => {
        const { target } = req.params;  // El nombre del contacto objetivo (ejemplo: Avi)
        const contactInfo = contacts['Mich']; // Información del contacto de Mich

        if (!contacts[target]) {
            res.statusCode = 404;
            return res.end(`El contacto ${target} no existe.`);
        }

        const targetContact = contacts[target]; // Contacto al que quieres enviar (ejemplo: Avi)

        try {
            // Enviar el contacto de Mich a Avi
            await bot.sendContact(
                targetContact,
                [{ displayName: contactInfo.name, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${contactInfo.name}\nTEL:${contactInfo.phoneNumber}\nEND:VCARD` }]
            );
            console.log(`Contacto de ${contactInfo.name} enviado a ${target}`);
            
            res.end(`Contacto de ${contactInfo.name} enviado a ${target}`);
        } catch (error) {
            console.error('Error al enviar el contacto:', error);
            res.statusCode = 500;
            res.end('Error al enviar el contacto');
        }
    }));

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider,
    });
};

main();
