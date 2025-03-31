import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import ProductCard from "./ProductCard";
import '../styles/shopping.css'

interface productItems {
    id: string,
    name: string,
    price: string,
    img: string,
}

// make sure localStorage is empty on page first load or any relaods
// note that this does not apply for re-renders
// localStorage.removeItem("cartItems");

function Shopping() {
  const [initialItems, setInitialItems] = useState<productItems[]>([]);
  const [itemTypes, setItemTypes] = useState<String[]>([]);
  const [cartList, setCartList] = useState<productItems[]>([]);
  
  // make sure localStorage is clear whenever page is first rendered
  useEffect(() => {
    localStorage.removeItem("cartItems");
  }, [])

  useEffect(() => {
    // get the items available for sale from the backend
    fetch('http://localhost/CPS630-React/php/itemsData.php')
    .then((response) => response.json())
    .then((data) => setInitialItems(data))
    .catch((error) => {
        console.log(error);
        setInitialItems([]);
    })
    // get list of item types
    fetch('http://localhost/CPS630-React/php/itemTypes.php')
    .then((response) => response.json())
    .then((data) => setItemTypes(data))
    .catch((error) => {
        console.log(error);
        setItemTypes([]);
    })

  }, [])

  const filterItems = async (formData: FormData) => {
    const response = await fetch('http://localhost/CPS630-React/php/filterItems.php', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    const data = await response.json();
    setInitialItems(data);
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return; // Drop outside valid zones

    const { source, destination } = result;

    // Prevent dropping into Product List
    if (destination.droppableId === "productList") return;

    // Clone item if dragging from Product List
    if (source.droppableId === "productList") {
      const itemToClone = initialItems.find((item) => item.id === result.draggableId);

      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]");
      cartItems.push(itemToClone?.id);
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      
      if (itemToClone) {
        setCartList([{ ...itemToClone, id: `${itemToClone.id}-${Date.now()}` }, ...cartList]);
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
      <form action={filterItems} className="filter-items">
        <div>
          <label htmlFor="itemType">Select Item Type:</label>
          <select id="itemType" name="itemType">
            <option value="">All</option>
            {itemTypes.map((itemType, index) => (
              <option key={index} value={String(itemType)}>{itemType}</option>
            ))}
          </select>
        </div>
            
        <div>
          <label htmlFor="minPrice">Min Price:</label>
          <input type="number" id="minPrice" name="minPrice" placeholder="Min price"/>
        </div>

        <div>
          <label htmlFor="maxPrice">Max Price:</label>
          <input type="number" id="maxPrice" name="maxPrice" placeholder="Max price"/>
        </div><br/>
        <div>
          <button type="submit">Apply Filters</button>
        </div>
      </form>
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

                    {initialItems.map((item, index) => (
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
                                    productName={item.name}
                                    price={item.price}
                                    productId={item.id}
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
                                    productName={item.name}
                                    price={item.price}
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