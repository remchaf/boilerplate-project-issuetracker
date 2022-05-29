const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Browser = require("zombie");
Browser.site = "localhost:3000";

chai.use(chaiHttp);

suite("Functional Tests", function () {
  this.timeout(10000);

  const browser = new Browser();
  suiteSetup(function (done) {
    return browser.visit("/", done);
  });

  suite("Headless browser", function () {
    test('should have a working "site" property', function (done) {
      assert.isNotNull(browser.site);
      done();
    });
  });

  
});
