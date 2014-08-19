# gettext-handlebars [![build status](https://secure.travis-ci.org/smhg/gettext-handlebars.png)](http://travis-ci.org/smhg/gettext-handlebars)

Extract translatable strings from Handlebars template strings.

## Example use
```javascript
var Parser = require('gettext-handlebars'),
	parser = new Parser(),
	template = '<html></html>';

var msgs = parser.parse(template);
/**
 * msgs contains an object of this form:
 * {
 *   msgid: {
 *     line: [1],
 *     plural: 'plural'
 *   },
 *   msgid2: {
 *     line: [3, 4]
 *   }
 * }
 */
```

## CLI use
The parser is integrated into [gmarty/gettext](https://github.com/gmarty/xgettext) for use on the command line.