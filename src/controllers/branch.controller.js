const Branch = require("../models/branch.model");
const Hotel = require("../models/hotel.model");
const { encrypt, decrypt } = require("../utils/crypto");
const findSameUsername = require("../utils/usernameUniqueCheck");
const BranchGroup = require("../models/branchGroup.model");





exports.addBranch = async (req, res) => {
     const {
       name,
       email,
       password,
       address,
       phone,
       hotelId
     } = req.body;
   
     try {
       const hotel = await Hotel.findById(hotelId);
       if (!hotel) {
         return res.status(404).json({ message: "Hotel not found" });
       }
   
       const existingUserByUsername = await findSameUsername(email);
if (existingUserByUsername.exists) {
  return res.status(400).json({ message: "This email already exists" });
}

     const encryptedPassword = encrypt(password);
   
       // Create new branch
       const newBranch = new Branch({
         name,
         email,
         password:encryptedPassword,
         address,
         phone,
         hotelId
       });
   
       await newBranch.save();
   
       res.status(201).json({ message: "Branch added successfully", branch: newBranch });
   
     } catch (err) {
       res.status(500).json({ message: err.message });
     }
   };

exports.getBranches = async (req, res) => {

      const {role ,id,assignedBranchsId} = req.user;
      try {
        let branchList;
        if (role === "superadmin") {
          branchList = await Branch.find().populate("hotelId", "name email").lean();
        } else if (role === "hotel") {
          branchList = await Branch.find({ hotelId: id }).populate("hotelId", "name email").lean();
        } else if (role === "branchGroup") {
          branchList = await Branch.find({ _id:  { $in: assignedBranchsId }}).lean();
        } else {
          return res.status(403).json({ message: "Access denied" });
        }
        res.status(200).json(
          branchList.map(branch => ({ ...branch, password: decrypt(branch.password) }))
        );
      } catch (error) {
        res.status(500).json({ message: error.message });
      }

};

exports.updateBranch = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    password,
    address,
    phone,
    hotelId
  } = req.body;

  try {
    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (email && email !== branch.email) {
      const existingUserByUsername = await findSameUsername(email);
      if (existingUserByUsername.exists) {
        return res.status(400).json({ message: "This email already exists" });
      }
      branch.email = email;
    }

    if (hotelId) {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      branch.hotelId = hotelId;
    }

    // Update other fields if provided
    if (name) branch.name = name;
    if (address) branch.address = address;
    if (phone) branch.phone = phone;

    if (password) {
      const encryptedPassword = encrypt(password);
      branch.password = encryptedPassword;
    }

    await branch.save();

    res.status(200).json({ message: "Branch updated successfully", branch });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBranch = async (req, res) => {
  const { id } = req.params;

  try {
    const branch = await Branch.findByIdAndDelete(id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({ message: "Branch deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
