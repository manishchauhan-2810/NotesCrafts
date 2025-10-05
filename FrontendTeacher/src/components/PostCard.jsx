import React from 'react';
import { FileText } from 'lucide-react';

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{post.author}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{post.date}</span>
          </div>
          <h3 className="text-gray-900 font-medium mb-3">{post.title}</h3>
          
          {post.files.length > 0 && (
            <div className="space-y-2 mt-3">
              {post.files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
