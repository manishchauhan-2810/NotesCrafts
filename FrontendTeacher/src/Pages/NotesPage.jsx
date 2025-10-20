import React, { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  Download,
  Eye,
  Trash2,
  Loader,
} from "lucide-react";
import {
  getNotesByClassroom,
  uploadNote,
  getNoteFileUrl,
} from "../api/notesApi";

const NotesPage = () => {
  const { classId } = useParams();
  const { currentUser } = useOutletContext();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    file: null,
  });

  // Fetch notes for this classroom
  useEffect(() => {
    fetchNotes();
  }, [classId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await getNotesByClassroom(classId);
      setNotes(response.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      alert("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!uploadForm.file) {
      alert("Please select a file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("title", uploadForm.title.trim());
      formData.append("file", uploadForm.file);
      formData.append("uploadedBy", currentUser.name);
      formData.append("classroomId", classId);

      const response = await uploadNote(formData);

      setNotes([response.note, ...notes]);
      setUploadForm({ title: "", file: null });

      // Reset file input
      document.getElementById("file-upload").value = "";

      alert("Note uploaded successfully!");
    } catch (error) {
      console.error("Error uploading note:", error);
      alert(error.response?.data?.message || "Failed to upload note");
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = (note) => {
    setPreviewNote(note);
  };

  const closePreview = () => {
    setPreviewNote(null);
  };

  const handleDownload = (note) => {
    const url = getNoteFileUrl(note.fileId);
    window.open(url, "_blank");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload New Note
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Title
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, title: e.target.value })
                }
                placeholder="Enter note title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-600"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="file-upload"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </label>
                {uploadForm.file && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{uploadForm.file.name}</span>
                    <span className="text-gray-400">
                      ({formatFileSize(uploadForm.file.size)})
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only PDF files up to 10MB are allowed
              </p>
            </div>

            <button
              type="submit"
              disabled={
                uploading || !uploadForm.title.trim() || !uploadForm.file
              }
              className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Note
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Notes List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Uploaded Notes ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No notes uploaded yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Upload your first note using the form above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span>Uploaded by {note.uploadedBy}</span>
                        <span>•</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(note)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>

                        <button
                          onClick={() => handleDownload(note)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {previewNote.title}
              </h3>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={getNoteFileUrl(previewNote.fileId)}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
