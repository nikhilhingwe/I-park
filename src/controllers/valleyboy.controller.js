const findSameUsername = require("../utils/usernameUniqueCheck");
const ValleyBoy = require("../models/valleyboy.model");
const { encrypt } = require("../utils/crypto");
const mongoose = require("mongoose");
const { decrypt } = require("../utils/crypto");
 


exports.addValleyBoy = async (req, res) => {
     const {
       name,
       email,
       phone,
       username,
       password,
       hotelId,
       branchGroupId,
       branchId,
     } = req.body;
   
     try {
       const existingUserByUsername = await findSameUsername(email);
       
       if (existingUserByUsername.exists) {
         return res.status(400).json({ message: "Username already exists" });
       }
   
       if (!username || !password) {
         return res.status(400).json({ message: "Username and password are required" });
       }

       
    // Encrypt the password
    const encryptedPassword = encrypt(password);
   
       const newValleyBoy = new ValleyBoy({
         name,
         email,
         phone,
         username,
         password:encryptedPassword,
         hotelId,
         branchGroupId,
         branchId,
         role: 5,
       });
   
       await newValleyBoy.save();
   
       res.status(201).json({
         message: "ValleyBoy added successfully",
         valleyBoy: newValleyBoy
       });
   
     } catch (err) {
       res.status(500).json({ message: err.message });
     }
   };
   
exports.getValleyBoy = async (req, res) => {
    const { role, id,assignedBranchsId } = req.user;
    const ObjectId = mongoose.Types.ObjectId;
    let valleyBoys;
    console.log("aaaaaaaaaaaaaaaaaa",req.user)
    console.log("aaaaaaaaaaaaaaaaaa",assignedBranchsId)
  
    try {
      if (role === 'superadmin') {
        valleyBoys = await ValleyBoy.find() 
          .populate("hotelId", "hotelName")
          .populate("branchId", "branchName");
      } else if (role === 'hotel') {
        valleyBoys = await ValleyBoy.find({ hotelId: new ObjectId(id) })
          .populate("hotelId", "hotelName")
          .populate("branchId", "branchName");
      } else if (role === 'branch') {
        valleyBoys = await ValleyBoy.find({ branchId: new ObjectId(id) })
          .populate("branchId", "branchName")
          .populate("hotelId", "hotelName");
      }else if (role === 'branchGroup') {

         valleyBoys = await ValleyBoy.find({
  branchId: { $in: assignedBranchsId }
})
  .populate("branchId", "branchName")
  .populate("hotelId",  "hotelName");
}  
      valleyBoys?.forEach(valleyBoy => {
        const decryptedPassword = decrypt(valleyBoy.password);
        valleyBoy.password = decryptedPassword;
      });
  
      if (!valleyBoys || valleyBoys.length === 0) {
        return res.status(404).json({ message: "Valley boys not found" });
      }
  
      res.status(200).json( valleyBoys );
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

exports.updateValleyBoy = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    username,
    password,
    hotelId,
    branchGroupId,
    branchId,
  } = req.body;

  try {
    const valleyBoy = await ValleyBoy.findById(id);
    if (!valleyBoy) {
      return res.status(404).json({ message: "ValleyBoy not found" });
    }

    if (username && username !== valleyBoy.username) {
      const { exists } = await findSameUsername(username);
      if (exists) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    if (email && email !== valleyBoy.email) {
      const existingEmail = await ValleyBoy.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(username && { username }),
      ...(hotelId && { hotelId }),
      ...(branchGroupId && { branchGroupId }),
      ...(branchId && { branchId }),
    };

    if (password) {
      updateData.password = await encrypt(password);
    }

    const updatedValleyBoy = await ValleyBoy.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } 
    );

    res.status(200).json({
      message: "ValleyBoy updated successfully",
      valleyBoy: updatedValleyBoy,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteValleyBoy = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedValleyBoy = await ValleyBoy.findByIdAndDelete(id);

    if (!deletedValleyBoy) {
      return res.status(404).json({ message: "ValleyBoy not found" });
    }

    res.status(200).json({
      message: "ValleyBoy deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
