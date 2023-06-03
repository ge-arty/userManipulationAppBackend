const express = require('express')
const { 
    userRegisterCtrl,
    userLoginCtrl,
    allUsersCtrl,
    deleteUsersCtrl,
    userProfileCtrl,
    updateUserCtrl,
    blockOrUnblockUserCtrl,
    blockOrUnblockUsersCtrl
 } = require('../controller/authCtrl')

 const authMiddleware = require('../middlewares/auth/authMiddleware')

const authRouts = express.Router()

authRouts.post("/register",userRegisterCtrl)
authRouts.post("/login",userLoginCtrl)
authRouts.get("/allusers",authMiddleware, allUsersCtrl)
authRouts.get("/profile/:id",authMiddleware, userProfileCtrl)
authRouts.put("/:id",authMiddleware, updateUserCtrl)
authRouts.put("/change-status/:id",authMiddleware, blockOrUnblockUserCtrl)
authRouts.put("/change-statuses",authMiddleware, blockOrUnblockUsersCtrl)
authRouts.delete("/:id", deleteUsersCtrl)

module.exports = authRouts