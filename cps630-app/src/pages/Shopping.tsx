import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import ProductCard from "../components/ProductCard";
import '../styles/shopping.css'

const initialItemsA = [
    { id: "1", text: "Item 1", img: "https://m.media-amazon.com/images/I/41ZoSIkSQsL._AC_UY218_.jpg"},
    { id: "2", text: "Item 2", img: "https://m.media-amazon.com/images/I/61UoZAL-zdL.jpg"},
    { id: "3", text: "Item 3", img: "https://m.media-amazon.com/images/I/719mdrIdHtL._AC_UY218_.jpg"},
    { id: "4", text: "Item 4", img:  "https://themontessoriroom.com/cdn/shop/products/maple-wood-classroom-chairs-8-sizes-available-made-in-canada-386961_1080x.png?v=1709266743"},
  ];

// make sure localStorage is empty on page first load or any relaods
localStorage.removeItem("cartItems");

function Shopping() {
  const [cartList, setCartList] = useState<{ id: string; text: string; img: string }[]>([]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return; // Drop outside valid zones

    const { source, destination } = result;

    // Prevent dropping into Product List
    if (destination.droppableId === "productList") return;

    // Clone item if dragging from Product List
    if (source.droppableId === "productList") {
      const itemToClone = initialItemsA.find((item) => item.id === result.draggableId);

    //   console.log("to insert: ", itemToClone); // debug -- thing to insert
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    //   console.log("insert into: ", cartItems); // debug -- shit we got from cartItems
      cartItems.push(itemToClone?.id);
    //   console.log("after insertion: ", cartItems); // debug -- after we inserted
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      
      if (itemToClone) {
        setCartList([...cartList, { ...itemToClone, id: `${itemToClone.id}-${Date.now()}` }]);
      }
      return;
    }

    // Move items within List B
    const updatedcartList = [...cartList];
    const [movedItem] = updatedcartList.splice(source.index, 1);
    updatedcartList.splice(destination.index, 0, movedItem);
    setCartList(updatedcartList);
  };

  // Remove item from List B
  const handleRemove = (id: string) => {
    const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const result = cartItems.indexOf(id.split('-')[0]);
    cartItems.splice(result, 1)
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    
    setCartList(cartList.filter((item) => item.id !== id));
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-container">
          {/* Product List (Template List) */}
            <Droppable droppableId="productList" isDropDisabled={true}>
                {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                >
                    <h2 className="shopping">Shopping</h2>
                    {initialItemsA.map((item, index) => (
                    <div key={item.id} style={{margin: "10px"}}>
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <ProductCard 
                                    imageSrc={item.img}
                                    productName={item.text}
                                    price={12.99}
                                />
                            </div>
                            )}
                        </Draggable>
                    </div>
                    ))}
                    {provided.placeholder}
                </div>
                )}
            </Droppable>
          {/* List B (Droppable and Removable Items) */}
            <Droppable droppableId="cartList">
                {(provided) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                >
                    <h2 className="shopping">Cart</h2>
                    {cartList.map((item, index) => (
                    <div key={item.id} style={{margin: "10px"}}>
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleRemove(item.id)} // Click to remove
                            >
                                <ProductCard 
                                    imageSrc={item.img}
                                    productName={item.text}
                                    price={12.99}
                                />
                                <button
                                style={{width: "250px"}} // button width to match ProductCard width
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent click event from triggering item removal
                                    handleRemove(item.id);
                                }}
                                >
                                ❌
                                </button>
                            </div>
                            )}
                        </Draggable>
                    </div>
                    ))}
                    {provided.placeholder}
                </div>
                )}
            </Droppable>

            {/* the below is for displaying reviews, it can be ignored for now */}
            {/* <div className="review">
                <ProductCard imageSrc="" price={12.88} productName="product" />
            </div> */}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Shopping;