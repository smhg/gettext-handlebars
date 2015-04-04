'use strict';

var Handlebars = require('handlebars');

/**
 * Constructor
 * @param Object keywordSpec An object with keywords as keys and parameter indexes as values
 */
function Parser (keywordSpec) {
    keywordSpec = keywordSpec || {
        _: [0],
        gettext: [0],
        ngettext: [0, 1]
      };

    if (typeof keywordSpec !== 'object') {
      throw 'Invalid keyword spec';
    }

    this.keywordSpec = keywordSpec;
  }

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
        statement = statement.sexpr || statement;

        switch (statement.type) {
          case 'sexpr':
            if (keywords.indexOf(statement.id.string) >= 0) {
              var idx = keywordSpec[statement.id.string],
                param = statement.params[idx[0]];

              if (param && param.type === 'STRING') {
                msgs[param.string] = msgs[param.string] || {line: []};
                msgs[param.string].line.push(param.firstLine);
              }

              if (idx[1] && statement.params[idx[1]]) {
                msgs[param.string].plural = msgs[param.string].plural || statement.params[idx[1]].string;
              }
            }

            statement.params.reduce(isMsg, msgs);

            break;
          case 'block':
            if (statement.program) {
              statement.program.statements.reduce(isMsg, msgs);
            }

            if (statement.inverse) {
              statement.inverse.statements.reduce(isMsg, msgs);
            }

            break;
        }

        return msgs;
      };

    return tree.statements.reduce(isMsg, {});
  };

module.exports = Parser;
