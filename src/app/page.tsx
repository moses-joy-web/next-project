"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import PostCard from '@/components/PostCard';

const POSTS = gql`
	query Posts {
		posts {
			id
			text
			imageUrl
			createdAt
			likeCount
			commentCount
			likedByMe
			repostOf { id }
			author { id username name }
		}
	}
`;

const CREATE_POST = gql`mutation CreatePost($text: String, $imageUrl: String) { createPost(text: $text, imageUrl: $imageUrl) { id } }`;
const LIKE = gql`mutation Like($postId: ID!) { likePost(postId: $postId) { id likeCount likedByMe } }`;
const UNLIKE = gql`mutation Unlike($postId: ID!) { unlikePost(postId: $postId) { id likeCount likedByMe } }`;
const REPOST = gql`mutation Repost($postId: ID!) { repostPost(postId: $postId) { id } }`;

interface PostsQuery {
	posts: {
		id: string;
		text?: string | null;
		imageUrl?: string | null;
		createdAt: string;
		likeCount: number;
		commentCount: number;
		likedByMe: boolean;
		repostOf?: { id: string } | null;
		author: { id: string; username: string; name: string };
	}[];
}

interface DummyPost {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: number | { likes?: number; total?: number };
  comments?: { id: number; body: string; user: { id: number; username: string } }[];
  imageUrl?: string;
}

interface CommentState {
  [postId: number]: string;
}

interface LikeState {
  [postId: number]: boolean;
}

export default function FeedPage() {
	const { data, loading, refetch } = useQuery<PostsQuery>(POSTS);
	const [createPost] = useMutation(CREATE_POST);
	const [like] = useMutation(LIKE);
	const [unlike] = useMutation(UNLIKE);
	const [repost] = useMutation(REPOST);
	const [dummyPosts, setDummyPosts] = useState<DummyPost[]>([]);
	const [isLoadingDummy, setIsLoadingDummy] = useState(true);
	const [likedPosts, setLikedPosts] = useState<LikeState>({});
	const [commentText, setCommentText] = useState<CommentState>({});
	const [showComments, setShowComments] = useState<{ [postId: number]: boolean }>({});

	const [text, setText] = useState("");

	useEffect(() => {
		async function fetchDummyPosts() {
			try {
				console.log('[feed] Fetching dummy posts');
				const res = await fetch('https://dummyjson.com/posts?limit=10');
				const data = await res.json();
				console.log('[feed] First post reactions:', data.posts[0]?.reactions, typeof data.posts[0]?.reactions);
				
				// Fetch comments for each post and add random images
				const postsWithComments = await Promise.all(
					data.posts.map(async (post: DummyPost) => {
						const commentsRes = await fetch(`https://dummyjson.com/posts/${post.id}/comments`);
						const commentsData = await commentsRes.json();
						// Add a random image to some posts (about 70% of posts will have images)
						const hasImage = Math.random() > 0.3;
						return {
							...post,
							comments: commentsData.comments || [],
							imageUrl: hasImage ? `https://picsum.photos/800/400?random=${post.id}` : undefined
						};
					})
				);
				
				console.log('[feed] Received', postsWithComments.length, 'posts with comments');
				setDummyPosts(postsWithComments);
			} catch (err) {
				console.error('[feed] Failed to fetch posts:', err);
			} finally {
				setIsLoadingDummy(false);
			}
		}
		fetchDummyPosts();
	}, []);

	async function onCreate(e: FormEvent) {
		e.preventDefault();
		if (!text.trim()) return;
		await createPost({ variables: { text } });
		setText("");
		refetch();
	}

	if (loading && isLoadingDummy) return (
		<div className="max-w-[680px] mx-auto p-4">
			<div className="animate-pulse space-y-4">
				<div className="h-12 bg-slate-200 rounded"></div>
				<div className="h-40 bg-slate-200 rounded"></div>
				<div className="h-40 bg-slate-200 rounded"></div>
			</div>
		</div>
	);

	return (
		<div className="max-w-[680px] mx-auto p-4">
			<h1 className="text-3xl font-bold mb-6 text-slate-900">Social Feed</h1>

			<form onSubmit={onCreate} className="mb-6">
				<input
					value={text}
					onChange={e => setText(e.target.value)}
					placeholder="What's happening?"
					className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none transition-colors"
				/>
				<button type="submit" className="mt-3 inline-flex items-center rounded-lg bg-slate-900 px-6 py-2.5 text-white hover:bg-slate-800 transition-colors font-medium">
					Post Update
				</button>
			</form>

			<div className="space-y-6">
				{/* Your GraphQL Posts */}
				{data?.posts?.map((p: any) => (
					<li key={p.id} className="list-none">
						<PostCard
							post={p}
							onLikeToggle={async () => {
								if (p.likedByMe) await unlike({ variables: { postId: p.id } });
								else await like({ variables: { postId: p.id } });
								refetch();
							}}
							onRepost={async () => {
								await repost({ variables: { postId: p.id } });
								refetch();
							}}
						/>
					</li>
				))}

				{/* Dummy Posts */}
				{dummyPosts.map((post) => (
					<div key={post.id} className="bg-white rounded-xl shadow-sm border-2 border-slate-100 p-6 transition-all hover:shadow-md">
						<div className="flex items-start gap-4">
							<div className="h-12 w-12 rounded-full bg-slate-300 flex-shrink-0" />
							<div className="flex-1 min-w-0">
								<h3 className="font-medium text-slate-900 text-lg leading-snug mb-1">
									{post.title}
								</h3>
								<p className="text-slate-500 text-sm mb-3">
								 {post.tags.join(', ')}
								</p>
								<p className="text-slate-600 leading-relaxed mb-4">
									{post.body}
								</p>
								{post.imageUrl && (
									<div className="mb-4">
										<img
											src={post.imageUrl}
											alt=""
											className="w-full rounded-lg"
										/>
									</div>
								)}
								<div className="space-y-4">
									<div className="flex items-center gap-6">
										<button 
											onClick={() => {
												setLikedPosts(prev => ({
													...prev,
													[post.id]: !prev[post.id]
												}));
											}}
											className={`flex items-center gap-2 ${
												likedPosts[post.id] 
													? 'text-red-500 hover:text-red-600' 
													: 'text-slate-500 hover:text-slate-900'
											} transition-colors`}
										>
											<svg className="w-5 h-5" fill={likedPosts[post.id] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
											</svg>
											<span className="text-sm font-medium">
												{(() => {
													let baseCount = 0;
													if (typeof post.reactions === 'number') {
														baseCount = post.reactions;
													} else if (post.reactions && typeof post.reactions === 'object') {
														baseCount = post.reactions.total || post.reactions.likes || 0;
													}
													return baseCount + (likedPosts[post.id] ? 1 : 0);
												})()}
											</span>
										</button>
										<button 
											onClick={() => {
												setShowComments(prev => ({
													...prev,
													[post.id]: !prev[post.id]
												}));
											}}
											className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
											</svg>
											<span className="text-sm font-medium">
												{post.comments?.length || 0} Comments
											</span>
										</button>
										<button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
											</svg>
											<span className="text-sm font-medium">Share</span>
										</button>
									</div>

									{showComments[post.id] && (
										<div className="mt-4 space-y-4">
											{post.comments?.map(comment => (
												<div key={comment.id} className="bg-slate-50 rounded-lg p-3">
													<p className="text-sm font-medium text-slate-900">@{comment.user.username}</p>
													<p className="text-sm text-slate-600">{comment.body}</p>
												</div>
											))}
											<form 
												onSubmit={(e) => {
													e.preventDefault();
													if (!commentText[post.id]?.trim()) return;
													
													// Add the new comment to the post
													const newComment = {
														id: Date.now(),
														body: commentText[post.id],
														user: { id: 1, username: 'you' }
													};
													
													setDummyPosts(posts => posts.map(p => {
														if (p.id === post.id) {
															return {
																...p,
																comments: [...(p.comments || []), newComment]
															};
														}
														return p;
													}));
													
													// Clear the comment input
													setCommentText(prev => ({
														...prev,
														[post.id]: ''
													}));
												}}
												className="flex gap-2"
											>
												<input
													value={commentText[post.id] || ''}
													onChange={(e) => setCommentText(prev => ({
														...prev,
														[post.id]: e.target.value
													}))}
													placeholder="Write a comment..."
													className="flex-1 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
												/>
												<button
													type="submit"
													className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
												>
													Post
												</button>
											</form>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				))}

				{!loading && !isLoadingDummy && data?.posts?.length === 0 && dummyPosts.length === 0 && (
					<div className="text-center py-12 text-slate-500">
						<p className="text-lg">No posts yet</p>
						<p className="text-sm mt-2">Be the first to share something!</p>
					</div>
				)}

				{isLoadingDummy && (
					<div className="space-y-6">
						{[1, 2, 3].map((n) => (
							<li key={n} className="animate-pulse">
								<div className="bg-white rounded-xl p-6 border-2 border-slate-100">
									<div className="flex gap-4">
										<div className="h-12 w-12 rounded-full bg-slate-200" />
										<div className="flex-1 space-y-4">
											<div className="h-4 bg-slate-200 rounded w-3/4" />
											<div className="h-4 bg-slate-200 rounded w-1/2" />
											<div className="h-20 bg-slate-200 rounded" />
										</div>
									</div>
								</div>
							</li>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
