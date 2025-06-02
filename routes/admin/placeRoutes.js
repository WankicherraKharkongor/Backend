const mongoose = require("mongoose");

// ==== IMPORT SERVICES ====
const errorCodes = require("../../services/errorCodes");

// ==== IMPORT MIDDLEWARE ====
const { requireLogin } = require("../../middleware/requireLogin");

// ==== IMPORT MODELS ====
const Admin = mongoose.model("admin");
const Place = mongoose.model("place");
const Like = mongoose.model("placeLike");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "publics/place");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(
      null,
      `${file.originalname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

module.exports = upload;

const ROUTE_TYPE = "ADMIN";

module.exports = (app) => {
  // ============================
  // ==== GET ALL PLACE ====
  // ============================
  app.post("/api/v1/admin/get/place", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET PLACE ==== \n body:`, req.body);
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

      const places = await Place.find(query, select)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const totalCount = await Place.countDocuments(query);
      res.json({ data: places, total: totalCount, page: skip });
    } catch (err) {
      console.log(`==== ${ROUTE_TYPE} GET PLACE ERROR ==== \n error:`, err);
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== GET PLACE BY ID ====
  // =============================
  app.get("/api/v1/admin/get/place/:id", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET PLACE BY ID ==== \n body:`, req.body);
    try {
      const place = await Place.findById(req.params.id).select("");
      if (!place) {
        return res.status(400).json(errorCodes.place_not_found);
      }
      res.json(place);
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} GET PLACE BY ID ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== ADD PLACE ====
  // =============================
  app.post(
    "/api/v1/admin/add/place",
    requireLogin,
    upload.array("images", 6),
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} ADD PLACE ==== \n body:`, req.body);
      try {
        const {
          title,
          location,
          description,
          duration,
          rating,
          type,
          longitude,
          latitude,
          guides,
        } = req.body;
        const imageName = req.files?.map((file) => file.filename); // ✅ Grab file name from multer

        const place = await Place.create({
          title,
          location,
          description,
          rating,
          longitude,
          latitude,
          type,
          duration,
          guides,
          image: imageName,
          author: req.user._id,
        });

        res.json({ message: "Place added successfully", place });
      } catch (err) {
        console.log(`==== ${ROUTE_TYPE} ADD PLACE ERROR ==== \n error:`, err);
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // Add this new route in your routes file
  app.post("/api/v1/user/like/place", requireLogin, async (req, res) => {
    try {
      const { placeId } = req.body;
      const user = req.user;

      const place = await Place.findById(placeId);
      if (!place) {
        return res.status(400).json(errorCodes.place_not_found);
      }

      const like = await Like.findOne({ userId: user.id, placeId });
      if (like) {
        await Like.deleteOne({ _id: like._id });
        return res.json({ message: "Place post unliked successfully" });
      }

      const newLike = new Like({ userId: user.id, placeId });
      await newLike.save();

      res.json({ message: "Place post liked successfully" });
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} LIKE PLACE POST ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // ======================
  // ==== GET MY LIKES ====
  // ======================
  app.get("/api/v1/user/get/my/likes", requireLogin, async (req, res) => {
    try {
      const userID = req.user.id;
      const likes = await Like.find();
      return res.json(likes);
    } catch (err) {
      console.log(`==== ${ROUTE_TYPE} GET MY LIKES ERROR ==== \n error:`, err);
      res.status(500).json(errorCodes.server_error);
    }
  });

  // // ==============================
  // // ==== COMMENT ON BLOG POST ====
  // // ==============================
  // app.post("/api/v1/user/add/comment", requireLogin, async (req, res) => {
  //   console.log(`==== ${ROUTE_TYPE} ADD COMMENT ==== \n body:`, req.body);
  //   try {
  //     const { placeId, content } = req.body;
  //     const user = req.user;

  //     const place = await Place.findById(placeId);
  //     if (!place) {
  //       return res.status(400).json(errorCodes.place_not_found);
  //     }

  //     const comment = await Comment.create({
  //       content,
  //       author: user.id,
  //       place: placeId,
  //     });

  //     res.json({ message: "Comment added successfully" });
  //   } catch (err) {
  //     console.log(
  //       `==== ${ROUTE_TYPE} COMMENT ON BLOG POST ERROR ==== \n error:`,
  //       err
  //     );
  //     res.status(500).json(errorCodes.server_error);
  //   }
  // });

  app.get("/api/v1/get/all/likes/count", requireLogin, async (req, res) => {
    try {
      // Aggregate likes to count number of likes per placeId
      const likesCount = await Like.aggregate([
        {
          $group: {
            _id: "$placeId",
            count: { $sum: 1 },
          },
        },
      ]);

      // Transform to { placeId: count, ... } format
      const result = {};
      likesCount.forEach((item) => {
        result[item._id.toString()] = item.count;
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching likes count:", error);
      res.status(500).json({ message: "Server error fetching likes count" });
    }
  });

  // =============================
  // ==== UPDATE PLACE ====
  app.put(
    "/api/v1/admin/update/place",
    requireLogin,
    upload.array("images", 6), // Use multer to handle the file upload
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} UPDATE PLACE ==== \n body:`, req.body);

      try {
        const {
          _id,
          title,
          location,
          description,
          rating,
          longitude,
          type,
          latitude,
          guides,
          duration,
        } = req.body;
        let parsedGuides = [];
        if (typeof guides === "string") {
          try {
            parsedGuides = JSON.parse(guides);
          } catch (parseError) {
            return res.status(400).json({ error: "Invalid guides format" });
          }
        } else if (Array.isArray(guides)) {
          parsedGuides = guides;
        }

        let image =
          req.files && req.files.length > 0
            ? req.files.map((file) => file.filename)
            : req.body.image;
        // Handle the uploaded image or keep the existing one

        const place = await Place.findById(_id);
        if (!place) {
          return res.status(400).json(errorCodes.place_not_found);
        }

        const updateFields = {};
        if (title) updateFields.title = title.trim();
        if (location) updateFields.location = location.trim();
        if (description) updateFields.description = description.trim();
        if (rating) updateFields.rating = rating.trim();
        if (longitude) updateFields.longitude = longitude.trim();
        if (latitude) updateFields.latitude = latitude.trim();
        if (duration) updateFields.duration = duration.trim();
        if (type) updateFields.type = type.trim();
        if (parsedGuides.length > 0) updateFields.guides = parsedGuides;
        // Only update image if there's a new one
        if (image) updateFields.image = image;

        const updatedPlace = await Place.updateOne(
          { _id },
          { $set: updateFields }
        );

        if (updatedPlace.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }

        res.json({ message: "Place  updated successfully", updatedPlace });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} UPDATE PLACE ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // =================================
  // ==== DELETE PLACE BY ID ====
  // =================================
  app.post(
    "/api/v1/admin/delete/many/place",
    requireLogin,
    async (req, res) => {
      console.log(
        `==== ${ROUTE_TYPE} DELETE MANY PLACE ==== \n body:`,
        req.body
      );
      try {
        const { ids } = req.body;
        const deletedPlace = await Place.updateMany(
          { _id: { $in: ids } },
          { $set: { status: "DELETED" } }
        );
        if (deletedPlace.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }
        res.json({ message: "Place posts deleted successfully", deletedPlace });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} DELETE MANY PLACE ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );
};
