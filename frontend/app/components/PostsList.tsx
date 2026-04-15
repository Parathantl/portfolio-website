import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { API_BASE_URL } from '@/app/lib/config';

interface PostType {
  id: number;
  title: string;
  content: string;
}

const getPosts = async () => {
  const res = await fetch(`${API_BASE_URL}/post?date=desc`);
  if (!res.ok) {
    throw new Error('Failed to fetch posts. Please try again later.');
  }
  return res.json();
}

const PostsList = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    getPosts().then(posts => {
      setPosts(posts);
      setLoading(false);
    }).catch(error => {
      setError(error.message);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      {posts.map((post: PostType) => (
        <div key={post.id}>
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}

export default PostsList;
