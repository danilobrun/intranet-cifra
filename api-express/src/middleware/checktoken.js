/* IMPORTS */
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

async function checkToken(req, res, next) {
  //Get token by headers access with array authorization
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ msg: "Acesso negado!" });
    return;
  }

  try {
    const secret = process.env.SECRET;
    const data = jwt.verify(token, secret);

    const user = await User.findById(data.id).populate("roles");

    if (!user) {
      return res.status(401).json({ msg: "Usuário não encontrado!" });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((r) => r.code),
    };

    next();
  } catch (error) {
    res.status(401).json({ msg: "Token inválido!" });
  }
}

function ensureRoleCodes(allowedRoles = []) {
  return (req, res, next) => {
    const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const isAllowed = allowedRoles.some((roleCode) =>
      userRoles.includes(roleCode),
    );

    if (!isAllowed) {
      return res.status(403).json({ msg: "Acesso negado!" });
    }

    next();
  };
}

module.exports = {
  checkToken,
  ensureRoleCodes,
};
