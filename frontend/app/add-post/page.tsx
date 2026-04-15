"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/config';

const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), { ssr: false });

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_BASE_URL}/post`, {
        title,
        content,
        mainImageUrl: 'Hello world',
        categoryId: 1,
      }, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">
          Content
        </label>
        <RichTextEditor onChange={setContent} />
      </div>
      <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
        Submit
      </button>
    </div>
  );
};

export default CreatePost;
