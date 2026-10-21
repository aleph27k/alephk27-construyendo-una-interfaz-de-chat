# Contexto
el tech lead del equipo te ha pedido que construyas un prototipo de interfaz de chat que se comunique con un modelo de lenguaje real a través de una API externa.
El objetivo no es solo conseguir que el modelo responda — es hacer que los datos de la conversación sean visibles y medibles. El cliente quiere entender qué ocurre por dentro: cuántos tokens está consumiendo, cómo se acumula el uso a lo largo de una sesión y qué otras métricas ofrecen el modelo. Esta visibilidad es algo que cualquier integración de IA seria necesita desde el primer día.
Vas a usar Groq, una plataforma que ofrece inferencia ultrarrápida para modelos de lenguaje de código abierto y devuelve metadatos detallados con cada respuesta. Tu trabajo es construir un frontend en React/Next.js que se integre con la API de Groq — gestionando correctamente el flujo de datos asíncrono, el estado de la interfaz y la persistencia de la sesión.
## Lo que necesitamos
- Una interfaz de chat donde el usuario pueda escribir mensajes y recibir respuestas de la IA
- Una cuenta en Groq con una API Key almacenada como variable de entorno
- Usar el qwen/qwen3.8-27b disponible en el plan gratuito de Groq
- Cada respuesta de Groq incluye un objeto usage — registra y muestra el consumo de tokens (tokens de prompt, tokens de completado y totales acumulados) para toda la sesión
- Al menos una métrica adicional de la respuesta debe aparecer en la interfaz: nombre del modelo, tiempo de respuesta o tokens por segundo son opciones válidas
- El historial de la conversación debe sobrevivir una recarga de página — el usuario no debería perder su sesión por haber cerrado accidentalmente la pestaña
## Nota
Cuando llamas a una API externa como usuario registrado de ese servicio, estableces tu identidad usando un Bearer Token — una credencial que obtuviste al registrarte, que se envía en la cabecera Authorization de cada petición:
Authorization: Bearer TU_API_KEY_AQUÍ

