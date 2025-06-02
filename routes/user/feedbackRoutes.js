const mongoose = require("mongoose");

// ==== IMPORT SERVICES ====
const errorCodes = require("../../services/errorCodes");

// ==== IMPORT MIDDLEWARE ====
const { requireLogin } = require("../../middleware/requireLogin");

// ==== IMPORT MODELS ====
// const User = mongoose.model("users");
const Feedback = mongoose.model("feedback");
const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  // ============================
  // ==== GET ALL REEL ====
  // ============================
  app.post("/api/v1/user/get/feedback", requireLogin, async (req, res) => {
    try {
      const limit = parseInt(req.body.pageSize);
      const skip = parseInt(req.body.page);
      const search = req.body.search;
      const searchBy = req.body.searchBy;
      const orderBy = req.body.orderBy ?? null;
      const orderDirection = req.body.order ?? "";
      const filter = req.body.filter;
      const select = " "; // select the fields to be returned

      let query = {
        status: "ACTIVE",
      };

      if (search) {
        query[searchBy] = { $regex: search, $options: "i" };
      }

      if (filter) {
        for (const key in filter) {
          if (filter[key]) {
            if (key[0] == "_") {
              query[key] = new mongoose.Types.ObjectId(filter[key]);
            } else {
              query[key] = filter[key];
            }
          }
        }
      }

      const sortBy = orderBy ? { [orderBy]: orderDirection } : { name: "desc" };

      const feedbacks = await Feedback.find(query, select)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const totalCount = await Feedback.countDocuments(query);
      res.json({ data: feedbacks, total: totalCount, page: skip });
    } catch (err) {
      console.log(`==== ${ROUTE_TYPE} GET REEL ERROR ==== \n error:`, err);
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== GET REEL BY ID ====
  // =============================
  app.get("/api/v1/user/get/feedback/:id", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET REEL BY ID ==== \n body:`, req.body);
    try {
      const feedback = await Feedback.findById(req.params.id).select("");
      if (!feedback) {
        return res.status(400).json(errorCodes.feedback_not_found);
      }
      res.json(feedback);
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} GET REEL BY ID ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== ADD REEL ====
  // =============================

  app.post(
    "/api/v1/user/add/feedback",
    upload.none(),
    requireLogin,
    async (req, res) => {
      try {
        const { rating, comments } = req.body;

        const feedback = await Feedback.create({
          rating,
          comments,
          author: req.user._id,
        });

        res
          .status(200)
          .json({ message: "Feedback uploaded successfully", feedback });
      } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // =============================
  // ==== UPDATE REEL ====
  app.put(
    "/api/v1/user/update/feedback",
    requireLogin,
    // Accept a single uploaded video file
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} UPDATE REEL ==== \n body:`, req.body);

      try {
        const { _id, rating, comments } = req.body;

        const feedback = await Feedback.findById(_id);
        if (!feedback) {
          return res.status(404).json(errorCodes.feedback_not_found);
        }

        // Check permission (user or owner)
        if (!feedback.author.equals(req.user._id) && !req.user.isAdmin) {
          return res.status(403).json(errorCodes.unauthorized);
        }

        // Prepare update fields
        const updateFields = {};
        if (rating !== undefined) updateFields.rating = rating.trim();
        if (comments !== undefined) updateFields.comments = comments.trim();

        const updatedFeedback = await Feedback.findByIdAndUpdate(
          _id,
          { $set: updateFields },
          { new: true }
        ).populate("author", "username profilePic");

        res.json({
          message: "Feedback updated successfully",
          feedback: updatedFeedback,
        });
      } catch (err) {
        console.error(
          `==== ${ROUTE_TYPE} UPDATE REEL ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // =================================
  // ==== DELETE REEL BY ID ====
  // =================================
  app.post(
    "/api/v1/user/delete/many/feedback",
    requireLogin,
    async (req, res) => {
      console.log(
        `==== ${ROUTE_TYPE} DELETE MANY REEL ==== \n body:`,
        req.body
      );
      try {
        const { ids } = req.body;
        const deletedFeedback = await Feedback.updateMany(
          { _id: { $in: ids } },
          { $set: { status: "DELETED" } }
        );
        if (deletedFeedback.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }
        res.json({
          message: "Feedback posts deleted successfully",
          deletedFeedback,
        });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} DELETE MANY REEL ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );
};
