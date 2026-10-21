# Qué debes hacer

## Cuenta y configuración

- Crea una cuenta gratuita en https://console.groq.com/
- Genera una API KEY y guárdala en un archivo `.env` (por ejemplo, `NEXT_PUBLIC_GROQ_API_KEY`)
- Confirma que la clave funciona haciendo una llamada `fetch` de prueba a `https://api.groq.com/openai/v1/chat/completions` con el Bearer token en la cabecera `Authorization`

---

## Interfaz de chat

- Genera el layout inicial de la interfaz con `v0.dev` y expórtalo a tu proyecto Next.js
- Construye un campo de texto y un botón de envío que disparen la llamada a la API
- Muestra el historial completo de la conversación (mensaje del usuario y respuesta de la IA) visualmente diferenciados
- Usa `useState` para gestionar la lista de mensajes y el valor del campo de texto
- Cada vez que el usuario envíe un mensaje, agrégalo al estado y envía el historial completo de la conversación (todos los turnos anteriores) a la API de Groq. Usa el modelo `qwen/qwen3.8-27b` disponible en el plan gratuito de Groq.

> ⚠️ IMPORTANTE: La API debe llamarse usando `fetch` sin SDK de terceros ni librerías de envoltorio. Debes configurar manualmente las cabeceras `Authorization: Bearer <tu_clave>` y `Content-Type: application/json` en cada petición.

---

## Promesas y flujo asíncrono

- Gestiona la llamada `fetch` usando `async/await`
- Mientras la API procesa la petición, muestra un indicador de carga o un estado "pensando..." en la interfaz. Usa `useState` para controlarlo.
- Si la API devuelve un error (código de estado no 2xx), captúralo y muestra al usuario un mensaje claro y legible en lugar de dejar que la aplicación falle.

---

## Panel de uso de tokens y métricas

- Tras cada respuesta, lee el objeto `usage` de la respuesta de la API de Groq
- Acumula y muestra el total acumulado de tokens de prompt enviados durante toda la sesión
- Acumula y muestra el total acumulado de tokens de completado recibidos durante toda la sesión
- Muestra el total combinado de tokens consumidos hasta el momento en la sesión
- Muestra al menos una métrica adicional de la respuesta de Groq: nombre del modelo, tiempo de respuesta o tokens por segundo

---

## Persistencia de sesión

- Usa `useEffect` para cargar el historial de la conversación desde `localStorage` cuando el componente se monte
- Guarda el historial de la conversación en `localStorage` después de cada nuevo mensaje para que la sesión sobreviva una recarga de página
- Incluye un botón "Borrar conversación" que reinicie el estado de mensajes y limpie el `localStorage`

---

## ✅ Qué vamos a evaluar

- La API de Groq se llama correctamente con `fetch` incluyendo las cabeceras `Authorization: Bearer` y `Content-Type: application/json` en cada petición
- El historial completo de la conversación se envía en cada llamada a la API (comunicación stateless gestionada correctamente en el cliente)
- La promesa se gestiona con `async/await` y se muestra un estado de carga mientras se espera la respuesta
- Los errores de la API se capturan y se muestran al usuario como mensajes comprensibles, sin fallos silenciosos ni errores técnicos en pantalla
- `useState` gestiona correctamente los mensajes, el estado de carga y las métricas
- `useEffect` se usa para cargar y sincronizar el historial de la conversación desde `localStorage`
- Los datos de tokens del objeto `usage` se acumulan y muestran correctamente a lo largo de toda la sesión
- La conversación persiste tras una recarga de página y puede borrarse manualmente
- Al menos una métrica adicional más allá del conteo de tokens es visible en la interfaz