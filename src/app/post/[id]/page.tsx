'use client';

import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Image from 'next/image';

const QUERY = gql`
	query Post($id: ID!) {
		post(id: $id) {
			id
			text
			imageUrl
			createdAt
			likeCount
			commentCount
			likedByMe
			author { id username name }
			repostOf { id }
			comments {
				id
				text
				createdAt
				author { username name }
			}
		}
	}
`;

const LIKE = gql`mutation Like($postId: ID!) { likePost(postId: $postId) { id likeCount likedByMe } }`;
const UNLIKE = gql`mutation Unlike($postId: ID!) { unlikePost(postId: $postId) { id likeCount likedByMe } }`;
const COMMENT = gql`mutation Comment($postId: ID!, $text: String!) { commentOnPost(postId: $postId, text: $text) { id text createdAt author { username name } } }`;

export default function PostPage({ params }: { params: { id: string } }) {
	const { data, loading, refetch } = useQuery(QUERY, { variables: { id: params.id } });
	const [like] = useMutation(LIKE);
	const [unlike] = useMutation(UNLIKE);
	const [comment] = useMutation(COMMENT);
	const [text, setText] = useState('');

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-slate-200 rounded w-3/4"></div>
					<div className="h-96 bg-slate-200 rounded"></div>
					<div className="space-y-2">
						<div className="h-4 bg-slate-200 rounded w-full"></div>
						<div className="h-4 bg-slate-200 rounded w-5/6"></div>
					</div>
				</div>
			</div>
		);
	}

	const p = data?.post;
	if (!p) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center py-12">
					<h1 className="text-2xl font-semibold text-slate-900 mb-2">Post not found</h1>
					<Link href="/" className="text-blue-600 hover:underline">
						Return to feed
					</Link>
				</div>
			</div>
		);
	}

	async function onComment(e: FormEvent) {
		e.preventDefault();
		if (!text.trim()) return;
		await comment({ variables: { postId: p.id, text } });
		setText('');
		refetch();
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<Link 
				href="/"
				className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
			>
				<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Back to feed
			</Link>

			<article className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
				<div className="flex items-center gap-4 mb-4">
					<Link
						href={`/profile/${p.author.username}`}
						className="font-medium text-slate-900 hover:underline"
					>
						{p.author.name}
					</Link>
					<span className="text-sm text-slate-500">
						{new Date(p.createdAt).toLocaleString()}
					</span>
					{p.repostOf && (
						<span className="text-sm text-slate-500">
							· repost
						</span>
					)}
				</div>

				{p.text && (
					<p className="text-lg text-slate-900 mb-4">{p.text}</p>
				)}

				{p.imageUrl && (
					<div className="mb-6 relative">
						<Image 
							src={p.imageUrl} 
							alt=""
							width={800}
							height={500}
							className="w-full rounded-lg object-cover"
						/>
					</div>
				)}

				<div className="flex gap-4 items-center">
					<button
						className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-medium text-slate-900 hover:bg-slate-200 transition-colors"
						onClick={async () => {
							if (p.likedByMe) await unlike({ variables: { postId: p.id } });
							else await like({ variables: { postId: p.id } });
							refetch();
						}}
					>
						<svg
							className={`w-5 h-5 ${p.likedByMe ? 'text-red-500 fill-current' : 'text-slate-600'}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d={p.likedByMe 
									? "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								}
							/>
						</svg>
						{p.likedByMe ? 'Unlike' : 'Like'} ({p.likeCount})
					</button>

					<div className="text-slate-600">
						{p.commentCount} comments
					</div>
				</div>

				<hr className="my-8" />

				<section className="space-y-6">
					<h2 className="text-xl font-semibold text-slate-900">
						Comments
					</h2>

					<form onSubmit={onComment} className="space-y-4">
						<textarea
							value={text}
							onChange={e => setText(e.target.value)}
							placeholder="Write a comment..."
							className="w-full rounded-lg border-2 border-slate-200 px-4 py-2 focus:border-slate-900 focus:outline-none min-h-[100px]"
						/>
						<button
							type="submit"
							className="rounded-lg bg-slate-900 px-6 py-2 font-medium text-white hover:bg-slate-800"
						>
							Post Comment
						</button>
					</form>

					<div className="space-y-4">
						{p.comments?.map((comment: any) => (
							<div 
								key={comment.id}
								className="bg-slate-50 rounded-lg p-4"
							>
								<div className="flex items-center gap-2 mb-2">
									<Link
										href={`/profile/${comment.author.username}`}
										className="font-medium text-slate-900 hover:underline"
									>
										{comment.author.name}
									</Link>
									<span className="text-sm text-slate-500">
										{new Date(comment.createdAt).toLocaleString()}
									</span>
								</div>
								<p className="text-slate-600">{comment.text}</p>
							</div>
						))}

						{(!p.comments || p.comments.length === 0) && (
							<p className="text-center text-slate-500 py-4">
								No comments yet. Be the first to comment!
							</p>
						)}
					</div>
				</section>
			</article>
		</div>
	);
}


