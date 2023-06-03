const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const authSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required:[true,'First Name is required']
    },
    lastName:{
        type: String,
        required:[true,'Last Name is required']
    },
    email:{
        type: String,
        required:[true,'Email is required']
    },
    password:{
        type: String,
        required:[true,'Password is required']
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    accountVerificationToken: String,
    accountVerificationTokenExpires: Date,
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
},
{
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
  timestamps: true,
})


 authSchema.pre('save', async function(next){

    if(!this.isModified("password")){
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

//match password

authSchema.methods.isPasswordMatched = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

const Auth = mongoose.model('Auth', authSchema)

module.exports = Auth