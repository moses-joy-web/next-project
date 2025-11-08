export type User = { id: string; username: string; name: string };
export type Post = {
	id: string;
	authorId: string;
	text?: string;
	imageUrl?: string;
	createdAt: string;
	repostOfId?: string | null;
};
export type Comment = { id: string; postId: string; authorId: string; text: string; createdAt: string };
export type Like = { id: string; postId: string; userId: string };

export const users: User[] = [
	{ id: 'u1', username: 'alice', name: 'Alice' },
	{ id: 'u2', username: 'bob', name: 'Bob' },
];

export const posts: Post[] = [
	{ id: 'p1', authorId: 'u1', text: 'Hello world!', createdAt: new Date().toISOString(), repostOfId: null },
];

export const comments: Comment[] = [];
export const likes: Like[] = [];

let idCounter = 1000;
export function genId(prefix: string) {
	idCounter += 1;
	return `${prefix}${idCounter}`;
}

export function getUserById(id: string) { return users.find(u => u.id === id) || null; }
export function getUserByUsername(username: string) { return users.find(u => u.username === username) || null; }
export function getPostById(id: string) { return posts.find(p => p.id === id) || null; }



