// // role mapping
// // 1 = SuperAdmin
// // 2 = Hotel
// // 3 = Branch
// // 4 = BranchGroup
// // 5 = ValleyBoy
// // 6 = User

// const rules = {
//   1: [1, 2, 3, 4, 5, 6],
//   2: [1, 3],
//   3: [1, 2],
//   4: [3],
//   5: [3, 6],
//   6: [2, 3, 5],
// };

// function canChat(senderRole, receiverRole) {
//   return rules[senderRole]?.includes(receiverRole) || false;
// }

// module.exports = canChat;

const allowedRoles = {
  1: [1, 2, 3, 4, 5, 6], // superadmin
  2: [1, 3],
  3: [1, 2],
  4: [3],
  5: [3, 6],
  6: [2, 3, 5],
};

module.exports = function canChat(role1, role2) {
  return (
    allowedRoles[role1]?.includes(role2) || allowedRoles[role2]?.includes(role1)
  );
};
