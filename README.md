gettext-handlebars
==================

Extract translatable strings from Handlebars templates.

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
