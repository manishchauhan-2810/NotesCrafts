// FrontendTeacher/src/Pages/ClassDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import ClassHeader from "../components/ClassHeader";
import ClassTabs from "../components/ClassTabs";
import PostCreationBox from "../components/PostCreationBox";
import PostCard from "../components/PostCard";
import DoubtChat from "../components/DoubtChat";

const ClassDetail = () => {
  const { classId } = useParams(); // Get classId from URL
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("stream");
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "You",
      date: new Date().toISOString().split("T")[0],
      title: "Welcome to the class",
      files: [],
    },
  ]);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Fetch classroom data based on classId
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/classroom`,
          {
            params: {
              userId: currentUser.id || currentUser._id,
              role: "teacher",
            },
          }
        );

        // Find the specific classroom by ID
        const classroom = response.data.classrooms.find(
          (c) => c._id === classId
        );

        if (classroom) {
          setClassData({
            ...classroom,
            id: classroom._id,
            subject: classroom.name,
            studentCount: classroom.students?.length || 0,
            color: "bg-gradient-to-br from-purple-500 to-purple-700",
          });
        } else {
          console.error("Classroom not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching classroom:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassData();
    }
  }, [classId, navigate, currentUser.id, currentUser._id]);

  const handleCreatePost = (postData) => {
    const newPost = {
      id: posts.length + 1,
      author: currentUser.name || "You",
      date: new Date().toISOString().split("T")[0],
      title: postData.title,
      files: postData.files,
    };
    setPosts([newPost, ...posts]);
  };

  const handleTabChange = (tabId) => {
    console.log("Active tab changed to:", tabId);
    setActiveTab(tabId);
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLogoClick={handleLogoClick} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading classroom...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLogoClick={handleLogoClick} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mt-20">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Classroom not found
            </h2>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={handleLogoClick} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <ClassHeader classData={classData} onBack={handleBack} />
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
          <div
            className="bg-white rounded-xl border overflow-hidden shadow-lg"
            style={{ height: "calc(100vh - 280px)" }}
          >
            <DoubtChat
              classId={classData._id || classData.id}
              user={{
                id: currentUser._id || currentUser.id,
                _id: currentUser._id || currentUser.id,
                name: currentUser.name,
                role: currentUser.role || "teacher",
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassDetail;