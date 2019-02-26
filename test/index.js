'use strict';

var Parser = require('..');
var fs = require('fs');
var assert = require('assert');
var path = require('path');

describe('Parser', function () {
  describe('#()', function () {
    it('should have default keyword spec when none is passed', function () {
      assert(Object.keys((new Parser()).keywordSpec.gettext).length > 0);
    });

    it('should convert old spec formats', function () {
      assert.deepStrictEqual((new Parser({ _: [0] })).keywordSpec, { _: { msgid: 0 } });
      assert.deepStrictEqual((new Parser({ n_: [0, 1] })).keywordSpec, { n_: { msgid: 0, msgid_plural: 1 } });

      var spec = new Parser({ n_: [2, 1] }).keywordSpec.n_;
      assert.strictEqual(Object.keys(spec).length, 2);
      assert.strictEqual(spec.msgid_plural, 1);
      assert.strictEqual(spec.msgid, 2);

      spec = new Parser({ n_: [1, 2] }).keywordSpec.n_;
      assert.strictEqual(Object.keys(spec).length, 2);
      assert.strictEqual(spec.msgid, 1);
      assert.strictEqual(spec.msgid_plural, 2);

      spec = new Parser({ ngettext: ['msgid', 'msgid_plural'] }).keywordSpec.ngettext;
      assert.strictEqual(Object.keys(spec).length, 2);
      assert.strictEqual(spec.msgid, 0);
      assert.strictEqual(spec.msgid_plural, 1);
    });
  });

  describe('#parse()', function () {
    it('should return results', function (done) {
      fs.readFile(path.join(__dirname, '/fixtures/template.hbs'), { encoding: 'utf8' }, function (err, data) {
        if (err) {
          throw err;
        }

        var result = (new Parser()).parse(data);

        assert.strictEqual(typeof result, 'object');
        assert('inside block' in result);
        assert('inside block inverse' in result);
        assert.strictEqual(Object.keys(result).length, 8);
        assert.strictEqual(result['Image description'].line.length, 2);

        done();
      });
    });

    it('should return plural results', function (done) {
      fs.readFile(path.join(__dirname, '/fixtures/plural.hbs'), { encoding: 'utf8' }, function (err, data) {
        if (err) {
          throw err;
        }

        var result = (new Parser()).parse(data);

        assert.strictEqual(Object.keys(result).length, 2);
        assert.strictEqual(result['default'].plural, 'defaults');

        done();
      });
    });

    it('should throw an error if there are mismatched plurals', function (done) {
      fs.readFile(path.join(__dirname, '/fixtures/mismatched-plurals.hbs'), { encoding: 'utf8' }, function (err, data) {
        if (err) {
          throw err;
        }

        assert.throws(function () { new Parser().parse(data); }, Error);

        done();
      });
    });

    it('should recognize subexpressions', function (done) {
      fs.readFile(path.join(__dirname, '/fixtures/subexpression.hbs'), { encoding: 'utf8' }, function (err, data) {
        if (err) {
          throw err;
        }

        var result = (new Parser()).parse(data);

        assert('subexpression' in result);
        assert('%s subexpression' in result);
        assert.strictEqual(result['%s subexpression'].plural, '%s subexpressions');
        assert('%s %s subexpression' in result);
        assert.strictEqual(result['%s %s subexpression'].plural, '%s %s subexpressions');
        assert('second' in result);
        assert('regular' in result);
        assert('%s %s other' in result);
        assert('nested %s' in result);
        assert('dummy_hash_text' in result);
        assert('dummy_hash_text_only' in result);
        assert('subexpression_from_from_partial' in result);
        assert.strictEqual(10, Object.keys(result).length);

        done();
      });
    });
  });

  it('should support skipping parameters', function (done) {
    fs.readFile(path.join(__dirname, '/fixtures/skip-params.hbs'), { encoding: 'utf8' }, function (err, data) {
      if (err) {
        throw err;
      }

      var result = new Parser({ _: [1, 2] }).parse(data);

      assert.strictEqual(result.msgid.msgid, 'msgid');
      assert.strictEqual(result.msgid.msgid_plural, 'plural');

      done();
    });
  });

  it('should support extracting contexts', function (done) {
    fs.readFile(path.join(__dirname, '/fixtures/contexts.hbs'), { encoding: 'utf8' }, function (err, data) {
      if (err) {
        throw err;
      }

      var result = (new Parser({
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

      var key = Parser.messageToKey('msgid', 'first context');
      assert(key in result);
      assert.strictEqual(result[key].msgctxt, 'first context');

      key = Parser.messageToKey('msgid', 'second context');
      assert(key in result);
      assert.strictEqual(result[key].msgctxt, 'second context');

      key = Parser.messageToKey('file', 'first context');
      assert(key in result);
      assert.strictEqual(result[key].msgctxt, 'first context');
      assert.strictEqual(result[key].msgid_plural, 'files');
      assert.strictEqual(result[key].plural, 'files');

      key = Parser.messageToKey('file', 'second context');
      assert(key in result);
      assert.strictEqual(result[key].msgctxt, 'second context');
      assert.strictEqual(result[key].msgid_plural, 'files');
      assert.strictEqual(result[key].plural, 'files');

      assert.strictEqual(4, Object.keys(result).length);

      done();
    });
  });

  it('should support being called without `new`', function (done) {
    /* jshint newcap: false */
    fs.readFile(path.join(__dirname, '/fixtures/template.hbs'), { encoding: 'utf8' }, function (err, data) {
      if (err) {
        throw err;
      }

      var result = Parser().parse(data);

      assert('inside block' in result);

      done();
    });
  });
});
