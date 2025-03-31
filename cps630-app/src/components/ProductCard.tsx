<<<<<<< HEAD
import '../styles/productCard.css';
=======
import { useState } from 'react';
import '../styles/productCard.css';
import Reviews from './Reviews';
>>>>>>> 2458187 (Hopefully fixed it)

interface ProductDetailsProp {
    imageSrc: string,
    productName: string,
    price: string,
<<<<<<< HEAD
}

const ProductCard = ({ imageSrc, productName, price }: ProductDetailsProp) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={imageSrc} 
          alt={productName} 
          className="product-image"
        />
      </div>
      <div className="product-info">
        <h3 className="product-name">{productName}</h3>
        <p className="product-price">{price}</p>
      </div>
=======
    productId?: string,
}

const ProductCard = ({ imageSrc, productName, price, productId }: ProductDetailsProp) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    if (productId) {
      setShowDetails(!showDetails);
    }
  };

  return (
    <div className="product-container">
      <div className={`product-card ${productId ? 'clickable' : ''}`} onClick={toggleDetails}>
        <div className="product-image-container">
          <img 
            src={imageSrc} 
            alt={productName} 
            className="product-image"
          />
        </div>
        <div className="product-info">
          <h3 className="product-name">{productName}</h3>
          <p className="product-price">${price}</p>
          {productId && <button className="view-details-btn">View Details</button>}
        </div>
      </div>

      {showDetails && productId && (
        <div className="product-details-modal">
          <div className="product-details-content">
            <button className="close-button" onClick={toggleDetails}>×</button>
            <div className="product-details-header">
              <img 
                src={imageSrc} 
                alt={productName} 
                className="product-detail-image"
              />
              <div className="product-detail-info">
                <h2>{productName}</h2>
                <p className="product-detail-price">${price}</p>
              </div>
            </div>
            <Reviews productId={productId} />
          </div>
        </div>
      )}
>>>>>>> 2458187 (Hopefully fixed it)
    </div>
  );
};

export default ProductCard;