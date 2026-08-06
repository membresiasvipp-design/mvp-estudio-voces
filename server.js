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

// 3. Permitir acceso a la carpeta temporal
app.use('/temp', express.static(tempDir));

let currentKeys = { FishAudio: [], Gemini: [] };
let activeKeyIndex = { FishAudio: 0, Gemini: 0 };

app.post('/api/set-keys', (req, res) => {
  currentKeys = req.body;
  activeKeyIndex = { FishAudio: 0, Gemini: 0 };
  console.log("✅ Claves API cargadas en el servidor.");
  res.json({ success: true });
});

async function fetchWithRotation(serviceName, requestFunction) {
  let keys = currentKeys[serviceName];
  if (!keys || keys.length === 0) throw new Error(`No hay claves configuradas para ${serviceName}`);

  let attempts = 0;
  const maxAttempts = keys.length * 2;

  while (attempts < maxAttempts) {
    let currentKey = keys[activeKeyIndex[serviceName]].trim(); 
    try {
      let response = await requestFunction(currentKey);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`\n❌ [RECHAZO DE ${serviceName}]:`, errorText, "\n");
        
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 60000)); 
          activeKeyIndex[serviceName] = (activeKeyIndex[serviceName] + 1) % keys.length;
          attempts++;
          continue;
        }

        if (response.status === 401 || response.status === 404) {
          activeKeyIndex[serviceName] = (activeKeyIndex[serviceName] + 1) % keys.length;
          attempts++;
          continue;
        }

        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error(`Error de intento en ${serviceName}:`, error.message);
      attempts++;
      activeKeyIndex[serviceName] = (activeKeyIndex[serviceName] + 1) % keys.length;
    }
  }
  
  throw new Error(`Todas las claves de ${serviceName} fallaron o están saturadas.`);
}

app.post('/api/generate-script', async (req, res) => {
  const { promptData, voiceName, sector } = req.body;
  try {
    const response = await fetchWithRotation("Gemini", async (apiKey) => {
      let sectorInstruction = "";
      switch (sector) {
        case 'politica': sectorInstruction = "Tono: inspirador, formal, con fuerte convicción, liderazgo y firmeza."; break;
        case 'ventas': sectorInstruction = "Tono: altamente enérgico, persuasivo y comercial. Describe beneficios de forma irresistible."; break;
        case 'evento': sectorInstruction = "Tono: espectacular, festivo y de muy alta energía. Crea expectativa gigante."; break;
        case 'social': sectorInstruction = "Tono: elegante, cálido, invitador y muy emotivo."; break;
        case 'bebes': sectorInstruction = "Tono: infantil, muy tierno, juguetón, inocente y alegre. Finge ser un niño pequeño o un bebé hablando."; break;
        default: sectorInstruction = "Tono: persuasivo, profesional y muy dinámico.";
      }

      const systemPrompt = `Eres un locutor y creativo publicitario experto.
Tu trabajo es redactar un guion comercial EXTENSO, potente y muy descriptivo basado en estas ideas: "${promptData}".
INSTRUCCIONES CRÍTICAS:
1. ${sectorInstruction}
2. Voz asignada: "${voiceName}".
3. EXPANSIÓN OBLIGATORIA: INVENTA frases de relleno persuasivo, adjetivos y beneficios. ESTÁ PROHIBIDO HACER GUIONES CORTOS.
4. TAMAÑO EXACTO: El guion DEBE tener entre 60 y 80 palabras.
5. Sé sumamente expresivo usando exclamaciones (¡!) y pausas dramáticas (...).
6. ENTREGABLE: Devuelve ÚNICAMENTE el guion exacto a grabar. Sin comillas ni explicaciones extra.`;
      
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
    // 🔥 CAMBIO AQUÍ: Mensaje personalizado para el cliente (Gemini)
    console.error("Error interno oculto (Guion):", error.message);
    res.status(500).json({ error: "El asistente de texto inteligente (Gemini) está procesando demasiadas peticiones. Intenta de nuevo." });
  }
});

app.post('/api/generate-audio', async (req, res) => {
  const { text, voiceId } = req.body;
  try {
    const response = await fetchWithRotation("FishAudio", async (apiKey) => {
      return await fetch("https://api.fish.audio/v1/tts", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'model': 's2.1-pro-free' 
        },
        body: JSON.stringify({ text: text, reference_id: voiceId, format: "mp3" })
      });
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `voz_${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    res.json({ url: `/temp/${fileName}` }); 

  } catch (error) {
    // 🔥 CAMBIO AQUÍ: Mensaje Marca Blanca (Oculta a FishAudio)
    console.error("Error interno oculto (Voces):", error.message);
    res.status(500).json({ error: "El motor de voces profesionales está saturado temporalmente. Por favor, intenta de nuevo en unos segundos." });
  }
});

// 🔥 CONFIGURACIÓN DE PUERTO PARA LA NUBE 🔥
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 SERVIDOR EN LA NUBE ACTIVO EN PUERTO ${PORT}\n`);
});
