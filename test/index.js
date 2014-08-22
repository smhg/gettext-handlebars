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
                assert.equal(Object.keys(result).length, 6);
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
      });
  });
