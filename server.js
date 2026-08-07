const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Leer la carpeta de diseño
app.use(express.static(path.join(__dirname, 'public')));

// 2. Crear carpeta temporal para los audios
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
app.use('/temp', express.static(tempDir));

// 🔥 LA URL DE TU BASE DE DATOS AHORA VIVE AQUÍ (100% INVISIBLE AL USUARIO) 🔥
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyq3giovpe2cjbUvGlhJPXKVXh5bIoYnlFeiNxxfXDMhm_4JE_-FSYsIppXFGf9aNEyWA/exec';

// 🔥 SISTEMA DE SEGURIDAD EN MEMORIA (BÓVEDA) 🔥
let activeSessions = {}; // Guardará: token -> { username, credits }
let systemKeys = { FishAudio: [], Gemini: [] };
let activeKeyIndex = { FishAudio: 0, Gemini: 0 };

async function fetchWithRotation(serviceName, requestFunction) {
  let keys = systemKeys[serviceName];
  if (!keys || keys.length === 0) throw new Error(`No hay claves configuradas para ${serviceName}`);

  let attempts = 0;
  const maxAttempts = keys.length * 2;

  while (attempts < maxAttempts) {
    let currentKey = keys[activeKeyIndex[serviceName]].trim(); 
    try {
      let response = await requestFunction(currentKey);
      
      if (!response.ok) {
        if (response.status === 429 || response.status === 401 || response.status === 404) {
          activeKeyIndex[serviceName] = (activeKeyIndex[serviceName] + 1) % keys.length;
          attempts++;
          continue;
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response;
    } catch (error) {
      attempts++;
      activeKeyIndex[serviceName] = (activeKeyIndex[serviceName] + 1) % keys.length;
    }
  }
  throw new Error(`Todas las claves de ${serviceName} fallaron o están saturadas.`);
}

// 🛡️ RUTA 1: LOGIN SEGURO (El servidor habla con Google, no el usuario)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "login", username, password })
    });
    const data = await response.json();

    if (data.success) {
      // Guardamos las claves maestras en el servidor (NUNCA SE ENVÍAN AL NAVEGADOR)
      if (data.keys) systemKeys = data.keys;

      // Creamos un Pase VIP (Token) indescifrable
      const token = "tkn_" + Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Guardamos la sesión en la bóveda
      activeSessions[token] = {
        username: username,
        credits: data.credits
      };

      // Solo devolvemos el token y los créditos visuales
      res.json({ success: true, token: token, credits: data.credits });
    } else {
      res.json({ success: false, message: data.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error conectando a la base de datos." });
  }
});

// 🛡️ RUTA 2: GENERAR GUION (Requiere Pase VIP)
app.post('/api/generate-script', async (req, res) => {
  const { promptData, voiceName, sector, token } = req.body;

  // BARRERA: Si no tiene token válido, lo bloqueamos
  if (!token || !activeSessions[token]) {
    return res.status(401).json({ error: "Acceso denegado. Bloqueo de seguridad activado." });
  }

  try {
    const response = await fetchWithRotation("Gemini", async (apiKey) => {
      let sectorInstruction = "";
      switch (sector) {
        case 'politica': sectorInstruction = "Tono: inspirador, formal, con fuerte convicción, liderazgo y firmeza."; break;
        case 'ventas': sectorInstruction = "Tono: altamente enérgico, persuasivo y comercial. Describe beneficios de forma irresistible."; break;
        case 'evento': sectorInstruction = "Tono: espectacular, festivo y de muy alta energía. Crea expectativa gigante."; break;
        case 'social': sectorInstruction = "Tono: elegante, cálido, invitador y muy emotivo."; break;
        case 'bebes': sectorInstruction = "Tono: infantil, muy tierno, juguetón, inocente y alegre. Finge ser un niño pequeño o un bebé hablando."; break;
        case 'dj': sectorInstruction = "Tono: extremadamente enérgico, estilo DJ de discoteca o radio urbana. Usa frases de fiesta, anima al público al máximo y crea un ambiente de euforia total. Usa un estilo rápido y explosivo."; break;
        default: sectorInstruction = "Tono: persuasivo, profesional y muy dinámico.";
      }

      const systemPrompt = `Eres un locutor y creativo publicitario experto.
Tu trabajo es redactar un guion comercial EXTENSO, potente y muy descriptivo basado en estas ideas: "${promptData}".
INSTRUCCIONES CRÍTICAS:
1. ${sectorInstruction}
2. Voz asignada: "${voiceName}".
3. EXPANSIÓN OBLIGATORIA: INVENTA frases de relleno persuasivo, adjetivos y beneficios. ESTÁ PROHIBIDO HACER GUIONES CORTOS.
4. TAMAÑO EXACTO: El guion DEBE tener entre 80 y 100 palabras.
5. ETIQUETAS DE EMOCIÓN (SÚPER OBLIGATORIO): Para que la voz suene humana y natural, DEBES incluir etiquetas de acción entre corchetes a lo largo del texto.
   Usa estrictamente estas etiquetas donde corresponda: [excited], [emphasis], [chuckle], [short pause], [long pause], [sigh].
   EJEMPLO DE FORMATO ESPERADO: "[excited] ¡Señoras y señores! [short pause] ¡La fiesta ya comenzó! [emphasis] ¡Quiero ver esas manos arriba bailando! [chuckle] ¡Aquí nadie se queda sentado!"
6. ENTREGABLE: Devuelve ÚNICAMENTE el guion exacto a grabar incluyendo los corchetes. Sin comillas ni explicaciones extra.`;
      
      const targetModel = 'models/gemini-flash-latest';
      return await fetch(`https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
      });
    });
    
    const data = await response.json();
    res.json({ text: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: "El asistente de texto (Gemini) está saturado. Intenta de nuevo." });
  }
});

// 🛡️ RUTA 3: GENERAR AUDIO Y COBRAR CRÉDITOS (Servidor controla los gastos)
app.post('/api/generate-audio', async (req, res) => {
  const { text, voiceId, token } = req.body;
  const COST_VOICE = 3;

  // BARRERA 1: Validar sesión
  if (!token || !activeSessions[token]) {
    return res.status(401).json({ error: "Acceso denegado." });
  }

  // BARRERA 2: Validar saldo directamente en la bóveda del servidor
  let userSession = activeSessions[token];
  if (userSession.credits < COST_VOICE) {
    return res.status(403).json({ error: "Créditos insuficientes en tu cuenta." });
  }

  try {
    const response = await fetchWithRotation("FishAudio", async (apiKey) => {
      return await fetch("https://api.fish.audio/v1/tts", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'model': 's2.1-pro-free' },
        body: JSON.stringify({ text: text, reference_id: voiceId, format: "mp3" })
      });
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `voz_${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // 💰 COBRO SEGURO: Descontamos en la memoria del servidor
    userSession.credits -= COST_VOICE;

    // Avisamos a Google Sheets en segundo plano para que guarde el historial
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "deduct", username: userSession.username, cost: COST_VOICE })
    }).catch(e => console.log("Error al sincronizar con Sheets"));

    // Le devolvemos el audio y el nuevo saldo oficial al usuario
    res.json({ url: `/temp/${fileName}`, remainingCredits: userSession.credits }); 

  } catch (error) {
    res.status(500).json({ error: "El motor de voces profesionales está saturado. Intenta de nuevo." });
  }
});

// 🛡️ RUTA 4: COBRAR MÚSICA DE FONDO (Para evitar hacks de mezcla)
app.post('/api/deduct-music', (req, res) => {
  const { token, cost } = req.body;
  
  if (!token || !activeSessions[token]) return res.status(401).json({ error: "Acceso denegado." });
  let userSession = activeSessions[token];
  if (userSession.credits < cost) return res.status(403).json({ error: "Créditos insuficientes." });

  // Cobramos localmente
  userSession.credits -= cost;

  // Sincronizamos con Sheets
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: "deduct", username: userSession.username, cost: cost })
  }).catch(e => console.log("Error al sincronizar música con Sheets"));

  res.json({ success: true, remainingCredits: userSession.credits });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 SERVIDOR SEGURO ACTIVO EN PUERTO ${PORT}\n`);
});
