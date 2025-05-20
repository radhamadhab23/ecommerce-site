import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Name is required"],
    },
    email: {
        type: String,
               required: [true,"Email is required"],
        unique: true,
        lowercase:true,
        trim: true,
    },
    password: {
        type: String,
        required: [true,"Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    cartItems:{
        quantity:{
            type:Number,
            default:1,
        },
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
        },
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user",
    }
}, 
{
    timestamps: true,// Automatically add createdAt and updatedAt fields
});

//pre-save middleware to hash the password before saving to the database
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    try{
    const salt=await bcrypt.genSalt(10);// Generate a salt
    this.password=await bcrypt.hash(this.password,salt);// Hash the password
    next();// Call the next middleware
    }
    catch(error){
        next(error);// Pass the error to the next middleware
    }
});

userSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);// Compare the entered password with the hashed password
};

const User=mongoose.model("User",userSchema);
export default User;