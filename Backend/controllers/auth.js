import User from "../models/user_model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import dotenv from "dotenv";
import { set } from "mongoose";
dotenv.config();

// generate token
const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
};

// store refresh token in redis
const storeRefreshToken = async (userId, refreshToken) => { 
    //store the refresh token in redis
    await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 60 * 60 * 24 * 7, "NX"); // 7 days
};        const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
                httpOnly: true, // prevent client-side JavaScript from accessing the cookie
                secure: process.env.NODE_ENV == "production", //
                sameSite: "strict", // prevent CSRF attacks ,cross site request forgery
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true, // prevent xsscript attacks
                secure: process.env.NODE_ENV == "production", // only send the cookie over HTTPS
                sameSite: "strict", // prevent cross site request forgery
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
        };
// signup route
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const user = await User.create({ name, email, password });

        // authenticate the user
        const { accessToken, refreshToken } = generateToken(user._id);

        await storeRefreshToken(user._id.toString(), refreshToken); // ensure _id is string

        // set the refresh token in the cookie
        // const setCookies = (res, accessToken, refreshToken) => {
        //     res.cookie("accessToken", accessToken, {
        //         httpOnly: true, // prevent client-side JavaScript from accessing the cookie
        //         secure: process.env.NODE_ENV == "production", //
        //         sameSite: "strict", // prevent CSRF attacks ,cross site request forgery
        //         maxAge: 15 * 60 * 1000, // 15 minutes
        //     });
        //     res.cookie("refreshToken", refreshToken, {
        //         httpOnly: true, // prevent xsscript attacks
        //         secure: process.env.NODE_ENV == "production", // only send the cookie over HTTPS
        //         sameSite: "strict", // prevent cross site request forgery
        //         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        //     });
        // };

        // ✅ Actually call setCookies function
        setCookies(res, accessToken, refreshToken);

        // send the token to the client
        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
try{
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
        });
    }   
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
        });
    }               
    // generate token
    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id.toString(), refreshToken); // ensure _id is string
    // set the refresh token in the cookie 
   
    setCookies(res, accessToken, refreshToken);
    // send the token to the client
    res.status(200).json({
        message: "User logged in successfully",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });

}catch(error){
    res.status(500).json({
        message: "Error logging in",
        error: error.message,
    });

}
};

export const logout = async (req, res) => {
  try{
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        await redis.del(`refreshToken:${decoded.userId}`); // delete the refresh token from redis

    }
    res.clearCookie("accessToken"); // clear the access token cookie
    res.clearCookie("refreshToken"); // clear the refresh token cookie
    res.status(200).json({
        message: "Logged out successfully",
    });

  }catch(error)
{
    res.status(500).json({
        message: "Error logging out",
        error: error.message,
    });
  }
};
