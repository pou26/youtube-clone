import { useParams, Link } from "react-router-dom";
import React, { useEffect, useState,useContext } from "react";
import axios from "axios";
import Videos from "./Videos";
import { AuthContext } from './AuthContext';
import { useRef } from 'react';

// Helper function to format the published date
const formatPublishedDate = (publishedAt) => {
  const published = new Date(publishedAt);
  const now = new Date();
  const diffSeconds = Math.floor((now - published) / 1000);
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 604800)} weeks ago`;
  if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)} months ago`;
  return `${Math.floor(diffSeconds / 31536000)} years ago`;
};

// Function to extract YouTube video ID from URL
const extractYoutubeId = (url) => {
  if (!url) return "";
  
  // Handle both embed URLs and watch URLs
  if (url.includes('/embed/')) {
    return url.split('/embed/')[1].split('?')[0];
  } else if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1].split('&')[0];
  }
  
  // If no pattern matches, return the original value
  return url;
};

// Function to format numbers for display
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};



async function fetchVideoDetails(videoId) {
  try {
    console.log("Fetching video with ID:", videoId); 
    
    const response = await axios.get(`/video/${videoId}`);
    
    console.log("API Response:", response.data); 
    
    // Check if it has a valid video object
    const video = response.data; 
    
    if (!video) {
      throw new Error("Video not found");
    }
    
    return {
      videoId: video._id,
      ytVideoId: extractYoutubeId(video.videoUrl), // Extract the actual YouTube ID
      title: video.title,
      description: video.description,
      channelTitle: video.channelName,
      views: video.views,
      likes: video.likes || 0,
      dislikes: video.dislikes || 0,
      publishedAt: formatPublishedDate(video.uploadDate),
      thumbnailUrl: video.thumbnailUrl,
    };
  } catch (error) {
    console.error("Error in fetchVideoDetails:", error);
    throw error;
  }
}

// Function to fetch comments for a video
async function fetchComments(videoId) {
  try {
    const response = await axios.get(`/comments/${videoId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

const VideoDetails = () => {
  const { videoId } = useParams();
  const [videoDetails, setVideoDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [commentCount, setCommentCount] = useState(0);
  const [editingComment, setEditingComment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const { user } = useContext(AuthContext);
  

  
  useEffect(() => {
    console.log("VideoId from useParams:", videoId); 
    
    if (!videoId) {
      setError("Video ID is missing from URL");
      return;
    }
    
    const getVideoDetails = async () => {
      try {
        const details = await fetchVideoDetails(videoId);
        setVideoDetails(details);
        
        // Fetch comments after getting video details
        const commentsData = await fetchComments(videoId);
        setComments(commentsData);
        setCommentCount(commentsData.length);
      } catch (err) {
        console.error("Error fetching video details:", err);
        setError(err.response?.data?.message || err.message);
      }
    };
    
    getVideoDetails();
  }, [videoId]);
  
  // Toggle subscription status
  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  
  };
  
  // Handle like and dislike
  const handleLike = () => {
    if (liked) {
      setLiked(false);
    } else {
      setLiked(true);
      setDisliked(false);
    }
    
  };
  
  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
    } else {
      setDisliked(true);
      setLiked(false);
    }
    
  };
  


// Handle comment submission
const handleCommentSubmit = async (e) => {
  e.preventDefault();
  
  if (!commentText.trim()) return;
  if (!user) {
    alert("Please login to comment");
    return;
  }
  
  setCommentLoading(true);
  
  try {
    // If editing an existing comment
    if (editingComment) {
      const response = await axios.post(`/comment/${videoId}`, {
        commentId: editingComment,
        text: commentText
      });
      
      // Update the comment in the comments list
      setComments(comments.map(comment => 
        comment.commentId === editingComment 
          ? { ...comment, text: commentText, timestamp: new Date() } 
          : comment
      ));
      
      setEditingComment(null);
    } else {
      // Create a new comment
      const response = await axios.post(`/comment/${videoId}`, {
        text: commentText
      });
      
      // The response contains the updated video object, which has the comments array
      //extract the latest comment 
      const newComments = response.data.data.comments || [];
      
      // If there are comments, add the new one end of the array
      if (newComments.length > 0) {
        // Get the latest comment (the one just added)
        const newComment = newComments[newComments.length - 1];
        
        // Update the comments state by adding the new comment to the existing array
        setComments([newComment, ...comments]);
        setCommentCount(commentCount + 1);
      } else {
        // Fallback: if we can't get the new comment, refresh all comments
        const commentsData = await fetchComments(videoId);
        setComments(commentsData);
        setCommentCount(commentsData.length);
      }
    }
    
    // Clear the comment input
    setCommentText("");
  } catch (err) {
    console.error("Error submitting comment:", err);
    alert("Failed to submit comment. Please try again.");
  } finally {
    setCommentLoading(false);
  }
};
  
  // Handle editing a comment
  const handleEditComment = (comment) => {
    setCommentText(comment.text);
    setEditingComment(comment._id);
  };
  
  // Handle canceling comment edit
  const handleCancelEdit = () => {
    setCommentText("");
    setEditingComment(null);
  };

   // Handle delete comment
   const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      console.log("Deleting comment with ID:", commentToDelete);
    

      const commentId = commentToDelete._id || commentToDelete.commentId;
      
     
      await axios.delete(`/comment/${videoId}/${commentId}`);
      
      // Remove the comment from the list
      setComments(comments.filter(comment => comment._id !== commentToDelete));
      setCommentCount(prev => prev - 1);
      
      // Close the delete modal
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };
  
  
  // Handle sorting comments
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    
    // Sort comments based on selected option
    const sortedComments = [...comments];
    if (sortType === "newest") {
      sortedComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortType === "top") {
      // In a real app, this would sort by likes/engagement
      sortedComments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    
    setComments(sortedComments);
  };
  

  
  if (error) return <div className="error">Error: {error}</div>;
  if (!videoDetails) return <div className="loading">Loading video details...</div>;
  
  return (
    <div className="flex flex-col md:flex-row gap-5 p-8 md:p-2 bg-[#111] text-white">
      {/* Video details section */}
      <div className="md:w-2/3 lg:w-3/4">
        <div className="mb-4">
          <div className="aspect-video mb-4 ">
            <iframe
              src={`https://www.youtube.com/embed/${videoDetails.ytVideoId}`}
              className="w-full h-full rounded-lg"
              title={videoDetails.title}
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Video title */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">{videoDetails.title}</h1>
          
          {/* Video interaction buttons */}
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center">
              <p className="text-sm text-gray-400 mr-4">
                {formatNumber(videoDetails.views)} views • {videoDetails.publishedAt}
              </p>
            </div>
            
            <div className="flex space-x-2 text-sm">
              {/* Like/Dislike buttons */}
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1 px-3 py-2 rounded-full ${liked ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <span className="text-lg">{liked ? '👍' : '👍'}</span>
                <span>{formatNumber(videoDetails.likes + (liked ? 1 : 0))}</span>
              </button>
              
              <button 
                onClick={handleDislike}
                className={`flex items-center gap-1 px-3 py-2 rounded-full ${disliked ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <span className="text-lg">{disliked ? '👎' : '👎'}</span>
                <span>{disliked ? 'Disliked' : ''}</span>
              </button>
              
              {/* Share button */}
              <button className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-800">
                <span className="text-lg">↗️</span>
                <span>Share</span>
              </button>
              
              {/* Download button */}
              <button className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-800">
                <span className="text-lg">⬇️</span>
                <span>Download</span>
              </button>
              
              {/* More button */}
              <button className="flex items-center px-3 py-2 rounded-full hover:bg-gray-800">
                <span className="text-xl">⋯</span>
              </button>
            </div>
          </div>
          
          {/* Channel info and subscription */}
          <div className="bg-[#222] p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* Channel avatar - using a placeholder */}
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl">
                  {videoDetails.channelTitle.charAt(0)}
                </div>
                
                <div>
                  <p className="font-bold">{videoDetails.channelTitle}</p>
                  <p className="text-xs text-gray-400">1.2M subscribers</p>
                </div>
              </div>
              
              <button 
                onClick={handleSubscribe}
                className={`px-4 py-2 rounded-full font-medium ${
                  isSubscribed 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            
            {/* Video description */}
            <div className="mt-4">
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {videoDetails.description}
              </p>
            </div>
          </div>
          
 {/* Comments Section */}
 <div className="mt-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold">{formatNumber(commentCount)} Comments</h2>
              
              {/* Comment sorting options */}
              <div className="flex items-center mt-2">
                <button 
                  onClick={() => handleSortChange("top")}
                  className={`mr-4 text-sm ${sortBy === "top" ? "text-white" : "text-gray-400"}`}
                >
                  Top comments
                </button>
                <button 
                  onClick={() => handleSortChange("newest")}
                  className={`text-sm ${sortBy === "newest" ? "text-white" : "text-gray-400"}`}
                >
                  Newest first
                </button>
              </div>
            </div>
            
            {/* Comment form */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                {/* User avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm flex-shrink-0">
                  {user ? user.name.charAt(0) : "G"}
                </div>
                
                <form onSubmit={handleCommentSubmit} className="w-full">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-transparent border-b border-gray-700 focus:border-gray-400 outline-none py-2 px-0 text-sm"
                  />
                  
                  {(commentText || editingComment) && (
                    <div className="flex justify-end mt-2 space-x-2">
                      {editingComment && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-sm rounded-full text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                      )}
                  <button
                    type="submit"
                    disabled={commentLoading || !commentText.trim()}
                    className={`px-3 py-1 text-sm rounded-full ${
                    commentLoading || !commentText.trim()
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  >
                      {commentLoading ? 'Posting...' : editingComment ? 'Save' : 'Comment'}
                    </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
            
{/* Comments list */}
<div className="space-y-4">
  {comments.length > 0 ? (
    comments.map((comment, index) => {
      
      const commentId = comment._id || comment.commentId;
      
      return (
        <div key={commentId || index} className="flex gap-3">
          {/* Commenter avatar */}
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm flex-shrink-0">
            {comment.userName?.charAt(0) || "U"}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.userName || "User"}</span>
              <span className="text-gray-400 text-xs">{formatPublishedDate(comment.timestamp)}</span>
              {comment.edited && (
                <span className="text-gray-400 text-xs">(edited)</span>
              )}
            </div>
            
            <p className="text-sm mt-1">{comment.text}</p>
            
            {/* Comment actions */}
            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-1 text-gray-400 hover:text-white">
                <span className="text-sm">👍</span>
                <span className="text-xs">{comment.likes || 0}</span>
              </button>
              
              <button className="flex items-center gap-1 text-gray-400 hover:text-white">
                <span className="text-sm">👎</span>
              </button>
              
              {/* Only show edit/delete options if the comment was made by the current user */}
              {user && comment.userId === user._id && (
                <>
                  <button 
                    onClick={() => handleEditComment(comment)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    EDIT
                  </button>
                  
                  <button 
                    onClick={() => openDeleteModal(comment)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    DELETE
                  </button>
                </>
              )}
              
              <button className="text-xs text-gray-400 hover:text-white">
                REPLY
              </button>
            </div>
          </div>
        </div>
      );
    })
  ) : (
    <div className="text-center py-6 text-gray-400">
      No comments yet. Be the first to comment!
    </div>
  )}
</div>
          </div>
          
          <Link
            to="/"
            className="mt-6 inline-block text-blue-400 hover:text-blue-600 text-sm"
          >
            ← Back to Videos
          </Link>
        </div>
      </div>
      
      {/* Videos list section */}
      <div className="md:w-1/3 lg:w-1/3 overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
        <Videos
          activeFilter="All"
          layoutType="list"
          context="related"  // This disables hover preview
        />
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Comment</h3>
            <p className="mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComment}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDetails;