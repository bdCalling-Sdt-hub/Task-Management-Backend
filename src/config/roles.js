const allRoles = {
  customer: ["common", "customer"],
  manager: ["common", "manager"],
  admin: ["common", "admin"],
  manager: ["common", "superadmin"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
