# ChatBotWa

Descripción del Proyecto:

Este proyecto es un chatbot desarrollado con la librería @bot-whatsapp/bot, diseñado para interactuar con usuarios a través de WhatsApp. El bot permite enviar mensajes de bienvenida y notas personalizadas, incluyendo la opción de adjuntar archivos PDF.

El código incluye dos rutas API para recibir datos en formato JSON:

/send-note: Envia una nota con información, incluyendo un mensaje y un enlace a un archivo.
/send-message: Envia un mensaje simple a un número de contacto.

La aplicación utiliza un servidor HTTP en el puerto 3001 y formatea los números de teléfono para el uso en WhatsApp. Se implementa un flujo de bienvenida que interactúa con los usuarios de manera amigable.
