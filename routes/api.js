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
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: "" },
  created_on: Date,
  updated_on: Date,
  status_text: { type: String, default: "" },
  open: { type: Boolean, default: true },
  project: String,
});
const Issue = mongoose.model("Issue", issueSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      if (!req.params.project) {
        res.json({ error: "missing project" });
        return;
      }

      const query = Object.assign(req.query, { project: req.params.project });
      Issue.find(query)
        .select("-__v -project")
        .exec((err, docsArr) => {
          if (err) return console.log(err);
          res.send(docsArr);
        });
    })

    .post(function (req, res) {
      const body = req.body;

      if (!body.issue_title || !body.issue_text || !body.created_by) {
        res.json({ error: "required field(s) missing" });
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
        const issue = doc._doc;
        // Object.assign({}, doc._doc, {
        //   status_text: "",
        //   assigned_to: "",
        // });
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
            if (err || !doc) {
              res.json({ error: "could not update", _id });
              return console.log(err);
            }
            res.json({ result: "successfully updated", _id: _id });
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

        Issue.findOneAndDelete({ _id: _id }, (err, doc) => {
          if (!doc) {
            res.json({
              error: "could not delete",
              _id: _id,
            });
            return;
          }

          res.json({
            result: "successfully deleted",
            _id: doc._id,
          });
        });
      } catch (error) {
        res.json({
          error: "could not delete",
          _id,
        });
        return;
      }
    });
};
