const authorize = (roles = []) => {
  // roles can be a single role string or an array of roles
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.sendStatus(403); // Forbidden
    }
    next();
  };
};

module.exports = authorize;
