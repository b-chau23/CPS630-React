import '../styles/productCard.css';

interface ProductDetailsProp {
    imageSrc: string,
    productName: string,
    price: number,
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
    </div>
  );
};

export default ProductCard;