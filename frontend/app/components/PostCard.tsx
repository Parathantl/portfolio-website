import React, { useEffect, useState } from "react";
import DOMPurify from 'dompurify';

interface PostCardProps {
    post: {
        id: number,
        title: string,
        content: string,
    }
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const [sanitizedHtml, setSanitizedHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulating async sanitization process
        const sanitizeContent = async () => {
            const sanitized = DOMPurify.sanitize(post.content);
            setSanitizedHtml(sanitized);
            setIsLoading(false); // Set loading to false after sanitization
        };

        sanitizeContent();
    }, [post]);

    return (
        <article className="bg-white dark:bg-gray-800 p-4 shadow rounded border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{post.title}</h3>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="post-content mt-2 text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
            )}
        </article>
    );
}

export default PostCard;
