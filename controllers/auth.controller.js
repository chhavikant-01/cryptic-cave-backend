import User from "../models/user.model.js";
import sendToken from "../utils/jwtToken.js";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const validDomain = process.env.EMAIL_ALLOWED_DOMAIN;

export const signup = async (req, res, next) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }   
        if(email.split("@")[1] !== validDomain){
            return res.status(400).json({message: "Please use a valid email address"})
        }
        const userEmail = await User.findOne({ email });
        const userUsername = email.split("@")[0];

        if (userEmail) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = {
            firstname,
            lastname,
            email,
            password,
            username: userUsername,
        };

        const createActivationToken = (user) => {
            return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "5m" });
        };

        const activationToken = createActivationToken(user);
        const activationUrl = `${process.env.FRONTEND_BASE_URL}/auth/activation/${activationToken}`;
        const htmlMessage = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    text-align: center;
                    padding: 10px 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content p {
                    font-size: 16px;
                    line-height: 1.5;
                    margin: 20px 0;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 16px;
                    color: white;
                    background-color: #4CAF50;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .footer {
                    background-color: #f1f1f1;
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Email Verification</h1>
                </div>
                <div class="content">
                    <p>Hello, ${user.firstname}</p>
                    <p>Thank you for registering with us. Please click the button below to verify your email address.</p>
                    <a href="${activationUrl}" class="button">Verify Email</a>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Cryptic Cave. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

        try {
            await sendMail({
                email: user.email,
                subject: "Activate Your Account",
                htmlMessage,
                message: `Hello ${user.firstname}, please click on the link to activate your account: ${activationUrl}`,// Fallback plain text message
            });
            res.status(201).json({
                status: "success",
                message: `Please check your email: ${user.email} to activate your account!`, 
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const activation = async (req, res, next) => {
    try {
        const { activation_token } = req.params;

        const newUser = jwt.verify(activation_token, process.env.JWT_SECRET);

        if (!newUser) {
            return res.status(400).json({ message: "Invalid token" });
        }

        const { firstname, lastname, email, password, program } = newUser;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        user = await User.create({
            firstname,
            lastname,
            email,
            password,
            username: email.split("@")[0],
            program,
        });

        sendToken(user, 201, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res, next) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({message: "Please enter all fields!"})
        }

        if(email.split("@")[1] !== validDomain){
            return res.status(400).json({message: "Please use a valid email address"})
        }

        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(400).json({message: "User doesn't exist!"})
        }

        const isPasswordValid = await user.comparePassword(password);

        if(!isPasswordValid){
            return res.status(400).json({message: "Please provide the correct information"})
        }
        
        sendToken(user,200,res)

    } catch(e){
        res.status(500).json({message: e.message})
    }
}

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: "Please provide your email address" });
        }

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        // Generate a reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

        // Construct the reset password URL
        const resetPasswordUrl = `${process.env.FRONTEND_BASE_URL}/reset-password/${resetToken}`;

        const htmlMessage = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    text-align: center;
                    padding: 10px 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content p {
                    font-size: 16px;
                    line-height: 1.5;
                    margin: 20px 0;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    font-size: 16px;
                    color: white;
                    background-color: #4CAF50;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .footer {
                    background-color: #f1f1f1;
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset</h1>
                </div>
                <div class="content">
                    <p>Hello, ${user.firstname}</p>
                    <p>You requested to reset your password. Please click the button below to proceed.</p>
                    <a href="${resetPasswordUrl}" class="button">Reset Password</a>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Cryptic Cave. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send the reset email
        await sendMail({
            email: user.email,
            subject: "Password Reset Request",
            htmlMessage,
            message: `Hello ${user.firstname}, click on the link to reset your password: ${resetPasswordUrl}`, // Fallback plain text
        });

        res.status(200).json({ 
            message: `A password reset email has been sent to ${user.email}. Please check your inbox.` 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Validate token
        if (!token) {
            return res.status(400).json({ message: "Invalid or missing token" });
        }

        // Validate new password
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Find user by ID in the token
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's password
        user.password = newPassword; // Assume `password` is hashed in the User model's pre-save hook
        await user.save();

        res.status(200).json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

  
  export const google = async (req, res, next) => {
    const { email, name, googlePhotoUrl } = req.body;

    if(email.split("@")[1] !== validDomain){
        return res.status(400).json({message: "Please use a valid email address"})
    }
    try {
      const user = await User.findOne({ email }).select("+password");;
      if (user) {
        sendToken(user,200,res)
      } else {
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        
        const newUser = new User({
            firstname: name.split(" ")[0] ,
            lastname: name.split(" ")[1] ,
          username: email.split("@")[0],
          email,
          password: generatedPassword,
          profilePicture: googlePhotoUrl,
        });
        await newUser.save();

        sendToken(newUser,200,res)
      }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };

export const sessionAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id
        );
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ userId: user._id});
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

