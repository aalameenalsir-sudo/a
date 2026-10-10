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
  var liveEndpoint = String(window.ALAMEEN_LIVEAVATAR_TOKEN_ENDPOINT || '').trim();
  var avatarId = String(window.ALAMEEN_LIVEAVATAR_AVATAR_ID || 'alameen-taj-alsir').trim();
  var siteUrl = window.ALAMEEN_SITE_URL || (isArabic ? '../../ar/' : '../../');
  var alternateUrl = window.ALAMEEN_ALTERNATE_URL || (isArabic ? '../../Welcome/' : '../../ar/Welcome/');

  document.body.innerHTML = [
    '<main class="ah-app is-welcome" aria-label="', copy.name, '">',
      '<header class="ah-topbar">',
        '<a class="ah-brand" href="', siteUrl, '" aria-label="A Solution">',
          '<img class="ah-brand-logo" src="', base, 'a-solution-logo-tight.png" alt="A Solution">',
          '<span class="ah-brand-copy"><strong>A SOLUTION</strong><small>DIGITAL ADVERTISING &amp; MEDIA SOLUTIONS</small></span>',
        '</a>',
        '<div class="ah-top-actions"><section class="ah-language-card" aria-label="Language selector"><label></label><a class="ah-language-link" href=""></a></section><div class="ah-tools" aria-label="Digital human controls"><button class="ah-tool ah-tool-speaker" type="button" aria-label="Listen">◖))</button><button class="ah-tool ah-tool-cc" type="button" aria-label="Captions" aria-pressed="false">CC</button></div></div>',
      '</header>',
      '<div class="ah-shell">',
        '<section class="ah-intro" aria-label="Welcome">',
          '<div class="ah-eyebrow"><span class="ah-live-dot" aria-hidden="true"></span><span class="ah-eyebrow-text"></span></div>',
          '<h1 class="ah-intro-title"><span class="ah-intro-lead"></span><strong class="ah-intro-name"></strong></h1>',
          '<p class="ah-intro-copy"></p>',
          '<div class="ah-interaction"><section class="ah-welcome-panel" aria-label="Start conversation"><div class="ah-notice"></div><div class="ah-mic-notice"></div><button class="ah-start" type="button"></button></section>',
            '<section class="ah-session-panel" aria-label="Conversation"><div class="ah-status"><span class="ah-status-spinner" aria-hidden="true"></span><span class="ah-status-text"></span></div><form class="ah-input-row"><button class="ah-send" type="submit" aria-label=""></button><input type="text" autocomplete="off" aria-label=""><button class="ah-mic" type="button" aria-label="" aria-pressed="false">♩</button></form><p class="ah-session-hint"></p><button class="ah-end-session" type="button"></button></section>',
          '</div>',
        '</section>',
        '<section class="ah-human-stage" aria-live="polite"><div class="ah-stage-header"><span class="ah-stage-label">A SOLUTION / DIGITAL HUMAN</span><span class="ah-stage-status"><i aria-hidden="true"></i><b class="ah-stage-status-text"></b></span></div><div class="ah-video-stage"><video class="ah-human ah-fallback-video" autoplay muted loop playsinline preload="auto" aria-hidden="true"><source src="', base, 'alameen-taj-alsir-talking.mp4" type="video/mp4"></video><video class="ah-human ah-human-video" playsinline preload="none" hidden aria-label="', copy.name, '"></video><div class="ah-video-placeholder" role="status"><span class="ah-placeholder-mark" aria-hidden="true"><i></i><i></i><i></i></span><strong class="ah-placeholder-title"></strong><small class="ah-placeholder-hint"></small></div><span class="ah-video-sheen" aria-hidden="true"></span></div></section>',
      '</div>',
      '<footer class="ah-footer"><a class="ah-back" href="', siteUrl, '"></a><span class="ah-powered"></span></footer>',
    '</main>'
  ].join('');

  var root = document.querySelector('.ah-app');
  var startButton = root.querySelector('.ah-start');
  var languageLabel = root.querySelector('.ah-language-card label');
  var languageLink = root.querySelector('.ah-language-link');
  var introLead = root.querySelector('.ah-intro-lead');
  var introName = root.querySelector('.ah-intro-name');
  var introCopy = root.querySelector('.ah-intro-copy');
  var eyebrow = root.querySelector('.ah-eyebrow-text');
  var notice = root.querySelector('.ah-notice');
  var microphoneNotice = root.querySelector('.ah-mic-notice');
  var statusText = root.querySelector('.ah-status-text');
  var stageStatus = root.querySelector('.ah-stage-status-text');
  var input = root.querySelector('.ah-input-row input');
  var form = root.querySelector('.ah-input-row');
  var send = root.querySelector('.ah-send');
  var mic = root.querySelector('.ah-mic');
  var end = root.querySelector('.ah-end-session');
  var speaker = root.querySelector('.ah-tool-speaker');
  var captions = root.querySelector('.ah-tool-cc');
  var back = root.querySelector('.ah-back');
  var powered = root.querySelector('.ah-powered');
  var hint = root.querySelector('.ah-session-hint');
  var fallbackVideo = root.querySelector('.ah-fallback-video');
  var video = root.querySelector('.ah-human-video');
  var placeholderTitle = root.querySelector('.ah-placeholder-title');
  var placeholderHint = root.querySelector('.ah-placeholder-hint');
  var live = null;
  var afterIdle = null;
  var lastMessage = core.getWelcome(lang);
  var greeted = false;

  introLead.textContent = isArabic ? 'مرحباً، أنا' : 'Hello, I’m';
  introName.textContent = copy.name;
  introCopy.textContent = isArabic ? 'مساعدك الرقمي من A Solution. أساعدك في تحويل أفكارك وتحدياتك إلى حلول واضحة قابلة للتنفيذ.' : 'Your digital assistant from A Solution, here to turn ideas and challenges into clear, practical solutions.';
  eyebrow.textContent = isArabic ? 'مساعد رقمي مباشر' : 'Live digital assistant';
  languageLabel.textContent = copy.languageLabel;
  languageLink.textContent = copy.alternateLanguage;
  languageLink.href = alternateUrl;
  notice.textContent = copy.notice;
  microphoneNotice.textContent = copy.microphone;
  startButton.textContent = copy.start;
  input.placeholder = copy.input;
  input.setAttribute('aria-label', copy.input);
  send.setAttribute('aria-label', copy.send);
  mic.setAttribute('aria-label', copy.start);
  back.textContent = copy.back;
  powered.textContent = copy.powered;
  hint.textContent = copy.name;
  end.textContent = copy.end;
  placeholderTitle.textContent = isArabic ? 'الشخصية الحية جاهزة' : 'Live avatar is ready';
  placeholderHint.textContent = isArabic ? 'اضغط «ابدأ التحدث» لبدء البث المباشر' : 'Press “Start speaking” to start the live stream';

  function stageLabel(mode) {
    var labels = lang === 'ar' ? { welcome: 'جاهز للتحدث', session: 'جاهز', listening: 'يستمع الآن', speaking: 'يتحدث الآن', waiting: 'يعالج طلبك' } : { welcome: 'Ready to talk', session: 'Ready', listening: 'Listening now', speaking: 'Speaking now', waiting: 'Processing' };
    return labels[mode] || labels.session;
  }

  function setMode(mode) {
    root.classList.remove('is-welcome', 'is-session', 'is-listening', 'is-speaking', 'is-waiting');
    root.classList.add(mode === 'welcome' ? 'is-welcome' : 'is-session');
    if (mode !== 'welcome') root.classList.add('is-' + mode);
    stageStatus.textContent = stageLabel(mode);
  }

  function setStatus(text, mode) {
    statusText.textContent = text;
    setMode(mode || 'session');
  }

  function showLiveVideo() {
    if (!video || !video.srcObject) return;
    root.classList.remove('ah-video-unavailable', 'ah-no-visual');
    root.classList.add('has-live-video');
    video.hidden = false;
    video.muted = false;
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') playRequest.catch(showFallback);
  }

  function showFallback() {
    if (!video) return;
    video.pause();
    video.hidden = true;
    root.classList.remove('has-live-video');
    root.classList.add('ah-video-unavailable');
    placeholderTitle.textContent = isArabic ? 'تعذر عرض البث الحي' : 'The live stream could not be displayed';
    placeholderHint.textContent = isArabic ? 'اضغط «إنهاء الجلسة» ثم حاول مرة أخرى' : 'End the session and try again';
  }

  function resetStage() {
    video.pause();
    video.hidden = true;
    video.srcObject = null;
    root.classList.remove('has-live-video', 'ah-video-unavailable', 'ah-no-visual');
    if (fallbackVideo) {
      fallbackVideo.hidden = false;
      fallbackVideo.muted = true;
      var fallbackPlay = fallbackVideo.play();
      if (fallbackPlay && typeof fallbackPlay.catch === 'function') fallbackPlay.catch(function () { root.classList.add('ah-no-visual'); });
    }
    placeholderTitle.textContent = isArabic ? 'الشخصية الحية جاهزة' : 'Live avatar is ready';
    placeholderHint.textContent = isArabic ? 'اضغط «ابدأ التحدث» لبدء البث المباشر' : 'Press “Start speaking” to start the live stream';
  }

  function stopListening() {
    if (live && typeof live.stopListening === 'function') live.stopListening();
    mic.classList.remove('is-active');
    mic.setAttribute('aria-pressed', 'false');
  }

  function startListening() {
    if (!live) return;
    Promise.resolve(live.startListening()).catch(function () { setStatus(copy.microphone, 'session'); });
  }

  function releaseLive() {
    var active = live;
    live = null;
    afterIdle = null;
    if (active && typeof active.disconnect === 'function') Promise.resolve(active.disconnect()).catch(function () {});
  }

  function speakText(text, after) {
    lastMessage = text;
    if (live) {
      afterIdle = after || null;
      setStatus(text, 'speaking');
      Promise.resolve(live.speak(text)).catch(function () { setStatus(isArabic ? 'تعذر تشغيل الصوت المباشر.' : 'Live voice is unavailable.', 'session'); });
      return;
    }
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { if (after) window.setTimeout(after, 350); return; }
    setStatus(text, 'speaking');
    window.speechSynthesis.cancel();
    var speech = core.getSpeechConfig(lang);
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speech.lang;
    utterance.rate = speech.rate;
    utterance.pitch = speech.pitch;
    utterance.onend = function () { setMode('session'); if (after) after(); };
    utterance.onerror = utterance.onend;
    window.speechSynthesis.speak(utterance);
  }

  if (liveEndpoint && window.AlameenLiveAvatar && window.AlameenLiveAvatar.createAlameenLiveAvatar) {
    try {
      live = window.AlameenLiveAvatar.createAlameenLiveAvatar({
        video: video,
        tokenEndpoint: liveEndpoint,
        avatarId: avatarId,
        supabasePublishableKey: window.ALAMEEN_SUPABASE_PUBLISHABLE_KEY || window.ALAMEEN_SUPABASE_ANON_KEY || '',
        onReady: function () { showLiveVideo(); setMode('session'); },
        onListening: function () { mic.classList.add('is-active'); mic.setAttribute('aria-pressed', 'true'); setStatus(copy.listening, 'listening'); },
        onThinking: function () { setStatus(copy.waiting, 'waiting'); },
        onSpeaking: function () { showLiveVideo(); setStatus(lastMessage, 'speaking'); },
        onIdle: function () { if (!live) return; showLiveVideo(); setMode('session'); if (afterIdle) { var done = afterIdle; afterIdle = null; done(); } },
        onError: function () { showFallback(); setStatus(isArabic ? 'تعذر تشغيل المساعد المباشر، يمكنك استخدام الكتابة.' : 'Live assistant is unavailable; you can use text instead.', 'session'); }
      });
    } catch (error) { live = null; }
  }

  if (fallbackVideo) {
    fallbackVideo.addEventListener('error', function () { root.classList.add('ah-no-visual'); });
    var initialFallbackPlay = fallbackVideo.play();
    if (initialFallbackPlay && typeof initialFallbackPlay.catch === 'function') initialFallbackPlay.catch(function () { root.classList.add('ah-no-visual'); });
  }

  function handleMessage(text) {
    if (!text) return;
    input.value = '';
    setStatus(copy.waiting, 'waiting');
    window.setTimeout(function () { speakText(core.getReply(text, lang)); }, 320);
  }

  async function startSession() {
    startButton.disabled = true;
    setStatus(copy.waiting, 'waiting');
    if (live) {
      try {
        await live.connect();
        setMode('session');
        if (!greeted) { greeted = true; speakText(core.getWelcome(lang), startListening); } else startListening();
      } catch (error) { startButton.disabled = false; setStatus(copy.microphone, 'session'); }
      return;
    }
    setMode('session');
    if (!greeted) { greeted = true; speakText(core.getWelcome(lang), startListening); } else startListening();
  }

  stageStatus.textContent = stageLabel('welcome');
  startButton.addEventListener('click', startSession);
  mic.addEventListener('click', startListening);
  end.addEventListener('click', function () { stopListening(); releaseLive(); resetStage(); greeted = false; startButton.disabled = false; setMode('welcome'); });
  speaker.addEventListener('click', function () { speakText(lastMessage); });
  captions.addEventListener('click', function () { var off = root.classList.toggle('is-caption-off'); captions.setAttribute('aria-pressed', String(!off)); });
  form.addEventListener('submit', function (event) { event.preventDefault(); handleMessage(input.value.trim()); });
  window.addEventListener('pagehide', function () { stopListening(); releaseLive(); if (window.speechSynthesis) window.speechSynthesis.cancel(); });
}());
