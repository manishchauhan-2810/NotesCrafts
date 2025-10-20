// FrontendTeacher/src/Pages/NotesPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import PostCreationBox from '../components/PostCreationBox';
import PostCard from '../components/PostCard';

const NotesPage = () => {
  const { currentUser } = useOutletContext();
  
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'You',
      date: new Date().toISOString().split('T')[0],
      title: 'Welcome to the class',
      files: [],
    },
  ]);

  const handleCreatePost = (postData) => {
    const newPost = {
      id: posts.length + 1,
      author: currentUser?.name || 'You',
      date: new Date().toISOString().split('T')[0],
      title: postData.title,
      files: postData.files,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div>
      <PostCreationBox onCreatePost={handleCreatePost} />
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default NotesPage;