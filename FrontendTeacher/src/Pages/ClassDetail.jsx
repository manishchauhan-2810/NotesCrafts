import React, { useState } from "react";
import Header from "../components/Header";
import ClassHeader from "../components/ClassHeader";
import ClassTabs from "../components/ClassTabs";
import PostCreationBox from "../components/PostCreationBox";
import PostCard from "../components/PostCard";
import DoubtChat from "../components/DoubtChat";

const ClassDetail = ({ classData, onBack, currentUser }) => {
  const [activeTab, setActiveTab] = useState("stream");
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "You",
      date: "2024-10-01",
      title: "Photosynthesis Notes",
      files: [],
    },
  ]);

  const handleCreatePost = (postData) => {
    const newPost = {
      id: posts.length + 1,
      author: currentUser.name,
      date: new Date().toISOString().split("T")[0],
      title: postData.title,
      files: postData.files,
    };
    setPosts([newPost, ...posts]);
  };

  const handleTabChange = (tabId) => {
    console.log('Active tab changed to:', tabId);
    setActiveTab(tabId);
  };

  // Debug logs
  console.log("ClassDetail - currentUser:", currentUser);
  console.log("ClassDetail - classData:", classData);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={onBack} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <ClassHeader classData={classData} onBack={onBack} />
        <ClassTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Stream Tab */}
        {activeTab === "stream" && (
          <div>
            <PostCreationBox onCreatePost={handleCreatePost} />
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Doubts Tab */}
        {activeTab === "doubts" && (
          <div className="bg-white rounded-xl border overflow-hidden shadow-lg" style={{ height: 'calc(100vh - 280px)' }}>
            <DoubtChat
              classId={classData?._id || classData?.id}
              user={{
                id: currentUser?._id || currentUser?.id,
                name: currentUser?.name,
                role: currentUser?.role,
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassDetail;