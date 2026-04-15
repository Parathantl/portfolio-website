#!/bin/bash

# Create uploads directory on the server
# This directory will store all uploaded files

set -e

echo "Setting up uploads directory..."

# Create uploads directory
mkdir -p ~/parathan-blog/uploads/{profiles,projects,posts}

# Set proper permissions
chmod 755 ~/parathan-blog/uploads
chmod 755 ~/parathan-blog/uploads/profiles
chmod 755 ~/parathan-blog/uploads/projects
chmod 755 ~/parathan-blog/uploads/posts

echo "✅ Uploads directory created at: ~/parathan-blog/uploads"
echo ""
echo "Directory structure:"
tree -L 2 ~/parathan-blog/uploads || ls -R ~/parathan-blog/uploads
echo ""
echo "Files uploaded will be accessible at:"
echo "  https://parathan.com/uploads/profiles/"
echo "  https://parathan.com/uploads/projects/"
echo "  https://parathan.com/uploads/posts/"
