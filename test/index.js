'use strict';

var Parser = require('..'),
  fs = require('fs'),
  assert = require('assert');

describe('Parser', function () {
  describe('#()', function () {
    it('should have default keyword spec when none is passed', function () {
      assert((new Parser()).keywordSpec.gettext.length > 0);
    });

    it('should convert int params to strings', function () {
      assert.deepEqual((new Parser({_: [0]})).keywordSpec, {_: ['msgid']});
      assert.deepEqual((new Parser({n_: [0, 1]})).keywordSpec, {n_: ['msgid', 'msgid_plural']});

      var spec = new Parser({n_: [2, 1]}).keywordSpec.n_;
      assert.equal(spec.length, 3);
      assert.equal(spec[1], 'msgid_plural');
      assert.equal(spec[2], 'msgid');

      spec = new Parser({n_: [1, 2]}).keywordSpec.n_;
      assert.equal(spec.length, 3);
      assert.equal(spec[1], 'msgid');
      assert.equal(spec[2], 'msgid_plural');
    });
  });

  describe('#parse()', function () {
    it('should return results', function (done) {
      fs.readFile(__dirname + '/fixtures/template.hbs', {encoding: 'utf8'}, function (err, data) {
        if (err) {
          throw err;
        }

        var result = (new Parser()).parse(data);

        assert.equal(typeof result, 'object');
        assert('inside block' in result);
        assert('inside block inverse' in result);
        assert.equal(Object.keys(result).length, 8);
        assert.equal(result['Image description'].line.length, 2);

        done();
      });
    });

    it('should return plural results', function (done) {
      fs.readFile(__dirname + '/fixtures/plural.hbs', {encoding: 'utf8'}, function (err, data) {
        if (err) {
          throw err;
        }

        var result = (new Parser()).parse(data);

        assert.equal(Object.keys(result).length, 2);
        assert.equal(result['default'].plural, 'defaults');

        done();
      });
    });

    it('should throw an error if there are mismatched plurals', function (done) {
      fs.readFile(__dirname + '/fixtures/mismatched-plurals.hbs', {encoding: 'utf8'}, function (err, data) {
        if (err) {
          throw err;
        }

        assert.throws(function() { new Parser().parse(data); }, Error);

        done();
      });
    });

    it('should recognize subexpressions', function (done) {
      fs.readFile(__dirname + '/fixtures/subexpression.hbs', {encoding: 'utf8'}, function (err, data) {
        if (err) {
          throw err;
        }

        var result = (new Parser()).parse(data);

        assert('subexpression' in result);
        assert('%s subexpression' in result);
        assert.equal(result['%s subexpression'].plural, '%s subexpressions');
        assert('%s %s subexpression' in result);
        assert.equal(result['%s %s subexpression'].plural, '%s %s subexpressions');
        assert('second' in result);
        assert('regular' in result);
        assert('%s %s other' in result);
        assert('nested %s' in result);
        assert.equal(7, Object.keys(result).length);

        done();
      });
    });
  });

  it('should support skipping parameters', function (done) {
    fs.readFile(__dirname + '/fixtures/skip-params.hbs', {encoding: 'utf8'}, function (err, data) {
      if (err) {
        throw err;
      }

      var result = new Parser({_: [1, 2]}).parse(data);

      assert.equal(result.msgid.msgid, 'msgid');
      assert.equal(result.msgid.msgid_plural, 'plural');

      done();
    });
  });

  it('should support extracting contexts', function (done) {
    fs.readFile(__dirname + '/fixtures/contexts.hbs', {encoding: 'utf8'}, function (err, data) {
      if (err) {
        throw err;
      }

      var result = (new Parser()).parse(data);

      var key = Parser.messageToKey('pgettext_msgid', 'pgettext context');
      assert(key in result);
      assert.equal(result[key].msgctxt, 'pgettext context');

      key = Parser.messageToKey('p_msgid', 'p_ context');
      assert(key in result);
      assert.equal(result[key].msgctxt, 'p_ context');

      key = Parser.messageToKey('file', 'noun');
      assert(key in result);
      assert.equal(result[key].msgctxt, 'noun');
      assert.equal(result[key].msgid_plural, 'files');
      assert.equal(result[key].plural, 'files');

      key = Parser.messageToKey('file', 'verb');
      assert(key in result);
      assert.equal(result[key].msgctxt, 'verb');
      assert.equal(result[key].msgid_plural, 'files');
      assert.equal(result[key].plural, 'files');

      assert.equal(4, Object.keys(result).length);

      done();
    });
  });

  it('should support being called without `new`', function (done) {
    /* jshint newcap: false */
    fs.readFile(__dirname + '/fixtures/template.hbs', {encoding: 'utf8'}, function (err, data) {
      if (err) {
        throw err;
      }

      var result = Parser().parse(data);

      assert('inside block' in result);

      done();
    });
  });
});
