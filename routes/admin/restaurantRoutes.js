const mongoose = require("mongoose");

// ==== IMPORT SERVICES ====
const errorCodes = require("../../services/errorCodes");

// ==== IMPORT MIDDLEWARE ====
const { requireLogin } = require("../../middleware/requireLogin");

// ==== IMPORT MODELS ====
const User = mongoose.model("users");
const Like = mongoose.model("restaurantLike");
const Restaurant = mongoose.model("restaurant");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "publics/restaurant"); // you can change this to a specific folder
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
  // ==== GET ALL RESTAURANT ====
  // ============================
  app.post("/api/v1/admin/get/restaurant", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET RESTAURANT ==== \n body:`, req.body);
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

      const restaurants = await Restaurant.find(query, select)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const totalCount = await Restaurant.countDocuments(query);
      res.json({ data: restaurants, total: totalCount, page: skip });
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} GET RESTAURANT ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== GET RESTAURANT BY ID ====
  // =============================
  app.get(
    "/api/v1/admin/get/restaurant/:id",
    requireLogin,
    async (req, res) => {
      console.log(
        `==== ${ROUTE_TYPE} GET RESTAURANT BY ID ==== \n body:`,
        req.body
      );
      try {
        const restaurant = await Restaurant.findById(req.params.id).select("");
        if (!restaurant) {
          return res.status(400).json(errorCodes.restaurant_not_found);
        }
        res.json(restaurant);
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} GET RESTAURANT BY ID ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // =============================
  // ==== ADD RESTAURANT ====
  // =============================
  app.post(
    "/api/v1/admin/add/restaurant",
    requireLogin,
    upload.array("images", 10),
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} ADD RESTAURANT ==== \n body:`, req.body);
      try {
        const {
          title,
          location,
          description,
          rating,
          type,
          amenities,
          duration,
          longitude,
          latitude,
        } = req.body;
        const imageName = req.files?.map((file) => file.filename); // ✅ Grab file name from multer

        const restaurant = await Restaurant.create({
          title,
          location,
          description,
          rating,
          type,
          duration,
          longitude,
          latitude,
          amenities,
          image: imageName, // ✅ Set it correctly here
          author: req.user._id,
        });

        res.json({
          message: "Restaurant restaurant added successfully",
          restaurant,
        });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} ADD RESTAURANT ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // =============================
  // ==== UPDATE RESTAURANT ====
  app.put(
    "/api/v1/admin/update/restaurant",
    requireLogin,
    upload.array("image", 10), // Use multer to handle the file upload
    async (req, res) => {
      console.log(
        `==== ${ROUTE_TYPE} UPDATE RESTAURANT ==== \n body:`,
        req.body
      );

      try {
        const {
          _id,
          title,
          location,
          description,
          duration,
          amenties,
          type,
          rating,
          longitude,
          latitude,
        } = req.body;
        let image =
          req.files && req.files.length > 0
            ? req.files.map((file) => file.filename)
            : req.body.image;

        const restaurant = await Restaurant.findById(_id);
        if (!restaurant) {
          return res.status(400).json(errorCodes.restaurant_not_found);
        }

        const updateFields = {};
        if (title) updateFields.title = title.trim();
        if (location) updateFields.location = location.trim();
        if (description) updateFields.description = description.trim();
        if (rating) updateFields.rating = rating.trim();
        if (longitude) updateFields.longitude = longitude.trim();
        if (duration) updateFields.duration = duration.trim();
        if (amenties) updateFields.amenties = amenties.trim();
        if (latitude) updateFields.latitude = latitude.trim();
        if (type) updateFields.type = type.trim();

        // Only update image if there's a new one
        if (image) updateFields.image = image;

        const updatedRestaurant = await Restaurant.updateOne(
          { _id },
          { $set: updateFields }
        );

        if (updatedRestaurant.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }

        res.json({
          message: "Restaurant restaurant updated successfully",
          updatedRestaurant,
        });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} UPDATE RESTAURANT ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  app.post("/api/v1/user/like/restaurant", requireLogin, async (req, res) => {
    try {
      const { restaurantId } = req.body;
      const user = req.user;
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(400).json(errorCodes.Restaurant_not_found);
      }
      const like = await Like.findOne({ userId: user.id, restaurantId });
      if (like) {
        await Like.deleteOne({ _id: like._id });
        return res.json({ message: "Like remove successfully" });
      }
      const newLike = new Like({ userId: user.id, restaurantId });
      await newLike.save();
      res.json({ message: "Restaurant post liked successfully" });
    } catch (e) {
      res.status(500).json(errorCodes.server_error);
    }
  });

  app.get(
    "/api/v1/user/get/restaurant/like",
    requireLogin,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const like = await Like.find();
        return res.json(like);
      } catch (e) {
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // =================================
  // ==== DELETE RESTAURANT BY ID ====
  // =================================
  app.post(
    "/api/v1/admin/delete/many/restaurant",
    requireLogin,
    async (req, res) => {
      console.log(
        `==== ${ROUTE_TYPE} DELETE MANY RESTAURANT ==== \n body:`,
        req.body
      );
      try {
        const { ids } = req.body;
        const deletedRestaurant = await Restaurant.updateMany(
          { _id: { $in: ids } },
          { $set: { status: "DELETED" } }
        );
        if (deletedRestaurant.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }
        res.json({
          message: "Restaurant restaurants deleted successfully",
          deletedRestaurant,
        });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} DELETE MANY RESTAURANT ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );
  app.post(
    "/api/v1/restaurants/:id/like",
    requireLogin, // your auth middleware
    async (req, res) => {
      console.log(`==== ADD LIKE ==== \n body:`, req.body);
      try {
        const restaurantId = req.params.id;
        const userId = req.user._id; // from requireLogin middleware

        const restaurant = await Restaurant.findByIdAndUpdate(
          restaurantId,
          { $addToSet: { likes: userId } },
          { new: true }
        );

        if (!restaurant) {
          return res
            .status(404)
            .json({ success: false, message: "Restaurant not found" });
        }

        const restaurants = await Restaurant.find()
          .sort({ createdAt: -1 })
          .populate("restaurant", "name");

        main.io.emit("add-like", restaurants);

        res.json({ success: true, restaurant, restaurants });
      } catch (err) {
        console.log("==== ADD LIKE ERROR ====", err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    }
  );

  app.post(
    "/api/v1/restaurants/:id/unlike",
    requireLogin, // your auth middleware
    async (req, res) => {
      console.log(`==== REMOVE LIKE ==== \n body:`, req.body);
      try {
        const restaurantId = req.params.id;
        const userId = req.user._id; // from requireLogin middleware

        const restaurant = await Restaurant.findByIdAndUpdate(
          restaurantId,
          { $pull: { likes: userId } },
          { new: true }
        );

        if (!restaurant) {
          return res
            .status(404)
            .json({ success: false, message: "Restaurant not found" });
        }

        const restaurants = await Restaurant.find()
          .sort({ createdAt: -1 })
          .populate("restaurantedBy", "name");

        main.io.emit("remove-like", restaurants);

        res.json({ success: true, restaurant, restaurants });
      } catch (err) {
        console.log("==== REMOVE LIKE ERROR ====", err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    }
  );
};
