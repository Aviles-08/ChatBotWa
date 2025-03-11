import { createBot, MemoryDB, createProvider } from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
import http from 'http';
import { pLimit } from 'p-limit';
import winston from 'winston';

// Limitar el número de tareas concurrentes
const limit = pLimit(5);

// Configuración de Winston
const logger = winston.createLogger({
    level: 'info', 
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),  
        new winston.transports.File({ filename: 'combined.log', level: 'info' }) 
    ],
});

const formatPhoneNumber = (number) => `521${number}@s.whatsapp.net`;

// Middleware de validación
const validateRequestBody = (req, res, next) => {
    const { number, message } = req.body;
    if (!number || !message || isNaN(Number(number))) {
        res.statusCode = 400;
        return res.end(JSON.stringify({
            status: 400,
            status_message: 'Bad Request',
            texto: 'Faltan datos o el número es inválido.'
        }));
    }
    next();
};

// Función para enviar mensajes
const sendMessage = async (bot, contact, message, mediaURL = '') => {
    try {
        await bot.sendMessage(contact, message, {});
        logger.info(`Mensaje enviado a: ${contact}`);
        
        if (mediaURL) {
            await bot.sendMessage(contact, '', { media: mediaURL });
            logger.info(`Archivo enviado a: ${contact}`);
        }
    } catch (error) {
        logger.error('Error al enviar mensaje:', error);
        throw error;
    }
};

const main = async () => {
    const provider = createProvider(BaileysProvider);

    // Inicializar servidor HTTP
    const server = http.createServer(provider.http?.app);
    provider.initHttpServer(3002);

    // Manejo de solicitud de envío de mensajes
    provider.http?.server.post('/send-note', validateRequestBody, handleCtx(async (bot, req, res) => {
        const { number, message, mediaURL } = req.body;
        const contact = formatPhoneNumber(number);

        // Usar limitador de tareas para evitar sobrecarga
        await limit(async () => {
            try {
                await sendMessage(bot, contact, message, mediaURL);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    status: 200,
                    status_message: 'Ok',
                    texto: 'Mensaje enviado y archivo adjuntado (*≧ω≦)'
                }));
            } catch (error) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({
                    status: 500,
                    status_message: 'Error',
                    texto: 'Error al enviar el mensaje o archivo (｡•́︿•̀｡)',
                    error: error.message
                }));
            }
        });
    }));

    // Manejo de solicitudes para solo enviar mensaje
    provider.http?.server.post('/send-message', validateRequestBody, handleCtx(async (bot, req, res) => {
        const { number, message } = req.body;
        const contact = formatPhoneNumber(number);

        // Usar limitador de tareas para evitar sobrecarga
        await limit(async () => {
            try {
                await sendMessage(bot, contact, message);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    status: 200,
                    status_message: 'Ok',
                    texto: 'Mensaje enviado (*≧ω≦)'
                }));
            } catch (error) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({
                    status: 500,
                    status_message: 'Error',
                    texto: 'Error al enviar el mensaje (｡•́︿•̀｡)',
                    error: error.message
                }));
            }
        });
    }));

    await createBot({
        database: new MemoryDB(),
        provider,
    });

    // Manejar señales de terminación
    const shutdown = () => {
        logger.info('Recibida señal de terminación. Cerrando servidor...');
        server.close(() => {
            logger.info('Servidor HTTP cerrado.');
            process.exit(0);
        });
        setTimeout(() => {
            logger.error('Forzando el cierre...');
            process.exit(1);
        }, 5000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

main();
