import express from "express"
import { logout, 
         updateUser, 
         deleteUser, 
         getUser, 
         followUser, 
         unfollowUser, 
         allUsers,
         userPosts,
         getConnections,
         updateShareSpaceProfile,
         updateShareSpaceUsername
         } 
    from "../controllers/user.controller.js"
import { isAuthenticated } from "../middleware/auth.js"


const router = express.Router()

router.post("/logout", logout)
router.put("/update-user", isAuthenticated, updateUser )
router.delete("/delete-user", isAuthenticated, deleteUser )
router.get("/:userId", getUser)
router.get("/:userId/connections",isAuthenticated, getConnections)
router.put("/:userId/follow", isAuthenticated, followUser )
router.put("/:userId/unfollow", isAuthenticated, unfollowUser)
router.get("/:userId/posts", userPosts)
router.get("/", allUsers)
router.put("/update-share-space-profile", isAuthenticated, updateShareSpaceProfile)
router.put("/update-share-space-username", isAuthenticated, updateShareSpaceUsername)
export default router
