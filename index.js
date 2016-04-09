'use strict';

var Handlebars = require('handlebars');

function Parser (keywordSpec) {
  // make new optional
  if (!(this instanceof Parser)) {
    return new Parser(keywordSpec);
  }

  var gettextSpec = ['msgid'];
  var ngettextSpec = ['msgid', 'msgid_plural'];
  var pgettextSpec = ['msgctxt', 'msgid'];
  var npgettextSpec = ['msgctxt', 'msgid', 'msgid_plural'];

  keywordSpec = keywordSpec || {
    gettext: gettextSpec,
    _: gettextSpec,

    ngettext: ngettextSpec,
    n_: ngettextSpec,

    pgettext: pgettextSpec,
    p_: pgettextSpec,

    npgettext: npgettextSpec,
    np_: npgettextSpec
  };

  // maintain backwards compatibility with `_: [0]` format
  keywordSpec = Object.keys(keywordSpec).reduce(function (spec, keyword) {
    spec[keyword] = keywordSpec[keyword].reduce(function (a, param, index) {
      if (typeof param === 'number') {
        if (param > a.length) {
          // grow array
          for (var i = 0; i < param - a.length; i++) {
            a.push('ignored' + i);
          }
        }

        if (index === 0) {
          a[param] = 'msgid';
        } else if (index === 1) {
          a[param] = 'msgid_plural';
        } else {
          throw new Error('Too many integers passed for keyword ' + keyword);
        }
      } else {
        a.push(param);
      }

      return a;
    }, []);

    return spec;
  }, {});

  Object.keys(keywordSpec).forEach(function (keyword) {
    if (keywordSpec[keyword].indexOf('msgid') === -1) {
      throw new Error('Every keyword must have a msgid parameter, but "' + keyword + '" doesn\'t have one');
    }
  });

  this.keywordSpec = keywordSpec;
}

// Same as what Jed.js uses
Parser.contextDelimiter = String.fromCharCode(4);

Parser.messageToKey = function (msgid, msgctxt) {
  return msgctxt ? msgctxt + Parser.contextDelimiter + msgid : msgid;
};

/**
 * Given a Handlebars template string returns the list of i18n strings.
 *
 * @param String template The content of a HBS template.
 * @return Object The list of translatable strings, the line(s) on which each appears and an optional plural form.
 */
Parser.prototype.parse = function (template) {
  var keywordSpec = this.keywordSpec,
    keywords = Object.keys(keywordSpec),
    tree = Handlebars.parse(template);

  var isMsg = function (msgs, statement) {
    switch (statement.type) {
    case 'MustacheStatement':
    case 'SubExpression':
      if (keywords.indexOf(statement.path.original) !== -1) {
        var spec = keywordSpec[statement.path.original],
          params = statement.params,
          msgidParam = params[spec.indexOf('msgid')];

        if (msgidParam) { // don't extract {{gettext}} without param
          var msgid = msgidParam.original,
            contextIndex = spec.indexOf('msgctxt');

          var context = null; // null context is *not* the same as empty context

          if (contextIndex >= 0) {
            var contextParam = params[contextIndex];

            if (!contextParam) {
              // throw an error if there's supposed to be a context but not enough
              // parameters were passed to the handlebars helper
              throw new Error('No context specified for msgid "' + msgid + '"');
            }

            if (contextParam.type !== 'StringLiteral') {
              throw new Error('Context must be a string literal for msgid "' + msgid + '"');
            }

            context = contextParam.original;
          }

          var key = Parser.messageToKey(msgid, context);
          msgs[key] = msgs[key] || {line: []};

          // make sure plural forms match
          var pluralIndex = spec.indexOf('msgid_plural');
          if (pluralIndex !== -1) {
            var pluralParam = params[pluralIndex];

            if (!pluralParam) {
              throw new Error('No plural specified for msgid "' + msgid + '"');
            }

            if (pluralParam.type !== 'StringLiteral') {
              throw new Error('Plural must be a string literal for msgid ' + msgid);
            }

            var plural = pluralParam.original;
            var existingPlural = msgs[key].msgid_plural;
            if (plural && existingPlural && existingPlural !== plural) {
              throw new Error('Incompatible plural definitions for msgid "' + msgid +
                '" ("' + msgs[key].msgid_plural + '" and "' + plural + '")');
            }
          }

          msgs[key].line.push(statement.loc.start.line);

          spec.forEach(function(prop, i) {
            var param = params[i];

            if (param && param.type === 'StringLiteral') {
              msgs[key][prop] = params[i].original;
            }
          });

          // maintain backwards compatibility with plural output
          msgs[key].plural = msgs[key].msgid_plural;
        }
      }

      // step into possible subexpressions
      statement.params.reduce(isMsg, msgs);
      if (statement.hash) {
        for (var i = 0; i < statement.hash.pairs.length; i++) {
          isMsg(msgs, statement.hash.pairs[i].value);
        }
      }

      break;
    case 'BlockStatement':
      if (statement.program) {
        statement.program.body.reduce(isMsg, msgs);
      }

      if (statement.inverse) {
        statement.inverse.body.reduce(isMsg, msgs);
      }

      break;

    case 'PartialStatement':
      if (statement.hash && statement.hash.pairs) {
        for (var j = 0; j < statement.hash.pairs.length; j++) {
          if (statement.hash.pairs[j].value && statement.hash.pairs[j].value.type === 'SubExpression') {
            isMsg(msgs, statement.hash.pairs[j].value);
          }
        }
      }

      break;
    }

    return msgs;
  };

  return tree.body.reduce(isMsg, {});
};

module.exports = Parser;
