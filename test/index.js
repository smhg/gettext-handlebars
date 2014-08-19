var Parser = require('..'),
  fs = require('fs'),
  assert = require('assert');

describe('Parser', function () {
  describe('#()', function () {
    it('should have default keyword spec when none is passed', function () {
      assert.ok((new Parser()).keywordSpec.gettext.length > 0);
    });
  });

  describe('#parse()', function () {
    var parser = new Parser(),
      template,
      result;

    it('should return results', function () {
      template = fs.readFileSync(__dirname + '/fixtures/template.hbs', 'utf8'),
      result = parser.parse(template);

      assert.equal(typeof result, 'object');
      assert.equal(Object.keys(result).length, 6);
      assert.equal(result['Image description'].line.length, 2);
    });

    it('should return plural results', function () {
      template = fs.readFileSync(__dirname + '/fixtures/plural.hbs', 'utf8');
      result = parser.parse(template);

      assert.equal(Object.keys(result).length, 2);
      assert.equal(result['default'].plural, 'defaults');
    });
  });
});
