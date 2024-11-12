import Post from "../models/post.model.js";

const getFilterPosts = async ({ program, course, resourceType, semester, fileType, sort, keyword }) => {
  try {
    // Build the match stage based on available filters
    const matchStage = {
      ...(program && { "category.program": program }),
      ...(course && { "category.course": course }),
      ...(resourceType && { "category.resourceType": resourceType }),
      ...(semester && { "category.semester": semester }),
      ...(fileType && { fileType }),
      ...(keyword && {
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { desc: { $regex: keyword, $options: "i" } }
        ]
      }),
    };

    const result = await Post.aggregate([
      // Apply match stage if there are any filters
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "author"
        }
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          desc: 1,
          thumbnail: 1,
          fileType: 1,
          fileName: 1,
          fileUrl: 1,
          category: 1,
          likes: 1,
          comments: 1,
          saved: 1,
          createdAt: 1,
          updatedAt: 1,
          author: {
            _id: "$author._id",
            username: "$author.username",
            name: { $concat: ["$author.firstname", " ", "$author.lastname"] },
            profilePicture: "$author.profilePicture",
            program: "$author.program",
            yearOfGraduation: "$author.yearOfGraduation",
            numberOfPosts: { $size: { $ifNull: ["$author.posts", []] } },
            numberOfFollowers: { $size: { $ifNull: ["$author.followers", []] } },
          }
        }
      },
      // Apply sort based on the `sort` parameter
      {
        $sort: { createdAt: sort === "asc" ? -1 : 1 }
      }
    ]);

    return result;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export default getFilterPosts;
