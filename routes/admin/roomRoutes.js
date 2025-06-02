// const mongoose = require("mongoose");
// const multer = require("multer");
// const path = require("path");

// // ==== IMPORT SERVICES ====
// const errorCodes = require("../../services/errorCodes");

// // ==== IMPORT MIDDLEWARE ====
// const { requireLogin } = require("../../middleware/requireLogin");

// // ==== IMPORT MODELS ====
// const User = mongoose.model("users");
// const Room = mongoose.model("room");
// const Hotel = mongoose.model("hotel");

// const ROUTE_TYPE = "ADMIN";

// // Multer configuration for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/room"); // Changed from 'publics' to 'public'
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//     files: 6, // Maximum 6 files
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
//     }
//   },
// });

// module.exports = (app) => {
//   // ============================
//   // ==== GET ALL ROOMS ====
//   // ============================
//   app.post("/api/v1/admin/get/room", requireLogin, async (req, res) => {
//     // console.log(`==== ${ROUTE_TYPE} GET ROOM ==== \n body:`, req.body);
//     try {
//       const limit = parseInt(req.body.pageSize);
//       const skip = parseInt(req.body.page);
//       const search = req.body.search;
//       const searchBy = req.body.searchBy;
//       const orderBy = req.body.orderBy ?? null;
//       const orderDirection = req.body.order ?? "";
//       const filter = req.body.filter;
//       const select = " "; // select the fields to be returned

//       let query = {
//         status: "ACTIVE",
//       };

//       if (search) {
//         query[searchBy] = { $regex: search, $options: "i" };
//       }

//       if (filter) {
//         for (const key in filter) {
//           if (filter[key]) {
//             if (key[0] == "_") {
//               query[key] = new mongoose.Types.ObjectId(filter[key]);
//             } else {
//               query[key] = filter[key];
//             }
//           }
//         }
//       }

//       const sortBy = orderBy ? { [orderBy]: orderDirection } : { name: "desc" };

//       const rooms = await Room.find(query, select)
//         .sort(sortBy)
//         .skip(skip)
//         .limit(limit);

//       const totalCount = await Room.countDocuments(query);
//       res.json({ data: rooms, total: totalCount, page: skip });
//     } catch (err) {
//       console.log(
//         `==== ${ROUTE_TYPE} GET ROOM ERROR ==== \n error:`,
//         err
//       );
//       res.status(500).json(errorCodes.server_error);
//     }
//   });

//   // =============================
//   // ==== GET ROOM BY ID ====
//   // =============================
//   app.get("/api/v1/admin/get/room/:id", requireLogin, async (req, res) => {
//     try {
//       const room = await Room.findById(req.params.id).populate(
//         "hotel",
//         "title location contact"
//       );

//       if (!room) {
//         return res.status(404).json(errorCodes.room_not_found);
//       }

//       res.json({
//         success: true,
//         data: room,
//       });
//     } catch (err) {
//       console.error(`==== ${ROUTE_TYPE} GET ROOM BY ID ERROR ==== \n`, err);
//       res.status(500).json({
//         ...errorCodes.server_error,
//         error: err.message,
//       });
//     }
//   });

//   // =============================
//   // ==== ADD ROOM ====
//   // =============================
//   app.post(
//     "/api/v1/admin/add/room",
//     requireLogin,
//     upload.array("images", 6),
//     async (req, res) => {
//       try {
//         const {
//           type,
//           capacity,
//           basePrice,
//           discount = 0,
//           taxes = 0,
//           quantityAvailable,
//           amenities = [],
//           hotelId,
//         } = req.body;

//         // Validate required fields
//         if (
//           !type ||
//           !capacity ||
//           !basePrice ||
//           !quantityAvailable ||
//           !hotelId
//         ) {
//           return res.status(400).json({
//             ...errorCodes.missing_fields,
//             required: [
//               "type",
//               "capacity",
//               "basePrice",
//               "quantityAvailable",
//               "hotelId",
//             ],
//           });
//         }

//         // Validate hotel exists
//         const hotelExists = await Hotel.exists({ _id: hotelId });
//         if (!hotelExists) {
//           return res.status(404).json(errorCodes.hotel_not_found);
//         }

//         // Process uploaded images
//         const images =
//           req.files?.map((file) => ({
//             path: file.path,
//             filename: file.filename,
//             mimetype: file.mimetype,
//           })) || [];

//         const room = await Room.create({
//           type,
//           capacity,
//           basePrice: parseFloat(basePrice),
//           discount: parseFloat(discount),
//           taxes: parseFloat(taxes),
//           quantityAvailable: parseInt(quantityAvailable),
//           amenities: Array.isArray(amenities) ? amenities : [amenities],
//           images,
//           hotel: hotelId,
//           createdBy: req.user._id,
//         });

//         // Update hotel's rooms array
//         await Hotel.findByIdAndUpdate(hotelId, {
//           $push: { rooms: room._id },
//         });

//         res.status(201).json({
//           success: true,
//           message: "Room created successfully",
//           data: room,
//         });
//       } catch (err) {
//         console.error(`==== ${ROUTE_TYPE} ADD ROOM ERROR ==== \n`, err);
//         res.status(500).json({
//           ...errorCodes.server_error,
//           error: err.message,
//         });
//       }
//     }
//   );

//   // =============================
//   // ==== UPDATE ROOM ====
//   // =============================
//   app.put(
//     "/api/v1/admin/update/room/:id",
//     requireLogin,
//     upload.array("images", 6),
//     async (req, res) => {
//       try {
//         const { id } = req.params;
//         const {
//           type,
//           capacity,
//           basePrice,
//           discount,
//           taxes,
//           quantityAvailable,
//           amenities,
//           hotelId,
//           existingImages = [],
//         } = req.body;

//         // Validate room exists
//         const room = await Room.findById(id);
//         if (!room) {
//           return res.status(404).json(errorCodes.room_not_found);
//         }

//         // Process updates
//         const updateData = {};
//         if (type) updateData.type = type;
//         if (capacity) updateData.capacity = capacity;
//         if (basePrice) updateData.basePrice = parseFloat(basePrice);
//         if (discount) updateData.discount = parseFloat(discount);
//         if (taxes) updateData.taxes = parseFloat(taxes);
//         if (quantityAvailable)
//           updateData.quantityAvailable = parseInt(quantityAvailable);
//         if (amenities)
//           updateData.amenities = Array.isArray(amenities)
//             ? amenities
//             : [amenities];
//         if (hotelId) {
//           const hotelExists = await Hotel.exists({ _id: hotelId });
//           if (!hotelExists) {
//             return res.status(404).json(errorCodes.hotel_not_found);
//           }
//           updateData.hotel = hotelId;
//         }

//         // Process images - combine existing and new
//         const newImages =
//           req.files?.map((file) => ({
//             path: file.path,
//             filename: file.filename,
//             mimetype: file.mimetype,
//           })) || [];

//         updateData.images = [...JSON.parse(existingImages), ...newImages];

//         const updatedRoom = await Room.findByIdAndUpdate(id, updateData, {
//           new: true,
//         });

//         res.json({
//           success: true,
//           message: "Room updated successfully",
//           data: updatedRoom,
//         });
//       } catch (err) {
//         console.error(`==== ${ROUTE_TYPE} UPDATE ROOM ERROR ==== \n`, err);
//         res.status(500).json({
//           ...errorCodes.server_error,
//           error: err.message,
//         });
//       }
//     }
//   );

//   // =================================
//   // ==== DELETE ROOM ====
//   // =================================
//   app.delete(
//     "/api/v1/admin/delete/room/:id",
//     requireLogin,
//     async (req, res) => {
//       try {
//         const { id } = req.params;

//         const room = await Room.findById(id);
//         if (!room) {
//           return res.status(404).json(errorCodes.room_not_found);
//         }

//         // Soft delete
//         room.status = "DELETED";
//         await room.save();

//         // Remove from hotel's rooms array
//         await Hotel.findByIdAndUpdate(room.hotel, {
//           $pull: { rooms: room._id },
//         });

//         res.json({
//           success: true,
//           message: "Room deleted successfully",
//         });
//       } catch (err) {
//         console.error(`==== ${ROUTE_TYPE} DELETE ROOM ERROR ==== \n`, err);
//         res.status(500).json({
//           ...errorCodes.server_error,
//           error: err.message,
//         });
//       }
//     }
//   );

//   // =================================
//   // ==== BULK DELETE ROOMS ====
//   // =================================
//   app.post("/api/v1/admin/delete/rooms", requireLogin, async (req, res) => {
//     try {
//       const { ids } = req.body;

//       if (!ids || !Array.isArray(ids) || ids.length === 0) {
//         return res.status(400).json({
//           ...errorCodes.missing_fields,
//           message: "Room IDs are required",
//         });
//       }

//       // Soft delete rooms
//       const result = await Room.updateMany(
//         { _id: { $in: ids } },
//         { $set: { status: "DELETED" } }
//       );

//       if (result.modifiedCount === 0) {
//         return res.status(404).json(errorCodes.room_not_found);
//       }

//       // Remove from hotels' rooms arrays
//       await Hotel.updateMany(
//         { rooms: { $in: ids } },
//         { $pull: { rooms: { $in: ids } } }
//       );

//       res.json({
//         success: true,
//         message: `${result.modifiedCount} rooms deleted successfully`,
//       });
//     } catch (err) {
//       console.error(`==== ${ROUTE_TYPE} BULK DELETE ROOMS ERROR ==== \n`, err);
//       res.status(500).json({
//         ...errorCodes.server_error,
//         error: err.message,
//       });
//     }
//   });
// };

const mongoose = require("mongoose");

// ==== IMPORT SERVICES ====
const errorCodes = require("../../services/errorCodes");

// ==== IMPORT MIDDLEWARE ====
const { requireLogin } = require("../../middleware/requireLogin");

// ==== IMPORT MODELS ====
const User = mongoose.model("users");
const Room = mongoose.model("room");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "publics/room"); // you can change this to a specific folder
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;

// const ROUTE_TYPE = "ADMIN";

module.exports = (app) => {
  // ============================
  // ==== GET ALL ROOM ====
  // ============================
  app.post("/api/v1/admin/get/room", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET ROOM ==== \n body:`, req.body);
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

      const rooms = await Room.find(query, select)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const totalCount = await Room.countDocuments(query);
      res.json({ data: rooms, total: totalCount, page: skip });
    } catch (err) {
      console.log(`==== ${ROUTE_TYPE} GET ROOM ERROR ==== \n error:`, err);
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== GET ROOM BY ID ====
  // =============================
  app.get("/api/v1/admin/get/room/:id", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET ROOM BY ID ==== \n body:`, req.body);
    try {
      const room = await Room.findById(req.params.id).select("");
      if (!room) {
        return res.status(400).json(errorCodes.room_not_found);
      }
      res.json(room);
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} GET ROOM BY ID ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== ADD ROOM ====
  // =============================
  app.post(
    "/api/v1/admin/add/room",
    requireLogin,
    upload.array("images", 6),
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} ADD ROOM ==== \n body:`, req.body);
      try {
        const {
          type,
          capacity,
          basePrice,
          discount,
          taxes,
          quantityAvailable,
          amenities,
          hotelId,
        } = req.body;
        const imageName = req.files?.map((file) => file.filename); // ✅ Grab file name from multer

        const room = await Room.create({
          type,
          capacity,
          basePrice,
          discount,
          taxes,
          quantityAvailable,
          amenities,
          hotelId,
          image: imageName, // ✅ Set it correctly here
          //   author: req.user._id,
        });

        res.json({ message: "Room post added successfully", room });
      } catch (err) {
        console.log(`==== ${ROUTE_TYPE} ADD ROOM ERROR ==== \n error:`, err);
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // =============================
  // ==== UPDATE ROOM ====
  app.put(
    "/api/v1/admin/update/room",
    requireLogin,
    upload.array("image", 6), // Use multer to handle the file upload
    async (req, res) => {
      console.log(`==== ${ROUTE_TYPE} UPDATE ROOM ==== \n body:`, req.body);

      try {
        const { id } = req.params;
        const {
          type,
          capacity,
          basePrice,
          discount,
          taxes,
          quantityAvailable,
          amenities,
          hotelId,
          existingImages = [],
        } = req.body;

        let image =
          req.files && req.files.length > 0
            ? req.files.map((file) => file.filename)
            : req.body.image;

        const room = await Room.findById(_id);
        if (!room) {
          return res.status(400).json(errorCodes.room_not_found);
        }

        const updateFields = {};
        if (type) updateData.type = type;
        if (capacity) updateData.capacity = capacity;
        if (basePrice) updateData.basePrice = parseFloat(basePrice);
        if (discount) updateData.discount = parseFloat(discount);
        if (taxes) updateData.taxes = parseFloat(taxes);
        if (quantityAvailable)
          updateData.quantityAvailable = parseInt(quantityAvailable);
        if (amenities)
          updateData.amenities = Array.isArray(amenities)
            ? amenities
            : [amenities];
        if (hotelId) {
          const hotelExists = await Hotel.exists({ _id: hotelId });
          if (!hotelExists) {
            return res.status(404).json(errorCodes.hotel_not_found);
          }
          updateData.hotel = hotelId;
        }
        // Only update image if there's a new one
        if (image) updateFields.image = image;

        const updatedRoom = await Room.updateOne(
          { _id },
          { $set: updateFields }
        );

        if (updatedRoom.modifiedCount === 0) {
          return res.status(400).json(errorCodes.unable_to_update_details);
        }

        res.json({
          message: "Room post updated successfully",
          updatedRoom,
        });
      } catch (err) {
        console.log(`==== ${ROUTE_TYPE} UPDATE ROOM ERROR ==== \n error:`, err);
        res.status(500).json(errorCodes.server_error);
      }
    }
  );

  // =================================
  // ==== DELETE ROOM BY ID ====
  // =================================
  app.post("/api/v1/admin/delete/many/room", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} DELETE MANY ROOM ==== \n body:`, req.body);
    try {
      const { ids } = req.body;
      const deletedRoom = await Room.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "DELETED" } }
      );
      if (deletedRoom.modifiedCount === 0) {
        return res.status(400).json(errorCodes.unable_to_update_details);
      }
      res.json({
        message: "Room posts deleted successfully",
        deletedRoom,
      });
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} DELETE MANY ROOM ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });
};
