document.addEventListener('DOMContentLoaded', () => {
  
  // 🔥 LA VARIABLE DE SESIÓN (EL PASE VIP) 🔥
  let sessionToken = null;

  const myVoices = {
    "🎙️ LOCUTORES COMERCIALES": [
      { id: "d8825869c3ca4fd4ae08ee5fd460a98e", name: "Anunciador Político" },
      { id: "cd85a7b00f984147a594713d16c711a2", name: "Narrador Político" },
      { id: "ecdb5ee920b745d69893db07702e1121", name: "Vendedor 1" },
      { id: "3a0a149a73404ee49bef125dfff2a9c2", name: "Vendedor 2" },
      { id: "3c36518138f44abca0006ac477aae182", name: "Vendedor 3" },
      { id: "a3e971a0b8e548c9928308e2ff14af29", name: "Vendedor 4" },
      { id: "d97cd3bf9ac547d8a90a910dd416e669", name: "Voz Publicidad Chicha" },
      { id: "35199d5438854f5d9157c500479ab684", name: "Narrador" }
    ],
    "🎉 ANIMACIÓN Y EVENTOS": [
      { id: "bf7ea28b5f734161bb8eec37b23b1fec", name: "Voz Evento" },
      { id: "abeab4f9b0594d6d85ba2c7c0f6d6051", name: "Voz Mujer Evento Social" },
      { id: "12eaf6ffa4ae469d9431f4e43229a3e3", name: "Voz Mujer Evento Social 2" },
      { id: "3119936075df42628af7d6dcb17f4493", name: "Animador" },
      { id: "c079a8df558c43eb997b70368fdb18fb", name: "Animador Bella Luz" }
    ],
    "🎧 DJs Y RADIO": [
      { id: "5110c264835042cfb1d8563ab60e912c", name: "DJ 1" },
      { id: "be88245c013f44a8a6dbb35ed71c5a1f", name: "DJ 2" },
      { id: "fdc7ac94b9a94f52911520f9131fe3be", name: "DJ 3" },
      { id: "dff5958763e541ee9288b8bbed01064a", name: "DJ 4" },
      { id: "95d0e4a9841e423b90c01f4c51c3cb66", name: "DJ 5" },
      { id: "0691ad69e4bb49e6803b4fb14aed628d", name: "DJ 6" },
      { id: "b78300e744cb455eb4f6b2ac95e97e22", name: "DJ 7" },
      { id: "94ec15a8b97d4e66948be32780c8314d", name: "Spot Dj Varón" },
      { id: "5d201ef6c3d844fb84956745b311ab9a", name: "Spot Radio Mujer" },
      { id: "2153dc77d28e4de986ecb87489695723", name: "Spot Radio Varón" },
      { id: "29e182e38d6742d6a5b2ee21901c9fb3", name: "Spot Radio Varón 2" },
      { id: "14196dde8a13465e9b7b8f869fc3c21d", name: "Spot Radio Mujer 2" },
      { id: "bc55e1d5054142e9845be113c2877615", name: "Spot Radio Varón - Cuña" }
    ],
    "👩 VOCES FEMENINAS": [
      { id: "bc93fd919a214c2eae9fe16492a47489", name: "Mujer Paisa" },
      { id: "e296306da5d449999f6e35c2b9f60aea", name: "Mujer Colombiana" },
      { id: "852cb30e8c92488e94a6125573403ff3", name: "Spot Mujer" },
      { id: "3468323155ba4c94a1ebc52f6e8947da", name: "Spot Mujer 2" }
    ],
    "🍼 VOCES INFANTILES": [
      { id: "e79d7a271fa94788a3f09abb4f4aa4ab", name: "Bebé Mujer 1" },
      { id: "5af3243c2af74a0d8cddae419a5efa42", name: "Bebé" },
      { id: "86f205d0942e4fb59f15a08a07d6d018", name: "Bebé Hombre" }
    ]
  };

  const loginModal = document.getElementById('login-modal');
  const btnLogin = document.getElementById('btn-login');
  const creditCounter = document.getElementById('credit-counter');
  const displayUser = document.getElementById('display-user');
  const disclaimerModal = document.getElementById('disclaimer-modal');
  const btnAcceptDisclaimer = document.getElementById('btn-accept-disclaimer');
  const sectorSelect = document.getElementById('sector-select');
  const voiceSelect = document.getElementById('voice-select');
  const finalScript = document.getElementById('final-script');
  const charCounter = document.getElementById('char-counter');
  const btnGenerateVoice = document.getElementById('btn-generate-voice');
  const btnMixAudio = document.getElementById('btn-mix-audio');
  
  const acapellaContainer = document.getElementById('acapella-container');
  const acapellaAudioEl = document.getElementById('acapella-audio-element');
  const acapellaPlayBtn = document.getElementById('acapella-play-btn');
  const acapellaProgress = document.getElementById('acapella-progress');
  const acapellaCurrent = document.getElementById('acapella-current');
  const acapellaDuration = document.getElementById('acapella-duration');
  
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
  const MAX_CHARS = 600;
  const COST_MUSIC = 5;
  const COST_SCRIPT = 1; // 🔥 COSTO POR GUION 🔥
  
  let currentPreviewAudio = new Audio();
  let generatedAcapellaUrl = null; 

  voiceSelect.innerHTML = ''; 
  for (const [category, voices] of Object.entries(myVoices)) {
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = `─── ${category} ───`;
    separator.style.color = "#818cf8"; 
    separator.style.fontWeight = "bold";
    separator.style.textAlign = "center";
    voiceSelect.appendChild(separator);
    
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.id;
      option.textContent = `   👉 ${voice.name}`; 
      voiceSelect.appendChild(option);
    });
  }
  voiceSelect.selectedIndex = 1;

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  function setupCustomPlayer(audioEl, playBtn, progressBar, currentEl, durationEl) {
    playBtn.addEventListener('click', () => {
      if (audioEl.paused) { audioEl.play(); playBtn.textContent = '⏸️'; } 
      else { audioEl.pause(); playBtn.textContent = '▶️'; }
    });
    audioEl.addEventListener('timeupdate', () => {
      const current = audioEl.currentTime; const duration = audioEl.duration || 0;
      if (duration > 0) progressBar.value = (current / duration) * 100;
      currentEl.textContent = formatTime(current);
    });
    audioEl.addEventListener('loadedmetadata', () => { durationEl.textContent = formatTime(audioEl.duration); });
    progressBar.addEventListener('input', () => {
      const duration = audioEl.duration || 0;
      audioEl.currentTime = (progressBar.value / 100) * duration;
    });
    audioEl.addEventListener('ended', () => {
      playBtn.textContent = '▶️'; progressBar.value = 0; currentEl.textContent = '0:00';
    });
  }
  
  setupCustomPlayer(acapellaAudioEl, acapellaPlayBtn, acapellaProgress, acapellaCurrent, acapellaDuration);

  function getMusicCost() {
    let cost = 0;
    if (radioMusicGallery.checked && selectMusicGallery.value !== "") cost = COST_MUSIC;
    if (radioMusicUpload.checked && inputMusicUpload.files[0]) cost = COST_MUSIC;
    return cost;
  }

  function updateMusicCostDisplay() { costMusicDisplay.textContent = `(Costo Extra: ${getMusicCost()} Créditos)`; }

  let currentPlayingBtn = null; 
  function toggleAudio(btnElement, audioUrl) {
    if (!audioUrl) return;
    if (currentPlayingBtn === btnElement && !currentPreviewAudio.paused) {
      currentPreviewAudio.pause(); btnElement.textContent = '▶️'; currentPlayingBtn = null;
    } else {
      currentPreviewAudio.pause();
      btnPreviewVoice.textContent = '▶️'; btnPreviewGallery.textContent = '▶️'; btnPreviewUpload.textContent = '▶️';
      currentPreviewAudio.src = audioUrl; btnElement.textContent = '⏳'; currentPlayingBtn = btnElement; 
      currentPreviewAudio.onplaying = () => { if (currentPlayingBtn === btnElement) btnElement.textContent = '⏸️'; };
      currentPreviewAudio.onwaiting = () => { if (currentPlayingBtn === btnElement) btnElement.textContent = '⏳'; };
      currentPreviewAudio.onended = () => { btnElement.textContent = '▶️'; currentPlayingBtn = null; };
      currentPreviewAudio.onerror = () => { btnElement.textContent = '❌'; currentPlayingBtn = null; alert("Error: No se encontró la pista."); };
      currentPreviewAudio.play().catch(e => console.warn("Cargando pista..."));
    }
  }

  btnPreviewVoice.addEventListener('click', () => toggleAudio(btnPreviewVoice, `./audios/${voiceSelect.value}.mp3`));

  function updateMusicControls() {
    if (radioMusicGallery.checked) {
      selectMusicGallery.disabled = false; inputMusicUpload.disabled = true;
      btnPreviewUpload.disabled = true; btnPreviewGallery.disabled = selectMusicGallery.value === "";
    } else {
      selectMusicGallery.disabled = true; inputMusicUpload.disabled = false;
      btnPreviewGallery.disabled = true; btnPreviewUpload.disabled = !inputMusicUpload.files[0];
    }
    updateMusicCostDisplay();
  }

  radioMusicGallery.addEventListener('change', updateMusicControls);
  radioMusicUpload.addEventListener('change', updateMusicControls);
  selectMusicGallery.addEventListener('change', updateMusicControls);
  inputMusicUpload.addEventListener('change', updateMusicControls);

  btnPreviewUpload.addEventListener('click', () => {
    if (inputMusicUpload.files[0]) toggleAudio(btnPreviewUpload, URL.createObjectURL(inputMusicUpload.files[0]));
  });

  btnPreviewGallery.addEventListener('click', () => {
    if (selectMusicGallery.value) toggleAudio(btnPreviewGallery, selectMusicGallery.value);
  });
  updateMusicControls();

  // 🔥 LOGIN SEGURO: AHORA EL FRONTEND HABLA CON TU SERVIDOR NODE, NO CON GOOGLE 🔥
  btnLogin.addEventListener('click', async () => {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorMsg = document.getElementById('login-error');
    if (!user || !pass) return;

    btnLogin.textContent = "Validando..."; btnLogin.disabled = true; errorMsg.classList.add('hidden');

    try {
      const response = await fetch('/api/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }) 
      });
      const data = await response.json();

      if (data.success) {
        // Guardamos el Pase VIP
        sessionToken = data.token;
        currentCredits = data.credits; 
        
        creditCounter.textContent = currentCredits; displayUser.textContent = `👤 ${user}`;
        document.getElementById('login-modal').classList.add('hidden'); 
        disclaimerModal.classList.remove('hidden'); 
        
        // 🔥 CANDADO VISUAL: Revela el estudio SOLO si entró legalmente 🔥
        const mainStudio = document.getElementById('main-studio');
        if (mainStudio) mainStudio.style.display = 'flex';

      } else {
        errorMsg.textContent = data.message; errorMsg.classList.remove('hidden');
      }
    } catch (err) {
      errorMsg.textContent = "Error de conexión segura con el servidor."; errorMsg.classList.remove('hidden');
    }
    btnLogin.textContent = "Ingresar al Estudio"; btnLogin.disabled = false;
  });

  btnAcceptDisclaimer.addEventListener('click', () => disclaimerModal.classList.add('hidden'));

  finalScript.addEventListener('input', () => {
    const length = finalScript.value.length; charCounter.textContent = `${length} / ${MAX_CHARS} max`;
    acapellaContainer.classList.add('hidden'); acapellaAudioEl.pause(); acapellaPlayBtn.textContent = '▶️';
    btnMixAudio.disabled = true; generatedAcapellaUrl = null;

    if (length > MAX_CHARS) {
      charCounter.classList.add('limit-reached'); finalScript.classList.add('limit-reached');
      btnGenerateVoice.disabled = true; btnGenerateVoice.textContent = "⚠️ TEXTO DEMASIADO LARGO";
    } else {
      charCounter.classList.remove('limit-reached'); finalScript.classList.remove('limit-reached');
      btnGenerateVoice.disabled = false; btnGenerateVoice.innerHTML = `⚡ PASO 1: GENERAR VOZ ACAPELLA (Costo: 3 Créditos)`;
    }
  });

  // 🔥 ESCRITURA CON COBRO DE CRÉDITO 🔥
  btnWriteScript.addEventListener('click', async () => {
    const promptData = document.getElementById('prompt-data').value.trim();
    if (!promptData) return alert("Ingresa datos para el anuncio.");
    
    if (currentCredits < COST_SCRIPT) return alert("No tienes créditos suficientes para redactar con IA.");

    const selectedVoiceText = voiceSelect.options[voiceSelect.selectedIndex].text.replace('👉', '').trim();
    const selectedSector = sectorSelect.value;

    btnWriteScript.textContent = "⏳ Escribiendo Guion Premium..."; btnWriteScript.disabled = true;

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptData, voiceName: selectedVoiceText, sector: selectedSector, token: sessionToken })
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      
      // Actualizar créditos en pantalla
      currentCredits = data.remainingCredits;
      creditCounter.textContent = currentCredits;

      finalScript.value = data.text; finalScript.dispatchEvent(new Event('input')); 
    } catch (error) {
      alert(`⚠️ Error generando guion: ${error.message}`);
    }
    btnWriteScript.innerHTML = `✨ ESCRIBIR GUION PROFESIONAL (Costo: ${COST_SCRIPT} Crédito)`; 
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

    btnGenerateVoice.textContent = "⏳ GRABANDO LOCUCIÓN..."; btnGenerateVoice.disabled = true;
    acapellaContainer.classList.add('hidden'); 

    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text, voiceId, token: sessionToken })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      currentCredits = data.remainingCredits; 
      creditCounter.textContent = currentCredits;
      
      generatedAcapellaUrl = data.url; 
      acapellaAudioEl.src = generatedAcapellaUrl;
      
      acapellaContainer.classList.remove('hidden');
      btnMixAudio.disabled = false; 

    } catch (error) {
      alert(`⚠️ ${error.message}`);
    }
    btnGenerateVoice.innerHTML = `⚡ PASO 1: GENERAR VOZ ACAPELLA (Costo: 3 Créditos)`; btnGenerateVoice.disabled = false;
  });

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
          const res = await fetch(musicFile); musicArrayBuffer = await res.arrayBuffer();
        } else {
          musicArrayBuffer = await musicFile.arrayBuffer();
        }
        decodedMusic = await audioCtx.decodeAudioData(musicArrayBuffer);
      } catch (e) {
        console.warn("Fallo en la música. Solo voz.", e); decodedMusic = null;
      }
    }

    if (!decodedMusic) return voiceUrl; 

    const introTime = 2.5; const fadeTime = 1.0; const outroTime = 4.0; const voiceDur = decodedVoice.duration;
    const totalDuration = introTime + voiceDur + outroTime;
    const totalLength = Math.ceil(totalDuration * decodedVoice.sampleRate);
    const offlineCtx = new OfflineAudioContext(2, totalLength, decodedVoice.sampleRate);

    const voiceSource = offlineCtx.createBufferSource(); voiceSource.buffer = decodedVoice;
    const musicSource = offlineCtx.createBufferSource(); musicSource.buffer = decodedMusic; musicSource.loop = true; 
    
    const gainNode = offlineCtx.createGain();
    gainNode.gain.setValueAtTime(1.0, 0); gainNode.gain.setValueAtTime(1.0, introTime - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0.4, introTime); gainNode.gain.setValueAtTime(0.4, introTime + voiceDur);
    gainNode.gain.linearRampToValueAtTime(1.0, introTime + voiceDur + fadeTime); gainNode.gain.setValueAtTime(1.0, totalDuration - 2.0); 
    gainNode.gain.linearRampToValueAtTime(0.001, totalDuration); 

    voiceSource.connect(offlineCtx.destination); musicSource.connect(gainNode); gainNode.connect(offlineCtx.destination);
    musicSource.start(0); voiceSource.start(introTime); 

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWavUrl(renderedBuffer);
  }

  let historyCount = 0;

  btnMixAudio.addEventListener('click', async () => {
    if (!generatedAcapellaUrl) return alert("Primero debes generar la voz en el Paso 1.");

    const musicCost = getMusicCost();
    btnMixAudio.textContent = "🎛️ PROCESANDO MEZCLA FINAL..."; btnMixAudio.disabled = true;

    try {
      if (musicCost > 0) {
        const costRes = await fetch('/api/deduct-music', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: sessionToken, cost: musicCost })
        });
        const costData = await costRes.json();
        if (costData.error) throw new Error(costData.error);
        
        currentCredits = costData.remainingCredits;
        creditCounter.textContent = currentCredits;
      }

      let musicFile = null;
      if (radioMusicGallery.checked && selectMusicGallery.value) musicFile = selectMusicGallery.value; 
      else if (radioMusicUpload.checked && inputMusicUpload.files[0]) musicFile = inputMusicUpload.files[0]; 

      const finalAudioUrl = await mixAudios(generatedAcapellaUrl, musicFile);
      const cleanVoiceName = voiceSelect.options[voiceSelect.selectedIndex].text.replace('👉', '').trim();
      
      historyCount++;
      const uniqueId = `hist-${historyCount}`;

      const historyHtml = `
        <div class="history-item glow-box" style="margin-bottom: 20px;">
          <div style="margin-bottom: 15px; font-size: 14px; line-height: 1.6;">
            <strong style="color: #6366f1;">🎙️ Voz:</strong> ${cleanVoiceName} <br>
            <strong style="color: #10b981;">🎵 Música:</strong> ${musicFile ? 'Incluida' : 'Ninguna (Audio Limpio)'} <br>
            <strong style="color: #94a3b8;">📝 Guion:</strong> <em style="color:#e2e8f0;">"${finalScript.value.substring(0, 80)}..."</em>
          </div>
          
          <div class="custom-player" style="margin-bottom: 15px;">
            <button class="player-btn" id="play-${uniqueId}">▶️</button>
            <div class="player-timeline">
              <input type="range" id="prog-${uniqueId}" class="player-slider" value="0" min="0" max="100" step="1">
              <div class="player-time">
                <span id="curr-${uniqueId}">0:00</span> / <span id="dur-${uniqueId}">0:00</span>
              </div>
            </div>
          </div>
          <audio id="audio-${uniqueId}" src="${finalAudioUrl}"></audio>

          <a href="${finalAudioUrl}" download="cuna_comercial_final.wav" style="display:inline-block; width: 100%; text-align: center; color:#10b981; text-decoration:none; font-weight:900; font-size: 14px; background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.3); transition: 0.3s; text-transform: uppercase;">⬇️ Descargar Mezcla Final (.WAV)</a>
        </div>
      `;

      const historyContainer = document.getElementById('history-content');
      if(historyCount === 1) historyContainer.innerHTML = '';
      historyContainer.insertAdjacentHTML('afterbegin', historyHtml);

      const newAudioEl = document.getElementById(`audio-${uniqueId}`);
      const newPlayBtn = document.getElementById(`play-${uniqueId}`);
      const newProgress = document.getElementById(`prog-${uniqueId}`);
      const newCurrent = document.getElementById(`curr-${uniqueId}`);
      const newDuration = document.getElementById(`dur-${uniqueId}`);
      setupCustomPlayer(newAudioEl, newPlayBtn, newProgress, newCurrent, newDuration);

    } catch (error) {
      alert(`⚠️ ${error.message}`);
    }
    
    updateMusicCostDisplay();
    btnMixAudio.innerHTML = `🎛️ PASO 2: APLICAR MÚSICA Y MEZCLAR <span id="cost-music-display">(Costo Extra: ${getMusicCost()} Créditos)</span>`;
    btnMixAudio.disabled = false;
  });
});
