"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name4 in all)
      __defProp(target, name4, { get: all[name4], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/adapters.js
  var adapters_default;
  var init_adapters = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/adapters.js"() {
      adapters_default = {
        logger: self.console,
        WebSocket: self.WebSocket
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/logger.js
  var logger_default;
  var init_logger = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/logger.js"() {
      init_adapters();
      logger_default = {
        log(...messages) {
          if (this.enabled) {
            messages.push(Date.now());
            adapters_default.logger.log("[ActionCable]", ...messages);
          }
        }
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/connection_monitor.js
  var now, secondsSince, ConnectionMonitor, connection_monitor_default;
  var init_connection_monitor = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/connection_monitor.js"() {
      init_logger();
      now = () => (/* @__PURE__ */ new Date()).getTime();
      secondsSince = (time) => (now() - time) / 1e3;
      ConnectionMonitor = class {
        constructor(connection) {
          this.visibilityDidChange = this.visibilityDidChange.bind(this);
          this.connection = connection;
          this.reconnectAttempts = 0;
        }
        start() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            addEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
          }
        }
        stop() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            removeEventListener("visibilitychange", this.visibilityDidChange);
            logger_default.log("ConnectionMonitor stopped");
          }
        }
        isRunning() {
          return this.startedAt && !this.stoppedAt;
        }
        recordPing() {
          this.pingedAt = now();
        }
        recordConnect() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          logger_default.log("ConnectionMonitor recorded connect");
        }
        recordDisconnect() {
          this.disconnectedAt = now();
          logger_default.log("ConnectionMonitor recorded disconnect");
        }
        // Private
        startPolling() {
          this.stopPolling();
          this.poll();
        }
        stopPolling() {
          clearTimeout(this.pollTimeout);
        }
        poll() {
          this.pollTimeout = setTimeout(
            () => {
              this.reconnectIfStale();
              this.poll();
            },
            this.getPollInterval()
          );
        }
        getPollInterval() {
          const { staleThreshold, reconnectionBackoffRate } = this.constructor;
          const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
          const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
          const jitter = jitterMax * Math.random();
          return staleThreshold * 1e3 * backoff * (1 + jitter);
        }
        reconnectIfStale() {
          if (this.connectionIsStale()) {
            logger_default.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              logger_default.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince(this.disconnectedAt)} s`);
            } else {
              logger_default.log("ConnectionMonitor reopening");
              this.connection.reopen();
            }
          }
        }
        get refreshedAt() {
          return this.pingedAt ? this.pingedAt : this.startedAt;
        }
        connectionIsStale() {
          return secondsSince(this.refreshedAt) > this.constructor.staleThreshold;
        }
        disconnectedRecently() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        }
        visibilityDidChange() {
          if (document.visibilityState === "visible") {
            setTimeout(
              () => {
                if (this.connectionIsStale() || !this.connection.isOpen()) {
                  logger_default.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
                  this.connection.reopen();
                }
              },
              200
            );
          }
        }
      };
      ConnectionMonitor.staleThreshold = 6;
      ConnectionMonitor.reconnectionBackoffRate = 0.15;
      connection_monitor_default = ConnectionMonitor;
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/internal.js
  var internal_default;
  var init_internal = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/internal.js"() {
      internal_default = {
        "message_types": {
          "welcome": "welcome",
          "disconnect": "disconnect",
          "ping": "ping",
          "confirmation": "confirm_subscription",
          "rejection": "reject_subscription"
        },
        "disconnect_reasons": {
          "unauthorized": "unauthorized",
          "invalid_request": "invalid_request",
          "server_restart": "server_restart"
        },
        "default_mount_path": "/cable",
        "protocols": [
          "actioncable-v1-json",
          "actioncable-unsupported"
        ]
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/connection.js
  var message_types, protocols, supportedProtocols, indexOf, Connection, connection_default;
  var init_connection = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/connection.js"() {
      init_adapters();
      init_connection_monitor();
      init_internal();
      init_logger();
      ({ message_types, protocols } = internal_default);
      supportedProtocols = protocols.slice(0, protocols.length - 1);
      indexOf = [].indexOf;
      Connection = class {
        constructor(consumer5) {
          this.open = this.open.bind(this);
          this.consumer = consumer5;
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new connection_monitor_default(this);
          this.disconnected = true;
        }
        send(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        }
        open() {
          if (this.isActive()) {
            logger_default.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
            return false;
          } else {
            logger_default.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);
            if (this.webSocket) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new adapters_default.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        }
        close({ allowReconnect } = { allowReconnect: true }) {
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isOpen()) {
            return this.webSocket.close();
          }
        }
        reopen() {
          logger_default.log(`Reopening WebSocket, current state is ${this.getState()}`);
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error3) {
              logger_default.log("Failed to reopen WebSocket", error3);
            } finally {
              logger_default.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        }
        getProtocol() {
          if (this.webSocket) {
            return this.webSocket.protocol;
          }
        }
        isOpen() {
          return this.isState("open");
        }
        isActive() {
          return this.isState("open", "connecting");
        }
        // Private
        isProtocolSupported() {
          return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
        }
        isState(...states) {
          return indexOf.call(states, this.getState()) >= 0;
        }
        getState() {
          if (this.webSocket) {
            for (let state in adapters_default.WebSocket) {
              if (adapters_default.WebSocket[state] === this.webSocket.readyState) {
                return state.toLowerCase();
              }
            }
          }
          return null;
        }
        installEventHandlers() {
          for (let eventName in this.events) {
            const handler = this.events[eventName].bind(this);
            this.webSocket[`on${eventName}`] = handler;
          }
        }
        uninstallEventHandlers() {
          for (let eventName in this.events) {
            this.webSocket[`on${eventName}`] = function() {
            };
          }
        }
      };
      Connection.reopenDelay = 500;
      Connection.prototype.events = {
        message(event) {
          if (!this.isProtocolSupported()) {
            return;
          }
          const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
          switch (type) {
            case message_types.welcome:
              this.monitor.recordConnect();
              return this.subscriptions.reload();
            case message_types.disconnect:
              logger_default.log(`Disconnecting. Reason: ${reason}`);
              return this.close({ allowReconnect: reconnect });
            case message_types.ping:
              return this.monitor.recordPing();
            case message_types.confirmation:
              this.subscriptions.confirmSubscription(identifier);
              return this.subscriptions.notify(identifier, "connected");
            case message_types.rejection:
              return this.subscriptions.reject(identifier);
            default:
              return this.subscriptions.notify(identifier, "received", message);
          }
        },
        open() {
          logger_default.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
          this.disconnected = false;
          if (!this.isProtocolSupported()) {
            logger_default.log("Protocol is unsupported. Stopping monitor and disconnecting.");
            return this.close({ allowReconnect: false });
          }
        },
        close(event) {
          logger_default.log("WebSocket onclose event");
          if (this.disconnected) {
            return;
          }
          this.disconnected = true;
          this.monitor.recordDisconnect();
          return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
        },
        error() {
          logger_default.log("WebSocket onerror event");
        }
      };
      connection_default = Connection;
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscription.js
  var extend, Subscription;
  var init_subscription = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscription.js"() {
      extend = function(object, properties) {
        if (properties != null) {
          for (let key in properties) {
            const value = properties[key];
            object[key] = value;
          }
        }
        return object;
      };
      Subscription = class {
        constructor(consumer5, params2 = {}, mixin) {
          this.consumer = consumer5;
          this.identifier = JSON.stringify(params2);
          extend(this, mixin);
        }
        // Perform a channel action with the optional data passed as an attribute
        perform(action, data = {}) {
          data.action = action;
          return this.send(data);
        }
        send(data) {
          return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
        }
        unsubscribe() {
          return this.consumer.subscriptions.remove(this);
        }
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscription_guarantor.js
  var SubscriptionGuarantor, subscription_guarantor_default;
  var init_subscription_guarantor = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscription_guarantor.js"() {
      init_logger();
      SubscriptionGuarantor = class {
        constructor(subscriptions) {
          this.subscriptions = subscriptions;
          this.pendingSubscriptions = [];
        }
        guarantee(subscription2) {
          if (this.pendingSubscriptions.indexOf(subscription2) == -1) {
            logger_default.log(`SubscriptionGuarantor guaranteeing ${subscription2.identifier}`);
            this.pendingSubscriptions.push(subscription2);
          } else {
            logger_default.log(`SubscriptionGuarantor already guaranteeing ${subscription2.identifier}`);
          }
          this.startGuaranteeing();
        }
        forget(subscription2) {
          logger_default.log(`SubscriptionGuarantor forgetting ${subscription2.identifier}`);
          this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription2);
        }
        startGuaranteeing() {
          this.stopGuaranteeing();
          this.retrySubscribing();
        }
        stopGuaranteeing() {
          clearTimeout(this.retryTimeout);
        }
        retrySubscribing() {
          this.retryTimeout = setTimeout(
            () => {
              if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
                this.pendingSubscriptions.map((subscription2) => {
                  logger_default.log(`SubscriptionGuarantor resubscribing ${subscription2.identifier}`);
                  this.subscriptions.subscribe(subscription2);
                });
              }
            },
            500
          );
        }
      };
      subscription_guarantor_default = SubscriptionGuarantor;
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscriptions.js
  var Subscriptions;
  var init_subscriptions = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/subscriptions.js"() {
      init_subscription();
      init_subscription_guarantor();
      init_logger();
      Subscriptions = class {
        constructor(consumer5) {
          this.consumer = consumer5;
          this.guarantor = new subscription_guarantor_default(this);
          this.subscriptions = [];
        }
        create(channelName, mixin) {
          const channel = channelName;
          const params2 = typeof channel === "object" ? channel : { channel };
          const subscription2 = new Subscription(this.consumer, params2, mixin);
          return this.add(subscription2);
        }
        // Private
        add(subscription2) {
          this.subscriptions.push(subscription2);
          this.consumer.ensureActiveConnection();
          this.notify(subscription2, "initialized");
          this.subscribe(subscription2);
          return subscription2;
        }
        remove(subscription2) {
          this.forget(subscription2);
          if (!this.findAll(subscription2.identifier).length) {
            this.sendCommand(subscription2, "unsubscribe");
          }
          return subscription2;
        }
        reject(identifier) {
          return this.findAll(identifier).map((subscription2) => {
            this.forget(subscription2);
            this.notify(subscription2, "rejected");
            return subscription2;
          });
        }
        forget(subscription2) {
          this.guarantor.forget(subscription2);
          this.subscriptions = this.subscriptions.filter((s) => s !== subscription2);
          return subscription2;
        }
        findAll(identifier) {
          return this.subscriptions.filter((s) => s.identifier === identifier);
        }
        reload() {
          return this.subscriptions.map((subscription2) => this.subscribe(subscription2));
        }
        notifyAll(callbackName, ...args) {
          return this.subscriptions.map((subscription2) => this.notify(subscription2, callbackName, ...args));
        }
        notify(subscription2, callbackName, ...args) {
          let subscriptions;
          if (typeof subscription2 === "string") {
            subscriptions = this.findAll(subscription2);
          } else {
            subscriptions = [subscription2];
          }
          return subscriptions.map((subscription3) => typeof subscription3[callbackName] === "function" ? subscription3[callbackName](...args) : void 0);
        }
        subscribe(subscription2) {
          if (this.sendCommand(subscription2, "subscribe")) {
            this.guarantor.guarantee(subscription2);
          }
        }
        confirmSubscription(identifier) {
          logger_default.log(`Subscription confirmed ${identifier}`);
          this.findAll(identifier).map((subscription2) => this.guarantor.forget(subscription2));
        }
        sendCommand(subscription2, command) {
          const { identifier } = subscription2;
          return this.consumer.send({ command, identifier });
        }
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/consumer.js
  function createWebSocketURL(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  var Consumer;
  var init_consumer = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/consumer.js"() {
      init_connection();
      init_subscriptions();
      Consumer = class {
        constructor(url) {
          this._url = url;
          this.subscriptions = new Subscriptions(this);
          this.connection = new connection_default(this);
        }
        get url() {
          return createWebSocketURL(this._url);
        }
        send(data) {
          return this.connection.send(data);
        }
        connect() {
          return this.connection.open();
        }
        disconnect() {
          return this.connection.close({ allowReconnect: false });
        }
        ensureActiveConnection() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        }
      };
    }
  });

  // ../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/index.js
  var src_exports = {};
  __export(src_exports, {
    Connection: () => connection_default,
    ConnectionMonitor: () => connection_monitor_default,
    Consumer: () => Consumer,
    INTERNAL: () => internal_default,
    Subscription: () => Subscription,
    SubscriptionGuarantor: () => subscription_guarantor_default,
    Subscriptions: () => Subscriptions,
    adapters: () => adapters_default,
    createConsumer: () => createConsumer,
    createWebSocketURL: () => createWebSocketURL,
    getConfig: () => getConfig,
    logger: () => logger_default
  });
  function createConsumer(url = getConfig("url") || internal_default.default_mount_path) {
    return new Consumer(url);
  }
  function getConfig(name4) {
    const element = document.head.querySelector(`meta[name='action-cable-${name4}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  var init_src = __esm({
    "../../node_modules/@hotwired/turbo-rails/node_modules/@rails/actioncable/src/index.js"() {
      init_connection();
      init_connection_monitor();
      init_consumer();
      init_internal();
      init_subscription();
      init_subscriptions();
      init_subscription_guarantor();
      init_adapters();
      init_logger();
    }
  });

  // controllers/_messages_controller.js
  var require_messages_controller = __commonJS({
    "controllers/_messages_controller.js"() {
      "use strict";
    }
  });

  // ../../node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js
  (function() {
    if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.polyfillWrapFlushCallback) {
      return;
    }
    const BuiltInHTMLElement = HTMLElement;
    const wrapperForTheName = {
      HTMLElement: function HTMLElement2() {
        return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
      }
    };
    window.HTMLElement = wrapperForTheName["HTMLElement"];
    HTMLElement.prototype = BuiltInHTMLElement.prototype;
    HTMLElement.prototype.constructor = HTMLElement;
    Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
  })();
  (function(prototype) {
    if (typeof prototype.requestSubmit == "function") return;
    prototype.requestSubmit = function(submitter) {
      if (submitter) {
        validateSubmitter(submitter, this);
        submitter.click();
      } else {
        submitter = document.createElement("input");
        submitter.type = "submit";
        submitter.hidden = true;
        this.appendChild(submitter);
        submitter.click();
        this.removeChild(submitter);
      }
    };
    function validateSubmitter(submitter, form) {
      submitter instanceof HTMLElement || raise(TypeError, "parameter 1 is not of type 'HTMLElement'");
      submitter.type == "submit" || raise(TypeError, "The specified element is not a submit button");
      submitter.form == form || raise(DOMException, "The specified element is not owned by this form element", "NotFoundError");
    }
    function raise(errorConstructor, message, name4) {
      throw new errorConstructor("Failed to execute 'requestSubmit' on 'HTMLFormElement': " + message + ".", name4);
    }
  })(HTMLFormElement.prototype);
  var submittersByForm = /* @__PURE__ */ new WeakMap();
  function findSubmitterFromClickTarget(target) {
    const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    const candidate = element ? element.closest("input, button") : null;
    return (candidate === null || candidate === void 0 ? void 0 : candidate.type) == "submit" ? candidate : null;
  }
  function clickCaptured(event) {
    const submitter = findSubmitterFromClickTarget(event.target);
    if (submitter && submitter.form) {
      submittersByForm.set(submitter.form, submitter);
    }
  }
  (function() {
    if ("submitter" in Event.prototype)
      return;
    let prototype = window.Event.prototype;
    if ("SubmitEvent" in window && /Apple Computer/.test(navigator.vendor)) {
      prototype = window.SubmitEvent.prototype;
    } else if ("SubmitEvent" in window) {
      return;
    }
    addEventListener("click", clickCaptured, true);
    Object.defineProperty(prototype, "submitter", {
      get() {
        if (this.type == "submit" && this.target instanceof HTMLFormElement) {
          return submittersByForm.get(this.target);
        }
      }
    });
  })();
  var FrameLoadingStyle;
  (function(FrameLoadingStyle2) {
    FrameLoadingStyle2["eager"] = "eager";
    FrameLoadingStyle2["lazy"] = "lazy";
  })(FrameLoadingStyle || (FrameLoadingStyle = {}));
  var FrameElement = class _FrameElement extends HTMLElement {
    static get observedAttributes() {
      return ["disabled", "complete", "loading", "src"];
    }
    constructor() {
      super();
      this.loaded = Promise.resolve();
      this.delegate = new _FrameElement.delegateConstructor(this);
    }
    connectedCallback() {
      this.delegate.connect();
    }
    disconnectedCallback() {
      this.delegate.disconnect();
    }
    reload() {
      return this.delegate.sourceURLReloaded();
    }
    attributeChangedCallback(name4) {
      if (name4 == "loading") {
        this.delegate.loadingStyleChanged();
      } else if (name4 == "complete") {
        this.delegate.completeChanged();
      } else if (name4 == "src") {
        this.delegate.sourceURLChanged();
      } else {
        this.delegate.disabledChanged();
      }
    }
    get src() {
      return this.getAttribute("src");
    }
    set src(value) {
      if (value) {
        this.setAttribute("src", value);
      } else {
        this.removeAttribute("src");
      }
    }
    get loading() {
      return frameLoadingStyleFromString(this.getAttribute("loading") || "");
    }
    set loading(value) {
      if (value) {
        this.setAttribute("loading", value);
      } else {
        this.removeAttribute("loading");
      }
    }
    get disabled() {
      return this.hasAttribute("disabled");
    }
    set disabled(value) {
      if (value) {
        this.setAttribute("disabled", "");
      } else {
        this.removeAttribute("disabled");
      }
    }
    get autoscroll() {
      return this.hasAttribute("autoscroll");
    }
    set autoscroll(value) {
      if (value) {
        this.setAttribute("autoscroll", "");
      } else {
        this.removeAttribute("autoscroll");
      }
    }
    get complete() {
      return !this.delegate.isLoading;
    }
    get isActive() {
      return this.ownerDocument === document && !this.isPreview;
    }
    get isPreview() {
      var _a, _b;
      return (_b = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement) === null || _b === void 0 ? void 0 : _b.hasAttribute("data-turbo-preview");
    }
  };
  function frameLoadingStyleFromString(style) {
    switch (style.toLowerCase()) {
      case "lazy":
        return FrameLoadingStyle.lazy;
      default:
        return FrameLoadingStyle.eager;
    }
  }
  function expandURL(locatable) {
    return new URL(locatable.toString(), document.baseURI);
  }
  function getAnchor(url) {
    let anchorMatch;
    if (url.hash) {
      return url.hash.slice(1);
    } else if (anchorMatch = url.href.match(/#(.*)$/)) {
      return anchorMatch[1];
    }
  }
  function getAction(form, submitter) {
    const action = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formaction")) || form.getAttribute("action") || form.action;
    return expandURL(action);
  }
  function getExtension(url) {
    return (getLastPathComponent(url).match(/\.[^.]*$/) || [])[0] || "";
  }
  function isHTML(url) {
    return !!getExtension(url).match(/^(?:|\.(?:htm|html|xhtml|php))$/);
  }
  function isPrefixedBy(baseURL, url) {
    const prefix = getPrefix(url);
    return baseURL.href === expandURL(prefix).href || baseURL.href.startsWith(prefix);
  }
  function locationIsVisitable(location2, rootLocation) {
    return isPrefixedBy(location2, rootLocation) && isHTML(location2);
  }
  function getRequestURL(url) {
    const anchor = getAnchor(url);
    return anchor != null ? url.href.slice(0, -(anchor.length + 1)) : url.href;
  }
  function toCacheKey(url) {
    return getRequestURL(url);
  }
  function urlsAreEqual(left, right) {
    return expandURL(left).href == expandURL(right).href;
  }
  function getPathComponents(url) {
    return url.pathname.split("/").slice(1);
  }
  function getLastPathComponent(url) {
    return getPathComponents(url).slice(-1)[0];
  }
  function getPrefix(url) {
    return addTrailingSlash(url.origin + url.pathname);
  }
  function addTrailingSlash(value) {
    return value.endsWith("/") ? value : value + "/";
  }
  var FetchResponse = class {
    constructor(response3) {
      this.response = response3;
    }
    get succeeded() {
      return this.response.ok;
    }
    get failed() {
      return !this.succeeded;
    }
    get clientError() {
      return this.statusCode >= 400 && this.statusCode <= 499;
    }
    get serverError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
    get redirected() {
      return this.response.redirected;
    }
    get location() {
      return expandURL(this.response.url);
    }
    get isHTML() {
      return this.contentType && this.contentType.match(/^(?:text\/([^\s;,]+\b)?html|application\/xhtml\+xml)\b/);
    }
    get statusCode() {
      return this.response.status;
    }
    get contentType() {
      return this.header("Content-Type");
    }
    get responseText() {
      return this.response.clone().text();
    }
    get responseHTML() {
      if (this.isHTML) {
        return this.response.clone().text();
      } else {
        return Promise.resolve(void 0);
      }
    }
    header(name4) {
      return this.response.headers.get(name4);
    }
  };
  function activateScriptElement(element) {
    if (element.getAttribute("data-turbo-eval") == "false") {
      return element;
    } else {
      const createdScriptElement = document.createElement("script");
      const cspNonce = getMetaContent("csp-nonce");
      if (cspNonce) {
        createdScriptElement.nonce = cspNonce;
      }
      createdScriptElement.textContent = element.textContent;
      createdScriptElement.async = false;
      copyElementAttributes(createdScriptElement, element);
      return createdScriptElement;
    }
  }
  function copyElementAttributes(destinationElement, sourceElement) {
    for (const { name: name4, value } of sourceElement.attributes) {
      destinationElement.setAttribute(name4, value);
    }
  }
  function createDocumentFragment(html) {
    const template3 = document.createElement("template");
    template3.innerHTML = html;
    return template3.content;
  }
  function dispatch(eventName, { target, cancelable, detail } = {}) {
    const event = new CustomEvent(eventName, {
      cancelable,
      bubbles: true,
      composed: true,
      detail
    });
    if (target && target.isConnected) {
      target.dispatchEvent(event);
    } else {
      document.documentElement.dispatchEvent(event);
    }
    return event;
  }
  function nextAnimationFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  function nextEventLoopTick() {
    return new Promise((resolve) => setTimeout(() => resolve(), 0));
  }
  function nextMicrotask() {
    return Promise.resolve();
  }
  function parseHTMLDocument(html = "") {
    return new DOMParser().parseFromString(html, "text/html");
  }
  function unindent(strings, ...values) {
    const lines = interpolate(strings, values).replace(/^\n/, "").split("\n");
    const match = lines[0].match(/^\s+/);
    const indent = match ? match[0].length : 0;
    return lines.map((line) => line.slice(indent)).join("\n");
  }
  function interpolate(strings, values) {
    return strings.reduce((result, string, i) => {
      const value = values[i] == void 0 ? "" : values[i];
      return result + string + value;
    }, "");
  }
  function uuid() {
    return Array.from({ length: 36 }).map((_, i) => {
      if (i == 8 || i == 13 || i == 18 || i == 23) {
        return "-";
      } else if (i == 14) {
        return "4";
      } else if (i == 19) {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      } else {
        return Math.floor(Math.random() * 15).toString(16);
      }
    }).join("");
  }
  function getAttribute(attributeName, ...elements) {
    for (const value of elements.map((element) => element === null || element === void 0 ? void 0 : element.getAttribute(attributeName))) {
      if (typeof value == "string")
        return value;
    }
    return null;
  }
  function hasAttribute(attributeName, ...elements) {
    return elements.some((element) => element && element.hasAttribute(attributeName));
  }
  function markAsBusy(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.setAttribute("busy", "");
      }
      element.setAttribute("aria-busy", "true");
    }
  }
  function clearBusyState(...elements) {
    for (const element of elements) {
      if (element.localName == "turbo-frame") {
        element.removeAttribute("busy");
      }
      element.removeAttribute("aria-busy");
    }
  }
  function waitForLoad(element, timeoutInMilliseconds = 2e3) {
    return new Promise((resolve) => {
      const onComplete = () => {
        element.removeEventListener("error", onComplete);
        element.removeEventListener("load", onComplete);
        resolve();
      };
      element.addEventListener("load", onComplete, { once: true });
      element.addEventListener("error", onComplete, { once: true });
      setTimeout(resolve, timeoutInMilliseconds);
    });
  }
  function getHistoryMethodForAction(action) {
    switch (action) {
      case "replace":
        return history.replaceState;
      case "advance":
      case "restore":
        return history.pushState;
    }
  }
  function isAction(action) {
    return action == "advance" || action == "replace" || action == "restore";
  }
  function getVisitAction(...elements) {
    const action = getAttribute("data-turbo-action", ...elements);
    return isAction(action) ? action : null;
  }
  function getMetaElement(name4) {
    return document.querySelector(`meta[name="${name4}"]`);
  }
  function getMetaContent(name4) {
    const element = getMetaElement(name4);
    return element && element.content;
  }
  function setMetaContent(name4, content) {
    let element = getMetaElement(name4);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute("name", name4);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
    return element;
  }
  function findClosestRecursively(element, selector) {
    var _a;
    if (element instanceof Element) {
      return element.closest(selector) || findClosestRecursively(element.assignedSlot || ((_a = element.getRootNode()) === null || _a === void 0 ? void 0 : _a.host), selector);
    }
  }
  var FetchMethod;
  (function(FetchMethod2) {
    FetchMethod2[FetchMethod2["get"] = 0] = "get";
    FetchMethod2[FetchMethod2["post"] = 1] = "post";
    FetchMethod2[FetchMethod2["put"] = 2] = "put";
    FetchMethod2[FetchMethod2["patch"] = 3] = "patch";
    FetchMethod2[FetchMethod2["delete"] = 4] = "delete";
  })(FetchMethod || (FetchMethod = {}));
  function fetchMethodFromString(method) {
    switch (method.toLowerCase()) {
      case "get":
        return FetchMethod.get;
      case "post":
        return FetchMethod.post;
      case "put":
        return FetchMethod.put;
      case "patch":
        return FetchMethod.patch;
      case "delete":
        return FetchMethod.delete;
    }
  }
  var FetchRequest = class {
    constructor(delegate, method, location2, body = new URLSearchParams(), target = null) {
      this.abortController = new AbortController();
      this.resolveRequestPromise = (_value) => {
      };
      this.delegate = delegate;
      this.method = method;
      this.headers = this.defaultHeaders;
      this.body = body;
      this.url = location2;
      this.target = target;
    }
    get location() {
      return this.url;
    }
    get params() {
      return this.url.searchParams;
    }
    get entries() {
      return this.body ? Array.from(this.body.entries()) : [];
    }
    cancel() {
      this.abortController.abort();
    }
    async perform() {
      const { fetchOptions } = this;
      this.delegate.prepareRequest(this);
      await this.allowRequestToBeIntercepted(fetchOptions);
      try {
        this.delegate.requestStarted(this);
        const response3 = await fetch(this.url.href, fetchOptions);
        return await this.receive(response3);
      } catch (error3) {
        if (error3.name !== "AbortError") {
          if (this.willDelegateErrorHandling(error3)) {
            this.delegate.requestErrored(this, error3);
          }
          throw error3;
        }
      } finally {
        this.delegate.requestFinished(this);
      }
    }
    async receive(response3) {
      const fetchResponse = new FetchResponse(response3);
      const event = dispatch("turbo:before-fetch-response", {
        cancelable: true,
        detail: { fetchResponse },
        target: this.target
      });
      if (event.defaultPrevented) {
        this.delegate.requestPreventedHandlingResponse(this, fetchResponse);
      } else if (fetchResponse.succeeded) {
        this.delegate.requestSucceededWithResponse(this, fetchResponse);
      } else {
        this.delegate.requestFailedWithResponse(this, fetchResponse);
      }
      return fetchResponse;
    }
    get fetchOptions() {
      var _a;
      return {
        method: FetchMethod[this.method].toUpperCase(),
        credentials: "same-origin",
        headers: this.headers,
        redirect: "follow",
        body: this.isSafe ? null : this.body,
        signal: this.abortSignal,
        referrer: (_a = this.delegate.referrer) === null || _a === void 0 ? void 0 : _a.href
      };
    }
    get defaultHeaders() {
      return {
        Accept: "text/html, application/xhtml+xml"
      };
    }
    get isSafe() {
      return this.method === FetchMethod.get;
    }
    get abortSignal() {
      return this.abortController.signal;
    }
    acceptResponseType(mimeType) {
      this.headers["Accept"] = [mimeType, this.headers["Accept"]].join(", ");
    }
    async allowRequestToBeIntercepted(fetchOptions) {
      const requestInterception = new Promise((resolve) => this.resolveRequestPromise = resolve);
      const event = dispatch("turbo:before-fetch-request", {
        cancelable: true,
        detail: {
          fetchOptions,
          url: this.url,
          resume: this.resolveRequestPromise
        },
        target: this.target
      });
      if (event.defaultPrevented)
        await requestInterception;
    }
    willDelegateErrorHandling(error3) {
      const event = dispatch("turbo:fetch-request-error", {
        target: this.target,
        cancelable: true,
        detail: { request: this, error: error3 }
      });
      return !event.defaultPrevented;
    }
  };
  var AppearanceObserver = class {
    constructor(delegate, element) {
      this.started = false;
      this.intersect = (entries) => {
        const lastEntry = entries.slice(-1)[0];
        if (lastEntry === null || lastEntry === void 0 ? void 0 : lastEntry.isIntersecting) {
          this.delegate.elementAppearedInViewport(this.element);
        }
      };
      this.delegate = delegate;
      this.element = element;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
      }
    }
  };
  var StreamMessage = class {
    static wrap(message) {
      if (typeof message == "string") {
        return new this(createDocumentFragment(message));
      } else {
        return message;
      }
    }
    constructor(fragment) {
      this.fragment = importStreamElements(fragment);
    }
  };
  StreamMessage.contentType = "text/vnd.turbo-stream.html";
  function importStreamElements(fragment) {
    for (const element of fragment.querySelectorAll("turbo-stream")) {
      const streamElement = document.importNode(element, true);
      for (const inertScriptElement of streamElement.templateElement.content.querySelectorAll("script")) {
        inertScriptElement.replaceWith(activateScriptElement(inertScriptElement));
      }
      element.replaceWith(streamElement);
    }
    return fragment;
  }
  var FormSubmissionState;
  (function(FormSubmissionState2) {
    FormSubmissionState2[FormSubmissionState2["initialized"] = 0] = "initialized";
    FormSubmissionState2[FormSubmissionState2["requesting"] = 1] = "requesting";
    FormSubmissionState2[FormSubmissionState2["waiting"] = 2] = "waiting";
    FormSubmissionState2[FormSubmissionState2["receiving"] = 3] = "receiving";
    FormSubmissionState2[FormSubmissionState2["stopping"] = 4] = "stopping";
    FormSubmissionState2[FormSubmissionState2["stopped"] = 5] = "stopped";
  })(FormSubmissionState || (FormSubmissionState = {}));
  var FormEnctype;
  (function(FormEnctype2) {
    FormEnctype2["urlEncoded"] = "application/x-www-form-urlencoded";
    FormEnctype2["multipart"] = "multipart/form-data";
    FormEnctype2["plain"] = "text/plain";
  })(FormEnctype || (FormEnctype = {}));
  function formEnctypeFromString(encoding) {
    switch (encoding.toLowerCase()) {
      case FormEnctype.multipart:
        return FormEnctype.multipart;
      case FormEnctype.plain:
        return FormEnctype.plain;
      default:
        return FormEnctype.urlEncoded;
    }
  }
  var FormSubmission = class _FormSubmission {
    static confirmMethod(message, _element, _submitter) {
      return Promise.resolve(confirm(message));
    }
    constructor(delegate, formElement, submitter, mustRedirect = false) {
      this.state = FormSubmissionState.initialized;
      this.delegate = delegate;
      this.formElement = formElement;
      this.submitter = submitter;
      this.formData = buildFormData(formElement, submitter);
      this.location = expandURL(this.action);
      if (this.method == FetchMethod.get) {
        mergeFormDataEntries(this.location, [...this.body.entries()]);
      }
      this.fetchRequest = new FetchRequest(this, this.method, this.location, this.body, this.formElement);
      this.mustRedirect = mustRedirect;
    }
    get method() {
      var _a;
      const method = ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formmethod")) || this.formElement.getAttribute("method") || "";
      return fetchMethodFromString(method.toLowerCase()) || FetchMethod.get;
    }
    get action() {
      var _a;
      const formElementAction = typeof this.formElement.action === "string" ? this.formElement.action : null;
      if ((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.hasAttribute("formaction")) {
        return this.submitter.getAttribute("formaction") || "";
      } else {
        return this.formElement.getAttribute("action") || formElementAction || "";
      }
    }
    get body() {
      if (this.enctype == FormEnctype.urlEncoded || this.method == FetchMethod.get) {
        return new URLSearchParams(this.stringFormData);
      } else {
        return this.formData;
      }
    }
    get enctype() {
      var _a;
      return formEnctypeFromString(((_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("formenctype")) || this.formElement.enctype);
    }
    get isSafe() {
      return this.fetchRequest.isSafe;
    }
    get stringFormData() {
      return [...this.formData].reduce((entries, [name4, value]) => {
        return entries.concat(typeof value == "string" ? [[name4, value]] : []);
      }, []);
    }
    async start() {
      const { initialized, requesting } = FormSubmissionState;
      const confirmationMessage = getAttribute("data-turbo-confirm", this.submitter, this.formElement);
      if (typeof confirmationMessage === "string") {
        const answer = await _FormSubmission.confirmMethod(confirmationMessage, this.formElement, this.submitter);
        if (!answer) {
          return;
        }
      }
      if (this.state == initialized) {
        this.state = requesting;
        return this.fetchRequest.perform();
      }
    }
    stop() {
      const { stopping, stopped } = FormSubmissionState;
      if (this.state != stopping && this.state != stopped) {
        this.state = stopping;
        this.fetchRequest.cancel();
        return true;
      }
    }
    prepareRequest(request4) {
      if (!request4.isSafe) {
        const token = getCookieValue(getMetaContent("csrf-param")) || getMetaContent("csrf-token");
        if (token) {
          request4.headers["X-CSRF-Token"] = token;
        }
      }
      if (this.requestAcceptsTurboStreamResponse(request4)) {
        request4.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      var _a;
      this.state = FormSubmissionState.waiting;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "");
      this.setSubmitsWith();
      dispatch("turbo:submit-start", {
        target: this.formElement,
        detail: { formSubmission: this }
      });
      this.delegate.formSubmissionStarted(this);
    }
    requestPreventedHandlingResponse(request4, response3) {
      this.result = { success: response3.succeeded, fetchResponse: response3 };
    }
    requestSucceededWithResponse(request4, response3) {
      if (response3.clientError || response3.serverError) {
        this.delegate.formSubmissionFailedWithResponse(this, response3);
      } else if (this.requestMustRedirect(request4) && responseSucceededWithoutRedirect(response3)) {
        const error3 = new Error("Form responses must redirect to another location");
        this.delegate.formSubmissionErrored(this, error3);
      } else {
        this.state = FormSubmissionState.receiving;
        this.result = { success: true, fetchResponse: response3 };
        this.delegate.formSubmissionSucceededWithResponse(this, response3);
      }
    }
    requestFailedWithResponse(request4, response3) {
      this.result = { success: false, fetchResponse: response3 };
      this.delegate.formSubmissionFailedWithResponse(this, response3);
    }
    requestErrored(request4, error3) {
      this.result = { success: false, error: error3 };
      this.delegate.formSubmissionErrored(this, error3);
    }
    requestFinished(_request) {
      var _a;
      this.state = FormSubmissionState.stopped;
      (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.removeAttribute("disabled");
      this.resetSubmitterText();
      dispatch("turbo:submit-end", {
        target: this.formElement,
        detail: Object.assign({ formSubmission: this }, this.result)
      });
      this.delegate.formSubmissionFinished(this);
    }
    setSubmitsWith() {
      if (!this.submitter || !this.submitsWith)
        return;
      if (this.submitter.matches("button")) {
        this.originalSubmitText = this.submitter.innerHTML;
        this.submitter.innerHTML = this.submitsWith;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        this.originalSubmitText = input.value;
        input.value = this.submitsWith;
      }
    }
    resetSubmitterText() {
      if (!this.submitter || !this.originalSubmitText)
        return;
      if (this.submitter.matches("button")) {
        this.submitter.innerHTML = this.originalSubmitText;
      } else if (this.submitter.matches("input")) {
        const input = this.submitter;
        input.value = this.originalSubmitText;
      }
    }
    requestMustRedirect(request4) {
      return !request4.isSafe && this.mustRedirect;
    }
    requestAcceptsTurboStreamResponse(request4) {
      return !request4.isSafe || hasAttribute("data-turbo-stream", this.submitter, this.formElement);
    }
    get submitsWith() {
      var _a;
      return (_a = this.submitter) === null || _a === void 0 ? void 0 : _a.getAttribute("data-turbo-submits-with");
    }
  };
  function buildFormData(formElement, submitter) {
    const formData = new FormData(formElement);
    const name4 = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("name");
    const value = submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("value");
    if (name4) {
      formData.append(name4, value || "");
    }
    return formData;
  }
  function getCookieValue(cookieName) {
    if (cookieName != null) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      const cookie = cookies.find((cookie2) => cookie2.startsWith(cookieName));
      if (cookie) {
        const value = cookie.split("=").slice(1).join("=");
        return value ? decodeURIComponent(value) : void 0;
      }
    }
  }
  function responseSucceededWithoutRedirect(response3) {
    return response3.statusCode == 200 && !response3.redirected;
  }
  function mergeFormDataEntries(url, entries) {
    const searchParams = new URLSearchParams();
    for (const [name4, value] of entries) {
      if (value instanceof File)
        continue;
      searchParams.append(name4, value);
    }
    url.search = searchParams.toString();
    return url;
  }
  var Snapshot = class {
    constructor(element) {
      this.element = element;
    }
    get activeElement() {
      return this.element.ownerDocument.activeElement;
    }
    get children() {
      return [...this.element.children];
    }
    hasAnchor(anchor) {
      return this.getElementForAnchor(anchor) != null;
    }
    getElementForAnchor(anchor) {
      return anchor ? this.element.querySelector(`[id='${anchor}'], a[name='${anchor}']`) : null;
    }
    get isConnected() {
      return this.element.isConnected;
    }
    get firstAutofocusableElement() {
      const inertDisabledOrHidden = "[inert], :disabled, [hidden], details:not([open]), dialog:not([open])";
      for (const element of this.element.querySelectorAll("[autofocus]")) {
        if (element.closest(inertDisabledOrHidden) == null)
          return element;
        else
          continue;
      }
      return null;
    }
    get permanentElements() {
      return queryPermanentElementsAll(this.element);
    }
    getPermanentElementById(id2) {
      return getPermanentElementById(this.element, id2);
    }
    getPermanentElementMapForSnapshot(snapshot) {
      const permanentElementMap = {};
      for (const currentPermanentElement of this.permanentElements) {
        const { id: id2 } = currentPermanentElement;
        const newPermanentElement = snapshot.getPermanentElementById(id2);
        if (newPermanentElement) {
          permanentElementMap[id2] = [currentPermanentElement, newPermanentElement];
        }
      }
      return permanentElementMap;
    }
  };
  function getPermanentElementById(node, id2) {
    return node.querySelector(`#${id2}[data-turbo-permanent]`);
  }
  function queryPermanentElementsAll(node) {
    return node.querySelectorAll("[id][data-turbo-permanent]");
  }
  var FormSubmitObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.submitCaptured = () => {
        this.eventTarget.removeEventListener("submit", this.submitBubbled, false);
        this.eventTarget.addEventListener("submit", this.submitBubbled, false);
      };
      this.submitBubbled = (event) => {
        if (!event.defaultPrevented) {
          const form = event.target instanceof HTMLFormElement ? event.target : void 0;
          const submitter = event.submitter || void 0;
          if (form && submissionDoesNotDismissDialog(form, submitter) && submissionDoesNotTargetIFrame(form, submitter) && this.delegate.willSubmitForm(form, submitter)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.delegate.formSubmitted(form, submitter);
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("submit", this.submitCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("submit", this.submitCaptured, true);
        this.started = false;
      }
    }
  };
  function submissionDoesNotDismissDialog(form, submitter) {
    const method = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formmethod")) || form.getAttribute("method");
    return method != "dialog";
  }
  function submissionDoesNotTargetIFrame(form, submitter) {
    if ((submitter === null || submitter === void 0 ? void 0 : submitter.hasAttribute("formtarget")) || form.hasAttribute("target")) {
      const target = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("formtarget")) || form.target;
      for (const element of document.getElementsByName(target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var View = class {
    constructor(delegate, element) {
      this.resolveRenderPromise = (_value) => {
      };
      this.resolveInterceptionPromise = (_value) => {
      };
      this.delegate = delegate;
      this.element = element;
    }
    scrollToAnchor(anchor) {
      const element = this.snapshot.getElementForAnchor(anchor);
      if (element) {
        this.scrollToElement(element);
        this.focusElement(element);
      } else {
        this.scrollToPosition({ x: 0, y: 0 });
      }
    }
    scrollToAnchorFromLocation(location2) {
      this.scrollToAnchor(getAnchor(location2));
    }
    scrollToElement(element) {
      element.scrollIntoView();
    }
    focusElement(element) {
      if (element instanceof HTMLElement) {
        if (element.hasAttribute("tabindex")) {
          element.focus();
        } else {
          element.setAttribute("tabindex", "-1");
          element.focus();
          element.removeAttribute("tabindex");
        }
      }
    }
    scrollToPosition({ x, y }) {
      this.scrollRoot.scrollTo(x, y);
    }
    scrollToTop() {
      this.scrollToPosition({ x: 0, y: 0 });
    }
    get scrollRoot() {
      return window;
    }
    async render(renderer) {
      const { isPreview, shouldRender, newSnapshot: snapshot } = renderer;
      if (shouldRender) {
        try {
          this.renderPromise = new Promise((resolve) => this.resolveRenderPromise = resolve);
          this.renderer = renderer;
          await this.prepareToRenderSnapshot(renderer);
          const renderInterception = new Promise((resolve) => this.resolveInterceptionPromise = resolve);
          const options = { resume: this.resolveInterceptionPromise, render: this.renderer.renderElement };
          const immediateRender = this.delegate.allowsImmediateRender(snapshot, options);
          if (!immediateRender)
            await renderInterception;
          await this.renderSnapshot(renderer);
          this.delegate.viewRenderedSnapshot(snapshot, isPreview);
          this.delegate.preloadOnLoadLinksForView(this.element);
          this.finishRenderingSnapshot(renderer);
        } finally {
          delete this.renderer;
          this.resolveRenderPromise(void 0);
          delete this.renderPromise;
        }
      } else {
        this.invalidate(renderer.reloadReason);
      }
    }
    invalidate(reason) {
      this.delegate.viewInvalidated(reason);
    }
    async prepareToRenderSnapshot(renderer) {
      this.markAsPreview(renderer.isPreview);
      await renderer.prepareToRender();
    }
    markAsPreview(isPreview) {
      if (isPreview) {
        this.element.setAttribute("data-turbo-preview", "");
      } else {
        this.element.removeAttribute("data-turbo-preview");
      }
    }
    async renderSnapshot(renderer) {
      await renderer.render();
    }
    finishRenderingSnapshot(renderer) {
      renderer.finishRendering();
    }
  };
  var FrameView = class extends View {
    missing() {
      this.element.innerHTML = `<strong class="turbo-frame-error">Content missing</strong>`;
    }
    get snapshot() {
      return new Snapshot(this.element);
    }
  };
  var LinkInterceptor = class {
    constructor(delegate, element) {
      this.clickBubbled = (event) => {
        if (this.respondsToEventTarget(event.target)) {
          this.clickEvent = event;
        } else {
          delete this.clickEvent;
        }
      };
      this.linkClicked = (event) => {
        if (this.clickEvent && this.respondsToEventTarget(event.target) && event.target instanceof Element) {
          if (this.delegate.shouldInterceptLinkClick(event.target, event.detail.url, event.detail.originalEvent)) {
            this.clickEvent.preventDefault();
            event.preventDefault();
            this.delegate.linkClickIntercepted(event.target, event.detail.url, event.detail.originalEvent);
          }
        }
        delete this.clickEvent;
      };
      this.willVisit = (_event) => {
        delete this.clickEvent;
      };
      this.delegate = delegate;
      this.element = element;
    }
    start() {
      this.element.addEventListener("click", this.clickBubbled);
      document.addEventListener("turbo:click", this.linkClicked);
      document.addEventListener("turbo:before-visit", this.willVisit);
    }
    stop() {
      this.element.removeEventListener("click", this.clickBubbled);
      document.removeEventListener("turbo:click", this.linkClicked);
      document.removeEventListener("turbo:before-visit", this.willVisit);
    }
    respondsToEventTarget(target) {
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
      return element && element.closest("turbo-frame, html") == this.element;
    }
  };
  var LinkClickObserver = class {
    constructor(delegate, eventTarget) {
      this.started = false;
      this.clickCaptured = () => {
        this.eventTarget.removeEventListener("click", this.clickBubbled, false);
        this.eventTarget.addEventListener("click", this.clickBubbled, false);
      };
      this.clickBubbled = (event) => {
        if (event instanceof MouseEvent && this.clickEventIsSignificant(event)) {
          const target = event.composedPath && event.composedPath()[0] || event.target;
          const link = this.findLinkFromClickTarget(target);
          if (link && doesNotTargetIFrame(link)) {
            const location2 = this.getLocationForLink(link);
            if (this.delegate.willFollowLinkToLocation(link, location2, event)) {
              event.preventDefault();
              this.delegate.followedLinkToLocation(link, location2);
            }
          }
        }
      };
      this.delegate = delegate;
      this.eventTarget = eventTarget;
    }
    start() {
      if (!this.started) {
        this.eventTarget.addEventListener("click", this.clickCaptured, true);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.eventTarget.removeEventListener("click", this.clickCaptured, true);
        this.started = false;
      }
    }
    clickEventIsSignificant(event) {
      return !(event.target && event.target.isContentEditable || event.defaultPrevented || event.which > 1 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
    }
    findLinkFromClickTarget(target) {
      return findClosestRecursively(target, "a[href]:not([target^=_]):not([download])");
    }
    getLocationForLink(link) {
      return expandURL(link.getAttribute("href") || "");
    }
  };
  function doesNotTargetIFrame(anchor) {
    if (anchor.hasAttribute("target")) {
      for (const element of document.getElementsByName(anchor.target)) {
        if (element instanceof HTMLIFrameElement)
          return false;
      }
      return true;
    } else {
      return true;
    }
  }
  var FormLinkClickObserver = class {
    constructor(delegate, element) {
      this.delegate = delegate;
      this.linkInterceptor = new LinkClickObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
    }
    stop() {
      this.linkInterceptor.stop();
    }
    willFollowLinkToLocation(link, location2, originalEvent) {
      return this.delegate.willSubmitFormLinkToLocation(link, location2, originalEvent) && link.hasAttribute("data-turbo-method");
    }
    followedLinkToLocation(link, location2) {
      const form = document.createElement("form");
      const type = "hidden";
      for (const [name4, value] of location2.searchParams) {
        form.append(Object.assign(document.createElement("input"), { type, name: name4, value }));
      }
      const action = Object.assign(location2, { search: "" });
      form.setAttribute("data-turbo", "true");
      form.setAttribute("action", action.href);
      form.setAttribute("hidden", "");
      const method = link.getAttribute("data-turbo-method");
      if (method)
        form.setAttribute("method", method);
      const turboFrame = link.getAttribute("data-turbo-frame");
      if (turboFrame)
        form.setAttribute("data-turbo-frame", turboFrame);
      const turboAction = getVisitAction(link);
      if (turboAction)
        form.setAttribute("data-turbo-action", turboAction);
      const turboConfirm = link.getAttribute("data-turbo-confirm");
      if (turboConfirm)
        form.setAttribute("data-turbo-confirm", turboConfirm);
      const turboStream = link.hasAttribute("data-turbo-stream");
      if (turboStream)
        form.setAttribute("data-turbo-stream", "");
      this.delegate.submittedFormLinkToLocation(link, location2, form);
      document.body.appendChild(form);
      form.addEventListener("turbo:submit-end", () => form.remove(), { once: true });
      requestAnimationFrame(() => form.requestSubmit());
    }
  };
  var Bardo = class {
    static async preservingPermanentElements(delegate, permanentElementMap, callback) {
      const bardo = new this(delegate, permanentElementMap);
      bardo.enter();
      await callback();
      bardo.leave();
    }
    constructor(delegate, permanentElementMap) {
      this.delegate = delegate;
      this.permanentElementMap = permanentElementMap;
    }
    enter() {
      for (const id2 in this.permanentElementMap) {
        const [currentPermanentElement, newPermanentElement] = this.permanentElementMap[id2];
        this.delegate.enteringBardo(currentPermanentElement, newPermanentElement);
        this.replaceNewPermanentElementWithPlaceholder(newPermanentElement);
      }
    }
    leave() {
      for (const id2 in this.permanentElementMap) {
        const [currentPermanentElement] = this.permanentElementMap[id2];
        this.replaceCurrentPermanentElementWithClone(currentPermanentElement);
        this.replacePlaceholderWithPermanentElement(currentPermanentElement);
        this.delegate.leavingBardo(currentPermanentElement);
      }
    }
    replaceNewPermanentElementWithPlaceholder(permanentElement) {
      const placeholder = createPlaceholderForPermanentElement(permanentElement);
      permanentElement.replaceWith(placeholder);
    }
    replaceCurrentPermanentElementWithClone(permanentElement) {
      const clone = permanentElement.cloneNode(true);
      permanentElement.replaceWith(clone);
    }
    replacePlaceholderWithPermanentElement(permanentElement) {
      const placeholder = this.getPlaceholderById(permanentElement.id);
      placeholder === null || placeholder === void 0 ? void 0 : placeholder.replaceWith(permanentElement);
    }
    getPlaceholderById(id2) {
      return this.placeholders.find((element) => element.content == id2);
    }
    get placeholders() {
      return [...document.querySelectorAll("meta[name=turbo-permanent-placeholder][content]")];
    }
  };
  function createPlaceholderForPermanentElement(permanentElement) {
    const element = document.createElement("meta");
    element.setAttribute("name", "turbo-permanent-placeholder");
    element.setAttribute("content", permanentElement.id);
    return element;
  }
  var Renderer = class {
    constructor(currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      this.activeElement = null;
      this.currentSnapshot = currentSnapshot;
      this.newSnapshot = newSnapshot;
      this.isPreview = isPreview;
      this.willRender = willRender;
      this.renderElement = renderElement;
      this.promise = new Promise((resolve, reject) => this.resolvingFunctions = { resolve, reject });
    }
    get shouldRender() {
      return true;
    }
    get reloadReason() {
      return;
    }
    prepareToRender() {
      return;
    }
    finishRendering() {
      if (this.resolvingFunctions) {
        this.resolvingFunctions.resolve();
        delete this.resolvingFunctions;
      }
    }
    async preservingPermanentElements(callback) {
      await Bardo.preservingPermanentElements(this, this.permanentElementMap, callback);
    }
    focusFirstAutofocusableElement() {
      const element = this.connectedSnapshot.firstAutofocusableElement;
      if (elementIsFocusable(element)) {
        element.focus();
      }
    }
    enteringBardo(currentPermanentElement) {
      if (this.activeElement)
        return;
      if (currentPermanentElement.contains(this.currentSnapshot.activeElement)) {
        this.activeElement = this.currentSnapshot.activeElement;
      }
    }
    leavingBardo(currentPermanentElement) {
      if (currentPermanentElement.contains(this.activeElement) && this.activeElement instanceof HTMLElement) {
        this.activeElement.focus();
        this.activeElement = null;
      }
    }
    get connectedSnapshot() {
      return this.newSnapshot.isConnected ? this.newSnapshot : this.currentSnapshot;
    }
    get currentElement() {
      return this.currentSnapshot.element;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    get permanentElementMap() {
      return this.currentSnapshot.getPermanentElementMapForSnapshot(this.newSnapshot);
    }
  };
  function elementIsFocusable(element) {
    return element && typeof element.focus == "function";
  }
  var FrameRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      var _a;
      const destinationRange = document.createRange();
      destinationRange.selectNodeContents(currentElement);
      destinationRange.deleteContents();
      const frameElement = newElement;
      const sourceRange = (_a = frameElement.ownerDocument) === null || _a === void 0 ? void 0 : _a.createRange();
      if (sourceRange) {
        sourceRange.selectNodeContents(frameElement);
        currentElement.appendChild(sourceRange.extractContents());
      }
    }
    constructor(delegate, currentSnapshot, newSnapshot, renderElement, isPreview, willRender = true) {
      super(currentSnapshot, newSnapshot, renderElement, isPreview, willRender);
      this.delegate = delegate;
    }
    get shouldRender() {
      return true;
    }
    async render() {
      await nextAnimationFrame();
      this.preservingPermanentElements(() => {
        this.loadFrameElement();
      });
      this.scrollFrameIntoView();
      await nextAnimationFrame();
      this.focusFirstAutofocusableElement();
      await nextAnimationFrame();
      this.activateScriptElements();
    }
    loadFrameElement() {
      this.delegate.willRenderFrame(this.currentElement, this.newElement);
      this.renderElement(this.currentElement, this.newElement);
    }
    scrollFrameIntoView() {
      if (this.currentElement.autoscroll || this.newElement.autoscroll) {
        const element = this.currentElement.firstElementChild;
        const block = readScrollLogicalPosition(this.currentElement.getAttribute("data-autoscroll-block"), "end");
        const behavior = readScrollBehavior(this.currentElement.getAttribute("data-autoscroll-behavior"), "auto");
        if (element) {
          element.scrollIntoView({ block, behavior });
          return true;
        }
      }
      return false;
    }
    activateScriptElements() {
      for (const inertScriptElement of this.newScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    get newScriptElements() {
      return this.currentElement.querySelectorAll("script");
    }
  };
  function readScrollLogicalPosition(value, defaultValue) {
    if (value == "end" || value == "start" || value == "center" || value == "nearest") {
      return value;
    } else {
      return defaultValue;
    }
  }
  function readScrollBehavior(value, defaultValue) {
    if (value == "auto" || value == "smooth") {
      return value;
    } else {
      return defaultValue;
    }
  }
  var ProgressBar = class _ProgressBar {
    static get defaultCSS() {
      return unindent`
      .turbo-progress-bar {
        position: fixed;
        display: block;
        top: 0;
        left: 0;
        height: 3px;
        background: #0076ff;
        z-index: 2147483647;
        transition:
          width ${_ProgressBar.animationDuration}ms ease-out,
          opacity ${_ProgressBar.animationDuration / 2}ms ${_ProgressBar.animationDuration / 2}ms ease-in;
        transform: translate3d(0, 0, 0);
      }
    `;
    }
    constructor() {
      this.hiding = false;
      this.value = 0;
      this.visible = false;
      this.trickle = () => {
        this.setValue(this.value + Math.random() / 100);
      };
      this.stylesheetElement = this.createStylesheetElement();
      this.progressElement = this.createProgressElement();
      this.installStylesheetElement();
      this.setValue(0);
    }
    show() {
      if (!this.visible) {
        this.visible = true;
        this.installProgressElement();
        this.startTrickling();
      }
    }
    hide() {
      if (this.visible && !this.hiding) {
        this.hiding = true;
        this.fadeProgressElement(() => {
          this.uninstallProgressElement();
          this.stopTrickling();
          this.visible = false;
          this.hiding = false;
        });
      }
    }
    setValue(value) {
      this.value = value;
      this.refresh();
    }
    installStylesheetElement() {
      document.head.insertBefore(this.stylesheetElement, document.head.firstChild);
    }
    installProgressElement() {
      this.progressElement.style.width = "0";
      this.progressElement.style.opacity = "1";
      document.documentElement.insertBefore(this.progressElement, document.body);
      this.refresh();
    }
    fadeProgressElement(callback) {
      this.progressElement.style.opacity = "0";
      setTimeout(callback, _ProgressBar.animationDuration * 1.5);
    }
    uninstallProgressElement() {
      if (this.progressElement.parentNode) {
        document.documentElement.removeChild(this.progressElement);
      }
    }
    startTrickling() {
      if (!this.trickleInterval) {
        this.trickleInterval = window.setInterval(this.trickle, _ProgressBar.animationDuration);
      }
    }
    stopTrickling() {
      window.clearInterval(this.trickleInterval);
      delete this.trickleInterval;
    }
    refresh() {
      requestAnimationFrame(() => {
        this.progressElement.style.width = `${10 + this.value * 90}%`;
      });
    }
    createStylesheetElement() {
      const element = document.createElement("style");
      element.type = "text/css";
      element.textContent = _ProgressBar.defaultCSS;
      if (this.cspNonce) {
        element.nonce = this.cspNonce;
      }
      return element;
    }
    createProgressElement() {
      const element = document.createElement("div");
      element.className = "turbo-progress-bar";
      return element;
    }
    get cspNonce() {
      return getMetaContent("csp-nonce");
    }
  };
  ProgressBar.animationDuration = 300;
  var HeadSnapshot = class extends Snapshot {
    constructor() {
      super(...arguments);
      this.detailsByOuterHTML = this.children.filter((element) => !elementIsNoscript(element)).map((element) => elementWithoutNonce(element)).reduce((result, element) => {
        const { outerHTML } = element;
        const details = outerHTML in result ? result[outerHTML] : {
          type: elementType(element),
          tracked: elementIsTracked(element),
          elements: []
        };
        return Object.assign(Object.assign({}, result), { [outerHTML]: Object.assign(Object.assign({}, details), { elements: [...details.elements, element] }) });
      }, {});
    }
    get trackedElementSignature() {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => this.detailsByOuterHTML[outerHTML].tracked).join("");
    }
    getScriptElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("script", snapshot);
    }
    getStylesheetElementsNotInSnapshot(snapshot) {
      return this.getElementsMatchingTypeNotInSnapshot("stylesheet", snapshot);
    }
    getElementsMatchingTypeNotInSnapshot(matchedType, snapshot) {
      return Object.keys(this.detailsByOuterHTML).filter((outerHTML) => !(outerHTML in snapshot.detailsByOuterHTML)).map((outerHTML) => this.detailsByOuterHTML[outerHTML]).filter(({ type }) => type == matchedType).map(({ elements: [element] }) => element);
    }
    get provisionalElements() {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { type, tracked, elements } = this.detailsByOuterHTML[outerHTML];
        if (type == null && !tracked) {
          return [...result, ...elements];
        } else if (elements.length > 1) {
          return [...result, ...elements.slice(1)];
        } else {
          return result;
        }
      }, []);
    }
    getMetaValue(name4) {
      const element = this.findMetaElementByName(name4);
      return element ? element.getAttribute("content") : null;
    }
    findMetaElementByName(name4) {
      return Object.keys(this.detailsByOuterHTML).reduce((result, outerHTML) => {
        const { elements: [element] } = this.detailsByOuterHTML[outerHTML];
        return elementIsMetaElementWithName(element, name4) ? element : result;
      }, void 0);
    }
  };
  function elementType(element) {
    if (elementIsScript(element)) {
      return "script";
    } else if (elementIsStylesheet(element)) {
      return "stylesheet";
    }
  }
  function elementIsTracked(element) {
    return element.getAttribute("data-turbo-track") == "reload";
  }
  function elementIsScript(element) {
    const tagName = element.localName;
    return tagName == "script";
  }
  function elementIsNoscript(element) {
    const tagName = element.localName;
    return tagName == "noscript";
  }
  function elementIsStylesheet(element) {
    const tagName = element.localName;
    return tagName == "style" || tagName == "link" && element.getAttribute("rel") == "stylesheet";
  }
  function elementIsMetaElementWithName(element, name4) {
    const tagName = element.localName;
    return tagName == "meta" && element.getAttribute("name") == name4;
  }
  function elementWithoutNonce(element) {
    if (element.hasAttribute("nonce")) {
      element.setAttribute("nonce", "");
    }
    return element;
  }
  var PageSnapshot = class _PageSnapshot extends Snapshot {
    static fromHTMLString(html = "") {
      return this.fromDocument(parseHTMLDocument(html));
    }
    static fromElement(element) {
      return this.fromDocument(element.ownerDocument);
    }
    static fromDocument({ head, body }) {
      return new this(body, new HeadSnapshot(head));
    }
    constructor(element, headSnapshot) {
      super(element);
      this.headSnapshot = headSnapshot;
    }
    clone() {
      const clonedElement = this.element.cloneNode(true);
      const selectElements = this.element.querySelectorAll("select");
      const clonedSelectElements = clonedElement.querySelectorAll("select");
      for (const [index, source] of selectElements.entries()) {
        const clone = clonedSelectElements[index];
        for (const option of clone.selectedOptions)
          option.selected = false;
        for (const option of source.selectedOptions)
          clone.options[option.index].selected = true;
      }
      for (const clonedPasswordInput of clonedElement.querySelectorAll('input[type="password"]')) {
        clonedPasswordInput.value = "";
      }
      return new _PageSnapshot(clonedElement, this.headSnapshot);
    }
    get headElement() {
      return this.headSnapshot.element;
    }
    get rootLocation() {
      var _a;
      const root = (_a = this.getSetting("root")) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    get cacheControlValue() {
      return this.getSetting("cache-control");
    }
    get isPreviewable() {
      return this.cacheControlValue != "no-preview";
    }
    get isCacheable() {
      return this.cacheControlValue != "no-cache";
    }
    get isVisitable() {
      return this.getSetting("visit-control") != "reload";
    }
    getSetting(name4) {
      return this.headSnapshot.getMetaValue(`turbo-${name4}`);
    }
  };
  var TimingMetric;
  (function(TimingMetric2) {
    TimingMetric2["visitStart"] = "visitStart";
    TimingMetric2["requestStart"] = "requestStart";
    TimingMetric2["requestEnd"] = "requestEnd";
    TimingMetric2["visitEnd"] = "visitEnd";
  })(TimingMetric || (TimingMetric = {}));
  var VisitState;
  (function(VisitState2) {
    VisitState2["initialized"] = "initialized";
    VisitState2["started"] = "started";
    VisitState2["canceled"] = "canceled";
    VisitState2["failed"] = "failed";
    VisitState2["completed"] = "completed";
  })(VisitState || (VisitState = {}));
  var defaultOptions = {
    action: "advance",
    historyChanged: false,
    visitCachedSnapshot: () => {
    },
    willRender: true,
    updateHistory: true,
    shouldCacheSnapshot: true,
    acceptsStreamResponse: false
  };
  var SystemStatusCode;
  (function(SystemStatusCode2) {
    SystemStatusCode2[SystemStatusCode2["networkFailure"] = 0] = "networkFailure";
    SystemStatusCode2[SystemStatusCode2["timeoutFailure"] = -1] = "timeoutFailure";
    SystemStatusCode2[SystemStatusCode2["contentTypeMismatch"] = -2] = "contentTypeMismatch";
  })(SystemStatusCode || (SystemStatusCode = {}));
  var Visit = class {
    constructor(delegate, location2, restorationIdentifier, options = {}) {
      this.identifier = uuid();
      this.timingMetrics = {};
      this.followedRedirect = false;
      this.historyChanged = false;
      this.scrolled = false;
      this.shouldCacheSnapshot = true;
      this.acceptsStreamResponse = false;
      this.snapshotCached = false;
      this.state = VisitState.initialized;
      this.delegate = delegate;
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier || uuid();
      const { action, historyChanged, referrer, snapshot, snapshotHTML, response: response3, visitCachedSnapshot, willRender, updateHistory, shouldCacheSnapshot, acceptsStreamResponse } = Object.assign(Object.assign({}, defaultOptions), options);
      this.action = action;
      this.historyChanged = historyChanged;
      this.referrer = referrer;
      this.snapshot = snapshot;
      this.snapshotHTML = snapshotHTML;
      this.response = response3;
      this.isSamePage = this.delegate.locationWithActionIsSamePage(this.location, this.action);
      this.visitCachedSnapshot = visitCachedSnapshot;
      this.willRender = willRender;
      this.updateHistory = updateHistory;
      this.scrolled = !willRender;
      this.shouldCacheSnapshot = shouldCacheSnapshot;
      this.acceptsStreamResponse = acceptsStreamResponse;
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    get restorationData() {
      return this.history.getRestorationDataForIdentifier(this.restorationIdentifier);
    }
    get silent() {
      return this.isSamePage;
    }
    start() {
      if (this.state == VisitState.initialized) {
        this.recordTimingMetric(TimingMetric.visitStart);
        this.state = VisitState.started;
        this.adapter.visitStarted(this);
        this.delegate.visitStarted(this);
      }
    }
    cancel() {
      if (this.state == VisitState.started) {
        if (this.request) {
          this.request.cancel();
        }
        this.cancelRender();
        this.state = VisitState.canceled;
      }
    }
    complete() {
      if (this.state == VisitState.started) {
        this.recordTimingMetric(TimingMetric.visitEnd);
        this.state = VisitState.completed;
        this.followRedirect();
        if (!this.followedRedirect) {
          this.adapter.visitCompleted(this);
          this.delegate.visitCompleted(this);
        }
      }
    }
    fail() {
      if (this.state == VisitState.started) {
        this.state = VisitState.failed;
        this.adapter.visitFailed(this);
      }
    }
    changeHistory() {
      var _a;
      if (!this.historyChanged && this.updateHistory) {
        const actionForHistory = this.location.href === ((_a = this.referrer) === null || _a === void 0 ? void 0 : _a.href) ? "replace" : this.action;
        const method = getHistoryMethodForAction(actionForHistory);
        this.history.update(method, this.location, this.restorationIdentifier);
        this.historyChanged = true;
      }
    }
    issueRequest() {
      if (this.hasPreloadedResponse()) {
        this.simulateRequest();
      } else if (this.shouldIssueRequest() && !this.request) {
        this.request = new FetchRequest(this, FetchMethod.get, this.location);
        this.request.perform();
      }
    }
    simulateRequest() {
      if (this.response) {
        this.startRequest();
        this.recordResponse();
        this.finishRequest();
      }
    }
    startRequest() {
      this.recordTimingMetric(TimingMetric.requestStart);
      this.adapter.visitRequestStarted(this);
    }
    recordResponse(response3 = this.response) {
      this.response = response3;
      if (response3) {
        const { statusCode } = response3;
        if (isSuccessful(statusCode)) {
          this.adapter.visitRequestCompleted(this);
        } else {
          this.adapter.visitRequestFailedWithStatusCode(this, statusCode);
        }
      }
    }
    finishRequest() {
      this.recordTimingMetric(TimingMetric.requestEnd);
      this.adapter.visitRequestFinished(this);
    }
    loadResponse() {
      if (this.response) {
        const { statusCode, responseHTML } = this.response;
        this.render(async () => {
          if (this.shouldCacheSnapshot)
            this.cacheSnapshot();
          if (this.view.renderPromise)
            await this.view.renderPromise;
          if (isSuccessful(statusCode) && responseHTML != null) {
            await this.view.renderPage(PageSnapshot.fromHTMLString(responseHTML), false, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            this.complete();
          } else {
            await this.view.renderError(PageSnapshot.fromHTMLString(responseHTML), this);
            this.adapter.visitRendered(this);
            this.fail();
          }
        });
      }
    }
    getCachedSnapshot() {
      const snapshot = this.view.getCachedSnapshotForLocation(this.location) || this.getPreloadedSnapshot();
      if (snapshot && (!getAnchor(this.location) || snapshot.hasAnchor(getAnchor(this.location)))) {
        if (this.action == "restore" || snapshot.isPreviewable) {
          return snapshot;
        }
      }
    }
    getPreloadedSnapshot() {
      if (this.snapshotHTML) {
        return PageSnapshot.fromHTMLString(this.snapshotHTML);
      }
    }
    hasCachedSnapshot() {
      return this.getCachedSnapshot() != null;
    }
    loadCachedSnapshot() {
      const snapshot = this.getCachedSnapshot();
      if (snapshot) {
        const isPreview = this.shouldIssueRequest();
        this.render(async () => {
          this.cacheSnapshot();
          if (this.isSamePage) {
            this.adapter.visitRendered(this);
          } else {
            if (this.view.renderPromise)
              await this.view.renderPromise;
            await this.view.renderPage(snapshot, isPreview, this.willRender, this);
            this.performScroll();
            this.adapter.visitRendered(this);
            if (!isPreview) {
              this.complete();
            }
          }
        });
      }
    }
    followRedirect() {
      var _a;
      if (this.redirectedToLocation && !this.followedRedirect && ((_a = this.response) === null || _a === void 0 ? void 0 : _a.redirected)) {
        this.adapter.visitProposedToLocation(this.redirectedToLocation, {
          action: "replace",
          response: this.response,
          shouldCacheSnapshot: false,
          willRender: false
        });
        this.followedRedirect = true;
      }
    }
    goToSamePageAnchor() {
      if (this.isSamePage) {
        this.render(async () => {
          this.cacheSnapshot();
          this.performScroll();
          this.changeHistory();
          this.adapter.visitRendered(this);
        });
      }
    }
    prepareRequest(request4) {
      if (this.acceptsStreamResponse) {
        request4.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted() {
      this.startRequest();
    }
    requestPreventedHandlingResponse(_request, _response) {
    }
    async requestSucceededWithResponse(request4, response3) {
      const responseHTML = await response3.responseHTML;
      const { redirected, statusCode } = response3;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.redirectedToLocation = response3.redirected ? response3.location : void 0;
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    async requestFailedWithResponse(request4, response3) {
      const responseHTML = await response3.responseHTML;
      const { redirected, statusCode } = response3;
      if (responseHTML == void 0) {
        this.recordResponse({
          statusCode: SystemStatusCode.contentTypeMismatch,
          redirected
        });
      } else {
        this.recordResponse({ statusCode, responseHTML, redirected });
      }
    }
    requestErrored(_request, _error) {
      this.recordResponse({
        statusCode: SystemStatusCode.networkFailure,
        redirected: false
      });
    }
    requestFinished() {
      this.finishRequest();
    }
    performScroll() {
      if (!this.scrolled && !this.view.forceReloaded) {
        if (this.action == "restore") {
          this.scrollToRestoredPosition() || this.scrollToAnchor() || this.view.scrollToTop();
        } else {
          this.scrollToAnchor() || this.view.scrollToTop();
        }
        if (this.isSamePage) {
          this.delegate.visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location);
        }
        this.scrolled = true;
      }
    }
    scrollToRestoredPosition() {
      const { scrollPosition } = this.restorationData;
      if (scrollPosition) {
        this.view.scrollToPosition(scrollPosition);
        return true;
      }
    }
    scrollToAnchor() {
      const anchor = getAnchor(this.location);
      if (anchor != null) {
        this.view.scrollToAnchor(anchor);
        return true;
      }
    }
    recordTimingMetric(metric) {
      this.timingMetrics[metric] = (/* @__PURE__ */ new Date()).getTime();
    }
    getTimingMetrics() {
      return Object.assign({}, this.timingMetrics);
    }
    getHistoryMethodForAction(action) {
      switch (action) {
        case "replace":
          return history.replaceState;
        case "advance":
        case "restore":
          return history.pushState;
      }
    }
    hasPreloadedResponse() {
      return typeof this.response == "object";
    }
    shouldIssueRequest() {
      if (this.isSamePage) {
        return false;
      } else if (this.action == "restore") {
        return !this.hasCachedSnapshot();
      } else {
        return this.willRender;
      }
    }
    cacheSnapshot() {
      if (!this.snapshotCached) {
        this.view.cacheSnapshot(this.snapshot).then((snapshot) => snapshot && this.visitCachedSnapshot(snapshot));
        this.snapshotCached = true;
      }
    }
    async render(callback) {
      this.cancelRender();
      await new Promise((resolve) => {
        this.frame = requestAnimationFrame(() => resolve());
      });
      await callback();
      delete this.frame;
    }
    cancelRender() {
      if (this.frame) {
        cancelAnimationFrame(this.frame);
        delete this.frame;
      }
    }
  };
  function isSuccessful(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }
  var BrowserAdapter = class {
    constructor(session2) {
      this.progressBar = new ProgressBar();
      this.showProgressBar = () => {
        this.progressBar.show();
      };
      this.session = session2;
    }
    visitProposedToLocation(location2, options) {
      this.navigator.startVisit(location2, (options === null || options === void 0 ? void 0 : options.restorationIdentifier) || uuid(), options);
    }
    visitStarted(visit2) {
      this.location = visit2.location;
      visit2.loadCachedSnapshot();
      visit2.issueRequest();
      visit2.goToSamePageAnchor();
    }
    visitRequestStarted(visit2) {
      this.progressBar.setValue(0);
      if (visit2.hasCachedSnapshot() || visit2.action != "restore") {
        this.showVisitProgressBarAfterDelay();
      } else {
        this.showProgressBar();
      }
    }
    visitRequestCompleted(visit2) {
      visit2.loadResponse();
    }
    visitRequestFailedWithStatusCode(visit2, statusCode) {
      switch (statusCode) {
        case SystemStatusCode.networkFailure:
        case SystemStatusCode.timeoutFailure:
        case SystemStatusCode.contentTypeMismatch:
          return this.reload({
            reason: "request_failed",
            context: {
              statusCode
            }
          });
        default:
          return visit2.loadResponse();
      }
    }
    visitRequestFinished(_visit) {
      this.progressBar.setValue(1);
      this.hideVisitProgressBar();
    }
    visitCompleted(_visit) {
    }
    pageInvalidated(reason) {
      this.reload(reason);
    }
    visitFailed(_visit) {
    }
    visitRendered(_visit) {
    }
    formSubmissionStarted(_formSubmission) {
      this.progressBar.setValue(0);
      this.showFormProgressBarAfterDelay();
    }
    formSubmissionFinished(_formSubmission) {
      this.progressBar.setValue(1);
      this.hideFormProgressBar();
    }
    showVisitProgressBarAfterDelay() {
      this.visitProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
    }
    hideVisitProgressBar() {
      this.progressBar.hide();
      if (this.visitProgressBarTimeout != null) {
        window.clearTimeout(this.visitProgressBarTimeout);
        delete this.visitProgressBarTimeout;
      }
    }
    showFormProgressBarAfterDelay() {
      if (this.formProgressBarTimeout == null) {
        this.formProgressBarTimeout = window.setTimeout(this.showProgressBar, this.session.progressBarDelay);
      }
    }
    hideFormProgressBar() {
      this.progressBar.hide();
      if (this.formProgressBarTimeout != null) {
        window.clearTimeout(this.formProgressBarTimeout);
        delete this.formProgressBarTimeout;
      }
    }
    reload(reason) {
      var _a;
      dispatch("turbo:reload", { detail: reason });
      window.location.href = ((_a = this.location) === null || _a === void 0 ? void 0 : _a.toString()) || window.location.href;
    }
    get navigator() {
      return this.session.navigator;
    }
  };
  var CacheObserver = class {
    constructor() {
      this.selector = "[data-turbo-temporary]";
      this.deprecatedSelector = "[data-turbo-cache=false]";
      this.started = false;
      this.removeTemporaryElements = (_event) => {
        for (const element of this.temporaryElements) {
          element.remove();
        }
      };
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-cache", this.removeTemporaryElements, false);
      }
    }
    get temporaryElements() {
      return [...document.querySelectorAll(this.selector), ...this.temporaryElementsWithDeprecation];
    }
    get temporaryElementsWithDeprecation() {
      const elements = document.querySelectorAll(this.deprecatedSelector);
      if (elements.length) {
        console.warn(`The ${this.deprecatedSelector} selector is deprecated and will be removed in a future version. Use ${this.selector} instead.`);
      }
      return [...elements];
    }
  };
  var FrameRedirector = class {
    constructor(session2, element) {
      this.session = session2;
      this.element = element;
      this.linkInterceptor = new LinkInterceptor(this, element);
      this.formSubmitObserver = new FormSubmitObserver(this, element);
    }
    start() {
      this.linkInterceptor.start();
      this.formSubmitObserver.start();
    }
    stop() {
      this.linkInterceptor.stop();
      this.formSubmitObserver.stop();
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldRedirect(element);
    }
    linkClickIntercepted(element, url, event) {
      const frame = this.findFrameElement(element);
      if (frame) {
        frame.delegate.linkClickIntercepted(element, url, event);
      }
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == null && this.shouldSubmit(element, submitter) && this.shouldRedirect(element, submitter);
    }
    formSubmitted(element, submitter) {
      const frame = this.findFrameElement(element, submitter);
      if (frame) {
        frame.delegate.formSubmitted(element, submitter);
      }
    }
    shouldSubmit(form, submitter) {
      var _a;
      const action = getAction(form, submitter);
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const rootLocation = expandURL((_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/");
      return this.shouldRedirect(form, submitter) && locationIsVisitable(action, rootLocation);
    }
    shouldRedirect(element, submitter) {
      const isNavigatable = element instanceof HTMLFormElement ? this.session.submissionIsNavigatable(element, submitter) : this.session.elementIsNavigatable(element);
      if (isNavigatable) {
        const frame = this.findFrameElement(element, submitter);
        return frame ? frame != element.closest("turbo-frame") : false;
      } else {
        return false;
      }
    }
    findFrameElement(element, submitter) {
      const id2 = (submitter === null || submitter === void 0 ? void 0 : submitter.getAttribute("data-turbo-frame")) || element.getAttribute("data-turbo-frame");
      if (id2 && id2 != "_top") {
        const frame = this.element.querySelector(`#${id2}:not([disabled])`);
        if (frame instanceof FrameElement) {
          return frame;
        }
      }
    }
  };
  var History = class {
    constructor(delegate) {
      this.restorationIdentifier = uuid();
      this.restorationData = {};
      this.started = false;
      this.pageLoaded = false;
      this.onPopState = (event) => {
        if (this.shouldHandlePopState()) {
          const { turbo } = event.state || {};
          if (turbo) {
            this.location = new URL(window.location.href);
            const { restorationIdentifier } = turbo;
            this.restorationIdentifier = restorationIdentifier;
            this.delegate.historyPoppedToLocationWithRestorationIdentifier(this.location, restorationIdentifier);
          }
        }
      };
      this.onPageLoad = async (_event) => {
        await nextMicrotask();
        this.pageLoaded = true;
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("popstate", this.onPopState, false);
        addEventListener("load", this.onPageLoad, false);
        this.started = true;
        this.replace(new URL(window.location.href));
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("popstate", this.onPopState, false);
        removeEventListener("load", this.onPageLoad, false);
        this.started = false;
      }
    }
    push(location2, restorationIdentifier) {
      this.update(history.pushState, location2, restorationIdentifier);
    }
    replace(location2, restorationIdentifier) {
      this.update(history.replaceState, location2, restorationIdentifier);
    }
    update(method, location2, restorationIdentifier = uuid()) {
      const state = { turbo: { restorationIdentifier } };
      method.call(history, state, "", location2.href);
      this.location = location2;
      this.restorationIdentifier = restorationIdentifier;
    }
    getRestorationDataForIdentifier(restorationIdentifier) {
      return this.restorationData[restorationIdentifier] || {};
    }
    updateRestorationData(additionalData) {
      const { restorationIdentifier } = this;
      const restorationData = this.restorationData[restorationIdentifier];
      this.restorationData[restorationIdentifier] = Object.assign(Object.assign({}, restorationData), additionalData);
    }
    assumeControlOfScrollRestoration() {
      var _a;
      if (!this.previousScrollRestoration) {
        this.previousScrollRestoration = (_a = history.scrollRestoration) !== null && _a !== void 0 ? _a : "auto";
        history.scrollRestoration = "manual";
      }
    }
    relinquishControlOfScrollRestoration() {
      if (this.previousScrollRestoration) {
        history.scrollRestoration = this.previousScrollRestoration;
        delete this.previousScrollRestoration;
      }
    }
    shouldHandlePopState() {
      return this.pageIsLoaded();
    }
    pageIsLoaded() {
      return this.pageLoaded || document.readyState == "complete";
    }
  };
  var Navigator = class {
    constructor(delegate) {
      this.delegate = delegate;
    }
    proposeVisit(location2, options = {}) {
      if (this.delegate.allowsVisitingLocationWithAction(location2, options.action)) {
        if (locationIsVisitable(location2, this.view.snapshot.rootLocation)) {
          this.delegate.visitProposedToLocation(location2, options);
        } else {
          window.location.href = location2.toString();
        }
      }
    }
    startVisit(locatable, restorationIdentifier, options = {}) {
      this.stop();
      this.currentVisit = new Visit(this, expandURL(locatable), restorationIdentifier, Object.assign({ referrer: this.location }, options));
      this.currentVisit.start();
    }
    submitForm(form, submitter) {
      this.stop();
      this.formSubmission = new FormSubmission(this, form, submitter, true);
      this.formSubmission.start();
    }
    stop() {
      if (this.formSubmission) {
        this.formSubmission.stop();
        delete this.formSubmission;
      }
      if (this.currentVisit) {
        this.currentVisit.cancel();
        delete this.currentVisit;
      }
    }
    get adapter() {
      return this.delegate.adapter;
    }
    get view() {
      return this.delegate.view;
    }
    get history() {
      return this.delegate.history;
    }
    formSubmissionStarted(formSubmission) {
      if (typeof this.adapter.formSubmissionStarted === "function") {
        this.adapter.formSubmissionStarted(formSubmission);
      }
    }
    async formSubmissionSucceededWithResponse(formSubmission, fetchResponse) {
      if (formSubmission == this.formSubmission) {
        const responseHTML = await fetchResponse.responseHTML;
        if (responseHTML) {
          const shouldCacheSnapshot = formSubmission.isSafe;
          if (!shouldCacheSnapshot) {
            this.view.clearSnapshotCache();
          }
          const { statusCode, redirected } = fetchResponse;
          const action = this.getActionForFormSubmission(formSubmission);
          const visitOptions = {
            action,
            shouldCacheSnapshot,
            response: { statusCode, responseHTML, redirected }
          };
          this.proposeVisit(fetchResponse.location, visitOptions);
        }
      }
    }
    async formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      const responseHTML = await fetchResponse.responseHTML;
      if (responseHTML) {
        const snapshot = PageSnapshot.fromHTMLString(responseHTML);
        if (fetchResponse.serverError) {
          await this.view.renderError(snapshot, this.currentVisit);
        } else {
          await this.view.renderPage(snapshot, false, true, this.currentVisit);
        }
        this.view.scrollToTop();
        this.view.clearSnapshotCache();
      }
    }
    formSubmissionErrored(formSubmission, error3) {
      console.error(error3);
    }
    formSubmissionFinished(formSubmission) {
      if (typeof this.adapter.formSubmissionFinished === "function") {
        this.adapter.formSubmissionFinished(formSubmission);
      }
    }
    visitStarted(visit2) {
      this.delegate.visitStarted(visit2);
    }
    visitCompleted(visit2) {
      this.delegate.visitCompleted(visit2);
    }
    locationWithActionIsSamePage(location2, action) {
      const anchor = getAnchor(location2);
      const currentAnchor = getAnchor(this.view.lastRenderedLocation);
      const isRestorationToTop = action === "restore" && typeof anchor === "undefined";
      return action !== "replace" && getRequestURL(location2) === getRequestURL(this.view.lastRenderedLocation) && (isRestorationToTop || anchor != null && anchor !== currentAnchor);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.delegate.visitScrolledToSamePageLocation(oldURL, newURL);
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    getActionForFormSubmission({ submitter, formElement }) {
      return getVisitAction(submitter, formElement) || "advance";
    }
  };
  var PageStage;
  (function(PageStage2) {
    PageStage2[PageStage2["initial"] = 0] = "initial";
    PageStage2[PageStage2["loading"] = 1] = "loading";
    PageStage2[PageStage2["interactive"] = 2] = "interactive";
    PageStage2[PageStage2["complete"] = 3] = "complete";
  })(PageStage || (PageStage = {}));
  var PageObserver = class {
    constructor(delegate) {
      this.stage = PageStage.initial;
      this.started = false;
      this.interpretReadyState = () => {
        const { readyState } = this;
        if (readyState == "interactive") {
          this.pageIsInteractive();
        } else if (readyState == "complete") {
          this.pageIsComplete();
        }
      };
      this.pageWillUnload = () => {
        this.delegate.pageWillUnload();
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        if (this.stage == PageStage.initial) {
          this.stage = PageStage.loading;
        }
        document.addEventListener("readystatechange", this.interpretReadyState, false);
        addEventListener("pagehide", this.pageWillUnload, false);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        document.removeEventListener("readystatechange", this.interpretReadyState, false);
        removeEventListener("pagehide", this.pageWillUnload, false);
        this.started = false;
      }
    }
    pageIsInteractive() {
      if (this.stage == PageStage.loading) {
        this.stage = PageStage.interactive;
        this.delegate.pageBecameInteractive();
      }
    }
    pageIsComplete() {
      this.pageIsInteractive();
      if (this.stage == PageStage.interactive) {
        this.stage = PageStage.complete;
        this.delegate.pageLoaded();
      }
    }
    get readyState() {
      return document.readyState;
    }
  };
  var ScrollObserver = class {
    constructor(delegate) {
      this.started = false;
      this.onScroll = () => {
        this.updatePosition({ x: window.pageXOffset, y: window.pageYOffset });
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        addEventListener("scroll", this.onScroll, false);
        this.onScroll();
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        removeEventListener("scroll", this.onScroll, false);
        this.started = false;
      }
    }
    updatePosition(position) {
      this.delegate.scrollPositionChanged(position);
    }
  };
  var StreamMessageRenderer = class {
    render({ fragment }) {
      Bardo.preservingPermanentElements(this, getPermanentElementMapForFragment(fragment), () => document.documentElement.appendChild(fragment));
    }
    enteringBardo(currentPermanentElement, newPermanentElement) {
      newPermanentElement.replaceWith(currentPermanentElement.cloneNode(true));
    }
    leavingBardo() {
    }
  };
  function getPermanentElementMapForFragment(fragment) {
    const permanentElementsInDocument = queryPermanentElementsAll(document.documentElement);
    const permanentElementMap = {};
    for (const permanentElementInDocument of permanentElementsInDocument) {
      const { id: id2 } = permanentElementInDocument;
      for (const streamElement of fragment.querySelectorAll("turbo-stream")) {
        const elementInStream = getPermanentElementById(streamElement.templateElement.content, id2);
        if (elementInStream) {
          permanentElementMap[id2] = [permanentElementInDocument, elementInStream];
        }
      }
    }
    return permanentElementMap;
  }
  var StreamObserver = class {
    constructor(delegate) {
      this.sources = /* @__PURE__ */ new Set();
      this.started = false;
      this.inspectFetchResponse = (event) => {
        const response3 = fetchResponseFromEvent(event);
        if (response3 && fetchResponseIsStream(response3)) {
          event.preventDefault();
          this.receiveMessageResponse(response3);
        }
      };
      this.receiveMessageEvent = (event) => {
        if (this.started && typeof event.data == "string") {
          this.receiveMessageHTML(event.data);
        }
      };
      this.delegate = delegate;
    }
    start() {
      if (!this.started) {
        this.started = true;
        addEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        removeEventListener("turbo:before-fetch-response", this.inspectFetchResponse, false);
      }
    }
    connectStreamSource(source) {
      if (!this.streamSourceIsConnected(source)) {
        this.sources.add(source);
        source.addEventListener("message", this.receiveMessageEvent, false);
      }
    }
    disconnectStreamSource(source) {
      if (this.streamSourceIsConnected(source)) {
        this.sources.delete(source);
        source.removeEventListener("message", this.receiveMessageEvent, false);
      }
    }
    streamSourceIsConnected(source) {
      return this.sources.has(source);
    }
    async receiveMessageResponse(response3) {
      const html = await response3.responseHTML;
      if (html) {
        this.receiveMessageHTML(html);
      }
    }
    receiveMessageHTML(html) {
      this.delegate.receivedMessageFromStream(StreamMessage.wrap(html));
    }
  };
  function fetchResponseFromEvent(event) {
    var _a;
    const fetchResponse = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.fetchResponse;
    if (fetchResponse instanceof FetchResponse) {
      return fetchResponse;
    }
  }
  function fetchResponseIsStream(response3) {
    var _a;
    const contentType = (_a = response3.contentType) !== null && _a !== void 0 ? _a : "";
    return contentType.startsWith(StreamMessage.contentType);
  }
  var ErrorRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      const { documentElement, body } = document;
      documentElement.replaceChild(newElement, body);
    }
    async render() {
      this.replaceHeadAndBody();
      this.activateScriptElements();
    }
    replaceHeadAndBody() {
      const { documentElement, head } = document;
      documentElement.replaceChild(this.newHead, head);
      this.renderElement(this.currentElement, this.newElement);
    }
    activateScriptElements() {
      for (const replaceableElement of this.scriptElements) {
        const parentNode = replaceableElement.parentNode;
        if (parentNode) {
          const element = activateScriptElement(replaceableElement);
          parentNode.replaceChild(element, replaceableElement);
        }
      }
    }
    get newHead() {
      return this.newSnapshot.headSnapshot.element;
    }
    get scriptElements() {
      return document.documentElement.querySelectorAll("script");
    }
  };
  var PageRenderer = class extends Renderer {
    static renderElement(currentElement, newElement) {
      if (document.body && newElement instanceof HTMLBodyElement) {
        document.body.replaceWith(newElement);
      } else {
        document.documentElement.appendChild(newElement);
      }
    }
    get shouldRender() {
      return this.newSnapshot.isVisitable && this.trackedElementsAreIdentical;
    }
    get reloadReason() {
      if (!this.newSnapshot.isVisitable) {
        return {
          reason: "turbo_visit_control_is_reload"
        };
      }
      if (!this.trackedElementsAreIdentical) {
        return {
          reason: "tracked_element_mismatch"
        };
      }
    }
    async prepareToRender() {
      await this.mergeHead();
    }
    async render() {
      if (this.willRender) {
        await this.replaceBody();
      }
    }
    finishRendering() {
      super.finishRendering();
      if (!this.isPreview) {
        this.focusFirstAutofocusableElement();
      }
    }
    get currentHeadSnapshot() {
      return this.currentSnapshot.headSnapshot;
    }
    get newHeadSnapshot() {
      return this.newSnapshot.headSnapshot;
    }
    get newElement() {
      return this.newSnapshot.element;
    }
    async mergeHead() {
      const mergedHeadElements = this.mergeProvisionalElements();
      const newStylesheetElements = this.copyNewHeadStylesheetElements();
      this.copyNewHeadScriptElements();
      await mergedHeadElements;
      await newStylesheetElements;
    }
    async replaceBody() {
      await this.preservingPermanentElements(async () => {
        this.activateNewBody();
        await this.assignNewBody();
      });
    }
    get trackedElementsAreIdentical() {
      return this.currentHeadSnapshot.trackedElementSignature == this.newHeadSnapshot.trackedElementSignature;
    }
    async copyNewHeadStylesheetElements() {
      const loadingElements = [];
      for (const element of this.newHeadStylesheetElements) {
        loadingElements.push(waitForLoad(element));
        document.head.appendChild(element);
      }
      await Promise.all(loadingElements);
    }
    copyNewHeadScriptElements() {
      for (const element of this.newHeadScriptElements) {
        document.head.appendChild(activateScriptElement(element));
      }
    }
    async mergeProvisionalElements() {
      const newHeadElements = [...this.newHeadProvisionalElements];
      for (const element of this.currentHeadProvisionalElements) {
        if (!this.isCurrentElementInElementList(element, newHeadElements)) {
          document.head.removeChild(element);
        }
      }
      for (const element of newHeadElements) {
        document.head.appendChild(element);
      }
    }
    isCurrentElementInElementList(element, elementList) {
      for (const [index, newElement] of elementList.entries()) {
        if (element.tagName == "TITLE") {
          if (newElement.tagName != "TITLE") {
            continue;
          }
          if (element.innerHTML == newElement.innerHTML) {
            elementList.splice(index, 1);
            return true;
          }
        }
        if (newElement.isEqualNode(element)) {
          elementList.splice(index, 1);
          return true;
        }
      }
      return false;
    }
    removeCurrentHeadProvisionalElements() {
      for (const element of this.currentHeadProvisionalElements) {
        document.head.removeChild(element);
      }
    }
    copyNewHeadProvisionalElements() {
      for (const element of this.newHeadProvisionalElements) {
        document.head.appendChild(element);
      }
    }
    activateNewBody() {
      document.adoptNode(this.newElement);
      this.activateNewBodyScriptElements();
    }
    activateNewBodyScriptElements() {
      for (const inertScriptElement of this.newBodyScriptElements) {
        const activatedScriptElement = activateScriptElement(inertScriptElement);
        inertScriptElement.replaceWith(activatedScriptElement);
      }
    }
    async assignNewBody() {
      await this.renderElement(this.currentElement, this.newElement);
    }
    get newHeadStylesheetElements() {
      return this.newHeadSnapshot.getStylesheetElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get newHeadScriptElements() {
      return this.newHeadSnapshot.getScriptElementsNotInSnapshot(this.currentHeadSnapshot);
    }
    get currentHeadProvisionalElements() {
      return this.currentHeadSnapshot.provisionalElements;
    }
    get newHeadProvisionalElements() {
      return this.newHeadSnapshot.provisionalElements;
    }
    get newBodyScriptElements() {
      return this.newElement.querySelectorAll("script");
    }
  };
  var SnapshotCache = class {
    constructor(size) {
      this.keys = [];
      this.snapshots = {};
      this.size = size;
    }
    has(location2) {
      return toCacheKey(location2) in this.snapshots;
    }
    get(location2) {
      if (this.has(location2)) {
        const snapshot = this.read(location2);
        this.touch(location2);
        return snapshot;
      }
    }
    put(location2, snapshot) {
      this.write(location2, snapshot);
      this.touch(location2);
      return snapshot;
    }
    clear() {
      this.snapshots = {};
    }
    read(location2) {
      return this.snapshots[toCacheKey(location2)];
    }
    write(location2, snapshot) {
      this.snapshots[toCacheKey(location2)] = snapshot;
    }
    touch(location2) {
      const key = toCacheKey(location2);
      const index = this.keys.indexOf(key);
      if (index > -1)
        this.keys.splice(index, 1);
      this.keys.unshift(key);
      this.trim();
    }
    trim() {
      for (const key of this.keys.splice(this.size)) {
        delete this.snapshots[key];
      }
    }
  };
  var PageView = class extends View {
    constructor() {
      super(...arguments);
      this.snapshotCache = new SnapshotCache(10);
      this.lastRenderedLocation = new URL(location.href);
      this.forceReloaded = false;
    }
    renderPage(snapshot, isPreview = false, willRender = true, visit2) {
      const renderer = new PageRenderer(this.snapshot, snapshot, PageRenderer.renderElement, isPreview, willRender);
      if (!renderer.shouldRender) {
        this.forceReloaded = true;
      } else {
        visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      }
      return this.render(renderer);
    }
    renderError(snapshot, visit2) {
      visit2 === null || visit2 === void 0 ? void 0 : visit2.changeHistory();
      const renderer = new ErrorRenderer(this.snapshot, snapshot, ErrorRenderer.renderElement, false);
      return this.render(renderer);
    }
    clearSnapshotCache() {
      this.snapshotCache.clear();
    }
    async cacheSnapshot(snapshot = this.snapshot) {
      if (snapshot.isCacheable) {
        this.delegate.viewWillCacheSnapshot();
        const { lastRenderedLocation: location2 } = this;
        await nextEventLoopTick();
        const cachedSnapshot = snapshot.clone();
        this.snapshotCache.put(location2, cachedSnapshot);
        return cachedSnapshot;
      }
    }
    getCachedSnapshotForLocation(location2) {
      return this.snapshotCache.get(location2);
    }
    get snapshot() {
      return PageSnapshot.fromElement(this.element);
    }
  };
  var Preloader = class {
    constructor(delegate) {
      this.selector = "a[data-turbo-preload]";
      this.delegate = delegate;
    }
    get snapshotCache() {
      return this.delegate.navigator.view.snapshotCache;
    }
    start() {
      if (document.readyState === "loading") {
        return document.addEventListener("DOMContentLoaded", () => {
          this.preloadOnLoadLinksForView(document.body);
        });
      } else {
        this.preloadOnLoadLinksForView(document.body);
      }
    }
    preloadOnLoadLinksForView(element) {
      for (const link of element.querySelectorAll(this.selector)) {
        this.preloadURL(link);
      }
    }
    async preloadURL(link) {
      const location2 = new URL(link.href);
      if (this.snapshotCache.has(location2)) {
        return;
      }
      try {
        const response3 = await fetch(location2.toString(), { headers: { "VND.PREFETCH": "true", Accept: "text/html" } });
        const responseText = await response3.text();
        const snapshot = PageSnapshot.fromHTMLString(responseText);
        this.snapshotCache.put(location2, snapshot);
      } catch (_) {
      }
    }
  };
  var Session = class {
    constructor() {
      this.navigator = new Navigator(this);
      this.history = new History(this);
      this.preloader = new Preloader(this);
      this.view = new PageView(this, document.documentElement);
      this.adapter = new BrowserAdapter(this);
      this.pageObserver = new PageObserver(this);
      this.cacheObserver = new CacheObserver();
      this.linkClickObserver = new LinkClickObserver(this, window);
      this.formSubmitObserver = new FormSubmitObserver(this, document);
      this.scrollObserver = new ScrollObserver(this);
      this.streamObserver = new StreamObserver(this);
      this.formLinkClickObserver = new FormLinkClickObserver(this, document.documentElement);
      this.frameRedirector = new FrameRedirector(this, document.documentElement);
      this.streamMessageRenderer = new StreamMessageRenderer();
      this.drive = true;
      this.enabled = true;
      this.progressBarDelay = 500;
      this.started = false;
      this.formMode = "on";
    }
    start() {
      if (!this.started) {
        this.pageObserver.start();
        this.cacheObserver.start();
        this.formLinkClickObserver.start();
        this.linkClickObserver.start();
        this.formSubmitObserver.start();
        this.scrollObserver.start();
        this.streamObserver.start();
        this.frameRedirector.start();
        this.history.start();
        this.preloader.start();
        this.started = true;
        this.enabled = true;
      }
    }
    disable() {
      this.enabled = false;
    }
    stop() {
      if (this.started) {
        this.pageObserver.stop();
        this.cacheObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkClickObserver.stop();
        this.formSubmitObserver.stop();
        this.scrollObserver.stop();
        this.streamObserver.stop();
        this.frameRedirector.stop();
        this.history.stop();
        this.started = false;
      }
    }
    registerAdapter(adapter) {
      this.adapter = adapter;
    }
    visit(location2, options = {}) {
      const frameElement = options.frame ? document.getElementById(options.frame) : null;
      if (frameElement instanceof FrameElement) {
        frameElement.src = location2.toString();
        frameElement.loaded;
      } else {
        this.navigator.proposeVisit(expandURL(location2), options);
      }
    }
    connectStreamSource(source) {
      this.streamObserver.connectStreamSource(source);
    }
    disconnectStreamSource(source) {
      this.streamObserver.disconnectStreamSource(source);
    }
    renderStreamMessage(message) {
      this.streamMessageRenderer.render(StreamMessage.wrap(message));
    }
    clearCache() {
      this.view.clearSnapshotCache();
    }
    setProgressBarDelay(delay) {
      this.progressBarDelay = delay;
    }
    setFormMode(mode) {
      this.formMode = mode;
    }
    get location() {
      return this.history.location;
    }
    get restorationIdentifier() {
      return this.history.restorationIdentifier;
    }
    historyPoppedToLocationWithRestorationIdentifier(location2, restorationIdentifier) {
      if (this.enabled) {
        this.navigator.startVisit(location2, restorationIdentifier, {
          action: "restore",
          historyChanged: true
        });
      } else {
        this.adapter.pageInvalidated({
          reason: "turbo_disabled"
        });
      }
    }
    scrollPositionChanged(position) {
      this.history.updateRestorationData({ scrollPosition: position });
    }
    willSubmitFormLinkToLocation(link, location2) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation);
    }
    submittedFormLinkToLocation() {
    }
    willFollowLinkToLocation(link, location2, event) {
      return this.elementIsNavigatable(link) && locationIsVisitable(location2, this.snapshot.rootLocation) && this.applicationAllowsFollowingLinkToLocation(link, location2, event);
    }
    followedLinkToLocation(link, location2) {
      const action = this.getActionForLink(link);
      const acceptsStreamResponse = link.hasAttribute("data-turbo-stream");
      this.visit(location2.href, { action, acceptsStreamResponse });
    }
    allowsVisitingLocationWithAction(location2, action) {
      return this.locationWithActionIsSamePage(location2, action) || this.applicationAllowsVisitingLocation(location2);
    }
    visitProposedToLocation(location2, options) {
      extendURLWithDeprecatedProperties(location2);
      this.adapter.visitProposedToLocation(location2, options);
    }
    visitStarted(visit2) {
      if (!visit2.acceptsStreamResponse) {
        markAsBusy(document.documentElement);
      }
      extendURLWithDeprecatedProperties(visit2.location);
      if (!visit2.silent) {
        this.notifyApplicationAfterVisitingLocation(visit2.location, visit2.action);
      }
    }
    visitCompleted(visit2) {
      clearBusyState(document.documentElement);
      this.notifyApplicationAfterPageLoad(visit2.getTimingMetrics());
    }
    locationWithActionIsSamePage(location2, action) {
      return this.navigator.locationWithActionIsSamePage(location2, action);
    }
    visitScrolledToSamePageLocation(oldURL, newURL) {
      this.notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL);
    }
    willSubmitForm(form, submitter) {
      const action = getAction(form, submitter);
      return this.submissionIsNavigatable(form, submitter) && locationIsVisitable(expandURL(action), this.snapshot.rootLocation);
    }
    formSubmitted(form, submitter) {
      this.navigator.submitForm(form, submitter);
    }
    pageBecameInteractive() {
      this.view.lastRenderedLocation = this.location;
      this.notifyApplicationAfterPageLoad();
    }
    pageLoaded() {
      this.history.assumeControlOfScrollRestoration();
    }
    pageWillUnload() {
      this.history.relinquishControlOfScrollRestoration();
    }
    receivedMessageFromStream(message) {
      this.renderStreamMessage(message);
    }
    viewWillCacheSnapshot() {
      var _a;
      if (!((_a = this.navigator.currentVisit) === null || _a === void 0 ? void 0 : _a.silent)) {
        this.notifyApplicationBeforeCachingSnapshot();
      }
    }
    allowsImmediateRender({ element }, options) {
      const event = this.notifyApplicationBeforeRender(element, options);
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
      this.view.lastRenderedLocation = this.history.location;
      this.notifyApplicationAfterRender();
    }
    preloadOnLoadLinksForView(element) {
      this.preloader.preloadOnLoadLinksForView(element);
    }
    viewInvalidated(reason) {
      this.adapter.pageInvalidated(reason);
    }
    frameLoaded(frame) {
      this.notifyApplicationAfterFrameLoad(frame);
    }
    frameRendered(fetchResponse, frame) {
      this.notifyApplicationAfterFrameRender(fetchResponse, frame);
    }
    applicationAllowsFollowingLinkToLocation(link, location2, ev) {
      const event = this.notifyApplicationAfterClickingLinkToLocation(link, location2, ev);
      return !event.defaultPrevented;
    }
    applicationAllowsVisitingLocation(location2) {
      const event = this.notifyApplicationBeforeVisitingLocation(location2);
      return !event.defaultPrevented;
    }
    notifyApplicationAfterClickingLinkToLocation(link, location2, event) {
      return dispatch("turbo:click", {
        target: link,
        detail: { url: location2.href, originalEvent: event },
        cancelable: true
      });
    }
    notifyApplicationBeforeVisitingLocation(location2) {
      return dispatch("turbo:before-visit", {
        detail: { url: location2.href },
        cancelable: true
      });
    }
    notifyApplicationAfterVisitingLocation(location2, action) {
      return dispatch("turbo:visit", { detail: { url: location2.href, action } });
    }
    notifyApplicationBeforeCachingSnapshot() {
      return dispatch("turbo:before-cache");
    }
    notifyApplicationBeforeRender(newBody, options) {
      return dispatch("turbo:before-render", {
        detail: Object.assign({ newBody }, options),
        cancelable: true
      });
    }
    notifyApplicationAfterRender() {
      return dispatch("turbo:render");
    }
    notifyApplicationAfterPageLoad(timing = {}) {
      return dispatch("turbo:load", {
        detail: { url: this.location.href, timing }
      });
    }
    notifyApplicationAfterVisitingSamePageLocation(oldURL, newURL) {
      dispatchEvent(new HashChangeEvent("hashchange", {
        oldURL: oldURL.toString(),
        newURL: newURL.toString()
      }));
    }
    notifyApplicationAfterFrameLoad(frame) {
      return dispatch("turbo:frame-load", { target: frame });
    }
    notifyApplicationAfterFrameRender(fetchResponse, frame) {
      return dispatch("turbo:frame-render", {
        detail: { fetchResponse },
        target: frame,
        cancelable: true
      });
    }
    submissionIsNavigatable(form, submitter) {
      if (this.formMode == "off") {
        return false;
      } else {
        const submitterIsNavigatable = submitter ? this.elementIsNavigatable(submitter) : true;
        if (this.formMode == "optin") {
          return submitterIsNavigatable && form.closest('[data-turbo="true"]') != null;
        } else {
          return submitterIsNavigatable && this.elementIsNavigatable(form);
        }
      }
    }
    elementIsNavigatable(element) {
      const container = findClosestRecursively(element, "[data-turbo]");
      const withinFrame = findClosestRecursively(element, "turbo-frame");
      if (this.drive || withinFrame) {
        if (container) {
          return container.getAttribute("data-turbo") != "false";
        } else {
          return true;
        }
      } else {
        if (container) {
          return container.getAttribute("data-turbo") == "true";
        } else {
          return false;
        }
      }
    }
    getActionForLink(link) {
      return getVisitAction(link) || "advance";
    }
    get snapshot() {
      return this.view.snapshot;
    }
  };
  function extendURLWithDeprecatedProperties(url) {
    Object.defineProperties(url, deprecatedLocationPropertyDescriptors);
  }
  var deprecatedLocationPropertyDescriptors = {
    absoluteURL: {
      get() {
        return this.toString();
      }
    }
  };
  var Cache = class {
    constructor(session2) {
      this.session = session2;
    }
    clear() {
      this.session.clearCache();
    }
    resetCacheControl() {
      this.setCacheControl("");
    }
    exemptPageFromCache() {
      this.setCacheControl("no-cache");
    }
    exemptPageFromPreview() {
      this.setCacheControl("no-preview");
    }
    setCacheControl(value) {
      setMetaContent("turbo-cache-control", value);
    }
  };
  var StreamActions = {
    after() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e.nextSibling);
      });
    },
    append() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.append(this.templateContent));
    },
    before() {
      this.targetElements.forEach((e) => {
        var _a;
        return (_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(this.templateContent, e);
      });
    },
    prepend() {
      this.removeDuplicateTargetChildren();
      this.targetElements.forEach((e) => e.prepend(this.templateContent));
    },
    remove() {
      this.targetElements.forEach((e) => e.remove());
    },
    replace() {
      this.targetElements.forEach((e) => e.replaceWith(this.templateContent));
    },
    update() {
      this.targetElements.forEach((targetElement) => {
        targetElement.innerHTML = "";
        targetElement.append(this.templateContent);
      });
    }
  };
  var session = new Session();
  var cache = new Cache(session);
  var { navigator: navigator$1 } = session;
  function start() {
    session.start();
  }
  function registerAdapter(adapter) {
    session.registerAdapter(adapter);
  }
  function visit(location2, options) {
    session.visit(location2, options);
  }
  function connectStreamSource(source) {
    session.connectStreamSource(source);
  }
  function disconnectStreamSource(source) {
    session.disconnectStreamSource(source);
  }
  function renderStreamMessage(message) {
    session.renderStreamMessage(message);
  }
  function clearCache() {
    console.warn("Please replace `Turbo.clearCache()` with `Turbo.cache.clear()`. The top-level function is deprecated and will be removed in a future version of Turbo.`");
    session.clearCache();
  }
  function setProgressBarDelay(delay) {
    session.setProgressBarDelay(delay);
  }
  function setConfirmMethod(confirmMethod) {
    FormSubmission.confirmMethod = confirmMethod;
  }
  function setFormMode(mode) {
    session.setFormMode(mode);
  }
  var Turbo = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    navigator: navigator$1,
    session,
    cache,
    PageRenderer,
    PageSnapshot,
    FrameRenderer,
    start,
    registerAdapter,
    visit,
    connectStreamSource,
    disconnectStreamSource,
    renderStreamMessage,
    clearCache,
    setProgressBarDelay,
    setConfirmMethod,
    setFormMode,
    StreamActions
  });
  var TurboFrameMissingError = class extends Error {
  };
  var FrameController = class {
    constructor(element) {
      this.fetchResponseLoaded = (_fetchResponse) => {
      };
      this.currentFetchRequest = null;
      this.resolveVisitPromise = () => {
      };
      this.connected = false;
      this.hasBeenLoaded = false;
      this.ignoredAttributes = /* @__PURE__ */ new Set();
      this.action = null;
      this.visitCachedSnapshot = ({ element: element2 }) => {
        const frame = element2.querySelector("#" + this.element.id);
        if (frame && this.previousFrameElement) {
          frame.replaceChildren(...this.previousFrameElement.children);
        }
        delete this.previousFrameElement;
      };
      this.element = element;
      this.view = new FrameView(this, this.element);
      this.appearanceObserver = new AppearanceObserver(this, this.element);
      this.formLinkClickObserver = new FormLinkClickObserver(this, this.element);
      this.linkInterceptor = new LinkInterceptor(this, this.element);
      this.restorationIdentifier = uuid();
      this.formSubmitObserver = new FormSubmitObserver(this, this.element);
    }
    connect() {
      if (!this.connected) {
        this.connected = true;
        if (this.loadingStyle == FrameLoadingStyle.lazy) {
          this.appearanceObserver.start();
        } else {
          this.loadSourceURL();
        }
        this.formLinkClickObserver.start();
        this.linkInterceptor.start();
        this.formSubmitObserver.start();
      }
    }
    disconnect() {
      if (this.connected) {
        this.connected = false;
        this.appearanceObserver.stop();
        this.formLinkClickObserver.stop();
        this.linkInterceptor.stop();
        this.formSubmitObserver.stop();
      }
    }
    disabledChanged() {
      if (this.loadingStyle == FrameLoadingStyle.eager) {
        this.loadSourceURL();
      }
    }
    sourceURLChanged() {
      if (this.isIgnoringChangesTo("src"))
        return;
      if (this.element.isConnected) {
        this.complete = false;
      }
      if (this.loadingStyle == FrameLoadingStyle.eager || this.hasBeenLoaded) {
        this.loadSourceURL();
      }
    }
    sourceURLReloaded() {
      const { src } = this.element;
      this.ignoringChangesToAttribute("complete", () => {
        this.element.removeAttribute("complete");
      });
      this.element.src = null;
      this.element.src = src;
      return this.element.loaded;
    }
    completeChanged() {
      if (this.isIgnoringChangesTo("complete"))
        return;
      this.loadSourceURL();
    }
    loadingStyleChanged() {
      if (this.loadingStyle == FrameLoadingStyle.lazy) {
        this.appearanceObserver.start();
      } else {
        this.appearanceObserver.stop();
        this.loadSourceURL();
      }
    }
    async loadSourceURL() {
      if (this.enabled && this.isActive && !this.complete && this.sourceURL) {
        this.element.loaded = this.visit(expandURL(this.sourceURL));
        this.appearanceObserver.stop();
        await this.element.loaded;
        this.hasBeenLoaded = true;
      }
    }
    async loadResponse(fetchResponse) {
      if (fetchResponse.redirected || fetchResponse.succeeded && fetchResponse.isHTML) {
        this.sourceURL = fetchResponse.response.url;
      }
      try {
        const html = await fetchResponse.responseHTML;
        if (html) {
          const document2 = parseHTMLDocument(html);
          const pageSnapshot = PageSnapshot.fromDocument(document2);
          if (pageSnapshot.isVisitable) {
            await this.loadFrameResponse(fetchResponse, document2);
          } else {
            await this.handleUnvisitableFrameResponse(fetchResponse);
          }
        }
      } finally {
        this.fetchResponseLoaded = () => {
        };
      }
    }
    elementAppearedInViewport(element) {
      this.proposeVisitIfNavigatedWithAction(element, element);
      this.loadSourceURL();
    }
    willSubmitFormLinkToLocation(link) {
      return this.shouldInterceptNavigation(link);
    }
    submittedFormLinkToLocation(link, _location, form) {
      const frame = this.findFrameElement(link);
      if (frame)
        form.setAttribute("data-turbo-frame", frame.id);
    }
    shouldInterceptLinkClick(element, _location, _event) {
      return this.shouldInterceptNavigation(element);
    }
    linkClickIntercepted(element, location2) {
      this.navigateFrame(element, location2);
    }
    willSubmitForm(element, submitter) {
      return element.closest("turbo-frame") == this.element && this.shouldInterceptNavigation(element, submitter);
    }
    formSubmitted(element, submitter) {
      if (this.formSubmission) {
        this.formSubmission.stop();
      }
      this.formSubmission = new FormSubmission(this, element, submitter);
      const { fetchRequest } = this.formSubmission;
      this.prepareRequest(fetchRequest);
      this.formSubmission.start();
    }
    prepareRequest(request4) {
      var _a;
      request4.headers["Turbo-Frame"] = this.id;
      if ((_a = this.currentNavigationElement) === null || _a === void 0 ? void 0 : _a.hasAttribute("data-turbo-stream")) {
        request4.acceptResponseType(StreamMessage.contentType);
      }
    }
    requestStarted(_request) {
      markAsBusy(this.element);
    }
    requestPreventedHandlingResponse(_request, _response) {
      this.resolveVisitPromise();
    }
    async requestSucceededWithResponse(request4, response3) {
      await this.loadResponse(response3);
      this.resolveVisitPromise();
    }
    async requestFailedWithResponse(request4, response3) {
      await this.loadResponse(response3);
      this.resolveVisitPromise();
    }
    requestErrored(request4, error3) {
      console.error(error3);
      this.resolveVisitPromise();
    }
    requestFinished(_request) {
      clearBusyState(this.element);
    }
    formSubmissionStarted({ formElement }) {
      markAsBusy(formElement, this.findFrameElement(formElement));
    }
    formSubmissionSucceededWithResponse(formSubmission, response3) {
      const frame = this.findFrameElement(formSubmission.formElement, formSubmission.submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, formSubmission.formElement, formSubmission.submitter);
      frame.delegate.loadResponse(response3);
      if (!formSubmission.isSafe) {
        session.clearCache();
      }
    }
    formSubmissionFailedWithResponse(formSubmission, fetchResponse) {
      this.element.delegate.loadResponse(fetchResponse);
      session.clearCache();
    }
    formSubmissionErrored(formSubmission, error3) {
      console.error(error3);
    }
    formSubmissionFinished({ formElement }) {
      clearBusyState(formElement, this.findFrameElement(formElement));
    }
    allowsImmediateRender({ element: newFrame }, options) {
      const event = dispatch("turbo:before-frame-render", {
        target: this.element,
        detail: Object.assign({ newFrame }, options),
        cancelable: true
      });
      const { defaultPrevented, detail: { render } } = event;
      if (this.view.renderer && render) {
        this.view.renderer.renderElement = render;
      }
      return !defaultPrevented;
    }
    viewRenderedSnapshot(_snapshot, _isPreview) {
    }
    preloadOnLoadLinksForView(element) {
      session.preloadOnLoadLinksForView(element);
    }
    viewInvalidated() {
    }
    willRenderFrame(currentElement, _newElement) {
      this.previousFrameElement = currentElement.cloneNode(true);
    }
    async loadFrameResponse(fetchResponse, document2) {
      const newFrameElement = await this.extractForeignFrameElement(document2.body);
      if (newFrameElement) {
        const snapshot = new Snapshot(newFrameElement);
        const renderer = new FrameRenderer(this, this.view.snapshot, snapshot, FrameRenderer.renderElement, false, false);
        if (this.view.renderPromise)
          await this.view.renderPromise;
        this.changeHistory();
        await this.view.render(renderer);
        this.complete = true;
        session.frameRendered(fetchResponse, this.element);
        session.frameLoaded(this.element);
        this.fetchResponseLoaded(fetchResponse);
      } else if (this.willHandleFrameMissingFromResponse(fetchResponse)) {
        this.handleFrameMissingFromResponse(fetchResponse);
      }
    }
    async visit(url) {
      var _a;
      const request4 = new FetchRequest(this, FetchMethod.get, url, new URLSearchParams(), this.element);
      (_a = this.currentFetchRequest) === null || _a === void 0 ? void 0 : _a.cancel();
      this.currentFetchRequest = request4;
      return new Promise((resolve) => {
        this.resolveVisitPromise = () => {
          this.resolveVisitPromise = () => {
          };
          this.currentFetchRequest = null;
          resolve();
        };
        request4.perform();
      });
    }
    navigateFrame(element, url, submitter) {
      const frame = this.findFrameElement(element, submitter);
      frame.delegate.proposeVisitIfNavigatedWithAction(frame, element, submitter);
      this.withCurrentNavigationElement(element, () => {
        frame.src = url;
      });
    }
    proposeVisitIfNavigatedWithAction(frame, element, submitter) {
      this.action = getVisitAction(submitter, element, frame);
      if (this.action) {
        const pageSnapshot = PageSnapshot.fromElement(frame).clone();
        const { visitCachedSnapshot } = frame.delegate;
        frame.delegate.fetchResponseLoaded = (fetchResponse) => {
          if (frame.src) {
            const { statusCode, redirected } = fetchResponse;
            const responseHTML = frame.ownerDocument.documentElement.outerHTML;
            const response3 = { statusCode, redirected, responseHTML };
            const options = {
              response: response3,
              visitCachedSnapshot,
              willRender: false,
              updateHistory: false,
              restorationIdentifier: this.restorationIdentifier,
              snapshot: pageSnapshot
            };
            if (this.action)
              options.action = this.action;
            session.visit(frame.src, options);
          }
        };
      }
    }
    changeHistory() {
      if (this.action) {
        const method = getHistoryMethodForAction(this.action);
        session.history.update(method, expandURL(this.element.src || ""), this.restorationIdentifier);
      }
    }
    async handleUnvisitableFrameResponse(fetchResponse) {
      console.warn(`The response (${fetchResponse.statusCode}) from <turbo-frame id="${this.element.id}"> is performing a full page visit due to turbo-visit-control.`);
      await this.visitResponse(fetchResponse.response);
    }
    willHandleFrameMissingFromResponse(fetchResponse) {
      this.element.setAttribute("complete", "");
      const response3 = fetchResponse.response;
      const visit2 = async (url, options = {}) => {
        if (url instanceof Response) {
          this.visitResponse(url);
        } else {
          session.visit(url, options);
        }
      };
      const event = dispatch("turbo:frame-missing", {
        target: this.element,
        detail: { response: response3, visit: visit2 },
        cancelable: true
      });
      return !event.defaultPrevented;
    }
    handleFrameMissingFromResponse(fetchResponse) {
      this.view.missing();
      this.throwFrameMissingError(fetchResponse);
    }
    throwFrameMissingError(fetchResponse) {
      const message = `The response (${fetchResponse.statusCode}) did not contain the expected <turbo-frame id="${this.element.id}"> and will be ignored. To perform a full page visit instead, set turbo-visit-control to reload.`;
      throw new TurboFrameMissingError(message);
    }
    async visitResponse(response3) {
      const wrapped = new FetchResponse(response3);
      const responseHTML = await wrapped.responseHTML;
      const { location: location2, redirected, statusCode } = wrapped;
      return session.visit(location2, { response: { redirected, statusCode, responseHTML } });
    }
    findFrameElement(element, submitter) {
      var _a;
      const id2 = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      return (_a = getFrameElementById(id2)) !== null && _a !== void 0 ? _a : this.element;
    }
    async extractForeignFrameElement(container) {
      let element;
      const id2 = CSS.escape(this.id);
      try {
        element = activateElement(container.querySelector(`turbo-frame#${id2}`), this.sourceURL);
        if (element) {
          return element;
        }
        element = activateElement(container.querySelector(`turbo-frame[src][recurse~=${id2}]`), this.sourceURL);
        if (element) {
          await element.loaded;
          return await this.extractForeignFrameElement(element);
        }
      } catch (error3) {
        console.error(error3);
        return new FrameElement();
      }
      return null;
    }
    formActionIsVisitable(form, submitter) {
      const action = getAction(form, submitter);
      return locationIsVisitable(expandURL(action), this.rootLocation);
    }
    shouldInterceptNavigation(element, submitter) {
      const id2 = getAttribute("data-turbo-frame", submitter, element) || this.element.getAttribute("target");
      if (element instanceof HTMLFormElement && !this.formActionIsVisitable(element, submitter)) {
        return false;
      }
      if (!this.enabled || id2 == "_top") {
        return false;
      }
      if (id2) {
        const frameElement = getFrameElementById(id2);
        if (frameElement) {
          return !frameElement.disabled;
        }
      }
      if (!session.elementIsNavigatable(element)) {
        return false;
      }
      if (submitter && !session.elementIsNavigatable(submitter)) {
        return false;
      }
      return true;
    }
    get id() {
      return this.element.id;
    }
    get enabled() {
      return !this.element.disabled;
    }
    get sourceURL() {
      if (this.element.src) {
        return this.element.src;
      }
    }
    set sourceURL(sourceURL) {
      this.ignoringChangesToAttribute("src", () => {
        this.element.src = sourceURL !== null && sourceURL !== void 0 ? sourceURL : null;
      });
    }
    get loadingStyle() {
      return this.element.loading;
    }
    get isLoading() {
      return this.formSubmission !== void 0 || this.resolveVisitPromise() !== void 0;
    }
    get complete() {
      return this.element.hasAttribute("complete");
    }
    set complete(value) {
      this.ignoringChangesToAttribute("complete", () => {
        if (value) {
          this.element.setAttribute("complete", "");
        } else {
          this.element.removeAttribute("complete");
        }
      });
    }
    get isActive() {
      return this.element.isActive && this.connected;
    }
    get rootLocation() {
      var _a;
      const meta = this.element.ownerDocument.querySelector(`meta[name="turbo-root"]`);
      const root = (_a = meta === null || meta === void 0 ? void 0 : meta.content) !== null && _a !== void 0 ? _a : "/";
      return expandURL(root);
    }
    isIgnoringChangesTo(attributeName) {
      return this.ignoredAttributes.has(attributeName);
    }
    ignoringChangesToAttribute(attributeName, callback) {
      this.ignoredAttributes.add(attributeName);
      callback();
      this.ignoredAttributes.delete(attributeName);
    }
    withCurrentNavigationElement(element, callback) {
      this.currentNavigationElement = element;
      callback();
      delete this.currentNavigationElement;
    }
  };
  function getFrameElementById(id2) {
    if (id2 != null) {
      const element = document.getElementById(id2);
      if (element instanceof FrameElement) {
        return element;
      }
    }
  }
  function activateElement(element, currentURL) {
    if (element) {
      const src = element.getAttribute("src");
      if (src != null && currentURL != null && urlsAreEqual(src, currentURL)) {
        throw new Error(`Matching <turbo-frame id="${element.id}"> element has a source URL which references itself`);
      }
      if (element.ownerDocument !== document) {
        element = document.importNode(element, true);
      }
      if (element instanceof FrameElement) {
        element.connectedCallback();
        element.disconnectedCallback();
        return element;
      }
    }
  }
  var StreamElement = class _StreamElement extends HTMLElement {
    static async renderElement(newElement) {
      await newElement.performAction();
    }
    async connectedCallback() {
      try {
        await this.render();
      } catch (error3) {
        console.error(error3);
      } finally {
        this.disconnect();
      }
    }
    async render() {
      var _a;
      return (_a = this.renderPromise) !== null && _a !== void 0 ? _a : this.renderPromise = (async () => {
        const event = this.beforeRenderEvent;
        if (this.dispatchEvent(event)) {
          await nextAnimationFrame();
          await event.detail.render(this);
        }
      })();
    }
    disconnect() {
      try {
        this.remove();
      } catch (_a) {
      }
    }
    removeDuplicateTargetChildren() {
      this.duplicateChildren.forEach((c) => c.remove());
    }
    get duplicateChildren() {
      var _a;
      const existingChildren = this.targetElements.flatMap((e) => [...e.children]).filter((c) => !!c.id);
      const newChildrenIds = [...((_a = this.templateContent) === null || _a === void 0 ? void 0 : _a.children) || []].filter((c) => !!c.id).map((c) => c.id);
      return existingChildren.filter((c) => newChildrenIds.includes(c.id));
    }
    get performAction() {
      if (this.action) {
        const actionFunction = StreamActions[this.action];
        if (actionFunction) {
          return actionFunction;
        }
        this.raise("unknown action");
      }
      this.raise("action attribute is missing");
    }
    get targetElements() {
      if (this.target) {
        return this.targetElementsById;
      } else if (this.targets) {
        return this.targetElementsByQuery;
      } else {
        this.raise("target or targets attribute is missing");
      }
    }
    get templateContent() {
      return this.templateElement.content.cloneNode(true);
    }
    get templateElement() {
      if (this.firstElementChild === null) {
        const template3 = this.ownerDocument.createElement("template");
        this.appendChild(template3);
        return template3;
      } else if (this.firstElementChild instanceof HTMLTemplateElement) {
        return this.firstElementChild;
      }
      this.raise("first child element must be a <template> element");
    }
    get action() {
      return this.getAttribute("action");
    }
    get target() {
      return this.getAttribute("target");
    }
    get targets() {
      return this.getAttribute("targets");
    }
    raise(message) {
      throw new Error(`${this.description}: ${message}`);
    }
    get description() {
      var _a, _b;
      return (_b = ((_a = this.outerHTML.match(/<[^>]+>/)) !== null && _a !== void 0 ? _a : [])[0]) !== null && _b !== void 0 ? _b : "<turbo-stream>";
    }
    get beforeRenderEvent() {
      return new CustomEvent("turbo:before-stream-render", {
        bubbles: true,
        cancelable: true,
        detail: { newStream: this, render: _StreamElement.renderElement }
      });
    }
    get targetElementsById() {
      var _a;
      const element = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.getElementById(this.target);
      if (element !== null) {
        return [element];
      } else {
        return [];
      }
    }
    get targetElementsByQuery() {
      var _a;
      const elements = (_a = this.ownerDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll(this.targets);
      if (elements.length !== 0) {
        return Array.prototype.slice.call(elements);
      } else {
        return [];
      }
    }
  };
  var StreamSourceElement = class extends HTMLElement {
    constructor() {
      super(...arguments);
      this.streamSource = null;
    }
    connectedCallback() {
      this.streamSource = this.src.match(/^ws{1,2}:/) ? new WebSocket(this.src) : new EventSource(this.src);
      connectStreamSource(this.streamSource);
    }
    disconnectedCallback() {
      if (this.streamSource) {
        disconnectStreamSource(this.streamSource);
      }
    }
    get src() {
      return this.getAttribute("src") || "";
    }
  };
  FrameElement.delegateConstructor = FrameController;
  if (customElements.get("turbo-frame") === void 0) {
    customElements.define("turbo-frame", FrameElement);
  }
  if (customElements.get("turbo-stream") === void 0) {
    customElements.define("turbo-stream", StreamElement);
  }
  if (customElements.get("turbo-stream-source") === void 0) {
    customElements.define("turbo-stream-source", StreamSourceElement);
  }
  (() => {
    let element = document.currentScript;
    if (!element)
      return;
    if (element.hasAttribute("data-turbo-suppress-warning"))
      return;
    element = element.parentElement;
    while (element) {
      if (element == document.body) {
        return console.warn(unindent`
        You are loading Turbo from a <script> element inside the <body> element. This is probably not what you meant to do!

        Load your application’s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.

        For more information, see: https://turbo.hotwired.dev/handbook/building#working-with-script-elements

        ——
        Suppress this warning by adding a "data-turbo-suppress-warning" attribute to: %s
      `, element.outerHTML);
      }
      element = element.parentElement;
    }
  })();
  window.Turbo = Turbo;
  start();

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable.js
  var consumer;
  async function getConsumer() {
    return consumer || setConsumer(createConsumer2().then(setConsumer));
  }
  function setConsumer(newConsumer) {
    return consumer = newConsumer;
  }
  async function createConsumer2() {
    const { createConsumer: createConsumer5 } = await Promise.resolve().then(() => (init_src(), src_exports));
    return createConsumer5();
  }
  async function subscribeTo(channel, mixin) {
    const { subscriptions } = await getConsumer();
    return subscriptions.create(channel, mixin);
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/snakeize.js
  function walk(obj) {
    if (!obj || typeof obj !== "object") return obj;
    if (obj instanceof Date || obj instanceof RegExp) return obj;
    if (Array.isArray(obj)) return obj.map(walk);
    return Object.keys(obj).reduce(function(acc, key) {
      var camel = key[0].toLowerCase() + key.slice(1).replace(/([A-Z]+)/g, function(m, x) {
        return "_" + x.toLowerCase();
      });
      acc[camel] = walk(obj[key]);
      return acc;
    }, {});
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/cable_stream_source_element.js
  var TurboCableStreamSourceElement = class extends HTMLElement {
    async connectedCallback() {
      connectStreamSource(this);
      this.subscription = await subscribeTo(this.channel, {
        received: this.dispatchMessageEvent.bind(this),
        connected: this.subscriptionConnected.bind(this),
        disconnected: this.subscriptionDisconnected.bind(this)
      });
    }
    disconnectedCallback() {
      disconnectStreamSource(this);
      if (this.subscription) this.subscription.unsubscribe();
    }
    dispatchMessageEvent(data) {
      const event = new MessageEvent("message", { data });
      return this.dispatchEvent(event);
    }
    subscriptionConnected() {
      this.setAttribute("connected", "");
    }
    subscriptionDisconnected() {
      this.removeAttribute("connected");
    }
    get channel() {
      const channel = this.getAttribute("channel");
      const signed_stream_name = this.getAttribute("signed-stream-name");
      return { channel, signed_stream_name, ...walk({ ...this.dataset }) };
    }
  };
  if (customElements.get("turbo-cable-stream-source") === void 0) {
    customElements.define("turbo-cable-stream-source", TurboCableStreamSourceElement);
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/fetch_requests.js
  function encodeMethodIntoRequestBody(event) {
    if (event.target instanceof HTMLFormElement) {
      const { target: form, detail: { fetchOptions } } = event;
      form.addEventListener("turbo:submit-start", ({ detail: { formSubmission: { submitter } } }) => {
        const body = isBodyInit(fetchOptions.body) ? fetchOptions.body : new URLSearchParams();
        const method = determineFetchMethod(submitter, body, form);
        if (!/get/i.test(method)) {
          if (/post/i.test(method)) {
            body.delete("_method");
          } else {
            body.set("_method", method);
          }
          fetchOptions.method = "post";
        }
      }, { once: true });
    }
  }
  function determineFetchMethod(submitter, body, form) {
    const formMethod = determineFormMethod(submitter);
    const overrideMethod = body.get("_method");
    const method = form.getAttribute("method") || "get";
    if (typeof formMethod == "string") {
      return formMethod;
    } else if (typeof overrideMethod == "string") {
      return overrideMethod;
    } else {
      return method;
    }
  }
  function determineFormMethod(submitter) {
    if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
      if (submitter.hasAttribute("formmethod")) {
        return submitter.formMethod;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  function isBodyInit(body) {
    return body instanceof FormData || body instanceof URLSearchParams;
  }

  // ../../node_modules/@hotwired/turbo-rails/app/javascript/turbo/index.js
  addEventListener("turbo:before-fetch-request", encodeMethodIntoRequestBody);

  // ../../node_modules/@rails/activestorage/app/assets/javascripts/activestorage.esm.js
  var sparkMd5 = {
    exports: {}
  };
  (function(module4, exports) {
    (function(factory) {
      {
        module4.exports = factory();
      }
    })(function(undefined$1) {
      var hex_chr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
      function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a += (b & c | ~b & d) + k[0] - 680876936 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[1] - 389564586 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[2] + 606105819 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[4] - 176418897 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[7] - 45705983 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[10] - 42063 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[13] - 40341101 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & d | c & ~d) + k[1] - 165796510 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[11] + 643717713 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[0] - 373897302 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[5] - 701558691 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[10] + 38016083 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[15] - 660478335 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[4] - 405537848 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[9] + 568446438 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[3] - 187363961 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[2] - 51403784 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b ^ c ^ d) + k[5] - 378558 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[14] - 35309556 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[7] - 155497632 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[13] + 681279174 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[0] - 358537222 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[3] - 722521979 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[6] + 76029189 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[9] - 640364487 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[12] - 421815835 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[15] + 530742520 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[2] - 995338651 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        x[0] = a + x[0] | 0;
        x[1] = b + x[1] | 0;
        x[2] = c + x[2] | 0;
        x[3] = d + x[3] | 0;
      }
      function md5blk(s) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
      }
      function md5blk_array(a) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
      }
      function md51(s) {
        var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i, length, tail, tmp, lo, hi;
        for (i = 64; i <= n; i += 64) {
          md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
        }
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(state, tail);
        return state;
      }
      function md51_array(a) {
        var n = a.length, state = [1732584193, -271733879, -1732584194, 271733878], i, length, tail, tmp, lo, hi;
        for (i = 64; i <= n; i += 64) {
          md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }
        a = i - 64 < n ? a.subarray(i - 64) : new Uint8Array(0);
        length = a.length;
        tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= a[i] << (i % 4 << 3);
        }
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(state, tail);
        return state;
      }
      function rhex(n) {
        var s = "", j;
        for (j = 0; j < 4; j += 1) {
          s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
        }
        return s;
      }
      function hex(x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
          x[i] = rhex(x[i]);
        }
        return x.join("");
      }
      if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592") ;
      if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
        (function() {
          function clamp(val, length) {
            val = val | 0 || 0;
            if (val < 0) {
              return Math.max(val + length, 0);
            }
            return Math.min(val, length);
          }
          ArrayBuffer.prototype.slice = function(from, to) {
            var length = this.byteLength, begin = clamp(from, length), end = length, num, target, targetArray, sourceArray;
            if (to !== undefined$1) {
              end = clamp(to, length);
            }
            if (begin > end) {
              return new ArrayBuffer(0);
            }
            num = end - begin;
            target = new ArrayBuffer(num);
            targetArray = new Uint8Array(target);
            sourceArray = new Uint8Array(this, begin, num);
            targetArray.set(sourceArray);
            return target;
          };
        })();
      }
      function toUtf8(str) {
        if (/[\u0080-\uFFFF]/.test(str)) {
          str = unescape(encodeURIComponent(str));
        }
        return str;
      }
      function utf8Str2ArrayBuffer(str, returnUInt8Array) {
        var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i;
        for (i = 0; i < length; i += 1) {
          arr[i] = str.charCodeAt(i);
        }
        return returnUInt8Array ? arr : buff;
      }
      function arrayBuffer2Utf8Str(buff) {
        return String.fromCharCode.apply(null, new Uint8Array(buff));
      }
      function concatenateArrayBuffers(first, second, returnUInt8Array) {
        var result = new Uint8Array(first.byteLength + second.byteLength);
        result.set(new Uint8Array(first));
        result.set(new Uint8Array(second), first.byteLength);
        return returnUInt8Array ? result : result.buffer;
      }
      function hexToBinaryString(hex2) {
        var bytes = [], length = hex2.length, x;
        for (x = 0; x < length - 1; x += 2) {
          bytes.push(parseInt(hex2.substr(x, 2), 16));
        }
        return String.fromCharCode.apply(String, bytes);
      }
      function SparkMD52() {
        this.reset();
      }
      SparkMD52.prototype.append = function(str) {
        this.appendBinary(toUtf8(str));
        return this;
      };
      SparkMD52.prototype.appendBinary = function(contents) {
        this._buff += contents;
        this._length += contents.length;
        var length = this._buff.length, i;
        for (i = 64; i <= length; i += 64) {
          md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
        }
        this._buff = this._buff.substring(i - 64);
        return this;
      };
      SparkMD52.prototype.end = function(raw) {
        var buff = this._buff, length = buff.length, i, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ret;
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= buff.charCodeAt(i) << (i % 4 << 3);
        }
        this._finish(tail, length);
        ret = hex(this._hash);
        if (raw) {
          ret = hexToBinaryString(ret);
        }
        this.reset();
        return ret;
      };
      SparkMD52.prototype.reset = function() {
        this._buff = "";
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];
        return this;
      };
      SparkMD52.prototype.getState = function() {
        return {
          buff: this._buff,
          length: this._length,
          hash: this._hash.slice()
        };
      };
      SparkMD52.prototype.setState = function(state) {
        this._buff = state.buff;
        this._length = state.length;
        this._hash = state.hash;
        return this;
      };
      SparkMD52.prototype.destroy = function() {
        delete this._hash;
        delete this._buff;
        delete this._length;
      };
      SparkMD52.prototype._finish = function(tail, length) {
        var i = length, tmp, lo, hi;
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(this._hash, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._hash, tail);
      };
      SparkMD52.hash = function(str, raw) {
        return SparkMD52.hashBinary(toUtf8(str), raw);
      };
      SparkMD52.hashBinary = function(content, raw) {
        var hash = md51(content), ret = hex(hash);
        return raw ? hexToBinaryString(ret) : ret;
      };
      SparkMD52.ArrayBuffer = function() {
        this.reset();
      };
      SparkMD52.ArrayBuffer.prototype.append = function(arr) {
        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i;
        this._length += arr.byteLength;
        for (i = 64; i <= length; i += 64) {
          md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
        }
        this._buff = i - 64 < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);
        return this;
      };
      SparkMD52.ArrayBuffer.prototype.end = function(raw) {
        var buff = this._buff, length = buff.length, tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], i, ret;
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= buff[i] << (i % 4 << 3);
        }
        this._finish(tail, length);
        ret = hex(this._hash);
        if (raw) {
          ret = hexToBinaryString(ret);
        }
        this.reset();
        return ret;
      };
      SparkMD52.ArrayBuffer.prototype.reset = function() {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._hash = [1732584193, -271733879, -1732584194, 271733878];
        return this;
      };
      SparkMD52.ArrayBuffer.prototype.getState = function() {
        var state = SparkMD52.prototype.getState.call(this);
        state.buff = arrayBuffer2Utf8Str(state.buff);
        return state;
      };
      SparkMD52.ArrayBuffer.prototype.setState = function(state) {
        state.buff = utf8Str2ArrayBuffer(state.buff, true);
        return SparkMD52.prototype.setState.call(this, state);
      };
      SparkMD52.ArrayBuffer.prototype.destroy = SparkMD52.prototype.destroy;
      SparkMD52.ArrayBuffer.prototype._finish = SparkMD52.prototype._finish;
      SparkMD52.ArrayBuffer.hash = function(arr, raw) {
        var hash = md51_array(new Uint8Array(arr)), ret = hex(hash);
        return raw ? hexToBinaryString(ret) : ret;
      };
      return SparkMD52;
    });
  })(sparkMd5);
  var SparkMD5 = sparkMd5.exports;
  var fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
  var FileChecksum = class _FileChecksum {
    static create(file, callback) {
      const instance = new _FileChecksum(file);
      instance.create(callback);
    }
    constructor(file) {
      this.file = file;
      this.chunkSize = 2097152;
      this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
      this.chunkIndex = 0;
    }
    create(callback) {
      this.callback = callback;
      this.md5Buffer = new SparkMD5.ArrayBuffer();
      this.fileReader = new FileReader();
      this.fileReader.addEventListener("load", (event) => this.fileReaderDidLoad(event));
      this.fileReader.addEventListener("error", (event) => this.fileReaderDidError(event));
      this.readNextChunk();
    }
    fileReaderDidLoad(event) {
      this.md5Buffer.append(event.target.result);
      if (!this.readNextChunk()) {
        const binaryDigest = this.md5Buffer.end(true);
        const base64digest = btoa(binaryDigest);
        this.callback(null, base64digest);
      }
    }
    fileReaderDidError(event) {
      this.callback(`Error reading ${this.file.name}`);
    }
    readNextChunk() {
      if (this.chunkIndex < this.chunkCount || this.chunkIndex == 0 && this.chunkCount == 0) {
        const start3 = this.chunkIndex * this.chunkSize;
        const end = Math.min(start3 + this.chunkSize, this.file.size);
        const bytes = fileSlice.call(this.file, start3, end);
        this.fileReader.readAsArrayBuffer(bytes);
        this.chunkIndex++;
        return true;
      } else {
        return false;
      }
    }
  };
  function getMetaValue(name4) {
    const element = findElement(document.head, `meta[name="${name4}"]`);
    if (element) {
      return element.getAttribute("content");
    }
  }
  function findElements(root, selector) {
    if (typeof root == "string") {
      selector = root;
      root = document;
    }
    const elements = root.querySelectorAll(selector);
    return toArray(elements);
  }
  function findElement(root, selector) {
    if (typeof root == "string") {
      selector = root;
      root = document;
    }
    return root.querySelector(selector);
  }
  function dispatchEvent2(element, type, eventInit = {}) {
    const { disabled } = element;
    const { bubbles, cancelable, detail } = eventInit;
    const event = document.createEvent("Event");
    event.initEvent(type, bubbles || true, cancelable || true);
    event.detail = detail || {};
    try {
      element.disabled = false;
      element.dispatchEvent(event);
    } finally {
      element.disabled = disabled;
    }
    return event;
  }
  function toArray(value) {
    if (Array.isArray(value)) {
      return value;
    } else if (Array.from) {
      return Array.from(value);
    } else {
      return [].slice.call(value);
    }
  }
  var BlobRecord = class {
    constructor(file, checksum, url, customHeaders = {}) {
      this.file = file;
      this.attributes = {
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        byte_size: file.size,
        checksum
      };
      this.xhr = new XMLHttpRequest();
      this.xhr.open("POST", url, true);
      this.xhr.responseType = "json";
      this.xhr.setRequestHeader("Content-Type", "application/json");
      this.xhr.setRequestHeader("Accept", "application/json");
      this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      Object.keys(customHeaders).forEach((headerKey) => {
        this.xhr.setRequestHeader(headerKey, customHeaders[headerKey]);
      });
      const csrfToken = getMetaValue("csrf-token");
      if (csrfToken != void 0) {
        this.xhr.setRequestHeader("X-CSRF-Token", csrfToken);
      }
      this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
      this.xhr.addEventListener("error", (event) => this.requestDidError(event));
    }
    get status() {
      return this.xhr.status;
    }
    get response() {
      const { responseType, response: response3 } = this.xhr;
      if (responseType == "json") {
        return response3;
      } else {
        return JSON.parse(response3);
      }
    }
    create(callback) {
      this.callback = callback;
      this.xhr.send(JSON.stringify({
        blob: this.attributes
      }));
    }
    requestDidLoad(event) {
      if (this.status >= 200 && this.status < 300) {
        const { response: response3 } = this;
        const { direct_upload } = response3;
        delete response3.direct_upload;
        this.attributes = response3;
        this.directUploadData = direct_upload;
        this.callback(null, this.toJSON());
      } else {
        this.requestDidError(event);
      }
    }
    requestDidError(event) {
      this.callback(`Error creating Blob for "${this.file.name}". Status: ${this.status}`);
    }
    toJSON() {
      const result = {};
      for (const key in this.attributes) {
        result[key] = this.attributes[key];
      }
      return result;
    }
  };
  var BlobUpload = class {
    constructor(blob) {
      this.blob = blob;
      this.file = blob.file;
      const { url, headers } = blob.directUploadData;
      this.xhr = new XMLHttpRequest();
      this.xhr.open("PUT", url, true);
      this.xhr.responseType = "text";
      for (const key in headers) {
        this.xhr.setRequestHeader(key, headers[key]);
      }
      this.xhr.addEventListener("load", (event) => this.requestDidLoad(event));
      this.xhr.addEventListener("error", (event) => this.requestDidError(event));
    }
    create(callback) {
      this.callback = callback;
      this.xhr.send(this.file.slice());
    }
    requestDidLoad(event) {
      const { status, response: response3 } = this.xhr;
      if (status >= 200 && status < 300) {
        this.callback(null, response3);
      } else {
        this.requestDidError(event);
      }
    }
    requestDidError(event) {
      this.callback(`Error storing "${this.file.name}". Status: ${this.xhr.status}`);
    }
  };
  var id = 0;
  var DirectUpload = class {
    constructor(file, url, delegate, customHeaders = {}) {
      this.id = ++id;
      this.file = file;
      this.url = url;
      this.delegate = delegate;
      this.customHeaders = customHeaders;
    }
    create(callback) {
      FileChecksum.create(this.file, (error3, checksum) => {
        if (error3) {
          callback(error3);
          return;
        }
        const blob = new BlobRecord(this.file, checksum, this.url, this.customHeaders);
        notify(this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr);
        blob.create((error4) => {
          if (error4) {
            callback(error4);
          } else {
            const upload = new BlobUpload(blob);
            notify(this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr);
            upload.create((error5) => {
              if (error5) {
                callback(error5);
              } else {
                callback(null, blob.toJSON());
              }
            });
          }
        });
      });
    }
  };
  function notify(object, methodName, ...messages) {
    if (object && typeof object[methodName] == "function") {
      return object[methodName](...messages);
    }
  }
  var DirectUploadController = class {
    constructor(input, file) {
      this.input = input;
      this.file = file;
      this.directUpload = new DirectUpload(this.file, this.url, this);
      this.dispatch("initialize");
    }
    start(callback) {
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = this.input.name;
      this.input.insertAdjacentElement("beforebegin", hiddenInput);
      this.dispatch("start");
      this.directUpload.create((error3, attributes) => {
        if (error3) {
          hiddenInput.parentNode.removeChild(hiddenInput);
          this.dispatchError(error3);
        } else {
          hiddenInput.value = attributes.signed_id;
        }
        this.dispatch("end");
        callback(error3);
      });
    }
    uploadRequestDidProgress(event) {
      const progress2 = event.loaded / event.total * 100;
      if (progress2) {
        this.dispatch("progress", {
          progress: progress2
        });
      }
    }
    get url() {
      return this.input.getAttribute("data-direct-upload-url");
    }
    dispatch(name4, detail = {}) {
      detail.file = this.file;
      detail.id = this.directUpload.id;
      return dispatchEvent2(this.input, `direct-upload:${name4}`, {
        detail
      });
    }
    dispatchError(error3) {
      const event = this.dispatch("error", {
        error: error3
      });
      if (!event.defaultPrevented) {
        alert(error3);
      }
    }
    directUploadWillCreateBlobWithXHR(xhr) {
      this.dispatch("before-blob-request", {
        xhr
      });
    }
    directUploadWillStoreFileWithXHR(xhr) {
      this.dispatch("before-storage-request", {
        xhr
      });
      xhr.upload.addEventListener("progress", (event) => this.uploadRequestDidProgress(event));
    }
  };
  var inputSelector = "input[type=file][data-direct-upload-url]:not([disabled])";
  var DirectUploadsController = class {
    constructor(form) {
      this.form = form;
      this.inputs = findElements(form, inputSelector).filter((input) => input.files.length);
    }
    start(callback) {
      const controllers = this.createDirectUploadControllers();
      const startNextController = () => {
        const controller = controllers.shift();
        if (controller) {
          controller.start((error3) => {
            if (error3) {
              callback(error3);
              this.dispatch("end");
            } else {
              startNextController();
            }
          });
        } else {
          callback();
          this.dispatch("end");
        }
      };
      this.dispatch("start");
      startNextController();
    }
    createDirectUploadControllers() {
      const controllers = [];
      this.inputs.forEach((input) => {
        toArray(input.files).forEach((file) => {
          const controller = new DirectUploadController(input, file);
          controllers.push(controller);
        });
      });
      return controllers;
    }
    dispatch(name4, detail = {}) {
      return dispatchEvent2(this.form, `direct-uploads:${name4}`, {
        detail
      });
    }
  };
  var processingAttribute = "data-direct-uploads-processing";
  var submitButtonsByForm = /* @__PURE__ */ new WeakMap();
  var started = false;
  function start2() {
    if (!started) {
      started = true;
      document.addEventListener("click", didClick, true);
      document.addEventListener("submit", didSubmitForm, true);
      document.addEventListener("ajax:before", didSubmitRemoteElement);
    }
  }
  function didClick(event) {
    const button = event.target.closest("button, input");
    if (button && button.type === "submit" && button.form) {
      submitButtonsByForm.set(button.form, button);
    }
  }
  function didSubmitForm(event) {
    handleFormSubmissionEvent(event);
  }
  function didSubmitRemoteElement(event) {
    if (event.target.tagName == "FORM") {
      handleFormSubmissionEvent(event);
    }
  }
  function handleFormSubmissionEvent(event) {
    const form = event.target;
    if (form.hasAttribute(processingAttribute)) {
      event.preventDefault();
      return;
    }
    const controller = new DirectUploadsController(form);
    const { inputs } = controller;
    if (inputs.length) {
      event.preventDefault();
      form.setAttribute(processingAttribute, "");
      inputs.forEach(disable);
      controller.start((error3) => {
        form.removeAttribute(processingAttribute);
        if (error3) {
          inputs.forEach(enable);
        } else {
          submitForm(form);
        }
      });
    }
  }
  function submitForm(form) {
    let button = submitButtonsByForm.get(form) || findElement(form, "input[type=submit], button[type=submit]");
    if (button) {
      const { disabled } = button;
      button.disabled = false;
      button.focus();
      button.click();
      button.disabled = disabled;
    } else {
      button = document.createElement("input");
      button.type = "submit";
      button.style.display = "none";
      form.appendChild(button);
      button.click();
      form.removeChild(button);
    }
    submitButtonsByForm.delete(form);
  }
  function disable(input) {
    input.disabled = true;
  }
  function enable(input) {
    input.disabled = false;
  }
  function autostart() {
    if (window.ActiveStorage) {
      start2();
    }
  }
  setTimeout(autostart, 1);

  // ../../node_modules/@rails/actioncable/app/assets/javascripts/actioncable.esm.js
  var adapters = {
    logger: typeof console !== "undefined" ? console : void 0,
    WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
  };
  var logger = {
    log(...messages) {
      if (this.enabled) {
        messages.push(Date.now());
        adapters.logger.log("[ActionCable]", ...messages);
      }
    }
  };
  var now2 = () => (/* @__PURE__ */ new Date()).getTime();
  var secondsSince2 = (time) => (now2() - time) / 1e3;
  var ConnectionMonitor2 = class {
    constructor(connection) {
      this.visibilityDidChange = this.visibilityDidChange.bind(this);
      this.connection = connection;
      this.reconnectAttempts = 0;
    }
    start() {
      if (!this.isRunning()) {
        this.startedAt = now2();
        delete this.stoppedAt;
        this.startPolling();
        addEventListener("visibilitychange", this.visibilityDidChange);
        logger.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
      }
    }
    stop() {
      if (this.isRunning()) {
        this.stoppedAt = now2();
        this.stopPolling();
        removeEventListener("visibilitychange", this.visibilityDidChange);
        logger.log("ConnectionMonitor stopped");
      }
    }
    isRunning() {
      return this.startedAt && !this.stoppedAt;
    }
    recordPing() {
      this.pingedAt = now2();
    }
    recordConnect() {
      this.reconnectAttempts = 0;
      this.recordPing();
      delete this.disconnectedAt;
      logger.log("ConnectionMonitor recorded connect");
    }
    recordDisconnect() {
      this.disconnectedAt = now2();
      logger.log("ConnectionMonitor recorded disconnect");
    }
    startPolling() {
      this.stopPolling();
      this.poll();
    }
    stopPolling() {
      clearTimeout(this.pollTimeout);
    }
    poll() {
      this.pollTimeout = setTimeout(() => {
        this.reconnectIfStale();
        this.poll();
      }, this.getPollInterval());
    }
    getPollInterval() {
      const { staleThreshold, reconnectionBackoffRate } = this.constructor;
      const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
      const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
      const jitter = jitterMax * Math.random();
      return staleThreshold * 1e3 * backoff * (1 + jitter);
    }
    reconnectIfStale() {
      if (this.connectionIsStale()) {
        logger.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince2(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
        this.reconnectAttempts++;
        if (this.disconnectedRecently()) {
          logger.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince2(this.disconnectedAt)} s`);
        } else {
          logger.log("ConnectionMonitor reopening");
          this.connection.reopen();
        }
      }
    }
    get refreshedAt() {
      return this.pingedAt ? this.pingedAt : this.startedAt;
    }
    connectionIsStale() {
      return secondsSince2(this.refreshedAt) > this.constructor.staleThreshold;
    }
    disconnectedRecently() {
      return this.disconnectedAt && secondsSince2(this.disconnectedAt) < this.constructor.staleThreshold;
    }
    visibilityDidChange() {
      if (document.visibilityState === "visible") {
        setTimeout(() => {
          if (this.connectionIsStale() || !this.connection.isOpen()) {
            logger.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
            this.connection.reopen();
          }
        }, 200);
      }
    }
  };
  ConnectionMonitor2.staleThreshold = 6;
  ConnectionMonitor2.reconnectionBackoffRate = 0.15;
  var INTERNAL = {
    message_types: {
      welcome: "welcome",
      disconnect: "disconnect",
      ping: "ping",
      confirmation: "confirm_subscription",
      rejection: "reject_subscription"
    },
    disconnect_reasons: {
      unauthorized: "unauthorized",
      invalid_request: "invalid_request",
      server_restart: "server_restart",
      remote: "remote"
    },
    default_mount_path: "/cable",
    protocols: ["actioncable-v1-json", "actioncable-unsupported"]
  };
  var { message_types: message_types2, protocols: protocols2 } = INTERNAL;
  var supportedProtocols2 = protocols2.slice(0, protocols2.length - 1);
  var indexOf2 = [].indexOf;
  var Connection2 = class {
    constructor(consumer5) {
      this.open = this.open.bind(this);
      this.consumer = consumer5;
      this.subscriptions = this.consumer.subscriptions;
      this.monitor = new ConnectionMonitor2(this);
      this.disconnected = true;
    }
    send(data) {
      if (this.isOpen()) {
        this.webSocket.send(JSON.stringify(data));
        return true;
      } else {
        return false;
      }
    }
    open() {
      if (this.isActive()) {
        logger.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
        return false;
      } else {
        const socketProtocols = [...protocols2, ...this.consumer.subprotocols || []];
        logger.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
        if (this.webSocket) {
          this.uninstallEventHandlers();
        }
        this.webSocket = new adapters.WebSocket(this.consumer.url, socketProtocols);
        this.installEventHandlers();
        this.monitor.start();
        return true;
      }
    }
    close({ allowReconnect } = {
      allowReconnect: true
    }) {
      if (!allowReconnect) {
        this.monitor.stop();
      }
      if (this.isOpen()) {
        return this.webSocket.close();
      }
    }
    reopen() {
      logger.log(`Reopening WebSocket, current state is ${this.getState()}`);
      if (this.isActive()) {
        try {
          return this.close();
        } catch (error3) {
          logger.log("Failed to reopen WebSocket", error3);
        } finally {
          logger.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
          setTimeout(this.open, this.constructor.reopenDelay);
        }
      } else {
        return this.open();
      }
    }
    getProtocol() {
      if (this.webSocket) {
        return this.webSocket.protocol;
      }
    }
    isOpen() {
      return this.isState("open");
    }
    isActive() {
      return this.isState("open", "connecting");
    }
    triedToReconnect() {
      return this.monitor.reconnectAttempts > 0;
    }
    isProtocolSupported() {
      return indexOf2.call(supportedProtocols2, this.getProtocol()) >= 0;
    }
    isState(...states) {
      return indexOf2.call(states, this.getState()) >= 0;
    }
    getState() {
      if (this.webSocket) {
        for (let state in adapters.WebSocket) {
          if (adapters.WebSocket[state] === this.webSocket.readyState) {
            return state.toLowerCase();
          }
        }
      }
      return null;
    }
    installEventHandlers() {
      for (let eventName in this.events) {
        const handler = this.events[eventName].bind(this);
        this.webSocket[`on${eventName}`] = handler;
      }
    }
    uninstallEventHandlers() {
      for (let eventName in this.events) {
        this.webSocket[`on${eventName}`] = function() {
        };
      }
    }
  };
  Connection2.reopenDelay = 500;
  Connection2.prototype.events = {
    message(event) {
      if (!this.isProtocolSupported()) {
        return;
      }
      const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
      switch (type) {
        case message_types2.welcome:
          if (this.triedToReconnect()) {
            this.reconnectAttempted = true;
          }
          this.monitor.recordConnect();
          return this.subscriptions.reload();
        case message_types2.disconnect:
          logger.log(`Disconnecting. Reason: ${reason}`);
          return this.close({
            allowReconnect: reconnect
          });
        case message_types2.ping:
          return this.monitor.recordPing();
        case message_types2.confirmation:
          this.subscriptions.confirmSubscription(identifier);
          if (this.reconnectAttempted) {
            this.reconnectAttempted = false;
            return this.subscriptions.notify(identifier, "connected", {
              reconnected: true
            });
          } else {
            return this.subscriptions.notify(identifier, "connected", {
              reconnected: false
            });
          }
        case message_types2.rejection:
          return this.subscriptions.reject(identifier);
        default:
          return this.subscriptions.notify(identifier, "received", message);
      }
    },
    open() {
      logger.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
      this.disconnected = false;
      if (!this.isProtocolSupported()) {
        logger.log("Protocol is unsupported. Stopping monitor and disconnecting.");
        return this.close({
          allowReconnect: false
        });
      }
    },
    close(event) {
      logger.log("WebSocket onclose event");
      if (this.disconnected) {
        return;
      }
      this.disconnected = true;
      this.monitor.recordDisconnect();
      return this.subscriptions.notifyAll("disconnected", {
        willAttemptReconnect: this.monitor.isRunning()
      });
    },
    error() {
      logger.log("WebSocket onerror event");
    }
  };
  var extend2 = function(object, properties) {
    if (properties != null) {
      for (let key in properties) {
        const value = properties[key];
        object[key] = value;
      }
    }
    return object;
  };
  var Subscription2 = class {
    constructor(consumer5, params2 = {}, mixin) {
      this.consumer = consumer5;
      this.identifier = JSON.stringify(params2);
      extend2(this, mixin);
    }
    perform(action, data = {}) {
      data.action = action;
      return this.send(data);
    }
    send(data) {
      return this.consumer.send({
        command: "message",
        identifier: this.identifier,
        data: JSON.stringify(data)
      });
    }
    unsubscribe() {
      return this.consumer.subscriptions.remove(this);
    }
  };
  var SubscriptionGuarantor2 = class {
    constructor(subscriptions) {
      this.subscriptions = subscriptions;
      this.pendingSubscriptions = [];
    }
    guarantee(subscription2) {
      if (this.pendingSubscriptions.indexOf(subscription2) == -1) {
        logger.log(`SubscriptionGuarantor guaranteeing ${subscription2.identifier}`);
        this.pendingSubscriptions.push(subscription2);
      } else {
        logger.log(`SubscriptionGuarantor already guaranteeing ${subscription2.identifier}`);
      }
      this.startGuaranteeing();
    }
    forget(subscription2) {
      logger.log(`SubscriptionGuarantor forgetting ${subscription2.identifier}`);
      this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription2);
    }
    startGuaranteeing() {
      this.stopGuaranteeing();
      this.retrySubscribing();
    }
    stopGuaranteeing() {
      clearTimeout(this.retryTimeout);
    }
    retrySubscribing() {
      this.retryTimeout = setTimeout(() => {
        if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
          this.pendingSubscriptions.map((subscription2) => {
            logger.log(`SubscriptionGuarantor resubscribing ${subscription2.identifier}`);
            this.subscriptions.subscribe(subscription2);
          });
        }
      }, 500);
    }
  };
  var Subscriptions2 = class {
    constructor(consumer5) {
      this.consumer = consumer5;
      this.guarantor = new SubscriptionGuarantor2(this);
      this.subscriptions = [];
    }
    create(channelName, mixin) {
      const channel = channelName;
      const params2 = typeof channel === "object" ? channel : {
        channel
      };
      const subscription2 = new Subscription2(this.consumer, params2, mixin);
      return this.add(subscription2);
    }
    add(subscription2) {
      this.subscriptions.push(subscription2);
      this.consumer.ensureActiveConnection();
      this.notify(subscription2, "initialized");
      this.subscribe(subscription2);
      return subscription2;
    }
    remove(subscription2) {
      this.forget(subscription2);
      if (!this.findAll(subscription2.identifier).length) {
        this.sendCommand(subscription2, "unsubscribe");
      }
      return subscription2;
    }
    reject(identifier) {
      return this.findAll(identifier).map((subscription2) => {
        this.forget(subscription2);
        this.notify(subscription2, "rejected");
        return subscription2;
      });
    }
    forget(subscription2) {
      this.guarantor.forget(subscription2);
      this.subscriptions = this.subscriptions.filter((s) => s !== subscription2);
      return subscription2;
    }
    findAll(identifier) {
      return this.subscriptions.filter((s) => s.identifier === identifier);
    }
    reload() {
      return this.subscriptions.map((subscription2) => this.subscribe(subscription2));
    }
    notifyAll(callbackName, ...args) {
      return this.subscriptions.map((subscription2) => this.notify(subscription2, callbackName, ...args));
    }
    notify(subscription2, callbackName, ...args) {
      let subscriptions;
      if (typeof subscription2 === "string") {
        subscriptions = this.findAll(subscription2);
      } else {
        subscriptions = [subscription2];
      }
      return subscriptions.map((subscription3) => typeof subscription3[callbackName] === "function" ? subscription3[callbackName](...args) : void 0);
    }
    subscribe(subscription2) {
      if (this.sendCommand(subscription2, "subscribe")) {
        this.guarantor.guarantee(subscription2);
      }
    }
    confirmSubscription(identifier) {
      logger.log(`Subscription confirmed ${identifier}`);
      this.findAll(identifier).map((subscription2) => this.guarantor.forget(subscription2));
    }
    sendCommand(subscription2, command) {
      const { identifier } = subscription2;
      return this.consumer.send({
        command,
        identifier
      });
    }
  };
  var Consumer2 = class {
    constructor(url) {
      this._url = url;
      this.subscriptions = new Subscriptions2(this);
      this.connection = new Connection2(this);
      this.subprotocols = [];
    }
    get url() {
      return createWebSocketURL2(this._url);
    }
    send(data) {
      return this.connection.send(data);
    }
    connect() {
      return this.connection.open();
    }
    disconnect() {
      return this.connection.close({
        allowReconnect: false
      });
    }
    ensureActiveConnection() {
      if (!this.connection.isActive()) {
        return this.connection.open();
      }
    }
    addSubProtocol(subprotocol) {
      this.subprotocols = [...this.subprotocols, subprotocol];
    }
  };
  function createWebSocketURL2(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  function createConsumer3(url = getConfig2("url") || INTERNAL.default_mount_path) {
    return new Consumer2(url);
  }
  function getConfig2(name4) {
    const element = document.head.querySelector(`meta[name='action-cable-${name4}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }

  // channels/consumer.js
  var consumer_default = createConsumer3();

  // channels/audio_channel.ts
  var audioChannel = consumer_default.subscriptions.create("AudioChannel", {
    connected() {
      console.log("Connected to AudioChannel");
    },
    disconnected() {
      console.log("Disconnected from AudioChannel");
    },
    received(data) {
      console.log("Received data:", data);
    },
    // sendAudioData(recordingId, audioData) {
    //   console.log("Sending audio data:", recordingId, audioData);
    //   this.perform('receive', { recordingId: recordingId, audioData: audioData });
    // },
    async initializeRecording(opts) {
      const recordingId = opts.recordingId;
      const lectureId = opts.lectureId;
      this.perform("initialize_recording", {
        recordingId,
        lectureId
      });
    },
    async sendAudioChunk(opts) {
      const lectureId = opts.lectureId;
      const recordingId = opts.recordingId;
      const timestamp = opts.timestamp;
      const encodingData = opts.encodingData;
      const base64String = opts.base64String;
      const chunkNumber = opts.chunkNumber;
      this.perform("receive_chunk", {
        lectureId,
        recordingId,
        timestamp,
        encodingData,
        audioData: base64String,
        chunkNumber
      });
    },
    async informRecordingDone(opts) {
      const recordingId = opts.recordingId;
      this.perform("transfer_recording_to_object_storage", {
        recordingId
      });
    },
    processAudio(recordingId) {
      this.perform("process", {
        recordingId
      });
    },
    uploadRecording(file) {
      console.log(file);
      const formData = new FormData();
      formData.append("audio[file]", file);
      console.log(formData);
      this.perform("upload", {
        recording: formData
      });
    }
  });
  var audio_channel_default = audioChannel;

  // channels/chat_channel.js
  consumer_default.subscriptions.create("ChatChannel", {
    connected() {
    },
    disconnected() {
    },
    received(data) {
      console.log(data);
    }
  });

  // channels/messages_channel.js
  consumer_default.subscriptions.create("MessagesChannel", {
    connected() {
    },
    disconnected() {
    },
    received(data) {
      console.log(data);
    }
  });

  // channels/time_channel.js
  consumer_default.subscriptions.create("TimeChannel", {
    connected() {
      console.log("connected to time channel");
    },
    disconnected() {
    },
    received(data) {
      console.log(data);
    }
  });

  // channels/transcription_channel.js
  var transcriptionChannel = consumer_default.subscriptions.create(
    "TranscriptionChannel",
    {
      connected() {
        console.log("Connected to AudioChannel");
      },
      disconnected() {
        console.log("Disconnected from AudioChannel");
      },
      received(data) {
        console.log("Received data:", data);
      },
      async generateTranscription() {
        await new Promise((resolve) => setTimeout(resolve, 3e3));
      },
      async downloadTranscription() {
        await new Promise((resolve) => setTimeout(resolve, 3e3));
      }
      // processAudio(recordingId) {
      //   this.perform("process", { recordingId: recordingId });
      // },
    }
  );
  var transcription_channel_default = transcriptionChannel;

  // classes/queue_processor.ts
  var QueueProcessor = class {
    queue;
    processor;
    isProcessing;
    constructor(queue, processor) {
      this.queue = queue;
      this.processor = processor;
      this.isProcessing = false;
    }
    async processQueue() {
      if (this.isProcessing) return;
      this.isProcessing = true;
      while (this.queue.length > 0) {
        const itemToProcess = this.queue.at(0);
        if (itemToProcess === void 0) {
          throw new Error("No item to process");
        }
        const didProcess = await this.processor(itemToProcess);
        if (didProcess) {
          this.queue.shift();
        } else {
          throw new Error(`Failed to process item: ${itemToProcess}`);
        }
      }
      this.isProcessing = false;
    }
    addToQueue(item) {
      this.queue.push(item);
      this.processQueue();
    }
  };

  // ../../node_modules/morphdom/dist/morphdom-esm.js
  var DOCUMENT_FRAGMENT_NODE = 11;
  function morphAttrs(fromNode, toNode) {
    var toNodeAttrs = toNode.attributes;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;
    if (toNode.nodeType === DOCUMENT_FRAGMENT_NODE || fromNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    for (var i = toNodeAttrs.length - 1; i >= 0; i--) {
      attr = toNodeAttrs[i];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      attrValue = attr.value;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);
        if (fromValue !== attrValue) {
          if (attr.prefix === "xmlns") {
            attrName = attr.name;
          }
          fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
        }
      } else {
        fromValue = fromNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          fromNode.setAttribute(attrName, attrValue);
        }
      }
    }
    var fromNodeAttrs = fromNode.attributes;
    for (var d = fromNodeAttrs.length - 1; d >= 0; d--) {
      attr = fromNodeAttrs[d];
      attrName = attr.name;
      attrNamespaceURI = attr.namespaceURI;
      if (attrNamespaceURI) {
        attrName = attr.localName || attrName;
        if (!toNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          fromNode.removeAttributeNS(attrNamespaceURI, attrName);
        }
      } else {
        if (!toNode.hasAttribute(attrName)) {
          fromNode.removeAttribute(attrName);
        }
      }
    }
  }
  var range;
  var NS_XHTML = "http://www.w3.org/1999/xhtml";
  var doc = typeof document === "undefined" ? void 0 : document;
  var HAS_TEMPLATE_SUPPORT = !!doc && "content" in doc.createElement("template");
  var HAS_RANGE_SUPPORT = !!doc && doc.createRange && "createContextualFragment" in doc.createRange();
  function createFragmentFromTemplate(str) {
    var template3 = doc.createElement("template");
    template3.innerHTML = str;
    return template3.content.childNodes[0];
  }
  function createFragmentFromRange(str) {
    if (!range) {
      range = doc.createRange();
      range.selectNode(doc.body);
    }
    var fragment = range.createContextualFragment(str);
    return fragment.childNodes[0];
  }
  function createFragmentFromWrap(str) {
    var fragment = doc.createElement("body");
    fragment.innerHTML = str;
    return fragment.childNodes[0];
  }
  function toElement(str) {
    str = str.trim();
    if (HAS_TEMPLATE_SUPPORT) {
      return createFragmentFromTemplate(str);
    } else if (HAS_RANGE_SUPPORT) {
      return createFragmentFromRange(str);
    }
    return createFragmentFromWrap(str);
  }
  function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;
    var fromCodeStart, toCodeStart;
    if (fromNodeName === toNodeName) {
      return true;
    }
    fromCodeStart = fromNodeName.charCodeAt(0);
    toCodeStart = toNodeName.charCodeAt(0);
    if (fromCodeStart <= 90 && toCodeStart >= 97) {
      return fromNodeName === toNodeName.toUpperCase();
    } else if (toCodeStart <= 90 && fromCodeStart >= 97) {
      return toNodeName === fromNodeName.toUpperCase();
    } else {
      return false;
    }
  }
  function createElementNS(name4, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ? doc.createElement(name4) : doc.createElementNS(namespaceURI, name4);
  }
  function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
      var nextChild = curChild.nextSibling;
      toEl.appendChild(curChild);
      curChild = nextChild;
    }
    return toEl;
  }
  function syncBooleanAttrProp(fromEl, toEl, name4) {
    if (fromEl[name4] !== toEl[name4]) {
      fromEl[name4] = toEl[name4];
      if (fromEl[name4]) {
        fromEl.setAttribute(name4, "");
      } else {
        fromEl.removeAttribute(name4);
      }
    }
  }
  var specialElHandlers = {
    OPTION: function(fromEl, toEl) {
      var parentNode = fromEl.parentNode;
      if (parentNode) {
        var parentName = parentNode.nodeName.toUpperCase();
        if (parentName === "OPTGROUP") {
          parentNode = parentNode.parentNode;
          parentName = parentNode && parentNode.nodeName.toUpperCase();
        }
        if (parentName === "SELECT" && !parentNode.hasAttribute("multiple")) {
          if (fromEl.hasAttribute("selected") && !toEl.selected) {
            fromEl.setAttribute("selected", "selected");
            fromEl.removeAttribute("selected");
          }
          parentNode.selectedIndex = -1;
        }
      }
      syncBooleanAttrProp(fromEl, toEl, "selected");
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
      syncBooleanAttrProp(fromEl, toEl, "checked");
      syncBooleanAttrProp(fromEl, toEl, "disabled");
      if (fromEl.value !== toEl.value) {
        fromEl.value = toEl.value;
      }
      if (!toEl.hasAttribute("value")) {
        fromEl.removeAttribute("value");
      }
    },
    TEXTAREA: function(fromEl, toEl) {
      var newValue = toEl.value;
      if (fromEl.value !== newValue) {
        fromEl.value = newValue;
      }
      var firstChild = fromEl.firstChild;
      if (firstChild) {
        var oldValue = firstChild.nodeValue;
        if (oldValue == newValue || !newValue && oldValue == fromEl.placeholder) {
          return;
        }
        firstChild.nodeValue = newValue;
      }
    },
    SELECT: function(fromEl, toEl) {
      if (!toEl.hasAttribute("multiple")) {
        var selectedIndex = -1;
        var i = 0;
        var curChild = fromEl.firstChild;
        var optgroup;
        var nodeName;
        while (curChild) {
          nodeName = curChild.nodeName && curChild.nodeName.toUpperCase();
          if (nodeName === "OPTGROUP") {
            optgroup = curChild;
            curChild = optgroup.firstChild;
          } else {
            if (nodeName === "OPTION") {
              if (curChild.hasAttribute("selected")) {
                selectedIndex = i;
                break;
              }
              i++;
            }
            curChild = curChild.nextSibling;
            if (!curChild && optgroup) {
              curChild = optgroup.nextSibling;
              optgroup = null;
            }
          }
        }
        fromEl.selectedIndex = selectedIndex;
      }
    }
  };
  var ELEMENT_NODE = 1;
  var DOCUMENT_FRAGMENT_NODE$1 = 11;
  var TEXT_NODE = 3;
  var COMMENT_NODE = 8;
  function noop() {
  }
  function defaultGetNodeKey(node) {
    if (node) {
      return node.getAttribute && node.getAttribute("id") || node.id;
    }
  }
  function morphdomFactory(morphAttrs2) {
    return function morphdom2(fromNode, toNode, options) {
      if (!options) {
        options = {};
      }
      if (typeof toNode === "string") {
        if (fromNode.nodeName === "#document" || fromNode.nodeName === "HTML" || fromNode.nodeName === "BODY") {
          var toNodeHtml = toNode;
          toNode = doc.createElement("html");
          toNode.innerHTML = toNodeHtml;
        } else {
          toNode = toElement(toNode);
        }
      }
      var getNodeKey = options.getNodeKey || defaultGetNodeKey;
      var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
      var onNodeAdded = options.onNodeAdded || noop;
      var onBeforeElUpdated = options.onBeforeElUpdated || noop;
      var onElUpdated = options.onElUpdated || noop;
      var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
      var onNodeDiscarded = options.onNodeDiscarded || noop;
      var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
      var childrenOnly = options.childrenOnly === true;
      var fromNodesLookup = /* @__PURE__ */ Object.create(null);
      var keyedRemovalList = [];
      function addKeyedRemoval(key) {
        keyedRemovalList.push(key);
      }
      function walkDiscardedChildNodes(node, skipKeyedNodes) {
        if (node.nodeType === ELEMENT_NODE) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = void 0;
            if (skipKeyedNodes && (key = getNodeKey(curChild))) {
              addKeyedRemoval(key);
            } else {
              onNodeDiscarded(curChild);
              if (curChild.firstChild) {
                walkDiscardedChildNodes(curChild, skipKeyedNodes);
              }
            }
            curChild = curChild.nextSibling;
          }
        }
      }
      function removeNode(node, parentNode, skipKeyedNodes) {
        if (onBeforeNodeDiscarded(node) === false) {
          return;
        }
        if (parentNode) {
          parentNode.removeChild(node);
        }
        onNodeDiscarded(node);
        walkDiscardedChildNodes(node, skipKeyedNodes);
      }
      function indexTree(node) {
        if (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE$1) {
          var curChild = node.firstChild;
          while (curChild) {
            var key = getNodeKey(curChild);
            if (key) {
              fromNodesLookup[key] = curChild;
            }
            indexTree(curChild);
            curChild = curChild.nextSibling;
          }
        }
      }
      indexTree(fromNode);
      function handleNodeAdded(el) {
        onNodeAdded(el);
        var curChild = el.firstChild;
        while (curChild) {
          var nextSibling = curChild.nextSibling;
          var key = getNodeKey(curChild);
          if (key) {
            var unmatchedFromEl = fromNodesLookup[key];
            if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
              curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
              morphEl(unmatchedFromEl, curChild);
            } else {
              handleNodeAdded(curChild);
            }
          } else {
            handleNodeAdded(curChild);
          }
          curChild = nextSibling;
        }
      }
      function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
        while (curFromNodeChild) {
          var fromNextSibling = curFromNodeChild.nextSibling;
          if (curFromNodeKey = getNodeKey(curFromNodeChild)) {
            addKeyedRemoval(curFromNodeKey);
          } else {
            removeNode(
              curFromNodeChild,
              fromEl,
              true
              /* skip keyed nodes */
            );
          }
          curFromNodeChild = fromNextSibling;
        }
      }
      function morphEl(fromEl, toEl, childrenOnly2) {
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
          delete fromNodesLookup[toElKey];
        }
        if (!childrenOnly2) {
          if (onBeforeElUpdated(fromEl, toEl) === false) {
            return;
          }
          morphAttrs2(fromEl, toEl);
          onElUpdated(fromEl);
          if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
            return;
          }
        }
        if (fromEl.nodeName !== "TEXTAREA") {
          morphChildren(fromEl, toEl);
        } else {
          specialElHandlers.TEXTAREA(fromEl, toEl);
        }
      }
      function morphChildren(fromEl, toEl) {
        var curToNodeChild = toEl.firstChild;
        var curFromNodeChild = fromEl.firstChild;
        var curToNodeKey;
        var curFromNodeKey;
        var fromNextSibling;
        var toNextSibling;
        var matchingFromEl;
        outer: while (curToNodeChild) {
          toNextSibling = curToNodeChild.nextSibling;
          curToNodeKey = getNodeKey(curToNodeChild);
          while (curFromNodeChild) {
            fromNextSibling = curFromNodeChild.nextSibling;
            if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            curFromNodeKey = getNodeKey(curFromNodeChild);
            var curFromNodeType = curFromNodeChild.nodeType;
            var isCompatible = void 0;
            if (curFromNodeType === curToNodeChild.nodeType) {
              if (curFromNodeType === ELEMENT_NODE) {
                if (curToNodeKey) {
                  if (curToNodeKey !== curFromNodeKey) {
                    if (matchingFromEl = fromNodesLookup[curToNodeKey]) {
                      if (fromNextSibling === matchingFromEl) {
                        isCompatible = false;
                      } else {
                        fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                        if (curFromNodeKey) {
                          addKeyedRemoval(curFromNodeKey);
                        } else {
                          removeNode(
                            curFromNodeChild,
                            fromEl,
                            true
                            /* skip keyed nodes */
                          );
                        }
                        curFromNodeChild = matchingFromEl;
                      }
                    } else {
                      isCompatible = false;
                    }
                  }
                } else if (curFromNodeKey) {
                  isCompatible = false;
                }
                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                if (isCompatible) {
                  morphEl(curFromNodeChild, curToNodeChild);
                }
              } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                isCompatible = true;
                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                  curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                }
              }
            }
            if (isCompatible) {
              curToNodeChild = toNextSibling;
              curFromNodeChild = fromNextSibling;
              continue outer;
            }
            if (curFromNodeKey) {
              addKeyedRemoval(curFromNodeKey);
            } else {
              removeNode(
                curFromNodeChild,
                fromEl,
                true
                /* skip keyed nodes */
              );
            }
            curFromNodeChild = fromNextSibling;
          }
          if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
            fromEl.appendChild(matchingFromEl);
            morphEl(matchingFromEl, curToNodeChild);
          } else {
            var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
            if (onBeforeNodeAddedResult !== false) {
              if (onBeforeNodeAddedResult) {
                curToNodeChild = onBeforeNodeAddedResult;
              }
              if (curToNodeChild.actualize) {
                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
              }
              fromEl.appendChild(curToNodeChild);
              handleNodeAdded(curToNodeChild);
            }
          }
          curToNodeChild = toNextSibling;
          curFromNodeChild = fromNextSibling;
        }
        cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
        var specialElHandler = specialElHandlers[fromEl.nodeName];
        if (specialElHandler) {
          specialElHandler(fromEl, toEl);
        }
      }
      var morphedNode = fromNode;
      var morphedNodeType = morphedNode.nodeType;
      var toNodeType = toNode.nodeType;
      if (!childrenOnly) {
        if (morphedNodeType === ELEMENT_NODE) {
          if (toNodeType === ELEMENT_NODE) {
            if (!compareNodeNames(fromNode, toNode)) {
              onNodeDiscarded(fromNode);
              morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
            }
          } else {
            morphedNode = toNode;
          }
        } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) {
          if (toNodeType === morphedNodeType) {
            if (morphedNode.nodeValue !== toNode.nodeValue) {
              morphedNode.nodeValue = toNode.nodeValue;
            }
            return morphedNode;
          } else {
            morphedNode = toNode;
          }
        }
      }
      if (morphedNode === toNode) {
        onNodeDiscarded(fromNode);
      } else {
        if (toNode.isSameNode && toNode.isSameNode(morphedNode)) {
          return;
        }
        morphEl(morphedNode, toNode, childrenOnly);
        if (keyedRemovalList) {
          for (var i = 0, len = keyedRemovalList.length; i < len; i++) {
            var elToRemove = fromNodesLookup[keyedRemovalList[i]];
            if (elToRemove) {
              removeNode(elToRemove, elToRemove.parentNode, false);
            }
          }
        }
      }
      if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
        if (morphedNode.actualize) {
          morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
        }
        fromNode.parentNode.replaceChild(morphedNode, fromNode);
      }
      return morphedNode;
    };
  }
  var morphdom = morphdomFactory(morphAttrs);
  var morphdom_esm_default = morphdom;

  // ../../node_modules/cable_ready/dist/cable_ready.js
  var name = "cable_ready";
  var version = "5.0.5";
  var description = "CableReady helps you create great real-time user experiences by making it simple to trigger client-side DOM changes from server-side Ruby.";
  var keywords = ["ruby", "rails", "websockets", "actioncable", "cable", "ssr", "stimulus_reflex", "client-side", "dom"];
  var homepage = "https://cableready.stimulusreflex.com";
  var bugs = "https://github.com/stimulusreflex/cable_ready/issues";
  var repository = "https://github.com/stimulusreflex/cable_ready";
  var license = "MIT";
  var author = "Nathan Hopkins <natehop@gmail.com>";
  var contributors = ["Andrew Mason <andrewmcodes@protonmail.com>", "Julian Rubisch <julian@julianrubisch.at>", "Marco Roth <marco.roth@intergga.ch>", "Nathan Hopkins <natehop@gmail.com>"];
  var main = "./dist/cable_ready.js";
  var module = "./dist/cable_ready.js";
  var browser = "./dist/cable_ready.js";
  var unpkg = "./dist/cable_ready.umd.js";
  var umd = "./dist/cable_ready.umd.js";
  var files = ["dist/*", "javascript/*"];
  var scripts = {
    lint: "yarn run format --check",
    format: "yarn run prettier-standard ./javascript/**/*.js rollup.config.mjs",
    build: "yarn rollup -c",
    watch: "yarn rollup -wc",
    test: "web-test-runner javascript/test/**/*.test.js",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs && cp ./docs/_redirects ./docs/.vitepress/dist",
    "docs:preview": "vitepress preview docs"
  };
  var dependencies = {
    morphdom: "2.6.1"
  };
  var devDependencies = {
    "@open-wc/testing": "^3.1.7",
    "@rollup/plugin-json": "^6.0.0",
    "@rollup/plugin-node-resolve": "^15.0.1",
    "@rollup/plugin-terser": "^0.4.0",
    "@web/dev-server-esbuild": "^0.3.3",
    "@web/dev-server-rollup": "^0.3.21",
    "@web/test-runner": "^0.15.1",
    "prettier-standard": "^16.4.1",
    rollup: "^3.19.1",
    sinon: "^15.0.2",
    vite: "^4.1.4",
    vitepress: "^1.0.0-beta.1",
    "vitepress-plugin-search": "^1.0.4-alpha.19"
  };
  var packageInfo = {
    name,
    version,
    description,
    keywords,
    homepage,
    bugs,
    repository,
    license,
    author,
    contributors,
    main,
    module,
    browser,
    import: "./dist/cable_ready.js",
    unpkg,
    umd,
    files,
    scripts,
    dependencies,
    devDependencies
  };
  var inputTags = {
    INPUT: true,
    TEXTAREA: true,
    SELECT: true
  };
  var mutableTags = {
    INPUT: true,
    TEXTAREA: true,
    OPTION: true
  };
  var textInputTypes = {
    "datetime-local": true,
    "select-multiple": true,
    "select-one": true,
    color: true,
    date: true,
    datetime: true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    textarea: true,
    time: true,
    url: true,
    week: true
  };
  var activeElement;
  var ActiveElement = {
    get element() {
      return activeElement;
    },
    set(element) {
      activeElement = element;
    }
  };
  var isTextInput = (element) => inputTags[element.tagName] && textInputTypes[element.type];
  var assignFocus = (selector) => {
    const element = selector && selector.nodeType === Node.ELEMENT_NODE ? selector : document.querySelector(selector);
    const focusElement = element || ActiveElement.element;
    if (focusElement && focusElement.focus) focusElement.focus();
  };
  var dispatch2 = (element, name4, detail = {}) => {
    const init = {
      bubbles: true,
      cancelable: true,
      detail
    };
    const event = new CustomEvent(name4, init);
    element.dispatchEvent(event);
    if (window.jQuery) window.jQuery(element).trigger(name4, detail);
  };
  var xpathToElement = (xpath) => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  var xpathToElementArray = (xpath, reverse = false) => {
    const snapshotList = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const snapshots = [];
    for (let i = 0; i < snapshotList.snapshotLength; i++) {
      snapshots.push(snapshotList.snapshotItem(i));
    }
    return reverse ? snapshots.reverse() : snapshots;
  };
  var getClassNames = (names) => Array.from(names).flat();
  var processElements = (operation, callback) => {
    Array.from(operation.selectAll ? operation.element : [operation.element]).forEach(callback);
  };
  var kebabize = createCompounder(function(result, word, index) {
    return result + (index ? "-" : "") + word.toLowerCase();
  });
  function createCompounder(callback) {
    return function(str) {
      return words(str).reduce(callback, "");
    };
  }
  var words = (str) => {
    str = str == null ? "" : str;
    return str.match(/([A-Z]{2,}|[0-9]+|[A-Z]?[a-z]+|[A-Z])/g) || [];
  };
  var operate = (operation, callback) => {
    if (!operation.cancel) {
      operation.delay ? setTimeout(callback, operation.delay) : callback();
      return true;
    }
    return false;
  };
  var before = (target, operation) => dispatch2(target, `cable-ready:before-${kebabize(operation.operation)}`, operation);
  var after = (target, operation) => dispatch2(target, `cable-ready:after-${kebabize(operation.operation)}`, operation);
  function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
      const callback = () => fn.apply(this, args);
      if (timer) clearTimeout(timer);
      timer = setTimeout(callback, delay);
    };
  }
  function handleErrors(response3) {
    if (!response3.ok) throw Error(response3.statusText);
    return response3;
  }
  function safeScalar(val) {
    if (val !== void 0 && !["string", "number", "boolean"].includes(typeof val)) console.warn(`Operation expects a string, number or boolean, but got ${val} (${typeof val})`);
    return val != null ? val : "";
  }
  function safeString(str) {
    if (str !== void 0 && typeof str !== "string") console.warn(`Operation expects a string, but got ${str} (${typeof str})`);
    return str != null ? String(str) : "";
  }
  function safeArray(arr) {
    if (arr !== void 0 && !Array.isArray(arr)) console.warn(`Operation expects an array, but got ${arr} (${typeof arr})`);
    return arr != null ? Array.from(arr) : [];
  }
  function safeObject(obj) {
    if (obj !== void 0 && typeof obj !== "object") console.warn(`Operation expects an object, but got ${obj} (${typeof obj})`);
    return obj != null ? Object(obj) : {};
  }
  function safeStringOrArray(elem) {
    if (elem !== void 0 && !Array.isArray(elem) && typeof elem !== "string") console.warn(`Operation expects an Array or a String, but got ${elem} (${typeof elem})`);
    return elem == null ? "" : Array.isArray(elem) ? Array.from(elem) : String(elem);
  }
  function fragmentToString(fragment) {
    return new XMLSerializer().serializeToString(fragment);
  }
  async function graciouslyFetch(url, additionalHeaders) {
    try {
      const response3 = await fetch(url, {
        headers: {
          "X-REQUESTED-WITH": "XmlHttpRequest",
          ...additionalHeaders
        }
      });
      if (response3 == void 0) return;
      handleErrors(response3);
      return response3;
    } catch (e) {
      console.error(`Could not fetch ${url}`);
    }
  }
  var BoundedQueue = class {
    constructor(maxSize) {
      this.maxSize = maxSize;
      this.queue = [];
    }
    push(item) {
      if (this.isFull()) {
        this.shift();
      }
      this.queue.push(item);
    }
    shift() {
      return this.queue.shift();
    }
    isFull() {
      return this.queue.length === this.maxSize;
    }
  };
  var utils = Object.freeze({
    __proto__: null,
    BoundedQueue,
    after,
    assignFocus,
    before,
    debounce,
    dispatch: dispatch2,
    fragmentToString,
    getClassNames,
    graciouslyFetch,
    handleErrors,
    isTextInput,
    kebabize,
    operate,
    processElements,
    safeArray,
    safeObject,
    safeScalar,
    safeString,
    safeStringOrArray,
    xpathToElement,
    xpathToElementArray
  });
  var shouldMorph = (operation) => (fromEl, toEl) => !shouldMorphCallbacks.map((callback) => typeof callback === "function" ? callback(operation, fromEl, toEl) : true).includes(false);
  var didMorph = (operation) => (el) => {
    didMorphCallbacks.forEach((callback) => {
      if (typeof callback === "function") callback(operation, el);
    });
  };
  var verifyNotMutable = (detail, fromEl, toEl) => {
    if (!mutableTags[fromEl.tagName] && fromEl.isEqualNode(toEl)) return false;
    return true;
  };
  var verifyNotContentEditable = (detail, fromEl, toEl) => {
    if (fromEl === ActiveElement.element && fromEl.isContentEditable) return false;
    return true;
  };
  var verifyNotPermanent = (detail, fromEl, toEl) => {
    const { permanentAttributeName } = detail;
    if (!permanentAttributeName) return true;
    const permanent = fromEl.closest(`[${permanentAttributeName}]`);
    if (!permanent && fromEl === ActiveElement.element && isTextInput(fromEl)) {
      const ignore = {
        value: true
      };
      Array.from(toEl.attributes).forEach((attribute) => {
        if (!ignore[attribute.name]) fromEl.setAttribute(attribute.name, attribute.value);
      });
      return false;
    }
    return !permanent;
  };
  var shouldMorphCallbacks = [verifyNotMutable, verifyNotPermanent, verifyNotContentEditable];
  var didMorphCallbacks = [];
  var morph_callbacks = Object.freeze({
    __proto__: null,
    didMorph,
    didMorphCallbacks,
    shouldMorph,
    shouldMorphCallbacks,
    verifyNotContentEditable,
    verifyNotMutable,
    verifyNotPermanent
  });
  var Operations = {
    // DOM Mutations
    append: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.insertAdjacentHTML("beforeend", safeScalar(html));
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    graft: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { parent, focusSelector } = operation;
          const parentElement = document.querySelector(parent);
          if (parentElement) {
            parentElement.appendChild(element);
            assignFocus(focusSelector);
          }
        });
        after(element, operation);
      });
    },
    innerHtml: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.innerHTML = safeScalar(html);
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    insertAdjacentHtml: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { html, position, focusSelector } = operation;
          element.insertAdjacentHTML(position || "beforeend", safeScalar(html));
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    insertAdjacentText: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { text, position, focusSelector } = operation;
          element.insertAdjacentText(position || "beforeend", safeScalar(text));
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    outerHtml: (operation) => {
      processElements(operation, (element) => {
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.outerHTML = safeScalar(html);
          assignFocus(focusSelector);
        });
        after(parent ? parent.children[idx] : document.documentElement, operation);
      });
    },
    prepend: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.insertAdjacentHTML("afterbegin", safeScalar(html));
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    remove: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { focusSelector } = operation;
          element.remove();
          assignFocus(focusSelector);
        });
        after(document, operation);
      });
    },
    replace: (operation) => {
      processElements(operation, (element) => {
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before(element, operation);
        operate(operation, () => {
          const { html, focusSelector } = operation;
          element.outerHTML = safeScalar(html);
          assignFocus(focusSelector);
        });
        after(parent ? parent.children[idx] : document.documentElement, operation);
      });
    },
    textContent: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { text, focusSelector } = operation;
          element.textContent = safeScalar(text);
          assignFocus(focusSelector);
        });
        after(element, operation);
      });
    },
    // Element Property Mutations
    addCssClass: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name4 } = operation;
          element.classList.add(...getClassNames([safeStringOrArray(name4)]));
        });
        after(element, operation);
      });
    },
    removeAttribute: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name4 } = operation;
          element.removeAttribute(safeString(name4));
        });
        after(element, operation);
      });
    },
    removeCssClass: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name4 } = operation;
          element.classList.remove(...getClassNames([safeStringOrArray(name4)]));
          if (element.classList.length === 0) element.removeAttribute("class");
        });
        after(element, operation);
      });
    },
    setAttribute: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name4, value } = operation;
          element.setAttribute(safeString(name4), safeScalar(value));
        });
        after(element, operation);
      });
    },
    setDatasetProperty: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name4, value } = operation;
          element.dataset[safeString(name4)] = safeScalar(value);
        });
        after(element, operation);
      });
    },
    setProperty: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name4, value } = operation;
          if (name4 in element) element[safeString(name4)] = safeScalar(value);
        });
        after(element, operation);
      });
    },
    setStyle: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name4, value } = operation;
          element.style[safeString(name4)] = safeScalar(value);
        });
        after(element, operation);
      });
    },
    setStyles: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { styles } = operation;
          for (let [name4, value] of Object.entries(styles)) element.style[safeString(name4)] = safeScalar(value);
        });
        after(element, operation);
      });
    },
    setValue: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { value } = operation;
          element.value = safeScalar(value);
        });
        after(element, operation);
      });
    },
    // DOM Events and Meta-Operations
    dispatchEvent: (operation) => {
      processElements(operation, (element) => {
        before(element, operation);
        operate(operation, () => {
          const { name: name4, detail } = operation;
          dispatch2(element, safeString(name4), safeObject(detail));
        });
        after(element, operation);
      });
    },
    setMeta: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { name: name4, content } = operation;
        let meta = document.head.querySelector(`meta[name='${name4}']`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = safeString(name4);
          document.head.appendChild(meta);
        }
        meta.content = safeScalar(content);
      });
      after(document, operation);
    },
    setTitle: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { title } = operation;
        document.title = safeScalar(title);
      });
      after(document, operation);
    },
    // Browser Manipulations
    clearStorage: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.clear();
      });
      after(document, operation);
    },
    go: (operation) => {
      before(window, operation);
      operate(operation, () => {
        const { delta } = operation;
        history.go(delta);
      });
      after(window, operation);
    },
    pushState: (operation) => {
      before(window, operation);
      operate(operation, () => {
        const { state, title, url } = operation;
        history.pushState(safeObject(state), safeString(title), safeString(url));
      });
      after(window, operation);
    },
    redirectTo: (operation) => {
      before(window, operation);
      operate(operation, () => {
        let { url, action, turbo } = operation;
        action = action || "advance";
        url = safeString(url);
        if (turbo === void 0) turbo = true;
        if (turbo) {
          if (window.Turbo) window.Turbo.visit(url, {
            action
          });
          if (window.Turbolinks) window.Turbolinks.visit(url, {
            action
          });
          if (!window.Turbo && !window.Turbolinks) window.location.href = url;
        } else {
          window.location.href = url;
        }
      });
      after(window, operation);
    },
    reload: (operation) => {
      before(window, operation);
      operate(operation, () => {
        window.location.reload();
      });
      after(window, operation);
    },
    removeStorageItem: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { key, type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.removeItem(safeString(key));
      });
      after(document, operation);
    },
    replaceState: (operation) => {
      before(window, operation);
      operate(operation, () => {
        const { state, title, url } = operation;
        history.replaceState(safeObject(state), safeString(title), safeString(url));
      });
      after(window, operation);
    },
    scrollIntoView: (operation) => {
      const { element } = operation;
      before(element, operation);
      operate(operation, () => {
        element.scrollIntoView(operation);
      });
      after(element, operation);
    },
    setCookie: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { cookie } = operation;
        document.cookie = safeScalar(cookie);
      });
      after(document, operation);
    },
    setFocus: (operation) => {
      const { element } = operation;
      before(element, operation);
      operate(operation, () => {
        assignFocus(element);
      });
      after(element, operation);
    },
    setStorageItem: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { key, value, type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.setItem(safeString(key), safeScalar(value));
      });
      after(document, operation);
    },
    // Notifications
    consoleLog: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { message, level } = operation;
        level && ["warn", "info", "error"].includes(level) ? console[level](message) : console.log(message);
      });
      after(document, operation);
    },
    consoleTable: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { data, columns } = operation;
        console.table(data, safeArray(columns));
      });
      after(document, operation);
    },
    notification: (operation) => {
      before(document, operation);
      operate(operation, () => {
        const { title, options } = operation;
        Notification.requestPermission().then((result) => {
          operation.permission = result;
          if (result === "granted") new Notification(safeString(title), safeObject(options));
        });
      });
      after(document, operation);
    },
    // Morph operations
    morph: (operation) => {
      processElements(operation, (element) => {
        const { html } = operation;
        const template3 = document.createElement("template");
        template3.innerHTML = String(safeScalar(html)).trim();
        operation.content = template3.content;
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before(element, operation);
        operate(operation, () => {
          const { childrenOnly, focusSelector } = operation;
          morphdom_esm_default(element, childrenOnly ? template3.content : template3.innerHTML, {
            childrenOnly: !!childrenOnly,
            onBeforeElUpdated: shouldMorph(operation),
            onElUpdated: didMorph(operation)
          });
          assignFocus(focusSelector);
        });
        after(parent ? parent.children[idx] : document.documentElement, operation);
      });
    }
  };
  var operations = Operations;
  var add = (newOperations) => {
    operations = {
      ...operations,
      ...newOperations
    };
  };
  var addOperations = (operations3) => {
    add(operations3);
  };
  var addOperation = (name4, operation) => {
    const operations3 = {};
    operations3[name4] = operation;
    add(operations3);
  };
  var OperationStore = {
    get all() {
      return operations;
    }
  };
  var missingElement = "warn";
  var MissingElement$1 = {
    get behavior() {
      return missingElement;
    },
    set(value) {
      if (["warn", "ignore", "event", "exception"].includes(value)) missingElement = value;
      else console.warn("Invalid 'onMissingElement' option. Defaulting to 'warn'.");
    }
  };
  var perform = (operations3, options = {
    onMissingElement: MissingElement$1.behavior
  }) => {
    const batches = {};
    operations3.forEach((operation) => {
      if (!!operation.batch) batches[operation.batch] = batches[operation.batch] ? ++batches[operation.batch] : 1;
    });
    operations3.forEach((operation) => {
      const name4 = operation.operation;
      try {
        if (operation.selector) {
          if (operation.xpath) {
            operation.element = operation.selectAll ? xpathToElementArray(operation.selector) : xpathToElement(operation.selector);
          } else {
            operation.element = operation.selectAll ? document.querySelectorAll(operation.selector) : document.querySelector(operation.selector);
          }
        } else {
          operation.element = document;
        }
        if (operation.element || options.onMissingElement !== "ignore") {
          ActiveElement.set(document.activeElement);
          const cableReadyOperation = OperationStore.all[name4];
          if (cableReadyOperation) {
            cableReadyOperation(operation);
            if (!!operation.batch && --batches[operation.batch] === 0) dispatch2(document, "cable-ready:batch-complete", {
              batch: operation.batch
            });
          } else {
            console.error(`CableReady couldn't find the "${name4}" operation. Make sure you use the camelized form when calling an operation method.`);
          }
        }
      } catch (e) {
        if (operation.element) {
          console.error(`CableReady detected an error in ${name4 || "operation"}: ${e.message}. If you need to support older browsers make sure you've included the corresponding polyfills. https://docs.stimulusreflex.com/setup#polyfills-for-ie11.`);
          console.error(e);
        } else {
          const warning = `CableReady ${name4 || ""} operation failed due to missing DOM element for selector: '${operation.selector}'`;
          switch (options.onMissingElement) {
            case "ignore":
              break;
            case "event":
              dispatch2(document, "cable-ready:missing-element", {
                warning,
                operation
              });
              break;
            case "exception":
              throw warning;
            default:
              console.warn(warning);
          }
        }
      }
    });
  };
  var performAsync = (operations3, options = {
    onMissingElement: MissingElement$1.behavior
  }) => new Promise((resolve, reject) => {
    try {
      resolve(perform(operations3, options));
    } catch (err) {
      reject(err);
    }
  });
  var SubscribingElement = class extends HTMLElement {
    static get tagName() {
      throw new Error("Implement the tagName() getter in the inheriting class");
    }
    static define() {
      if (!customElements.get(this.tagName)) {
        customElements.define(this.tagName, this);
      }
    }
    disconnectedCallback() {
      if (this.channel) this.channel.unsubscribe();
    }
    createSubscription(consumer5, channel, receivedCallback) {
      this.channel = consumer5.subscriptions.create({
        channel,
        identifier: this.identifier
      }, {
        received: receivedCallback
      });
    }
    get preview() {
      return document.documentElement.hasAttribute("data-turbolinks-preview") || document.documentElement.hasAttribute("data-turbo-preview");
    }
    get identifier() {
      return this.getAttribute("identifier");
    }
  };
  var consumer2;
  var BACKOFF = [25, 50, 75, 100, 200, 250, 500, 800, 1e3, 2e3];
  var wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var getConsumerWithRetry = async (retry = 0) => {
    if (consumer2) return consumer2;
    if (retry >= BACKOFF.length) {
      throw new Error("Couldn't obtain a Action Cable consumer within 5s");
    }
    await wait(BACKOFF[retry]);
    return await getConsumerWithRetry(retry + 1);
  };
  var CableConsumer = {
    setConsumer(value) {
      consumer2 = value;
    },
    get consumer() {
      return consumer2;
    },
    async getConsumer() {
      return await getConsumerWithRetry();
    }
  };
  var StreamFromElement = class extends SubscribingElement {
    static get tagName() {
      return "cable-ready-stream-from";
    }
    async connectedCallback() {
      if (this.preview) return;
      const consumer5 = await CableConsumer.getConsumer();
      if (consumer5) {
        this.createSubscription(consumer5, "CableReady::Stream", this.performOperations.bind(this));
      } else {
        console.error("The `cable_ready_stream_from` helper cannot connect. You must initialize CableReady with an Action Cable consumer.");
      }
    }
    performOperations(data) {
      if (data.cableReady) perform(data.operations, {
        onMissingElement: this.onMissingElement
      });
    }
    get onMissingElement() {
      const value = this.getAttribute("missing") || MissingElement$1.behavior;
      if (["warn", "ignore", "event"].includes(value)) return value;
      else {
        console.warn("Invalid 'missing' attribute. Defaulting to 'warn'.");
        return "warn";
      }
    }
  };
  var debugging = false;
  var Debug2 = {
    get enabled() {
      return debugging;
    },
    get disabled() {
      return !debugging;
    },
    get value() {
      return debugging;
    },
    set(value) {
      debugging = !!value;
    },
    set debug(value) {
      debugging = !!value;
    }
  };
  var request = (data, blocks) => {
    if (Debug2.disabled) return;
    const message = `\u2191 Updatable request affecting ${blocks.length} element(s): `;
    console.log(message, {
      elements: blocks.map((b) => b.element),
      identifiers: blocks.map((b) => b.element.getAttribute("identifier")),
      data
    });
    return message;
  };
  var cancel = (timestamp, reason) => {
    if (Debug2.disabled) return;
    const duration2 = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u274C Updatable request canceled after ${duration2}ms: ${reason}`;
    console.log(message);
    return message;
  };
  var response = (timestamp, element, urls) => {
    if (Debug2.disabled) return;
    const duration2 = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u2193 Updatable response: All URLs fetched in ${duration2}ms`;
    console.log(message, {
      element,
      urls
    });
    return message;
  };
  var morphStart = (timestamp, element) => {
    if (Debug2.disabled) return;
    const duration2 = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u21BB Updatable morph: starting after ${duration2}ms`;
    console.log(message, {
      element
    });
    return message;
  };
  var morphEnd = (timestamp, element) => {
    if (Debug2.disabled) return;
    const duration2 = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u21BA Updatable morph: completed after ${duration2}ms`;
    console.log(message, {
      element
    });
    return message;
  };
  var Log = {
    request,
    cancel,
    response,
    morphStart,
    morphEnd
  };
  var AppearanceObserver2 = class {
    constructor(delegate, element = null) {
      this.delegate = delegate;
      this.element = element || delegate;
      this.started = false;
      this.intersecting = false;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
        this.observeVisibility();
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
        this.unobserveVisibility();
      }
    }
    observeVisibility = () => {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    };
    unobserveVisibility = () => {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    };
    intersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.target === this.element) {
          if (entry.isIntersecting && document.visibilityState === "visible") {
            this.intersecting = true;
            this.delegate.appearedInViewport();
          } else {
            this.intersecting = false;
            this.delegate.disappearedFromViewport();
          }
        }
      });
    };
    handleVisibilityChange = (event) => {
      if (document.visibilityState === "visible" && this.intersecting) {
        this.delegate.appearedInViewport();
      } else {
        this.delegate.disappearedFromViewport();
      }
    };
  };
  var template = `
<style>
  :host {
    display: block;
  }
</style>
<slot></slot>
`;
  var UpdatesForElement = class extends SubscribingElement {
    static get tagName() {
      return "cable-ready-updates-for";
    }
    constructor() {
      super();
      const shadowRoot = this.attachShadow({
        mode: "open"
      });
      shadowRoot.innerHTML = template;
      this.triggerElementLog = new BoundedQueue(10);
      this.targetElementLog = new BoundedQueue(10);
      this.appearanceObserver = new AppearanceObserver2(this);
      this.visible = false;
      this.didTransitionToVisible = false;
    }
    async connectedCallback() {
      if (this.preview) return;
      this.update = debounce(this.update.bind(this), this.debounce);
      const consumer5 = await CableConsumer.getConsumer();
      if (consumer5) {
        this.createSubscription(consumer5, "CableReady::Stream", this.update);
      } else {
        console.error("The `cable_ready_updates_for` helper cannot connect. You must initialize CableReady with an Action Cable consumer.");
      }
      if (this.observeAppearance) {
        this.appearanceObserver.start();
      }
    }
    disconnectedCallback() {
      if (this.observeAppearance) {
        this.appearanceObserver.stop();
      }
    }
    async update(data) {
      this.lastUpdateTimestamp = /* @__PURE__ */ new Date();
      const blocks = Array.from(document.querySelectorAll(this.query), (element) => new Block(element)).filter((block) => block.shouldUpdate(data));
      this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.request(data, blocks)}`);
      if (blocks.length === 0) {
        this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.cancel(this.lastUpdateTimestamp, "All elements filtered out")}`);
        return;
      }
      if (blocks[0].element !== this && !this.didTransitionToVisible) {
        this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.cancel(this.lastUpdateTimestamp, "Update already requested")}`);
        return;
      }
      ActiveElement.set(document.activeElement);
      this.html = {};
      const uniqueUrls = [...new Set(blocks.map((block) => block.url))];
      await Promise.all(uniqueUrls.map(async (url) => {
        if (!this.html.hasOwnProperty(url)) {
          const response3 = await graciouslyFetch(url, {
            "X-Cable-Ready": "update"
          });
          this.html[url] = await response3.text();
        }
      }));
      this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.response(this.lastUpdateTimestamp, this, uniqueUrls)}`);
      this.index = {};
      blocks.forEach((block) => {
        this.index.hasOwnProperty(block.url) ? this.index[block.url]++ : this.index[block.url] = 0;
        block.process(data, this.html, this.index, this.lastUpdateTimestamp);
      });
    }
    appearedInViewport() {
      if (!this.visible) {
        this.didTransitionToVisible = true;
        this.update({});
      }
      this.visible = true;
    }
    disappearedFromViewport() {
      this.visible = false;
    }
    get query() {
      return `${this.tagName}[identifier="${this.identifier}"]`;
    }
    get identifier() {
      return this.getAttribute("identifier");
    }
    get debounce() {
      return this.hasAttribute("debounce") ? parseInt(this.getAttribute("debounce")) : 20;
    }
    get observeAppearance() {
      return this.hasAttribute("observe-appearance");
    }
  };
  var Block = class {
    constructor(element) {
      this.element = element;
    }
    async process(data, html, fragmentsIndex, startTimestamp) {
      const blockIndex = fragmentsIndex[this.url];
      const template3 = document.createElement("template");
      this.element.setAttribute("updating", "updating");
      template3.innerHTML = String(html[this.url]).trim();
      await this.resolveTurboFrames(template3.content);
      const fragments = template3.content.querySelectorAll(this.query);
      if (fragments.length <= blockIndex) {
        console.warn(`Update aborted due to insufficient number of elements. The offending url is ${this.url}, the offending element is:`, this.element);
        return;
      }
      const operation = {
        element: this.element,
        html: fragments[blockIndex],
        permanentAttributeName: "data-ignore-updates"
      };
      dispatch2(this.element, "cable-ready:before-update", operation);
      this.element.targetElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.morphStart(startTimestamp, this.element)}`);
      morphdom_esm_default(this.element, fragments[blockIndex], {
        childrenOnly: true,
        onBeforeElUpdated: shouldMorph(operation),
        onElUpdated: (_) => {
          this.element.removeAttribute("updating");
          this.element.didTransitionToVisible = false;
          dispatch2(this.element, "cable-ready:after-update", operation);
          assignFocus(operation.focusSelector);
        }
      });
      this.element.targetElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log.morphEnd(startTimestamp, this.element)}`);
    }
    async resolveTurboFrames(documentFragment) {
      const reloadingTurboFrames = [...documentFragment.querySelectorAll('turbo-frame[src]:not([loading="lazy"])')];
      return Promise.all(reloadingTurboFrames.map((frame) => new Promise(async (resolve) => {
        const frameResponse = await graciouslyFetch(frame.getAttribute("src"), {
          "Turbo-Frame": frame.id,
          "X-Cable-Ready": "update"
        });
        const frameTemplate = document.createElement("template");
        frameTemplate.innerHTML = await frameResponse.text();
        await this.resolveTurboFrames(frameTemplate.content);
        const selector = `turbo-frame#${frame.id}`;
        const frameContent = frameTemplate.content.querySelector(selector);
        const content = frameContent ? frameContent.innerHTML.trim() : "";
        documentFragment.querySelector(selector).innerHTML = content;
        resolve();
      })));
    }
    shouldUpdate(data) {
      return !this.ignoresInnerUpdates && this.hasChangesSelectedForUpdate(data) && (!this.observeAppearance || this.visible);
    }
    hasChangesSelectedForUpdate(data) {
      const only = this.element.getAttribute("only");
      return !(only && data.changed && !only.split(" ").some((attribute) => data.changed.includes(attribute)));
    }
    get ignoresInnerUpdates() {
      return this.element.hasAttribute("ignore-inner-updates") && this.element.hasAttribute("performing-inner-update");
    }
    get url() {
      return this.element.hasAttribute("url") ? this.element.getAttribute("url") : location.href;
    }
    get identifier() {
      return this.element.identifier;
    }
    get query() {
      return this.element.query;
    }
    get visible() {
      return this.element.visible;
    }
    get observeAppearance() {
      return this.element.observeAppearance;
    }
  };
  var registerInnerUpdates = () => {
    document.addEventListener("stimulus-reflex:before", (event) => {
      recursiveMarkUpdatesForElements(event.detail.element);
    });
    document.addEventListener("stimulus-reflex:after", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements(event.detail.element);
      });
    });
    document.addEventListener("turbo:submit-start", (event) => {
      recursiveMarkUpdatesForElements(event.target);
    });
    document.addEventListener("turbo:submit-end", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements(event.target);
      });
    });
    document.addEventListener("turbo-boost:command:start", (event) => {
      recursiveMarkUpdatesForElements(event.target);
    });
    document.addEventListener("turbo-boost:command:finish", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements(event.target);
      });
    });
    document.addEventListener("turbo-boost:command:error", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements(event.target);
      });
    });
  };
  var recursiveMarkUpdatesForElements = (leaf) => {
    const closestUpdatesFor = leaf && leaf.parentElement && leaf.parentElement.closest("cable-ready-updates-for");
    if (closestUpdatesFor) {
      closestUpdatesFor.setAttribute("performing-inner-update", "");
      recursiveMarkUpdatesForElements(closestUpdatesFor);
    }
  };
  var recursiveUnmarkUpdatesForElements = (leaf) => {
    const closestUpdatesFor = leaf && leaf.parentElement && leaf.parentElement.closest("cable-ready-updates-for");
    if (closestUpdatesFor) {
      closestUpdatesFor.removeAttribute("performing-inner-update");
      recursiveUnmarkUpdatesForElements(closestUpdatesFor);
    }
  };
  var defineElements = () => {
    registerInnerUpdates();
    StreamFromElement.define();
    UpdatesForElement.define();
  };
  var initialize = (initializeOptions = {}) => {
    const { consumer: consumer5, onMissingElement, debug } = initializeOptions;
    Debug2.set(!!debug);
    if (consumer5) {
      CableConsumer.setConsumer(consumer5);
    } else {
      console.error("CableReady requires a reference to your Action Cable `consumer` for its helpers to function.\nEnsure that you have imported the `CableReady` package as well as `consumer` from your `channels` folder, then call `CableReady.initialize({ consumer })`.");
    }
    if (onMissingElement) {
      MissingElement.set(onMissingElement);
    }
    defineElements();
  };
  var global = {
    perform,
    performAsync,
    shouldMorphCallbacks,
    didMorphCallbacks,
    initialize,
    addOperation,
    addOperations,
    version: packageInfo.version,
    cable: CableConsumer,
    get DOMOperations() {
      console.warn("DEPRECATED: Please use `CableReady.operations` instead of `CableReady.DOMOperations`");
      return OperationStore.all;
    },
    get operations() {
      return OperationStore.all;
    },
    get consumer() {
      return CableConsumer.consumer;
    }
  };
  window.CableReady = global;

  // config/cable_ready.js
  global.initialize({ consumer: consumer_default });

  // ../../node_modules/@hotwired/stimulus/dist/stimulus.js
  var EventListener = class {
    constructor(eventTarget, eventName, eventOptions) {
      this.eventTarget = eventTarget;
      this.eventName = eventName;
      this.eventOptions = eventOptions;
      this.unorderedBindings = /* @__PURE__ */ new Set();
    }
    connect() {
      this.eventTarget.addEventListener(this.eventName, this, this.eventOptions);
    }
    disconnect() {
      this.eventTarget.removeEventListener(this.eventName, this, this.eventOptions);
    }
    bindingConnected(binding) {
      this.unorderedBindings.add(binding);
    }
    bindingDisconnected(binding) {
      this.unorderedBindings.delete(binding);
    }
    handleEvent(event) {
      const extendedEvent = extendEvent(event);
      for (const binding of this.bindings) {
        if (extendedEvent.immediatePropagationStopped) {
          break;
        } else {
          binding.handleEvent(extendedEvent);
        }
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((left, right) => {
        const leftIndex = left.index, rightIndex = right.index;
        return leftIndex < rightIndex ? -1 : leftIndex > rightIndex ? 1 : 0;
      });
    }
  };
  function extendEvent(event) {
    if ("immediatePropagationStopped" in event) {
      return event;
    } else {
      const { stopImmediatePropagation } = event;
      return Object.assign(event, {
        immediatePropagationStopped: false,
        stopImmediatePropagation() {
          this.immediatePropagationStopped = true;
          stopImmediatePropagation.call(this);
        }
      });
    }
  }
  var Dispatcher = class {
    constructor(application2) {
      this.application = application2;
      this.eventListenerMaps = /* @__PURE__ */ new Map();
      this.started = false;
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.eventListeners.forEach((eventListener) => eventListener.connect());
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.eventListeners.forEach((eventListener) => eventListener.disconnect());
      }
    }
    get eventListeners() {
      return Array.from(this.eventListenerMaps.values()).reduce((listeners, map) => listeners.concat(Array.from(map.values())), []);
    }
    bindingConnected(binding) {
      this.fetchEventListenerForBinding(binding).bindingConnected(binding);
    }
    bindingDisconnected(binding, clearEventListeners = false) {
      this.fetchEventListenerForBinding(binding).bindingDisconnected(binding);
      if (clearEventListeners)
        this.clearEventListenersForBinding(binding);
    }
    handleError(error3, message, detail = {}) {
      this.application.handleError(error3, `Error ${message}`, detail);
    }
    clearEventListenersForBinding(binding) {
      const eventListener = this.fetchEventListenerForBinding(binding);
      if (!eventListener.hasBindings()) {
        eventListener.disconnect();
        this.removeMappedEventListenerFor(binding);
      }
    }
    removeMappedEventListenerFor(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      eventListenerMap.delete(cacheKey);
      if (eventListenerMap.size == 0)
        this.eventListenerMaps.delete(eventTarget);
    }
    fetchEventListenerForBinding(binding) {
      const { eventTarget, eventName, eventOptions } = binding;
      return this.fetchEventListener(eventTarget, eventName, eventOptions);
    }
    fetchEventListener(eventTarget, eventName, eventOptions) {
      const eventListenerMap = this.fetchEventListenerMapForEventTarget(eventTarget);
      const cacheKey = this.cacheKey(eventName, eventOptions);
      let eventListener = eventListenerMap.get(cacheKey);
      if (!eventListener) {
        eventListener = this.createEventListener(eventTarget, eventName, eventOptions);
        eventListenerMap.set(cacheKey, eventListener);
      }
      return eventListener;
    }
    createEventListener(eventTarget, eventName, eventOptions) {
      const eventListener = new EventListener(eventTarget, eventName, eventOptions);
      if (this.started) {
        eventListener.connect();
      }
      return eventListener;
    }
    fetchEventListenerMapForEventTarget(eventTarget) {
      let eventListenerMap = this.eventListenerMaps.get(eventTarget);
      if (!eventListenerMap) {
        eventListenerMap = /* @__PURE__ */ new Map();
        this.eventListenerMaps.set(eventTarget, eventListenerMap);
      }
      return eventListenerMap;
    }
    cacheKey(eventName, eventOptions) {
      const parts = [eventName];
      Object.keys(eventOptions).sort().forEach((key) => {
        parts.push(`${eventOptions[key] ? "" : "!"}${key}`);
      });
      return parts.join(":");
    }
  };
  var defaultActionDescriptorFilters = {
    stop({ event, value }) {
      if (value)
        event.stopPropagation();
      return true;
    },
    prevent({ event, value }) {
      if (value)
        event.preventDefault();
      return true;
    },
    self({ event, value, element }) {
      if (value) {
        return element === event.target;
      } else {
        return true;
      }
    }
  };
  var descriptorPattern = /^(?:(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function parseActionDescriptorString(descriptorString) {
    const source = descriptorString.trim();
    const matches = source.match(descriptorPattern) || [];
    let eventName = matches[1];
    let keyFilter = matches[2];
    if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
      eventName += `.${keyFilter}`;
      keyFilter = "";
    }
    return {
      eventTarget: parseEventTarget(matches[3]),
      eventName,
      eventOptions: matches[6] ? parseEventOptions(matches[6]) : {},
      identifier: matches[4],
      methodName: matches[5],
      keyFilter
    };
  }
  function parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    } else if (eventTargetName == "document") {
      return document;
    }
  }
  function parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce((options, token) => Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) }), {});
  }
  function stringifyEventTarget(eventTarget) {
    if (eventTarget == window) {
      return "window";
    } else if (eventTarget == document) {
      return "document";
    }
  }
  function camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) => char.toUpperCase());
  }
  function namespaceCamelize(value) {
    return camelize(value.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  function dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
  function tokenize(value) {
    return value.match(/[^\s]+/g) || [];
  }
  var Action = class {
    constructor(element, index, descriptor, schema2) {
      this.element = element;
      this.index = index;
      this.eventTarget = descriptor.eventTarget || element;
      this.eventName = descriptor.eventName || getDefaultEventNameForElement(element) || error("missing event name");
      this.eventOptions = descriptor.eventOptions || {};
      this.identifier = descriptor.identifier || error("missing identifier");
      this.methodName = descriptor.methodName || error("missing method name");
      this.keyFilter = descriptor.keyFilter || "";
      this.schema = schema2;
    }
    static forToken(token, schema2) {
      return new this(token.element, token.index, parseActionDescriptorString(token.content), schema2);
    }
    toString() {
      const eventFilter = this.keyFilter ? `.${this.keyFilter}` : "";
      const eventTarget = this.eventTargetName ? `@${this.eventTargetName}` : "";
      return `${this.eventName}${eventFilter}${eventTarget}->${this.identifier}#${this.methodName}`;
    }
    isFilterTarget(event) {
      if (!this.keyFilter) {
        return false;
      }
      const filteres = this.keyFilter.split("+");
      const modifiers = ["meta", "ctrl", "alt", "shift"];
      const [meta, ctrl, alt, shift] = modifiers.map((modifier) => filteres.includes(modifier));
      if (event.metaKey !== meta || event.ctrlKey !== ctrl || event.altKey !== alt || event.shiftKey !== shift) {
        return true;
      }
      const standardFilter = filteres.filter((key) => !modifiers.includes(key))[0];
      if (!standardFilter) {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(this.keyMappings, standardFilter)) {
        error(`contains unknown key filter: ${this.keyFilter}`);
      }
      return this.keyMappings[standardFilter].toLowerCase() !== event.key.toLowerCase();
    }
    get params() {
      const params2 = {};
      const pattern = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
      for (const { name: name4, value } of Array.from(this.element.attributes)) {
        const match = name4.match(pattern);
        const key = match && match[1];
        if (key) {
          params2[camelize(key)] = typecast(value);
        }
      }
      return params2;
    }
    get eventTargetName() {
      return stringifyEventTarget(this.eventTarget);
    }
    get keyMappings() {
      return this.schema.keyMappings;
    }
  };
  var defaultEventNames = {
    a: () => "click",
    button: () => "click",
    form: () => "submit",
    details: () => "toggle",
    input: (e) => e.getAttribute("type") == "submit" ? "click" : "input",
    select: () => "change",
    textarea: () => "input"
  };
  function getDefaultEventNameForElement(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName in defaultEventNames) {
      return defaultEventNames[tagName](element);
    }
  }
  function error(message) {
    throw new Error(message);
  }
  function typecast(value) {
    try {
      return JSON.parse(value);
    } catch (o_O) {
      return value;
    }
  }
  var Binding = class {
    constructor(context, action) {
      this.context = context;
      this.action = action;
    }
    get index() {
      return this.action.index;
    }
    get eventTarget() {
      return this.action.eventTarget;
    }
    get eventOptions() {
      return this.action.eventOptions;
    }
    get identifier() {
      return this.context.identifier;
    }
    handleEvent(event) {
      if (this.willBeInvokedByEvent(event) && this.applyEventModifiers(event)) {
        this.invokeWithEvent(event);
      }
    }
    get eventName() {
      return this.action.eventName;
    }
    get method() {
      const method = this.controller[this.methodName];
      if (typeof method == "function") {
        return method;
      }
      throw new Error(`Action "${this.action}" references undefined method "${this.methodName}"`);
    }
    applyEventModifiers(event) {
      const { element } = this.action;
      const { actionDescriptorFilters } = this.context.application;
      let passes = true;
      for (const [name4, value] of Object.entries(this.eventOptions)) {
        if (name4 in actionDescriptorFilters) {
          const filter = actionDescriptorFilters[name4];
          passes = passes && filter({ name: name4, value, event, element });
        } else {
          continue;
        }
      }
      return passes;
    }
    invokeWithEvent(event) {
      const { target, currentTarget } = event;
      try {
        const { params: params2 } = this.action;
        const actionEvent = Object.assign(event, { params: params2 });
        this.method.call(this.controller, actionEvent);
        this.context.logDebugActivity(this.methodName, { event, target, currentTarget, action: this.methodName });
      } catch (error3) {
        const { identifier, controller, element, index } = this;
        const detail = { identifier, controller, element, index, event };
        this.context.handleError(error3, `invoking action "${this.action}"`, detail);
      }
    }
    willBeInvokedByEvent(event) {
      const eventTarget = event.target;
      if (event instanceof KeyboardEvent && this.action.isFilterTarget(event)) {
        return false;
      }
      if (this.element === eventTarget) {
        return true;
      } else if (eventTarget instanceof Element && this.element.contains(eventTarget)) {
        return this.scope.containsElement(eventTarget);
      } else {
        return this.scope.containsElement(this.action.element);
      }
    }
    get controller() {
      return this.context.controller;
    }
    get methodName() {
      return this.action.methodName;
    }
    get element() {
      return this.scope.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  var ElementObserver = class {
    constructor(element, delegate) {
      this.mutationObserverInit = { attributes: true, childList: true, subtree: true };
      this.element = element;
      this.started = false;
      this.delegate = delegate;
      this.elements = /* @__PURE__ */ new Set();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.refresh();
      }
    }
    pause(callback) {
      if (this.started) {
        this.mutationObserver.disconnect();
        this.started = false;
      }
      callback();
      if (!this.started) {
        this.mutationObserver.observe(this.element, this.mutationObserverInit);
        this.started = true;
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        const matches = new Set(this.matchElementsInTree());
        for (const element of Array.from(this.elements)) {
          if (!matches.has(element)) {
            this.removeElement(element);
          }
        }
        for (const element of Array.from(matches)) {
          this.addElement(element);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      if (mutation.type == "attributes") {
        this.processAttributeChange(mutation.target, mutation.attributeName);
      } else if (mutation.type == "childList") {
        this.processRemovedNodes(mutation.removedNodes);
        this.processAddedNodes(mutation.addedNodes);
      }
    }
    processAttributeChange(node, attributeName) {
      const element = node;
      if (this.elements.has(element)) {
        if (this.delegate.elementAttributeChanged && this.matchElement(element)) {
          this.delegate.elementAttributeChanged(element, attributeName);
        } else {
          this.removeElement(element);
        }
      } else if (this.matchElement(element)) {
        this.addElement(element);
      }
    }
    processRemovedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element) {
          this.processTree(element, this.removeElement);
        }
      }
    }
    processAddedNodes(nodes) {
      for (const node of Array.from(nodes)) {
        const element = this.elementFromNode(node);
        if (element && this.elementIsActive(element)) {
          this.processTree(element, this.addElement);
        }
      }
    }
    matchElement(element) {
      return this.delegate.matchElement(element);
    }
    matchElementsInTree(tree = this.element) {
      return this.delegate.matchElementsInTree(tree);
    }
    processTree(tree, processor) {
      for (const element of this.matchElementsInTree(tree)) {
        processor.call(this, element);
      }
    }
    elementFromNode(node) {
      if (node.nodeType == Node.ELEMENT_NODE) {
        return node;
      }
    }
    elementIsActive(element) {
      if (element.isConnected != this.element.isConnected) {
        return false;
      } else {
        return this.element.contains(element);
      }
    }
    addElement(element) {
      if (!this.elements.has(element)) {
        if (this.elementIsActive(element)) {
          this.elements.add(element);
          if (this.delegate.elementMatched) {
            this.delegate.elementMatched(element);
          }
        }
      }
    }
    removeElement(element) {
      if (this.elements.has(element)) {
        this.elements.delete(element);
        if (this.delegate.elementUnmatched) {
          this.delegate.elementUnmatched(element);
        }
      }
    }
  };
  var AttributeObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeName = attributeName;
      this.delegate = delegate;
      this.elementObserver = new ElementObserver(element, this);
    }
    get element() {
      return this.elementObserver.element;
    }
    get selector() {
      return `[${this.attributeName}]`;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get started() {
      return this.elementObserver.started;
    }
    matchElement(element) {
      return element.hasAttribute(this.attributeName);
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector));
      return match.concat(matches);
    }
    elementMatched(element) {
      if (this.delegate.elementMatchedAttribute) {
        this.delegate.elementMatchedAttribute(element, this.attributeName);
      }
    }
    elementUnmatched(element) {
      if (this.delegate.elementUnmatchedAttribute) {
        this.delegate.elementUnmatchedAttribute(element, this.attributeName);
      }
    }
    elementAttributeChanged(element, attributeName) {
      if (this.delegate.elementAttributeValueChanged && this.attributeName == attributeName) {
        this.delegate.elementAttributeValueChanged(element, attributeName);
      }
    }
  };
  function add2(map, key, value) {
    fetch2(map, key).add(value);
  }
  function del(map, key, value) {
    fetch2(map, key).delete(value);
    prune(map, key);
  }
  function fetch2(map, key) {
    let values = map.get(key);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      map.set(key, values);
    }
    return values;
  }
  function prune(map, key) {
    const values = map.get(key);
    if (values != null && values.size == 0) {
      map.delete(key);
    }
  }
  var Multimap = class {
    constructor() {
      this.valuesByKey = /* @__PURE__ */ new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((values, set) => values.concat(Array.from(set)), []);
    }
    get size() {
      const sets = Array.from(this.valuesByKey.values());
      return sets.reduce((size, set) => size + set.size, 0);
    }
    add(key, value) {
      add2(this.valuesByKey, key, value);
    }
    delete(key, value) {
      del(this.valuesByKey, key, value);
    }
    has(key, value) {
      const values = this.valuesByKey.get(key);
      return values != null && values.has(value);
    }
    hasKey(key) {
      return this.valuesByKey.has(key);
    }
    hasValue(value) {
      const sets = Array.from(this.valuesByKey.values());
      return sets.some((set) => set.has(value));
    }
    getValuesForKey(key) {
      const values = this.valuesByKey.get(key);
      return values ? Array.from(values) : [];
    }
    getKeysForValue(value) {
      return Array.from(this.valuesByKey).filter(([_key, values]) => values.has(value)).map(([key, _values]) => key);
    }
  };
  var SelectorObserver = class {
    constructor(element, selector, delegate, details = {}) {
      this.selector = selector;
      this.details = details;
      this.elementObserver = new ElementObserver(element, this);
      this.delegate = delegate;
      this.matchesByElement = new Multimap();
    }
    get started() {
      return this.elementObserver.started;
    }
    start() {
      this.elementObserver.start();
    }
    pause(callback) {
      this.elementObserver.pause(callback);
    }
    stop() {
      this.elementObserver.stop();
    }
    refresh() {
      this.elementObserver.refresh();
    }
    get element() {
      return this.elementObserver.element;
    }
    matchElement(element) {
      const matches = element.matches(this.selector);
      if (this.delegate.selectorMatchElement) {
        return matches && this.delegate.selectorMatchElement(element, this.details);
      }
      return matches;
    }
    matchElementsInTree(tree) {
      const match = this.matchElement(tree) ? [tree] : [];
      const matches = Array.from(tree.querySelectorAll(this.selector)).filter((match2) => this.matchElement(match2));
      return match.concat(matches);
    }
    elementMatched(element) {
      this.selectorMatched(element);
    }
    elementUnmatched(element) {
      this.selectorUnmatched(element);
    }
    elementAttributeChanged(element, _attributeName) {
      const matches = this.matchElement(element);
      const matchedBefore = this.matchesByElement.has(this.selector, element);
      if (!matches && matchedBefore) {
        this.selectorUnmatched(element);
      }
    }
    selectorMatched(element) {
      if (this.delegate.selectorMatched) {
        this.delegate.selectorMatched(element, this.selector, this.details);
        this.matchesByElement.add(this.selector, element);
      }
    }
    selectorUnmatched(element) {
      this.delegate.selectorUnmatched(element, this.selector, this.details);
      this.matchesByElement.delete(this.selector, element);
    }
  };
  var StringMapObserver = class {
    constructor(element, delegate) {
      this.element = element;
      this.delegate = delegate;
      this.started = false;
      this.stringMap = /* @__PURE__ */ new Map();
      this.mutationObserver = new MutationObserver((mutations) => this.processMutations(mutations));
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.mutationObserver.observe(this.element, { attributes: true, attributeOldValue: true });
        this.refresh();
      }
    }
    stop() {
      if (this.started) {
        this.mutationObserver.takeRecords();
        this.mutationObserver.disconnect();
        this.started = false;
      }
    }
    refresh() {
      if (this.started) {
        for (const attributeName of this.knownAttributeNames) {
          this.refreshAttribute(attributeName, null);
        }
      }
    }
    processMutations(mutations) {
      if (this.started) {
        for (const mutation of mutations) {
          this.processMutation(mutation);
        }
      }
    }
    processMutation(mutation) {
      const attributeName = mutation.attributeName;
      if (attributeName) {
        this.refreshAttribute(attributeName, mutation.oldValue);
      }
    }
    refreshAttribute(attributeName, oldValue) {
      const key = this.delegate.getStringMapKeyForAttribute(attributeName);
      if (key != null) {
        if (!this.stringMap.has(attributeName)) {
          this.stringMapKeyAdded(key, attributeName);
        }
        const value = this.element.getAttribute(attributeName);
        if (this.stringMap.get(attributeName) != value) {
          this.stringMapValueChanged(value, key, oldValue);
        }
        if (value == null) {
          const oldValue2 = this.stringMap.get(attributeName);
          this.stringMap.delete(attributeName);
          if (oldValue2)
            this.stringMapKeyRemoved(key, attributeName, oldValue2);
        } else {
          this.stringMap.set(attributeName, value);
        }
      }
    }
    stringMapKeyAdded(key, attributeName) {
      if (this.delegate.stringMapKeyAdded) {
        this.delegate.stringMapKeyAdded(key, attributeName);
      }
    }
    stringMapValueChanged(value, key, oldValue) {
      if (this.delegate.stringMapValueChanged) {
        this.delegate.stringMapValueChanged(value, key, oldValue);
      }
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      if (this.delegate.stringMapKeyRemoved) {
        this.delegate.stringMapKeyRemoved(key, attributeName, oldValue);
      }
    }
    get knownAttributeNames() {
      return Array.from(new Set(this.currentAttributeNames.concat(this.recordedAttributeNames)));
    }
    get currentAttributeNames() {
      return Array.from(this.element.attributes).map((attribute) => attribute.name);
    }
    get recordedAttributeNames() {
      return Array.from(this.stringMap.keys());
    }
  };
  var TokenListObserver = class {
    constructor(element, attributeName, delegate) {
      this.attributeObserver = new AttributeObserver(element, attributeName, this);
      this.delegate = delegate;
      this.tokensByElement = new Multimap();
    }
    get started() {
      return this.attributeObserver.started;
    }
    start() {
      this.attributeObserver.start();
    }
    pause(callback) {
      this.attributeObserver.pause(callback);
    }
    stop() {
      this.attributeObserver.stop();
    }
    refresh() {
      this.attributeObserver.refresh();
    }
    get element() {
      return this.attributeObserver.element;
    }
    get attributeName() {
      return this.attributeObserver.attributeName;
    }
    elementMatchedAttribute(element) {
      this.tokensMatched(this.readTokensForElement(element));
    }
    elementAttributeValueChanged(element) {
      const [unmatchedTokens, matchedTokens] = this.refreshTokensForElement(element);
      this.tokensUnmatched(unmatchedTokens);
      this.tokensMatched(matchedTokens);
    }
    elementUnmatchedAttribute(element) {
      this.tokensUnmatched(this.tokensByElement.getValuesForKey(element));
    }
    tokensMatched(tokens) {
      tokens.forEach((token) => this.tokenMatched(token));
    }
    tokensUnmatched(tokens) {
      tokens.forEach((token) => this.tokenUnmatched(token));
    }
    tokenMatched(token) {
      this.delegate.tokenMatched(token);
      this.tokensByElement.add(token.element, token);
    }
    tokenUnmatched(token) {
      this.delegate.tokenUnmatched(token);
      this.tokensByElement.delete(token.element, token);
    }
    refreshTokensForElement(element) {
      const previousTokens = this.tokensByElement.getValuesForKey(element);
      const currentTokens = this.readTokensForElement(element);
      const firstDifferingIndex = zip(previousTokens, currentTokens).findIndex(([previousToken, currentToken]) => !tokensAreEqual(previousToken, currentToken));
      if (firstDifferingIndex == -1) {
        return [[], []];
      } else {
        return [previousTokens.slice(firstDifferingIndex), currentTokens.slice(firstDifferingIndex)];
      }
    }
    readTokensForElement(element) {
      const attributeName = this.attributeName;
      const tokenString = element.getAttribute(attributeName) || "";
      return parseTokenString(tokenString, element, attributeName);
    }
  };
  function parseTokenString(tokenString, element, attributeName) {
    return tokenString.trim().split(/\s+/).filter((content) => content.length).map((content, index) => ({ element, attributeName, content, index }));
  }
  function zip(left, right) {
    const length = Math.max(left.length, right.length);
    return Array.from({ length }, (_, index) => [left[index], right[index]]);
  }
  function tokensAreEqual(left, right) {
    return left && right && left.index == right.index && left.content == right.content;
  }
  var ValueListObserver = class {
    constructor(element, attributeName, delegate) {
      this.tokenListObserver = new TokenListObserver(element, attributeName, this);
      this.delegate = delegate;
      this.parseResultsByToken = /* @__PURE__ */ new WeakMap();
      this.valuesByTokenByElement = /* @__PURE__ */ new WeakMap();
    }
    get started() {
      return this.tokenListObserver.started;
    }
    start() {
      this.tokenListObserver.start();
    }
    stop() {
      this.tokenListObserver.stop();
    }
    refresh() {
      this.tokenListObserver.refresh();
    }
    get element() {
      return this.tokenListObserver.element;
    }
    get attributeName() {
      return this.tokenListObserver.attributeName;
    }
    tokenMatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).set(token, value);
        this.delegate.elementMatchedValue(element, value);
      }
    }
    tokenUnmatched(token) {
      const { element } = token;
      const { value } = this.fetchParseResultForToken(token);
      if (value) {
        this.fetchValuesByTokenForElement(element).delete(token);
        this.delegate.elementUnmatchedValue(element, value);
      }
    }
    fetchParseResultForToken(token) {
      let parseResult = this.parseResultsByToken.get(token);
      if (!parseResult) {
        parseResult = this.parseToken(token);
        this.parseResultsByToken.set(token, parseResult);
      }
      return parseResult;
    }
    fetchValuesByTokenForElement(element) {
      let valuesByToken = this.valuesByTokenByElement.get(element);
      if (!valuesByToken) {
        valuesByToken = /* @__PURE__ */ new Map();
        this.valuesByTokenByElement.set(element, valuesByToken);
      }
      return valuesByToken;
    }
    parseToken(token) {
      try {
        const value = this.delegate.parseValueForToken(token);
        return { value };
      } catch (error3) {
        return { error: error3 };
      }
    }
  };
  var BindingObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.bindingsByAction = /* @__PURE__ */ new Map();
    }
    start() {
      if (!this.valueListObserver) {
        this.valueListObserver = new ValueListObserver(this.element, this.actionAttribute, this);
        this.valueListObserver.start();
      }
    }
    stop() {
      if (this.valueListObserver) {
        this.valueListObserver.stop();
        delete this.valueListObserver;
        this.disconnectAllActions();
      }
    }
    get element() {
      return this.context.element;
    }
    get identifier() {
      return this.context.identifier;
    }
    get actionAttribute() {
      return this.schema.actionAttribute;
    }
    get schema() {
      return this.context.schema;
    }
    get bindings() {
      return Array.from(this.bindingsByAction.values());
    }
    connectAction(action) {
      const binding = new Binding(this.context, action);
      this.bindingsByAction.set(action, binding);
      this.delegate.bindingConnected(binding);
    }
    disconnectAction(action) {
      const binding = this.bindingsByAction.get(action);
      if (binding) {
        this.bindingsByAction.delete(action);
        this.delegate.bindingDisconnected(binding);
      }
    }
    disconnectAllActions() {
      this.bindings.forEach((binding) => this.delegate.bindingDisconnected(binding, true));
      this.bindingsByAction.clear();
    }
    parseValueForToken(token) {
      const action = Action.forToken(token, this.schema);
      if (action.identifier == this.identifier) {
        return action;
      }
    }
    elementMatchedValue(element, action) {
      this.connectAction(action);
    }
    elementUnmatchedValue(element, action) {
      this.disconnectAction(action);
    }
  };
  var ValueObserver = class {
    constructor(context, receiver) {
      this.context = context;
      this.receiver = receiver;
      this.stringMapObserver = new StringMapObserver(this.element, this);
      this.valueDescriptorMap = this.controller.valueDescriptorMap;
    }
    start() {
      this.stringMapObserver.start();
      this.invokeChangedCallbacksForDefaultValues();
    }
    stop() {
      this.stringMapObserver.stop();
    }
    get element() {
      return this.context.element;
    }
    get controller() {
      return this.context.controller;
    }
    getStringMapKeyForAttribute(attributeName) {
      if (attributeName in this.valueDescriptorMap) {
        return this.valueDescriptorMap[attributeName].name;
      }
    }
    stringMapKeyAdded(key, attributeName) {
      const descriptor = this.valueDescriptorMap[attributeName];
      if (!this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), descriptor.writer(descriptor.defaultValue));
      }
    }
    stringMapValueChanged(value, name4, oldValue) {
      const descriptor = this.valueDescriptorNameMap[name4];
      if (value === null)
        return;
      if (oldValue === null) {
        oldValue = descriptor.writer(descriptor.defaultValue);
      }
      this.invokeChangedCallback(name4, value, oldValue);
    }
    stringMapKeyRemoved(key, attributeName, oldValue) {
      const descriptor = this.valueDescriptorNameMap[key];
      if (this.hasValue(key)) {
        this.invokeChangedCallback(key, descriptor.writer(this.receiver[key]), oldValue);
      } else {
        this.invokeChangedCallback(key, descriptor.writer(descriptor.defaultValue), oldValue);
      }
    }
    invokeChangedCallbacksForDefaultValues() {
      for (const { key, name: name4, defaultValue, writer } of this.valueDescriptors) {
        if (defaultValue != void 0 && !this.controller.data.has(key)) {
          this.invokeChangedCallback(name4, writer(defaultValue), void 0);
        }
      }
    }
    invokeChangedCallback(name4, rawValue, rawOldValue) {
      const changedMethodName = `${name4}Changed`;
      const changedMethod = this.receiver[changedMethodName];
      if (typeof changedMethod == "function") {
        const descriptor = this.valueDescriptorNameMap[name4];
        try {
          const value = descriptor.reader(rawValue);
          let oldValue = rawOldValue;
          if (rawOldValue) {
            oldValue = descriptor.reader(rawOldValue);
          }
          changedMethod.call(this.receiver, value, oldValue);
        } catch (error3) {
          if (error3 instanceof TypeError) {
            error3.message = `Stimulus Value "${this.context.identifier}.${descriptor.name}" - ${error3.message}`;
          }
          throw error3;
        }
      }
    }
    get valueDescriptors() {
      const { valueDescriptorMap } = this;
      return Object.keys(valueDescriptorMap).map((key) => valueDescriptorMap[key]);
    }
    get valueDescriptorNameMap() {
      const descriptors = {};
      Object.keys(this.valueDescriptorMap).forEach((key) => {
        const descriptor = this.valueDescriptorMap[key];
        descriptors[descriptor.name] = descriptor;
      });
      return descriptors;
    }
    hasValue(attributeName) {
      const descriptor = this.valueDescriptorNameMap[attributeName];
      const hasMethodName = `has${capitalize(descriptor.name)}`;
      return this.receiver[hasMethodName];
    }
  };
  var TargetObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.targetsByName = new Multimap();
    }
    start() {
      if (!this.tokenListObserver) {
        this.tokenListObserver = new TokenListObserver(this.element, this.attributeName, this);
        this.tokenListObserver.start();
      }
    }
    stop() {
      if (this.tokenListObserver) {
        this.disconnectAllTargets();
        this.tokenListObserver.stop();
        delete this.tokenListObserver;
      }
    }
    tokenMatched({ element, content: name4 }) {
      if (this.scope.containsElement(element)) {
        this.connectTarget(element, name4);
      }
    }
    tokenUnmatched({ element, content: name4 }) {
      this.disconnectTarget(element, name4);
    }
    connectTarget(element, name4) {
      var _a;
      if (!this.targetsByName.has(name4, element)) {
        this.targetsByName.add(name4, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetConnected(element, name4));
      }
    }
    disconnectTarget(element, name4) {
      var _a;
      if (this.targetsByName.has(name4, element)) {
        this.targetsByName.delete(name4, element);
        (_a = this.tokenListObserver) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.targetDisconnected(element, name4));
      }
    }
    disconnectAllTargets() {
      for (const name4 of this.targetsByName.keys) {
        for (const element of this.targetsByName.getValuesForKey(name4)) {
          this.disconnectTarget(element, name4);
        }
      }
    }
    get attributeName() {
      return `data-${this.context.identifier}-target`;
    }
    get element() {
      return this.context.element;
    }
    get scope() {
      return this.context.scope;
    }
  };
  function readInheritableStaticArrayValues(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return Array.from(ancestors.reduce((values, constructor2) => {
      getOwnStaticArrayValues(constructor2, propertyName).forEach((name4) => values.add(name4));
      return values;
    }, /* @__PURE__ */ new Set()));
  }
  function readInheritableStaticObjectPairs(constructor, propertyName) {
    const ancestors = getAncestorsForConstructor(constructor);
    return ancestors.reduce((pairs, constructor2) => {
      pairs.push(...getOwnStaticObjectPairs(constructor2, propertyName));
      return pairs;
    }, []);
  }
  function getAncestorsForConstructor(constructor) {
    const ancestors = [];
    while (constructor) {
      ancestors.push(constructor);
      constructor = Object.getPrototypeOf(constructor);
    }
    return ancestors.reverse();
  }
  function getOwnStaticArrayValues(constructor, propertyName) {
    const definition = constructor[propertyName];
    return Array.isArray(definition) ? definition : [];
  }
  function getOwnStaticObjectPairs(constructor, propertyName) {
    const definition = constructor[propertyName];
    return definition ? Object.keys(definition).map((key) => [key, definition[key]]) : [];
  }
  var OutletObserver = class {
    constructor(context, delegate) {
      this.context = context;
      this.delegate = delegate;
      this.outletsByName = new Multimap();
      this.outletElementsByName = new Multimap();
      this.selectorObserverMap = /* @__PURE__ */ new Map();
    }
    start() {
      if (this.selectorObserverMap.size === 0) {
        this.outletDefinitions.forEach((outletName) => {
          const selector = this.selector(outletName);
          const details = { outletName };
          if (selector) {
            this.selectorObserverMap.set(outletName, new SelectorObserver(document.body, selector, this, details));
          }
        });
        this.selectorObserverMap.forEach((observer) => observer.start());
      }
      this.dependentContexts.forEach((context) => context.refresh());
    }
    stop() {
      if (this.selectorObserverMap.size > 0) {
        this.disconnectAllOutlets();
        this.selectorObserverMap.forEach((observer) => observer.stop());
        this.selectorObserverMap.clear();
      }
    }
    refresh() {
      this.selectorObserverMap.forEach((observer) => observer.refresh());
    }
    selectorMatched(element, _selector, { outletName }) {
      const outlet = this.getOutlet(element, outletName);
      if (outlet) {
        this.connectOutlet(outlet, element, outletName);
      }
    }
    selectorUnmatched(element, _selector, { outletName }) {
      const outlet = this.getOutletFromMap(element, outletName);
      if (outlet) {
        this.disconnectOutlet(outlet, element, outletName);
      }
    }
    selectorMatchElement(element, { outletName }) {
      return this.hasOutlet(element, outletName) && element.matches(`[${this.context.application.schema.controllerAttribute}~=${outletName}]`);
    }
    connectOutlet(outlet, element, outletName) {
      var _a;
      if (!this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.add(outletName, outlet);
        this.outletElementsByName.add(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletConnected(outlet, element, outletName));
      }
    }
    disconnectOutlet(outlet, element, outletName) {
      var _a;
      if (this.outletElementsByName.has(outletName, element)) {
        this.outletsByName.delete(outletName, outlet);
        this.outletElementsByName.delete(outletName, element);
        (_a = this.selectorObserverMap.get(outletName)) === null || _a === void 0 ? void 0 : _a.pause(() => this.delegate.outletDisconnected(outlet, element, outletName));
      }
    }
    disconnectAllOutlets() {
      for (const outletName of this.outletElementsByName.keys) {
        for (const element of this.outletElementsByName.getValuesForKey(outletName)) {
          for (const outlet of this.outletsByName.getValuesForKey(outletName)) {
            this.disconnectOutlet(outlet, element, outletName);
          }
        }
      }
    }
    selector(outletName) {
      return this.scope.outlets.getSelectorForOutletName(outletName);
    }
    get outletDependencies() {
      const dependencies4 = new Multimap();
      this.router.modules.forEach((module4) => {
        const constructor = module4.definition.controllerConstructor;
        const outlets = readInheritableStaticArrayValues(constructor, "outlets");
        outlets.forEach((outlet) => dependencies4.add(outlet, module4.identifier));
      });
      return dependencies4;
    }
    get outletDefinitions() {
      return this.outletDependencies.getKeysForValue(this.identifier);
    }
    get dependentControllerIdentifiers() {
      return this.outletDependencies.getValuesForKey(this.identifier);
    }
    get dependentContexts() {
      const identifiers = this.dependentControllerIdentifiers;
      return this.router.contexts.filter((context) => identifiers.includes(context.identifier));
    }
    hasOutlet(element, outletName) {
      return !!this.getOutlet(element, outletName) || !!this.getOutletFromMap(element, outletName);
    }
    getOutlet(element, outletName) {
      return this.application.getControllerForElementAndIdentifier(element, outletName);
    }
    getOutletFromMap(element, outletName) {
      return this.outletsByName.getValuesForKey(outletName).find((outlet) => outlet.element === element);
    }
    get scope() {
      return this.context.scope;
    }
    get identifier() {
      return this.context.identifier;
    }
    get application() {
      return this.context.application;
    }
    get router() {
      return this.application.router;
    }
  };
  var Context = class {
    constructor(module4, scope) {
      this.logDebugActivity = (functionName, detail = {}) => {
        const { identifier, controller, element } = this;
        detail = Object.assign({ identifier, controller, element }, detail);
        this.application.logDebugActivity(this.identifier, functionName, detail);
      };
      this.module = module4;
      this.scope = scope;
      this.controller = new module4.controllerConstructor(this);
      this.bindingObserver = new BindingObserver(this, this.dispatcher);
      this.valueObserver = new ValueObserver(this, this.controller);
      this.targetObserver = new TargetObserver(this, this);
      this.outletObserver = new OutletObserver(this, this);
      try {
        this.controller.initialize();
        this.logDebugActivity("initialize");
      } catch (error3) {
        this.handleError(error3, "initializing controller");
      }
    }
    connect() {
      this.bindingObserver.start();
      this.valueObserver.start();
      this.targetObserver.start();
      this.outletObserver.start();
      try {
        this.controller.connect();
        this.logDebugActivity("connect");
      } catch (error3) {
        this.handleError(error3, "connecting controller");
      }
    }
    refresh() {
      this.outletObserver.refresh();
    }
    disconnect() {
      try {
        this.controller.disconnect();
        this.logDebugActivity("disconnect");
      } catch (error3) {
        this.handleError(error3, "disconnecting controller");
      }
      this.outletObserver.stop();
      this.targetObserver.stop();
      this.valueObserver.stop();
      this.bindingObserver.stop();
    }
    get application() {
      return this.module.application;
    }
    get identifier() {
      return this.module.identifier;
    }
    get schema() {
      return this.application.schema;
    }
    get dispatcher() {
      return this.application.dispatcher;
    }
    get element() {
      return this.scope.element;
    }
    get parentElement() {
      return this.element.parentElement;
    }
    handleError(error3, message, detail = {}) {
      const { identifier, controller, element } = this;
      detail = Object.assign({ identifier, controller, element }, detail);
      this.application.handleError(error3, `Error ${message}`, detail);
    }
    targetConnected(element, name4) {
      this.invokeControllerMethod(`${name4}TargetConnected`, element);
    }
    targetDisconnected(element, name4) {
      this.invokeControllerMethod(`${name4}TargetDisconnected`, element);
    }
    outletConnected(outlet, element, name4) {
      this.invokeControllerMethod(`${namespaceCamelize(name4)}OutletConnected`, outlet, element);
    }
    outletDisconnected(outlet, element, name4) {
      this.invokeControllerMethod(`${namespaceCamelize(name4)}OutletDisconnected`, outlet, element);
    }
    invokeControllerMethod(methodName, ...args) {
      const controller = this.controller;
      if (typeof controller[methodName] == "function") {
        controller[methodName](...args);
      }
    }
  };
  function bless(constructor) {
    return shadow(constructor, getBlessedProperties(constructor));
  }
  function shadow(constructor, properties) {
    const shadowConstructor = extend3(constructor);
    const shadowProperties = getShadowProperties(constructor.prototype, properties);
    Object.defineProperties(shadowConstructor.prototype, shadowProperties);
    return shadowConstructor;
  }
  function getBlessedProperties(constructor) {
    const blessings = readInheritableStaticArrayValues(constructor, "blessings");
    return blessings.reduce((blessedProperties, blessing) => {
      const properties = blessing(constructor);
      for (const key in properties) {
        const descriptor = blessedProperties[key] || {};
        blessedProperties[key] = Object.assign(descriptor, properties[key]);
      }
      return blessedProperties;
    }, {});
  }
  function getShadowProperties(prototype, properties) {
    return getOwnKeys(properties).reduce((shadowProperties, key) => {
      const descriptor = getShadowedDescriptor(prototype, properties, key);
      if (descriptor) {
        Object.assign(shadowProperties, { [key]: descriptor });
      }
      return shadowProperties;
    }, {});
  }
  function getShadowedDescriptor(prototype, properties, key) {
    const shadowingDescriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const shadowedByValue = shadowingDescriptor && "value" in shadowingDescriptor;
    if (!shadowedByValue) {
      const descriptor = Object.getOwnPropertyDescriptor(properties, key).value;
      if (shadowingDescriptor) {
        descriptor.get = shadowingDescriptor.get || descriptor.get;
        descriptor.set = shadowingDescriptor.set || descriptor.set;
      }
      return descriptor;
    }
  }
  var getOwnKeys = (() => {
    if (typeof Object.getOwnPropertySymbols == "function") {
      return (object) => [...Object.getOwnPropertyNames(object), ...Object.getOwnPropertySymbols(object)];
    } else {
      return Object.getOwnPropertyNames;
    }
  })();
  var extend3 = (() => {
    function extendWithReflect(constructor) {
      function extended() {
        return Reflect.construct(constructor, arguments, new.target);
      }
      extended.prototype = Object.create(constructor.prototype, {
        constructor: { value: extended }
      });
      Reflect.setPrototypeOf(extended, constructor);
      return extended;
    }
    function testReflectExtension() {
      const a = function() {
        this.a.call(this);
      };
      const b = extendWithReflect(a);
      b.prototype.a = function() {
      };
      return new b();
    }
    try {
      testReflectExtension();
      return extendWithReflect;
    } catch (error3) {
      return (constructor) => class extended extends constructor {
      };
    }
  })();
  function blessDefinition(definition) {
    return {
      identifier: definition.identifier,
      controllerConstructor: bless(definition.controllerConstructor)
    };
  }
  var Module = class {
    constructor(application2, definition) {
      this.application = application2;
      this.definition = blessDefinition(definition);
      this.contextsByScope = /* @__PURE__ */ new WeakMap();
      this.connectedContexts = /* @__PURE__ */ new Set();
    }
    get identifier() {
      return this.definition.identifier;
    }
    get controllerConstructor() {
      return this.definition.controllerConstructor;
    }
    get contexts() {
      return Array.from(this.connectedContexts);
    }
    connectContextForScope(scope) {
      const context = this.fetchContextForScope(scope);
      this.connectedContexts.add(context);
      context.connect();
    }
    disconnectContextForScope(scope) {
      const context = this.contextsByScope.get(scope);
      if (context) {
        this.connectedContexts.delete(context);
        context.disconnect();
      }
    }
    fetchContextForScope(scope) {
      let context = this.contextsByScope.get(scope);
      if (!context) {
        context = new Context(this, scope);
        this.contextsByScope.set(scope, context);
      }
      return context;
    }
  };
  var ClassMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    has(name4) {
      return this.data.has(this.getDataKey(name4));
    }
    get(name4) {
      return this.getAll(name4)[0];
    }
    getAll(name4) {
      const tokenString = this.data.get(this.getDataKey(name4)) || "";
      return tokenize(tokenString);
    }
    getAttributeName(name4) {
      return this.data.getAttributeNameForKey(this.getDataKey(name4));
    }
    getDataKey(name4) {
      return `${name4}-class`;
    }
    get data() {
      return this.scope.data;
    }
  };
  var DataMap = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get(key) {
      const name4 = this.getAttributeNameForKey(key);
      return this.element.getAttribute(name4);
    }
    set(key, value) {
      const name4 = this.getAttributeNameForKey(key);
      this.element.setAttribute(name4, value);
      return this.get(key);
    }
    has(key) {
      const name4 = this.getAttributeNameForKey(key);
      return this.element.hasAttribute(name4);
    }
    delete(key) {
      if (this.has(key)) {
        const name4 = this.getAttributeNameForKey(key);
        this.element.removeAttribute(name4);
        return true;
      } else {
        return false;
      }
    }
    getAttributeNameForKey(key) {
      return `data-${this.identifier}-${dasherize(key)}`;
    }
  };
  var Guide = class {
    constructor(logger3) {
      this.warnedKeysByObject = /* @__PURE__ */ new WeakMap();
      this.logger = logger3;
    }
    warn(object, key, message) {
      let warnedKeys = this.warnedKeysByObject.get(object);
      if (!warnedKeys) {
        warnedKeys = /* @__PURE__ */ new Set();
        this.warnedKeysByObject.set(object, warnedKeys);
      }
      if (!warnedKeys.has(key)) {
        warnedKeys.add(key);
        this.logger.warn(message, object);
      }
    }
  };
  function attributeValueContainsToken(attributeName, token) {
    return `[${attributeName}~="${token}"]`;
  }
  var TargetSet = class {
    constructor(scope) {
      this.scope = scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(targetName) {
      return this.find(targetName) != null;
    }
    find(...targetNames) {
      return targetNames.reduce((target, targetName) => target || this.findTarget(targetName) || this.findLegacyTarget(targetName), void 0);
    }
    findAll(...targetNames) {
      return targetNames.reduce((targets, targetName) => [
        ...targets,
        ...this.findAllTargets(targetName),
        ...this.findAllLegacyTargets(targetName)
      ], []);
    }
    findTarget(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findElement(selector);
    }
    findAllTargets(targetName) {
      const selector = this.getSelectorForTargetName(targetName);
      return this.scope.findAllElements(selector);
    }
    getSelectorForTargetName(targetName) {
      const attributeName = this.schema.targetAttributeForScope(this.identifier);
      return attributeValueContainsToken(attributeName, targetName);
    }
    findLegacyTarget(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.deprecate(this.scope.findElement(selector), targetName);
    }
    findAllLegacyTargets(targetName) {
      const selector = this.getLegacySelectorForTargetName(targetName);
      return this.scope.findAllElements(selector).map((element) => this.deprecate(element, targetName));
    }
    getLegacySelectorForTargetName(targetName) {
      const targetDescriptor = `${this.identifier}.${targetName}`;
      return attributeValueContainsToken(this.schema.targetAttribute, targetDescriptor);
    }
    deprecate(element, targetName) {
      if (element) {
        const { identifier } = this;
        const attributeName = this.schema.targetAttribute;
        const revisedAttributeName = this.schema.targetAttributeForScope(identifier);
        this.guide.warn(element, `target:${targetName}`, `Please replace ${attributeName}="${identifier}.${targetName}" with ${revisedAttributeName}="${targetName}". The ${attributeName} attribute is deprecated and will be removed in a future version of Stimulus.`);
      }
      return element;
    }
    get guide() {
      return this.scope.guide;
    }
  };
  var OutletSet = class {
    constructor(scope, controllerElement) {
      this.scope = scope;
      this.controllerElement = controllerElement;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get schema() {
      return this.scope.schema;
    }
    has(outletName) {
      return this.find(outletName) != null;
    }
    find(...outletNames) {
      return outletNames.reduce((outlet, outletName) => outlet || this.findOutlet(outletName), void 0);
    }
    findAll(...outletNames) {
      return outletNames.reduce((outlets, outletName) => [...outlets, ...this.findAllOutlets(outletName)], []);
    }
    getSelectorForOutletName(outletName) {
      const attributeName = this.schema.outletAttributeForScope(this.identifier, outletName);
      return this.controllerElement.getAttribute(attributeName);
    }
    findOutlet(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      if (selector)
        return this.findElement(selector, outletName);
    }
    findAllOutlets(outletName) {
      const selector = this.getSelectorForOutletName(outletName);
      return selector ? this.findAllElements(selector, outletName) : [];
    }
    findElement(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName))[0];
    }
    findAllElements(selector, outletName) {
      const elements = this.scope.queryElements(selector);
      return elements.filter((element) => this.matchesElement(element, selector, outletName));
    }
    matchesElement(element, selector, outletName) {
      const controllerAttribute = element.getAttribute(this.scope.schema.controllerAttribute) || "";
      return element.matches(selector) && controllerAttribute.split(" ").includes(outletName);
    }
  };
  var Scope = class _Scope {
    constructor(schema2, element, identifier, logger3) {
      this.targets = new TargetSet(this);
      this.classes = new ClassMap(this);
      this.data = new DataMap(this);
      this.containsElement = (element2) => {
        return element2.closest(this.controllerSelector) === this.element;
      };
      this.schema = schema2;
      this.element = element;
      this.identifier = identifier;
      this.guide = new Guide(logger3);
      this.outlets = new OutletSet(this.documentScope, element);
    }
    findElement(selector) {
      return this.element.matches(selector) ? this.element : this.queryElements(selector).find(this.containsElement);
    }
    findAllElements(selector) {
      return [
        ...this.element.matches(selector) ? [this.element] : [],
        ...this.queryElements(selector).filter(this.containsElement)
      ];
    }
    queryElements(selector) {
      return Array.from(this.element.querySelectorAll(selector));
    }
    get controllerSelector() {
      return attributeValueContainsToken(this.schema.controllerAttribute, this.identifier);
    }
    get isDocumentScope() {
      return this.element === document.documentElement;
    }
    get documentScope() {
      return this.isDocumentScope ? this : new _Scope(this.schema, document.documentElement, this.identifier, this.guide.logger);
    }
  };
  var ScopeObserver = class {
    constructor(element, schema2, delegate) {
      this.element = element;
      this.schema = schema2;
      this.delegate = delegate;
      this.valueListObserver = new ValueListObserver(this.element, this.controllerAttribute, this);
      this.scopesByIdentifierByElement = /* @__PURE__ */ new WeakMap();
      this.scopeReferenceCounts = /* @__PURE__ */ new WeakMap();
    }
    start() {
      this.valueListObserver.start();
    }
    stop() {
      this.valueListObserver.stop();
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    parseValueForToken(token) {
      const { element, content: identifier } = token;
      const scopesByIdentifier = this.fetchScopesByIdentifierForElement(element);
      let scope = scopesByIdentifier.get(identifier);
      if (!scope) {
        scope = this.delegate.createScopeForElementAndIdentifier(element, identifier);
        scopesByIdentifier.set(identifier, scope);
      }
      return scope;
    }
    elementMatchedValue(element, value) {
      const referenceCount = (this.scopeReferenceCounts.get(value) || 0) + 1;
      this.scopeReferenceCounts.set(value, referenceCount);
      if (referenceCount == 1) {
        this.delegate.scopeConnected(value);
      }
    }
    elementUnmatchedValue(element, value) {
      const referenceCount = this.scopeReferenceCounts.get(value);
      if (referenceCount) {
        this.scopeReferenceCounts.set(value, referenceCount - 1);
        if (referenceCount == 1) {
          this.delegate.scopeDisconnected(value);
        }
      }
    }
    fetchScopesByIdentifierForElement(element) {
      let scopesByIdentifier = this.scopesByIdentifierByElement.get(element);
      if (!scopesByIdentifier) {
        scopesByIdentifier = /* @__PURE__ */ new Map();
        this.scopesByIdentifierByElement.set(element, scopesByIdentifier);
      }
      return scopesByIdentifier;
    }
  };
  var Router = class {
    constructor(application2) {
      this.application = application2;
      this.scopeObserver = new ScopeObserver(this.element, this.schema, this);
      this.scopesByIdentifier = new Multimap();
      this.modulesByIdentifier = /* @__PURE__ */ new Map();
    }
    get element() {
      return this.application.element;
    }
    get schema() {
      return this.application.schema;
    }
    get logger() {
      return this.application.logger;
    }
    get controllerAttribute() {
      return this.schema.controllerAttribute;
    }
    get modules() {
      return Array.from(this.modulesByIdentifier.values());
    }
    get contexts() {
      return this.modules.reduce((contexts, module4) => contexts.concat(module4.contexts), []);
    }
    start() {
      this.scopeObserver.start();
    }
    stop() {
      this.scopeObserver.stop();
    }
    loadDefinition(definition) {
      this.unloadIdentifier(definition.identifier);
      const module4 = new Module(this.application, definition);
      this.connectModule(module4);
      const afterLoad = definition.controllerConstructor.afterLoad;
      if (afterLoad) {
        afterLoad(definition.identifier, this.application);
      }
    }
    unloadIdentifier(identifier) {
      const module4 = this.modulesByIdentifier.get(identifier);
      if (module4) {
        this.disconnectModule(module4);
      }
    }
    getContextForElementAndIdentifier(element, identifier) {
      const module4 = this.modulesByIdentifier.get(identifier);
      if (module4) {
        return module4.contexts.find((context) => context.element == element);
      }
    }
    handleError(error3, message, detail) {
      this.application.handleError(error3, message, detail);
    }
    createScopeForElementAndIdentifier(element, identifier) {
      return new Scope(this.schema, element, identifier, this.logger);
    }
    scopeConnected(scope) {
      this.scopesByIdentifier.add(scope.identifier, scope);
      const module4 = this.modulesByIdentifier.get(scope.identifier);
      if (module4) {
        module4.connectContextForScope(scope);
      }
    }
    scopeDisconnected(scope) {
      this.scopesByIdentifier.delete(scope.identifier, scope);
      const module4 = this.modulesByIdentifier.get(scope.identifier);
      if (module4) {
        module4.disconnectContextForScope(scope);
      }
    }
    connectModule(module4) {
      this.modulesByIdentifier.set(module4.identifier, module4);
      const scopes = this.scopesByIdentifier.getValuesForKey(module4.identifier);
      scopes.forEach((scope) => module4.connectContextForScope(scope));
    }
    disconnectModule(module4) {
      this.modulesByIdentifier.delete(module4.identifier);
      const scopes = this.scopesByIdentifier.getValuesForKey(module4.identifier);
      scopes.forEach((scope) => module4.disconnectContextForScope(scope));
    }
  };
  var defaultSchema = {
    controllerAttribute: "data-controller",
    actionAttribute: "data-action",
    targetAttribute: "data-target",
    targetAttributeForScope: (identifier) => `data-${identifier}-target`,
    outletAttributeForScope: (identifier, outlet) => `data-${identifier}-${outlet}-outlet`,
    keyMappings: Object.assign(Object.assign({ enter: "Enter", tab: "Tab", esc: "Escape", space: " ", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", home: "Home", end: "End" }, objectFromEntries("abcdefghijklmnopqrstuvwxyz".split("").map((c) => [c, c]))), objectFromEntries("0123456789".split("").map((n) => [n, n])))
  };
  function objectFromEntries(array) {
    return array.reduce((memo, [k, v]) => Object.assign(Object.assign({}, memo), { [k]: v }), {});
  }
  var Application = class {
    constructor(element = document.documentElement, schema2 = defaultSchema) {
      this.logger = console;
      this.debug = false;
      this.logDebugActivity = (identifier, functionName, detail = {}) => {
        if (this.debug) {
          this.logFormattedMessage(identifier, functionName, detail);
        }
      };
      this.element = element;
      this.schema = schema2;
      this.dispatcher = new Dispatcher(this);
      this.router = new Router(this);
      this.actionDescriptorFilters = Object.assign({}, defaultActionDescriptorFilters);
    }
    static start(element, schema2) {
      const application2 = new this(element, schema2);
      application2.start();
      return application2;
    }
    async start() {
      await domReady();
      this.logDebugActivity("application", "starting");
      this.dispatcher.start();
      this.router.start();
      this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping");
      this.dispatcher.stop();
      this.router.stop();
      this.logDebugActivity("application", "stop");
    }
    register(identifier, controllerConstructor) {
      this.load({ identifier, controllerConstructor });
    }
    registerActionOption(name4, filter) {
      this.actionDescriptorFilters[name4] = filter;
    }
    load(head, ...rest) {
      const definitions = Array.isArray(head) ? head : [head, ...rest];
      definitions.forEach((definition) => {
        if (definition.controllerConstructor.shouldLoad) {
          this.router.loadDefinition(definition);
        }
      });
    }
    unload(head, ...rest) {
      const identifiers = Array.isArray(head) ? head : [head, ...rest];
      identifiers.forEach((identifier) => this.router.unloadIdentifier(identifier));
    }
    get controllers() {
      return this.router.contexts.map((context) => context.controller);
    }
    getControllerForElementAndIdentifier(element, identifier) {
      const context = this.router.getContextForElementAndIdentifier(element, identifier);
      return context ? context.controller : null;
    }
    handleError(error3, message, detail) {
      var _a;
      this.logger.error(`%s

%o

%o`, message, error3, detail);
      (_a = window.onerror) === null || _a === void 0 ? void 0 : _a.call(window, message, "", 0, 0, error3);
    }
    logFormattedMessage(identifier, functionName, detail = {}) {
      detail = Object.assign({ application: this }, detail);
      this.logger.groupCollapsed(`${identifier} #${functionName}`);
      this.logger.log("details:", Object.assign({}, detail));
      this.logger.groupEnd();
    }
  };
  function domReady() {
    return new Promise((resolve) => {
      if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => resolve());
      } else {
        resolve();
      }
    });
  }
  function ClassPropertiesBlessing(constructor) {
    const classes = readInheritableStaticArrayValues(constructor, "classes");
    return classes.reduce((properties, classDefinition) => {
      return Object.assign(properties, propertiesForClassDefinition(classDefinition));
    }, {});
  }
  function propertiesForClassDefinition(key) {
    return {
      [`${key}Class`]: {
        get() {
          const { classes } = this;
          if (classes.has(key)) {
            return classes.get(key);
          } else {
            const attribute = classes.getAttributeName(key);
            throw new Error(`Missing attribute "${attribute}"`);
          }
        }
      },
      [`${key}Classes`]: {
        get() {
          return this.classes.getAll(key);
        }
      },
      [`has${capitalize(key)}Class`]: {
        get() {
          return this.classes.has(key);
        }
      }
    };
  }
  function OutletPropertiesBlessing(constructor) {
    const outlets = readInheritableStaticArrayValues(constructor, "outlets");
    return outlets.reduce((properties, outletDefinition) => {
      return Object.assign(properties, propertiesForOutletDefinition(outletDefinition));
    }, {});
  }
  function propertiesForOutletDefinition(name4) {
    const camelizedName = namespaceCamelize(name4);
    return {
      [`${camelizedName}Outlet`]: {
        get() {
          const outlet = this.outlets.find(name4);
          if (outlet) {
            const outletController = this.application.getControllerForElementAndIdentifier(outlet, name4);
            if (outletController) {
              return outletController;
            } else {
              throw new Error(`Missing "data-controller=${name4}" attribute on outlet element for "${this.identifier}" controller`);
            }
          }
          throw new Error(`Missing outlet element "${name4}" for "${this.identifier}" controller`);
        }
      },
      [`${camelizedName}Outlets`]: {
        get() {
          const outlets = this.outlets.findAll(name4);
          if (outlets.length > 0) {
            return outlets.map((outlet) => {
              const controller = this.application.getControllerForElementAndIdentifier(outlet, name4);
              if (controller) {
                return controller;
              } else {
                console.warn(`The provided outlet element is missing the outlet controller "${name4}" for "${this.identifier}"`, outlet);
              }
            }).filter((controller) => controller);
          }
          return [];
        }
      },
      [`${camelizedName}OutletElement`]: {
        get() {
          const outlet = this.outlets.find(name4);
          if (outlet) {
            return outlet;
          } else {
            throw new Error(`Missing outlet element "${name4}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${camelizedName}OutletElements`]: {
        get() {
          return this.outlets.findAll(name4);
        }
      },
      [`has${capitalize(camelizedName)}Outlet`]: {
        get() {
          return this.outlets.has(name4);
        }
      }
    };
  }
  function TargetPropertiesBlessing(constructor) {
    const targets = readInheritableStaticArrayValues(constructor, "targets");
    return targets.reduce((properties, targetDefinition) => {
      return Object.assign(properties, propertiesForTargetDefinition(targetDefinition));
    }, {});
  }
  function propertiesForTargetDefinition(name4) {
    return {
      [`${name4}Target`]: {
        get() {
          const target = this.targets.find(name4);
          if (target) {
            return target;
          } else {
            throw new Error(`Missing target element "${name4}" for "${this.identifier}" controller`);
          }
        }
      },
      [`${name4}Targets`]: {
        get() {
          return this.targets.findAll(name4);
        }
      },
      [`has${capitalize(name4)}Target`]: {
        get() {
          return this.targets.has(name4);
        }
      }
    };
  }
  function ValuePropertiesBlessing(constructor) {
    const valueDefinitionPairs = readInheritableStaticObjectPairs(constructor, "values");
    const propertyDescriptorMap = {
      valueDescriptorMap: {
        get() {
          return valueDefinitionPairs.reduce((result, valueDefinitionPair) => {
            const valueDescriptor = parseValueDefinitionPair(valueDefinitionPair, this.identifier);
            const attributeName = this.data.getAttributeNameForKey(valueDescriptor.key);
            return Object.assign(result, { [attributeName]: valueDescriptor });
          }, {});
        }
      }
    };
    return valueDefinitionPairs.reduce((properties, valueDefinitionPair) => {
      return Object.assign(properties, propertiesForValueDefinitionPair(valueDefinitionPair));
    }, propertyDescriptorMap);
  }
  function propertiesForValueDefinitionPair(valueDefinitionPair, controller) {
    const definition = parseValueDefinitionPair(valueDefinitionPair, controller);
    const { key, name: name4, reader: read, writer: write } = definition;
    return {
      [name4]: {
        get() {
          const value = this.data.get(key);
          if (value !== null) {
            return read(value);
          } else {
            return definition.defaultValue;
          }
        },
        set(value) {
          if (value === void 0) {
            this.data.delete(key);
          } else {
            this.data.set(key, write(value));
          }
        }
      },
      [`has${capitalize(name4)}`]: {
        get() {
          return this.data.has(key) || definition.hasCustomDefaultValue;
        }
      }
    };
  }
  function parseValueDefinitionPair([token, typeDefinition], controller) {
    return valueDescriptorForTokenAndTypeDefinition({
      controller,
      token,
      typeDefinition
    });
  }
  function parseValueTypeConstant(constant) {
    switch (constant) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function parseValueTypeDefault(defaultValue) {
    switch (typeof defaultValue) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(defaultValue))
      return "array";
    if (Object.prototype.toString.call(defaultValue) === "[object Object]")
      return "object";
  }
  function parseValueTypeObject(payload) {
    const typeFromObject = parseValueTypeConstant(payload.typeObject.type);
    if (!typeFromObject)
      return;
    const defaultValueType = parseValueTypeDefault(payload.typeObject.default);
    if (typeFromObject !== defaultValueType) {
      const propertyPath = payload.controller ? `${payload.controller}.${payload.token}` : payload.token;
      throw new Error(`The specified default value for the Stimulus Value "${propertyPath}" must match the defined type "${typeFromObject}". The provided default value of "${payload.typeObject.default}" is of type "${defaultValueType}".`);
    }
    return typeFromObject;
  }
  function parseValueTypeDefinition(payload) {
    const typeFromObject = parseValueTypeObject({
      controller: payload.controller,
      token: payload.token,
      typeObject: payload.typeDefinition
    });
    const typeFromDefaultValue = parseValueTypeDefault(payload.typeDefinition);
    const typeFromConstant = parseValueTypeConstant(payload.typeDefinition);
    const type = typeFromObject || typeFromDefaultValue || typeFromConstant;
    if (type)
      return type;
    const propertyPath = payload.controller ? `${payload.controller}.${payload.typeDefinition}` : payload.token;
    throw new Error(`Unknown value type "${propertyPath}" for "${payload.token}" value`);
  }
  function defaultValueForDefinition(typeDefinition) {
    const constant = parseValueTypeConstant(typeDefinition);
    if (constant)
      return defaultValuesByType[constant];
    const defaultValue = typeDefinition.default;
    if (defaultValue !== void 0)
      return defaultValue;
    return typeDefinition;
  }
  function valueDescriptorForTokenAndTypeDefinition(payload) {
    const key = `${dasherize(payload.token)}-value`;
    const type = parseValueTypeDefinition(payload);
    return {
      type,
      key,
      name: camelize(key),
      get defaultValue() {
        return defaultValueForDefinition(payload.typeDefinition);
      },
      get hasCustomDefaultValue() {
        return parseValueTypeDefault(payload.typeDefinition) !== void 0;
      },
      reader: readers[type],
      writer: writers[type] || writers.default
    };
  }
  var defaultValuesByType = {
    get array() {
      return [];
    },
    boolean: false,
    number: 0,
    get object() {
      return {};
    },
    string: ""
  };
  var readers = {
    array(value) {
      const array = JSON.parse(value);
      if (!Array.isArray(array)) {
        throw new TypeError(`expected value of type "array" but instead got value "${value}" of type "${parseValueTypeDefault(array)}"`);
      }
      return array;
    },
    boolean(value) {
      return !(value == "0" || String(value).toLowerCase() == "false");
    },
    number(value) {
      return Number(value);
    },
    object(value) {
      const object = JSON.parse(value);
      if (object === null || typeof object != "object" || Array.isArray(object)) {
        throw new TypeError(`expected value of type "object" but instead got value "${value}" of type "${parseValueTypeDefault(object)}"`);
      }
      return object;
    },
    string(value) {
      return value;
    }
  };
  var writers = {
    default: writeString,
    array: writeJSON,
    object: writeJSON
  };
  function writeJSON(value) {
    return JSON.stringify(value);
  }
  function writeString(value) {
    return `${value}`;
  }
  var Controller = class {
    constructor(context) {
      this.context = context;
    }
    static get shouldLoad() {
      return true;
    }
    static afterLoad(_identifier, _application) {
      return;
    }
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {
    }
    connect() {
    }
    disconnect() {
    }
    dispatch(eventName, { target = this.element, detail = {}, prefix = this.identifier, bubbles = true, cancelable = true } = {}) {
      const type = prefix ? `${prefix}:${eventName}` : eventName;
      const event = new CustomEvent(type, { detail, bubbles, cancelable });
      target.dispatchEvent(event);
      return event;
    }
  };
  Controller.blessings = [
    ClassPropertiesBlessing,
    TargetPropertiesBlessing,
    ValuePropertiesBlessing,
    OutletPropertiesBlessing
  ];
  Controller.targets = [];
  Controller.outlets = [];
  Controller.values = {};

  // ../../node_modules/stimulus_reflex/node_modules/cable_ready/dist/cable_ready.js
  var name2 = "cable_ready";
  var version2 = "5.0.6";
  var description2 = "CableReady helps you create great real-time user experiences by making it simple to trigger client-side DOM changes from server-side Ruby.";
  var keywords2 = ["ruby", "rails", "websockets", "actioncable", "cable", "ssr", "stimulus_reflex", "client-side", "dom"];
  var homepage2 = "https://cableready.stimulusreflex.com";
  var bugs2 = "https://github.com/stimulusreflex/cable_ready/issues";
  var repository2 = "https://github.com/stimulusreflex/cable_ready";
  var license2 = "MIT";
  var author2 = "Nathan Hopkins <natehop@gmail.com>";
  var contributors2 = ["Andrew Mason <andrewmcodes@protonmail.com>", "Julian Rubisch <julian@julianrubisch.at>", "Marco Roth <marco.roth@intergga.ch>", "Nathan Hopkins <natehop@gmail.com>"];
  var main2 = "./dist/cable_ready.js";
  var module2 = "./dist/cable_ready.js";
  var browser2 = "./dist/cable_ready.js";
  var unpkg2 = "./dist/cable_ready.umd.js";
  var umd2 = "./dist/cable_ready.umd.js";
  var files2 = ["dist/*", "javascript/*"];
  var scripts2 = {
    lint: "yarn run format --check",
    format: "yarn run prettier-standard ./javascript/**/*.js rollup.config.mjs",
    build: "yarn rollup -c",
    watch: "yarn rollup -wc",
    test: "web-test-runner javascript/test/**/*.test.js",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs && cp ./docs/_redirects ./docs/.vitepress/dist",
    "docs:preview": "vitepress preview docs"
  };
  var dependencies2 = {
    morphdom: "2.6.1"
  };
  var devDependencies2 = {
    "@open-wc/testing": "^4.0.0",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^15.3.0",
    "@rollup/plugin-terser": "^0.4.4",
    "@web/dev-server-esbuild": "^1.0.3",
    "@web/dev-server-rollup": "^0.6.4",
    "@web/test-runner": "^0.19.0",
    "prettier-standard": "^16.4.1",
    rollup: "^4.25.0",
    sinon: "^19.0.2",
    vite: "^5.4.10",
    vitepress: "^1.5.0",
    "vitepress-plugin-search": "^1.0.4-alpha.22"
  };
  var packageInfo2 = {
    name: name2,
    version: version2,
    description: description2,
    keywords: keywords2,
    homepage: homepage2,
    bugs: bugs2,
    repository: repository2,
    license: license2,
    author: author2,
    contributors: contributors2,
    main: main2,
    module: module2,
    browser: browser2,
    import: "./dist/cable_ready.js",
    unpkg: unpkg2,
    umd: umd2,
    files: files2,
    scripts: scripts2,
    dependencies: dependencies2,
    devDependencies: devDependencies2
  };
  var inputTags2 = {
    INPUT: true,
    TEXTAREA: true,
    SELECT: true
  };
  var mutableTags2 = {
    INPUT: true,
    TEXTAREA: true,
    OPTION: true
  };
  var textInputTypes2 = {
    "datetime-local": true,
    "select-multiple": true,
    "select-one": true,
    color: true,
    date: true,
    datetime: true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    textarea: true,
    time: true,
    url: true,
    week: true
  };
  var activeElement2;
  var ActiveElement2 = {
    get element() {
      return activeElement2;
    },
    set(element) {
      activeElement2 = element;
    }
  };
  var isTextInput2 = (element) => inputTags2[element.tagName] && textInputTypes2[element.type];
  var assignFocus2 = (selector) => {
    const element = selector && selector.nodeType === Node.ELEMENT_NODE ? selector : document.querySelector(selector);
    const focusElement = element || ActiveElement2.element;
    if (focusElement && focusElement.focus) focusElement.focus();
  };
  var dispatch3 = (element, name4, detail = {}) => {
    const init = {
      bubbles: true,
      cancelable: true,
      detail
    };
    const event = new CustomEvent(name4, init);
    element.dispatchEvent(event);
    if (window.jQuery) window.jQuery(element).trigger(name4, detail);
  };
  var xpathToElement2 = (xpath) => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  var xpathToElementArray2 = (xpath, reverse = false) => {
    const snapshotList = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const snapshots = [];
    for (let i = 0; i < snapshotList.snapshotLength; i++) {
      snapshots.push(snapshotList.snapshotItem(i));
    }
    return reverse ? snapshots.reverse() : snapshots;
  };
  var getClassNames2 = (names) => Array.from(names).flat();
  var processElements2 = (operation, callback) => {
    Array.from(operation.selectAll ? operation.element : [operation.element]).forEach(callback);
  };
  var kebabize2 = createCompounder2(function(result, word, index) {
    return result + (index ? "-" : "") + word.toLowerCase();
  });
  function createCompounder2(callback) {
    return function(str) {
      return words2(str).reduce(callback, "");
    };
  }
  var words2 = (str) => {
    str = str == null ? "" : str;
    return str.match(/([A-Z]{2,}|[0-9]+|[A-Z]?[a-z]+|[A-Z])/g) || [];
  };
  var operate2 = (operation, callback) => {
    if (!operation.cancel) {
      operation.delay ? setTimeout(callback, operation.delay) : callback();
      return true;
    }
    return false;
  };
  var before2 = (target, operation) => dispatch3(target, `cable-ready:before-${kebabize2(operation.operation)}`, operation);
  var after2 = (target, operation) => dispatch3(target, `cable-ready:after-${kebabize2(operation.operation)}`, operation);
  function debounce2(fn, delay = 250) {
    let timer;
    return (...args) => {
      const callback = () => fn.apply(this, args);
      if (timer) clearTimeout(timer);
      timer = setTimeout(callback, delay);
    };
  }
  function handleErrors2(response3) {
    if (!response3.ok) throw Error(response3.statusText);
    return response3;
  }
  function safeScalar2(val) {
    if (val !== void 0 && !["string", "number", "boolean"].includes(typeof val)) console.warn(`Operation expects a string, number or boolean, but got ${val} (${typeof val})`);
    return val != null ? val : "";
  }
  function safeString2(str) {
    if (str !== void 0 && typeof str !== "string") console.warn(`Operation expects a string, but got ${str} (${typeof str})`);
    return str != null ? String(str) : "";
  }
  function safeArray2(arr) {
    if (arr !== void 0 && !Array.isArray(arr)) console.warn(`Operation expects an array, but got ${arr} (${typeof arr})`);
    return arr != null ? Array.from(arr) : [];
  }
  function safeObject2(obj) {
    if (obj !== void 0 && typeof obj !== "object") console.warn(`Operation expects an object, but got ${obj} (${typeof obj})`);
    return obj != null ? Object(obj) : {};
  }
  function safeStringOrArray2(elem) {
    if (elem !== void 0 && !Array.isArray(elem) && typeof elem !== "string") console.warn(`Operation expects an Array or a String, but got ${elem} (${typeof elem})`);
    return elem == null ? "" : Array.isArray(elem) ? Array.from(elem) : String(elem);
  }
  function fragmentToString2(fragment) {
    return new XMLSerializer().serializeToString(fragment);
  }
  async function graciouslyFetch2(url, additionalHeaders) {
    try {
      const response3 = await fetch(url, {
        headers: {
          "X-REQUESTED-WITH": "XmlHttpRequest",
          ...additionalHeaders
        }
      });
      if (response3 == void 0) return;
      handleErrors2(response3);
      return response3;
    } catch (e) {
      console.error(`Could not fetch ${url}`);
    }
  }
  var BoundedQueue2 = class {
    constructor(maxSize) {
      this.maxSize = maxSize;
      this.queue = [];
    }
    push(item) {
      if (this.isFull()) {
        this.shift();
      }
      this.queue.push(item);
    }
    shift() {
      return this.queue.shift();
    }
    isFull() {
      return this.queue.length === this.maxSize;
    }
  };
  var utils2 = Object.freeze({
    __proto__: null,
    BoundedQueue: BoundedQueue2,
    after: after2,
    assignFocus: assignFocus2,
    before: before2,
    debounce: debounce2,
    dispatch: dispatch3,
    fragmentToString: fragmentToString2,
    getClassNames: getClassNames2,
    graciouslyFetch: graciouslyFetch2,
    handleErrors: handleErrors2,
    isTextInput: isTextInput2,
    kebabize: kebabize2,
    operate: operate2,
    processElements: processElements2,
    safeArray: safeArray2,
    safeObject: safeObject2,
    safeScalar: safeScalar2,
    safeString: safeString2,
    safeStringOrArray: safeStringOrArray2,
    xpathToElement: xpathToElement2,
    xpathToElementArray: xpathToElementArray2
  });
  var shouldMorph2 = (operation) => (fromEl, toEl) => !shouldMorphCallbacks2.map((callback) => typeof callback === "function" ? callback(operation, fromEl, toEl) : true).includes(false);
  var didMorph2 = (operation) => (el) => {
    didMorphCallbacks2.forEach((callback) => {
      if (typeof callback === "function") callback(operation, el);
    });
  };
  var verifyNotMutable2 = (detail, fromEl, toEl) => {
    if (!mutableTags2[fromEl.tagName] && fromEl.isEqualNode(toEl)) return false;
    return true;
  };
  var verifyNotContentEditable2 = (detail, fromEl, toEl) => {
    if (fromEl === ActiveElement2.element && fromEl.isContentEditable) return false;
    return true;
  };
  var verifyNotPermanent2 = (detail, fromEl, toEl) => {
    const { permanentAttributeName } = detail;
    if (!permanentAttributeName) return true;
    const permanent = fromEl.closest(`[${permanentAttributeName}]`);
    if (!permanent && fromEl === ActiveElement2.element && isTextInput2(fromEl)) {
      const ignore = {
        value: true
      };
      Array.from(toEl.attributes).forEach((attribute) => {
        if (!ignore[attribute.name]) fromEl.setAttribute(attribute.name, attribute.value);
      });
      return false;
    }
    return !permanent;
  };
  var shouldMorphCallbacks2 = [verifyNotMutable2, verifyNotPermanent2, verifyNotContentEditable2];
  var didMorphCallbacks2 = [];
  var morph_callbacks2 = Object.freeze({
    __proto__: null,
    didMorph: didMorph2,
    didMorphCallbacks: didMorphCallbacks2,
    shouldMorph: shouldMorph2,
    shouldMorphCallbacks: shouldMorphCallbacks2,
    verifyNotContentEditable: verifyNotContentEditable2,
    verifyNotMutable: verifyNotMutable2,
    verifyNotPermanent: verifyNotPermanent2
  });
  var Operations2 = {
    // DOM Mutations
    append: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { html, focusSelector } = operation;
          element.insertAdjacentHTML("beforeend", safeScalar2(html));
          assignFocus2(focusSelector);
        });
        after2(element, operation);
      });
    },
    graft: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { parent, focusSelector } = operation;
          const parentElement = document.querySelector(parent);
          if (parentElement) {
            parentElement.appendChild(element);
            assignFocus2(focusSelector);
          }
        });
        after2(element, operation);
      });
    },
    innerHtml: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { html, focusSelector } = operation;
          element.innerHTML = safeScalar2(html);
          assignFocus2(focusSelector);
        });
        after2(element, operation);
      });
    },
    insertAdjacentHtml: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { html, position, focusSelector } = operation;
          element.insertAdjacentHTML(position || "beforeend", safeScalar2(html));
          assignFocus2(focusSelector);
        });
        after2(element, operation);
      });
    },
    insertAdjacentText: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { text, position, focusSelector } = operation;
          element.insertAdjacentText(position || "beforeend", safeScalar2(text));
          assignFocus2(focusSelector);
        });
        after2(element, operation);
      });
    },
    outerHtml: (operation) => {
      processElements2(operation, (element) => {
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before2(element, operation);
        operate2(operation, () => {
          const { html, focusSelector } = operation;
          element.outerHTML = safeScalar2(html);
          assignFocus2(focusSelector);
        });
        after2(parent ? parent.children[idx] : document.documentElement, operation);
      });
    },
    prepend: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { html, focusSelector } = operation;
          element.insertAdjacentHTML("afterbegin", safeScalar2(html));
          assignFocus2(focusSelector);
        });
        after2(element, operation);
      });
    },
    remove: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { focusSelector } = operation;
          element.remove();
          assignFocus2(focusSelector);
        });
        after2(document, operation);
      });
    },
    replace: (operation) => {
      processElements2(operation, (element) => {
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before2(element, operation);
        operate2(operation, () => {
          const { html, focusSelector } = operation;
          element.outerHTML = safeScalar2(html);
          assignFocus2(focusSelector);
        });
        after2(parent ? parent.children[idx] : document.documentElement, operation);
      });
    },
    textContent: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { text, focusSelector } = operation;
          element.textContent = safeScalar2(text);
          assignFocus2(focusSelector);
        });
        after2(element, operation);
      });
    },
    // Element Property Mutations
    addCssClass: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { name: name4 } = operation;
          element.classList.add(...getClassNames2([safeStringOrArray2(name4)]));
        });
        after2(element, operation);
      });
    },
    removeAttribute: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { name: name4 } = operation;
          element.removeAttribute(safeString2(name4));
        });
        after2(element, operation);
      });
    },
    removeCssClass: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { name: name4 } = operation;
          element.classList.remove(...getClassNames2([safeStringOrArray2(name4)]));
          if (element.classList.length === 0) element.removeAttribute("class");
        });
        after2(element, operation);
      });
    },
    setAttribute: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { name: name4, value } = operation;
          element.setAttribute(safeString2(name4), safeScalar2(value));
        });
        after2(element, operation);
      });
    },
    setDatasetProperty: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { name: name4, value } = operation;
          element.dataset[safeString2(name4)] = safeScalar2(value);
        });
        after2(element, operation);
      });
    },
    setProperty: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { name: name4, value } = operation;
          if (name4 in element) element[safeString2(name4)] = safeScalar2(value);
        });
        after2(element, operation);
      });
    },
    setStyle: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { name: name4, value } = operation;
          element.style[safeString2(name4)] = safeScalar2(value);
        });
        after2(element, operation);
      });
    },
    setStyles: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { styles } = operation;
          for (let [name4, value] of Object.entries(styles)) element.style[safeString2(name4)] = safeScalar2(value);
        });
        after2(element, operation);
      });
    },
    setValue: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { value } = operation;
          element.value = safeScalar2(value);
        });
        after2(element, operation);
      });
    },
    // DOM Events and Meta-Operations
    dispatchEvent: (operation) => {
      processElements2(operation, (element) => {
        before2(element, operation);
        operate2(operation, () => {
          const { name: name4, detail } = operation;
          dispatch3(element, safeString2(name4), safeObject2(detail));
        });
        after2(element, operation);
      });
    },
    setMeta: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { name: name4, content } = operation;
        let meta = document.head.querySelector(`meta[name='${name4}']`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.name = safeString2(name4);
          document.head.appendChild(meta);
        }
        meta.content = safeScalar2(content);
      });
      after2(document, operation);
    },
    setTitle: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { title } = operation;
        document.title = safeScalar2(title);
      });
      after2(document, operation);
    },
    // Browser Manipulations
    clearStorage: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.clear();
      });
      after2(document, operation);
    },
    go: (operation) => {
      before2(window, operation);
      operate2(operation, () => {
        const { delta } = operation;
        history.go(delta);
      });
      after2(window, operation);
    },
    pushState: (operation) => {
      before2(window, operation);
      operate2(operation, () => {
        const { state, title, url } = operation;
        history.pushState(safeObject2(state), safeString2(title), safeString2(url));
      });
      after2(window, operation);
    },
    redirectTo: (operation) => {
      before2(window, operation);
      operate2(operation, () => {
        let { url, action, turbo } = operation;
        action = action || "advance";
        url = safeString2(url);
        if (turbo === void 0) turbo = true;
        if (turbo) {
          if (window.Turbo) window.Turbo.visit(url, {
            action
          });
          if (window.Turbolinks) window.Turbolinks.visit(url, {
            action
          });
          if (!window.Turbo && !window.Turbolinks) window.location.href = url;
        } else {
          window.location.href = url;
        }
      });
      after2(window, operation);
    },
    reload: (operation) => {
      before2(window, operation);
      operate2(operation, () => {
        window.location.reload();
      });
      after2(window, operation);
    },
    removeStorageItem: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { key, type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.removeItem(safeString2(key));
      });
      after2(document, operation);
    },
    replaceState: (operation) => {
      before2(window, operation);
      operate2(operation, () => {
        const { state, title, url } = operation;
        history.replaceState(safeObject2(state), safeString2(title), safeString2(url));
      });
      after2(window, operation);
    },
    scrollIntoView: (operation) => {
      const { element } = operation;
      before2(element, operation);
      operate2(operation, () => {
        element.scrollIntoView(operation);
      });
      after2(element, operation);
    },
    setCookie: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { cookie } = operation;
        document.cookie = safeScalar2(cookie);
      });
      after2(document, operation);
    },
    setFocus: (operation) => {
      const { element } = operation;
      before2(element, operation);
      operate2(operation, () => {
        assignFocus2(element);
      });
      after2(element, operation);
    },
    setStorageItem: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { key, value, type } = operation;
        const storage = type === "session" ? sessionStorage : localStorage;
        storage.setItem(safeString2(key), safeScalar2(value));
      });
      after2(document, operation);
    },
    // Notifications
    consoleLog: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { message, level } = operation;
        level && ["warn", "info", "error"].includes(level) ? console[level](message) : console.log(message);
      });
      after2(document, operation);
    },
    consoleTable: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { data, columns } = operation;
        console.table(data, safeArray2(columns));
      });
      after2(document, operation);
    },
    notification: (operation) => {
      before2(document, operation);
      operate2(operation, () => {
        const { title, options } = operation;
        Notification.requestPermission().then((result) => {
          operation.permission = result;
          if (result === "granted") new Notification(safeString2(title), safeObject2(options));
        });
      });
      after2(document, operation);
    },
    // Morph operations
    morph: (operation) => {
      processElements2(operation, (element) => {
        const { html } = operation;
        const template3 = document.createElement("template");
        template3.innerHTML = String(safeScalar2(html)).trim();
        operation.content = template3.content;
        const parent = element.parentElement;
        const idx = parent && Array.from(parent.children).indexOf(element);
        before2(element, operation);
        operate2(operation, () => {
          const { childrenOnly, focusSelector } = operation;
          morphdom_esm_default(element, childrenOnly ? template3.content : template3.innerHTML, {
            childrenOnly: !!childrenOnly,
            onBeforeElUpdated: shouldMorph2(operation),
            onElUpdated: didMorph2(operation)
          });
          assignFocus2(focusSelector);
        });
        after2(parent ? parent.children[idx] : document.documentElement, operation);
      });
    }
  };
  var operations2 = Operations2;
  var add3 = (newOperations) => {
    operations2 = {
      ...operations2,
      ...newOperations
    };
  };
  var addOperations2 = (operations3) => {
    add3(operations3);
  };
  var addOperation2 = (name4, operation) => {
    const operations3 = {};
    operations3[name4] = operation;
    add3(operations3);
  };
  var OperationStore2 = {
    get all() {
      return operations2;
    }
  };
  var missingElement2 = "warn";
  var MissingElement2 = {
    get behavior() {
      return missingElement2;
    },
    set(value) {
      if (["warn", "ignore", "event", "exception"].includes(value)) missingElement2 = value;
      else console.warn("Invalid 'onMissingElement' option. Defaulting to 'warn'.");
    }
  };
  var perform2 = (operations3, options = {
    onMissingElement: MissingElement2.behavior
  }) => {
    const batches = {};
    operations3.forEach((operation) => {
      if (!!operation.batch) batches[operation.batch] = batches[operation.batch] ? ++batches[operation.batch] : 1;
    });
    operations3.forEach((operation) => {
      const name4 = operation.operation;
      try {
        if (operation.selector) {
          if (operation.xpath) {
            operation.element = operation.selectAll ? xpathToElementArray2(operation.selector) : xpathToElement2(operation.selector);
          } else {
            operation.element = operation.selectAll ? document.querySelectorAll(operation.selector) : document.querySelector(operation.selector);
          }
        } else {
          operation.element = document;
        }
        if (operation.element || options.onMissingElement !== "ignore") {
          ActiveElement2.set(document.activeElement);
          const cableReadyOperation = OperationStore2.all[name4];
          if (cableReadyOperation) {
            cableReadyOperation(operation);
            if (!!operation.batch && --batches[operation.batch] === 0) dispatch3(document, "cable-ready:batch-complete", {
              batch: operation.batch
            });
          } else {
            console.error(`CableReady couldn't find the "${name4}" operation. Make sure you use the camelized form when calling an operation method.`);
          }
        }
      } catch (e) {
        if (operation.element) {
          console.error(`CableReady detected an error in ${name4 || "operation"}: ${e.message}. If you need to support older browsers make sure you've included the corresponding polyfills. https://docs.stimulusreflex.com/setup#polyfills-for-ie11.`);
          console.error(e);
        } else {
          const warning = `CableReady ${name4 || ""} operation failed due to missing DOM element for selector: '${operation.selector}'`;
          switch (options.onMissingElement) {
            case "ignore":
              break;
            case "event":
              dispatch3(document, "cable-ready:missing-element", {
                warning,
                operation
              });
              break;
            case "exception":
              throw warning;
            default:
              console.warn(warning);
          }
        }
      }
    });
  };
  var performAsync2 = (operations3, options = {
    onMissingElement: MissingElement2.behavior
  }) => new Promise((resolve, reject) => {
    try {
      resolve(perform2(operations3, options));
    } catch (err) {
      reject(err);
    }
  });
  var SubscribingElement2 = class extends HTMLElement {
    static get tagName() {
      throw new Error("Implement the tagName() getter in the inheriting class");
    }
    static define() {
      if (!customElements.get(this.tagName)) {
        customElements.define(this.tagName, this);
      }
    }
    disconnectedCallback() {
      if (this.channel) this.channel.unsubscribe();
    }
    createSubscription(consumer5, channel, receivedCallback) {
      this.channel = consumer5.subscriptions.create({
        channel,
        identifier: this.identifier
      }, {
        received: receivedCallback
      });
    }
    get preview() {
      return document.documentElement.hasAttribute("data-turbolinks-preview") || document.documentElement.hasAttribute("data-turbo-preview");
    }
    get identifier() {
      return this.getAttribute("identifier");
    }
  };
  var consumer3;
  var BACKOFF2 = [25, 50, 75, 100, 200, 250, 500, 800, 1e3, 2e3];
  var wait2 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var getConsumerWithRetry2 = async (retry = 0) => {
    if (consumer3) return consumer3;
    if (retry >= BACKOFF2.length) {
      throw new Error("Couldn't obtain a Action Cable consumer within 5s");
    }
    await wait2(BACKOFF2[retry]);
    return await getConsumerWithRetry2(retry + 1);
  };
  var CableConsumer2 = {
    setConsumer(value) {
      consumer3 = value;
    },
    get consumer() {
      return consumer3;
    },
    async getConsumer() {
      return await getConsumerWithRetry2();
    }
  };
  var StreamFromElement2 = class extends SubscribingElement2 {
    static get tagName() {
      return "cable-ready-stream-from";
    }
    async connectedCallback() {
      if (this.preview) return;
      const consumer5 = await CableConsumer2.getConsumer();
      if (consumer5) {
        this.createSubscription(consumer5, "CableReady::Stream", this.performOperations.bind(this));
      } else {
        console.error("The `cable_ready_stream_from` helper cannot connect. You must initialize CableReady with an Action Cable consumer.");
      }
    }
    performOperations(data) {
      if (data.cableReady) perform2(data.operations, {
        onMissingElement: this.onMissingElement
      });
    }
    get onMissingElement() {
      const value = this.getAttribute("missing") || MissingElement2.behavior;
      if (["warn", "ignore", "event"].includes(value)) return value;
      else {
        console.warn("Invalid 'missing' attribute. Defaulting to 'warn'.");
        return "warn";
      }
    }
  };
  var debugging2 = false;
  var Debug3 = {
    get enabled() {
      return debugging2;
    },
    get disabled() {
      return !debugging2;
    },
    get value() {
      return debugging2;
    },
    set(value) {
      debugging2 = !!value;
    },
    set debug(value) {
      debugging2 = !!value;
    }
  };
  var request2 = (data, blocks) => {
    if (Debug3.disabled) return;
    const message = `\u2191 Updatable request affecting ${blocks.length} element(s): `;
    console.log(message, {
      elements: blocks.map((b) => b.element),
      identifiers: blocks.map((b) => b.element.getAttribute("identifier")),
      data
    });
    return message;
  };
  var cancel2 = (timestamp, reason) => {
    if (Debug3.disabled) return;
    const duration2 = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u274C Updatable request canceled after ${duration2}ms: ${reason}`;
    console.log(message);
    return message;
  };
  var response2 = (timestamp, element, urls) => {
    if (Debug3.disabled) return;
    const duration2 = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u2193 Updatable response: All URLs fetched in ${duration2}ms`;
    console.log(message, {
      element,
      urls
    });
    return message;
  };
  var morphStart2 = (timestamp, element) => {
    if (Debug3.disabled) return;
    const duration2 = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u21BB Updatable morph: starting after ${duration2}ms`;
    console.log(message, {
      element
    });
    return message;
  };
  var morphEnd2 = (timestamp, element) => {
    if (Debug3.disabled) return;
    const duration2 = /* @__PURE__ */ new Date() - timestamp;
    const message = `\u21BA Updatable morph: completed after ${duration2}ms`;
    console.log(message, {
      element
    });
    return message;
  };
  var Log2 = {
    request: request2,
    cancel: cancel2,
    response: response2,
    morphStart: morphStart2,
    morphEnd: morphEnd2
  };
  var AppearanceObserver3 = class {
    constructor(delegate, element = null) {
      this.delegate = delegate;
      this.element = element || delegate;
      this.started = false;
      this.intersecting = false;
      this.intersectionObserver = new IntersectionObserver(this.intersect);
    }
    start() {
      if (!this.started) {
        this.started = true;
        this.intersectionObserver.observe(this.element);
        this.observeVisibility();
      }
    }
    stop() {
      if (this.started) {
        this.started = false;
        this.intersectionObserver.unobserve(this.element);
        this.unobserveVisibility();
      }
    }
    observeVisibility = () => {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    };
    unobserveVisibility = () => {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    };
    intersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.target === this.element) {
          if (entry.isIntersecting && document.visibilityState === "visible") {
            this.intersecting = true;
            this.delegate.appearedInViewport();
          } else {
            this.intersecting = false;
            this.delegate.disappearedFromViewport();
          }
        }
      });
    };
    handleVisibilityChange = (event) => {
      if (document.visibilityState === "visible" && this.intersecting) {
        this.delegate.appearedInViewport();
      } else {
        this.delegate.disappearedFromViewport();
      }
    };
  };
  var template2 = `
<style>
  :host {
    display: block;
  }
</style>
<slot></slot>
`;
  var UpdatesForElement2 = class extends SubscribingElement2 {
    static get tagName() {
      return "cable-ready-updates-for";
    }
    constructor() {
      super();
      const shadowRoot = this.attachShadow({
        mode: "open"
      });
      shadowRoot.innerHTML = template2;
      this.triggerElementLog = new BoundedQueue2(10);
      this.targetElementLog = new BoundedQueue2(10);
      this.appearanceObserver = new AppearanceObserver3(this);
      this.visible = false;
      this.didTransitionToVisible = false;
    }
    async connectedCallback() {
      if (this.preview) return;
      this.update = debounce2(this.update.bind(this), this.debounce);
      const consumer5 = await CableConsumer2.getConsumer();
      if (consumer5) {
        this.createSubscription(consumer5, "CableReady::Stream", this.update);
      } else {
        console.error("The `cable_ready_updates_for` helper cannot connect. You must initialize CableReady with an Action Cable consumer.");
      }
      if (this.observeAppearance) {
        this.appearanceObserver.start();
      }
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.observeAppearance) {
        this.appearanceObserver.stop();
      }
    }
    async update(data) {
      this.lastUpdateTimestamp = /* @__PURE__ */ new Date();
      const blocks = Array.from(document.querySelectorAll(this.query), (element) => new Block2(element)).filter((block) => block.shouldUpdate(data));
      this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log2.request(data, blocks)}`);
      if (blocks.length === 0) {
        this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log2.cancel(this.lastUpdateTimestamp, "All elements filtered out")}`);
        return;
      }
      if (blocks[0].element !== this && !this.didTransitionToVisible) {
        this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log2.cancel(this.lastUpdateTimestamp, "Update already requested")}`);
        return;
      }
      ActiveElement2.set(document.activeElement);
      this.html = {};
      const uniqueUrls = [...new Set(blocks.map((block) => block.url))];
      await Promise.all(uniqueUrls.map(async (url) => {
        if (!this.html.hasOwnProperty(url)) {
          const response3 = await graciouslyFetch2(url, {
            "X-Cable-Ready": "update"
          });
          this.html[url] = await response3.text();
        }
      }));
      this.triggerElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log2.response(this.lastUpdateTimestamp, this, uniqueUrls)}`);
      this.index = {};
      blocks.forEach((block) => {
        this.index.hasOwnProperty(block.url) ? this.index[block.url]++ : this.index[block.url] = 0;
        block.process(data, this.html, this.index, this.lastUpdateTimestamp);
      });
    }
    appearedInViewport() {
      if (!this.visible) {
        this.didTransitionToVisible = true;
        this.update({});
      }
      this.visible = true;
    }
    disappearedFromViewport() {
      this.visible = false;
    }
    get query() {
      return `${this.tagName}[identifier="${this.identifier}"]`;
    }
    get identifier() {
      return this.getAttribute("identifier");
    }
    get debounce() {
      return this.hasAttribute("debounce") ? parseInt(this.getAttribute("debounce")) : 20;
    }
    get observeAppearance() {
      return this.hasAttribute("observe-appearance");
    }
  };
  var Block2 = class {
    constructor(element) {
      this.element = element;
    }
    async process(data, html, fragmentsIndex, startTimestamp) {
      const blockIndex = fragmentsIndex[this.url];
      const template3 = document.createElement("template");
      this.element.setAttribute("updating", "updating");
      template3.innerHTML = String(html[this.url]).trim();
      await this.resolveTurboFrames(template3.content);
      const fragments = template3.content.querySelectorAll(this.query);
      if (fragments.length <= blockIndex) {
        console.warn(`Update aborted due to insufficient number of elements. The offending url is ${this.url}, the offending element is:`, this.element);
        return;
      }
      const operation = {
        element: this.element,
        html: fragments[blockIndex],
        permanentAttributeName: "data-ignore-updates"
      };
      dispatch3(this.element, "cable-ready:before-update", operation);
      this.element.targetElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log2.morphStart(startTimestamp, this.element)}`);
      morphdom_esm_default(this.element, fragments[blockIndex], {
        childrenOnly: true,
        onBeforeElUpdated: shouldMorph2(operation),
        onElUpdated: (_) => {
          this.element.removeAttribute("updating");
          this.element.didTransitionToVisible = false;
          dispatch3(this.element, "cable-ready:after-update", operation);
          assignFocus2(operation.focusSelector);
        }
      });
      this.element.targetElementLog.push(`${(/* @__PURE__ */ new Date()).toLocaleString()}: ${Log2.morphEnd(startTimestamp, this.element)}`);
    }
    async resolveTurboFrames(documentFragment) {
      const reloadingTurboFrames = [...documentFragment.querySelectorAll('turbo-frame[src]:not([loading="lazy"])')];
      return Promise.all(reloadingTurboFrames.map((frame) => new Promise(async (resolve) => {
        const frameResponse = await graciouslyFetch2(frame.getAttribute("src"), {
          "Turbo-Frame": frame.id,
          "X-Cable-Ready": "update"
        });
        const frameTemplate = document.createElement("template");
        frameTemplate.innerHTML = await frameResponse.text();
        await this.resolveTurboFrames(frameTemplate.content);
        const selector = `turbo-frame#${frame.id}`;
        const frameContent = frameTemplate.content.querySelector(selector);
        const content = frameContent ? frameContent.innerHTML.trim() : "";
        documentFragment.querySelector(selector).innerHTML = content;
        resolve();
      })));
    }
    shouldUpdate(data) {
      return !this.ignoresInnerUpdates && this.hasChangesSelectedForUpdate(data) && (!this.observeAppearance || this.visible);
    }
    hasChangesSelectedForUpdate(data) {
      const only = this.element.getAttribute("only");
      return !(only && data.changed && !only.split(" ").some((attribute) => data.changed.includes(attribute)));
    }
    get ignoresInnerUpdates() {
      return this.element.hasAttribute("ignore-inner-updates") && this.element.hasAttribute("performing-inner-update");
    }
    get url() {
      return this.element.hasAttribute("url") ? this.element.getAttribute("url") : location.href;
    }
    get identifier() {
      return this.element.identifier;
    }
    get query() {
      return this.element.query;
    }
    get visible() {
      return this.element.visible;
    }
    get observeAppearance() {
      return this.element.observeAppearance;
    }
  };
  var registerInnerUpdates2 = () => {
    document.addEventListener("stimulus-reflex:before", (event) => {
      recursiveMarkUpdatesForElements2(event.detail.element);
    });
    document.addEventListener("stimulus-reflex:after", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements2(event.detail.element);
      });
    });
    document.addEventListener("turbo:submit-start", (event) => {
      recursiveMarkUpdatesForElements2(event.target);
    });
    document.addEventListener("turbo:submit-end", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements2(event.target);
      });
    });
    document.addEventListener("turbo-boost:command:start", (event) => {
      recursiveMarkUpdatesForElements2(event.target);
    });
    document.addEventListener("turbo-boost:command:finish", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements2(event.target);
      });
    });
    document.addEventListener("turbo-boost:command:error", (event) => {
      setTimeout(() => {
        recursiveUnmarkUpdatesForElements2(event.target);
      });
    });
  };
  var recursiveMarkUpdatesForElements2 = (leaf) => {
    const closestUpdatesFor = leaf && leaf.parentElement && leaf.parentElement.closest("cable-ready-updates-for");
    if (closestUpdatesFor) {
      closestUpdatesFor.setAttribute("performing-inner-update", "");
      recursiveMarkUpdatesForElements2(closestUpdatesFor);
    }
  };
  var recursiveUnmarkUpdatesForElements2 = (leaf) => {
    const closestUpdatesFor = leaf && leaf.parentElement && leaf.parentElement.closest("cable-ready-updates-for");
    if (closestUpdatesFor) {
      closestUpdatesFor.removeAttribute("performing-inner-update");
      recursiveUnmarkUpdatesForElements2(closestUpdatesFor);
    }
  };
  var defineElements2 = () => {
    registerInnerUpdates2();
    StreamFromElement2.define();
    UpdatesForElement2.define();
  };
  var initialize2 = (initializeOptions = {}) => {
    const { consumer: consumer5, onMissingElement, debug } = initializeOptions;
    Debug3.set(!!debug);
    if (consumer5) {
      CableConsumer2.setConsumer(consumer5);
    } else {
      console.error("CableReady requires a reference to your Action Cable `consumer` for its helpers to function.\nEnsure that you have imported the `CableReady` package as well as `consumer` from your `channels` folder, then call `CableReady.initialize({ consumer })`.");
    }
    if (onMissingElement) {
      MissingElement2.set(onMissingElement);
    }
    defineElements2();
  };
  var global2 = {
    perform: perform2,
    performAsync: performAsync2,
    shouldMorphCallbacks: shouldMorphCallbacks2,
    didMorphCallbacks: didMorphCallbacks2,
    initialize: initialize2,
    addOperation: addOperation2,
    addOperations: addOperations2,
    version: packageInfo2.version,
    cable: CableConsumer2,
    get DOMOperations() {
      console.warn("DEPRECATED: Please use `CableReady.operations` instead of `CableReady.DOMOperations`");
      return OperationStore2.all;
    },
    get operations() {
      return OperationStore2.all;
    },
    get consumer() {
      return CableConsumer2.consumer;
    }
  };
  window.CableReady = global2;

  // ../../node_modules/stimulus_reflex/node_modules/@rails/actioncable/app/assets/javascripts/actioncable.esm.js
  var adapters2 = {
    logger: typeof console !== "undefined" ? console : void 0,
    WebSocket: typeof WebSocket !== "undefined" ? WebSocket : void 0
  };
  var logger2 = {
    log(...messages) {
      if (this.enabled) {
        messages.push(Date.now());
        adapters2.logger.log("[ActionCable]", ...messages);
      }
    }
  };
  var now3 = () => (/* @__PURE__ */ new Date()).getTime();
  var secondsSince3 = (time) => (now3() - time) / 1e3;
  var ConnectionMonitor3 = class {
    constructor(connection) {
      this.visibilityDidChange = this.visibilityDidChange.bind(this);
      this.connection = connection;
      this.reconnectAttempts = 0;
    }
    start() {
      if (!this.isRunning()) {
        this.startedAt = now3();
        delete this.stoppedAt;
        this.startPolling();
        addEventListener("visibilitychange", this.visibilityDidChange);
        logger2.log(`ConnectionMonitor started. stale threshold = ${this.constructor.staleThreshold} s`);
      }
    }
    stop() {
      if (this.isRunning()) {
        this.stoppedAt = now3();
        this.stopPolling();
        removeEventListener("visibilitychange", this.visibilityDidChange);
        logger2.log("ConnectionMonitor stopped");
      }
    }
    isRunning() {
      return this.startedAt && !this.stoppedAt;
    }
    recordPing() {
      this.pingedAt = now3();
    }
    recordConnect() {
      this.reconnectAttempts = 0;
      this.recordPing();
      delete this.disconnectedAt;
      logger2.log("ConnectionMonitor recorded connect");
    }
    recordDisconnect() {
      this.disconnectedAt = now3();
      logger2.log("ConnectionMonitor recorded disconnect");
    }
    startPolling() {
      this.stopPolling();
      this.poll();
    }
    stopPolling() {
      clearTimeout(this.pollTimeout);
    }
    poll() {
      this.pollTimeout = setTimeout(() => {
        this.reconnectIfStale();
        this.poll();
      }, this.getPollInterval());
    }
    getPollInterval() {
      const { staleThreshold, reconnectionBackoffRate } = this.constructor;
      const backoff = Math.pow(1 + reconnectionBackoffRate, Math.min(this.reconnectAttempts, 10));
      const jitterMax = this.reconnectAttempts === 0 ? 1 : reconnectionBackoffRate;
      const jitter = jitterMax * Math.random();
      return staleThreshold * 1e3 * backoff * (1 + jitter);
    }
    reconnectIfStale() {
      if (this.connectionIsStale()) {
        logger2.log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, time stale = ${secondsSince3(this.refreshedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
        this.reconnectAttempts++;
        if (this.disconnectedRecently()) {
          logger2.log(`ConnectionMonitor skipping reopening recent disconnect. time disconnected = ${secondsSince3(this.disconnectedAt)} s`);
        } else {
          logger2.log("ConnectionMonitor reopening");
          this.connection.reopen();
        }
      }
    }
    get refreshedAt() {
      return this.pingedAt ? this.pingedAt : this.startedAt;
    }
    connectionIsStale() {
      return secondsSince3(this.refreshedAt) > this.constructor.staleThreshold;
    }
    disconnectedRecently() {
      return this.disconnectedAt && secondsSince3(this.disconnectedAt) < this.constructor.staleThreshold;
    }
    visibilityDidChange() {
      if (document.visibilityState === "visible") {
        setTimeout(() => {
          if (this.connectionIsStale() || !this.connection.isOpen()) {
            logger2.log(`ConnectionMonitor reopening stale connection on visibilitychange. visibilityState = ${document.visibilityState}`);
            this.connection.reopen();
          }
        }, 200);
      }
    }
  };
  ConnectionMonitor3.staleThreshold = 6;
  ConnectionMonitor3.reconnectionBackoffRate = 0.15;
  var INTERNAL2 = {
    message_types: {
      welcome: "welcome",
      disconnect: "disconnect",
      ping: "ping",
      confirmation: "confirm_subscription",
      rejection: "reject_subscription"
    },
    disconnect_reasons: {
      unauthorized: "unauthorized",
      invalid_request: "invalid_request",
      server_restart: "server_restart",
      remote: "remote"
    },
    default_mount_path: "/cable",
    protocols: ["actioncable-v1-json", "actioncable-unsupported"]
  };
  var { message_types: message_types3, protocols: protocols3 } = INTERNAL2;
  var supportedProtocols3 = protocols3.slice(0, protocols3.length - 1);
  var indexOf3 = [].indexOf;
  var Connection3 = class {
    constructor(consumer5) {
      this.open = this.open.bind(this);
      this.consumer = consumer5;
      this.subscriptions = this.consumer.subscriptions;
      this.monitor = new ConnectionMonitor3(this);
      this.disconnected = true;
    }
    send(data) {
      if (this.isOpen()) {
        this.webSocket.send(JSON.stringify(data));
        return true;
      } else {
        return false;
      }
    }
    open() {
      if (this.isActive()) {
        logger2.log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
        return false;
      } else {
        const socketProtocols = [...protocols3, ...this.consumer.subprotocols || []];
        logger2.log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${socketProtocols}`);
        if (this.webSocket) {
          this.uninstallEventHandlers();
        }
        this.webSocket = new adapters2.WebSocket(this.consumer.url, socketProtocols);
        this.installEventHandlers();
        this.monitor.start();
        return true;
      }
    }
    close({ allowReconnect } = {
      allowReconnect: true
    }) {
      if (!allowReconnect) {
        this.monitor.stop();
      }
      if (this.isOpen()) {
        return this.webSocket.close();
      }
    }
    reopen() {
      logger2.log(`Reopening WebSocket, current state is ${this.getState()}`);
      if (this.isActive()) {
        try {
          return this.close();
        } catch (error3) {
          logger2.log("Failed to reopen WebSocket", error3);
        } finally {
          logger2.log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
          setTimeout(this.open, this.constructor.reopenDelay);
        }
      } else {
        return this.open();
      }
    }
    getProtocol() {
      if (this.webSocket) {
        return this.webSocket.protocol;
      }
    }
    isOpen() {
      return this.isState("open");
    }
    isActive() {
      return this.isState("open", "connecting");
    }
    triedToReconnect() {
      return this.monitor.reconnectAttempts > 0;
    }
    isProtocolSupported() {
      return indexOf3.call(supportedProtocols3, this.getProtocol()) >= 0;
    }
    isState(...states) {
      return indexOf3.call(states, this.getState()) >= 0;
    }
    getState() {
      if (this.webSocket) {
        for (let state in adapters2.WebSocket) {
          if (adapters2.WebSocket[state] === this.webSocket.readyState) {
            return state.toLowerCase();
          }
        }
      }
      return null;
    }
    installEventHandlers() {
      for (let eventName in this.events) {
        const handler = this.events[eventName].bind(this);
        this.webSocket[`on${eventName}`] = handler;
      }
    }
    uninstallEventHandlers() {
      for (let eventName in this.events) {
        this.webSocket[`on${eventName}`] = function() {
        };
      }
    }
  };
  Connection3.reopenDelay = 500;
  Connection3.prototype.events = {
    message(event) {
      if (!this.isProtocolSupported()) {
        return;
      }
      const { identifier, message, reason, reconnect, type } = JSON.parse(event.data);
      switch (type) {
        case message_types3.welcome:
          if (this.triedToReconnect()) {
            this.reconnectAttempted = true;
          }
          this.monitor.recordConnect();
          return this.subscriptions.reload();
        case message_types3.disconnect:
          logger2.log(`Disconnecting. Reason: ${reason}`);
          return this.close({
            allowReconnect: reconnect
          });
        case message_types3.ping:
          return this.monitor.recordPing();
        case message_types3.confirmation:
          this.subscriptions.confirmSubscription(identifier);
          if (this.reconnectAttempted) {
            this.reconnectAttempted = false;
            return this.subscriptions.notify(identifier, "connected", {
              reconnected: true
            });
          } else {
            return this.subscriptions.notify(identifier, "connected", {
              reconnected: false
            });
          }
        case message_types3.rejection:
          return this.subscriptions.reject(identifier);
        default:
          return this.subscriptions.notify(identifier, "received", message);
      }
    },
    open() {
      logger2.log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
      this.disconnected = false;
      if (!this.isProtocolSupported()) {
        logger2.log("Protocol is unsupported. Stopping monitor and disconnecting.");
        return this.close({
          allowReconnect: false
        });
      }
    },
    close(event) {
      logger2.log("WebSocket onclose event");
      if (this.disconnected) {
        return;
      }
      this.disconnected = true;
      this.monitor.recordDisconnect();
      return this.subscriptions.notifyAll("disconnected", {
        willAttemptReconnect: this.monitor.isRunning()
      });
    },
    error() {
      logger2.log("WebSocket onerror event");
    }
  };
  var extend4 = function(object, properties) {
    if (properties != null) {
      for (let key in properties) {
        const value = properties[key];
        object[key] = value;
      }
    }
    return object;
  };
  var Subscription3 = class {
    constructor(consumer5, params2 = {}, mixin) {
      this.consumer = consumer5;
      this.identifier = JSON.stringify(params2);
      extend4(this, mixin);
    }
    perform(action, data = {}) {
      data.action = action;
      return this.send(data);
    }
    send(data) {
      return this.consumer.send({
        command: "message",
        identifier: this.identifier,
        data: JSON.stringify(data)
      });
    }
    unsubscribe() {
      return this.consumer.subscriptions.remove(this);
    }
  };
  var SubscriptionGuarantor3 = class {
    constructor(subscriptions) {
      this.subscriptions = subscriptions;
      this.pendingSubscriptions = [];
    }
    guarantee(subscription2) {
      if (this.pendingSubscriptions.indexOf(subscription2) == -1) {
        logger2.log(`SubscriptionGuarantor guaranteeing ${subscription2.identifier}`);
        this.pendingSubscriptions.push(subscription2);
      } else {
        logger2.log(`SubscriptionGuarantor already guaranteeing ${subscription2.identifier}`);
      }
      this.startGuaranteeing();
    }
    forget(subscription2) {
      logger2.log(`SubscriptionGuarantor forgetting ${subscription2.identifier}`);
      this.pendingSubscriptions = this.pendingSubscriptions.filter((s) => s !== subscription2);
    }
    startGuaranteeing() {
      this.stopGuaranteeing();
      this.retrySubscribing();
    }
    stopGuaranteeing() {
      clearTimeout(this.retryTimeout);
    }
    retrySubscribing() {
      this.retryTimeout = setTimeout(() => {
        if (this.subscriptions && typeof this.subscriptions.subscribe === "function") {
          this.pendingSubscriptions.map((subscription2) => {
            logger2.log(`SubscriptionGuarantor resubscribing ${subscription2.identifier}`);
            this.subscriptions.subscribe(subscription2);
          });
        }
      }, 500);
    }
  };
  var Subscriptions3 = class {
    constructor(consumer5) {
      this.consumer = consumer5;
      this.guarantor = new SubscriptionGuarantor3(this);
      this.subscriptions = [];
    }
    create(channelName, mixin) {
      const channel = channelName;
      const params2 = typeof channel === "object" ? channel : {
        channel
      };
      const subscription2 = new Subscription3(this.consumer, params2, mixin);
      return this.add(subscription2);
    }
    add(subscription2) {
      this.subscriptions.push(subscription2);
      this.consumer.ensureActiveConnection();
      this.notify(subscription2, "initialized");
      this.subscribe(subscription2);
      return subscription2;
    }
    remove(subscription2) {
      this.forget(subscription2);
      if (!this.findAll(subscription2.identifier).length) {
        this.sendCommand(subscription2, "unsubscribe");
      }
      return subscription2;
    }
    reject(identifier) {
      return this.findAll(identifier).map((subscription2) => {
        this.forget(subscription2);
        this.notify(subscription2, "rejected");
        return subscription2;
      });
    }
    forget(subscription2) {
      this.guarantor.forget(subscription2);
      this.subscriptions = this.subscriptions.filter((s) => s !== subscription2);
      return subscription2;
    }
    findAll(identifier) {
      return this.subscriptions.filter((s) => s.identifier === identifier);
    }
    reload() {
      return this.subscriptions.map((subscription2) => this.subscribe(subscription2));
    }
    notifyAll(callbackName, ...args) {
      return this.subscriptions.map((subscription2) => this.notify(subscription2, callbackName, ...args));
    }
    notify(subscription2, callbackName, ...args) {
      let subscriptions;
      if (typeof subscription2 === "string") {
        subscriptions = this.findAll(subscription2);
      } else {
        subscriptions = [subscription2];
      }
      return subscriptions.map((subscription3) => typeof subscription3[callbackName] === "function" ? subscription3[callbackName](...args) : void 0);
    }
    subscribe(subscription2) {
      if (this.sendCommand(subscription2, "subscribe")) {
        this.guarantor.guarantee(subscription2);
      }
    }
    confirmSubscription(identifier) {
      logger2.log(`Subscription confirmed ${identifier}`);
      this.findAll(identifier).map((subscription2) => this.guarantor.forget(subscription2));
    }
    sendCommand(subscription2, command) {
      const { identifier } = subscription2;
      return this.consumer.send({
        command,
        identifier
      });
    }
  };
  var Consumer3 = class {
    constructor(url) {
      this._url = url;
      this.subscriptions = new Subscriptions3(this);
      this.connection = new Connection3(this);
      this.subprotocols = [];
    }
    get url() {
      return createWebSocketURL3(this._url);
    }
    send(data) {
      return this.connection.send(data);
    }
    connect() {
      return this.connection.open();
    }
    disconnect() {
      return this.connection.close({
        allowReconnect: false
      });
    }
    ensureActiveConnection() {
      if (!this.connection.isActive()) {
        return this.connection.open();
      }
    }
    addSubProtocol(subprotocol) {
      this.subprotocols = [...this.subprotocols, subprotocol];
    }
  };
  function createWebSocketURL3(url) {
    if (typeof url === "function") {
      url = url();
    }
    if (url && !/^wss?:/i.test(url)) {
      const a = document.createElement("a");
      a.href = url;
      a.href = a.href;
      a.protocol = a.protocol.replace("http", "ws");
      return a.href;
    } else {
      return url;
    }
  }
  function createConsumer4(url = getConfig3("url") || INTERNAL2.default_mount_path) {
    return new Consumer3(url);
  }
  function getConfig3(name4) {
    const element = document.head.querySelector(`meta[name='action-cable-${name4}']`);
    if (element) {
      return element.getAttribute("content");
    }
  }

  // ../../node_modules/stimulus_reflex/dist/stimulus_reflex.js
  var Toastify = class {
    defaults = {
      oldestFirst: true,
      text: "Toastify is awesome!",
      node: void 0,
      duration: 3e3,
      selector: void 0,
      callback: function() {
      },
      destination: void 0,
      newWindow: false,
      close: false,
      gravity: "toastify-top",
      positionLeft: false,
      position: "",
      backgroundColor: "",
      avatar: "",
      className: "",
      stopOnFocus: true,
      onClick: function() {
      },
      offset: {
        x: 0,
        y: 0
      },
      escapeMarkup: true,
      ariaLive: "polite",
      style: {
        background: ""
      }
    };
    constructor(options) {
      this.version = "1.12.0";
      this.options = {};
      this.toastElement = null;
      this._rootElement = document.body;
      this._init(options);
    }
    showToast() {
      this.toastElement = this._buildToast();
      if (typeof this.options.selector === "string") {
        this._rootElement = document.getElementById(this.options.selector);
      } else if (this.options.selector instanceof HTMLElement || this.options.selector instanceof ShadowRoot) {
        this._rootElement = this.options.selector;
      } else {
        this._rootElement = document.body;
      }
      if (!this._rootElement) {
        throw "Root element is not defined";
      }
      this._rootElement.insertBefore(this.toastElement, this._rootElement.firstChild);
      this._reposition();
      if (this.options.duration > 0) {
        this.toastElement.timeOutValue = window.setTimeout(() => {
          this._removeElement(this.toastElement);
        }, this.options.duration);
      }
      return this;
    }
    hideToast() {
      if (this.toastElement.timeOutValue) {
        clearTimeout(this.toastElement.timeOutValue);
      }
      this._removeElement(this.toastElement);
    }
    _init(options) {
      this.options = Object.assign(this.defaults, options);
      if (this.options.backgroundColor) {
        console.warn('DEPRECATION NOTICE: "backgroundColor" is being deprecated. Please use the "style.background" property.');
      }
      this.toastElement = null;
      this.options.gravity = options.gravity === "bottom" ? "toastify-bottom" : "toastify-top";
      this.options.stopOnFocus = options.stopOnFocus === void 0 ? true : options.stopOnFocus;
      if (options.backgroundColor) {
        this.options.style.background = options.backgroundColor;
      }
    }
    _buildToast() {
      if (!this.options) {
        throw "Toastify is not initialized";
      }
      let divElement = document.createElement("div");
      divElement.className = `toastify on ${this.options.className}`;
      divElement.className += ` toastify-${this.options.position}`;
      divElement.className += ` ${this.options.gravity}`;
      for (const property in this.options.style) {
        divElement.style[property] = this.options.style[property];
      }
      if (this.options.ariaLive) {
        divElement.setAttribute("aria-live", this.options.ariaLive);
      }
      if (this.options.node && this.options.node.nodeType === Node.ELEMENT_NODE) {
        divElement.appendChild(this.options.node);
      } else {
        if (this.options.escapeMarkup) {
          divElement.innerText = this.options.text;
        } else {
          divElement.innerHTML = this.options.text;
        }
        if (this.options.avatar !== "") {
          let avatarElement = document.createElement("img");
          avatarElement.src = this.options.avatar;
          avatarElement.className = "toastify-avatar";
          if (this.options.position == "left") {
            divElement.appendChild(avatarElement);
          } else {
            divElement.insertAdjacentElement("afterbegin", avatarElement);
          }
        }
      }
      if (this.options.close === true) {
        let closeElement = document.createElement("button");
        closeElement.type = "button";
        closeElement.setAttribute("aria-label", "Close");
        closeElement.className = "toast-close";
        closeElement.innerHTML = "&#10006;";
        closeElement.addEventListener("click", (event) => {
          event.stopPropagation();
          this._removeElement(this.toastElement);
          window.clearTimeout(this.toastElement.timeOutValue);
        });
        const width = window.innerWidth > 0 ? window.innerWidth : screen.width;
        if (this.options.position == "left" && width > 360) {
          divElement.insertAdjacentElement("afterbegin", closeElement);
        } else {
          divElement.appendChild(closeElement);
        }
      }
      if (this.options.stopOnFocus && this.options.duration > 0) {
        divElement.addEventListener("mouseover", (event) => {
          window.clearTimeout(divElement.timeOutValue);
        });
        divElement.addEventListener("mouseleave", () => {
          divElement.timeOutValue = window.setTimeout(() => {
            this._removeElement(divElement);
          }, this.options.duration);
        });
      }
      if (typeof this.options.destination !== "undefined") {
        divElement.addEventListener("click", (event) => {
          event.stopPropagation();
          if (this.options.newWindow === true) {
            window.open(this.options.destination, "_blank");
          } else {
            window.location = this.options.destination;
          }
        });
      }
      if (typeof this.options.onClick === "function" && typeof this.options.destination === "undefined") {
        divElement.addEventListener("click", (event) => {
          event.stopPropagation();
          this.options.onClick();
        });
      }
      if (typeof this.options.offset === "object") {
        const x = this._getAxisOffsetAValue("x", this.options);
        const y = this._getAxisOffsetAValue("y", this.options);
        const xOffset = this.options.position == "left" ? x : `-${x}`;
        const yOffset = this.options.gravity == "toastify-top" ? y : `-${y}`;
        divElement.style.transform = `translate(${xOffset},${yOffset})`;
      }
      return divElement;
    }
    _removeElement(toastElement) {
      toastElement.className = toastElement.className.replace(" on", "");
      window.setTimeout(() => {
        if (this.options.node && this.options.node.parentNode) {
          this.options.node.parentNode.removeChild(this.options.node);
        }
        if (toastElement.parentNode) {
          toastElement.parentNode.removeChild(toastElement);
        }
        this.options.callback.call(toastElement);
        this._reposition();
      }, 400);
    }
    _reposition() {
      let topLeftOffsetSize = {
        top: 15,
        bottom: 15
      };
      let topRightOffsetSize = {
        top: 15,
        bottom: 15
      };
      let offsetSize = {
        top: 15,
        bottom: 15
      };
      let allToasts = this._rootElement.querySelectorAll(".toastify");
      let classUsed;
      for (let i = 0; i < allToasts.length; i++) {
        if (allToasts[i].classList.contains("toastify-top") === true) {
          classUsed = "toastify-top";
        } else {
          classUsed = "toastify-bottom";
        }
        let height = allToasts[i].offsetHeight;
        classUsed = classUsed.substr(9, classUsed.length - 1);
        let offset = 15;
        let width = window.innerWidth > 0 ? window.innerWidth : screen.width;
        if (width <= 360) {
          allToasts[i].style[classUsed] = `${offsetSize[classUsed]}px`;
          offsetSize[classUsed] += height + offset;
        } else {
          if (allToasts[i].classList.contains("toastify-left") === true) {
            allToasts[i].style[classUsed] = `${topLeftOffsetSize[classUsed]}px`;
            topLeftOffsetSize[classUsed] += height + offset;
          } else {
            allToasts[i].style[classUsed] = `${topRightOffsetSize[classUsed]}px`;
            topRightOffsetSize[classUsed] += height + offset;
          }
        }
      }
    }
    _getAxisOffsetAValue(axis, options) {
      if (options.offset[axis]) {
        if (isNaN(options.offset[axis])) {
          return options.offset[axis];
        } else {
          return `${options.offset[axis]}px`;
        }
      }
      return "0px";
    }
  };
  function StartToastifyInstance(options) {
    return new Toastify(options);
  }
  global2.operations.stimulusReflexVersionMismatch = (operation) => {
    const levels = {
      info: {},
      success: {
        background: "#198754",
        color: "white"
      },
      warn: {
        background: "#ffc107",
        color: "black"
      },
      error: {
        background: "#dc3545",
        color: "white"
      }
    };
    const defaults = {
      selector: setupToastify(),
      close: true,
      duration: 30 * 1e3,
      gravity: "bottom",
      position: "right",
      newWindow: true,
      style: levels[operation.level || "info"]
    };
    StartToastifyInstance({
      ...defaults,
      ...operation
    }).showToast();
  };
  function setupToastify() {
    const id2 = "stimulus-reflex-toast-element";
    let element = document.querySelector(`#${id2}`);
    if (!element) {
      element = document.createElement("div");
      element.id = id2;
      document.documentElement.appendChild(element);
      const styles = document.createElement("style");
      styles.innerHTML = `
      #${id2} .toastify {
         padding: 12px 20px;
         color: #ffffff;
         display: inline-block;
         background: -webkit-linear-gradient(315deg, #73a5ff, #5477f5);
         background: linear-gradient(135deg, #73a5ff, #5477f5);
         position: fixed;
         opacity: 0;
         transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
         border-radius: 2px;
         cursor: pointer;
         text-decoration: none;
         max-width: calc(50% - 20px);
         z-index: 2147483647;
         bottom: -150px;
         right: 15px;
      }

      #${id2} .toastify.on {
        opacity: 1;
      }

      #${id2} .toast-close {
        background: transparent;
        border: 0;
        color: white;
        cursor: pointer;
        font-family: inherit;
        font-size: 1em;
        opacity: 0.4;
        padding: 0 5px;
      }
    `;
      document.head.appendChild(styles);
    }
    return element;
  }
  var deprecationWarnings = true;
  var Deprecate = {
    get enabled() {
      return deprecationWarnings;
    },
    get disabled() {
      return !deprecationWarnings;
    },
    get value() {
      return deprecationWarnings;
    },
    set(value) {
      deprecationWarnings = !!value;
    },
    set deprecate(value) {
      deprecationWarnings = !!value;
    }
  };
  var debugging3 = false;
  var Debug$1 = {
    get enabled() {
      return debugging3;
    },
    get disabled() {
      return !debugging3;
    },
    get value() {
      return debugging3;
    },
    set(value) {
      debugging3 = !!value;
    },
    set debug(value) {
      debugging3 = !!value;
    }
  };
  var defaultSchema2 = {
    reflexAttribute: "data-reflex",
    reflexPermanentAttribute: "data-reflex-permanent",
    reflexRootAttribute: "data-reflex-root",
    reflexSuppressLoggingAttribute: "data-reflex-suppress-logging",
    reflexDatasetAttribute: "data-reflex-dataset",
    reflexDatasetAllAttribute: "data-reflex-dataset-all",
    reflexSerializeFormAttribute: "data-reflex-serialize-form",
    reflexFormSelectorAttribute: "data-reflex-form-selector",
    reflexIncludeInnerHtmlAttribute: "data-reflex-include-inner-html",
    reflexIncludeTextContentAttribute: "data-reflex-include-text-content"
  };
  var schema = {};
  var Schema = {
    set(application2) {
      schema = {
        ...defaultSchema2,
        ...application2.schema
      };
      for (const attribute in schema) {
        const attributeName = attribute.slice(0, -9);
        Object.defineProperty(this, attributeName, {
          get: () => schema[attribute],
          configurable: true
        });
      }
    }
  };
  var { debounce: debounce3, dispatch: dispatch4, xpathToElement: xpathToElement3, xpathToElementArray: xpathToElementArray3 } = utils2;
  var uuidv4 = () => {
    const crypto2 = window.crypto || window.msCrypto;
    return ("10000000-1000-4000-8000" + -1e11).replace(/[018]/g, (c) => (c ^ crypto2.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  };
  var serializeForm = (form, options = {}) => {
    if (!form) return "";
    const w = options.w || window;
    const { element } = options;
    const formData = new w.FormData(form);
    const data = Array.from(formData, (e) => e.map(encodeURIComponent).join("="));
    const submitButton = form.querySelector("input[type=submit]");
    if (element && element.name && element.nodeName === "INPUT" && element.type === "submit") {
      data.push(`${encodeURIComponent(element.name)}=${encodeURIComponent(element.value)}`);
    } else if (submitButton && submitButton.name) {
      data.push(`${encodeURIComponent(submitButton.name)}=${encodeURIComponent(submitButton.value)}`);
    }
    return Array.from(data).join("&");
  };
  var camelize2 = (value, uppercaseFirstLetter = true) => {
    if (typeof value !== "string") return "";
    value = value.replace(/[\s_](.)/g, ($1) => $1.toUpperCase()).replace(/[\s_]/g, "").replace(/^(.)/, ($1) => $1.toLowerCase());
    if (uppercaseFirstLetter) value = value.substr(0, 1).toUpperCase() + value.substr(1);
    return value;
  };
  var XPathToElement = xpathToElement3;
  var XPathToArray = xpathToElementArray3;
  var emitEvent = (name4, detail = {}) => dispatch4(document, name4, detail);
  var extractReflexName = (reflexString) => {
    const match = reflexString.match(/(?:.*->)?(.*?)(?:Reflex)?#/);
    return match ? match[1] : "";
  };
  var elementToXPath = (element) => {
    if (element.id !== "") return "//*[@id='" + element.id + "']";
    if (element === document.body) return "/html/body";
    if (element.nodeName === "HTML") return "/html";
    let ix = 0;
    const siblings = element && element.parentNode ? element.parentNode.childNodes : [];
    for (var i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling === element) {
        const computedPath = elementToXPath(element.parentNode);
        const tagName = element.tagName.toLowerCase();
        const ixInc = ix + 1;
        return `${computedPath}/${tagName}[${ixInc}]`;
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  };
  var elementInvalid = (element) => element.type === "number" && element.validity && element.validity.badInput;
  var getReflexElement = (args, element) => args[0] && args[0].nodeType === Node.ELEMENT_NODE ? args.shift() : element;
  var getReflexOptions = (args) => {
    const options = {};
    if (args[0] && typeof args[0] === "object" && Object.keys(args[0]).filter((key) => ["id", "attrs", "selectors", "reflexId", "resolveLate", "serializeForm", "suppressLogging", "includeInnerHTML", "includeTextContent"].includes(key)).length) {
      const opts = args.shift();
      Object.keys(opts).forEach((o) => {
        if (o === "reflexId") {
          if (Deprecate.enabled) console.warn("reflexId option will be removed in v4. Use id instead.");
          options["id"] = opts["reflexId"];
        } else options[o] = opts[o];
      });
    }
    return options;
  };
  var getReflexRoots = (element) => {
    let list = [];
    while (list.length === 0 && element) {
      let reflexRoot = element.getAttribute(Schema.reflexRoot);
      if (reflexRoot) {
        if (reflexRoot.length === 0 && element.id) reflexRoot = `#${element.id}`;
        const selectors = reflexRoot.split(",").filter((s) => s.trim().length);
        if (Debug$1.enabled && selectors.length === 0) {
          console.error(`No value found for ${Schema.reflexRoot}. Add an #id to the element or provide a value for ${Schema.reflexRoot}.`, element);
        }
        list = list.concat(selectors.filter((s) => document.querySelector(s)));
      }
      element = element.parentElement ? element.parentElement.closest(`[${Schema.reflexRoot}]`) : null;
    }
    return list;
  };
  var reflexNameToControllerIdentifier = (reflexName) => reflexName.replace(/([a-z0–9])([A-Z])/g, "$1-$2").replace(/(::)/g, "--").replace(/-reflex$/gi, "").toLowerCase();
  var stages = ["created", "before", "delivered", "queued", "after", "finalized", "success", "error", "halted", "forbidden"];
  var lastReflex;
  var reflexes = new Proxy({}, {
    get: function(target, prop) {
      if (stages.includes(prop)) return Object.fromEntries(Object.entries(target).filter(([_, reflex]) => reflex.stage === prop));
      else if (prop === "last") return lastReflex;
      else if (prop === "all") return target;
      return Reflect.get(...arguments);
    },
    set: function(target, prop, value) {
      target[prop] = value;
      lastReflex = value;
      return true;
    }
  });
  var invokeLifecycleMethod = (reflex, stage) => {
    const specificLifecycleMethod = reflex.controller[["before", "after", "finalize"].includes(stage) ? `${stage}${camelize2(reflex.action)}` : `${camelize2(reflex.action, false)}${camelize2(stage)}`];
    const genericLifecycleMethod = reflex.controller[["before", "after", "finalize"].includes(stage) ? `${stage}Reflex` : `reflex${camelize2(stage)}`];
    if (typeof specificLifecycleMethod === "function") {
      specificLifecycleMethod.call(reflex.controller, reflex.element, reflex.target, reflex.error, reflex.id, reflex.payload);
    }
    if (typeof genericLifecycleMethod === "function") {
      genericLifecycleMethod.call(reflex.controller, reflex.element, reflex.target, reflex.error, reflex.id, reflex.payload);
    }
  };
  var dispatchLifecycleEvent = (reflex, stage) => {
    if (!reflex.controller.element.parentElement) {
      if (Debug$1.enabled && !reflex.warned) {
        console.warn(`StimulusReflex was not able execute callbacks or emit events for "${stage}" or later life-cycle stages for this Reflex. The StimulusReflex Controller Element is no longer present in the DOM. Could you move the StimulusReflex Controller to an element higher in your DOM?`);
        reflex.warned = true;
      }
      return;
    }
    reflex.stage = stage;
    reflex.lifecycle.push(stage);
    const event = `stimulus-reflex:${stage}`;
    const action = `${event}:${reflex.action}`;
    const detail = {
      reflex: reflex.target,
      controller: reflex.controller,
      id: reflex.id,
      element: reflex.element,
      payload: reflex.payload
    };
    const options = {
      bubbles: true,
      cancelable: false,
      detail
    };
    reflex.controller.element.dispatchEvent(new CustomEvent(event, options));
    reflex.controller.element.dispatchEvent(new CustomEvent(action, options));
    if (window.jQuery) {
      window.jQuery(reflex.controller.element).trigger(event, detail);
      window.jQuery(reflex.controller.element).trigger(action, detail);
    }
  };
  document.addEventListener("stimulus-reflex:before", (event) => invokeLifecycleMethod(reflexes[event.detail.id], "before"), true);
  document.addEventListener("stimulus-reflex:queued", (event) => invokeLifecycleMethod(reflexes[event.detail.id], "queued"), true);
  document.addEventListener("stimulus-reflex:delivered", (event) => invokeLifecycleMethod(reflexes[event.detail.id], "delivered"), true);
  document.addEventListener("stimulus-reflex:success", (event) => {
    const reflex = reflexes[event.detail.id];
    invokeLifecycleMethod(reflex, "success");
    dispatchLifecycleEvent(reflex, "after");
  }, true);
  document.addEventListener("stimulus-reflex:nothing", (event) => dispatchLifecycleEvent(reflexes[event.detail.id], "success"), true);
  document.addEventListener("stimulus-reflex:error", (event) => {
    const reflex = reflexes[event.detail.id];
    invokeLifecycleMethod(reflex, "error");
    dispatchLifecycleEvent(reflex, "after");
  }, true);
  document.addEventListener("stimulus-reflex:halted", (event) => invokeLifecycleMethod(reflexes[event.detail.id], "halted"), true);
  document.addEventListener("stimulus-reflex:forbidden", (event) => invokeLifecycleMethod(reflexes[event.detail.id], "forbidden"), true);
  document.addEventListener("stimulus-reflex:after", (event) => invokeLifecycleMethod(reflexes[event.detail.id], "after"), true);
  document.addEventListener("stimulus-reflex:finalize", (event) => invokeLifecycleMethod(reflexes[event.detail.id], "finalize"), true);
  var app = {};
  var App = {
    get app() {
      return app;
    },
    set(application2) {
      app = application2;
    }
  };
  var isolationMode = false;
  var IsolationMode = {
    get disabled() {
      return !isolationMode;
    },
    set(value) {
      isolationMode = value;
      if (Deprecate.enabled && !isolationMode) {
        document.addEventListener("DOMContentLoaded", () => console.warn("Deprecation warning: the next version of StimulusReflex will standardize isolation mode, and the isolate option will be removed.\nPlease update your applications to assume that every tab will be isolated. Use CableReady operations to broadcast updates to other tabs and users."), {
          once: true
        });
      }
    }
  };
  var Reflex = class {
    constructor(data, controller) {
      this.data = data.valueOf();
      this.controller = controller;
      this.element = data.reflexElement;
      this.id = data.id;
      this.error = null;
      this.payload = null;
      this.stage = "created";
      this.lifecycle = ["created"];
      this.warned = false;
      this.target = data.target;
      this.action = data.target.split("#")[1];
      this.selector = null;
      this.morph = null;
      this.operation = null;
      this.timestamp = /* @__PURE__ */ new Date();
      this.cloned = false;
    }
    get getPromise() {
      const promise = new Promise((resolve, reject) => {
        this.promise = {
          resolve,
          reject,
          data: this.data
        };
      });
      promise.id = this.id;
      Object.defineProperty(promise, "reflexId", {
        get() {
          if (Deprecate.enabled) console.warn("reflexId is deprecated and will be removed from v4. Use id instead.");
          return this.id;
        }
      });
      promise.reflex = this;
      if (Debug$1.enabled) promise.catch(() => {
      });
      return promise;
    }
  };
  var received = (data) => {
    if (!data.cableReady) return;
    if (data.version.replace(".pre", "-pre").replace(".rc", "-rc") !== global2.version) {
      const mismatch = `CableReady failed to execute your reflex action due to a version mismatch between your gem and JavaScript version. Package versions must match exactly.

cable_ready gem: ${data.version}
cable_ready npm: ${global2.version}`;
      console.error(mismatch);
      if (Debug$1.enabled) {
        global2.operations.stimulusReflexVersionMismatch({
          text: mismatch,
          level: "error"
        });
      }
      return;
    }
    let reflexOperations = [];
    for (let i = data.operations.length - 1; i >= 0; i--) {
      if (data.operations[i].stimulusReflex) {
        reflexOperations.push(data.operations[i]);
        data.operations.splice(i, 1);
      }
    }
    if (reflexOperations.some((operation) => operation.stimulusReflex.url !== location.href)) {
      if (Debug$1.enabled) {
        console.error("Reflex failed due to mismatched URL.");
        return;
      }
    }
    let reflexData;
    if (reflexOperations.length) {
      reflexData = reflexOperations[0].stimulusReflex;
      reflexData.payload = reflexOperations[0].payload;
    }
    if (reflexData) {
      const { id: id2, payload } = reflexData;
      let reflex;
      if (!reflexes[id2] && IsolationMode.disabled) {
        const controllerElement = XPathToElement(reflexData.xpathController);
        const reflexElement = XPathToElement(reflexData.xpathElement);
        controllerElement.reflexController = controllerElement.reflexController || {};
        controllerElement.reflexData = controllerElement.reflexData || {};
        controllerElement.reflexError = controllerElement.reflexError || {};
        const controller = App.app.getControllerForElementAndIdentifier(controllerElement, reflexData.reflexController);
        controllerElement.reflexController[id2] = controller;
        controllerElement.reflexData[id2] = reflexData;
        reflex = new Reflex(reflexData, controller);
        reflexes[id2] = reflex;
        reflex.cloned = true;
        reflex.element = reflexElement;
        controller.lastReflex = reflex;
        dispatchLifecycleEvent(reflex, "before");
        reflex.getPromise;
      } else {
        reflex = reflexes[id2];
      }
      if (reflex) {
        reflex.payload = payload;
        reflex.totalOperations = reflexOperations.length;
        reflex.pendingOperations = reflexOperations.length;
        reflex.completedOperations = 0;
        reflex.piggybackOperations = data.operations;
        global2.perform(reflexOperations);
      }
    } else {
      if (data.operations.length && reflexes[data.operations[0].reflexId]) {
        global2.perform(data.operations);
      }
    }
  };
  var consumer4;
  var params;
  var subscription;
  var active;
  var initialize$1 = (consumerValue, paramsValue) => {
    consumer4 = consumerValue;
    params = paramsValue;
    document.addEventListener("DOMContentLoaded", () => {
      active = false;
      connectionStatusClass();
      if (Deprecate.enabled && consumerValue) console.warn("Deprecation warning: the next version of StimulusReflex will obtain a reference to consumer via the Stimulus application object.\nPlease add 'application.consumer = consumer' to your index.js after your Stimulus application has been established, and remove the consumer key from your StimulusReflex initialize() options object.");
    });
    document.addEventListener("turbolinks:load", connectionStatusClass);
    document.addEventListener("turbo:load", connectionStatusClass);
  };
  var subscribe = (controller) => {
    if (subscription) return;
    consumer4 = consumer4 || controller.application.consumer || createConsumer4();
    const { channel } = controller.StimulusReflex;
    const request4 = {
      channel,
      ...params
    };
    const identifier = JSON.stringify(request4);
    subscription = consumer4.subscriptions.findAll(identifier)[0] || consumer4.subscriptions.create(request4, {
      received,
      connected,
      rejected,
      disconnected
    });
  };
  var connected = () => {
    active = true;
    connectionStatusClass();
    emitEvent("stimulus-reflex:connected");
    Object.values(reflexes.queued).forEach((reflex) => {
      subscription.send(reflex.data);
      dispatchLifecycleEvent(reflex, "delivered");
    });
  };
  var rejected = () => {
    active = false;
    connectionStatusClass();
    emitEvent("stimulus-reflex:rejected");
    if (Debug.enabled) console.warn("Channel subscription was rejected.");
  };
  var disconnected = (willAttemptReconnect) => {
    active = false;
    connectionStatusClass();
    emitEvent("stimulus-reflex:disconnected", willAttemptReconnect);
  };
  var deliver = (reflex) => {
    if (active) {
      subscription.send(reflex.data);
      dispatchLifecycleEvent(reflex, "delivered");
    } else dispatchLifecycleEvent(reflex, "queued");
  };
  var connectionStatusClass = () => {
    const list = document.body.classList;
    if (!(list.contains("stimulus-reflex-connected") || list.contains("stimulus-reflex-disconnected"))) {
      list.add(active ? "stimulus-reflex-connected" : "stimulus-reflex-disconnected");
      return;
    }
    if (active) {
      list.replace("stimulus-reflex-disconnected", "stimulus-reflex-connected");
    } else {
      list.replace("stimulus-reflex-connected", "stimulus-reflex-disconnected");
    }
  };
  var ActionCableTransport = {
    subscribe,
    deliver,
    initialize: initialize$1
  };
  var request3 = (reflex) => {
    if (Debug$1.disabled || reflex.data.suppressLogging) return;
    console.log(`\u2191 stimulus \u2191 ${reflex.target}`, {
      id: reflex.id,
      args: reflex.data.args,
      controller: reflex.controller.identifier,
      element: reflex.element,
      controllerElement: reflex.controller.element
    });
  };
  var success = (reflex) => {
    if (Debug$1.disabled || reflex.data.suppressLogging) return;
    const output = {
      id: reflex.id,
      morph: reflex.morph,
      payload: reflex.payload
    };
    if (reflex.operation !== "dispatch_event") output.operation = reflex.operation;
    console.log(`\u2193 reflex \u2193 ${reflex.target} \u2192 ${reflex.selector || "\u221E"}${progress(reflex)} ${duration(reflex)}`, output);
  };
  var halted$1 = (reflex) => {
    if (Debug$1.disabled || reflex.data.suppressLogging) return;
    console.log(`\u2193 reflex \u2193 ${reflex.target} ${duration(reflex)} %cHALTED`, "color: #ffa500;", {
      id: reflex.id,
      payload: reflex.payload
    });
  };
  var forbidden$1 = (reflex) => {
    if (Debug$1.disabled || reflex.data.suppressLogging) return;
    console.log(`\u2193 reflex \u2193 ${reflex.target} ${duration(reflex)} %cFORBIDDEN`, "color: #BF40BF;", {
      id: reflex.id,
      payload: reflex.payload
    });
  };
  var error$1 = (reflex) => {
    if (Debug$1.disabled || reflex.data.suppressLogging) return;
    console.log(`\u2193 reflex \u2193 ${reflex.target} ${duration(reflex)} %cERROR: ${reflex.error}`, "color: #f00;", {
      id: reflex.id,
      payload: reflex.payload
    });
  };
  var duration = (reflex) => !reflex.cloned ? `in ${/* @__PURE__ */ new Date() - reflex.timestamp}ms` : "CLONED";
  var progress = (reflex) => reflex.totalOperations > 1 ? ` ${reflex.completedOperations}/${reflex.totalOperations}` : "";
  var Log3 = {
    request: request3,
    success,
    halted: halted$1,
    forbidden: forbidden$1,
    error: error$1
  };
  var multipleInstances = (element) => {
    if (["checkbox", "radio"].includes(element.type)) {
      return document.querySelectorAll(`input[type="${element.type}"][name="${element.name}"]`).length > 1;
    }
    return false;
  };
  var collectCheckedOptions = (element) => Array.from(element.querySelectorAll("option:checked")).concat(Array.from(document.querySelectorAll(`input[type="${element.type}"][name="${element.name}"]`)).filter((elem) => elem.checked)).map((o) => o.value);
  var attributeValue = (values = []) => {
    const value = Array.from(new Set(values.filter((v) => v && String(v).length).map((v) => v.trim()))).join(" ").trim();
    return value.length > 0 ? value : null;
  };
  var attributeValues = (value) => {
    if (!value) return [];
    if (!value.length) return [];
    return value.split(" ").filter((v) => v.trim().length);
  };
  var extractElementAttributes = (element) => {
    let attrs = Array.from(element.attributes).reduce((memo, attr) => {
      memo[attr.name] = attr.value;
      return memo;
    }, {});
    attrs.checked = !!element.checked;
    attrs.selected = !!element.selected;
    attrs.tag_name = element.tagName;
    if (element.tagName.match(/select/i) || multipleInstances(element)) {
      const collectedOptions = collectCheckedOptions(element);
      attrs.values = collectedOptions;
      attrs.value = collectedOptions.join(",");
    } else {
      attrs.value = element.value;
    }
    return attrs;
  };
  var getElementsFromTokens = (element, tokens) => {
    if (!tokens || tokens.length === 0) return [];
    let elements = [element];
    const xPath = elementToXPath(element);
    tokens.forEach((token) => {
      try {
        switch (token) {
          case "combined":
            if (Deprecate.enabled) console.warn("In the next version of StimulusReflex, the 'combined' option to data-reflex-dataset will become 'ancestors'.");
            elements = [...elements, ...XPathToArray(`${xPath}/ancestor::*`, true)];
            break;
          case "ancestors":
            elements = [...elements, ...XPathToArray(`${xPath}/ancestor::*`, true)];
            break;
          case "parent":
            elements = [...elements, ...XPathToArray(`${xPath}/parent::*`)];
            break;
          case "siblings":
            elements = [...elements, ...XPathToArray(`${xPath}/preceding-sibling::*|${xPath}/following-sibling::*`)];
            break;
          case "children":
            elements = [...elements, ...XPathToArray(`${xPath}/child::*`)];
            break;
          case "descendants":
            elements = [...elements, ...XPathToArray(`${xPath}/descendant::*`)];
            break;
          default:
            elements = [...elements, ...document.querySelectorAll(token)];
        }
      } catch (error3) {
        if (Debug$1.enabled) console.error(error3);
      }
    });
    return elements;
  };
  var extractElementDataset = (element) => {
    const dataset = element.attributes[Schema.reflexDataset];
    const allDataset = element.attributes[Schema.reflexDatasetAll];
    const tokens = dataset && dataset.value.split(" ") || [];
    const allTokens = allDataset && allDataset.value.split(" ") || [];
    const datasetElements = getElementsFromTokens(element, tokens);
    const datasetAllElements = getElementsFromTokens(element, allTokens);
    const datasetAttributes = datasetElements.reduce((acc, ele) => ({
      ...extractDataAttributes(ele),
      ...acc
    }), {});
    const reflexElementAttributes = extractDataAttributes(element);
    const elementDataset = {
      dataset: {
        ...reflexElementAttributes,
        ...datasetAttributes
      },
      datasetAll: {}
    };
    datasetAllElements.forEach((element2) => {
      const elementAttributes = extractDataAttributes(element2);
      Object.keys(elementAttributes).forEach((key) => {
        const value = elementAttributes[key];
        if (elementDataset.datasetAll[key] && Array.isArray(elementDataset.datasetAll[key])) {
          elementDataset.datasetAll[key].push(value);
        } else {
          elementDataset.datasetAll[key] = [value];
        }
      });
    });
    return elementDataset;
  };
  var extractDataAttributes = (element) => {
    let attrs = {};
    if (element && element.attributes) {
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("data-")) {
          attrs[attr.name] = attr.value;
        }
      });
    }
    return attrs;
  };
  var name3 = "stimulus_reflex";
  var version3 = "3.5.3";
  var description3 = "Build reactive applications with the Rails tooling you already know and love.";
  var keywords3 = ["ruby", "rails", "websockets", "actioncable", "turbolinks", "reactive", "cable", "ujs", "ssr", "stimulus", "reflex", "stimulus_reflex", "dom", "morphdom"];
  var homepage3 = "https://docs.stimulusreflex.com";
  var bugs3 = "https://github.com/stimulusreflex/stimulus_reflex/issues";
  var repository3 = "https://github.com/stimulusreflex/stimulus_reflex";
  var license3 = "MIT";
  var author3 = "Nathan Hopkins <natehop@gmail.com>";
  var contributors3 = ["Andrew Mason <andrewmcodes@protonmail.com>", "Julian Rubisch <julian@julianrubisch.at>", "Marco Roth <marco.roth@intergga.ch>", "Nathan Hopkins <natehop@gmail.com>"];
  var main3 = "./dist/stimulus_reflex.js";
  var module3 = "./dist/stimulus_reflex.js";
  var browser3 = "./dist/stimulus_reflex.js";
  var unpkg3 = "./dist/stimulus_reflex.umd.js";
  var umd3 = "./dist/stimulus_reflex.umd.js";
  var files3 = ["dist/*", "javascript/*"];
  var scripts3 = {
    lint: "yarn run format --check",
    format: "yarn run prettier-standard ./javascript/**/*.js rollup.config.mjs",
    build: "yarn rollup -c",
    "build:watch": "yarn rollup -wc",
    watch: "yarn build:watch",
    test: "web-test-runner javascript/test/**/*.test.js",
    "test:watch": "yarn test --watch",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs && cp docs/_redirects docs/.vitepress/dist",
    "docs:preview": "vitepress preview docs"
  };
  var peerDependencies = {
    "@hotwired/stimulus": ">= 3.0"
  };
  var dependencies3 = {
    "@hotwired/stimulus": "^3",
    "@rails/actioncable": "^6 || ^7",
    cable_ready: "^5.0.6"
  };
  var devDependencies3 = {
    "@open-wc/testing": "^4.0.0",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^15.3.0",
    "@rollup/plugin-terser": "^0.4.4",
    "@web/dev-server-esbuild": "^1.0.2",
    "@web/dev-server-rollup": "^0.6.4",
    "@web/test-runner": "^0.19.0",
    "prettier-standard": "^16.4.1",
    rollup: "^4.22.4",
    "toastify-js": "^1.12.0",
    vitepress: "^1.0.0-beta.1"
  };
  var packageInfo3 = {
    name: name3,
    version: version3,
    description: description3,
    keywords: keywords3,
    homepage: homepage3,
    bugs: bugs3,
    repository: repository3,
    license: license3,
    author: author3,
    contributors: contributors3,
    main: main3,
    module: module3,
    browser: browser3,
    import: "./dist/stimulus_reflex.js",
    unpkg: unpkg3,
    umd: umd3,
    files: files3,
    scripts: scripts3,
    peerDependencies,
    dependencies: dependencies3,
    devDependencies: devDependencies3
  };
  var ReflexData = class {
    constructor(options, reflexElement, controllerElement, reflexController, permanentAttributeName, target, args, url, tabId2) {
      this.options = options;
      this.reflexElement = reflexElement;
      this.controllerElement = controllerElement;
      this.reflexController = reflexController;
      this.permanentAttributeName = permanentAttributeName;
      this.target = target;
      this.args = args;
      this.url = url;
      this.tabId = tabId2;
    }
    get attrs() {
      this._attrs = this._attrs || this.options["attrs"] || extractElementAttributes(this.reflexElement);
      return this._attrs;
    }
    get id() {
      this._id = this._id || this.options["id"] || uuidv4();
      return this._id;
    }
    get selectors() {
      this._selectors = this._selectors || this.options["selectors"] || getReflexRoots(this.reflexElement);
      return typeof this._selectors === "string" ? [this._selectors] : this._selectors;
    }
    get resolveLate() {
      return this.options["resolveLate"] || false;
    }
    get dataset() {
      this._dataset = this._dataset || extractElementDataset(this.reflexElement);
      return this._dataset;
    }
    get innerHTML() {
      return this.includeInnerHtml ? this.reflexElement.innerHTML : "";
    }
    get textContent() {
      return this.includeTextContent ? this.reflexElement.textContent : "";
    }
    get xpathController() {
      return elementToXPath(this.controllerElement);
    }
    get xpathElement() {
      return elementToXPath(this.reflexElement);
    }
    get formSelector() {
      const attr = this.reflexElement.attributes[Schema.reflexFormSelector] ? this.reflexElement.attributes[Schema.reflexFormSelector].value : void 0;
      return this.options["formSelector"] || attr;
    }
    get includeInnerHtml() {
      const attr = this.reflexElement.attributes[Schema.reflexIncludeInnerHtml] || false;
      return this.options["includeInnerHTML"] || attr ? attr.value !== "false" : false;
    }
    get includeTextContent() {
      const attr = this.reflexElement.attributes[Schema.reflexIncludeTextContent] || false;
      return this.options["includeTextContent"] || attr ? attr.value !== "false" : false;
    }
    get suppressLogging() {
      return this.options["suppressLogging"] || this.reflexElement.attributes[Schema.reflexSuppressLogging] || false;
    }
    valueOf() {
      return {
        attrs: this.attrs,
        dataset: this.dataset,
        selectors: this.selectors,
        id: this.id,
        resolveLate: this.resolveLate,
        suppressLogging: this.suppressLogging,
        xpathController: this.xpathController,
        xpathElement: this.xpathElement,
        inner_html: this.innerHTML,
        text_content: this.textContent,
        formSelector: this.formSelector,
        reflexController: this.reflexController,
        permanentAttributeName: this.permanentAttributeName,
        target: this.target,
        args: this.args,
        url: this.url,
        tabId: this.tabId,
        version: packageInfo3.version
      };
    }
  };
  var transport = {};
  var Transport = {
    get plugin() {
      return transport;
    },
    set(newTransport) {
      transport = newTransport;
    }
  };
  var beforeDOMUpdate = (event) => {
    const { stimulusReflex } = event.detail || {};
    if (!stimulusReflex) return;
    const reflex = reflexes[stimulusReflex.id];
    reflex.pendingOperations--;
    if (reflex.pendingOperations > 0) return;
    if (!stimulusReflex.resolveLate) setTimeout(() => reflex.promise.resolve({
      element: reflex.element,
      event,
      data: reflex.data,
      payload: reflex.payload,
      id: reflex.id,
      toString: () => ""
    }));
    setTimeout(() => dispatchLifecycleEvent(reflex, "success"));
  };
  var afterDOMUpdate = (event) => {
    const { stimulusReflex } = event.detail || {};
    if (!stimulusReflex) return;
    const reflex = reflexes[stimulusReflex.id];
    reflex.completedOperations++;
    reflex.selector = event.detail.selector;
    reflex.morph = event.detail.stimulusReflex.morph;
    reflex.operation = event.type.split(":")[1].split("-").slice(1).join("_");
    Log3.success(reflex);
    if (reflex.completedOperations < reflex.totalOperations) return;
    if (stimulusReflex.resolveLate) setTimeout(() => reflex.promise.resolve({
      element: reflex.element,
      event,
      data: reflex.data,
      payload: reflex.payload,
      id: reflex.id,
      toString: () => ""
    }));
    setTimeout(() => dispatchLifecycleEvent(reflex, "finalize"));
    if (reflex.piggybackOperations.length) global2.perform(reflex.piggybackOperations);
  };
  var routeReflexEvent = (event) => {
    const { stimulusReflex, name: name4 } = event.detail || {};
    const eventType = name4.split("-")[2];
    const eventTypes = {
      nothing,
      halted,
      forbidden,
      error: error2
    };
    if (!stimulusReflex || !Object.keys(eventTypes).includes(eventType)) return;
    const reflex = reflexes[stimulusReflex.id];
    reflex.completedOperations++;
    reflex.pendingOperations--;
    reflex.selector = event.detail.selector;
    reflex.morph = event.detail.stimulusReflex.morph;
    reflex.operation = event.type.split(":")[1].split("-").slice(1).join("_");
    if (eventType === "error") reflex.error = event.detail.error;
    eventTypes[eventType](reflex, event);
    setTimeout(() => dispatchLifecycleEvent(reflex, eventType));
    if (reflex.piggybackOperations.length) global2.perform(reflex.piggybackOperations);
  };
  var nothing = (reflex, event) => {
    Log3.success(reflex);
    setTimeout(() => reflex.promise.resolve({
      data: reflex.data,
      element: reflex.element,
      event,
      payload: reflex.payload,
      id: reflex.id,
      toString: () => ""
    }));
  };
  var halted = (reflex, event) => {
    Log3.halted(reflex, event);
    setTimeout(() => reflex.promise.resolve({
      data: reflex.data,
      element: reflex.element,
      event,
      payload: reflex.payload,
      id: reflex.id,
      toString: () => ""
    }));
  };
  var forbidden = (reflex, event) => {
    Log3.forbidden(reflex, event);
    setTimeout(() => reflex.promise.resolve({
      data: reflex.data,
      element: reflex.element,
      event,
      payload: reflex.payload,
      id: reflex.id,
      toString: () => ""
    }));
  };
  var error2 = (reflex, event) => {
    Log3.error(reflex, event);
    setTimeout(() => reflex.promise.reject({
      data: reflex.data,
      element: reflex.element,
      event,
      payload: reflex.payload,
      id: reflex.id,
      error: reflex.error,
      toString: () => reflex.error
    }));
  };
  var localReflexControllers = (element) => {
    const potentialIdentifiers = attributeValues(element.getAttribute(Schema.controller));
    const potentialControllers = potentialIdentifiers.map((identifier) => App.app.getControllerForElementAndIdentifier(element, identifier));
    return potentialControllers.filter((controller) => controller && controller.StimulusReflex);
  };
  var allReflexControllers = (element) => {
    let controllers = [];
    while (element) {
      controllers = controllers.concat(localReflexControllers(element));
      element = element.parentElement;
    }
    return controllers;
  };
  var findControllerByReflexName = (reflexName, controllers) => {
    const controller = controllers.find((controller2) => {
      if (!controller2 || !controller2.identifier) return;
      const identifier = reflexNameToControllerIdentifier(extractReflexName(reflexName));
      return identifier === controller2.identifier;
    });
    return controller;
  };
  var scanForReflexes = debounce3(() => {
    const reflexElements = document.querySelectorAll(`[${Schema.reflex}]`);
    reflexElements.forEach((element) => scanForReflexesOnElement(element));
  }, 20);
  var scanForReflexesOnElement = (element, controller = null) => {
    const controllerAttribute = element.getAttribute(Schema.controller);
    const controllers = attributeValues(controllerAttribute).filter((controller2) => controller2 !== "stimulus-reflex");
    const reflexAttribute = element.getAttribute(Schema.reflex);
    const reflexAttributeNames = attributeValues(reflexAttribute);
    const actionAttribute = element.getAttribute(Schema.action);
    const actions = attributeValues(actionAttribute).filter((action) => !action.includes("#__perform"));
    reflexAttributeNames.forEach((reflexName) => {
      const potentialControllers = [controller].concat(allReflexControllers(element));
      controller = findControllerByReflexName(reflexName, potentialControllers);
      const controllerName = controller ? controller.identifier : "stimulus-reflex";
      actions.push(`${reflexName.split("->")[0]}->${controllerName}#__perform`);
      const parentControllerElement = element.closest(`[data-controller~=${controllerName}]`);
      const elementPreviouslyHadStimulusReflexController = element === parentControllerElement && controllerName === "stimulus-reflex";
      if (!parentControllerElement || elementPreviouslyHadStimulusReflexController) {
        controllers.push(controllerName);
      }
    });
    const controllerValue = attributeValue(controllers);
    const actionValue = attributeValue(actions);
    let emitReadyEvent = false;
    if (controllerValue && element.getAttribute(Schema.controller) != controllerValue) {
      element.setAttribute(Schema.controller, controllerValue);
      emitReadyEvent = true;
    }
    if (actionValue && element.getAttribute(Schema.action) != actionValue) {
      element.setAttribute(Schema.action, actionValue);
      emitReadyEvent = true;
    }
    if (emitReadyEvent) {
      dispatch4(element, "stimulus-reflex:ready", {
        reflex: reflexAttribute,
        controller: controllerValue,
        action: actionValue,
        element
      });
    }
  };
  var StimulusReflexController = class extends Controller {
    constructor(...args) {
      super(...args);
      register(this);
    }
  };
  var tabId = uuidv4();
  var initialize3 = (application2, { controller, consumer: consumer5, debug, params: params2, isolate, deprecate, transport: transport2 } = {}) => {
    Transport.set(transport2 || ActionCableTransport);
    Transport.plugin.initialize(consumer5, params2);
    IsolationMode.set(!!isolate);
    App.set(application2);
    Schema.set(application2);
    App.app.register("stimulus-reflex", controller || StimulusReflexController);
    Debug$1.set(!!debug);
    if (typeof deprecate !== "undefined") Deprecate.set(deprecate);
    const observer = new MutationObserver(scanForReflexes);
    observer.observe(document.documentElement, {
      attributeFilter: [Schema.reflex, Schema.action],
      childList: true,
      subtree: true
    });
    emitEvent("stimulus-reflex:initialized");
  };
  var register = (controller, options = {}) => {
    const channel = "StimulusReflex::Channel";
    controller.StimulusReflex = {
      ...options,
      channel
    };
    Transport.plugin.subscribe(controller);
    Object.assign(controller, {
      stimulate() {
        const url = location.href;
        const controllerElement = this.element;
        const args = Array.from(arguments);
        const target = args.shift() || "StimulusReflex::Reflex#default_reflex";
        const reflexElement = getReflexElement(args, controllerElement);
        if (elementInvalid(reflexElement)) {
          if (Debug$1.enabled) console.warn("Reflex aborted: invalid numeric input");
          return;
        }
        const options2 = getReflexOptions(args);
        const reflexData = new ReflexData(options2, reflexElement, controllerElement, this.identifier, Schema.reflexPermanent, target, args, url, tabId);
        const id2 = reflexData.id;
        controllerElement.reflexController = controllerElement.reflexController || {};
        controllerElement.reflexData = controllerElement.reflexData || {};
        controllerElement.reflexError = controllerElement.reflexError || {};
        controllerElement.reflexController[id2] = this;
        controllerElement.reflexData[id2] = reflexData.valueOf();
        const reflex = new Reflex(reflexData, this);
        reflexes[id2] = reflex;
        this.lastReflex = reflex;
        dispatchLifecycleEvent(reflex, "before");
        setTimeout(() => {
          const { params: params2 } = controllerElement.reflexData[id2] || {};
          const check = reflexElement.attributes[Schema.reflexSerializeForm];
          if (check) {
            options2["serializeForm"] = check.value !== "false";
          }
          const form = reflexElement.closest(reflexData.formSelector) || document.querySelector(reflexData.formSelector) || reflexElement.closest("form");
          if (Deprecate.enabled && options2["serializeForm"] === void 0 && form) console.warn(`Deprecation warning: the next version of StimulusReflex will not serialize forms by default.
Please set ${Schema.reflexSerializeForm}="true" on your Reflex Controller Element or pass { serializeForm: true } as an option to stimulate.`);
          const formData = options2["serializeForm"] === false ? "" : serializeForm(form, {
            element: reflexElement
          });
          reflex.data = {
            ...reflexData.valueOf(),
            params: params2,
            formData
          };
          controllerElement.reflexData[id2] = reflex.data;
          Transport.plugin.deliver(reflex);
        });
        Log3.request(reflex);
        return reflex.getPromise;
      },
      __perform(event) {
        let element = event.target;
        let reflex;
        while (element && !reflex) {
          reflex = element.getAttribute(Schema.reflex);
          if (!reflex || !reflex.trim().length) element = element.parentElement;
        }
        const match = attributeValues(reflex).find((reflex2) => reflex2.split("->")[0] === event.type);
        if (match) {
          event.preventDefault();
          event.stopPropagation();
          this.stimulate(match.split("->")[1], element);
        }
      }
    });
    if (!controller.reflexes) Object.defineProperty(controller, "reflexes", {
      get() {
        return new Proxy(reflexes, {
          get: function(target, prop) {
            if (prop === "last") return this.lastReflex;
            return Object.fromEntries(Object.entries(target[prop]).filter(([_, reflex]) => reflex.controller === this));
          }.bind(this)
        });
      }
    });
    scanForReflexesOnElement(controller.element, controller);
    emitEvent("stimulus-reflex:controller-registered", {
      detail: {
        controller
      }
    });
  };
  var useReflex = (controller, options = {}) => {
    register(controller, options);
  };
  document.addEventListener("cable-ready:after-dispatch-event", routeReflexEvent);
  document.addEventListener("cable-ready:before-inner-html", beforeDOMUpdate);
  document.addEventListener("cable-ready:before-morph", beforeDOMUpdate);
  document.addEventListener("cable-ready:after-inner-html", afterDOMUpdate);
  document.addEventListener("cable-ready:after-morph", afterDOMUpdate);
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
      scanForReflexes();
    }
  });
  var StimulusReflex = Object.freeze({
    __proto__: null,
    StimulusReflexController,
    initialize: initialize3,
    reflexes,
    register,
    scanForReflexes,
    scanForReflexesOnElement,
    useReflex
  });
  var global3 = {
    version: packageInfo3.version,
    ...StimulusReflex,
    get debug() {
      return Debug$1.value;
    },
    set debug(value) {
      Debug$1.set(!!value);
    },
    get deprecate() {
      return Deprecate.value;
    },
    set deprecate(value) {
      Deprecate.set(!!value);
    }
  };
  window.StimulusReflex = global3;

  // controllers/application.js
  var application = Application.start();
  application.debug = false;
  application.consumer = consumer_default;
  window.Stimulus = application;

  // controllers/application_controller.js
  var application_controller_exports = {};
  __export(application_controller_exports, {
    default: () => application_controller_default
  });
  var application_controller_default = class extends Controller {
    connect() {
      global3.register(this);
    }
    // Application-wide lifecycle methods
    //
    // Use these methods to handle lifecycle callbacks for all controllers.
    // Using lifecycle methods is optional, so feel free to delete these if you don't need them.
    //
    // Arguments:
    //
    //   element - the element that triggered the reflex
    //             may be different than the Stimulus controller's this.element
    //
    //   reflex - the name of the reflex e.g. "Example#demo"
    //
    //   error/noop - the error message (for reflexError), otherwise null
    //
    //   id - a UUID4 or developer-provided unique identifier for each Reflex
    //
    beforeReflex(element, reflex, noop2, id2) {
    }
    reflexQueued(element, reflex, noop2, id2) {
    }
    reflexDelivered(element, reflex, noop2, id2) {
    }
    reflexSuccess(element, reflex, noop2, id2) {
    }
    reflexError(element, reflex, error3, id2) {
    }
    reflexForbidden(element, reflex, noop2, id2) {
    }
    reflexHalted(element, reflex, noop2, id2) {
    }
    afterReflex(element, reflex, noop2, id2) {
    }
    finalizeReflex(element, reflex, noop2, id2) {
    }
  };

  // config/stimulus_reflex.js
  global3.initialize(application, { controller: application_controller_default, isolate: true, debug: true });
  global3.debug = true;

  // rails:/docker/app/app/javascript/controllers/**/*_controller.{js,ts}
  var module0 = __toESM(require_messages_controller());

  // controllers/chats_controller.js
  var chats_controller_exports = {};
  __export(chats_controller_exports, {
    default: () => chats_controller_default
  });
  var chats_controller_default = class extends application_controller_default {
    createSuccess(element) {
      element.reset();
    }
    joinSuccess(element) {
      element.reset();
    }
  };

  // controllers/dropzone_controller.js
  var dropzone_controller_exports = {};
  __export(dropzone_controller_exports, {
    default: () => dropzone_controller_default
  });

  // ../../node_modules/just-extend/index.esm.js
  var objectExtend = extend5;
  function extend5() {
    var args = [].slice.call(arguments);
    var deep = false;
    if (typeof args[0] == "boolean") {
      deep = args.shift();
    }
    var result = args[0];
    if (isUnextendable(result)) {
      throw new Error("extendee must be an object");
    }
    var extenders = args.slice(1);
    var len = extenders.length;
    for (var i = 0; i < len; i++) {
      var extender = extenders[i];
      for (var key in extender) {
        if (Object.prototype.hasOwnProperty.call(extender, key)) {
          var value = extender[key];
          if (deep && isCloneable(value)) {
            var base = Array.isArray(value) ? [] : {};
            result[key] = extend5(
              true,
              Object.prototype.hasOwnProperty.call(result, key) && !isUnextendable(result[key]) ? result[key] : base,
              value
            );
          } else {
            result[key] = value;
          }
        }
      }
    }
    return result;
  }
  function isCloneable(obj) {
    return Array.isArray(obj) || {}.toString.call(obj) == "[object Object]";
  }
  function isUnextendable(val) {
    return !val || typeof val != "object" && typeof val != "function";
  }

  // ../../node_modules/dropzone/dist/dropzone.mjs
  function $parcel$interopDefault(a) {
    return a && a.__esModule ? a.default : a;
  }
  var $4040acfd8584338d$export$2e2bcd8739ae039 = class {
    // Add an event listener for given event
    on(event, fn) {
      this._callbacks = this._callbacks || {};
      if (!this._callbacks[event]) this._callbacks[event] = [];
      this._callbacks[event].push(fn);
      return this;
    }
    emit(event, ...args) {
      this._callbacks = this._callbacks || {};
      let callbacks = this._callbacks[event];
      if (callbacks) for (let callback of callbacks) callback.apply(this, args);
      if (this.element) this.element.dispatchEvent(this.makeEvent("dropzone:" + event, {
        args
      }));
      return this;
    }
    makeEvent(eventName, detail) {
      let params2 = {
        bubbles: true,
        cancelable: true,
        detail
      };
      if (typeof window.CustomEvent === "function") return new CustomEvent(eventName, params2);
      else {
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(eventName, params2.bubbles, params2.cancelable, params2.detail);
        return evt;
      }
    }
    // Remove event listener for given event. If fn is not provided, all event
    // listeners for that event will be removed. If neither is provided, all
    // event listeners will be removed.
    off(event, fn) {
      if (!this._callbacks || arguments.length === 0) {
        this._callbacks = {};
        return this;
      }
      let callbacks = this._callbacks[event];
      if (!callbacks) return this;
      if (arguments.length === 1) {
        delete this._callbacks[event];
        return this;
      }
      for (let i = 0; i < callbacks.length; i++) {
        let callback = callbacks[i];
        if (callback === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    }
  };
  var $fd6031f88dce2e32$exports = {};
  $fd6031f88dce2e32$exports = '<div class="dz-preview dz-file-preview">\n  <div class="dz-image"><img data-dz-thumbnail=""></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size=""></span></div>\n    <div class="dz-filename"><span data-dz-name=""></span></div>\n  </div>\n  <div class="dz-progress">\n    <span class="dz-upload" data-dz-uploadprogress=""></span>\n  </div>\n  <div class="dz-error-message"><span data-dz-errormessage=""></span></div>\n  <div class="dz-success-mark">\n    <svg width="54" height="54" viewBox="0 0 54 54" fill="white" xmlns="http://www.w3.org/2000/svg">\n      <path d="M10.2071 29.7929L14.2929 25.7071C14.6834 25.3166 15.3166 25.3166 15.7071 25.7071L21.2929 31.2929C21.6834 31.6834 22.3166 31.6834 22.7071 31.2929L38.2929 15.7071C38.6834 15.3166 39.3166 15.3166 39.7071 15.7071L43.7929 19.7929C44.1834 20.1834 44.1834 20.8166 43.7929 21.2071L22.7071 42.2929C22.3166 42.6834 21.6834 42.6834 21.2929 42.2929L10.2071 31.2071C9.81658 30.8166 9.81658 30.1834 10.2071 29.7929Z"></path>\n    </svg>\n  </div>\n  <div class="dz-error-mark">\n    <svg width="54" height="54" viewBox="0 0 54 54" fill="white" xmlns="http://www.w3.org/2000/svg">\n      <path d="M26.2929 20.2929L19.2071 13.2071C18.8166 12.8166 18.1834 12.8166 17.7929 13.2071L13.2071 17.7929C12.8166 18.1834 12.8166 18.8166 13.2071 19.2071L20.2929 26.2929C20.6834 26.6834 20.6834 27.3166 20.2929 27.7071L13.2071 34.7929C12.8166 35.1834 12.8166 35.8166 13.2071 36.2071L17.7929 40.7929C18.1834 41.1834 18.8166 41.1834 19.2071 40.7929L26.2929 33.7071C26.6834 33.3166 27.3166 33.3166 27.7071 33.7071L34.7929 40.7929C35.1834 41.1834 35.8166 41.1834 36.2071 40.7929L40.7929 36.2071C41.1834 35.8166 41.1834 35.1834 40.7929 34.7929L33.7071 27.7071C33.3166 27.3166 33.3166 26.6834 33.7071 26.2929L40.7929 19.2071C41.1834 18.8166 41.1834 18.1834 40.7929 17.7929L36.2071 13.2071C35.8166 12.8166 35.1834 12.8166 34.7929 13.2071L27.7071 20.2929C27.3166 20.6834 26.6834 20.6834 26.2929 20.2929Z"></path>\n    </svg>\n  </div>\n</div>\n';
  var $4ca367182776f80b$var$defaultOptions = {
    /**
    * Has to be specified on elements other than form (or when the form doesn't
    * have an `action` attribute).
    *
    * You can also provide a function that will be called with `files` and
    * `dataBlocks`  and must return the url as string.
    */
    url: null,
    /**
    * Can be changed to `"put"` if necessary. You can also provide a function
    * that will be called with `files` and must return the method (since `v3.12.0`).
    */
    method: "post",
    /**
    * Will be set on the XHRequest.
    */
    withCredentials: false,
    /**
    * The timeout for the XHR requests in milliseconds (since `v4.4.0`).
    * If set to null or 0, no timeout is going to be set.
    */
    timeout: null,
    /**
    * How many file uploads to process in parallel (See the
    * Enqueuing file uploads documentation section for more info)
    */
    parallelUploads: 2,
    /**
    * Whether to send multiple files in one request. If
    * this it set to true, then the fallback file input element will
    * have the `multiple` attribute as well. This option will
    * also trigger additional events (like `processingmultiple`). See the events
    * documentation section for more information.
    */
    uploadMultiple: false,
    /**
    * Whether you want files to be uploaded in chunks to your server. This can't be
    * used in combination with `uploadMultiple`.
    *
    * See [chunksUploaded](#config-chunksUploaded) for the callback to finalise an upload.
    */
    chunking: false,
    /**
    * If `chunking` is enabled, this defines whether **every** file should be chunked,
    * even if the file size is below chunkSize. This means, that the additional chunk
    * form data will be submitted and the `chunksUploaded` callback will be invoked.
    */
    forceChunking: false,
    /**
    * If `chunking` is `true`, then this defines the chunk size in bytes.
    */
    chunkSize: 2097152,
    /**
    * If `true`, the individual chunks of a file are being uploaded simultaneously.
    */
    parallelChunkUploads: false,
    /**
    * Whether a chunk should be retried if it fails.
    */
    retryChunks: false,
    /**
    * If `retryChunks` is true, how many times should it be retried.
    */
    retryChunksLimit: 3,
    /**
    * The maximum filesize (in MiB) that is allowed to be uploaded.
    */
    maxFilesize: 256,
    /**
    * The name of the file param that gets transferred.
    * **NOTE**: If you have the option  `uploadMultiple` set to `true`, then
    * Dropzone will append `[]` to the name.
    */
    paramName: "file",
    /**
    * Whether thumbnails for images should be generated
    */
    createImageThumbnails: true,
    /**
    * In MB. When the filename exceeds this limit, the thumbnail will not be generated.
    */
    maxThumbnailFilesize: 10,
    /**
    * If `null`, the ratio of the image will be used to calculate it.
    */
    thumbnailWidth: 120,
    /**
    * The same as `thumbnailWidth`. If both are null, images will not be resized.
    */
    thumbnailHeight: 120,
    /**
    * How the images should be scaled down in case both, `thumbnailWidth` and `thumbnailHeight` are provided.
    * Can be either `contain` or `crop`.
    */
    thumbnailMethod: "crop",
    /**
    * If set, images will be resized to these dimensions before being **uploaded**.
    * If only one, `resizeWidth` **or** `resizeHeight` is provided, the original aspect
    * ratio of the file will be preserved.
    *
    * The `options.transformFile` function uses these options, so if the `transformFile` function
    * is overridden, these options don't do anything.
    */
    resizeWidth: null,
    /**
    * See `resizeWidth`.
    */
    resizeHeight: null,
    /**
    * The mime type of the resized image (before it gets uploaded to the server).
    * If `null` the original mime type will be used. To force jpeg, for example, use `image/jpeg`.
    * See `resizeWidth` for more information.
    */
    resizeMimeType: null,
    /**
    * The quality of the resized images. See `resizeWidth`.
    */
    resizeQuality: 0.8,
    /**
    * How the images should be scaled down in case both, `resizeWidth` and `resizeHeight` are provided.
    * Can be either `contain` or `crop`.
    */
    resizeMethod: "contain",
    /**
    * The base that is used to calculate the **displayed** filesize. You can
    * change this to 1024 if you would rather display kibibytes, mebibytes,
    * etc... 1024 is technically incorrect, because `1024 bytes` are `1 kibibyte`
    * not `1 kilobyte`. You can change this to `1024` if you don't care about
    * validity.
    */
    filesizeBase: 1e3,
    /**
    * If not `null` defines how many files this Dropzone handles. If it exceeds,
    * the event `maxfilesexceeded` will be called. The dropzone element gets the
    * class `dz-max-files-reached` accordingly so you can provide visual
    * feedback.
    */
    maxFiles: null,
    /**
    * An optional object to send additional headers to the server. Eg:
    * `{ "My-Awesome-Header": "header value" }`
    */
    headers: null,
    /**
    * Should the default headers be set or not?
    * Accept: application/json <- for requesting json response
    * Cache-Control: no-cache <- Request shouldnt be cached
    * X-Requested-With: XMLHttpRequest <- We sent the request via XMLHttpRequest
    */
    defaultHeaders: true,
    /**
    * If `true`, the dropzone element itself will be clickable, if `false`
    * nothing will be clickable.
    *
    * You can also pass an HTML element, a CSS selector (for multiple elements)
    * or an array of those. In that case, all of those elements will trigger an
    * upload when clicked.
    */
    clickable: true,
    /**
    * Whether hidden files in directories should be ignored.
    */
    ignoreHiddenFiles: true,
    /**
    * The default implementation of `accept` checks the file's mime type or
    * extension against this list. This is a comma separated list of mime
    * types or file extensions.
    *
    * Eg.: `image/*,application/pdf,.psd`
    *
    * If the Dropzone is `clickable` this option will also be used as
    * [`accept`](https://developer.mozilla.org/en-US/docs/HTML/Element/input#attr-accept)
    * parameter on the hidden file input as well.
    */
    acceptedFiles: null,
    /**
    * **Deprecated!**
    * Use acceptedFiles instead.
    */
    acceptedMimeTypes: null,
    /**
    * If false, files will be added to the queue but the queue will not be
    * processed automatically.
    * This can be useful if you need some additional user input before sending
    * files (or if you want want all files sent at once).
    * If you're ready to send the file simply call `myDropzone.processQueue()`.
    *
    * See the [enqueuing file uploads](#enqueuing-file-uploads) documentation
    * section for more information.
    */
    autoProcessQueue: true,
    /**
    * If false, files added to the dropzone will not be queued by default.
    * You'll have to call `enqueueFile(file)` manually.
    */
    autoQueue: true,
    /**
    * If `true`, this will add a link to every file preview to remove or cancel (if
    * already uploading) the file. The `dictCancelUpload`, `dictCancelUploadConfirmation`
    * and `dictRemoveFile` options are used for the wording.
    */
    addRemoveLinks: false,
    /**
    * Defines where to display the file previews – if `null` the
    * Dropzone element itself is used. Can be a plain `HTMLElement` or a CSS
    * selector. The element should have the `dropzone-previews` class so
    * the previews are displayed properly.
    */
    previewsContainer: null,
    /**
    * Set this to `true` if you don't want previews to be shown.
    */
    disablePreviews: false,
    /**
    * This is the element the hidden input field (which is used when clicking on the
    * dropzone to trigger file selection) will be appended to. This might
    * be important in case you use frameworks to switch the content of your page.
    *
    * Can be a selector string, or an element directly.
    */
    hiddenInputContainer: "body",
    /**
    * If null, no capture type will be specified
    * If camera, mobile devices will skip the file selection and choose camera
    * If microphone, mobile devices will skip the file selection and choose the microphone
    * If camcorder, mobile devices will skip the file selection and choose the camera in video mode
    * On apple devices multiple must be set to false.  AcceptedFiles may need to
    * be set to an appropriate mime type (e.g. "image/*", "audio/*", or "video/*").
    */
    capture: null,
    /**
    * **Deprecated**. Use `renameFile` instead.
    */
    renameFilename: null,
    /**
    * A function that is invoked before the file is uploaded to the server and renames the file.
    * This function gets the `File` as argument and can use the `file.name`. The actual name of the
    * file that gets used during the upload can be accessed through `file.upload.filename`.
    */
    renameFile: null,
    /**
    * If `true` the fallback will be forced. This is very useful to test your server
    * implementations first and make sure that everything works as
    * expected without dropzone if you experience problems, and to test
    * how your fallbacks will look.
    */
    forceFallback: false,
    /**
    * The text used before any files are dropped.
    */
    dictDefaultMessage: "Drop files here to upload",
    /**
    * The text that replaces the default message text it the browser is not supported.
    */
    dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
    /**
    * The text that will be added before the fallback form.
    * If you provide a  fallback element yourself, or if this option is `null` this will
    * be ignored.
    */
    dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
    /**
    * If the filesize is too big.
    * `{{filesize}}` and `{{maxFilesize}}` will be replaced with the respective configuration values.
    */
    dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
    /**
    * If the file doesn't match the file type.
    */
    dictInvalidFileType: "You can't upload files of this type.",
    /**
    * If the server response was invalid.
    * `{{statusCode}}` will be replaced with the servers status code.
    */
    dictResponseError: "Server responded with {{statusCode}} code.",
    /**
    * If `addRemoveLinks` is true, the text to be used for the cancel upload link.
    */
    dictCancelUpload: "Cancel upload",
    /**
    * The text that is displayed if an upload was manually canceled
    */
    dictUploadCanceled: "Upload canceled.",
    /**
    * If `addRemoveLinks` is true, the text to be used for confirmation when cancelling upload.
    */
    dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
    /**
    * If `addRemoveLinks` is true, the text to be used to remove a file.
    */
    dictRemoveFile: "Remove file",
    /**
    * If this is not null, then the user will be prompted before removing a file.
    */
    dictRemoveFileConfirmation: null,
    /**
    * Displayed if `maxFiles` is st and exceeded.
    * The string `{{maxFiles}}` will be replaced by the configuration value.
    */
    dictMaxFilesExceeded: "You can not upload any more files.",
    /**
    * Allows you to translate the different units. Starting with `tb` for terabytes and going down to
    * `b` for bytes.
    */
    dictFileSizeUnits: {
      tb: "TB",
      gb: "GB",
      mb: "MB",
      kb: "KB",
      b: "b"
    },
    /**
    * Called when dropzone initialized
    * You can add event listeners here
    */
    init() {
    },
    /**
    * Can be an **object** of additional parameters to transfer to the server, **or** a `Function`
    * that gets invoked with the `files`, `xhr` and, if it's a chunked upload, `chunk` arguments. In case
    * of a function, this needs to return a map.
    *
    * The default implementation does nothing for normal uploads, but adds relevant information for
    * chunked uploads.
    *
    * This is the same as adding hidden input fields in the form element.
    */
    params(files4, xhr, chunk) {
      if (chunk) return {
        dzuuid: chunk.file.upload.uuid,
        dzchunkindex: chunk.index,
        dztotalfilesize: chunk.file.size,
        dzchunksize: this.options.chunkSize,
        dztotalchunkcount: chunk.file.upload.totalChunkCount,
        dzchunkbyteoffset: chunk.index * this.options.chunkSize
      };
    },
    /**
    * A function that gets a [file](https://developer.mozilla.org/en-US/docs/DOM/File)
    * and a `done` function as parameters.
    *
    * If the done function is invoked without arguments, the file is "accepted" and will
    * be processed. If you pass an error message, the file is rejected, and the error
    * message will be displayed.
    * This function will not be called if the file is too big or doesn't match the mime types.
    */
    accept(file, done) {
      return done();
    },
    /**
    * The callback that will be invoked when all chunks have been uploaded for a file.
    * It gets the file for which the chunks have been uploaded as the first parameter,
    * and the `done` function as second. `done()` needs to be invoked when everything
    * needed to finish the upload process is done.
    */
    chunksUploaded: function(file, done) {
      done();
    },
    /**
    * Sends the file as binary blob in body instead of form data.
    * If this is set, the `params` option will be ignored.
    * It's an error to set this to `true` along with `uploadMultiple` since
    * multiple files cannot be in a single binary body.
    */
    binaryBody: false,
    /**
    * Gets called when the browser is not supported.
    * The default implementation shows the fallback input field and adds
    * a text.
    */
    fallback() {
      let messageElement;
      this.element.className = `${this.element.className} dz-browser-not-supported`;
      for (let child of this.element.getElementsByTagName("div")) if (/(^| )dz-message($| )/.test(child.className)) {
        messageElement = child;
        child.className = "dz-message";
        break;
      }
      if (!messageElement) {
        messageElement = $3ed269f2f0fb224b$export$2e2bcd8739ae039.createElement('<div class="dz-message"><span></span></div>');
        this.element.appendChild(messageElement);
      }
      let span = messageElement.getElementsByTagName("span")[0];
      if (span) {
        if (span.textContent != null) span.textContent = this.options.dictFallbackMessage;
        else if (span.innerText != null) span.innerText = this.options.dictFallbackMessage;
      }
      return this.element.appendChild(this.getFallbackForm());
    },
    /**
    * Gets called to calculate the thumbnail dimensions.
    *
    * It gets `file`, `width` and `height` (both may be `null`) as parameters and must return an object containing:
    *
    *  - `srcWidth` & `srcHeight` (required)
    *  - `trgWidth` & `trgHeight` (required)
    *  - `srcX` & `srcY` (optional, default `0`)
    *  - `trgX` & `trgY` (optional, default `0`)
    *
    * Those values are going to be used by `ctx.drawImage()`.
    */
    resize(file, width, height, resizeMethod) {
      let info = {
        srcX: 0,
        srcY: 0,
        srcWidth: file.width,
        srcHeight: file.height
      };
      let srcRatio = file.width / file.height;
      if (width == null && height == null) {
        width = info.srcWidth;
        height = info.srcHeight;
      } else if (width == null) width = height * srcRatio;
      else if (height == null) height = width / srcRatio;
      width = Math.min(width, info.srcWidth);
      height = Math.min(height, info.srcHeight);
      let trgRatio = width / height;
      if (info.srcWidth > width || info.srcHeight > height) {
        if (resizeMethod === "crop") {
          if (srcRatio > trgRatio) {
            info.srcHeight = file.height;
            info.srcWidth = info.srcHeight * trgRatio;
          } else {
            info.srcWidth = file.width;
            info.srcHeight = info.srcWidth / trgRatio;
          }
        } else if (resizeMethod === "contain") {
          if (srcRatio > trgRatio) height = width / srcRatio;
          else width = height * srcRatio;
        } else throw new Error(`Unknown resizeMethod '${resizeMethod}'`);
      }
      info.srcX = (file.width - info.srcWidth) / 2;
      info.srcY = (file.height - info.srcHeight) / 2;
      info.trgWidth = width;
      info.trgHeight = height;
      return info;
    },
    /**
    * Can be used to transform the file (for example, resize an image if necessary).
    *
    * The default implementation uses `resizeWidth` and `resizeHeight` (if provided) and resizes
    * images according to those dimensions.
    *
    * Gets the `file` as the first parameter, and a `done()` function as the second, that needs
    * to be invoked with the file when the transformation is done.
    */
    transformFile(file, done) {
      if ((this.options.resizeWidth || this.options.resizeHeight) && file.type.match(/image.*/)) return this.resizeImage(file, this.options.resizeWidth, this.options.resizeHeight, this.options.resizeMethod, done);
      else return done(file);
    },
    /**
    * A string that contains the template used for each dropped
    * file. Change it to fulfill your needs but make sure to properly
    * provide all elements.
    *
    * If you want to use an actual HTML element instead of providing a String
    * as a config option, you could create a div with the id `tpl`,
    * put the template inside it and provide the element like this:
    *
    *     document
    *       .querySelector('#tpl')
    *       .innerHTML
    *
    */
    previewTemplate: /* @__PURE__ */ $parcel$interopDefault($fd6031f88dce2e32$exports),
    /*
    Those functions register themselves to the events on init and handle all
    the user interface specific stuff. Overwriting them won't break the upload
    but can break the way it's displayed.
    You can overwrite them if you don't like the default behavior. If you just
    want to add an additional event handler, register it on the dropzone object
    and don't overwrite those options.
    */
    // Those are self explanatory and simply concern the DragnDrop.
    drop(e) {
      return this.element.classList.remove("dz-drag-hover");
    },
    dragstart(e) {
    },
    dragend(e) {
      return this.element.classList.remove("dz-drag-hover");
    },
    dragenter(e) {
      return this.element.classList.add("dz-drag-hover");
    },
    dragover(e) {
      return this.element.classList.add("dz-drag-hover");
    },
    dragleave(e) {
      return this.element.classList.remove("dz-drag-hover");
    },
    paste(e) {
    },
    // Called whenever there are no files left in the dropzone anymore, and the
    // dropzone should be displayed as if in the initial state.
    reset() {
      return this.element.classList.remove("dz-started");
    },
    // Called when a file is added to the queue
    // Receives `file`
    addedfile(file) {
      if (this.element === this.previewsContainer) this.element.classList.add("dz-started");
      if (this.previewsContainer && !this.options.disablePreviews) {
        file.previewElement = $3ed269f2f0fb224b$export$2e2bcd8739ae039.createElement(this.options.previewTemplate.trim());
        file.previewTemplate = file.previewElement;
        this.previewsContainer.appendChild(file.previewElement);
        for (var node of file.previewElement.querySelectorAll("[data-dz-name]")) node.textContent = file.name;
        for (node of file.previewElement.querySelectorAll("[data-dz-size]")) node.innerHTML = this.filesize(file.size);
        if (this.options.addRemoveLinks) {
          file._removeLink = $3ed269f2f0fb224b$export$2e2bcd8739ae039.createElement(`<a class="dz-remove" href="javascript:undefined;" data-dz-remove>${this.options.dictRemoveFile}</a>`);
          file.previewElement.appendChild(file._removeLink);
        }
        let removeFileEvent = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (file.status === $3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING) return $3ed269f2f0fb224b$export$2e2bcd8739ae039.confirm(
            this.options.dictCancelUploadConfirmation,
            () => this.removeFile(file)
          );
          else {
            if (this.options.dictRemoveFileConfirmation) return $3ed269f2f0fb224b$export$2e2bcd8739ae039.confirm(
              this.options.dictRemoveFileConfirmation,
              () => this.removeFile(file)
            );
            else return this.removeFile(file);
          }
        };
        for (let removeLink of file.previewElement.querySelectorAll("[data-dz-remove]")) removeLink.addEventListener("click", removeFileEvent);
      }
    },
    // Called whenever a file is removed.
    removedfile(file) {
      if (file.previewElement != null && file.previewElement.parentNode != null) file.previewElement.parentNode.removeChild(file.previewElement);
      return this._updateMaxFilesReachedClass();
    },
    // Called when a thumbnail has been generated
    // Receives `file` and `dataUrl`
    thumbnail(file, dataUrl) {
      if (file.previewElement) {
        file.previewElement.classList.remove("dz-file-preview");
        for (let thumbnailElement of file.previewElement.querySelectorAll("[data-dz-thumbnail]")) {
          thumbnailElement.alt = file.name;
          thumbnailElement.src = dataUrl;
        }
        return setTimeout(
          () => file.previewElement.classList.add("dz-image-preview"),
          1
        );
      }
    },
    // Called whenever an error occurs
    // Receives `file` and `message`
    error(file, message) {
      if (file.previewElement) {
        file.previewElement.classList.add("dz-error");
        if (typeof message !== "string" && message.error) message = message.error;
        for (let node of file.previewElement.querySelectorAll("[data-dz-errormessage]")) node.textContent = message;
      }
    },
    errormultiple() {
    },
    // Called when a file gets processed. Since there is a cue, not all added
    // files are processed immediately.
    // Receives `file`
    processing(file) {
      if (file.previewElement) {
        file.previewElement.classList.add("dz-processing");
        if (file._removeLink) return file._removeLink.innerHTML = this.options.dictCancelUpload;
      }
    },
    processingmultiple() {
    },
    // Called whenever the upload progress gets updated.
    // Receives `file`, `progress` (percentage 0-100) and `bytesSent`.
    // To get the total number of bytes of the file, use `file.size`
    uploadprogress(file, progress2, bytesSent) {
      if (file.previewElement) for (let node of file.previewElement.querySelectorAll("[data-dz-uploadprogress]")) node.nodeName === "PROGRESS" ? node.value = progress2 : node.style.width = `${progress2}%`;
    },
    // Called whenever the total upload progress gets updated.
    // Called with totalUploadProgress (0-100), totalBytes and totalBytesSent
    totaluploadprogress() {
    },
    // Called just before the file is sent. Gets the `xhr` object as second
    // parameter, so you can modify it (for example to add a CSRF token) and a
    // `formData` object to add additional information.
    sending() {
    },
    sendingmultiple() {
    },
    // When the complete upload is finished and successful
    // Receives `file`
    success(file) {
      if (file.previewElement) return file.previewElement.classList.add("dz-success");
    },
    successmultiple() {
    },
    // When the upload is canceled.
    canceled(file) {
      return this.emit("error", file, this.options.dictUploadCanceled);
    },
    canceledmultiple() {
    },
    // When the upload is finished, either with success or an error.
    // Receives `file`
    complete(file) {
      if (file._removeLink) file._removeLink.innerHTML = this.options.dictRemoveFile;
      if (file.previewElement) return file.previewElement.classList.add("dz-complete");
    },
    completemultiple() {
    },
    maxfilesexceeded() {
    },
    maxfilesreached() {
    },
    queuecomplete() {
    },
    addedfiles() {
    }
  };
  var $4ca367182776f80b$export$2e2bcd8739ae039 = $4ca367182776f80b$var$defaultOptions;
  var $3ed269f2f0fb224b$export$2e2bcd8739ae039 = class _$3ed269f2f0fb224b$export$2e2bcd8739ae039 extends $4040acfd8584338d$export$2e2bcd8739ae039 {
    static initClass() {
      this.prototype.Emitter = $4040acfd8584338d$export$2e2bcd8739ae039;
      this.prototype.events = [
        "drop",
        "dragstart",
        "dragend",
        "dragenter",
        "dragover",
        "dragleave",
        "addedfile",
        "addedfiles",
        "removedfile",
        "thumbnail",
        "error",
        "errormultiple",
        "processing",
        "processingmultiple",
        "uploadprogress",
        "totaluploadprogress",
        "sending",
        "sendingmultiple",
        "success",
        "successmultiple",
        "canceled",
        "canceledmultiple",
        "complete",
        "completemultiple",
        "reset",
        "maxfilesexceeded",
        "maxfilesreached",
        "queuecomplete"
      ];
      this.prototype._thumbnailQueue = [];
      this.prototype._processingThumbnail = false;
    }
    // Returns all files that have been accepted
    getAcceptedFiles() {
      return this.files.filter(
        (file) => file.accepted
      ).map(
        (file) => file
      );
    }
    // Returns all files that have been rejected
    // Not sure when that's going to be useful, but added for completeness.
    getRejectedFiles() {
      return this.files.filter(
        (file) => !file.accepted
      ).map(
        (file) => file
      );
    }
    getFilesWithStatus(status) {
      return this.files.filter(
        (file) => file.status === status
      ).map(
        (file) => file
      );
    }
    // Returns all files that are in the queue
    getQueuedFiles() {
      return this.getFilesWithStatus(_$3ed269f2f0fb224b$export$2e2bcd8739ae039.QUEUED);
    }
    getUploadingFiles() {
      return this.getFilesWithStatus(_$3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING);
    }
    getAddedFiles() {
      return this.getFilesWithStatus(_$3ed269f2f0fb224b$export$2e2bcd8739ae039.ADDED);
    }
    // Files that are either queued or uploading
    getActiveFiles() {
      return this.files.filter(
        (file) => file.status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING || file.status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.QUEUED
      ).map(
        (file) => file
      );
    }
    // The function that gets called when Dropzone is initialized. You
    // can (and should) setup event listeners inside this function.
    init() {
      if (this.element.tagName === "form") this.element.setAttribute("enctype", "multipart/form-data");
      if (this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message")) this.element.appendChild(_$3ed269f2f0fb224b$export$2e2bcd8739ae039.createElement(`<div class="dz-default dz-message"><button class="dz-button" type="button">${this.options.dictDefaultMessage}</button></div>`));
      if (this.clickableElements.length) {
        let setupHiddenFileInput = () => {
          if (this.hiddenFileInput) this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
          this.hiddenFileInput = document.createElement("input");
          this.hiddenFileInput.setAttribute("type", "file");
          if (this.options.maxFiles === null || this.options.maxFiles > 1) this.hiddenFileInput.setAttribute("multiple", "multiple");
          this.hiddenFileInput.className = "dz-hidden-input";
          if (this.options.acceptedFiles !== null) this.hiddenFileInput.setAttribute("accept", this.options.acceptedFiles);
          if (this.options.capture !== null) this.hiddenFileInput.setAttribute("capture", this.options.capture);
          this.hiddenFileInput.setAttribute("tabindex", "-1");
          this.hiddenFileInput.style.visibility = "hidden";
          this.hiddenFileInput.style.position = "absolute";
          this.hiddenFileInput.style.top = "0";
          this.hiddenFileInput.style.left = "0";
          this.hiddenFileInput.style.height = "0";
          this.hiddenFileInput.style.width = "0";
          _$3ed269f2f0fb224b$export$2e2bcd8739ae039.getElement(this.options.hiddenInputContainer, "hiddenInputContainer").appendChild(this.hiddenFileInput);
          this.hiddenFileInput.addEventListener("change", () => {
            let { files: files4 } = this.hiddenFileInput;
            if (files4.length) for (let file of files4) this.addFile(file);
            this.emit("addedfiles", files4);
            setupHiddenFileInput();
          });
        };
        setupHiddenFileInput();
      }
      this.URL = window.URL !== null ? window.URL : window.webkitURL;
      for (let eventName of this.events) this.on(eventName, this.options[eventName]);
      this.on(
        "uploadprogress",
        () => this.updateTotalUploadProgress()
      );
      this.on(
        "removedfile",
        () => this.updateTotalUploadProgress()
      );
      this.on(
        "canceled",
        (file) => this.emit("complete", file)
      );
      this.on("complete", (file) => {
        if (this.getAddedFiles().length === 0 && this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0)
          return setTimeout(
            () => this.emit("queuecomplete"),
            0
          );
      });
      const containsFiles = function(e) {
        if (e.dataTransfer.types)
          for (var i = 0; i < e.dataTransfer.types.length; i++) {
            if (e.dataTransfer.types[i] === "Files") return true;
          }
        return false;
      };
      let noPropagation = function(e) {
        if (!containsFiles(e)) return;
        e.stopPropagation();
        if (e.preventDefault) return e.preventDefault();
        else return e.returnValue = false;
      };
      this.listeners = [
        {
          element: this.element,
          events: {
            dragstart: (e) => {
              return this.emit("dragstart", e);
            },
            dragenter: (e) => {
              noPropagation(e);
              return this.emit("dragenter", e);
            },
            dragover: (e) => {
              let efct;
              try {
                efct = e.dataTransfer.effectAllowed;
              } catch (error3) {
              }
              e.dataTransfer.dropEffect = "move" === efct || "linkMove" === efct ? "move" : "copy";
              noPropagation(e);
              return this.emit("dragover", e);
            },
            dragleave: (e) => {
              return this.emit("dragleave", e);
            },
            drop: (e) => {
              noPropagation(e);
              return this.drop(e);
            },
            dragend: (e) => {
              return this.emit("dragend", e);
            }
          }
        }
      ];
      this.clickableElements.forEach((clickableElement) => {
        return this.listeners.push({
          element: clickableElement,
          events: {
            click: (evt) => {
              if (clickableElement !== this.element || evt.target === this.element || _$3ed269f2f0fb224b$export$2e2bcd8739ae039.elementInside(evt.target, this.element.querySelector(".dz-message"))) this.hiddenFileInput.click();
              return true;
            }
          }
        });
      });
      this.enable();
      return this.options.init.call(this);
    }
    // Not fully tested yet
    destroy() {
      this.disable();
      this.removeAllFiles(true);
      if (this.hiddenFileInput != null ? this.hiddenFileInput.parentNode : void 0) {
        this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
        this.hiddenFileInput = null;
      }
      delete this.element.dropzone;
      return _$3ed269f2f0fb224b$export$2e2bcd8739ae039.instances.splice(_$3ed269f2f0fb224b$export$2e2bcd8739ae039.instances.indexOf(this), 1);
    }
    updateTotalUploadProgress() {
      let totalUploadProgress;
      let totalBytesSent = 0;
      let totalBytes = 0;
      let activeFiles = this.getActiveFiles();
      if (activeFiles.length) {
        for (let file of this.getActiveFiles()) {
          totalBytesSent += file.upload.bytesSent;
          totalBytes += file.upload.total;
        }
        totalUploadProgress = 100 * totalBytesSent / totalBytes;
      } else totalUploadProgress = 100;
      return this.emit("totaluploadprogress", totalUploadProgress, totalBytes, totalBytesSent);
    }
    // @options.paramName can be a function taking one parameter rather than a string.
    // A parameter name for a file is obtained simply by calling this with an index number.
    _getParamName(n) {
      if (typeof this.options.paramName === "function") return this.options.paramName(n);
      else return `${this.options.paramName}${this.options.uploadMultiple ? `[${n}]` : ""}`;
    }
    // If @options.renameFile is a function,
    // the function will be used to rename the file.name before appending it to the formData
    _renameFile(file) {
      if (typeof this.options.renameFile !== "function") return file.name;
      return this.options.renameFile(file);
    }
    // Returns a form that can be used as fallback if the browser does not support DragnDrop
    //
    // If the dropzone is already a form, only the input field and button are returned. Otherwise a complete form element is provided.
    // This code has to pass in IE7 :(
    getFallbackForm() {
      let existingFallback, form;
      if (existingFallback = this.getExistingFallback()) return existingFallback;
      let fieldsString = '<div class="dz-fallback">';
      if (this.options.dictFallbackText) fieldsString += `<p>${this.options.dictFallbackText}</p>`;
      fieldsString += `<input type="file" name="${this._getParamName(0)}" ${this.options.uploadMultiple ? 'multiple="multiple"' : void 0} /><input type="submit" value="Upload!"></div>`;
      let fields = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.createElement(fieldsString);
      if (this.element.tagName !== "FORM") {
        form = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.createElement(`<form action="${this.options.url}" enctype="multipart/form-data" method="${this.options.method}"></form>`);
        form.appendChild(fields);
      } else {
        this.element.setAttribute("enctype", "multipart/form-data");
        this.element.setAttribute("method", this.options.method);
      }
      return form != null ? form : fields;
    }
    // Returns the fallback elements if they exist already
    //
    // This code has to pass in IE7 :(
    getExistingFallback() {
      let getFallback = function(elements) {
        for (let el of elements) {
          if (/(^| )fallback($| )/.test(el.className)) return el;
        }
      };
      for (let tagName of [
        "div",
        "form"
      ]) {
        var fallback;
        if (fallback = getFallback(this.element.getElementsByTagName(tagName))) return fallback;
      }
    }
    // Activates all listeners stored in @listeners
    setupEventListeners() {
      return this.listeners.map(
        (elementListeners) => (() => {
          let result = [];
          for (let event in elementListeners.events) {
            let listener = elementListeners.events[event];
            result.push(elementListeners.element.addEventListener(event, listener, false));
          }
          return result;
        })()
      );
    }
    // Deactivates all listeners stored in @listeners
    removeEventListeners() {
      return this.listeners.map(
        (elementListeners) => (() => {
          let result = [];
          for (let event in elementListeners.events) {
            let listener = elementListeners.events[event];
            result.push(elementListeners.element.removeEventListener(event, listener, false));
          }
          return result;
        })()
      );
    }
    // Removes all event listeners and cancels all files in the queue or being processed.
    disable() {
      this.clickableElements.forEach(
        (element) => element.classList.remove("dz-clickable")
      );
      this.removeEventListeners();
      this.disabled = true;
      return this.files.map(
        (file) => this.cancelUpload(file)
      );
    }
    enable() {
      delete this.disabled;
      this.clickableElements.forEach(
        (element) => element.classList.add("dz-clickable")
      );
      return this.setupEventListeners();
    }
    // Returns a nicely formatted filesize
    filesize(size) {
      let selectedSize = 0;
      let selectedUnit = "b";
      if (size > 0) {
        let units = [
          "tb",
          "gb",
          "mb",
          "kb",
          "b"
        ];
        for (let i = 0; i < units.length; i++) {
          let unit = units[i];
          let cutoff = Math.pow(this.options.filesizeBase, 4 - i) / 10;
          if (size >= cutoff) {
            selectedSize = size / Math.pow(this.options.filesizeBase, 4 - i);
            selectedUnit = unit;
            break;
          }
        }
        selectedSize = Math.round(10 * selectedSize) / 10;
      }
      return `<strong>${selectedSize}</strong> ${this.options.dictFileSizeUnits[selectedUnit]}`;
    }
    // Adds or removes the `dz-max-files-reached` class from the form.
    _updateMaxFilesReachedClass() {
      if (this.options.maxFiles != null && this.getAcceptedFiles().length >= this.options.maxFiles) {
        if (this.getAcceptedFiles().length === this.options.maxFiles) this.emit("maxfilesreached", this.files);
        return this.element.classList.add("dz-max-files-reached");
      } else return this.element.classList.remove("dz-max-files-reached");
    }
    drop(e) {
      if (!e.dataTransfer) return;
      this.emit("drop", e);
      let files4 = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) files4[i] = e.dataTransfer.files[i];
      if (files4.length) {
        let { items } = e.dataTransfer;
        if (items && items.length && items[0].webkitGetAsEntry != null)
          this._addFilesFromItems(items);
        else this.handleFiles(files4);
      }
      this.emit("addedfiles", files4);
    }
    paste(e) {
      if ($3ed269f2f0fb224b$var$__guard__(
        e != null ? e.clipboardData : void 0,
        (x) => x.items
      ) == null) return;
      this.emit("paste", e);
      let { items } = e.clipboardData;
      if (items.length) return this._addFilesFromItems(items);
    }
    handleFiles(files4) {
      for (let file of files4) this.addFile(file);
    }
    // When a folder is dropped (or files are pasted), items must be handled
    // instead of files.
    _addFilesFromItems(items) {
      return (() => {
        let result = [];
        for (let item of items) {
          var entry;
          if (item.webkitGetAsEntry != null && (entry = item.webkitGetAsEntry())) {
            if (entry.isFile) result.push(this.addFile(item.getAsFile()));
            else if (entry.isDirectory)
              result.push(this._addFilesFromDirectory(entry, entry.name));
            else result.push(void 0);
          } else if (item.getAsFile != null) {
            if (item.kind == null || item.kind === "file") result.push(this.addFile(item.getAsFile()));
            else result.push(void 0);
          } else result.push(void 0);
        }
        return result;
      })();
    }
    // Goes through the directory, and adds each file it finds recursively
    _addFilesFromDirectory(directory, path) {
      let dirReader = directory.createReader();
      let errorHandler = (error3) => $3ed269f2f0fb224b$var$__guardMethod__(
        console,
        "log",
        (o) => o.log(error3)
      );
      var readEntries = () => {
        return dirReader.readEntries((entries) => {
          if (entries.length > 0) {
            for (let entry of entries) {
              if (entry.isFile) entry.file((file) => {
                if (this.options.ignoreHiddenFiles && file.name.substring(0, 1) === ".") return;
                file.fullPath = `${path}/${file.name}`;
                return this.addFile(file);
              });
              else if (entry.isDirectory) this._addFilesFromDirectory(entry, `${path}/${entry.name}`);
            }
            readEntries();
          }
          return null;
        }, errorHandler);
      };
      return readEntries();
    }
    // If `done()` is called without argument the file is accepted
    // If you call it with an error message, the file is rejected
    // (This allows for asynchronous validation)
    //
    // This function checks the filesize, and if the file.type passes the
    // `acceptedFiles` check.
    accept(file, done) {
      if (this.options.maxFilesize && file.size > this.options.maxFilesize * 1048576) done(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(file.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize));
      else if (!_$3ed269f2f0fb224b$export$2e2bcd8739ae039.isValidFile(file, this.options.acceptedFiles)) done(this.options.dictInvalidFileType);
      else if (this.options.maxFiles != null && this.getAcceptedFiles().length >= this.options.maxFiles) {
        done(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles));
        this.emit("maxfilesexceeded", file);
      } else this.options.accept.call(this, file, done);
    }
    addFile(file) {
      file.upload = {
        uuid: _$3ed269f2f0fb224b$export$2e2bcd8739ae039.uuidv4(),
        progress: 0,
        // Setting the total upload size to file.size for the beginning
        // It's actual different than the size to be transmitted.
        total: file.size,
        bytesSent: 0,
        filename: this._renameFile(file)
      };
      this.files.push(file);
      file.status = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.ADDED;
      this.emit("addedfile", file);
      this._enqueueThumbnail(file);
      this.accept(file, (error3) => {
        if (error3) {
          file.accepted = false;
          this._errorProcessing([
            file
          ], error3);
        } else {
          file.accepted = true;
          if (this.options.autoQueue) this.enqueueFile(file);
        }
        this._updateMaxFilesReachedClass();
      });
    }
    // Wrapper for enqueueFile
    enqueueFiles(files4) {
      for (let file of files4) this.enqueueFile(file);
      return null;
    }
    enqueueFile(file) {
      if (file.status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.ADDED && file.accepted === true) {
        file.status = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.QUEUED;
        if (this.options.autoProcessQueue) return setTimeout(
          () => this.processQueue(),
          0
        );
      } else throw new Error("This file can't be queued because it has already been processed or was rejected.");
    }
    _enqueueThumbnail(file) {
      if (this.options.createImageThumbnails && file.type.match(/image.*/) && file.size <= this.options.maxThumbnailFilesize * 1048576) {
        this._thumbnailQueue.push(file);
        return setTimeout(
          () => this._processThumbnailQueue(),
          0
        );
      }
    }
    _processThumbnailQueue() {
      if (this._processingThumbnail || this._thumbnailQueue.length === 0) return;
      this._processingThumbnail = true;
      let file = this._thumbnailQueue.shift();
      return this.createThumbnail(file, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.thumbnailMethod, true, (dataUrl) => {
        this.emit("thumbnail", file, dataUrl);
        this._processingThumbnail = false;
        return this._processThumbnailQueue();
      });
    }
    // Can be called by the user to remove a file
    removeFile(file) {
      if (file.status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING) this.cancelUpload(file);
      this.files = $3ed269f2f0fb224b$var$without(this.files, file);
      this.emit("removedfile", file);
      if (this.files.length === 0) return this.emit("reset");
    }
    // Removes all files that aren't currently processed from the list
    removeAllFiles(cancelIfNecessary) {
      if (cancelIfNecessary == null) cancelIfNecessary = false;
      for (let file of this.files.slice()) if (file.status !== _$3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING || cancelIfNecessary) this.removeFile(file);
      return null;
    }
    // Resizes an image before it gets sent to the server. This function is the default behavior of
    // `options.transformFile` if `resizeWidth` or `resizeHeight` are set. The callback is invoked with
    // the resized blob.
    resizeImage(file, width, height, resizeMethod, callback) {
      return this.createThumbnail(file, width, height, resizeMethod, true, (dataUrl, canvas) => {
        if (canvas == null)
          return callback(file);
        else {
          let { resizeMimeType } = this.options;
          if (resizeMimeType == null) resizeMimeType = file.type;
          let resizedDataURL = canvas.toDataURL(resizeMimeType, this.options.resizeQuality);
          if (resizeMimeType === "image/jpeg" || resizeMimeType === "image/jpg")
            resizedDataURL = $3ed269f2f0fb224b$var$ExifRestore.restore(file.dataURL, resizedDataURL);
          return callback(_$3ed269f2f0fb224b$export$2e2bcd8739ae039.dataURItoBlob(resizedDataURL));
        }
      });
    }
    createThumbnail(file, width, height, resizeMethod, fixOrientation, callback) {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        file.dataURL = fileReader.result;
        if (file.type === "image/svg+xml") {
          if (callback != null) callback(fileReader.result);
          return;
        }
        this.createThumbnailFromUrl(file, width, height, resizeMethod, fixOrientation, callback);
      };
      fileReader.readAsDataURL(file);
    }
    // `mockFile` needs to have these attributes:
    //
    //     { name: 'name', size: 12345, imageUrl: '' }
    //
    // `callback` will be invoked when the image has been downloaded and displayed.
    // `crossOrigin` will be added to the `img` tag when accessing the file.
    displayExistingFile(mockFile, imageUrl, callback, crossOrigin, resizeThumbnail = true) {
      this.emit("addedfile", mockFile);
      this.emit("complete", mockFile);
      if (!resizeThumbnail) {
        this.emit("thumbnail", mockFile, imageUrl);
        if (callback) callback();
      } else {
        let onDone = (thumbnail) => {
          this.emit("thumbnail", mockFile, thumbnail);
          if (callback) callback();
        };
        mockFile.dataURL = imageUrl;
        this.createThumbnailFromUrl(mockFile, this.options.thumbnailWidth, this.options.thumbnailHeight, this.options.thumbnailMethod, this.options.fixOrientation, onDone, crossOrigin);
      }
    }
    createThumbnailFromUrl(file, width, height, resizeMethod, fixOrientation, callback, crossOrigin) {
      let img = document.createElement("img");
      if (crossOrigin) img.crossOrigin = crossOrigin;
      fixOrientation = getComputedStyle(document.body)["imageOrientation"] == "from-image" ? false : fixOrientation;
      img.onload = () => {
        let loadExif = (callback2) => callback2(1);
        if (typeof EXIF !== "undefined" && EXIF !== null && fixOrientation) loadExif = (callback2) => EXIF.getData(img, function() {
          return callback2(EXIF.getTag(this, "Orientation"));
        });
        return loadExif((orientation) => {
          file.width = img.width;
          file.height = img.height;
          let resizeInfo = this.options.resize.call(this, file, width, height, resizeMethod);
          let canvas = document.createElement("canvas");
          let ctx = canvas.getContext("2d");
          canvas.width = resizeInfo.trgWidth;
          canvas.height = resizeInfo.trgHeight;
          if (orientation > 4) {
            canvas.width = resizeInfo.trgHeight;
            canvas.height = resizeInfo.trgWidth;
          }
          switch (orientation) {
            case 2:
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
              break;
            case 3:
              ctx.translate(canvas.width, canvas.height);
              ctx.rotate(Math.PI);
              break;
            case 4:
              ctx.translate(0, canvas.height);
              ctx.scale(1, -1);
              break;
            case 5:
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(1, -1);
              break;
            case 6:
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(0, -canvas.width);
              break;
            case 7:
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(canvas.height, -canvas.width);
              ctx.scale(-1, 1);
              break;
            case 8:
              ctx.rotate(-0.5 * Math.PI);
              ctx.translate(-canvas.height, 0);
              break;
          }
          $3ed269f2f0fb224b$var$drawImageIOSFix(ctx, img, resizeInfo.srcX != null ? resizeInfo.srcX : 0, resizeInfo.srcY != null ? resizeInfo.srcY : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, resizeInfo.trgX != null ? resizeInfo.trgX : 0, resizeInfo.trgY != null ? resizeInfo.trgY : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
          let thumbnail = canvas.toDataURL("image/png");
          if (callback != null) return callback(thumbnail, canvas);
        });
      };
      if (callback != null) img.onerror = callback;
      return img.src = file.dataURL;
    }
    // Goes through the queue and processes files if there aren't too many already.
    processQueue() {
      let { parallelUploads } = this.options;
      let processingLength = this.getUploadingFiles().length;
      let i = processingLength;
      if (processingLength >= parallelUploads) return;
      let queuedFiles = this.getQueuedFiles();
      if (!(queuedFiles.length > 0)) return;
      if (this.options.uploadMultiple)
        return this.processFiles(queuedFiles.slice(0, parallelUploads - processingLength));
      else while (i < parallelUploads) {
        if (!queuedFiles.length) return;
        this.processFile(queuedFiles.shift());
        i++;
      }
    }
    // Wrapper for `processFiles`
    processFile(file) {
      return this.processFiles([
        file
      ]);
    }
    // Loads the file, then calls finishedLoading()
    processFiles(files4) {
      for (let file of files4) {
        file.processing = true;
        file.status = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING;
        this.emit("processing", file);
      }
      if (this.options.uploadMultiple) this.emit("processingmultiple", files4);
      return this.uploadFiles(files4);
    }
    _getFilesWithXhr(xhr) {
      let files4;
      return files4 = this.files.filter(
        (file) => file.xhr === xhr
      ).map(
        (file) => file
      );
    }
    // Cancels the file upload and sets the status to CANCELED
    // **if** the file is actually being uploaded.
    // If it's still in the queue, the file is being removed from it and the status
    // set to CANCELED.
    cancelUpload(file) {
      if (file.status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING) {
        let groupedFiles = this._getFilesWithXhr(file.xhr);
        for (let groupedFile of groupedFiles) groupedFile.status = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.CANCELED;
        if (typeof file.xhr !== "undefined") file.xhr.abort();
        for (let groupedFile1 of groupedFiles) this.emit("canceled", groupedFile1);
        if (this.options.uploadMultiple) this.emit("canceledmultiple", groupedFiles);
      } else if (file.status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.ADDED || file.status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.QUEUED) {
        file.status = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.CANCELED;
        this.emit("canceled", file);
        if (this.options.uploadMultiple) this.emit("canceledmultiple", [
          file
        ]);
      }
      if (this.options.autoProcessQueue) return this.processQueue();
    }
    resolveOption(option, ...args) {
      if (typeof option === "function") return option.apply(this, args);
      return option;
    }
    uploadFile(file) {
      return this.uploadFiles([
        file
      ]);
    }
    uploadFiles(files4) {
      this._transformFiles(files4, (transformedFiles) => {
        if (this.options.chunking) {
          let transformedFile = transformedFiles[0];
          files4[0].upload.chunked = this.options.chunking && (this.options.forceChunking || transformedFile.size > this.options.chunkSize);
          files4[0].upload.totalChunkCount = Math.ceil(transformedFile.size / this.options.chunkSize);
        }
        if (files4[0].upload.chunked) {
          let file = files4[0];
          let transformedFile = transformedFiles[0];
          let startedChunkCount = 0;
          file.upload.chunks = [];
          let handleNextChunk = () => {
            let chunkIndex = 0;
            while (file.upload.chunks[chunkIndex] !== void 0) chunkIndex++;
            if (chunkIndex >= file.upload.totalChunkCount) return;
            startedChunkCount++;
            let start3 = chunkIndex * this.options.chunkSize;
            let end = Math.min(start3 + this.options.chunkSize, transformedFile.size);
            let dataBlock = {
              name: this._getParamName(0),
              data: transformedFile.webkitSlice ? transformedFile.webkitSlice(start3, end) : transformedFile.slice(start3, end),
              filename: file.upload.filename,
              chunkIndex
            };
            file.upload.chunks[chunkIndex] = {
              file,
              index: chunkIndex,
              dataBlock,
              status: _$3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING,
              progress: 0,
              retries: 0
            };
            this._uploadData(files4, [
              dataBlock
            ]);
          };
          file.upload.finishedChunkUpload = (chunk, response3) => {
            let allFinished = true;
            chunk.status = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.SUCCESS;
            chunk.dataBlock = null;
            chunk.response = chunk.xhr.responseText;
            chunk.responseHeaders = chunk.xhr.getAllResponseHeaders();
            chunk.xhr = null;
            for (let i = 0; i < file.upload.totalChunkCount; i++) {
              if (file.upload.chunks[i] === void 0) return handleNextChunk();
              if (file.upload.chunks[i].status !== _$3ed269f2f0fb224b$export$2e2bcd8739ae039.SUCCESS) allFinished = false;
            }
            if (allFinished) this.options.chunksUploaded(file, () => {
              this._finished(files4, response3, null);
            });
          };
          if (this.options.parallelChunkUploads) for (let i = 0; i < file.upload.totalChunkCount; i++) handleNextChunk();
          else handleNextChunk();
        } else {
          let dataBlocks = [];
          for (let i = 0; i < files4.length; i++) dataBlocks[i] = {
            name: this._getParamName(i),
            data: transformedFiles[i],
            filename: files4[i].upload.filename
          };
          this._uploadData(files4, dataBlocks);
        }
      });
    }
    /// Returns the right chunk for given file and xhr
    _getChunk(file, xhr) {
      for (let i = 0; i < file.upload.totalChunkCount; i++) {
        if (file.upload.chunks[i] !== void 0 && file.upload.chunks[i].xhr === xhr) return file.upload.chunks[i];
      }
    }
    // This function actually uploads the file(s) to the server.
    //
    //  If dataBlocks contains the actual data to upload (meaning, that this could
    // either be transformed files, or individual chunks for chunked upload) then
    // they will be used for the actual data to upload.
    _uploadData(files4, dataBlocks) {
      let xhr = new XMLHttpRequest();
      for (let file of files4) file.xhr = xhr;
      if (files4[0].upload.chunked)
        files4[0].upload.chunks[dataBlocks[0].chunkIndex].xhr = xhr;
      let method = this.resolveOption(this.options.method, files4, dataBlocks);
      let url = this.resolveOption(this.options.url, files4, dataBlocks);
      xhr.open(method, url, true);
      let timeout = this.resolveOption(this.options.timeout, files4);
      if (timeout) xhr.timeout = this.resolveOption(this.options.timeout, files4);
      xhr.withCredentials = !!this.options.withCredentials;
      xhr.onload = (e) => {
        this._finishedUploading(files4, xhr, e);
      };
      xhr.ontimeout = () => {
        this._handleUploadError(files4, xhr, `Request timedout after ${this.options.timeout / 1e3} seconds`);
      };
      xhr.onerror = () => {
        this._handleUploadError(files4, xhr);
      };
      let progressObj = xhr.upload != null ? xhr.upload : xhr;
      progressObj.onprogress = (e) => this._updateFilesUploadProgress(files4, xhr, e);
      let headers = this.options.defaultHeaders ? {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        "X-Requested-With": "XMLHttpRequest"
      } : {};
      if (this.options.binaryBody) headers["Content-Type"] = files4[0].type;
      if (this.options.headers) objectExtend(headers, this.options.headers);
      for (let headerName in headers) {
        let headerValue = headers[headerName];
        if (headerValue) xhr.setRequestHeader(headerName, headerValue);
      }
      if (this.options.binaryBody) {
        for (let file of files4) this.emit("sending", file, xhr);
        if (this.options.uploadMultiple) this.emit("sendingmultiple", files4, xhr);
        this.submitRequest(xhr, null, files4);
      } else {
        let formData = new FormData();
        if (this.options.params) {
          let additionalParams = this.options.params;
          if (typeof additionalParams === "function") additionalParams = additionalParams.call(this, files4, xhr, files4[0].upload.chunked ? this._getChunk(files4[0], xhr) : null);
          for (let key in additionalParams) {
            let value = additionalParams[key];
            if (Array.isArray(value))
              for (let i = 0; i < value.length; i++) formData.append(key, value[i]);
            else formData.append(key, value);
          }
        }
        for (let file of files4) this.emit("sending", file, xhr, formData);
        if (this.options.uploadMultiple) this.emit("sendingmultiple", files4, xhr, formData);
        this._addFormElementData(formData);
        for (let i = 0; i < dataBlocks.length; i++) {
          let dataBlock = dataBlocks[i];
          formData.append(dataBlock.name, dataBlock.data, dataBlock.filename);
        }
        this.submitRequest(xhr, formData, files4);
      }
    }
    // Transforms all files with this.options.transformFile and invokes done with the transformed files when done.
    _transformFiles(files4, done) {
      let transformedFiles = [];
      let doneCounter = 0;
      for (let i = 0; i < files4.length; i++) this.options.transformFile.call(this, files4[i], (transformedFile) => {
        transformedFiles[i] = transformedFile;
        if (++doneCounter === files4.length) done(transformedFiles);
      });
    }
    // Takes care of adding other input elements of the form to the AJAX request
    _addFormElementData(formData) {
      if (this.element.tagName === "FORM") for (let input of this.element.querySelectorAll("input, textarea, select, button")) {
        let inputName = input.getAttribute("name");
        let inputType = input.getAttribute("type");
        if (inputType) inputType = inputType.toLowerCase();
        if (typeof inputName === "undefined" || inputName === null) continue;
        if (input.tagName === "SELECT" && input.hasAttribute("multiple")) {
          for (let option of input.options) if (option.selected) formData.append(inputName, option.value);
        } else if (!inputType || inputType !== "checkbox" && inputType !== "radio" || input.checked) formData.append(inputName, input.value);
      }
    }
    // Invoked when there is new progress information about given files.
    // If e is not provided, it is assumed that the upload is finished.
    _updateFilesUploadProgress(files4, xhr, e) {
      if (!files4[0].upload.chunked)
        for (let file of files4) {
          if (file.upload.total && file.upload.bytesSent && file.upload.bytesSent == file.upload.total) continue;
          if (e) {
            file.upload.progress = 100 * e.loaded / e.total;
            file.upload.total = e.total;
            file.upload.bytesSent = e.loaded;
          } else {
            file.upload.progress = 100;
            file.upload.bytesSent = file.upload.total;
          }
          this.emit("uploadprogress", file, file.upload.progress, file.upload.bytesSent);
        }
      else {
        let file = files4[0];
        let chunk = this._getChunk(file, xhr);
        if (e) {
          chunk.progress = 100 * e.loaded / e.total;
          chunk.total = e.total;
          chunk.bytesSent = e.loaded;
        } else {
          chunk.progress = 100;
          chunk.bytesSent = chunk.total;
        }
        file.upload.progress = 0;
        file.upload.total = 0;
        file.upload.bytesSent = 0;
        for (let i = 0; i < file.upload.totalChunkCount; i++) if (file.upload.chunks[i] && typeof file.upload.chunks[i].progress !== "undefined") {
          file.upload.progress += file.upload.chunks[i].progress;
          file.upload.total += file.upload.chunks[i].total;
          file.upload.bytesSent += file.upload.chunks[i].bytesSent;
        }
        file.upload.progress = file.upload.progress / file.upload.totalChunkCount;
        this.emit("uploadprogress", file, file.upload.progress, file.upload.bytesSent);
      }
    }
    _finishedUploading(files4, xhr, e) {
      let response3;
      if (files4[0].status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.CANCELED) return;
      if (xhr.readyState !== 4) return;
      if (xhr.responseType !== "arraybuffer" && xhr.responseType !== "blob") {
        response3 = xhr.responseText;
        if (xhr.getResponseHeader("content-type") && ~xhr.getResponseHeader("content-type").indexOf("application/json")) try {
          response3 = JSON.parse(response3);
        } catch (error3) {
          e = error3;
          response3 = "Invalid JSON response from server.";
        }
      }
      this._updateFilesUploadProgress(files4, xhr);
      if (!(200 <= xhr.status && xhr.status < 300)) this._handleUploadError(files4, xhr, response3);
      else if (files4[0].upload.chunked) files4[0].upload.finishedChunkUpload(this._getChunk(files4[0], xhr), response3);
      else this._finished(files4, response3, e);
    }
    _handleUploadError(files4, xhr, response3) {
      if (files4[0].status === _$3ed269f2f0fb224b$export$2e2bcd8739ae039.CANCELED) return;
      if (files4[0].upload.chunked && this.options.retryChunks) {
        let chunk = this._getChunk(files4[0], xhr);
        if (chunk.retries++ < this.options.retryChunksLimit) {
          this._uploadData(files4, [
            chunk.dataBlock
          ]);
          return;
        } else console.warn("Retried this chunk too often. Giving up.");
      }
      this._errorProcessing(files4, response3 || this.options.dictResponseError.replace("{{statusCode}}", xhr.status), xhr);
    }
    submitRequest(xhr, formData, files4) {
      if (xhr.readyState != 1) {
        console.warn("Cannot send this request because the XMLHttpRequest.readyState is not OPENED.");
        return;
      }
      if (this.options.binaryBody) {
        if (files4[0].upload.chunked) {
          const chunk = this._getChunk(files4[0], xhr);
          xhr.send(chunk.dataBlock.data);
        } else xhr.send(files4[0]);
      } else xhr.send(formData);
    }
    // Called internally when processing is finished.
    // Individual callbacks have to be called in the appropriate sections.
    _finished(files4, responseText, e) {
      for (let file of files4) {
        file.status = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.SUCCESS;
        this.emit("success", file, responseText, e);
        this.emit("complete", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("successmultiple", files4, responseText, e);
        this.emit("completemultiple", files4);
      }
      if (this.options.autoProcessQueue) return this.processQueue();
    }
    // Called internally when processing is finished.
    // Individual callbacks have to be called in the appropriate sections.
    _errorProcessing(files4, message, xhr) {
      for (let file of files4) {
        file.status = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.ERROR;
        this.emit("error", file, message, xhr);
        this.emit("complete", file);
      }
      if (this.options.uploadMultiple) {
        this.emit("errormultiple", files4, message, xhr);
        this.emit("completemultiple", files4);
      }
      if (this.options.autoProcessQueue) return this.processQueue();
    }
    static uuidv4() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    }
    constructor(el, options) {
      super();
      let fallback, left;
      this.element = el;
      this.clickableElements = [];
      this.listeners = [];
      this.files = [];
      if (typeof this.element === "string") this.element = document.querySelector(this.element);
      if (!this.element || this.element.nodeType == null) throw new Error("Invalid dropzone element.");
      if (this.element.dropzone) throw new Error("Dropzone already attached.");
      _$3ed269f2f0fb224b$export$2e2bcd8739ae039.instances.push(this);
      this.element.dropzone = this;
      let elementOptions = (left = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.optionsForElement(this.element)) != null ? left : {};
      this.options = objectExtend(true, {}, $4ca367182776f80b$export$2e2bcd8739ae039, elementOptions, options != null ? options : {});
      this.options.previewTemplate = this.options.previewTemplate.replace(/\n*/g, "");
      if (this.options.forceFallback || !_$3ed269f2f0fb224b$export$2e2bcd8739ae039.isBrowserSupported()) return this.options.fallback.call(this);
      if (this.options.url == null) this.options.url = this.element.getAttribute("action");
      if (!this.options.url) throw new Error("No URL provided.");
      if (this.options.acceptedFiles && this.options.acceptedMimeTypes) throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
      if (this.options.uploadMultiple && this.options.chunking) throw new Error("You cannot set both: uploadMultiple and chunking.");
      if (this.options.binaryBody && this.options.uploadMultiple) throw new Error("You cannot set both: binaryBody and uploadMultiple.");
      if (this.options.acceptedMimeTypes) {
        this.options.acceptedFiles = this.options.acceptedMimeTypes;
        delete this.options.acceptedMimeTypes;
      }
      if (this.options.renameFilename != null) this.options.renameFile = (file) => this.options.renameFilename.call(this, file.name, file);
      if (typeof this.options.method === "string") this.options.method = this.options.method.toUpperCase();
      if ((fallback = this.getExistingFallback()) && fallback.parentNode)
        fallback.parentNode.removeChild(fallback);
      if (this.options.previewsContainer !== false) {
        if (this.options.previewsContainer) this.previewsContainer = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.getElement(this.options.previewsContainer, "previewsContainer");
        else this.previewsContainer = this.element;
      }
      if (this.options.clickable) {
        if (this.options.clickable === true) this.clickableElements = [
          this.element
        ];
        else this.clickableElements = _$3ed269f2f0fb224b$export$2e2bcd8739ae039.getElements(this.options.clickable, "clickable");
      }
      this.init();
    }
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.initClass();
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.options = {};
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.optionsForElement = function(element) {
    if (element.getAttribute("id")) return $3ed269f2f0fb224b$export$2e2bcd8739ae039.options[$3ed269f2f0fb224b$var$camelize(element.getAttribute("id"))];
    else return void 0;
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.instances = [];
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.forElement = function(element) {
    if (typeof element === "string") element = document.querySelector(element);
    if ((element != null ? element.dropzone : void 0) == null) throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
    return element.dropzone;
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.discover = function() {
    let dropzones;
    if (document.querySelectorAll) dropzones = document.querySelectorAll(".dropzone");
    else {
      dropzones = [];
      let checkElements = (elements) => (() => {
        let result = [];
        for (let el of elements) if (/(^| )dropzone($| )/.test(el.className)) result.push(dropzones.push(el));
        else result.push(void 0);
        return result;
      })();
      checkElements(document.getElementsByTagName("div"));
      checkElements(document.getElementsByTagName("form"));
    }
    return (() => {
      let result = [];
      for (let dropzone of dropzones)
        if ($3ed269f2f0fb224b$export$2e2bcd8739ae039.optionsForElement(dropzone) !== false) result.push(new $3ed269f2f0fb224b$export$2e2bcd8739ae039(dropzone));
        else result.push(void 0);
      return result;
    })();
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.blockedBrowsers = [
    // The mac os and windows phone version of opera 12 seems to have a problem with the File drag'n'drop API.
    /opera.*(Macintosh|Windows Phone).*version\/12/i
  ];
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.isBrowserSupported = function() {
    let capableBrowser = true;
    if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector) {
      if (!("classList" in document.createElement("a"))) capableBrowser = false;
      else {
        if ($3ed269f2f0fb224b$export$2e2bcd8739ae039.blacklistedBrowsers !== void 0)
          $3ed269f2f0fb224b$export$2e2bcd8739ae039.blockedBrowsers = $3ed269f2f0fb224b$export$2e2bcd8739ae039.blacklistedBrowsers;
        for (let regex of $3ed269f2f0fb224b$export$2e2bcd8739ae039.blockedBrowsers) if (regex.test(navigator.userAgent)) {
          capableBrowser = false;
          continue;
        }
      }
    } else capableBrowser = false;
    return capableBrowser;
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.dataURItoBlob = function(dataURI) {
    let byteString = atob(dataURI.split(",")[1]);
    let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0, end = byteString.length, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) ia[i] = byteString.charCodeAt(i);
    return new Blob([
      ab
    ], {
      type: mimeString
    });
  };
  var $3ed269f2f0fb224b$var$without = (list, rejectedItem) => list.filter(
    (item) => item !== rejectedItem
  ).map(
    (item) => item
  );
  var $3ed269f2f0fb224b$var$camelize = (str) => str.replace(
    /[\-_](\w)/g,
    (match) => match.charAt(1).toUpperCase()
  );
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.createElement = function(string) {
    let div = document.createElement("div");
    div.innerHTML = string;
    return div.childNodes[0];
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.elementInside = function(element, container) {
    if (element === container) return true;
    while (element = element.parentNode) {
      if (element === container) return true;
    }
    return false;
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.getElement = function(el, name4) {
    let element;
    if (typeof el === "string") element = document.querySelector(el);
    else if (el.nodeType != null) element = el;
    if (element == null) throw new Error(`Invalid \`${name4}\` option provided. Please provide a CSS selector or a plain HTML element.`);
    return element;
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.getElements = function(els, name4) {
    let el, elements;
    if (els instanceof Array) {
      elements = [];
      try {
        for (el of els) elements.push(this.getElement(el, name4));
      } catch (e) {
        elements = null;
      }
    } else if (typeof els === "string") {
      elements = [];
      for (el of document.querySelectorAll(els)) elements.push(el);
    } else if (els.nodeType != null) elements = [
      els
    ];
    if (elements == null || !elements.length) throw new Error(`Invalid \`${name4}\` option provided. Please provide a CSS selector, a plain HTML element or a list of those.`);
    return elements;
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.confirm = function(question, accepted, rejected2) {
    if (window.confirm(question)) return accepted();
    else if (rejected2 != null) return rejected2();
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.isValidFile = function(file, acceptedFiles) {
    if (!acceptedFiles) return true;
    acceptedFiles = acceptedFiles.split(",");
    let mimeType = file.type;
    let baseMimeType = mimeType.replace(/\/.*$/, "");
    for (let validType of acceptedFiles) {
      validType = validType.trim();
      if (validType.charAt(0) === ".") {
        if (file.name.toLowerCase().indexOf(validType.toLowerCase(), file.name.length - validType.length) !== -1) return true;
      } else if (/\/\*$/.test(validType)) {
        if (baseMimeType === validType.replace(/\/.*$/, "")) return true;
      } else {
        if (mimeType === validType) return true;
      }
    }
    return false;
  };
  if (typeof jQuery !== "undefined" && jQuery !== null) jQuery.fn.dropzone = function(options) {
    return this.each(function() {
      return new $3ed269f2f0fb224b$export$2e2bcd8739ae039(this, options);
    });
  };
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.ADDED = "added";
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.QUEUED = "queued";
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.ACCEPTED = $3ed269f2f0fb224b$export$2e2bcd8739ae039.QUEUED;
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING = "uploading";
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.PROCESSING = $3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING;
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.CANCELED = "canceled";
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.ERROR = "error";
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.SUCCESS = "success";
  var $3ed269f2f0fb224b$var$detectVerticalSquash = function(img) {
    let iw = img.naturalWidth;
    let ih = img.naturalHeight;
    let canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = ih;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let { data } = ctx.getImageData(1, 0, 1, ih);
    let sy = 0;
    let ey = ih;
    let py = ih;
    while (py > sy) {
      let alpha = data[(py - 1) * 4 + 3];
      if (alpha === 0) ey = py;
      else sy = py;
      py = ey + sy >> 1;
    }
    let ratio = py / ih;
    if (ratio === 0) return 1;
    else return ratio;
  };
  var $3ed269f2f0fb224b$var$drawImageIOSFix = function(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    let vertSquashRatio = $3ed269f2f0fb224b$var$detectVerticalSquash(img);
    return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
  };
  var $3ed269f2f0fb224b$var$ExifRestore = class {
    static initClass() {
      this.KEY_STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    }
    static encode64(input) {
      let output = "";
      let chr1 = void 0;
      let chr2 = void 0;
      let chr3 = "";
      let enc1 = void 0;
      let enc2 = void 0;
      let enc3 = void 0;
      let enc4 = "";
      let i = 0;
      while (true) {
        chr1 = input[i++];
        chr2 = input[i++];
        chr3 = input[i++];
        enc1 = chr1 >> 2;
        enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        enc3 = (chr2 & 15) << 2 | chr3 >> 6;
        enc4 = chr3 & 63;
        if (isNaN(chr2)) enc3 = enc4 = 64;
        else if (isNaN(chr3)) enc4 = 64;
        output = output + this.KEY_STR.charAt(enc1) + this.KEY_STR.charAt(enc2) + this.KEY_STR.charAt(enc3) + this.KEY_STR.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
        if (!(i < input.length)) break;
      }
      return output;
    }
    static restore(origFileBase64, resizedFileBase64) {
      if (!origFileBase64.match("data:image/jpeg;base64,")) return resizedFileBase64;
      let rawImage = this.decode64(origFileBase64.replace("data:image/jpeg;base64,", ""));
      let segments = this.slice2Segments(rawImage);
      let image = this.exifManipulation(resizedFileBase64, segments);
      return `data:image/jpeg;base64,${this.encode64(image)}`;
    }
    static exifManipulation(resizedFileBase64, segments) {
      let exifArray = this.getExifArray(segments);
      let newImageArray = this.insertExif(resizedFileBase64, exifArray);
      let aBuffer = new Uint8Array(newImageArray);
      return aBuffer;
    }
    static getExifArray(segments) {
      let seg = void 0;
      let x = 0;
      while (x < segments.length) {
        seg = segments[x];
        if (seg[0] === 255 & seg[1] === 225) return seg;
        x++;
      }
      return [];
    }
    static insertExif(resizedFileBase64, exifArray) {
      let imageData = resizedFileBase64.replace("data:image/jpeg;base64,", "");
      let buf = this.decode64(imageData);
      let separatePoint = buf.indexOf(255, 3);
      let mae = buf.slice(0, separatePoint);
      let ato = buf.slice(separatePoint);
      let array = mae;
      array = array.concat(exifArray);
      array = array.concat(ato);
      return array;
    }
    static slice2Segments(rawImageArray) {
      let head = 0;
      let segments = [];
      while (true) {
        var length;
        if (rawImageArray[head] === 255 & rawImageArray[head + 1] === 218) break;
        if (rawImageArray[head] === 255 & rawImageArray[head + 1] === 216) head += 2;
        else {
          length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3];
          let endPoint = head + length + 2;
          let seg = rawImageArray.slice(head, endPoint);
          segments.push(seg);
          head = endPoint;
        }
        if (head > rawImageArray.length) break;
      }
      return segments;
    }
    static decode64(input) {
      let output = "";
      let chr1 = void 0;
      let chr2 = void 0;
      let chr3 = "";
      let enc1 = void 0;
      let enc2 = void 0;
      let enc3 = void 0;
      let enc4 = "";
      let i = 0;
      let buf = [];
      let base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) console.warn("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding.");
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (true) {
        enc1 = this.KEY_STR.indexOf(input.charAt(i++));
        enc2 = this.KEY_STR.indexOf(input.charAt(i++));
        enc3 = this.KEY_STR.indexOf(input.charAt(i++));
        enc4 = this.KEY_STR.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        buf.push(chr1);
        if (enc3 !== 64) buf.push(chr2);
        if (enc4 !== 64) buf.push(chr3);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
        if (!(i < input.length)) break;
      }
      return buf;
    }
  };
  $3ed269f2f0fb224b$var$ExifRestore.initClass();
  function $3ed269f2f0fb224b$var$__guard__(value, transform) {
    return typeof value !== "undefined" && value !== null ? transform(value) : void 0;
  }
  function $3ed269f2f0fb224b$var$__guardMethod__(obj, methodName, transform) {
    if (typeof obj !== "undefined" && obj !== null && typeof obj[methodName] === "function") return transform(obj, methodName);
    else return void 0;
  }

  // controllers/dropzone_controller.js
  $3ed269f2f0fb224b$export$2e2bcd8739ae039.autoDiscover = false;
  var dropzone_controller_default = class extends Controller {
    static targets = ["input", "previewsContainer", "previewTemplate"];
    connect() {
      this.dropZone = createDropZone(this);
      this.bindEvents();
    }
    bindEvents() {
      this.dropZone.on("addedfile", (file) => {
        setTimeout(() => {
          file.accepted && createDirectUploadController(this, file).start();
        }, 200);
      });
      this.dropZone.on("removedfile", (file) => {
        file.controller && this.removeElement(file.controller.hiddenInput);
      });
      this.dropZone.on("canceled", (file) => {
        file.controller && file.controller.xhr.abort();
      });
    }
    get headers() {
      const csrf = document.querySelector(`meta[name="csrf-token"]`).getAttribute("content");
      return { "X-CSRF-Token": csrf };
    }
    get url() {
      return this.inputTarget.getAttribute("data-direct-upload-url");
    }
    get maxFiles() {
      return this.data.get("maxFiles") || 1;
    }
    get maxFileSize() {
      return this.data.get("maxFileSize") || 256;
    }
    get acceptedFiles() {
      return this.data.get("acceptedFiles");
    }
    get previewsContainer() {
      return `#${this.previewsContainerTarget.id}`;
    }
    get previewTemplate() {
      return this.previewTemplateTarget.innerHTML;
    }
    removeElement(el) {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
    removeExisting(event) {
      this.removeElement(event.target.parentNode);
    }
  };
  var DirectUploadController2 = class {
    constructor(source, file) {
      this.directUpload = createDirectUpload(file, source.url, this);
      this.source = source;
      this.file = file;
    }
    start() {
      this.file.controller = this;
      this.hiddenInput = this.createHiddenInput();
      this.directUpload.create((error3, attributes) => {
        if (error3) {
          console.error("ERROR:", error3);
          this.source.removeElement(this.hiddenInput);
          this.emitDropzoneError(error3);
        } else {
          this.hiddenInput.value = attributes.signed_id;
          this.emitDropzoneSuccess();
        }
      });
    }
    createHiddenInput() {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = this.source.inputTarget.name;
      this.file.previewTemplate.append(input);
      return input;
    }
    directUploadWillStoreFileWithXHR(xhr) {
      this.bindProgressEvent(xhr);
      this.emitDropzoneUploading();
    }
    bindProgressEvent(xhr) {
      this.xhr = xhr;
      this.xhr.upload.addEventListener("progress", (event) => this.uploadRequestDidProgress(event));
    }
    uploadRequestDidProgress(event) {
      const progress2 = Math.round(event.loaded / event.total * 100);
      document.querySelector(".dz-upload").style.width = `${progress2}%`;
      document.querySelector("span.uploadProgressPercentText").textContent = `${progress2}`;
    }
    emitDropzoneUploading() {
      this.file.status = $3ed269f2f0fb224b$export$2e2bcd8739ae039.UPLOADING;
      this.source.dropZone.emit("processing", this.file);
    }
    emitDropzoneError(error3) {
      this.file.status = $3ed269f2f0fb224b$export$2e2bcd8739ae039.ERROR;
      this.source.dropZone.emit("error", this.file, error3);
      this.source.dropZone.emit("complete", this.file);
    }
    emitDropzoneSuccess() {
      this.file.status = $3ed269f2f0fb224b$export$2e2bcd8739ae039.SUCCESS;
      this.source.dropZone.emit("success", this.file);
      this.source.dropZone.emit("complete", this.file);
    }
  };
  function createDirectUploadController(source, file) {
    return new DirectUploadController2(source, file);
  }
  function createDirectUpload(file, url, controller) {
    return new DirectUpload(file, url, controller);
  }
  function createDropZone(controller) {
    return new $3ed269f2f0fb224b$export$2e2bcd8739ae039(controller.element, {
      url: controller.url,
      headers: controller.headers,
      maxFiles: controller.maxFiles,
      maxFilesize: controller.maxFileSize,
      acceptedFiles: controller.acceptedFiles,
      addRemoveLinks: false,
      autoQueue: false,
      createImageThumbnails: false,
      previewsContainer: controller.previewsContainer,
      previewTemplate: controller.previewTemplate
      // chunking: true,
      // chunkSize: 5 * 1024 * 1024,
      // forceChunking: true,
      // parallelChunkUploads: true,
      // retryChunks: true,
      // retryChunksLimit: 3
    });
  }

  // controllers/example_controller.js
  var example_controller_exports = {};
  __export(example_controller_exports, {
    default: () => example_controller_default
  });
  var example_controller_default = class extends application_controller_default {
    connect() {
      super.connect();
    }
    // With StimulusReflex active in your project, it will continuously scan your DOM for
    // `data-reflex` attributes on your elements, even if they are dynamically created.
    //
    //   <a href="#" data-reflex="click->Example#dance">Dance!</a>
    //
    // We call this a "declared" Reflex, because it doesn't require any JS to run.
    //
    // When your user clicks this link, a Reflex is launched and it calls the `dance` method
    // on your Example Reflex class. You don't have to do anything else!
    //
    // This Stimulus controller doesn't even need to exist for StimulusReflex to work its magic.
    // https://docs.stimulusreflex.com/guide/reflexes#declaring-a-reflex-in-html-with-data-attributes
    //
    // However...
    //
    // If we do create an `example` Stimulus controller that extends `ApplicationController`,
    // we can unlock several additional capabilities, including creating Reflexes with code.
    //
    //   <a href="#" data-controller="example" data-action="example#dance">Dance!</a>
    //
    // StimulusReflex gives our controller a new method, `stimulate`:
    //
    // dance() {
    //   this.stimulate('Example#dance')
    // }
    //
    // The `stimulate` method is very flexible, and it gives you the opportunity to pass
    // parameter options that will be passed to the `dance` method on the server.
    // https://docs.stimulusreflex.com/guide/reflexes#calling-a-reflex-in-a-stimulus-controller
    //
    // Reflex lifecycle methods
    //
    // For every method defined in your Reflex class, a matching set of optional
    // lifecycle callback methods become available in this javascript controller.
    // https://docs.stimulusreflex.com/guide/lifecycle#client-side-reflex-callbacks
    //
    //   <a href="#" data-reflex="click->Example#dance" data-controller="example">Dance!</a>
    //
    // StimulusReflex will check for the presence of several methods:
    //
    //   afterReflex(element, reflex, noop, id) {
    //     // fires after every Example Reflex action
    //   }
    //
    //   afterDance(element, reflex, noop, id) {
    //     // fires after Example Reflexes calling the dance action
    //   }
    //
    // Arguments:
    //
    //   element - the element that triggered the reflex
    //             may be different than the Stimulus controller's this.element
    //
    //   reflex - the name of the reflex e.g. "Example#dance"
    //
    //   error/noop - the error message (for reflexError), otherwise null
    //
    //   id - a UUID4 or developer-provided unique identifier for each Reflex
    //
    // Access to the client-side Reflex objects created by this controller
    //
    // Every Reflex you create is represented by an object in the global Reflexes collection.
    // You can access the Example Reflexes created by this controller via the `reflexes` proxy.
    //
    //   this.reflexes.last
    //   this.reflexes.all
    //   this.reflexes.all[id]
    //   this.reflexes.error
    //
    // The proxy allows you to access the most recent Reflex, an array of all Reflexes, a specific
    // Reflex specified by its `id` and an array of all Reflexes in a given lifecycle stage.
    //
    // If you explore the Reflex object, you'll see all relevant details,
    // including the `data` that is being delivered to the server.
    //
    // Pretty cool, right?
    //
  };

  // controllers/institution_select_controller.js
  var institution_select_controller_exports = {};
  __export(institution_select_controller_exports, {
    default: () => institution_select_controller_default
  });
  var institution_select_controller_default = class extends Controller {
    static targets = ["institutionList"];
    toggle(event) {
      event.preventDefault();
      this.institutionListTarget.classList.toggle("hidden");
    }
    activateInstitution(event) {
      event.preventDefault();
      const institutionId = event.target.dataset.institutionId;
      console.log(institutionId);
    }
    // Close dropdown when clicking outside
    clickOutside(event) {
      if (!this.element.contains(event.target)) {
        this.institutionListTarget.classList.add("hidden");
      }
    }
    connect() {
      document.addEventListener("click", this.clickOutside.bind(this));
    }
    disconnect() {
      document.removeEventListener("click", this.clickOutside.bind(this));
    }
  };

  // controllers/recording_controller.ts
  var recording_controller_exports = {};
  __export(recording_controller_exports, {
    default: () => recording_controller_default
  });

  // utils/format_time.ts
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = secs.toString().padStart(2, "0");
    if (hours > 0) {
      const formattedHours = hours.toString().padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  }

  // controllers/recording_controller.ts
  var recording_controller_default = class extends application_controller_default {
    static targets = ["recordingButton", "uploadRecordingForm"];
    initialize() {
      this.isRecording = false;
    }
    async toggleRecording() {
      const recordingStatusDisplay = document.getElementById("recording-status-display");
      const button = this.recordingButtonTarget;
      const lectureId = button.dataset.lectureId;
      if (!lectureId) {
        console.error("Could not find active lecture.");
        return;
      }
      if (!this.isRecording) {
        try {
          const timestamp = (/* @__PURE__ */ new Date()).toISOString();
          this.chunkCounter = 0;
          const audioChunksUploader = new QueueProcessor(
            new Array(),
            async (chunk) => {
              try {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const base64data = reader.result;
                  if (lectureId && this.recordingId && base64data) {
                    const encodingData = base64data.toString().split(",")[0];
                    const base64String = base64data.toString().split(",")[1];
                    audio_channel_default.sendAudioChunk({
                      lectureId,
                      recordingId: this.recordingId,
                      timestamp,
                      encodingData,
                      base64String,
                      chunkNumber: this.chunkCounter
                    });
                    this.chunkCounter++;
                  }
                };
                reader.onerror = () => {
                  console.log("error");
                };
                reader.readAsDataURL(chunk);
              } catch (error3) {
                console.error("Error sending audio data:", error3);
                return false;
              }
              return true;
            }
          );
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
          });
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.onstart = () => {
            this.recordingId = crypto.randomUUID();
            audio_channel_default.initializeRecording({
              recordingId: this.recordingId,
              lectureId
            });
            this.recordingDuration = 0;
            this.recordingInterval = window.setInterval(
              () => {
                this.recordingDuration++;
                if (recordingStatusDisplay) {
                  recordingStatusDisplay.textContent = formatTime(this.recordingDuration);
                }
              },
              1e3
            );
          };
          if (recordingStatusDisplay) {
            this.recordingDuration = 0;
            recordingStatusDisplay.textContent = formatTime(this.recordingDuration);
            recordingStatusDisplay.classList.remove("hidden");
          }
          this.mediaRecorder.ondataavailable = (event) => {
            const chunk = event.data;
            audioChunksUploader.addToQueue(chunk);
          };
          this.mediaRecorder.onstop = () => {
            audio_channel_default.informRecordingDone({
              recordingId: this.recordingId
            });
          };
          this.mediaRecorder.start(1e3);
          this.isRecording = true;
          button.classList.add("recording");
        } catch (error3) {
          console.error("Error accessing the microphone", error3);
        }
      } else {
        if (this.recordingInterval) {
          clearInterval(this.recordingInterval);
          this.recordingInterval = void 0;
          const recordingStatusDisplay2 = document.getElementById("recording-status-display");
          if (recordingStatusDisplay2) {
            recordingStatusDisplay2.textContent = "";
            recordingStatusDisplay2.classList.add("hidden");
          }
        }
        this.mediaRecorder.requestData();
        this.mediaRecorder.stop();
        this.isRecording = false;
        button.classList.remove("recording");
      }
      button.innerText = button.classList.contains("recording") ? "Stop" : "Record";
    }
    // async transcribeRecording() {
    //   if (this.recordingId == null) {
    //     alert("No recording found!");
    //   }
    // }
    // triggerFileInput(event) {
    //   event.preventDefault();
    //   const lectureId = this.uploadRecordingFormTarget.dataset.lectureId;
    //   const fileInput = this.recordingInputTarget;
    //   // console.log(fileInput);
    //   fileInput.onchange = (event) => {
    //     const file = event.target.files[0];
    //     console.log(file);
    //     if (file == null) {
    //       return;
    //     }
    //     const reader = new FileReader();
    //     reader.onload = () => {
    //       const base64Data = reader.result.split(',')[1];
    //       this.stimulate('Recordings#upload', {
    //         data: base64Data,
    //         name: file.name,
    //         type: file.type,
    //         lectureId: lectureId
    //       });
    //     };
    //     reader.readAsDataURL(file);
    //   };
    //   fileInput.click();
    // }
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const secs = seconds % 60;
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = secs.toString().padStart(2, "0");
      if (hours > 0) {
        const formattedHours = hours.toString().padStart(2, "0");
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      } else {
        return `${formattedMinutes}:${formattedSeconds}`;
      }
    }
  };

  // controllers/transcription_controller.js
  var transcription_controller_exports = {};
  __export(transcription_controller_exports, {
    default: () => transcription_controller_default
  });
  var transcription_controller_default = class extends application_controller_default {
    static targets = ["transcriptionButton"];
    initialize() {
    }
    async downloadTranscription() {
      const button = this.transcriptionButtonTarget;
      button.classList.toggle("transcribing");
      button.setAttribute("disabled", true);
      button.innerText = "Transcribing";
      await generateAndDownloadTranscription();
      button.classList.toggle("transcribing");
      button.removeAttribute("disabled");
      button.innerText = "Download Transcription";
    }
    async generateAndDownloadTranscription() {
      await transcription_channel_default.generateTranscription();
      await transcription_channel_default.downloadTranscription();
    }
  };

  // rails:/docker/app/app/javascript/controllers/**/*_controller.{js,ts}
  var modules = [{ name: "-messages", module: module0, filename: "_messages_controller.js" }, { name: "application", module: application_controller_exports, filename: "application_controller.js" }, { name: "chats", module: chats_controller_exports, filename: "chats_controller.js" }, { name: "dropzone", module: dropzone_controller_exports, filename: "dropzone_controller.js" }, { name: "example", module: example_controller_exports, filename: "example_controller.js" }, { name: "institution-select", module: institution_select_controller_exports, filename: "institution_select_controller.js" }, { name: "recording", module: recording_controller_exports, filename: "recording_controller.ts" }, { name: "transcription", module: transcription_controller_exports, filename: "transcription_controller.js" }];
  var controller_default = modules;

  // controllers/index.js
  controller_default.forEach((controller) => {
    application.register(controller.name, controller.module.default);
  });

  // custom/companion.js
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).then(() => navigator.serviceWorker.ready).then((registration) => {
      if ("SyncManager" in window) {
        registration.sync.register("sync-forms");
      }
      console.log("[Companion]", "Service worker registered!", registration);
      var serviceWorker;
      if (registration.installing) {
        serviceWorker = registration.installing;
        console.log("Service worker installing.");
      } else if (registration.waiting) {
        serviceWorker = registration.waiting;
        console.log("Service worker installed & waiting.");
      } else if (registration.active) {
        serviceWorker = registration.active;
        console.log("Service worker active.");
      }
      window.Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          throw new Error("Permission not granted for Notification");
        }
      });
    }).catch(function(err) {
      console.log("ServiceWorker registration failed: ", err);
    });
  } else {
    console.log("No service-worker on this browser");
  }
  window.addEventListener("offline", () => {
    window.location.reload();
  });
})();
/*! Bundled license information:

stimulus_reflex/dist/stimulus_reflex.js:
  (*!
   * Toastify js 1.12.0
   * https://github.com/apvarun/toastify-js
   * @license MIT licensed
   *
   * Copyright (C) 2018 Varun A P
   *)
*/
//# sourceMappingURL=application.js.map
