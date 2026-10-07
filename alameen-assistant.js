(function () {
  'use strict';

  if (window.__ALAMEEN_ASSISTANT__) return;
  window.__ALAMEEN_ASSISTANT__ = true;

  var core = window.AlameenAssistantCore;
  if (!core) return;

  var isArabic = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';
  var lang = isArabic ? 'ar' : 'en';
  var avatar = 'alameen-taj-alsir.jpg';
  var copy = isArabic ? {
    name: 'الأمين تاج السر',
    role: 'مساعد الحلول الرقمية',
    status: 'متاح الآن',
    idle: 'اسأل الأمين عن تحديك',
    speaking: 'الأمين يتحدث الآن',
    input: 'اكتب تحديك هنا...',
    send: 'إرسال',
    speak: 'استمع للرد',
    project: 'ابدأ مشروعًا',
    close: 'إغلاق',
    quick: [
      ['أحتاج تسويق وإعلانات', 'تسويق وإعلانات'],
      ['أحتاج موقع أو تطبيق', 'موقع أو تطبيق'],
      ['أحتاج حلًا تقنيًا', 'حل تقني'],
      ['أحتاج استشارة أعمال', 'استشارة أعمال']
    ]
  } : {
    name: 'Alameen Taj Alsir',
    role: 'Digital solutions assistant',
    status: 'Available now',
    idle: 'Ask Alameen about your challenge',
    speaking: 'Alameen is speaking',
    input: 'Tell me about your challenge...',
    send: 'Send',
    speak: 'Listen to reply',
    project: 'Start a project',
    close: 'Close',
    quick: [
      ['I need marketing', 'Marketing and advertising'],
      ['I need a website or app', 'Website or app'],
      ['I need a technical solution', 'Technical solution'],
      ['I need business advice', 'Business consulting']
    ]
  };

  var style = document.createElement('style');
  style.id = 'alameen-assistant-style';
  style.textContent = `
    #alameen-assistant-root{position:fixed;right:24px;bottom:24px;z-index:9990;font-family:Manrope,Arial,sans-serif;color:#101010;direction:ltr}
    html[dir="rtl"] #alameen-assistant-root{right:auto;left:24px;direction:rtl}
    #alameen-assistant-toggle{display:flex;align-items:center;gap:11px;border:0;border-radius:999px;padding:7px 16px 7px 7px;background:#101010;color:#f2efe8;box-shadow:0 16px 44px rgba(16,16,16,.22);cursor:pointer;transition:transform .3s ease,box-shadow .3s ease}
    html[dir="rtl"] #alameen-assistant-toggle{padding:7px 7px 7px 16px}
    #alameen-assistant-toggle:hover{transform:translateY(-3px);box-shadow:0 22px 56px rgba(16,16,16,.28)}
    .alameen-avatar{display:block;position:relative;overflow:hidden;border-radius:50%;flex:none;background:linear-gradient(135deg,#ff6b6b,#574b90);border:2px solid #ff6b6b}
    .alameen-avatar.small{width:52px;height:52px}
    .alameen-avatar.large{width:48px;height:48px}
    .alameen-avatar img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 24%}
    .alameen-toggle-copy{display:grid;text-align:left;gap:2px;min-width:122px}
    html[dir="rtl"] .alameen-toggle-copy{text-align:right}
    .alameen-toggle-copy strong{font-size:12px;line-height:1.2}
    .alameen-toggle-copy small{font-size:9px;letter-spacing:.08em;color:#aaa;text-transform:uppercase}
    .alameen-live-dot{width:7px;height:7px;border-radius:50%;background:#74d69b;box-shadow:0 0 0 5px rgba(116,214,155,.13);margin-left:3px}
    html[dir="rtl"] .alameen-live-dot{margin-left:0;margin-right:3px}
    .alameen-assistant-panel{display:none;flex-direction:column;overflow:hidden;width:min(382px,calc(100vw - 32px));height:min(610px,calc(100vh - 48px));background:#f2efe8;border:1px solid rgba(16,16,16,.14);border-radius:24px;box-shadow:0 26px 80px rgba(16,16,16,.24)}
    #alameen-assistant-root.open .alameen-assistant-panel{display:flex;animation:alameen-panel-in .42s cubic-bezier(.16,1,.3,1)}
    #alameen-assistant-root.open #alameen-assistant-toggle{display:none}
    @keyframes alameen-panel-in{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
    .alameen-assistant-head{display:flex;align-items:center;gap:11px;padding:15px 16px;background:#101010;color:#f2efe8}
    html[dir="rtl"] .alameen-assistant-head{flex-direction:row-reverse}
    .alameen-assistant-head-copy{display:grid;gap:3px;flex:1;text-align:left}
    html[dir="rtl"] .alameen-assistant-head-copy{text-align:right}
    .alameen-assistant-head-copy strong{font-size:13px}
    .alameen-assistant-head-copy span{font-size:9px;color:#aaa}
    .alameen-assistant-close{border:0;background:transparent;color:#f2efe8;font-size:25px;line-height:1;cursor:pointer;padding:2px 6px}
    .alameen-assistant-close:hover{color:#ff6b6b}
    .alameen-human-stage{position:relative;display:grid;place-items:center;min-height:190px;padding:18px 16px 13px;overflow:hidden;background:radial-gradient(circle at 50% 35%,rgba(255,107,107,.28),transparent 44%),linear-gradient(135deg,#15151b,#34305a 52%,#ff6253)}
    .alameen-human-stage:before{content:"";position:absolute;width:190px;height:190px;border:1px solid rgba(255,255,255,.26);border-radius:50%;animation:alameen-orbit 18s linear infinite}
    .alameen-human-stage:after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 15%,rgba(255,255,255,.1) 48%,transparent 70%);transform:translateX(-120%);animation:alameen-sheen 7s ease-in-out infinite}
    .alameen-human-portrait{position:relative;z-index:1;width:148px;height:148px;overflow:hidden;border:3px solid rgba(255,255,255,.86);border-radius:50%;box-shadow:0 20px 55px rgba(0,0,0,.34);animation:alameen-idle 4.5s ease-in-out infinite}
    .alameen-human-portrait img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 23%;filter:saturate(1.04) contrast(1.02)}
    .alameen-speech-bars{position:absolute;z-index:2;bottom:18px;display:flex;align-items:end;gap:3px;height:20px}
    .alameen-speech-bars i{display:block;width:3px;height:5px;border-radius:9px;background:#fff;opacity:.72}
    #alameen-assistant-root.speaking .alameen-human-portrait{animation:alameen-speaking 1.15s ease-in-out infinite}
    #alameen-assistant-root.speaking .alameen-human-portrait:after{content:"";position:absolute;inset:-8px;border:2px solid rgba(255,255,255,.46);border-radius:50%;animation:alameen-pulse 1.15s ease-out infinite}
    #alameen-assistant-root.speaking .alameen-speech-bars i{animation:alameen-bars .72s ease-in-out infinite alternate}
    #alameen-assistant-root.speaking .alameen-speech-bars i:nth-child(2){animation-delay:.12s}
    #alameen-assistant-root.speaking .alameen-speech-bars i:nth-child(3){animation-delay:.24s}
    #alameen-assistant-root.speaking .alameen-speech-bars i:nth-child(4){animation-delay:.36s}
    #alameen-assistant-root.speaking .alameen-speech-bars i:nth-child(5){animation-delay:.48s}
    .alameen-human-caption{position:absolute;z-index:2;bottom:7px;color:rgba(255,255,255,.78);font-size:9px;letter-spacing:.05em}
    @keyframes alameen-idle{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}}
    @keyframes alameen-speaking{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.025)}}
    @keyframes alameen-pulse{0%{opacity:.8;transform:scale(.96)}100%{opacity:0;transform:scale(1.12)}}
    @keyframes alameen-bars{0%{height:5px}100%{height:19px}}
    @keyframes alameen-orbit{to{transform:rotate(360deg)}}
    @keyframes alameen-sheen{0%,62%,100%{transform:translateX(-120%)}78%{transform:translateX(120%)}}
    .alameen-assistant-messages{flex:1;overflow:auto;padding:18px 16px 10px;display:flex;flex-direction:column;gap:10px;background:radial-gradient(circle at 100% 0,rgba(255,107,107,.12),transparent 34%),#f2efe8}
    .alameen-message{max-width:86%;padding:11px 13px;border-radius:15px;font-size:12px;line-height:1.65;white-space:pre-wrap}
    .alameen-message.assistant{align-self:flex-start;background:#fff;border:1px solid rgba(16,16,16,.08);border-bottom-left-radius:4px}
    .alameen-message.user{align-self:flex-end;background:#101010;color:#f2efe8;border-bottom-right-radius:4px}
    html[dir="rtl"] .alameen-message.assistant{align-self:flex-end;border-bottom-left-radius:15px;border-bottom-right-radius:4px}
    html[dir="rtl"] .alameen-message.user{align-self:flex-start;border-bottom-right-radius:15px;border-bottom-left-radius:4px}
    .alameen-assistant-quick{display:flex;gap:7px;overflow:auto;padding:4px 16px 14px;background:#f2efe8;scrollbar-width:none}
    .alameen-assistant-quick::-webkit-scrollbar{display:none}
    .alameen-quick-button,.alameen-project-link{white-space:nowrap;border:1px solid rgba(16,16,16,.2);border-radius:999px;background:transparent;color:#101010;padding:8px 10px;font-size:10px;cursor:pointer}
    .alameen-quick-button:hover,.alameen-project-link:hover{background:#ff6b6b;border-color:#ff6b6b}
    .alameen-project-link{display:block;text-align:center;margin:0 16px 12px;background:#ff6b6b;border-color:#ff6b6b;font-weight:800;text-decoration:none}
    .alameen-assistant-footer{display:flex;align-items:center;gap:7px;padding:11px 12px;border-top:1px solid rgba(16,16,16,.12);background:#f2efe8}
    .alameen-assistant-form{display:flex;align-items:center;gap:7px;flex:1;border:1px solid rgba(16,16,16,.22);border-radius:999px;padding:4px 5px 4px 12px;background:#fff}
    html[dir="rtl"] .alameen-assistant-form{padding:4px 12px 4px 5px}
    .alameen-assistant-form input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:#101010;font-size:11px}
    .alameen-assistant-form button{border:0;border-radius:50%;width:31px;height:31px;background:#101010;color:#fff;cursor:pointer;font-size:14px}
    .alameen-speak{border:1px solid rgba(16,16,16,.2);border-radius:50%;width:36px;height:36px;background:transparent;cursor:pointer;font-size:15px}
    .alameen-speak:hover{background:#fff}
    @media(max-width:560px){#alameen-assistant-root{right:16px;bottom:16px}html[dir="rtl"] #alameen-assistant-root{right:auto;left:16px}.alameen-assistant-panel{height:min(620px,calc(100vh - 32px))}}
  `;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'alameen-assistant-root';
  root.innerHTML = `
    <button class="alameen-assistant-toggle" type="button" aria-expanded="false" aria-controls="alameen-assistant-panel">
      <span class="alameen-avatar small"><img alt=""></span>
      <span class="alameen-toggle-copy"><strong></strong><small>A SOLUTION</small></span>
      <span class="alameen-live-dot" aria-hidden="true"></span>
    </button>
    <section id="alameen-assistant-panel" class="alameen-assistant-panel" role="dialog" aria-modal="false">
      <header class="alameen-assistant-head">
        <span class="alameen-avatar large"><img alt=""></span>
        <div class="alameen-assistant-head-copy"><strong></strong><span></span></div>
        <button class="alameen-assistant-close" type="button" aria-label=""></button>
      </header>
      <div class="alameen-human-stage" aria-live="polite">
        <div class="alameen-human-portrait"><img alt=""></div>
        <div class="alameen-speech-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <span class="alameen-human-caption"></span>
      </div>
      <div class="alameen-assistant-messages"></div>
      <div class="alameen-assistant-quick"></div>
      <a class="alameen-project-link" href="#contact"></a>
      <footer class="alameen-assistant-footer">
        <form class="alameen-assistant-form">
          <input type="text" autocomplete="off">
          <button type="submit" aria-label=""></button>
        </form>
        <button class="alameen-speak" type="button" aria-label="">🔊</button>
      </footer>
    </section>
  `;
  document.body.appendChild(root);

  var toggle = root.querySelector('.alameen-assistant-toggle');
  var panel = root.querySelector('.alameen-assistant-panel');
  var close = root.querySelector('.alameen-assistant-close');
  var messages = root.querySelector('.alameen-assistant-messages');
  var quick = root.querySelector('.alameen-assistant-quick');
  var form = root.querySelector('.alameen-assistant-form');
  var input = form.querySelector('input');
  var speakButton = root.querySelector('.alameen-speak');
  var projectLink = root.querySelector('.alameen-project-link');
  var humanPortrait = root.querySelector('.alameen-human-portrait img');
  var humanCaption = root.querySelector('.alameen-human-caption');
  var lastAssistantMessage = core.getWelcome(lang);

  root.querySelectorAll('img').forEach(function (image) {
    image.src = avatar;
    image.alt = copy.name;
  });
  humanPortrait.src = avatar;
  humanPortrait.alt = copy.name;
  humanCaption.textContent = copy.idle;
  root.querySelector('.alameen-toggle-copy strong').textContent = copy.name;
  root.querySelector('.alameen-assistant-head-copy strong').textContent = copy.name;
  root.querySelector('.alameen-assistant-head-copy span').textContent = copy.role + ' · ' + copy.status;
  root.querySelector('.alameen-assistant-close').textContent = '×';
  root.querySelector('.alameen-assistant-close').setAttribute('aria-label', copy.close);
  input.placeholder = copy.input;
  form.querySelector('button').textContent = '↗';
  form.querySelector('button').setAttribute('aria-label', copy.send);
  speakButton.setAttribute('aria-label', copy.speak);
  projectLink.textContent = copy.project;

  function addMessage(text, type) {
    var bubble = document.createElement('div');
    bubble.className = 'alameen-message ' + type;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function answer(text) {
    addMessage(text, 'assistant');
    lastAssistantMessage = text;
    speakText(text);
  }

  function setSpeaking(active) {
    root.classList.toggle('speaking', active);
    humanCaption.textContent = active ? copy.speaking : copy.idle;
  }

  function speakText(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    window.speechSynthesis.cancel();
    var speech = core.getSpeechConfig(lang);
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speech.lang;
    utterance.rate = speech.rate;
    utterance.pitch = speech.pitch;
    utterance.onstart = function () { setSpeaking(true); };
    utterance.onend = function () { setSpeaking(false); };
    utterance.onerror = function () { setSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  }

  addMessage(lastAssistantMessage, 'assistant');

  copy.quick.forEach(function (item) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'alameen-quick-button';
    button.textContent = item[0];
    button.addEventListener('click', function () {
      addMessage(item[0], 'user');
      window.setTimeout(function () { answer(core.getReply(item[1], lang)); }, 260);
    });
    quick.appendChild(button);
  });

  function setOpen(open) {
    root.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      speakText(lastAssistantMessage);
      window.setTimeout(function () { input.focus(); }, 80);
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }

  toggle.addEventListener('click', function () { setOpen(true); });
  close.addEventListener('click', function () { setOpen(false); });
  projectLink.addEventListener('click', function () { setOpen(false); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = input.value.trim();
    if (!value) return;
    addMessage(value, 'user');
    input.value = '';
    window.setTimeout(function () { answer(core.getReply(value, lang)); }, 300);
  });

  speakButton.addEventListener('click', function () {
    speakText(lastAssistantMessage);
  });
})();
