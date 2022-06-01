const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Browser = require("zombie");
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

  suite("Tests with POST", function () {
    test("#1 - Create an issue with every field : POST", function (done) {
      browser.visit("/").then(() => {
        browser.fill("issue_title", "some title");
        browser.fill("issue_text", "some text");
        browser.fill("created_by", "myself");
        browser.fill("assigned_to", "you");
        browser.fill("status_text", "In QA");
        browser.pressButton("#submit", () => {
          browser.assert.success();
          const obj = JSON.parse(browser.text("#jsonResult"));
          assert.notProperty(obj, "error");
          assert.property(
            obj,
            "created_on",
            "created_on should be property of the returned object"
          );
          assert.property(
            obj,
            "updated_on",
            "updated_on should be property of the returned object"
          );
          assert.property(
            obj,
            "open",
            "open should be property of the returned object"
          );
          assert.property(
            obj,
            "_id",
            "_id should be property of the returned object"
          );
          assert.property(
            obj,
            "issue_title",
            "issue-title should be property of the returned object"
          );
          assert.property(
            obj,
            "issue_text",
            "issue_text should be property of the returned object"
          );
          assert.property(
            obj,
            "created_by",
            "created_by should be property of the returned object"
          );
          assert.property(
            obj,
            "assigned_to",
            "assign_to should be property of the returned object"
          );
          assert.property(
            obj,
            "status_text",
            "statue_text should be property of the returned object"
          );
          assert.typeOf(obj, "object");
          done();
        });
      });
    });

    test("#2 - Create an issue with only required fields : POST", function (done) {
      browser.visit("/").then(() => {
        browser.fill("issue_title", "some title");
        browser.fill("issue_text", "some text");
        browser.fill("created_by", "myself");
        browser.pressButton("#submit", () => {
          browser.assert.success();
          const obj = JSON.parse(browser.text("#jsonResult"));
          assert.notProperty(obj, "error");
          done();
        });
      });
    });

    test("#3 - Create an issue with missing required fields : POST", function (done) {
      browser.visit("/").then(() => {
        browser.fill("issue_title", "Some title");
        browser.fill("issue_text", "just some random text");
        browser.pressButton("#submit", () => {
          browser.assert.success();
          assert.property(JSON.parse(browser.text("#jsonResult")), 'error');
          done();
        });
      });
    });
  });

  suite("Test with GET", function () {
    test("#4 - View issues on a project : GET", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, "array");
          assert.isAtLeast(res.body.length, 1);
          done();
        });
    });

    test("#5 - Views issues with one filter : GET", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, "array");
          done();
        });
    });

    test("#6 - View issues with multiple filters : GET", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.typeOf(res.body, "array");
          done();
        });
    });
  });

  suite("Tests with PUT", function () {
    this.beforeEach(function (done) {
      browser.visit("/", function () {
        browser.fill("issue_title", "Coucou");
        browser.fill("issue_text", "Mame Bauye");
        browser.fill("created_by", "my own");
        browser.pressButton("#submit", function () {
          done();
        });
      });
    });

  test("#7 - Update one field on an issue : PUT", function (done) {
    browser.fill("#id2", JSON.parse(browser.text("#jsonResult"))._id);
    browser.fill("#issue_title2", "updated title");
    browser.pressButton("#submit2").then(() => {
      browser.assert.success();
      assert.property(JSON.parse(browser.text("#jsonResult")), "_id");
      assert.equal(
        JSON.parse(browser.text("#jsonResult")).result,
        "successfully updated"
      );
      done();
    });
  });

  test("#8 - Update multiple fields on an issue : PUT", function (done) {
    browser.fill("#id2", JSON.parse(browser.text("#jsonResult"))._id);
    browser.fill("#issue_title2", "newly updated title");
    browser.fill("#issue_text2", "updated text");
    browser.pressButton("#submit2", function () {
      browser.assert.success();
      assert.equal(
        JSON.parse(browser.text("#jsonResult")).result,
        "successfully updated"
      );
      done();
    });
  });

  test("#9 - Update an issue with missing _id : PUT", function (done) {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

    test("#10 - Update an issue with no fields to update : PUT", function (done) {
      const id = JSON.parse(browser.text("#jsonResult"))._id;
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: id })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });
  });

  suite("Tests with DELETE", function () {
    this.beforeAll(function (done) {
      browser.visit("/", function () {
        browser.fill("issue_title", "Coucou");
        browser.fill("issue_text", "Mame Bauye");
        browser.fill("created_by", "my own");
        browser.pressButton("#submit", function () {
          done();
        });
      });
    });

    test("#12 - Delete an issue : DELETE", function (done) {
      const _id = JSON.parse(browser.text("#jsonResult"))._id;

      browser.visit("/", function () {
        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({ _id: _id })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully deleted");
            assert.property(res.body, "_id");
            done();
          });
      });
    });

    test("#13 - Delete an issue with an invalid _id : DELETE", function (done) {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({ _id: "mamebauyooooooo" })
        .end(function (err, res) {
          assert.property(res.body, "_id");
          assert.equal(res.body.error, "could not delete");
          done();
        });
    });

    test("#14 - Delete an issue with a missing _id : DELETE", function (done) {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
