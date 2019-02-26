'use strict';

const Parser = require('..');
const { promisify } = require('util');
const readFile = promisify(require('fs').readFile);
const { throws, ok, deepStrictEqual, strictEqual } = require('assert');
const path = require('path');

async function readFixture (file) {
  return readFile(path.join(__dirname, `/fixtures/${file}`), { encoding: 'utf8' });
}

describe('Parser', function () {
  describe('#()', function () {
    it('should have default keyword spec when none is passed', function () {
      ok(Object.keys((new Parser()).keywordSpec.gettext).length > 0);
    });

    it('should convert old spec formats', function () {
      deepStrictEqual((new Parser({ _: [0] })).keywordSpec, { _: { msgid: 0 } });
      deepStrictEqual((new Parser({ n_: [0, 1] })).keywordSpec, { n_: { msgid: 0, msgid_plural: 1 } });

      let spec = new Parser({ n_: [2, 1] }).keywordSpec.n_;
      strictEqual(Object.keys(spec).length, 2);
      strictEqual(spec.msgid_plural, 1);
      strictEqual(spec.msgid, 2);

      spec = new Parser({ n_: [1, 2] }).keywordSpec.n_;
      strictEqual(Object.keys(spec).length, 2);
      strictEqual(spec.msgid, 1);
      strictEqual(spec.msgid_plural, 2);

      spec = new Parser({ ngettext: ['msgid', 'msgid_plural'] }).keywordSpec.ngettext;
      strictEqual(Object.keys(spec).length, 2);
      strictEqual(spec.msgid, 0);
      strictEqual(spec.msgid_plural, 1);
    });
  });

  describe('#parse()', function () {
    it('should return results', async () => {
      try {
        const data = await readFixture('template.hbs');

        const result = (new Parser()).parse(data);

        strictEqual(typeof result, 'object');
        ok('inside block' in result);
        ok('inside block inverse' in result);
        strictEqual(Object.keys(result).length, 8);
        strictEqual(result['Image description'].line.length, 2);
      } catch (err) {
        throw err;
      }
    });

    it('should return plural results', async () => {
      try {
        const data = await readFixture('plural.hbs');

        const result = (new Parser()).parse(data);

        strictEqual(Object.keys(result).length, 2);
        strictEqual(result['default'].plural, 'defaults');
      } catch (err) {
        throw err;
      }
    });

    it('should throw an error if there are mismatched plurals', async () => {
      try {
        const data = await readFixture('mismatched-plurals.hbs');

        throws(function () { new Parser().parse(data); }, Error);
      } catch (err) {
        throw err;
      }
    });

    it('should recognize subexpressions', async () => {
      try {
        const data = await readFixture('subexpression.hbs');

        const result = (new Parser()).parse(data);

        ok('subexpression' in result);
        ok('%s subexpression' in result);
        strictEqual(result['%s subexpression'].plural, '%s subexpressions');
        ok('%s %s subexpression' in result);
        strictEqual(result['%s %s subexpression'].plural, '%s %s subexpressions');
        ok('second' in result);
        ok('regular' in result);
        ok('%s %s other' in result);
        ok('nested %s' in result);
        ok('dummy_hash_text' in result);
        ok('dummy_hash_text_only' in result);
        ok('subexpression_from_from_partial' in result);
        strictEqual(10, Object.keys(result).length);
      } catch (err) {
        throw err;
      }
    });
  });

  it('should support skipping parameters', async () => {
    try {
      const data = await readFixture('skip-params.hbs');

      const result = new Parser({ _: [1, 2] }).parse(data);

      strictEqual(result.msgid.msgid, 'msgid');
      strictEqual(result.msgid.msgid_plural, 'plural');
    } catch (err) {
      throw err;
    }
  });

  it('should support extracting contexts', async () => {
    try {
      const data = await readFixture('contexts.hbs');

      const result = (new Parser({
        pgettext: {
          msgctxt: 0,
          msgid: 1
        },
        npgettext: {
          msgctxt: 0,
          msgid: 1,
          msgid_plural: 2
        }
      })).parse(data);

      let key = Parser.messageToKey('msgid', 'first context');
      ok(key in result);
      strictEqual(result[key].msgctxt, 'first context');

      key = Parser.messageToKey('msgid', 'second context');
      ok(key in result);
      strictEqual(result[key].msgctxt, 'second context');

      key = Parser.messageToKey('file', 'first context');
      ok(key in result);
      strictEqual(result[key].msgctxt, 'first context');
      strictEqual(result[key].msgid_plural, 'files');
      strictEqual(result[key].plural, 'files');

      key = Parser.messageToKey('file', 'second context');
      ok(key in result);
      strictEqual(result[key].msgctxt, 'second context');
      strictEqual(result[key].msgid_plural, 'files');
      strictEqual(result[key].plural, 'files');

      strictEqual(4, Object.keys(result).length);
    } catch (err) {
      throw err;
    }
  });

  it('should support being called without `new`', async () => {
    try {
      const data = await readFixture('template.hbs');

      const result = Parser().parse(data);

      ok('inside block' in result);
    } catch (err) {
      throw err;
    }
  });
});
