const mongoose = require("mongoose");

// ==== IMPORT SERVICES ====
const errorCodes = require("../../services/errorCodes");

// ==== IMPORT MIDDLEWARE ====
const { requireLogin } = require("../../middleware/requireLogin");

// ==== IMPORT MODELS ====
const User = mongoose.model("users");
const Hotel = mongoose.model("hotel");
const Like = mongoose.model("hotelLike");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "publics/hotel"); // you can change this to a specific folder
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
  // ==== GET ALL HOTEL ====
  // ============================
  app.post("/api/v1/admin/get/hotel", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET HOTEL ==== \n body:`, req.body);
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

      const hotels = await Hotel.find(query, select)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const totalCount = await Hotel.countDocuments(query);
      res.json({ data: hotels, total: totalCount, page: skip });
    } catch (err) {
      console.log(`==== ${ROUTE_TYPE} GET HOTEL ERROR ==== \n error:`, err);
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== GET HOTEL BY ID ====
  // =============================
  app.get("/api/v1/admin/get/hotel/:id", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET HOTEL BY ID ==== \n body:`, req.body);
    try {
      const hotel = await Hotel.findById(req.params.id).select("");
      if (!hotel) {
        return res.status(400).json(errorCodes.hotel_not_found);
      }
      res.json(hotel);
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} GET HOTEL BY ID ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== ADD HOTEL ====
  // =============================
  app.post(
    "/api/v1/admin/add/hotel",
    requireLogin,
    upload.array("images", 10),
    async (req, res) => {
      console.log("==== ADD HOTEL ====");
      try {
        const {
          title,
          location,
          description,
          rating,
          longitude,
          latitude,
          roomTypes,
          amenities,
          duration,
          contact,
        } = req.body;

        // Parse roomTypes if it's sent as a JSON string
        let parsedRoomTypes = [];
        if (typeof roomTypes === "string") {
          parsedRoomTypes = JSON.parse(roomTypes);
        } else if (Array.isArray(roomTypes)) {
          parsedRoomTypes = roomTypes;
        }

        const imageNames = req.files?.map((file) => file.filename) || [];

        const hotel = await Hotel.create({
          title,
          location,
          description,
          roomTypes: parsedRoomTypes,
          duration,
          contact,
          rating,
          amenities,
          longitude,
          latitude,
          image: imageNames,
          author: req.user._id,
          createdBy: req.user._id,
        });

        res.status(201).json({ message: "Hotel added successfully", hotel });
      } catch (err) {
        console.error("==== ADD HOTEL ERROR ====", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  // app.post(
  //   "/api/v1/admin/add/hotel",
  //   requireLogin,
  //   upload.array("images", 10),
  //   async (req, res) => {
  //     console.log(`==== ${ROUTE_TYPE} ADD HOTEL ==== \n body:`, req.body);
  //     try {
  //       const {
  //         title,
  //         location,
  //         description,
  //         rating,
  //         longitude,
  //         latitude,
  //         price,
  //         room_types,
  //         amenities,
  //         duration,
  //         contact,
  //       } = req.body;
  //       const imageName = req.files?.map((file) => file.filename); // ✅ Grab file name from multer

  //       const hotel = await Hotel.create({
  //         title,
  //         location,
  //         description,
  //         price,
  //         room_types,
  //         amenities,
  //         duration,
  //         contact,
  //         rating,
  //         longitude,
  //         latitude,
  //         image: imageName, // ✅ Set it correctly here
  //         author: req.user._id,
  //       });

  //       res.json({ message: "Hotel post added successfully", hotel });
  //     } catch (err) {
  //       console.log(`==== ${ROUTE_TYPE} ADD HOTEL ERROR ==== \n error:`, err);
  //       res.status(500).json(errorCodes.server_error);
  //     }
  //   }
  // );

  // =============================
  // ==== UPDATE HOTEL ====
  app.put(
    "/api/v1/admin/update/hotel",
    requireLogin,
    upload.array("images", 10),
    async (req, res) => {
      console.log("==== UPDATE HOTEL ====\n body:", req.body);

      try {
        const {
          _id,
          title,
          location,
          description,
          roomTypes,
          duration,
          longitude,
          amenities,
          latitude,
          contact,
          author,
        } = req.body;

        // Parse roomTypes if it's sent as a JSON string
        let parsedRoomTypes = [];
        if (typeof roomTypes === "string") {
          try {
            parsedRoomTypes = JSON.parse(roomTypes);
          } catch (parseError) {
            return res.status(400).json({ error: "Invalid roomTypes format" });
          }
        } else if (Array.isArray(roomTypes)) {
          parsedRoomTypes = roomTypes;
        }

        // Handle uploaded images
        const imageNames = req.files?.map((file) => file.filename) || [];

        // Find the hotel by ID
        const hotel = await Hotel.findById(_id);
        if (!hotel) {
          return res.status(404).json({ error: "Hotel not found" });
        }

        // Update fields if they are provided
        if (title) hotel.title = title.trim();
        if (amenities) hotel.amenities = amenities.trim();
        if (location) hotel.location = location.trim();
        if (description) hotel.description = description.trim();
        if (duration) hotel.duration = Number(duration);
        if (contact) hotel.contact = Number(contact);
        if (longitude) hotel.longitude = Number(longitude);
        if (latitude) hotel.latitude = Number(latitude);
        if (author) hotel.author = author.trim();
        if (parsedRoomTypes.length > 0) hotel.roomTypes = parsedRoomTypes;
        if (imageNames.length > 0) hotel.image = imageNames;

        // Save the updated hotel
        await hotel.save();

        res.json({ message: "Hotel updated successfully", hotel });
      } catch (err) {
        console.error("==== UPDATE HOTEL ERROR ====\n error:", err);
        res.status(500).json({ error: "Server error" });
      }
    }
  );

  app.post("/api/v1/user/like/hotel", requireLogin, async (req, res) => {
    try {
      const { hotelId } = req.body;
      const user = req.user;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(400).json(errorCodes.hotel_not_found);
      }

      const like = await Like.findOne({ userId: user.id, hotelId });
      if (like) {
        await Like.deleteOne({ _id: like._id });
        return res.json({ message: "Hotel post unliked successfully" });
      }

      const newLike = new Like({ userId: user.id, hotelId });
      await newLike.save();

      res.json({ message: "Hotel post liked successfully" });
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} LIKE PLACE POST ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  app.get("/api/v1/user/get/hotel/like", requireLogin, async (req, res) => {
    try {
      const userId = req.user.id;
      const like = await Like.find();
      return res.json(like);
    } catch (e) {
      res.status(500).json(errorCodes.server_error);
    }
  });

  // app.put(
  //   "/api/v1/admin/update/hotel",
  //   requireLogin,
  //   upload.array("images", 10), // Accept up to 5 images
  //   async (req, res) => {
  //     console.log(`==== ${ROUTE_TYPE} UPDATE HOTEL ==== \n body:`, req.body);

  //     try {
  //       const {
  //         _id,
  //         title,
  //         location,
  //         description,
  //         price,
  //         room_types,
  //         amenities,
  //         duration,
  //         longitude,
  //         latitude,
  //         contact,
  //         author,
  //       } = req.body;

  //       let image =
  //         req.files && req.files.length > 0
  //           ? req.files.map((file) => file.filename)
  //           : req.body.image;

  //       const hotel = await Hotel.findById(_id);
  //       if (!hotel) {
  //         return res.status(400).json(errorCodes.hotel_not_found);
  //       }

  //       const updateFields = {};

  //       if (title) updateFields.title = title.trim();
  //       if (location) updateFields.location = location.trim();
  //       if (description) updateFields.description = description.trim();
  //       if (price) updateFields.price = price.trim();
  //       if (room_types) updateFields.room_types = room_types.trim(); // simple string now
  //       if (amenities) updateFields.amenities = amenities.trim(); // simple string
  //       if (duration) updateFields.duration = duration.trim();
  //       if (contact) updateFields.contact = contact.trim();
  //       if (author) updateFields.author = author.trim();
  //       if (longitude) updateFields.longitude = longitude.trim();
  //       if (latitude) updateFields.latitude = latitude.trim();

  //       // Handle uploaded images
  //       if (image) updateFields.image = image;

  //       const updatedHotel = await Hotel.updateOne(
  //         { _id },
  //         { $set: updateFields }
  //       );

  //       if (updatedHotel.modifiedCount === 0) {
  //         return res.status(400).json(errorCodes.unable_to_update_details);
  //       }

  //       res.json({ message: "Hotel updated successfully", updatedHotel });
  //     } catch (err) {
  //       console.error(
  //         `==== ${ROUTE_TYPE} UPDATE HOTEL ERROR ==== \n error:`,
  //         err
  //       );
  //       res.status(500).json(errorCodes.server_error);
  //     }
  //   }
  // );

  // =================================
  // ==== DELETE HOTEL BY ID ====
  // =================================
  app.post(
    "/api/v1/admin/delete/many/hotel",
    requireLogin,
    async (req, res) => {
      console.log(
        `==== ${ROUTE_TYPE} DELETE MANY HOTEL ==== \n body:`,
        req.body
      );
      try {
        const { ids } = req.body;
        const deletedHotel = await Hotel.updateMany(
          { _id: { $in: ids } },
          { $set: { status: "DELETED" } }
        );
        if (deletedHotel.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }
        res.json({ message: "Hotel posts deleted successfully", deletedHotel });
      } catch (err) {
        console.log(
          `==== ${ROUTE_TYPE} DELETE MANY HOTEL ERROR ==== \n error:`,
          err
        );
        res.status(500).json(errorCodes.server_error);
      }
    }
  );
};
