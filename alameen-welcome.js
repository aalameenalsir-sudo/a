(function () {
  'use strict';

  if (window.__ALAMEEN_WELCOME__) return;
  window.__ALAMEEN_WELCOME__ = true;

  var core = window.AlameenAssistantCore;
  if (!core) return;

  var isArabic = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  var lang = isArabic ? 'ar' : 'en';
  var copy = core.getWelcomePageCopy(lang);
  var base = String(window.ALAMEEN_WELCOME_BASE || './').replace(/\/?$/, '/');
  var avatar = base + 'alameen-taj-alsir-transparent.png';
  var siteUrl = window.ALAMEEN_SITE_URL || (isArabic ? '../../ar/' : '../../');
  var alternateUrl = window.ALAMEEN_ALTERNATE_URL || (isArabic ? '../../Welcome/' : '../../ar/Welcome/');

  document.body.innerHTML = `
    <main class="ah-app is-welcome" aria-label="${copy.name}">
      <div class="ah-pattern" aria-hidden="true">
        <svg viewBox="0 0 1260 250" preserveAspectRatio="none" role="presentation">
          <defs>
            <pattern id="ah-chevron-pattern" width="360" height="126" patternUnits="userSpaceOnUse">
              <g fill="none" stroke-width="17" stroke-linecap="square" stroke-linejoin="miter">
                <path d="M-34 23 L30 63 L-34 103" stroke="#a477ff"></path>
                <path d="M58 23 L122 63 L58 103 M184 23 L248 63 L184 103" stroke="#00d000"></path>
                <path d="M310 23 L374 63 L310 103" stroke="#0872ff"></path>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ah-chevron-pattern)"></rect>
        </svg>
      </div>

      <header class="ah-topbar">
        <div class="ah-tools" aria-label="Digital human controls">
          <button class="ah-tool ah-tool-dots" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
          <button class="ah-tool ah-tool-speaker" type="button" aria-label="Listen" aria-pressed="false">◖))</button>
          <button class="ah-tool ah-tool-cc" type="button" aria-label="Captions" aria-pressed="false">CC</button>
        </div>
        <div class="ah-brand" aria-label="A Solution">
          <strong>A SOLUTION</strong>
          <span>ALAMEEN DIGITAL HUMAN</span>
        </div>
      </header>

      <section class="ah-language-card" aria-label="Language selector">
        <label></label>
        <a class="ah-language-link" href=""></a>
      </section>

      <section class="ah-human-stage" aria-live="polite">
        <div class="ah-human-aura" aria-hidden="true"></div>
        <div class="ah-human-ring" aria-hidden="true"></div>
        <div class="ah-audio-waves" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <img class="ah-human" src="${avatar}" alt="${copy.name}">
      </section>

      <section class="ah-welcome-panel" aria-label="Welcome">
        <h1 class="ah-welcome-name"></h1>
        <p class="ah-welcome-role"></p>
        <div class="ah-notice"></div>
        <div class="ah-mic-notice"></div>
        <button class="ah-start" type="button"></button>
      </section>

      <section class="ah-session-panel" aria-label="Conversation">
        <div class="ah-status"><span class="ah-status-spinner" aria-hidden="true"></span><span class="ah-status-text"></span></div>
        <form class="ah-input-row">
          <button class="ah-send" type="submit" aria-label=""></button>
          <input type="text" autocomplete="off" aria-label="">
          <button class="ah-mic" type="button" aria-label="" aria-pressed="false">♩</button>
        </form>
        <p class="ah-session-hint"></p>
      </section>

      <a class="ah-back" href=""></a>
      <span class="ah-powered"></span>
    </main>
  `;

  var root = document.querySelector('.ah-app');
  var startButton = root.querySelector('.ah-start');
  var languageLabel = root.querySelector('.ah-language-card label');
  var languageLink = root.querySelector('.ah-language-link');
  var name = root.querySelector('.ah-welcome-name');
  var role = root.querySelector('.ah-welcome-role');
  var notice = root.querySelector('.ah-notice');
  var microphoneNotice = root.querySelector('.ah-mic-notice');
  var statusText = root.querySelector('.ah-status-text');
  var input = root.querySelector('.ah-input-row input');
  var form = root.querySelector('.ah-input-row');
  var sendButton = root.querySelector('.ah-send');
  var micButton = root.querySelector('.ah-mic');
  var speakerButton = root.querySelector('.ah-tool-speaker');
  var captionButton = root.querySelector('.ah-tool-cc');
  var back = root.querySelector('.ah-back');
  var powered = root.querySelector('.ah-powered');
  var sessionHint = root.querySelector('.ah-session-hint');
  var recognition = null;
  var lastMessage = core.getWelcome(lang);
  var isRecognitionRunning = false;

  name.textContent = copy.name;
  role.textContent = copy.role;
  languageLabel.textContent = copy.languageLabel;
  languageLink.textContent = copy.alternateLanguage;
  languageLink.href = alternateUrl;
  notice.textContent = copy.notice;
  microphoneNotice.textContent = copy.microphone;
  startButton.textContent = copy.start;
  input.placeholder = copy.input;
  input.setAttribute('aria-label', copy.input);
  sendButton.setAttribute('aria-label', copy.send);
  micButton.setAttribute('aria-label', copy.start);
  back.textContent = copy.back;
  back.href = siteUrl;
  powered.textContent = copy.powered;
  sessionHint.textContent = copy.name;

  function setMode(mode) {
    root.classList.remove('is-welcome', 'is-session', 'is-listening', 'is-speaking', 'is-waiting');
    if (mode === 'welcome') root.classList.add('is-welcome');
    else root.classList.add('is-session', 'is-' + mode);
  }

  function setStatus(text, mode) {
    statusText.textContent = text;
    setMode(mode || 'session');
  }

  function speakText(text, after) {
    lastMessage = text;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      if (after) window.setTimeout(after, 350);
      return;
    }
    window.speechSynthesis.cancel();
    var speech = core.getSpeechConfig(lang);
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speech.lang;
    utterance.rate = speech.rate;
    utterance.pitch = speech.pitch;
    utterance.onstart = function () { setStatus(text, 'speaking'); };
    utterance.onend = function () {
      setMode('session');
      if (after) after();
    };
    utterance.onerror = function () {
      setMode('session');
      if (after) after();
    };
    window.speechSynthesis.speak(utterance);
  }

  async function requestMicrophone() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(function (track) { track.stop(); });
      return true;
    } catch (error) {
      return false;
    }
  }

  function recognitionConstructor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function stopListening() {
    if (recognition && isRecognitionRunning) {
      recognition.stop();
    }
    isRecognitionRunning = false;
    micButton.classList.remove('is-active');
    micButton.setAttribute('aria-pressed', 'false');
  }

  function startListening() {
    var Recognition = recognitionConstructor();
    if (!Recognition) {
      setStatus(copy.microphone, 'session');
      return;
    }
    if (isRecognitionRunning) {
      stopListening();
      setMode('session');
      return;
    }
    recognition = new Recognition();
    var config = core.getRecognitionConfig(lang);
    recognition.lang = config.lang;
    recognition.interimResults = config.interimResults;
    recognition.continuous = config.continuous;
    recognition.maxAlternatives = config.maxAlternatives;
    recognition.onstart = function () {
      isRecognitionRunning = true;
      micButton.classList.add('is-active');
      micButton.setAttribute('aria-pressed', 'true');
      setStatus(copy.listening, 'listening');
    };
    recognition.onresult = function (event) {
      var result = event.results && event.results[0] && event.results[0][0];
      var text = result ? String(result.transcript || '').trim() : '';
      stopListening();
      if (text) handleMessage(text);
    };
    recognition.onerror = function () {
      stopListening();
      setStatus(copy.microphone, 'session');
    };
    recognition.onend = function () {
      isRecognitionRunning = false;
      micButton.classList.remove('is-active');
      micButton.setAttribute('aria-pressed', 'false');
    };
    try {
      recognition.start();
    } catch (error) {
      stopListening();
      setStatus(copy.microphone, 'session');
    }
  }

  function handleMessage(text) {
    input.value = '';
    setStatus(copy.waiting, 'waiting');
    window.setTimeout(function () {
      var reply = core.getReply(text, lang);
      lastMessage = reply;
      setStatus(reply, 'session');
      speakText(reply);
    }, 320);
  }

  async function startSession() {
    startButton.disabled = true;
    setStatus(copy.waiting, 'waiting');
    var microphoneAllowed = await requestMicrophone();
    setMode('session');
    statusText.textContent = microphoneAllowed ? copy.sessionPrompt : copy.microphone;
    speakText(core.getWelcome(lang), function () {
      if (microphoneAllowed) startListening();
    });
  }

  startButton.addEventListener('click', startSession);
  micButton.addEventListener('click', startListening);
  speakerButton.addEventListener('click', function () { speakText(lastMessage); });
  captionButton.addEventListener('click', function () {
    var off = root.classList.toggle('is-caption-off');
    captionButton.setAttribute('aria-pressed', String(!off));
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = input.value.trim();
    if (value) handleMessage(value);
  });

  window.addEventListener('pagehide', function () {
    stopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  });
})();
