module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var validateChatId = function validateChatId(chatId) {
  if (typeof chatId !== 'number') {
    throw new Error('Invalid chat id: ' + chatId);
  }
};

var validateText = function validateText(text) {
  if (typeof text !== 'string' && text !== '') {
    throw new Error('Text must be a string.');
  }
};

var createText = function createText(chatId, text) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  validateChatId(chatId);
  validateText(text);

  return {
    platform: 'telegram',
    type: 'text',
    text: text,
    raw: {
      chatId: chatId,
      options: options
    }
  };
};

var createEditMessage = function createEditMessage(text) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return {
    platform: 'telegram',
    type: 'edited_message_text',
    text: text,
    chat_id: options.chat_id,
    message_id: options.message_id,
    reply_markup: options.reply_markup,
    raw: {}
  };
};

module.exports = {
  createText: createText,
  createEditMessage: createEditMessage
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _outgoing = __webpack_require__(5);

var _outgoing2 = _interopRequireDefault(_outgoing);

var _actions = __webpack_require__(1);

var _actions2 = _interopRequireDefault(_actions);

var _umm = __webpack_require__(6);

var _umm2 = _interopRequireDefault(_umm);

var _telegram = __webpack_require__(8);

var _telegram2 = _interopRequireDefault(_telegram);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var path = __webpack_require__(12);
var fs = __webpack_require__(13);
var _ = __webpack_require__(2);
var Promise = __webpack_require__(0);

var telegram = null;
var outgoingPending = _outgoing2.default.pending;

var outgoingMiddleware = function outgoingMiddleware(event, next) {
  if (event.platform !== 'telegram') {
    return next();
  }

  if (!_outgoing2.default[event.type]) {
    return next('Unsupported event type: ' + event.type);
  }

  var setValue = function setValue(method) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (event.__id && outgoingPending[event.__id]) {

        if (args && args[0] && args[0].message_id) {
          var ts = args[0].message_id.split(':')[0];
          ts = ts && ts.substr(4);
          outgoingPending[event.__id].timestamp = parseInt(ts);
          outgoingPending[event.__id].mid = args[0].message_id;
        }

        if (method === 'resolve' && (event.raw.waitDelivery || event.raw.waitRead)) {
          // We skip setting this value because we wait
        } else {
          outgoingPending[event.__id][method].apply(null, args);
          delete outgoingPending[event.__id];
        }
      }
    };
  };

  _outgoing2.default[event.type](event, next, telegram).then(setValue('resolve'), setValue('reject'));
};

module.exports = {

  config: {
    botToken: { type: 'string', required: true, default: '', env: 'TELEGRAM_TOKEN' }
  },

  init: function init(bp, config) {
    bp.middlewares.register({
      name: 'telegram.sendMessages',
      type: 'outgoing',
      order: 100,
      handler: outgoingMiddleware,
      module: 'botpress-telegram',
      description: 'Sends out messages that targets platform = telegram.' + ' This middleware should be placed at the end as it swallows events once sent.'
    });

    bp.telegram = {};
    _.forIn(_actions2.default, function (action, name) {
      bp.telegram[name] = _actions2.default[name];
      var sendName = name.replace(/^create/, 'send');
      bp.telegram[sendName] = Promise.method(function () {

        var msg = action.apply(this, arguments);
        msg.__id = new Date().toISOString() + Math.random();
        var resolver = { event: msg };

        var promise = new Promise(function (resolve, reject) {
          resolver.resolve = resolve;
          resolver.reject = reject;
        });

        outgoingPending[msg.__id] = resolver;

        bp.middlewares.sendOutgoing(msg);

        return promise;
      });
    });

    (0, _umm2.default)(bp); // Initialize UMM
  },

  ready: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(bp, configurator) {
      var config;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return configurator.loadAll();

            case 2:
              config = _context.sent;


              telegram = new _telegram2.default(bp, config);

              telegram.startPolling(bp);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function ready(_x, _x2) {
      return _ref.apply(this, arguments);
    }

    return ready;
  }()
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var handlePromise = function handlePromise(next, promise) {
  return promise.then(function (res) {
    next();
    return res;
  }).catch(function (err) {
    next(err);
    throw err;
  });
};

var handleText = function handleText(event, next, telegram) {
  if (event.platform !== 'telegram' || event.type !== 'text') {
    return next();
  }

  var chatId = event.raw.chatId;
  var text = event.text;
  var options = event.raw.options;

  return handlePromise(next, telegram.sendText(chatId, text, options));
};

var handleEditMessageText = function handleEditMessageText(event, next, telegram) {
  if (event.platform !== 'telegram' || event.type !== 'edited_message_text') {
    return next();
  }

  var options = {
    message_id: event.message_id,
    chat_id: event.chat_id,
    reply_markup: event.reply_markup
  };

  return handlePromise(next, telegram.sendEditMessage(event.text, options));
};

module.exports = {
  'text': handleText,
  'edited_message_text': handleEditMessageText,
  pending: {}
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _util = __webpack_require__(7);

var _util2 = _interopRequireDefault(_util);

var _lodash = __webpack_require__(2);

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = __webpack_require__(0);

var _bluebird2 = _interopRequireDefault(_bluebird);

var _actions = __webpack_require__(1);

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO Extract this logic directly to botpress's UMM
function getUserId(event) {
  var userId = _lodash2.default.get(event, 'user.id') || _lodash2.default.get(event, 'user.userId') || _lodash2.default.get(event, 'userId') || _lodash2.default.get(event, 'raw.from.id') || _lodash2.default.get(event, 'raw.userId') || _lodash2.default.get(event, 'raw.user.id');

  if (!userId) {
    throw new Error('Could not find userId in the incoming event.');
  }

  return userId;
}

function PromisifyEvent(event) {
  if (!event._promise) {
    event._promise = new _bluebird2.default(function (resolve, reject) {
      event._resolve = resolve;
      event._reject = reject;
    });
  }

  return event;
}

function _processOutgoing(_ref) {
  var event = _ref.event,
      blocName = _ref.blocName,
      instruction = _ref.instruction;

  var ins = Object.assign({}, instruction); // Create a shallow copy of the instruction

  ////////
  // PRE-PROCESSING
  ////////

  var optionsList = ['typing'];

  var options = _lodash2.default.pick(instruction, optionsList);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = optionsList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var prop = _step.value;

      delete ins[prop];
    }

    /////////
    /// Processing
    /////////
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (!_lodash2.default.isNil(instruction.text)) {
    return _actions2.default.createText(event.chat.id, instruction.text, options);
  }

  ////////////
  /// POST-PROCESSING
  ////////////

  // Nothing to post-process yet

  ////////////
  /// INVALID INSTRUCTION
  ////////////

  var strRep = _util2.default.inspect(instruction, false, 1);
  throw new Error('Unrecognized instruction on Web in bloc \'' + blocName + '\': ' + strRep);
}

////////////
/// TEMPLATES
////////////

function getTemplates() {
  return [{
    type: 'Text - Single message',
    template: 'block_name_sm:\n\  - Text goes here..'
  }, {
    type: 'Text - Multiple messages',
    template: 'block_name_mm:\n  - Text goes here..(1)\n  - Text goes here..(2)'
  }, {
    type: 'Text - Random message',
    template: 'block_name_rm:\n  - text:\n    - Text goes here..(1)\n    - Text goes here..(2)'
  }, {
    type: 'Typing - Message with typing',
    template: 'block_name_bm:\n  - text: Text goes here..(1)\n    typing: 1000ms'
  }];
}

module.exports = function (bp) {
  var _$at = _lodash2.default.at(bp, ['umm', 'umm.registerConnector']),
      _$at2 = _slicedToArray(_$at, 2),
      umm = _$at2[0],
      registerConnector = _$at2[1];

  umm && registerConnector && registerConnector({
    platform: 'telegram',
    processOutgoing: function processOutgoing(args) {
      return _processOutgoing(Object.assign({}, args, { bp: bp }));
    },
    templates: getTemplates()
  });
};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _incoming = __webpack_require__(9);

var _incoming2 = _interopRequireDefault(_incoming);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TelegramBot = __webpack_require__(11);
var Promise = __webpack_require__(0);

var Telegram = function () {
  function Telegram(bp, config) {
    _classCallCheck(this, Telegram);

    if (!bp || !config) {
      throw new Error('You need to specify botpress and config');
    }

    this.bot = null;
    this.connected = false;
    this.bot = new TelegramBot(config.botToken);
    bp.logger.info('Telegram bot created');
  }

  _createClass(Telegram, [{
    key: 'setConfig',
    value: function setConfig(config) {
      this.config = Object.assign({}, this.config, config);
    }
  }, {
    key: 'validateConnection',
    value: function validateConnection() {
      if (!this.connected) {
        throw new Error('You are not connected...');
      }
    }
  }, {
    key: 'validateBeforeSending',
    value: function validateBeforeSending(chatId, options) {
      this.validateConnection();
      Telegram.validateChatId(chatId);
      Telegram.validateOptions(options);
    }
  }, {
    key: 'sendText',
    value: function sendText(chatId, text, options) {
      var _this = this;

      this.validateBeforeSending(chatId, options);
      Telegram.validateText(text);

      return Promise.fromCallback(function () {
        _this.bot.sendMessage(chatId, text, options);
      });
    }
  }, {
    key: 'sendEditMessage',
    value: function sendEditMessage(text) {
      var _this2 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.validateBeforeSending(options.chat_id, options);
      Telegram.validateText(text);

      return Promise.fromCallback(function () {
        _this2.bot.editMessageText(text, options);
      });
    }
  }, {
    key: 'startPolling',
    value: function startPolling(bp) {
      (0, _incoming2.default)(bp, this);
      bp.logger.info('Telegram loaded handler');
      this.bot.startPolling();
      bp.logger.info('Telegram started polling');
      this.connected = true;
    }
  }], [{
    key: 'validateText',
    value: function validateText(text) {
      var type = typeof text === 'undefined' ? 'undefined' : _typeof(text);
      if (type !== 'string') {
        throw new Error('Text format is not valid (actual: ' + type + ', required: string)');
      }
    }
  }, {
    key: 'validateChatId',
    value: function validateChatId(chatId) {
      var type = typeof chatId === 'undefined' ? 'undefined' : _typeof(chatId);
      if (type !== 'number') {
        throw new Error('Chat id format is not valid (actual: ' + type + ', required: number)');
      }
    }
  }, {
    key: 'validateAttachments',
    value: function validateAttachments(attachments) {
      var type = typeof attachments === 'undefined' ? 'undefined' : _typeof(attachments);
      if (type !== 'object') {
        throw new Error('Attachments format is not valid (actual: ' + type + ', required: object)');
      }
    }
  }, {
    key: 'validateOptions',
    value: function validateOptions(options) {
      var type = typeof options === 'undefined' ? 'undefined' : _typeof(options);
      if (type !== 'object') {
        throw new Error('Options format is not valid (actual: ' + type + ', required: object)');
      }
    }
  }, {
    key: 'validateBeforeReaction',
    value: function validateBeforeReaction(options) {
      if (!(options.file || options.file_comment || options.chat || options.timestamp)) {
        throw new Error('You need to set at least a destination options (file, file_comment, chat, timestamp)...');
      }
    }
  }]);

  return Telegram;
}();

module.exports = Telegram;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lruCache = __webpack_require__(10);

var _lruCache2 = _interopRequireDefault(_lruCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var messageEventTypes = [
//  'text',
'audio', 'document', 'photo', 'sticker', 'video', 'voice', 'contact', 'location'];

var actionEventTypes = ['new_chat_participant', 'left_chat_participant', 'new_chat_title', 'new_chat_photo', 'delete_chat_photo', 'group_chat_created', 'edited_message',
//  'edited_message_text',
'edited_message_caption', 'channel_post', 'edited_channel_post', 'edited_channel_post_text', 'edited_channel_post_caption,', 'inline_query', 'chosen_inline_result'];

module.exports = function (bp, telegram) {
  var messagesCache = (0, _lruCache2.default)({
    max: 10000,
    maxAge: 60 * 60 * 1000
  });

  var preprocessEvent = function preprocessEvent(payload) {
    console.log('preprocessEvent');
    var mid = payload.chat.id + '_' + payload.from.id + '_' + payload.date;
    console.log(mid);

    if (mid && !messagesCache.has(mid)) {
      payload.alreadyProcessed = true;
    } else {
      messagesCache.set(mid, true);
    }

    return payload;
  };

  var extractBasics = function extractBasics(event) {
    return {
      platform: 'telegram',
      raw: event
    };
  };

  var _handleEvent = function _handleEvent(event, eventType) {
    event = _extends({
      type: eventType
    }, extractBasics(preprocessEvent(event)));
    bp.middlewares.sendIncoming(event);
  };

  telegram.bot.on('text', function (event) {
    bp.middlewares.sendIncoming(_extends({
      type: 'text',
      chat: event.chat,
      user: event.from,
      text: event.text
    }, extractBasics(event)));
  });

  telegram.bot.on('callback_query', function (event) {
    bp.middlewares.sendIncoming(_extends({
      type: 'callback_query',
      data: event.data,
      query_id: event.id,
      chat_id: event.message.chat.id,
      user_id: event.message.from.id,
      message_id: event.message.message_id,
      text: 'null'
    }, extractBasics(event)));
  });

  messageEventTypes.map(function (eventType) {
    telegram.bot.on(eventType, function (event) {
      _handleEvent(event, eventType);
    });
  });

  actionEventTypes.map(function (eventType) {
    telegram.bot.on(eventType, function (event) {
      _handleEvent(event, eventType);
    });
  });

  telegram.bot.on('polling_error', function (error) {
    console.log(error);
  });
};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("lru-cache");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("node-telegram-bot-api");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })
/******/ ]);
//# sourceMappingURL=node.bundle.js.map