const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Browser = require("zombie");
const { html } = require("mocha/lib/reporters");
Browser.site = "localhost:3000";

chai.use(chaiHttp);

suite("Functional Tests", function () {
  this.timeout(10000);

  var browser = new Browser();
  suiteSetup(function (done) {
    return browser.visit("/", done);
  });

  suite("Headless browser", function () {
    test('should have a working "site" property', function (done) {
      assert.isNotNull(browser.site);
      done();
    });
  });

  // suite("Tests with POST", function () {
  //   test("#1 - Create an issue with every field : POST", function (done) {
  //     browser.visit("/").then(() => {
  //       browser.fill("issue_title", "some title");
  //       browser.fill("issue_text", "some text");
  //       browser.fill("created_by", "myself");
  //       browser.fill("assigned_to", "you");
  //       browser.fill("status_text", "In QA");
  //       browser.pressButton("#submit", () => {
  //         browser.assert.success();
  //         const obj = JSON.parse(browser.text("#jsonResult"));
  //         assert.notProperty(obj, "error");
  //         assert.property(
  //           obj,
  //           "created_on",
  //           "created_on should be property of the returned object"
  //         );
  //         assert.property(
  //           obj,
  //           "updated_on",
  //           "updated_on should be property of the returned object"
  //         );
  //         assert.property(
  //           obj,
  //           "open",
  //           "open should be property of the returned object"
  //         );
  //         assert.property(
  //           obj,
  //           "_id",
  //           "_id should be property of the returned object"
  //         );
  //         assert.property(
  //           obj,
  //           "issue_title",
  //           "issue-title should be property of the returned object"
  //         );
  //         assert.property(
  //           obj,
  //           "issue_text",
  //           "issue_text should be property of the returned object"
  //         );
  //         assert.property(
  //           obj,
  //           "created_by",
  //           "created_by should be property of the returned object"
  //         );
  //         assert.property(
  //           obj,
  //           "assigned_to",
  //           "assign_to should be property of the returned object"
  //         );
  //         assert.property(
  //           obj,
  //           "status_text",
  //           "statue_text should be property of the returned object"
  //         );
  //         assert.typeOf(obj, "object");
  //         assert.equal(obj.status_text.length, 0);
  //         assert.equal(obj.assigned_to.length, 0);
  //         done();
  //       });
  //     });
  //   });

  //   test("#2 - Create an issue with only required fields : POST", function (done) {
  //     browser.visit("/").then(() => {
  //       browser.fill("issue_title", "some title");
  //       browser.fill("issue_text", "some text");
  //       browser.fill("created_by", "myself");
  //       browser.pressButton("#submit", () => {
  //         browser.assert.success();
  //         const obj = JSON.parse(browser.text("#jsonResult"));
  //         assert.notProperty(obj, "error");
  //         done();
  //       });
  //     });
  //   });

  //   test("#3 - Create an issue with missing required fields : POST", function (done) {
  //     browser.visit("/").then(() => {
  //       browser.fill("issue_title", "Some title");
  //       browser.fill("issue_text", "just some random text");
  //       browser.pressButton("#submit", () => {
  //         browser.assert.success();
  //         assert.property(JSON.parse(browser.text("#jsonResult")), 'error');
  //         done();
  //       });
  //     });
  //   });
  // });

  suite("Tests with DELETE", function() {

    this.beforeAll(function() {
      browser.visit("/", function() {
        browser.fill("issue_title", "Coucou");
        browser.fill("issue_text", "Mame Bauye");
        browser.fill("created_by", "my own");
        browser.pressButton("#submit", function() {
          var putAndDeleteId = JSON.parse(browser.text("jsonResult"))._id;
          console.log(putAndDeleteId)
        })
      })
    });

    test("#13 - Delete an issue with an invalid _id", function(done) {
      browser.visit("/", function() {
        browser.fill("#testForm3 _id", putAndDeleteId)
        browser.pressButton("#testForm3 submit", function() {
          browser.assert.success()
          const obj = browser.text("#jsonResult")
          console.log(obj);
        })
      })
    })
  })
});
