(function (root, factory) {
  'use strict';

  var runtimeCore = root && root.AlameenLiveAvatarCore;
  if (!runtimeCore && typeof module === 'object' && module.exports) runtimeCore = require('./alameen-liveavatar-core.js');
  var api = factory(runtimeCore);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AlameenLiveAvatar = api;
}(typeof self !== 'undefined' ? self : (typeof globalThis !== 'undefined' ? globalThis : this), function (core) {
  'use strict';

  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@heygen/liveavatar-web-sdk@0.0.19/+esm';

  function defaultSdkLoader() {
    return import(SDK_URL);
  }

  function readableError(error) {
    if (error && error.message) return String(error.message);
    return 'تعذر تشغيل المساعد الرقمي';
  }

  function eventConstant(sdk, group, name, fallback) {
    return sdk && sdk[group] && sdk[group][name] ? sdk[group][name] : fallback;
  }

  function createAlameenLiveAvatar(options) {
    var settings = options || {};
    if (!core) throw new Error('AlameenLiveAvatarCore is required');

    var config = core.normalizeLiveAvatarConfig(settings);
    var fetchImpl = settings.fetchImpl || (typeof fetch === 'function' ? fetch.bind(typeof window !== 'undefined' ? window : null) : null);
    var sdkLoader = settings.sdkLoader || defaultSdkLoader;
    var supabasePublishableKey = String(settings.supabasePublishableKey || settings.supabaseAnonKey || '').trim();
    var video = settings.video || null;
    var state = core.createLiveAvatarState();
    var session = null;
    var connectPromise = null;
    var connectionSerial = 0;
    var intentionalDisconnect = false;

    function cancelledConnectionError() {
      var error = new Error('LiveAvatar connection was cancelled');
      error.code = 'LIVEAVATAR_CANCELLED';
      return error;
    }

    function notify(name, payload) {
      if (typeof settings[name] === 'function') settings[name](payload);
    }

    function update(event) {
      state = core.transitionLiveAvatarState(state, event);
      notify('onState', state);
      if (state.status === 'ready') notify('onReady', state);
      if (state.status === 'listening') notify('onListening', state);
      if (state.status === 'thinking') notify('onThinking', state);
      if (state.status === 'speaking') notify('onSpeaking', state);
      if (state.status === 'idle') notify('onIdle', state);
      if (state.status === 'error') notify('onError', new Error(state.error || 'تعذر الاتصال بالمساعد الرقمي'));
      return state;
    }

    function bindSessionEvents(activeSession, sdk) {
      var sessionEvents = sdk && sdk.SessionEvent;
      var agentEvents = sdk && sdk.AgentEventsEnum;
      var readyEvent = eventConstant(sdk, 'SessionEvent', 'SESSION_STREAM_READY', 'SESSION_STREAM_READY');
      var stateEvent = eventConstant(sdk, 'SessionEvent', 'SESSION_STATE_CHANGED', 'SESSION_STATE_CHANGED');
      var disconnectedEvent = eventConstant(sdk, 'SessionEvent', 'SESSION_DISCONNECTED', 'SESSION_DISCONNECTED');
      var speakingStartEvent = eventConstant(sdk, 'AgentEventsEnum', 'AVATAR_SPEAK_STARTED', 'AVATAR_SPEAK_STARTED');
      var speakingEndEvent = eventConstant(sdk, 'AgentEventsEnum', 'AVATAR_SPEAK_ENDED', 'AVATAR_SPEAK_ENDED');
      var userStartEvent = eventConstant(sdk, 'AgentEventsEnum', 'USER_START', 'USER_START');
      var userStopEvent = eventConstant(sdk, 'AgentEventsEnum', 'USER_STOP', 'USER_STOP');

      if (typeof activeSession.on !== 'function') throw new Error('LiveAvatar session does not support events');

      activeSession.on(readyEvent, function () {
        if (video && typeof activeSession.attach === 'function') activeSession.attach(video);
        update('SESSION_STREAM_READY');
      });
      activeSession.on(stateEvent, function (event) {
        var name = typeof event === 'string' ? event : event && (event.type || event.state);
        if (name === 'CONNECTED' || name === 'SESSION_CONNECTED') update('SESSION_CONNECTED');
      });
      activeSession.on(disconnectedEvent, function (event) {
        if (video) video.srcObject = null;
        if (intentionalDisconnect) {
          update('SESSION_DISCONNECTED');
        } else {
          session = null;
          update({ type: 'SESSION_DISCONNECTED', error: event && event.error || 'LiveAvatar session disconnected unexpectedly' });
        }
      });
      activeSession.on(speakingStartEvent, function () { update('AVATAR_SPEAK_STARTED'); });
      activeSession.on(speakingEndEvent, function () { update('AVATAR_SPEAK_ENDED'); });
      activeSession.on(userStartEvent, function () { update('USER_START'); });
      activeSession.on(userStopEvent, function () { update('USER_STOP'); });

      // Keep these references discoverable in browser debugging without exposing secrets.
      void sessionEvents;
      void agentEvents;
    }

    function connect() {
      if (connectPromise) return connectPromise;
      if (!core.canStartLiveAvatar(state)) return Promise.resolve(session);
      if (!fetchImpl) return Promise.reject(new Error('fetch is not available'));

      update('SESSION_CONNECTING');
      var serial = ++connectionSerial;
      var pending;
      pending = (async function () {
        var response = await fetchImpl(config.tokenEndpoint, {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, supabasePublishableKey ? {
            apikey: supabasePublishableKey,
          } : {}),
          body: JSON.stringify({ avatar_id: config.avatarId }),
        });
        if (!response || !response.ok) throw new Error('تعذر الحصول على رمز جلسة LiveAvatar');
        var tokenPayload = await response.json();
        if (!tokenPayload || !tokenPayload.session_token) throw new Error('لم يصل رمز جلسة LiveAvatar');

        var sdk = await sdkLoader();
        var SessionClass = sdk && (sdk.LiveAvatarSession || (sdk.default && sdk.default.LiveAvatarSession) || sdk.default);
        if (typeof SessionClass !== 'function') throw new Error('لم يتم تحميل LiveAvatar Web SDK');

        if (serial !== connectionSerial) throw cancelledConnectionError();
        var activeSession = new SessionClass(tokenPayload.session_token, {
          autoKeepAlive: config.autoKeepAlive,
          // Let the video session connect without requiring microphone access.
          // Voice input is enabled only when the user presses the microphone button.
          voiceChat: { defaultMuted: true },
        });
        if (serial !== connectionSerial) {
          if (typeof activeSession.stop === 'function') await activeSession.stop();
          throw cancelledConnectionError();
        }
        session = activeSession;
        intentionalDisconnect = false;
        bindSessionEvents(activeSession, sdk);
        await activeSession.start();
        if (serial !== connectionSerial) {
          if (session === activeSession) session = null;
          if (typeof activeSession.stop === 'function') await activeSession.stop();
          throw cancelledConnectionError();
        }
        return activeSession;
      }()).catch(function (error) {
        if (error && error.code === 'LIVEAVATAR_CANCELLED') throw error;
        session = null;
        update({ type: 'ERROR', error: readableError(error) });
        throw error;
      }).finally(function () {
        if (connectPromise === pending) connectPromise = null;
      });
      connectPromise = pending;

      return connectPromise;
    }

    async function startListening() {
      var active = session || await connect();
      if (active && typeof active.startListening === 'function') active.startListening();
    }

    function stopListening() {
      try {
        if (session && typeof session.stopListening === 'function') session.stopListening();
      } catch (error) {
        // A stop request can race the provider's asynchronous connection.
      }
    }

    async function speak(text) {
      var active = session || await connect();
      if (!active) throw new Error('LiveAvatar session is not available');
      if (typeof active.repeat === 'function') return active.repeat(String(text || ''));
      if (typeof active.message === 'function') return active.message(String(text || ''));
      throw new Error('LiveAvatar session cannot speak text');
    }

    async function disconnect() {
      connectionSerial += 1;
      connectPromise = null;
      intentionalDisconnect = true;
      var active = session;
      session = null;
      if (active && typeof active.stop === 'function') await active.stop();
      if (video) video.srcObject = null;
      if (state.status !== 'error') update('SESSION_DISCONNECTED');
    }

    return {
      connect: connect,
      startListening: startListening,
      stopListening: stopListening,
      speak: speak,
      disconnect: disconnect,
      isConnected: function () { return Boolean(session && state.connected); },
      getState: function () { return Object.assign({}, state); },
    };
  }

  return { createAlameenLiveAvatar: createAlameenLiveAvatar };
}));
