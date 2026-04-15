'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '@/app/lib/config';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isArchived: boolean;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_BASE_URL}/contact/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      toast.success('Message deleted successfully');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread') return !msg.isRead;
    if (filter === 'archived') return msg.isArchived;
    return !msg.isArchived;
  });

  const unreadCount = messages.filter((msg) => !msg.isRead && !msg.isArchived).length;

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Contact Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage messages from your contact form
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All Messages ({messages.filter(m => !m.isArchived).length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'archived'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Archived ({messages.filter(m => m.isArchived).length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'unread' ? 'No unread messages' :
             filter === 'archived' ? 'No archived messages' :
             'No messages yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredMessages
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.isRead) {
                      markAsRead(message.id);
                    }
                  }}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow cursor-pointer transition-all hover:shadow-lg ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''
                  } ${
                    !message.isRead ? 'border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {message.name}
                        </h3>
                        {!message.isRead && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message.email}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {message.subject}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {message.message}
                  </p>
                </div>
              ))}
          </div>

          {/* Message Detail */}
          <div className="lg:sticky lg:top-8 h-fit">
            {selectedMessage ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <div className="mb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">From:</span>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {selectedMessage.name}
                    </p>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline block"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Message:</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center transition-colors"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  Select a message to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
