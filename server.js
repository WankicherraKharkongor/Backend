const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const port = process.env.PORT;

const app = express();
app.use("/publics", express.static("publics"));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Connected to Mongodb");
  })
  .catch((err) => {
    console.log("Error connecting to Mongodb", err);
  });

// ⬅️ Register all models first
require("./model/Place");
require("./model/User");
require("./model/Reel");
require("./model/Admin");
require("./model/Hotel");
require("./model/Event");
require("./model/HotelLike");
require("./model/RestaurantLike");
require("./model/Feedback");
require("./model/UploadReel");
require("./model/Like");
require("./model/EveLike");
require("./model/Restaurant");
require("./model/ReelLike");

// ⬇️ Then load routes
require("./routes/admin/adminRoutes")(app);
require("./routes/admin/placeRoutes")(app);
require("./routes/user/authRoutes")(app);
require("./routes/user/feedbackRoutes")(app);
require("./routes/admin/restaurantRoutes")(app);
require("./routes/admin/hotelRoutes")(app);
require("./routes/user/reelRouter")(app);
// require("./routes/user/ratingPlaceRoutes")(app);

require("./routes/admin/eventRoutes")(app);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
