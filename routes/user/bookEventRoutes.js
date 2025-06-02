const mongoose = require("mongoose");

// ==== IMPORT SERVICES ====
const errorCodes = require("../../services/errorCodes");

// ==== IMPORT MIDDLEWARE ====
const { requireLogin } = require("../../middleware/requireLogin");

// ==== IMPORT MODELS ====
// const User = mongoose.model("users");
const Reel = mongoose.model("reel");
// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "publics/reel"); // you can change this to a specific folder
//   },
//   filename: (req, file, cb) => {
//     console.log(file);
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;

module.exports = (app) => {
  // ============================
  // ==== GET ALL REEL ====
  // ============================
  app.post("/api/v1/user/get/reel", requireLogin, async (req, res) => {
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

      const reels = await Reel.find(query, select)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const totalCount = await Reel.countDocuments(query);
      res.json({ data: reels, total: totalCount, page: skip });
    } catch (err) {
      console.log(`==== ${ROUTE_TYPE} GET REEL ERROR ==== \n error:`, err);
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== GET REEL BY ID ====
  // =============================
  app.get("/api/v1/user/get/reel/:id", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET REEL BY ID ==== \n body:`, req.body);
    try {
      const reel = await Reel.findById(req.params.id).select("");
      if (!reel) {
        return res.status(400).json(errorCodes.reel_not_found);
      }
      res.json(reel);
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
    "/api/v1/user/add/reel",
    upload.single("video"), // Handle a single file with the key 'video'
    async (req, res) => {
      try {
        const { caption, location } = req.body;
        const videoFile = req.file;

        if (!videoFile) {
          return res.status(400).json({ error: "No video uploaded" });
        }

        const videoPath = videoFile.path; // or just videoFile.filename
        const reel = await Reel.create({
          video: videoPath,
          caption,
          location,
          // author: optional for now
        });

        res.status(200).json({ message: "Reel uploaded successfully", reel });
      } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // =============================
  // ==== UPDATE REEL ====
  app.put(
    "/api/v1/user/update/reel",
    requireLogin,
    upload.single("video"), // Accept a single uploaded video file
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} UPDATE REEL ==== \n body:`, req.body);

      try {
        const { _id, caption, location } = req.body;

        const reel = await Reel.findById(_id);
        if (!reel) {
          return res.status(404).json(errorCodes.reel_not_found);
        }

        // Check permission (user or owner)
        if (!reel.author.equals(req.user._id) && !req.user.isAdmin) {
          return res.status(403).json(errorCodes.unauthorized);
        }

        // Prepare update fields
        const updateFields = {};
        if (caption !== undefined) updateFields.caption = caption.trim();
        if (location !== undefined) updateFields.location = location.trim();
        if (req.file) updateFields.video = req.file.path;

        const updatedReel = await Reel.findByIdAndUpdate(
          _id,
          { $set: updateFields },
          { new: true }
        ).populate("author", "username profilePic");

        res.json({ message: "Reel updated successfully", reel: updatedReel });
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
  app.post("/api/v1/user/delete/many/reel", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} DELETE MANY REEL ==== \n body:`, req.body);
    try {
      const { ids } = req.body;
      const deletedReel = await Reel.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "DELETED" } }
      );
      if (deletedReel.modifiedCount === 0) {
        return res.status(400).json(errorCodes.unable_to_update_details);
      }
      res.json({ message: "Reel posts deleted successfully", deletedReel });
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} DELETE MANY REEL ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });
};
