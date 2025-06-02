const mongoose = require("mongoose");

// ==== IMPORT SERVICES ====
const errorCodes = require("../../services/errorCodes");

// ==== IMPORT MIDDLEWARE ====
const { requireLogin } = require("../../middleware/requireLogin");

// ==== IMPORT MODELS ====
const User = mongoose.model("users");
const Event = mongoose.model("event");
const Like = mongoose.model("eveLike");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "publics/event"); // you can change this to a specific folder
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;

const ROUTE_TYPE = "ADMIN";

module.exports = (app) => {
  // ============================
  // ==== GET ALL EVENT ====
  // ============================
  app.post("/api/v1/admin/get/event", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET EVENT ==== \n body:`, req.body);
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

      const events = await Event.find(query, select)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const totalCount = await Event.countDocuments(query);
      res.json({ data: events, total: totalCount, page: skip });
    } catch (err) {
      console.log(`==== ${ROUTE_TYPE} GET EVENT ERROR ==== \n error:`, err);
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== GET EVENT BY ID ====
  // =============================
  app.get("/api/v1/admin/get/event/:id", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET EVENT BY ID ==== \n body:`, req.body);
    try {
      const event = await Event.findById(req.params.id).select("");
      if (!event) {
        return res.status(400).json(errorCodes.event_not_found);
      }
      res.json(event);
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} GET EVENT BY ID ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== ADD EVENT ====
  // =============================
  app.post(
    "/api/v1/admin/add/event",
    requireLogin,
    upload.array("images", 6),
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} ADD EVENT ==== \n body:`, req.body);
      try {
        const {
          title,
          location,
          description,
          rating,
          longitude,
          latitude,
          duration,
          price,
          type,
          startDate,
          requirement,
        } = req.body;
        const imageName = req.files?.map((file) => file.filename); // ✅ Grab file name from multer

        const event = await Event.create({
          title,
          location,
          description,
          rating,
          longitude,
          latitude,
          duration,
          price,
          type,
          startDate,
          requirement,
          image: imageName, // ✅ Set it correctly here
          author: req.user._id,
        });

        res.json({ message: "Event post added successfully", event });
      } catch (err) {
        console.log(`==== ${ROUTE_TYPE} ADD EVENT ERROR ==== \n error:`, err);
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // =============================
  // ==== UPDATE EVENT ====
  app.put(
    "/api/v1/admin/update/event",
    requireLogin,
    upload.array("images", 6), // Use multer to handle the file upload
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} UPDATE EVENT ==== \n body:`, req.body);

      try {
        const {
          _id,
          title,
          location,
          description,
          rating,
          longitude,
          latitude,
          price,
          type,
          duration,
          startDate,
          requirement,
        } = req.body;
        let image =
          req.files && req.files.length > 0
            ? req.files.map((file) => file.filename)
            : req.body.image; // Handle the uploaded image or keep the existing one

        const event = await Event.findById(_id);
        if (!event) {
          return res.status(400).json(errorCodes.event_not_found);
        }

        const updateFields = {};
        if (title) updateFields.title = title.trim();
        if (location) updateFields.location = location.trim();
        if (description) updateFields.description = description.trim();
        if (rating) updateFields.rating = rating.trim();
        if (longitude) updateFields.longitude = longitude.trim();
        if (latitude) updateFields.latitude = latitude.trim();
        if (price) updateFields.price = price.trim();
        if (type) updateFields.type = type.trim();
        if (startDate) updateFields.startDate = startDate.trim();
        if (requirement) updateFields.requirement = requirement.trim();
        if (duration) updateFields.duration = duration.trim();

        // Only update image if there's a new one
        if (image) updateFields.image = image;

        const updatedEvent = await Event.updateOne(
          { _id },
          { $set: updateFields }
        );

        if (updatedEvent.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }

        res.json({ message: "Event post updated successfully", updatedEvent });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} UPDATE EVENT ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  app.post("/api/v1/user/like/event", requireLogin, async (req, res) => {
    try {
      const { eventId } = req.body;
      const user = req.user;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(400).json(errorCodes.event_not_found);
      }

      const like = await Like.findOne({ userId: user.id, eventId });
      if (like) {
        await Like.deleteOne({ _id: like._id });
        return res.json({ message: "Event post unliked successfully" });
      }

      const newLike = new Like({ userId: user.id, eventId });
      await newLike.save();

      res.json({ message: "Event post liked successfully" });
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} LIKE PLACE POST ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  app.get("/api/v1/user/get/event/like", requireLogin, async (req, res) => {
    try {
      const userId = req.user.id;
      const like = await Like.find();
      return res.json(like);
    } catch (e) {
      res.status(500).json(errorCodes.server_error);
    }
  });
  // =================================
  // ==== DELETE EVENT BY ID ====
  // =================================
  app.post(
    "/api/v1/admin/delete/many/event",
    requireLogin,
    async (req, res) => {
      console.log(
        `==== ${ROUTE_TYPE} DELETE MANY EVENT ==== \n body:`,
        req.body
      );
      try {
        const { ids } = req.body;
        const deletedEvent = await Event.updateMany(
          { _id: { $in: ids } },
          { $set: { status: "DELETED" } }
        );
        if (deletedEvent.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }
        res.json({ message: "Event posts deleted successfully", deletedEvent });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} DELETE MANY EVENT ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );
};
