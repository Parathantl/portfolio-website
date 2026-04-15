'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import ImageUpload from '../../../../components/ImageUpload';
import { blogAPI } from '@/app/lib/api';
import { Category, MasterCategory, Post } from '@/app/types/blog';

const RichTextEditor = dynamic(() => import('../../../../components/RichTextEditor'), { ssr: false });

const EditPost: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [selectedMasterCategoryId, setSelectedMasterCategoryId] = useState<number>(0);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    fetchMasterCategories();
    fetchCategories();
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchMasterCategories = async () => {
    try {
      const data = await blogAPI.getMasterCategories();
      setMasterCategories(data);
    } catch (error) {
      console.error('Error fetching master categories:', error);
      toast.error('Failed to load master categories');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await blogAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchPost = async () => {
    try {
      const data: Post = await blogAPI.getPostById(parseInt(postId));
      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt || '');
      setMainImageUrl(data.mainImageUrl || '');
      setSlug(data.slug);

      // Set category IDs from the post's categories
      if (data.categories && data.categories.length > 0) {
        const ids = data.categories.map(cat => cat.id);
        setCategoryIds(ids);

        // Set master category from the first category
        const masterCatId = data.categories[0].masterCategoryId;
        setSelectedMasterCategoryId(masterCatId);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleGenerateExcerpt = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent) {
      toast.error('Please write some content first');
      return;
    }

    setGeneratingExcerpt(true);
    try {
      const result = await blogAPI.generateExcerpt(title, content);
      setExcerpt(result.excerpt);
      toast.success('Excerpt generated!');
    } catch (error: any) {
      console.error('Error generating excerpt:', error);
      toast.error(error?.message || 'Failed to generate excerpt');
    } finally {
      setGeneratingExcerpt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    // Check if content is empty (Quill might return HTML with just empty tags)
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent) {
      toast.error('Please enter content');
      return;
    }

    if (categoryIds.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setSaving(true);

    try {
      const result = await blogAPI.updatePost(slug, {
        title,
        content,
        mainImageUrl: mainImageUrl || undefined,
        categoryIds,
        excerpt: excerpt || undefined,
      });

      toast.success('Post updated successfully!');
      router.push('/admin/posts');
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error(error?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  // Filter categories by selected master category
  const filteredCategories = categories.filter(
    cat => cat.masterCategoryId === selectedMasterCategoryId
  );

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your blog post
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your post title..."
            />
          </div>

          {/* Master Category Selection */}
          <div>
            <label htmlFor="masterCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blog Type *
            </label>
            <select
              id="masterCategory"
              value={selectedMasterCategoryId}
              onChange={(e) => {
                setSelectedMasterCategoryId(parseInt(e.target.value));
                setCategoryIds([]); // Reset selected categories when changing master category
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {masterCategories.map((mc) => (
                <option key={mc.id} value={mc.id}>
                  {mc.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select which blog this post belongs to (Tech, Tamil, etc.)
            </p>
          </div>

          {/* Categories - Multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories * (Select one or more)
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No categories available for this blog type. Please create categories first.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-900 dark:text-white">
                        {category.title}
                      </span>
                      {category.description && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          - {category.description}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {categoryIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Selected:</span>
                {categoryIds.map(id => {
                  const cat = categories.find(c => c.id === id);
                  return cat ? (
                    <span
                      key={id}
                      className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      {cat.title}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Featured Image */}
          <ImageUpload
            label="Featured Image"
            value={mainImageUrl}
            onChange={setMainImageUrl}
            folder="posts"
            preview={true}
          />

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <RichTextEditor value={content} onChange={setContent} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update your blog post content using the rich text editor
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt (SEO)
            </label>
            <div className="flex gap-2 mb-2">
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                maxLength={300}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                placeholder="A brief summary of your post for search engines and AI answer engines..."
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleGenerateExcerpt}
                disabled={generatingExcerpt}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingExcerpt ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {excerpt.length}/300 characters
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Used for meta descriptions, structured data, and AI answer engine citations. Leave empty for auto-generated.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Post'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/posts')}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
