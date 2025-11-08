'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';

const QUERY = gql`
	query UserPosts($username: String!) {
		user(username: $username) { id username name }
		userPosts(username: $username) {
			id
			text
			createdAt
			commentCount
			likeCount
		}
	}
`;

export default function ProfilePage({ params }: { params: { username: string } }) {
	const { data, loading } = useQuery(QUERY, { variables: { username: params.username } });
	if (loading) return <div className="max-w-[680px] mx-auto p-4">Loading…</div>;
	if (!data?.user) return <div className="max-w-[680px] mx-auto p-4">User not found</div>;

	return (
		<div className="max-w-[680px] mx-auto p-4">
			<h1 className="text-2xl font-semibold">{data.user.name} (@{data.user.username})</h1>
			<nav className="my-2 text-blue-600"><Link href="/">Home</Link></nav>
			<ul className="space-y-3">
				{data.userPosts.map((p: any) => (
					<li key={p.id} className="border border-gray-200 rounded p-3">
						<Link href={`/post/${p.id}`} className="underline">{p.text || '(no text)'}</Link>
						<div className="text-xs text-gray-500">
							{new Date(p.createdAt).toLocaleString()} · Likes {p.likeCount} · Comments {p.commentCount}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}


