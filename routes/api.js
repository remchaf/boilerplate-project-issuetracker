"use strict";
// MongoDb && Mongoose
require("dotenv").config();
require("mongodb");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const issueSchema = new Schema({
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: String,
  created_on: Date,
  updated_on: Date,
  status_text: String,
  open: { type: Boolean, default: true },
  project: String,
});
const Issue = mongoose.model("Issue", issueSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      if (!project) {
        res.json({ error: "missing project" });
        return;
      }

      if (project == "all") {
        console.log("Attempt to drop issue collection");
        try {
          Issue.deleteMany({}, function (err, result) {
            if (err) return console.error(err);
            res.send(result);
            return;
          });
        } catch {
          res.json({
            error: "Could not delete all the documents from Issue collection",
          });
        }
      }

      const query = Object.assign(req.body, { project: project });
      Issue.find(query, "-__v -project -", (err, docsArr) => {
        if (err) return console.log(err);
        res.send(docsArr);
      });
    })

    .post(function (req, res) {
      const body = req.body;

      if (!body.issue_title || !body.issue_text || !body.created_by) {
        res.json({ error: "requied field(s) missing" });
        return;
      }

      const date = new Date();
      const obj = Object.assign({}, body, {
        created_on: date,
        updated_on: date,
        open: body.status_text === false ? false : true,
        project: req.params.project,
      });
      new Issue(obj).save((err, doc) => {
        if (err) return console.error(err);
        const issue = Object.assign({}, doc._doc, {
          status_text: "",
          assigned_to: "",
        });
        delete issue.project;
        delete issue.__v;
        res.json(issue);
        return;
      });
    })

    .put(function (req, res) {
      const _id = req.body._id;

      if (!_id || /\s+/.test(_id)) res.json({ error: "missing _id" });
      else if (Object.values(req.body).length < 2)
        res.json({ error: "no update field(s) sent", _id: _id });
      else {
        try {
          ObjectId(_id);
        } catch {
          res.json({ error: "could not update" });
          return;
        }

        let update = Object.assign({}, req.body, { updated_on: new Date() });

        for (const key in update) {
          if (key === "_id") delete update[key];
          if (!update[key]) delete update[key];
        }

        Issue.findOneAndUpdate(
          { _id: _id },
          update,
          { new: true },
          (err, doc) => {
            if (err) {
              res.json({ error: "could not update" });
              return console.log(err);
            }
            res.json({ result: "successfully updated", _id: doc._id });
          }
        );
      }
    })

    .delete(function (req, res) {
      if (!req.body._id) {
        res.json({ error: "missing _id" });
        return;
      }
      const _id = req.body._id;

      try {
        ObjectId(_id);
      } catch {
        res.json({
          error: "could not delete",
          _id,
        });
        return;
      }

      Issue.findOneAndDelete({ _id: _id }, (err, doc) => {
        if (err) {
          res.json({
            error: "could not delete",
            _id: _id,
          });
          return console.log(err);
        }
        res.json({
          result: "successfully deleted",
          _id: _id,
        });
      });
    });
};
