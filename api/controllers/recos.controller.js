import Recommendation from "../models/recommendation.js";

function generateGibberishUrlEnding(length = 4) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
  
    return result;
  }

export const createRecommendation = async (req, res) => {
    try {
        const { title, postIds } = req.body;
        const userId = req.user._id;
        const recommendationId = generateGibberishUrlEnding();
        await Recommendation.create({ userId, title, postIds, recommendationId });
        res.status(201).json({ recommendationId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getRecommendation = async (req, res) => {
    try {
        const { userId, recommendationId } = req.params;
        const recommendation = await Recommendation.findOne({ userId, recommendationId });
        res.status(200).json(recommendation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getUserRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        const recommendations = await Recommendation.find({ userId });
        res.status(200).json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}