import { useState, useEffect } from 'react';
import { useAuthContext } from '../authContext';
import '../styles/reviews.css';

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id?: string;
}

interface ReviewsProps {
  productId: string;
}

function Reviews({ productId }: ReviewsProps) {
  const auth = useAuthContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const isAdmin = auth.role === 'admin';

  useEffect(() => {
    fetchReviews();
  }, [productId]);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('productId', productId);
      
      console.log('Fetching reviews for product ID:', productId);
      console.log('User is admin:', isAdmin);
      
      const response = await fetch('http://localhost/CPS630-React/php/getReviews.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Reviews data received:', data);
      
      if (data.error) {
        setError(data.error);
      } else {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(`Failed to load reviews: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.username) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (!newReview.comment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    try {
      setMessage('');
      setError('');
      
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', newReview.rating.toString());
      formData.append('comment', newReview.comment);
      
      console.log('Submitting review for product ID:', productId);
      
      const response = await fetch('http://localhost/CPS630-React/php/addReview.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Add review response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Review submitted successfully');
        setNewReview({
          rating: 5,
          comment: ''
        });
        fetchReviews(); // Refresh reviews after adding
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(`Failed to submit review: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setError('');
    setMessage('');
  };
  
  const handleCancelEdit = () => {
    setEditingReview(null);
  };
  
  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingReview) return;
    
    try {
      setMessage('');
      setError('');
      
      const formData = new FormData();
      formData.append('review_id', editingReview.id);
      formData.append('rating', editingReview.rating.toString());
      formData.append('comment', editingReview.comment);
      
      console.log('Updating review:', editingReview.id);
      
      const response = await fetch('http://localhost/CPS630-React/php/updateReview.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update review response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Review updated successfully');
        setEditingReview(null);
        fetchReviews(); // Refresh reviews after updating
      }
    } catch (err) {
      console.error('Error updating review:', err);
      setError(`Failed to update review: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  const handleDeleteConfirm = (reviewId: string) => {
    setConfirmDelete(reviewId);
    setError('');
    setMessage('');
  };
  
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  const handleDeleteReview = async (reviewId: string) => {
    try {
      setMessage('');
      setError('');
      
      const formData = new FormData();
      formData.append('review_id', reviewId);
      
      console.log('Deleting review:', reviewId);
      
      const response = await fetch('http://localhost/CPS630-React/php/deleteReview.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete review response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Review deleted successfully');
        setConfirmDelete(null);
        fetchReviews(); // Refresh reviews after deleting
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(`Failed to delete review: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };
  
  const renderEditableStars = (rating: number, onChange: (newRating: number) => void) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={star <= rating ? 'star filled' : 'star'}
        onClick={() => onChange(star)}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="reviews-container">
      <h3>Customer Reviews</h3>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {auth.username && !editingReview && (
        <div className="review-form">
          <h4>Write a Review</h4>
          <form onSubmit={handleSubmitReview}>
            <div className="rating-selector">
              <label>Rating:</label>
              <div className="star-rating">
                {renderEditableStars(newReview.rating, (rating) => 
                  setNewReview({ ...newReview, rating })
                )}
              </div>
            </div>
            
            <div className="comment-input">
              <label>Your Review:</label>
              <textarea
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                required
              />
            </div>
            
            <button type="submit">Submit Review</button>
          </form>
        </div>
      )}
      
      {editingReview && (
        <div className="review-form edit-form">
          <h4>Edit Review</h4>
          <form onSubmit={handleUpdateReview}>
            <div className="rating-selector">
              <label>Rating:</label>
              <div className="star-rating">
                {renderEditableStars(editingReview.rating, (rating) =>
                  setEditingReview({ ...editingReview, rating })
                )}
              </div>
            </div>
            
            <div className="comment-input">
              <label>Your Review:</label>
              <textarea
                rows={4}
                value={editingReview.comment}
                onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                required
              />
            </div>
            
            <div className="edit-actions">
              <button type="submit">Update Review</button>
              <button type="button" onClick={handleCancelEdit} className="btn-cancel">Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      <div className="reviews-list">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="review-author">{review.username}</span>
                <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <div className="review-rating">
                {renderStars(parseInt(review.rating.toString()))}
              </div>
              <p className="review-comment">{review.comment}</p>
              
              {isAdmin && !editingReview && confirmDelete !== review.id && (
                <div className="admin-actions">
                  <button onClick={() => handleEditReview(review)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDeleteConfirm(review.id)} className="btn-delete">Delete</button>
                </div>
              )}
              
              {confirmDelete === review.id && (
                <div className="delete-confirmation">
                  <p>Are you sure you want to delete this review?</p>
                  <div className="confirmation-actions">
                    <button onClick={() => handleDeleteReview(review.id)} className="btn-confirm">Yes, Delete</button>
                    <button onClick={handleCancelDelete} className="btn-cancel">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reviews; 