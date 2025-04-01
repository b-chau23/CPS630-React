import { useState } from 'react';
import '../styles/productCard.css';
import Reviews from './Reviews';

interface ProductDetailsProp {
    imageSrc: string,
    productName: string,
    price: string,
    salePrice?: string,  // Optional sale price
    productId?: string,
}

const ProductCard = ({ imageSrc, productName, price, salePrice, productId }: ProductDetailsProp) => {
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

          {/* Check if salePrice exists and display accordingly */}
          <p className="product-price">
            {salePrice ? (
              <>
                <span className="original-price">${price}</span> {/* Strike-through original price */}
                <span className="sale-price">${salePrice}</span> {/* Display sale price */}
              </>
            ) : (
              `$${price}` // Just regular price if no sale price
            )}
          </p>

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

                {/* Check if salePrice exists and display accordingly */}
                <p className="product-detail-price">
                  {salePrice ? (
                    <>
                      <span className="original-price">${price}</span> {/* Strike-through original price */}
                      <span className="sale-price">${salePrice}</span> {/* Display sale price */}
                    </>
                  ) : (
                    `$${price}` // Just regular price if no sale price
                  )}
                </p>
              </div>
            </div>
            <Reviews productId={productId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
