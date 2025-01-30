const allRoles = {
  customer: ["common", "customer"],
  manager: ["common", "manager"],
  admin: ["common", "commonForAdmin", "admin"],
  subAdmin: ["common", "commonForAdmin", "subAdmin"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
