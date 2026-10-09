(function (root, factory) {
  'use strict';

  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AlameenLiveAvatarCore = api;
}(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  function createLiveAvatarState() {
    return {
      status: 'idle',
      connected: false,
      sessionStarted: false,
      listening: false,
      speaking: false,
      error: null,
    };
  }

  function isAllowedTokenEndpoint(value) {
    try {
      var url = new URL(value);
      return url.protocol === 'https:' || (url.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(url.hostname));
    } catch (error) {
      return false;
    }
  }

  function normalizeLiveAvatarConfig(input) {
    var config = input || {};
    if (!config.tokenEndpoint) throw new Error('tokenEndpoint is required');
    if (!isAllowedTokenEndpoint(String(config.tokenEndpoint))) throw new Error('tokenEndpoint must use HTTPS');
    if (!config.avatarId) throw new Error('avatarId is required');

    return {
      tokenEndpoint: String(config.tokenEndpoint),
      avatarId: String(config.avatarId),
      language: String(config.language || 'ar-SA'),
      autoKeepAlive: config.autoKeepAlive !== false,
    };
  }

  function eventName(event) {
    return typeof event === 'string' ? event : String(event && (event.type || event.event_type || event.name) || '');
  }

  function eventError(event) {
    if (typeof event === 'object' && event && event.error) return String(event.error.message || event.error);
    return 'تعذر الاتصال بالمساعد الرقمي';
  }

  function transitionLiveAvatarState(previous, event) {
    var next = Object.assign(createLiveAvatarState(), previous || {});
    var name = eventName(event);

    if (name === 'SESSION_CONNECTING' || name === 'CONNECTING') {
      next.status = 'connecting';
      next.error = null;
    } else if (name === 'SESSION_STREAM_READY' || name === 'SESSION_CONNECTED' || name === 'CONNECTED') {
      next.status = 'ready';
      next.connected = true;
      next.sessionStarted = true;
      next.listening = false;
      next.speaking = false;
      next.error = null;
    } else if (name === 'USER_START' || name === 'LISTENING') {
      next.status = 'listening';
      next.listening = true;
      next.speaking = false;
      next.error = null;
    } else if (name === 'USER_STOP' || name === 'THINKING') {
      next.status = 'thinking';
      next.listening = false;
      next.speaking = false;
    } else if (name === 'AVATAR_SPEAK_STARTED' || name === 'SPEAKING') {
      next.status = 'speaking';
      next.connected = true;
      next.sessionStarted = true;
      next.listening = false;
      next.speaking = true;
      next.error = null;
    } else if (name === 'AVATAR_SPEAK_ENDED' || name === 'IDLE') {
      next.status = 'idle';
      next.listening = false;
      next.speaking = false;
      next.error = null;
    } else if (name === 'SESSION_DISCONNECTED' || name === 'DISCONNECTED') {
      next.status = event && event.error ? 'error' : 'idle';
      next.connected = false;
      next.sessionStarted = false;
      next.listening = false;
      next.speaking = false;
      next.error = event && event.error ? eventError(event) : null;
    } else if (name === 'ERROR' || name === 'SESSION_ERROR') {
      next.status = 'error';
      next.connected = false;
      next.sessionStarted = false;
      next.listening = false;
      next.speaking = false;
      next.error = eventError(event);
    }

    return next;
  }

  function canStartLiveAvatar(state) {
    var current = state || createLiveAvatarState();
    return !current.sessionStarted && (current.status === 'idle' || current.status === 'error');
  }

  return {
    createLiveAvatarState: createLiveAvatarState,
    normalizeLiveAvatarConfig: normalizeLiveAvatarConfig,
    transitionLiveAvatarState: transitionLiveAvatarState,
    canStartLiveAvatar: canStartLiveAvatar,
  };
}));
