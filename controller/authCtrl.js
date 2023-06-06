const User = require("../model/auth");
const generateToken = require("../config/jwtToken");
const expressAsyncHandler = require("express-async-handler");
const validateMongodbId = require("../util/validateMongodbId");

const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  const userExist = await User.findOne({ email });
  const message = userExist ? "User already exists" : "Registered successfully";
  const current = !userExist;

  if (!userExist) {
    try {
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
      });
      res.json({ user, current, message });
    } catch (error) {
      return res.status(400).json(error.errors);
    }
  } else {
    res.status(400).json({ current, message });
  }
});

const userLoginCtrl = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userFound = await User.findOne({ email });

  if (userFound && (await userFound.isPasswordMatched(password))) {
    res.json({
      _id: userFound._id,
      firstName: userFound.firstName,
      lastName: userFound.lastName,
      email: userFound.email,
      isBlocked: userFound.isBlocked,
      token: generateToken(userFound._id),
    });
  } else {
    res.status(401);
    throw new Error("Login failed");
  }
});

const allUsersCtrl = expressAsyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json(allUsers);
  } catch (error) {
    res.error(error);
  }
});

const deleteUsersCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    res.json(error);
  }
});

const userProfileCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  try {
    const myProfile = await User.findById(id);
    res.json(myProfile);
  } catch (error) {
    res.json(error);
  }
});

const updateUserCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongodbId(_id);
  const { firstName, lastName, email } = req.body;
  const user = await User.findByIdAndUpdate(
    _id,
    { firstName, lastName, email },
    { new: true, runValidators: true }
  );
  res.json(user);
});

const blockOrUnblockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req.query.id;
  validateMongodbId(_id);
  const { isBlocked } = req.body;
  const blockedOrUnblockedUser = await User.findByIdAndUpdate(
    _id,
    { isBlocked },
    { new: true, runValidators: true }
  );
  res.json(blockedOrUnblockedUser);
});

const blockOrUnblockUsersCtrl = expressAsyncHandler(async (req, res) => {
  const listOfUsers = req.body.blockOrUnblockUsers;
  const updates = listOfUsers.map((user) => ({
    updateOne: {
      filter: { _id: user.id },
      update: { $set: { isBlocked: user.isBlocked } },
    },
  })); // {blockOrUnblockUsers: [ {isBlocked: true: id: 123}] }

  try {
    const result = await User.bulkWrite(updates);
    res.json(result);
  } catch (error) {
    res.json(error);
  }
});

module.exports = {
  userRegisterCtrl,
  userLoginCtrl,
  allUsersCtrl,
  deleteUsersCtrl,
  userProfileCtrl,
  updateUserCtrl,
  blockOrUnblockUserCtrl,
  blockOrUnblockUsersCtrl,
};
