import { gql } from 'graphql-tag';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { Post } from '@/models/Post';
import { Comment } from '@/models/Comment';
import { Like } from '@/models/Like';
import { Types } from 'mongoose';

export type GraphQLContext = {
	currentUserId: string | null;
};

export const typeDefs = gql`
	type User {
		id: ID!
		username: String!
		name: String!
	}

	type Post {
		id: ID!
		author: User!
		text: String
		imageUrl: String
		createdAt: String!
		repostOf: Post
		likeCount: Int!
		commentCount: Int!
		likedByMe: Boolean!
	}

	type Comment {
		id: ID!
		author: User!
		post: Post!
		text: String!
		createdAt: String!
	}

	type Query {
		posts: [Post!]!
		post(id: ID!): Post
		user(username: String!): User
		userPosts(username: String!): [Post!]!
	}

	type Mutation {
		createPost(text: String, imageUrl: String): Post!
		likePost(postId: ID!): Post!
		unlikePost(postId: ID!): Post!
		commentOnPost(postId: ID!, text: String!): Comment!
		repostPost(postId: ID!): Post!
	}
`;

export const resolvers = {
	Post: {
		author: async (p: any) => {
			if (!p) return null;
			await connectToDatabase();
			return User.findById(p.author);
		},
		repostOf: async (p: any) => {
			if (!p?.repostOf) return null;
			await connectToDatabase();
			return Post.findById(p.repostOf);
		},
		likeCount: async (p: any) => {
			await connectToDatabase();
			return Like.countDocuments({ post: p._id });
		},
		commentCount: async (p: any) => {
			await connectToDatabase();
			return Comment.countDocuments({ post: p._id });
		},
		likedByMe: async (p: any, _: unknown, ctx: GraphQLContext) => {
			if (!ctx.currentUserId) return false;
			await connectToDatabase();
			return !!(await Like.exists({ post: p._id, user: ctx.currentUserId }));
		},
	},
	Comment: {
		author: async (c: any) => {
			await connectToDatabase();
			return User.findById(c.author);
		},
		post: async (c: any) => {
			await connectToDatabase();
			return Post.findById(c.post);
		},
	},
	Query: {
		posts: async () => {
			await connectToDatabase();
			return Post.find().sort({ createdAt: -1 }).exec();
		},
		post: async (_: unknown, { id }: { id: string }) => {
			await connectToDatabase();
			if (!Types.ObjectId.isValid(id)) return null;
			return Post.findById(id);
		},
		user: async (_: unknown, { username }: { username: string }) => {
			await connectToDatabase();
			return User.findOne({ username });
		},
		userPosts: async (_: unknown, { username }: { username: string }) => {
			await connectToDatabase();
			const u = await User.findOne({ username });
			if (!u) return [];
			return Post.find({ author: u._id }).sort({ createdAt: -1 }).exec();
		},
	},
	Mutation: {
		createPost: async (_: unknown, { text, imageUrl }: { text?: string; imageUrl?: string }, ctx: GraphQLContext) => {
			if (!ctx.currentUserId) throw new Error('Unauthorized');
			if (!text && !imageUrl) throw new Error('Provide text or imageUrl');
			await connectToDatabase();
			const p = await Post.create({ author: ctx.currentUserId, text, imageUrl, repostOf: null });
			return p;
		},
		likePost: async (_: unknown, { postId }: { postId: string }, ctx: GraphQLContext) => {
			if (!ctx.currentUserId) throw new Error('Unauthorized');
			await connectToDatabase();
			if (!Types.ObjectId.isValid(postId)) throw new Error('Post not found');
			const post = await Post.findById(postId);
			if (!post) throw new Error('Post not found');
			try {
				await Like.create({ post: post._id, user: ctx.currentUserId });
			} catch (e) {
				/* ignore duplicate */
			}
			return post;
		},
		unlikePost: async (_: unknown, { postId }: { postId: string }, ctx: GraphQLContext) => {
			if (!ctx.currentUserId) throw new Error('Unauthorized');
			await connectToDatabase();
			if (!Types.ObjectId.isValid(postId)) throw new Error('Post not found');
			const post = await Post.findById(postId);
			if (!post) throw new Error('Post not found');
			await Like.deleteOne({ post: post._id, user: ctx.currentUserId });
			return post;
		},
		commentOnPost: async (_: unknown, { postId, text }: { postId: string; text: string }, ctx: GraphQLContext) => {
			if (!ctx.currentUserId) throw new Error('Unauthorized');
			await connectToDatabase();
			if (!Types.ObjectId.isValid(postId)) throw new Error('Post not found');
			const post = await Post.findById(postId);
			if (!post) throw new Error('Post not found');
			const c = await Comment.create({ post: post._id, author: ctx.currentUserId, text });
			return c;
		},
		repostPost: async (_: unknown, { postId }: { postId: string }, ctx: GraphQLContext) => {
			if (!ctx.currentUserId) throw new Error('Unauthorized');
			await connectToDatabase();
			if (!Types.ObjectId.isValid(postId)) throw new Error('Post not found');
			const original = await Post.findById(postId);
			if (!original) throw new Error('Post not found');
			const repost = await Post.create({ author: ctx.currentUserId, text: undefined, imageUrl: undefined, repostOf: original._id });
			return repost;
		},
	},
};



