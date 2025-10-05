import React, { useState } from 'react';
import { User } from 'lucide-react';
import Header from '../components/Header';
import ClassHeader from '../components/ClassHeader';
import ClassTabs from '../components/ClassTabs';
import PostCreationBox from '../components/PostCreationBox';
import PostCard from '../components/PostCard';

const ClassDetail = ({ classData, onBack }) => {
  const [activeTab, setActiveTab] = useState('stream');
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'You',
      date: '2024-10-01',
      title: 'Photosynthesis Notes',
      files: []
    }
  ]);

  const handleCreatePost = (postData) => {
    const newPost = {
      id: posts.length + 1,
      author: 'You',
      date: new Date().toISOString().split('T')[0],
      title: postData.title,
      files: postData.files
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={onBack} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ClassHeader classData={classData} onBack={onBack} />
        <ClassTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'stream' && (
          <>
            <PostCreationBox onCreatePost={handleCreatePost} />
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'quizzes' && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No Quizzes Yet</h3>
            <p className="text-gray-600">Create your first quiz</p>
          </div>
        )}

        {activeTab === 'test-papers' && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No Test Papers Yet</h3>
            <p className="text-gray-600">Upload test papers</p>
          </div>
        )}

        {activeTab === 'doubts' && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Rahul Kumar</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">2024-10-03</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">New</span>
                </div>
                <h3 className="font-medium mb-2">Can you explain the Calvin Cycle?</h3>
                <p className="text-gray-600 text-sm">I'm having trouble understanding the light-independent reactions.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassDetail;