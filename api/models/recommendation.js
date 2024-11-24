import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    postIds: {
        type: [String],
        default: [],
    },
    recommendationId:{
        type: String,
        default: "",
    }
},{
    timestamps: true
})

export default mongoose.model("Recommendation", recommendationSchema);