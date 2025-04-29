const findSameUsername = require("../utils/usernameUniqueCheck");
const ValleyBoy = require("../models/valleyboy.model");
const { encrypt } = require("../utils/crypto");



exports.addValleyBoy = async (req, res) => {
     const {
       name,
       email,
       phone,
       username,
       password,
       companyId,
       branchId,
       supervisorId,
     } = req.body;
   
     try {
       const existingUserByUsername = await findSameUsername(email);
       
       if (existingUserByUsername.exists) {
         return res.status(400).json({ message: "Username already exists" });
       }
   
       if (!username || !password) {
         return res.status(400).json({ message: "Username and password are required" });
       }
   
       let base64Image = null;
   
       if (req.file) {
         const resizedImageBuffer = await handleImageProcessing(req.file);
         base64Image = `${resizedImageBuffer.toString("base64")}`;
       }

       
    // Encrypt the password
    const encryptedPassword = encrypt(password);
   
       const newValleyBoy = new ValleyBoy({
         name,
         email,
         phone,
         profileImage: base64Image,
         username,
         password:encryptedPassword,
         companyId,
         branchId,
         supervisorId,
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
    const { role, id } = req.user;
    const ObjectId = mongoose.Types.ObjectId;
    let valleyBoys;
  
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
      }
  
      valleyBoys?.forEach(valleyBoy => {
        const decryptedPassword = decrypt(valleyBoy.password);
        valleyBoy.password = decryptedPassword;
      });
  
      if (!valleyBoys || valleyBoys.length === 0) {
        return res.status(404).json({ message: "Valley boys not found" });
      }
  
      res.status(200).json({ valleyBoys });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
