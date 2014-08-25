var Parser = require('..'),
  fs = require('fs'),
  assert = require('assert');

describe('Parser', function () {
    describe('#()', function () {
        it('should have default keyword spec when none is passed', function () {
            assert((new Parser()).keywordSpec.gettext.length > 0);
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
                assert.equal(Object.keys(result).length, 7);
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
  });
