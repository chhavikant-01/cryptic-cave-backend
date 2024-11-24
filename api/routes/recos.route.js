import express from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { createRecommendation, getRecommendation, getUserRecommendations } from '../controllers/recos.controller.js';

const router = express.Router();

router.post('/create', isAuthenticated, createRecommendation);
router.get("/:userId/:recommendationId", getRecommendation);
router.get("/:userId", getUserRecommendations);

export default router;