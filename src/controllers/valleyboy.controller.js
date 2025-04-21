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
         role: 6,
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
   
   