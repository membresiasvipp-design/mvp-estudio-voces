document.addEventListener('DOMContentLoaded', () => {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyq3giovpe2cjbUvGlhJPXKVXh5bIoYnlFeiNxxfXDMhm_4JE_-FSYsIppXFGf9aNEyWA/exec';

  const myVoices = [
    { id: "d8825869c3ca4fd4ae08ee5fd460a98e", name: "Anunciador Político" },
    { id: "cd85a7b00f984147a594713d16c711a2", name: "Narrador Político" },
    { id: "ecdb5ee920b745d69893db07702e1121", name: "Vendedor 1" },
    { id: "3a0a149a73404ee49bef125dfff2a9c2", name: "Vendedor 2" },
    { id: "3c36518138f44abca0006ac477aae182", name: "Vendedor 3" },
    { id: "a3e971a0b8e548c9928308e2ff14af29", name: "Vendedor 4" },
    { id: "d97cd3bf9ac547d8a90a910dd416e669", name: "Voz Publicidad Chicha" },
    { id: "bf7ea28b5f734161bb8eec37b23b1fec", name: "Voz Evento" },
    { id: "abeab4f9b0594d6d85ba2c7c0f6d6051", name: "Voz Mujer Evento Social" },
    { id: "12eaf6ffa4ae469d9431f4e43229a3e3", name: "Voz Mujer Evento Social 2" },
    { id: "e79d7a271fa94788a3f09abb4f4aa4ab", name: "Bebé Mujer 1" },
    { id: "5af3243c2af74a0d8cddae419a5efa42", name: "Bebé" },
    { id: "3119936075df42628af7d6dcb17f4493", name: "Animador" },
    { id: "86f205d0942e4fb59f15a08a07d6d018", name: "Bebé Hombre" }
  ];

  const loginModal = document.getElementById('login-modal');
  const btnLogin = document.getElementById('btn-login');
  const creditCounter = document.getElementById('credit-counter');
  const displayUser = document.getElementById('display-user');
  
  // Variables del Aviso Legal
  const disclaimerModal = document.getElementById('disclaimer-modal');
  const btnAcceptDisclaimer = document.getElementById('btn-accept-disclaimer');
  
  const sectorSelect = document.getElementById('sector-select');
  const voiceSelect = document.getElementById('voice-select');
  const finalScript = document.getElementById('final-script');
  const charCounter = document.getElementById('char-counter');
  
  const btnGenerateVoice = document.getElementById('btn-generate-voice');
  const btnMixAudio = document.getElementById('btn-mix-audio');
  const acapellaContainer = document.getElementById('acapella-container');
  const acapellaPlayer = document.getElementById('acapella-player');
  const costMusicDisplay = document.getElementById('cost-music-display');

  const btnWriteScript = document.getElementById('btn-write-script');
  const btnPreviewVoice = document.getElementById('btn-preview-voice');
  const btnPreviewGallery = document.getElementById('btn-preview-music-gallery');
  const btnPreviewUpload = document.getElementById('btn-preview-music-upload');
  const radioMusicGallery = document.querySelector('input[value="gallery"]');
  const radioMusicUpload = document.querySelector('input[value="upload"]');
  const selectMusicGallery = document.getElementById('music-gallery');
  const inputMusicUpload = document.getElementById('music-upload');

  let currentCredits = 0;
  let currentUser = "";
  const MAX_CHARS = 600;
  const COST_VOICE = 3;
  const COST_MUSIC = 5;
  
  let currentPreviewAudio = new Audio();
  let generatedAcapellaUrl = null; 

  myVoices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.id;
    option.textContent = voice.name;
    voiceSelect.appendChild(option);
  });

  function getMusicCost() {
    let cost = 0;
    if (radioMusicGallery.checked && selectMusicGallery.value !== "") cost = COST_MUSIC;
    if (radioMusicUpload.checked && inputMusicUpload.files[0]) cost = COST_MUSIC;
    return cost;
  }

  function updateMusicCostDisplay() {
    costMusicDisplay.textContent = `(Costo Extra: ${getMusicCost()} Créditos)`;
  }

  async function deductCreditsFromDB(cost) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: "deduct",
          username: currentUser,
          cost: cost
        })
      });
    } catch (error) {
      console.error("Error al actualizar la base de datos:", error);
    }
  }

  // --- 🔥 REPRODUCTOR MEJORADO (Con efecto ⏳ para internet lento) 🔥 ---
  let currentPlayingBtn = null; 
  function toggleAudio(btnElement, audioUrl) {
    if (!audioUrl) return;

    if (currentPlayingBtn === btnElement && !currentPreviewAudio.paused) {
      currentPreviewAudio.pause();
      btnElement.textContent = '▶️'; 
      currentPlayingBtn = null;
    } else {
      currentPreviewAudio.pause();
      btnPreviewVoice.textContent = '▶️';
      btnPreviewGallery.textContent = '▶️';
      btnPreviewUpload.textContent = '▶️';
      
      currentPreviewAudio.src = audioUrl;
      
      btnElement.textContent = '⏳';
      currentPlayingBtn = btnElement; 
      
      currentPreviewAudio.onplaying = () => {
        if (currentPlayingBtn === btnElement) btnElement.textContent = '⏸️';
      };

      currentPreviewAudio.onwaiting = () => {
        if (currentPlayingBtn === btnElement) btnElement.textContent = '⏳';
      };

      currentPreviewAudio.onended = () => { 
        btnElement.textContent = '▶️'; 
        currentPlayingBtn = null; 
      };

      currentPreviewAudio.onerror = () => {
        btnElement.textContent = '❌';
        currentPlayingBtn = null;
        alert("Error: No se encontró la pista. Verifica mayúsculas y minúsculas.");
      };

      currentPreviewAudio.play().catch(e => console.warn("Cargando pista..."));
    }
  }

  btnPreviewVoice.addEventListener('click', () => toggleAudio(btnPreviewVoice, `./audios/${voiceSelect.value}.mp3`));

  function updateMusicControls() {
    if (radioMusicGallery.checked) {
      selectMusicGallery.disabled = false;
      inputMusicUpload.disabled = true;
      btnPreviewUpload.disabled = true;
      btnPreviewGallery.disabled = selectMusicGallery.value === "";
    } else {
      selectMusicGallery.disabled = true;
      inputMusicUpload.disabled = false;
      btnPreviewGallery.disabled = true;
      btnPreviewUpload.disabled = !inputMusicUpload.files[0];
    }
    updateMusicCostDisplay();
  }

  radioMusicGallery.addEventListener('change', updateMusicControls);
  radioMusicUpload.addEventListener('change', updateMusicControls);
  selectMusicGallery.addEventListener('change', updateMusicControls);
  
  inputMusicUpload.addEventListener('change', () => {
    updateMusicControls();
  });

  btnPreviewUpload.addEventListener('click', () => {
    if (inputMusicUpload.files[0]) {
      toggleAudio(btnPreviewUpload, URL.createObjectURL(inputMusicUpload.files[0]));
    }
  });

  btnPreviewGallery.addEventListener('click', () => {
    if (selectMusicGallery.value) toggleAudio(btnPreviewGallery, selectMusicGallery.value);
  });
  
  updateMusicControls();

  // --- 🔥 LOGIN Y AVISO LEGAL 🔥 ---
  btnLogin.addEventListener('click', async () => {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorMsg = document.getElementById('login-error');
    if (!user || !pass) return;

    btnLogin.textContent = "Validando...";
    btnLogin.disabled = true;
    errorMsg.classList.add('hidden');

    try {
      const response = await fetch(APPS_SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: "login", username: user, password: pass }) 
      });
      const data = await response.json();

      if (data.success) {
        currentCredits = data.credits;
        currentUser = user;
        creditCounter.textContent = currentCredits;
        displayUser.textContent = `👤 ${user}`;
        
        fetch('/api/set-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.keys)
        }).catch(e => console.warn("Aviso interno:", e));
        
        loginModal.classList.add('hidden'); 
        disclaimerModal.classList.remove('hidden'); // 🔥 MUESTRA EL AVISO LEGAL
      } else {
        errorMsg.textContent = data.message;
        errorMsg.classList.remove('hidden');
      }
    } catch (err) {
      errorMsg.textContent = "Error de conexión con la base de datos.";
      errorMsg.classList.remove('hidden');
    }
    btnLogin.textContent = "Ingresar al Estudio";
    btnLogin.disabled = false;
  });

  // 🔥 BOTÓN PARA ACEPTAR LA RESPONSABILIDAD Y ENTRAR AL ESTUDIO
  btnAcceptDisclaimer.addEventListener('click', () => {
    disclaimerModal.classList.add('hidden');
  });

  finalScript.addEventListener('input', () => {
    const length = finalScript.value.length;
    charCounter.textContent = `${length} / ${MAX_CHARS} max`;
    
    acapellaContainer.classList.add('hidden');
    btnMixAudio.disabled = true;
    generatedAcapellaUrl = null;

    if (length > MAX_CHARS) {
      charCounter.classList.add('limit-reached');
      finalScript.classList.add('limit-reached');
      btnGenerateVoice.disabled = true;
      btnGenerateVoice.textContent = "⚠️ TEXTO DEMASIADO LARGO";
    } else {
      charCounter.classList.remove('limit-reached');
      finalScript.classList.remove('limit-reached');
      btnGenerateVoice.disabled = false;
      btnGenerateVoice.innerHTML = `⚡ PASO 1: GENERAR VOZ ACAPELLA (Costo: 3 Créditos)`;
    }
  });

  btnWriteScript.addEventListener('click', async () => {
    const promptData = document.getElementById('prompt-data').value.trim();
    if (!promptData) return alert("Ingresa datos para el anuncio.");
    const selectedVoiceName = voiceSelect.options[voiceSelect.selectedIndex].text;
    const selectedSector = sectorSelect.value;

    btnWriteScript.textContent = "⏳ Escribiendo Guion Premium...";
    btnWriteScript.disabled = true;

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptData, voiceName: selectedVoiceName, sector: selectedSector })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      
      finalScript.value = data.text;
      finalScript.dispatchEvent(new Event('input')); 
    } catch (error) {
      alert(`Error generando guion: ${error.message}`);
    }
    btnWriteScript.textContent = "✨ ESCRIBIR GUION PROFESIONAL";
    btnWriteScript.disabled = false;
  });

  function audioBufferToWavUrl(buffer) {
    const numOfChan = buffer.numberOfChannels, length = buffer.length * numOfChan * 2 + 44;
    const bufferOut = new ArrayBuffer(length), view = new DataView(bufferOut);
    const channels = [], sampleRate = buffer.sampleRate;
    let offset = 0, pos = 0;

    function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(sampleRate); setUint32(sampleRate * 2 * numOfChan); setUint16(numOfChan * 2);
    setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);

    for(let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
    while(pos < length) {
      for(let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true); pos += 2;
      }
      offset++;
    }
    return URL.createObjectURL(new Blob([bufferOut], { type: 'audio/wav' }));
  }

  btnGenerateVoice.addEventListener('click', async () => {
    const text = finalScript.value.trim();
    const voiceId = voiceSelect.value;

    if (!text) return alert("El guion está vacío.");
    if (text.length > MAX_CHARS) return alert("Superaste el límite de caracteres.");
    if (currentCredits < COST_VOICE) return alert("No tienes créditos suficientes para generar la voz.");

    btnGenerateVoice.textContent = "⏳ GRABANDO LOCUCIÓN...";
    btnGenerateVoice.disabled = true;
    acapellaContainer.classList.add('hidden'); 

    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Descontar en pantalla y en Google Sheets
      currentCredits -= COST_VOICE;
      creditCounter.textContent = currentCredits;
      deductCreditsFromDB(COST_VOICE); 
      
      generatedAcapellaUrl = data.url; 
      acapellaPlayer.src = generatedAcapellaUrl;
      
      acapellaContainer.classList.remove('hidden');
      btnMixAudio.disabled = false; 

    } catch (error) {
      console.error(error);
      alert(`⚠️ ERROR DE VOZ: ${error.message}`);
    }
    
    btnGenerateVoice.innerHTML = `⚡ PASO 1: GENERAR VOZ ACAPELLA (Costo: 3 Créditos)`;
    btnGenerateVoice.disabled = false;
  });

  // --- 🔥 VOLÚMENES CALIBRADOS (1.0 NORMAL, 0.4 FONDO) 🔥 ---
  async function mixAudios(voiceUrl, musicFile) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const voiceRes = await fetch(voiceUrl);
    const voiceArrayBuffer = await voiceRes.arrayBuffer();
    const decodedVoice = await audioCtx.decodeAudioData(voiceArrayBuffer);
    
    let decodedMusic = null;
    if (musicFile) {
      try {
        let musicArrayBuffer;
        if (typeof musicFile === 'string') {
          const res = await fetch(musicFile);
          musicArrayBuffer = await res.arrayBuffer();
        } else {
          musicArrayBuffer = await musicFile.arrayBuffer();
        }
        decodedMusic = await audioCtx.decodeAudioData(musicArrayBuffer);
      } catch (e) {
        console.warn("Fallo en la música. Solo voz.", e);
        decodedMusic = null;
      }
    }

    if (!decodedMusic) return voiceUrl; 

    const introTime = 2.5; 
    const fadeTime = 1.0;  
    const outroTime = 4.0; 
    const voiceDur = decodedVoice.duration;
    
    const totalDuration = introTime + voiceDur + outroTime;
    const totalLength = Math.ceil(totalDuration * decodedVoice.sampleRate);
    const offlineCtx = new OfflineAudioContext(2, totalLength, decodedVoice.sampleRate);

    const voiceSource = offlineCtx.createBufferSource();
    voiceSource.buffer = decodedVoice;
    
    const musicSource = offlineCtx.createBufferSource();
    musicSource.buffer = decodedMusic;
    musicSource.loop = true; 
    
    const gainNode = offlineCtx.createGain();
    
    // Inicia con volumen normal (1.0)
    gainNode.gain.setValueAtTime(1.0, 0); 
    gainNode.gain.setValueAtTime(1.0, introTime - fadeTime);
    
    // Baja de manera sutil (0.4) para no apagarla del todo
    gainNode.gain.linearRampToValueAtTime(0.4, introTime);
    gainNode.gain.setValueAtTime(0.4, introTime + voiceDur);
    
    // Vuelve al volumen original (1.0)
    gainNode.gain.linearRampToValueAtTime(1.0, introTime + voiceDur + fadeTime);
    gainNode.gain.setValueAtTime(1.0, totalDuration - 2.0); 
    
    // Apaga suavemente al final
    gainNode.gain.linearRampToValueAtTime(0.001, totalDuration); 

    voiceSource.connect(offlineCtx.destination);
    musicSource.connect(gainNode);
    gainNode.connect(offlineCtx.destination);

    musicSource.start(0); 
    voiceSource.start(introTime); 

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWavUrl(renderedBuffer);
  }

  btnMixAudio.addEventListener('click', async () => {
    if (!generatedAcapellaUrl) return alert("Primero debes generar la voz en el Paso 1.");

    const musicCost = getMusicCost();
    if (currentCredits < musicCost) return alert("Créditos insuficientes para la música de fondo.");

    btnMixAudio.textContent = "🎛️ PROCESANDO MEZCLA FINAL...";
    btnMixAudio.disabled = true;

    try {
      let musicFile = null;
      if (radioMusicGallery.checked && selectMusicGallery.value) musicFile = selectMusicGallery.value; 
      else if (radioMusicUpload.checked && inputMusicUpload.files[0]) musicFile = inputMusicUpload.files[0]; 

      const finalAudioUrl = await mixAudios(generatedAcapellaUrl, musicFile);

      // Descontar en pantalla y en Google Sheets
      if (musicCost > 0) {
        currentCredits -= musicCost;
        creditCounter.textContent = currentCredits;
        deductCreditsFromDB(musicCost); 
      }

      document.getElementById('history-content').innerHTML = `
        <div style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">
          <strong style="color: #4f46e5;">🎙️ Voz:</strong> ${voiceSelect.options[voiceSelect.selectedIndex].text} <br>
          <strong style="color: #10b981;">🎵 Música:</strong> ${musicFile ? 'Incluida' : 'Ninguna (Audio Limpio)'} <br>
          <strong style="color: #9ca3af;">📝 Guion:</strong> <em>"${finalScript.value.substring(0, 80)}..."</em>
        </div>
        <audio controls class="audio-player" src="${finalAudioUrl}"></audio>
        <a href="${finalAudioUrl}" download="cuna_comercial_final.wav" style="display:inline-block; margin-top:15px; color:#10b981; text-decoration:none; font-weight:800; font-size: 15px; background: rgba(16, 185, 129, 0.1); padding: 10px 20px; border-radius: 8px; border: 1px solid #10b981;">⬇️ Descargar Mezcla Final (.WAV)</a>
      `;

    } catch (error) {
      console.error(error);
      alert(`⚠️ ERROR EN MEZCLA: ${error.message}`);
    }
    
    updateMusicCostDisplay();
    btnMixAudio.innerHTML = `🎛️ PASO 2: APLICAR MÚSICA Y MEZCLAR <span id="cost-music-display">(Costo Extra: ${musicCost} Créditos)</span>`;
    btnMixAudio.disabled = false;
  });
});
