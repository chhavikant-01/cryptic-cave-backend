import mongoose from "mongoose"
import User from "../models/user.model.js"
import Post from "../models/post.model.js"

function getUsers(ids){
    try{
        const users = User.find({
            _id: {
                $in: ids
            }
        })
        return users;
    }catch(e){
        console.log(e)
    }
}

export const logout = (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            domain: "localhost"
        });
        return res.status(200).json({ message: "Logout successful!" });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
};
export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("+password");
        if (!user) {
            return res.status(400).json({ message: "User does not exist!" });
        }
        if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

        if(!req.body.profilePicture){
            const isPasswordValid = await user.comparePassword(req.body.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "!Incorrect Password!" });
            }
            if (req.body.program) user.program = req.body.program;
            if (req.body.yearOfGraduation) user.yearOfGraduation = req.body.yearOfGraduation;
            if(req.body.newPassword) user.password = req.body.newPassword;
            if(req.body.professionalProfile) user.professionalProfile = req.body.professionalProfile;
        }
        
        await user.save();

        const {password, ...rest} = user._doc;
        console.log(rest)
        res.status(201).json({
            success: true,
            message: "Profile updated",
            rest
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const deleteUser = async (req,res,next) => {
    
    try{
        const user = await User.findById(req.user.id)
        
        if(!user){
            res
                .status(400)
                .json({message: "User does not exist!"})
           }

        try{
            await User.findByIdAndDelete(req.user.id);
            await Post.deleteMany({userId: req.user.id});
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                domain: "localhost"
            }).status(200).json({message: "User deleted!"});
        } catch(e){
            res.status(500).json({message: e.message})
        }
        
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

export const getUser = async (req,res,next) => {
    try{
        const user = await User.findById(req.params.userId);

        const { password, updatedAt, createdAt, savedPosts, ...other } = user._doc;

        res.status(200).json(other)
    } catch(e){
        res.status(500).json({message: e.message})
    }
}

export const followUser = async (req,res,next) => {
    try {
        if (req.user.id !== req.params.userId) { // user can't follow itself!
    
            const user = await User.findById(req.params.userId);
            const currentUser = await User.findById(req.user.id);
    
            if (!user || !currentUser) {
                return res.status(404).json("User not found");
            }
    
            if (!currentUser.followings.includes(req.params.userId)) {
                await currentUser.updateOne({ $addToSet: { followings: req.params.userId } });
                await user.updateOne({ $addToSet: { followers: req.user.id } });
                res.status(201).json({ message: "User has been followed" });
            } else {
                res.status(400).json({ message: "You already follow this user" });
            }
    
        } else {
            res.status(400).json({ message: "You can't follow yourself" });
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
    
}

export const unfollowUser = async (req,res,next) => {
    try{
        if(req.user.id!==req.params.userId){ //user can't unfollow itself!

            const session = await mongoose.startSession();
            session.startTransaction();
            try{
                const user = await User.findById(req.params.userId).session(session);
                const currentUser = await User.findById(req.user.id).session(session);

                if (!user || !currentUser) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(404).json("User not found");
                  }
            

                if(currentUser.followings.includes(req.params.userId)){
                    await currentUser.updateOne({ $pull:{ followings:req.params.userId } }, { session });
                    await user.updateOne({ $pull:{ followers:req.user.id } }, { session });
                    await session.commitTransaction();
                    res.status(201).json({message: "User has been unfollowed"})
                }else {
                    await session.abortTransaction();
                    res.status(400).json("You do not follow this user");
                  }
            }catch(e){
                await session.abortTransaction();
                res.status(500).json({message: e.message});
            } finally{
                session.endSession();
            }
        
        } else{
            res.status(400).json({message: "You can't unfollow yourself"})
        }
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

export const allUsers = async (req,res,next) => {
    
    try {
        const data = await User.find().select('firstname lastname email _id program');
        res.status(200).json(data);
      } catch (err) {
        res.status(404).json({message: err.message});
      }
}

export const userPosts = async (req,res,next) => {
    try{
        const user = await User.findById(req.params.userId);
        if(!user){
            return res.status(404).json({message: "User doesn't exist!"})
        }

        const posts = await Post.find({userId: user._id})

        res.status(200).json(posts)

    }catch(e){
        res.status(500).json({message: e.message})
    }
}

export const getConnections = async (req,res,next) => {
    try{
        let ids;
        const query = req.query.connection;
        if(query==="followers"){
            ids = req.user.followers; 
        }
        if(query==="followings"){
            ids = req.user.followings;
        }
        const users = await getUsers(ids);
        res.status(200).json({users: users});
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

export const updateShareSpaceProfile = async (req,res,next) => {
    try{
        const user = await User.findById(req.user.id)
        if(!user){
            res.status(404).json({message: "User not found!"})
        }
        if(!req.body.profile){
            res.status(404).json({message: "Profile type not found!"})
        }
        if(req.body.profile ==="personal" || req.body.profile ==="professional"){
            user.shareSpaceProfile.profileType = req.body.profile
            await user.save()
        }
        res.status(201).json({message: "Profile updated!", profile: user.shareSpaceProfile})

    }catch(e){
        res.status(500).json({message: e.message})
    }
}
export const updateShareSpaceUsername = async (req,res,next) => {
    try{
        const user = await User.findById(req.user.id)
        if(!user){
            res.status(404).json({message: "User not found!"})
        }
        if(!req.body.username){
            res.status(404).json({message: "Profile username not found!"})
        }
        user.shareSpaceProfile.username = req.body.username
        await user.save()
        res.status(201).json({message: "Profile updated!", profile: user.shareSpaceProfile})

    }catch(e){
        res.status(500).json({message: e.message})
    }
}

export const onboarding = async (req,res,next) => {
    try{
        const { program, graduationYear, username } = req.body;
        const user = await User.findById(req.user.id);
        if(!user){
            res.status(404).json({message: "User not found!"})
        }
        if(!program || !graduationYear){
            res.status(404).json({message: "Please fill all fields!"})
        }
        user.program = program;
        user.yearOfGraduation = graduationYear;
        if(username) user.shareSpaceProfile.username = username;
        user.isOnboarded = true;
        await user.save();
        res.status(201).json({message: "Onboarding successful!", user: user})

    }catch(e){
        res.status(500).json({message: e.message})
    }
}
