// // routes/ratings.js
// const mongoose = require("mongoose");
// const { requireLogin } = require("../../middleware/requireLogin");

// // ==== IMPORT SERVICES ====
// // const errorCodes = require("../../services/errorCodes");

// // const PlaceModel = require("../../model/Place");
// const Event = require("../../model/Event");
// const Place = require("../../model/Place");
// const LikeEve = require("../../model/EveLike");
// const errorCodes = require("../../services/errorCodes");

// module.exports = (app) => {
//   app.get("/api/v1/user/has-liked/:placeId", requireLogin, async (req, res) => {
//     try {
//       const place = await Place.findById(req.params.placeId);
//       if (!place) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Place not found" });
//       }

//       const hasLiked = place.likes.includes(req.user._id);
//       res.json({ success: true, hasLiked, likeCount: place.likes.length });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   });

//   app.post("/ap1/v1/user/give/like/event", requireLogin, async (req, res) => {
//     try {
//       const { eventId } = req.body;
//       const user = req.user;

//       const event = await Event.findById(eventId);
//       if (!event) {
//         return res.status(400).json(errorCodes.Event_not_found);
//       }
//       const eventLike = await LikeEve.findOne({ userId: user.id, eventId });
//       if (eventLike) {
//         await LikeEve.deleteOne({ _id: eventLike._id });
//         return res.json({ message: "Event like remove successfully" });
//       }
//       const newLike = new LikeEve({ userId: user.id, eventId });
//       await newLike.save();
//       res.json({ message: "Like added successfully" });
//     } catch (e) {
//       res.status(500).json(errorCodes.server_error);
//     }
//   });

//   // Toggle like
//   app.post("/api/v1/user/like/:placeId", requireLogin, async (req, res) => {
//     try {
//       const place = await Place.findById(req.params.placeId);
//       if (!place) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Place not found" });
//       }

//       const userId = req.user._id; // Get from authenticated user
//       const hasLiked = place.likes.includes(userId);

//       if (hasLiked) {
//         place.likes.pull(userId); // Remove like
//       } else {
//         place.likes.push(userId); // Add like
//       }

//       await place.save();

//       res.json({
//         success: true,
//         hasLiked: !hasLiked,
//         likeCount: place.likes.length,
//       });
//     } catch (error) {
//       console.error("Error toggling like:", error);
//       res.status(500).json({ success: false, message: "Something went wrong" });
//     }
//   });
// };
