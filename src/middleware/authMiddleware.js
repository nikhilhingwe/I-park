const jwt = require('jsonwebtoken');
const SuperAdmin = require("../models/superAdmin.model");
const Hotel = require("../models/hotel.model");
const Branch = require("../models/branch.model");
const Supervisor = require("../models/supervisor.model");
const ValleyBoy = require("../models/valleyboy.model");


const authenticate = async(req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from headers

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


   let user;
    let sperr = false;
    user = await SuperAdmin.findById(decoded.id);
    if (user) {
      req.user = { id: decoded.id, role: 'superadmin' };
      sperr = true;
  } else {
      user = await Hotel.findById(decoded.id);
      if (user) {
          req.user = { id: user._id, role: 'hotel' };
          sperr = true;
      } else {
          user = await Branch.findById(decoded.id);
          if (user) {
              req.user = { id: user._id, role: 'branch',hoteld:user.companyId, };
              sperr = true;
          } else {
              user = await Supervisor.findById(decoded.id);
              if (user) {
                  req.user = { id: user._id, role: 'supervisor',companyId:user.companyId,branchId:user.branchId };
                  sperr = true;
              } else {
                  user = await ValleyBoy.findById(decoded.id);
                  if (user) {
                      req.user = { id: user._id, role: 'valley',companyId:user.companyId,branchId:user.branchId,supervisorId:user.supervisorId };
                      sperr = true;
                  } else {
                      // Handle case where no matching user is found
                      req.user = null;
                      sperr = false;
                  }
              }
          }
      }
  }
  
      
    if(!sperr){
      return res.status(404).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
