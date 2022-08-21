const { BadRequestError, NotFoundError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const uploadImage = require("../utils/uploadImage");

const options = { new: true, runValidators: true };

const createPost = async (req, res) => {
	const { caption } = req.body;
	const { id } = req.user;
	let image = req.files?.image || "";
	if (!caption && !image) throw new BadRequestError("Expected a caption or image");
	if (image) {
		const { secure_url: src, public_id } = await uploadImage(image);
		image = { src, publicID: public_id };
	}
	const user = await User.findById(id);
	const post = await Post.create({
		caption,
		image,
		createdBy: id,
		userDetails: { name: user.name, image: user.profileImage },
	});
	res.status(StatusCodes.CREATED).json({ post });
};
// well find  by search post caption  with regex
// http://localhost:5000/api/v1/posts?query=post10 
const getPosts = async (req, res) => {
	const { id, query = "", page = "1", userId = "" } = req.query;
	if (id) {
		const post = await Post.findById(id);
		if (!post) throw new NotFoundError(`No post with id${id}`);
		res.status(StatusCodes.OK).json({ message:'find Post byID in Query', post });
	} else {

        console.log('query 🙄🙄🙄', query);
        console.log('page 🙄🙄🙄', page);
        console.log('userId 🙄🙄🙄', userId);


        // if there is search query show infinty posts not limited by page
		const limitCount = query ? Infinity : 3;
		const skipCount = (+page - 1) * limitCount;
		const _query = {}; // search query object
		if (query) _query.caption = new RegExp(query, "i"); 
		if (userId) _query.createdBy = userId;
        
		const posts = await Post.find(_query).sort("-createdAt").limit(limitCount).skip(skipCount);
		res.status(StatusCodes.OK).json({ posts, page: +page });
	}
};

const likePost = async (req, res) => {
	const { add, id } = req.body;
	const { id: userId } = req.user;
	const action = add === "true" ? "$push" : "$pull";
	const post = await Post.findByIdAndUpdate(id, { [action]: { likes: userId } }, options);
	if (!post) throw new NotFoundError(`No post with id ${id}`);
	res.status(StatusCodes.OK).json({ post });
};

const commentPost = async (req, res) => {
	const { id, comment } = req.body;
	const { id: commentedBy } = req.user;
	const post = await Post.findByIdAndUpdate(id, { $push: { comments: { commentedBy, comment } } }, options);
	if (!post) throw new NotFoundError(`No post with id ${id}`);
	res.status(StatusCodes.OK).json({ post });
};

const deletePost = async (req, res) => {
	const { id } = req.params;
	const post = await Post.findOneAndDelete({ _id: id, createdBy: req.user.id });
	post.image.publicID && (await cloudinary.uploader.destroy(post.image.publicID));
	res.status(StatusCodes.OK).json({ post });
};

const updatePost = async (req, res) => {
	const { caption } = req.body;
	const { id } = req.params;
	const { id: createdBy } = req.user;
	let image = req.files?.image || "";
	if (!caption && !image) throw new BadRequestError("Expected a caption or image");
	if (image) {
		const { secure_url: src, public_id } = await uploadImage(image);
		image = { src, publicID: public_id };
		const post = await Post.findOne({ _id: id, createdBy: req.user.id });
		post.image.publicID && image && (await cloudinary.uploader.destroy(post.image.publicID));
	}
	const updatedData = { caption };
	if (image) updatedData.image = image;
	const post = await Post.findOneAndUpdate({ _id: id, createdBy }, updatedData, options);
	res.status(StatusCodes.OK).json({ post });
};

module.exports = {
	createPost,
	getPosts,
	likePost,
	commentPost,
	deletePost,
	updatePost,
};