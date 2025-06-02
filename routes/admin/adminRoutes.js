const rateLimit = require("express-rate-limit");
console.log("== DEBUG: adminRoutes.js loaded ==");

const {
  requireLogin,
  generateToken,
} = require("../../middleware/requireLogin.js");
const Admin = require("../../model/Admin.js");
console.log("== DEBUG: requireLogin =", typeof requireLogin);

// Check errorCodes
const errorCodes = require("../../services/errorCodes");
console.log("== DEBUG: errorCodes =", typeof errorCodes);

// Check Admin model
const mongoose = require("mongoose");
// const Admin = mongoose.model("users");
console.log("== DEBUG: Admin model =", typeof Admin);

const ROUTE_TYPE = "ADMIN";

module.exports = (app) => {
  const OTP_LENGTH = 6;
  const resetTime = 1000 * 60 * 5; // 5 minut
  // =======================
  // ==== GET ALL USERS ====
  // =======================
  app.post("/api/v1/admin/get/users", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET USERS ==== \n body:`, req.body);
    try {
      const limit = parseInt(req.body.pageSize);
      const skip = parseInt(req.body.page);
      const search = req.body.search;
      const searchBy = req.body.searchBy;
      const orderBy = req.body.orderBy ?? null;
      const orderDirection = req.body.order ?? "";
      const filter = req.body.filter;
      const select = "-otp "; // select the fields to be returned

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

      const bank = await Admin.find(query, select)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const totalCount = await Admin.countDocuments(query);
      res.json({ data: bank, total: totalCount, page: skip });
    } catch (err) {
      console.log(`==== ${ROUTE_TYPE} GET USERS ERROR ==== \n error:`, err);
      res.status(500).json(errorCodes.server_error);
    }
  });

  // ========================
  // ==== GET USER BY ID ====
  // ========================
  app.get("/api/v1/admin/get/user/:id", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} GET USER BY ID ==== \n body:`, req.body);
    try {
      const user = await Admin.findById(req.params.id).select(
        "-otp -status -createdAt -updatedAt"
      );
      if (!user) {
        return res.status(400).json(errorCodes.user_not_found);
      }
      res.json(user);
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} GET USER BY ID ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== UPDATE USER DETAILS ====
  // =============================
  app.put("/api/v1/admin/update/user", requireLogin, async (req, res) => {
    console.log(
      `==== ${ROUTE_TYPE} UPDATE USER DETAILS ==== \n body:`,
      req.body
    );
    try {
      const { _id, name, phone, plan, role } = req.body;
      const user = await Admin.findById(_id);
      if (!user) {
        return res.status(400).json(errorCodes.user_not_found);
      }
      const updateFields = {};
      if (name) updateFields.name = name.trim();
      if (phone) updateFields.phone = phone.trim();
      if (plan) updateFields.plan = plan.trim();
      if (role) updateFields.role = role.trim();

      const updatedAdmin = await Admin.updateOne(
        { _id },
        { $set: updateFields }
      );
      if (updatedAdmin.modifiedCount === 0) {
        return res.status(400).json(errorCodes.unable_to_update_details);
      }
      res.json({ message: "Admin details updated successfully", updatedAdmin });
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} UPDATE USER DETAILS ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // =============================
  // ==== DELETE USERS BY ID ====
  // =============================
  app.post("/api/v1/admin/delete/many/user", requireLogin, async (req, res) => {
    console.log(`==== ${ROUTE_TYPE} DELETE MANY USERS ==== \n body:`, req.body);
    try {
      const { ids } = req.body;
      const deletedAdmins = await Admin.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "DELETED" } }
      );
      if (deletedAdmins.modifiedCount === 0) {
        return res.status(400).json(errorCodes.unable_to_update_details);
      }
      res.json({ message: "Admins deleted successfully", deletedAdmins });
    } catch (err) {
      console.log(
        `==== ${ROUTE_TYPE} DELETE MANY USERS ERROR ==== \n error:`,
        err
      );
      res.status(500).json(errorCodes.server_error);
    }
  });

  // created by athot
  //  08/05/2025
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 10 requests per windowMs
    message: "Too many requests, please try again later.",
  });
  const generateOTP = () => {
    const digits = "0123456789";
    let newOTP = "";
    for (let i = 0; i < OTP_LENGTH; i++) {
      newOTP += digits[Math.floor(Math.random() * digits.length)];
    }
    return newOTP;
  };

  // RESET OTP
  const resetOTP = (phone) => {
    const digits = "0123456789";
    setTimeout(async () => {
      let newOTP = "";
      for (let i = 0; i <= OTP_LENGTH + 1; i++) {
        newOTP += digits[Math.floor(Math.random() * 10)];
      }
      const user = await Admin.updateOne(
        { phone },
        { $set: { otp: newOTP } },
        { new: true }
      );
    }, resetTime);
  };

  app.get("/api/v1/send/admin/otp/number/:phone", limiter, async (req, res) => {
    try {
      const { phone } = req.params;
      const adminPhones = ["6009674733"]; // List of admin phone numbers

      if (!adminPhones.includes(phone)) {
        return res.status(403).json({ error: "You are not an admin." });
      }

      const otp = generateOTP();
      console.log("==== SEND OTP ==== \n otp:", otp);

      // Store the OTP and role in the database
      await Admin.findOneAndUpdate(
        { phone },
        { $set: { otp, role: "ADMIN" } },
        { new: true, upsert: true, runValidators: true }
      );

      // Reset the OTP after 5 minutes
      resetOTP(phone);

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.log("==== SEND OTP ERROR ==== \n error:", error);
      res.status(400).json(errorCodes.server_error);
    }
  });

  // ---- OTP FUNCTIONS END ----
  // ====================
  // ==== VERIFY OTP ====
  // ====================
  app.post("/api/v1/verify/admin/otp", limiter, async (req, res) => {
    console.log("==== VERIFY OTP ==== \n body:", req.body);
    try {
      const { phone, otp } = req.body;
      const admin = await Admin.findOne({ phone, status: "ACTIVE" });
      // check if user exists
      if (!admin) {
        console.log("ADMIN NOT FOUND");
        return res.status(400).json(errorCodes.admin_not_found);
      }

      // check otp length
      if (otp.length !== OTP_LENGTH) {
        return res.status(400).json(errorCodes.invalid_otp);
      }

      // check if otp is correct
      if (admin.otp !== otp) {
        return res.status(400).json(errorCodes.invalid_otp);
      }
      // generate a token
      const payload = {
        id: admin._id,
        phone: admin.phone,
        status: admin.status,
        name: admin.name,
        plan: admin.plan,
      };
      const token = generateToken(payload);

      // update the user's last login date
      await Admin.findOneAndUpdate(
        { _id: admin._id },
        { $set: { lastLogin: Date.now() } }
      );

      res
        .status(200)
        .json({ message: "OTP verified successfully", admin, token });
    } catch (err) {
      console.log("==== VERIFY OTP ERROR ==== \n error:", err);
      res.status(400).json(errorCodes.server_error);
    }
  });
};
