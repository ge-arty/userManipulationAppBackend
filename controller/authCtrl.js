const User = require('../model/auth')
const generateToken = require('../config/jwtToken')
const expressAsyncHandler = require('express-async-handler')
const validateMongodbId = require('../util/validateMongodbId')



//----------------------------------------
//               Register 
//----------------------------------------

const userRegisterCtrl = expressAsyncHandler(async (req,res) => {

    const {email} = req?.body

    const userExist = await User.findOne({email})

    const message = userExist ? 'User alredy exists' : 'Register successfully'

    const current = userExist ? false : true

    if (!userExist) {
      try {
  
          const user = await User.create({
  
              firstName:req?.body?.firstName,
              lastName:req?.body?.lastName,
              email:req?.body?.email,
              password:req?.body?.password
          })
          res.json({user,current,message})
  
      } catch (error) {
        return res.status(400).json(error.errors)
  
      }
    } else{
      res.status(400).json({current,message})
    }
    
    })

//----------------------------------------
//                LogIn 
//----------------------------------------

const userLoginCtrl = expressAsyncHandler(async (req,res) => {

    const {email,password} = req?.body

    const userFound = await User.findOne({ email })

    if (userFound && (await userFound.isPasswordMatched(password))) {

        res.json({
            _id:userFound?._id,
            firstName:userFound?.firstName,
            lastName:userFound?.lastName,
            email:userFound?.email,
            isBlocked:userFound?.isBlocked,
            token:generateToken(userFound?._id)
        })
        
    }else{
        res.status(401)
        throw new Error('Login filed')
    }
})

//----------------------------------------
//              All Users 
//----------------------------------------

const allUsersCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const allUsers = await User.find({})
        res.json(allUsers)
    } catch (error) {
        res.error(error)
    }
})

//----------------------------------------
//             Delete Users 
//----------------------------------------

const deleteUsersCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    //check if user id is valid
    validateMongodbId(id);
    try {
      const deletedUser = await User.findByIdAndDelete(id);
      res.json(deletedUser);
    } catch (error) {
      res.json(error);
    }
  });

//----------------------------------------
//              User Profile 
//----------------------------------------

const userProfileCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const myProfile = await User.findById(id)
      res.json(myProfile);
    } catch (error) {
      res.json(error);
    }
  });

//----------------------------------------
//              Update Profile 
//----------------------------------------
  
  const updateUserCtrl = expressAsyncHandler(async (req, res) => {
    const { _id } = req?.user;
    validateMongodbId(_id);
    const user = await User.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(user);
  });
  

//----------------------------------------
//              Block User 
//----------------------------------------
  
const blockOrUnblockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  validateMongodbId(_id);
  console.log(req.body)
  const blockedOrUnblockedUser = await User.findByIdAndUpdate(
    _id,
    {
      isBlocked: req?.body?.isBlocked
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(blockedOrUnblockedUser);
});
  

//----------------------------------------
//              Block Many User 
//----------------------------------------
  
const blockOrUnblockUsersCtrl = expressAsyncHandler(async (req, res) => {
  const listOfUsers = req.body.blockOrUnblockUsers

  const answ = await User.updateMany(
    {id:listOfUsers.$.id},
    {$set:{
    isBlocked:listOfUsers.$.isBlocked
  }})

  console.log(listOfUsers)

  res.json(answ)
});

module.exports = {
    userRegisterCtrl,
    userLoginCtrl,
    allUsersCtrl,
    deleteUsersCtrl,
    userProfileCtrl,
    updateUserCtrl,
    blockOrUnblockUserCtrl,
    blockOrUnblockUsersCtrl
}