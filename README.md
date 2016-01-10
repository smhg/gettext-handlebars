# gettext-handlebars [![build status](https://secure.travis-ci.org/smhg/gettext-handlebars.png)](http://travis-ci.org/smhg/gettext-handlebars)

Extract translatable strings from [Handlebars](http://handlebarsjs.com/) template strings.

It can be used stand-alone or through [gmarty/gettext](https://github.com/gmarty/xgettext).

### API

#### new Parser(keywordspec)
Creates a new parser.
The `keywordspec` parameter is optional, with the default being:
```javascript
{
  gettext: ['msgid'],
  _: ['msgid'],

  ngettext: ['msgid', 'msgid_plural'],
  n_: ['msgid', 'msgid_plural'],

  pgettext: ['msgctxt', 'msgid'],
  p_: ['msgctxt', 'msgid'],

  npgettext: ['msgctxt', 'msgid', 'msgid_plural'],
  np_: ['msgctxt', 'msgid', 'msgid_plural']
}
```
Each keyword (key) requires array of strings indicating the order of expected PO fields.
For example `npgettext: ['msgctxt', 'msgid', 'msgid_plural']` indicates that the
`npgettext` handlebars helper takes arguments of form `{{npgettext "context" "string" "plural" ...}}`

#### .parse(template)
Parses the `template` string for Handlebars expressions using the keywordspec.
It returns an object with this structure:
```javascript
{
  msgid1: {
    line: [1, 3]
  },
  msgid2: {
    line: [2],
    plural: 'msgid_plural'
  },
  context\u0004msgid2: {
    line: [4]
  }
}
```

### Development

#### Install
```shell
git clone git@github.com:smhg/gettext-handlebars.git
npm i
```

#### Test
```shell
npm run lint
npm test
```
