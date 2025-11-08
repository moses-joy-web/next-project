"use client";

import Link from "next/link";
import React from "react";

type Author = { id: string; username: string; name: string };
type Post = {
  id: string;
  text?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  repostOf?: { id: string } | null;
  author: Author;
};

export default function PostCard({ post, onLikeToggle, onRepost }: { post: Post; onLikeToggle?: () => Promise<void>; onRepost?: () => Promise<void> }) {
  return (
    <article className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-4 shadow-sm">
      <div className="flex gap-3 items-start">
        <div className="w-12 h-12 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-semibold">
          {post.author.name.split(' ').map(s => s[0]).slice(0,2).join('')}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link href={`/profile/${post.author.username}`} className="font-semibold hover:underline">{post.author.name}</Link>
              <div className="text-xs text-slate-500 dark:text-slate-400">@{post.author.username} · {new Date(post.createdAt).toLocaleString()}</div>
            </div>
            {post.repostOf ? <div className="text-xs text-slate-500">Repost</div> : null}
          </div>

          {post.text ? <p className="mt-2 text-slate-700 dark:text-slate-200">{post.text}</p> : null}

          <div className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <button
              onClick={onLikeToggle}
              className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {post.likedByMe ? '♥' : '♡'} {post.likeCount}
            </button>

            <Link href={`/post/${post.id}`} className="underline">Comments ({post.commentCount})</Link>

            <button onClick={onRepost} className="inline-flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-700">Repost</button>
          </div>
        </div>
      </div>
    </article>
  );
}
