import express from "express";
import jwt from "jsonwebtoken";
import Post from "../models/Post";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Middleware to protect routes
const protect = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Create a new post
router.post("/", protect, async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = new Post({
      title,
      content,
      author: req.user.id,
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a post
router.put("/:id", protect, async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.updatedAt = Date.now();

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a post
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.remove();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
