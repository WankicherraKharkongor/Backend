const errorCodes = {
  server_error: {
    code: 500,
    message: "Server error",
  },
  unauthorized: {
    code: 401,
    message: "Unauthorized",
  },
  Invalid_body: {
    code: 400,
    message: "Invalide body",
  },
  user_not_found: {
    code: 404,
    message: "user not found",
  },
  invalid_phone_number: {
    code: 400,
    message: "Invalid phone number",
  },
  invalid_otp: {
    code: 400,
    message: "Invalid otp",
  },
  unable_to_update_details: {
    code: 400,
    message: "Unable to update details",
  },
};

module.exports = errorCodes;
