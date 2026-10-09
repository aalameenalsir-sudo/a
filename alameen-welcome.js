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
  var avatar = base + 'alameen-taj-alsir-standing.png';
  var idleAvatar = base + 'alameen-taj-alsir-idle.jpg';
  var logo = base + 'a-solution-logo-tight.png';
  var liveAvatarTokenEndpoint = String(window.ALAMEEN_LIVEAVATAR_TOKEN_ENDPOINT || '').trim();
  var liveAvatarId = String(window.ALAMEEN_LIVEAVATAR_AVATAR_ID || 'alameen-taj-alsir').trim();
  var siteUrl = window.ALAMEEN_SITE_URL || (isArabic ? '../../ar/' : '../../');
  var alternateUrl = window.ALAMEEN_ALTERNATE_URL || (isArabic ? '../../Welcome/' : '../../ar/Welcome/');

  document.body.innerHTML = `
    <main class="ah-app is-welcome" aria-label="${copy.name}">
      <header class="ah-topbar">
        <a class="ah-brand" href="${siteUrl}" aria-label="A Solution">
          <img class="ah-brand-logo" src="${logo}" alt="A Solution">
          <span class="ah-brand-copy"><strong>A SOLUTION</strong><small>DIGITAL ADVERTISING &amp; MEDIA SOLUTIONS</small></span>
        </a>
        <div class="ah-top-actions">
          <section class="ah-language-card" aria-label="Language selector">
            <label></label>
            <a class="ah-language-link" href=""></a>
          </section>
          <div class="ah-tools" aria-label="Digital human controls">
            <button class="ah-tool ah-tool-dots" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
            <button class="ah-tool ah-tool-speaker" type="button" aria-label="Listen" aria-pressed="false">◖))</button>
            <button class="ah-tool ah-tool-cc" type="button" aria-label="Captions" aria-pressed="false">CC</button>
          </div>
        </div>
      </header>

      <div class="ah-shell">
        <section class="ah-intro" aria-label="Welcome">
          <div class="ah-eyebrow"><span class="ah-live-dot" aria-hidden="true"></span><span class="ah-eyebrow-text"></span></div>
          <h1 class="ah-intro-title"><span class="ah-intro-lead"></span><strong class="ah-intro-name"></strong></h1>
          <p class="ah-intro-copy"></p>

          <div class="ah-interaction">
            <section class="ah-welcome-panel" aria-label="Start conversation">
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
              <button class="ah-end-session" type="button"></button>
            </section>
          </div>
        </section>

        <section class="ah-human-stage" aria-live="polite">
          <div class="ah-stage-header">
            <span class="ah-stage-label">A SOLUTION / DIGITAL HUMAN</span>
            <span class="ah-stage-status"><i aria-hidden="true"></i><b class="ah-stage-status-text"></b></span>
          </div>
          <div class="ah-video-stage">
            <video class="ah-human ah-human-video" playsinline preload="none" poster="${idleAvatar}" hidden aria-label="${copy.name}"></video>
            <img class="ah-human ah-human-fallback" src="${idleAvatar}" alt="${copy.name}">
            <span class="ah-video-sheen" aria-hidden="true"></span>
          </div>
          <div class="ah-stage-caption">
            <div><strong class="ah-welcome-name"></strong><span class="ah-welcome-role"></span></div>
            <span class="ah-stage-caption-note"></span>
          </div>
          <div class="ah-stage-footer">
            <span class="ah-stage-footer-line"></span>
            <span class="ah-stage-footer-copy"></span>
          </div>
        </section>
      </div>

      <footer class="ah-footer">
        <a class="ah-back" href=""></a>
        <span class="ah-powered"></span>
      </footer>
    </main>
  `;

  var root = document.querySelector('.ah-app');
  var startButton = root.querySelector('.ah-start');
  var languageLabel = root.querySelector('.ah-language-card label');
  var languageLink = root.querySelector('.ah-language-link');
  var introLead = root.querySelector('.ah-intro-lead');
  var introName = root.querySelector('.ah-intro-name');
  var introCopy = root.querySelector('.ah-intro-copy');
  var eyebrowText = root.querySelector('.ah-eyebrow-text');
  var name = root.querySelector('.ah-welcome-name');
  var role = root.querySelector('.ah-welcome-role');
  var notice = root.querySelector('.ah-notice');
  var microphoneNotice = root.querySelector('.ah-mic-notice');
  var statusText = root.querySelector('.ah-status-text');
  var stageStatusText = root.querySelector('.ah-stage-status-text');
  var stageCaptionNote = root.querySelector('.ah-stage-caption-note');
  var stageFooterCopy = root.querySelector('.ah-stage-footer-copy');
  var input = root.querySelector('.ah-input-row input');
  var form = root.querySelector('.ah-input-row');
  var sendButton = root.querySelector('.ah-send');
  var micButton = root.querySelector('.ah-mic');
  var endButton = root.querySelector('.ah-end-session');
  var speakerButton = root.querySelector('.ah-tool-speaker');
  var captionButton = root.querySelector('.ah-tool-cc');
  var back = root.querySelector('.ah-back');
  var powered = root.querySelector('.ah-powered');
  var sessionHint = root.querySelector('.ah-session-hint');
  var humanVideo = root.querySelector('.ah-human-video');
  var humanFallback = root.querySelector('.ah-human-fallback');
  var liveAvatar = null;
  var liveAvatarAfter = null;
  var liveAvatarSetupMessage = '';
  var recognition = null;
  var lastMessage = core.getWelcome(lang);
  var isRecognitionRunning = false;
  var openingWelcomePlayed = false;

  introLead.textContent = isArabic ? 'مرحباً، أنا' : 'Hello, I’m';
  introName.textContent = copy.name;
  introCopy.textContent = isArabic
    ? 'مساعدك الرقمي من A Solution. أساعدك في تحويل أفكارك وتحدياتك إلى حلول واضحة قابلة للتنفيذ.'
    : 'Your digital assistant from A Solution, here to turn ideas and challenges into clear, practical solutions.';
  eyebrowText.textContent = isArabic ? 'مساعد رقمي مباشر' : 'Live digital assistant';
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
  endButton.textContent = copy.end;
  stageCaptionNote.textContent = isArabic ? 'حركة طبيعية • صوت تفاعلي' : 'Natural motion • interactive voice';
  stageFooterCopy.textContent = isArabic ? 'تحدث مع الأمين مباشرة' : 'Talk to Alameen directly';

  function stageLabel(mode) {
    var labels = lang === 'ar'
      ? { welcome: 'جاهز للتحدث', session: 'جاهز', listening: 'يستمع الآن', speaking: 'يتحدث الآن', waiting: 'يعالج طلبك' }
      : { welcome: 'Ready to talk', session: 'Ready', listening: 'Listening now', speaking: 'Speaking now', waiting: 'Processing' };
    return labels[mode] || labels.session;
  }

  function setMode(mode) {
    root.classList.remove('is-welcome', 'is-session', 'is-listening', 'is-speaking', 'is-waiting');
    if (mode === 'welcome') root.classList.add('is-welcome');
    else root.classList.add('is-session', 'is-' + mode);
    stageStatusText.textContent = stageLabel(mode);
  }

  function setStatus(text, mode) {
    statusText.textContent = text;
    setMode(mode || 'session');
  }

  function startTalkingAnimation() {
    if (!humanVideo || !humanVideo.srcObject) return;
    if (humanFallback) humanFallback.hidden = true;
    root.classList.remove('ah-video-fallback');
    humanVideo.hidden = false;
    humanVideo.muted = false;
    var playRequest = humanVideo.play();
    if (playRequest && typeof playRequest.catch === 'function') playRequest.catch(function () { showVideoFallback(); });
  }

  function stopTalkingAnimation() {
    if (!humanVideo) return;
    humanVideo.pause();
    humanVideo.hidden = true;
    if (humanFallback) humanFallback.hidden = false;
  }

  function showVideoFallback() {
    if (!humanVideo) return;
    humanVideo.pause();
    humanVideo.hidden = true;
    if (humanFallback) humanFallback.hidden = false;
    root.classList.add('ah-video-fallback');
  }

  function releaseLiveAvatar() {
    var active = liveAvatar;
    liveAvatar = null;
    liveAvatarAfter = null;
    if (active && typeof active.disconnect === 'function') {
      Promise.resolve(active.disconnect()).catch(function () {});
    }
  }

  function setupLiveAvatar() {
    if (!liveAvatarTokenEndpoint || !window.AlameenLiveAvatar || !window.AlameenLiveAvatar.createAlameenLiveAvatar) {
      liveAvatarSetupMessage = copy.liveUnavailable;
      return null;
    }
    try {
      return window.AlameenLiveAvatar.createAlameenLiveAvatar({
        video: humanVideo,
        tokenEndpoint: liveAvatarTokenEndpoint,
        avatarId: liveAvatarId,
        supabasePublishableKey: window.ALAMEEN_SUPABASE_PUBLISHABLE_KEY || window.ALAMEEN_SUPABASE_ANON_KEY || '',
        onReady: function () {
          setMode('session');
        },
        onListening: function () {
          setStatus(copy.listening, 'listening');
        },
        onThinking: function () {
          setStatus(copy.waiting, 'waiting');
        },
        onSpeaking: function () {
          setStatus(lastMessage, 'speaking');
          startTalkingAnimation();
        },
        onIdle: function () {
          if (!liveAvatar) return;
          stopTalkingAnimation();
          setMode('session');
          if (liveAvatarAfter) {
            var after = liveAvatarAfter;
            liveAvatarAfter = null;
            after();
          }
        },
        onError: function () {
          stopTalkingAnimation();
          setStatus(isArabic ? 'تعذر تشغيل المساعد المباشر، يمكنك استخدام الكتابة.' : 'Live assistant is unavailable; you can use text instead.', 'session');
          releaseLiveAvatar();
        },
      });
    } catch (error) {
      liveAvatarSetupMessage = copy.liveUnavailable;
      return null;
    }
  }

  liveAvatar = setupLiveAvatar();

  if (humanVideo) {
    humanVideo.addEventListener('error', showVideoFallback);
    humanVideo.addEventListener('ended', stopTalkingAnimation);
  }

  if (humanFallback) {
    humanFallback.addEventListener('error', function () {
      if (humanFallback.src.indexOf('alameen-taj-alsir-standing.png') === -1) humanFallback.src = avatar;
    });
  }

  function speakText(text, after) {
    lastMessage = text;
    if (liveAvatar) {
      liveAvatarAfter = after || null;
      setStatus(text, 'speaking');
      Promise.resolve(liveAvatar.speak(text)).catch(function () {
        liveAvatarAfter = null;
        releaseLiveAvatar();
        setStatus(isArabic ? 'تعذر تشغيل الصوت المباشر.' : 'Live voice is unavailable.', 'session');
      });
      return;
    }
    setMode('speaking');
    startTalkingAnimation();
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      window.setTimeout(function () {
        stopTalkingAnimation();
        if (after) after();
      }, 350);
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
      stopTalkingAnimation();
      setMode('session');
      if (after) after();
    };
    utterance.onerror = function () {
      stopTalkingAnimation();
      setMode('session');
      if (after) after();
    };
    window.speechSynthesis.speak(utterance);
  }

  function scheduleOpeningWelcome() {
    window.setTimeout(function () {
      if (document.visibilityState === 'hidden') return;
      lastMessage = core.getWelcome(lang);
    }, 650);
  }

  stageStatusText.textContent = stageLabel('welcome');
  scheduleOpeningWelcome();

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
    if (liveAvatar) {
      liveAvatar.stopListening();
      return;
    }
    if (recognition && isRecognitionRunning) recognition.stop();
    isRecognitionRunning = false;
    micButton.classList.remove('is-active');
    micButton.setAttribute('aria-pressed', 'false');
  }

  function startListening() {
    if (liveAvatar) {
      liveAvatar.startListening().catch(function () {
        setStatus(copy.microphone, 'session');
      });
      return;
    }
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
    var activeLiveAvatar = liveAvatar;
    if (activeLiveAvatar) {
      try {
        await activeLiveAvatar.connect();
        if (liveAvatar !== activeLiveAvatar) return;
        setMode('session');
        if (!openingWelcomePlayed) {
          openingWelcomePlayed = true;
          speakText(core.getWelcome(lang), startListening);
        } else {
          startListening();
        }
      } catch (error) {
        if (error && error.code === 'LIVEAVATAR_CANCELLED') return;
        releaseLiveAvatar();
        startButton.disabled = false;
        setStatus(copy.microphone, 'session');
      }
      return;
    }
    var microphoneAllowed = await requestMicrophone();
    setMode('session');
    statusText.textContent = liveAvatarSetupMessage || (microphoneAllowed ? copy.sessionPrompt : copy.microphone);
    sessionHint.textContent = liveAvatarSetupMessage || copy.name;
    if (openingWelcomePlayed) {
      if (microphoneAllowed) startListening();
      return;
    }
    openingWelcomePlayed = true;
    speakText(core.getWelcome(lang), function () {
      if (microphoneAllowed) startListening();
    });
  }

  startButton.addEventListener('click', startSession);
  micButton.addEventListener('click', startListening);
  endButton.addEventListener('click', function () {
    endButton.disabled = true;
    stopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    releaseLiveAvatar();
    stopTalkingAnimation();
    openingWelcomePlayed = false;
    startButton.disabled = false;
    endButton.disabled = false;
    setMode('welcome');
  });
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
    if (liveAvatar) liveAvatar.disconnect();
    stopTalkingAnimation();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  });
})();
