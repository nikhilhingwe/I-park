const SuperAdmin = require("../models/superAdmin.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const Supervisor = require("../models/supervisor.model");
const ValleyBoy = require("../models/valleyboy.model");
const jwt = require('jsonwebtoken');
const { comparePassword } = require("../utils/crypto");



exports.loginUser = async (req, res) => {
     const { email, password } = req.body;
     let user;
     let isMatch = false;
   
     if (!email || !password) {
       return res.status(400).json({ message: 'Please enter valid details' });
     }
   
     try {
       // Find user in various collections
       user = await SuperAdmin.findOne({ email });
       if (!user) user = await Hotel.findOne({ email });
       if (!user) user = await Branch.findOne({ email }).populate("hotelId", "email");
       if (!user) user = await Supervisor.findOne({ email }).populate("branchId", "email");
       if (!user) user = await ValleyBoy.findOne({ email }).populate("supervisorId", "email");
   
       if (!user) {
         return res.status(400).json({ message: 'Invalid credentials' });
       }
   
       // Validate password
       const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password or email ID" });
    }

   
       // Generate JWT token
       const token = jwt.sign(
         {
           id: user._id,
           email: user.email,
            role: user.role,
         },
         process.env.JWT_SECRET,
       );
   
       res.status(200).json({
         message: "Successful Login",
         token,

       });
   
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   };
