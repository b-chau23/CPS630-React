import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthContext } from '../authContext';
import '../styles/dbMaintain.css';

interface Item {
  Item_Id: string;
  Item_Name: string;
  Item_Type: string;
  Price: string;
  Item_Image: string;
  Made_In: string;
  Department_Code: string;
  Stock_Quantity: string;
}

interface User {
  User_Id: string;
  Username: string;
  Role: string;
  Email: string;
  Name: string;
  Phone: string;
  Address: string;
}

interface Order {
  Order_Id: string;
  Date_Issued: string;
  Date_Received: string;
  Total_Price: string;
  Payment_Code: string;
  User_Id: string;
  Trip_Id: string;
  Receipt_Id: string;
}

function DbMaintain() {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Item state
  const [newItem, setNewItem] = useState<Partial<Item>>({
    Item_Name: '',
    Item_Type: '',
    Price: '',
    Item_Image: '',
    Made_In: '',
    Department_Code: '',
    Stock_Quantity: ''
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // User state
  const [newUser, setNewUser] = useState<Partial<User>>({
    Username: '',
    Name: '',
    Email: '',
    Role: 'user',
    Phone: '',
    Address: ''
  });
  const [newUserPassword, setNewUserPassword] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingUserPassword, setEditingUserPassword] = useState('');
  
  // Order state
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    Date_Issued: new Date().toISOString().split('T')[0],
    Date_Received: '',
    Total_Price: '',
    Payment_Code: '',
    User_Id: '',
    Trip_Id: '',
    Receipt_Id: ''
  });
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    // Check if user is admin
    if (auth.role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchData();
  }, [auth.role, navigate, activeTab]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'items') {
        console.log('Fetching items data');
        const response = await fetch('http://localhost/CPS630-React/php/getItems.php', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Items data received:', data);
        
        if (data.error) {
          setError(data.error);
        } else {
          setItems(data);
        }
      } else if (activeTab === 'users') {
        console.log('Fetching users data');
        const response = await fetch('http://localhost/CPS630-React/php/getUsers.php', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Users data received:', data);
        
        if (data.error) {
          setError(data.error);
        } else {
          setUsers(data);
        }
      } else if (activeTab === 'orders') {
        console.log('Fetching orders data');
        const response = await fetch('http://localhost/CPS630-React/php/getOrders.php', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Orders data received:', data);
        
        if (data.error) {
          setError(data.error);
        } else {
          setOrders(data);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      Object.entries(newItem).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      console.log('Adding new item:', newItem);
      
      const response = await fetch('http://localhost/CPS630-React/php/addItem.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Add item response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Item added successfully');
        setNewItem({
          Item_Name: '',
          Item_Type: '',
          Price: '',
          Item_Image: '',
          Made_In: '',
          Department_Code: '',
          Stock_Quantity: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setError(`Failed to add item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      Object.entries(editingItem).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      console.log('Updating item:', editingItem);
      
      const response = await fetch('http://localhost/CPS630-React/php/updateItem.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update item response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Item updated successfully');
        setEditingItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError(`Failed to update item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      formData.append('Item_Id', itemId);
      
      console.log('Deleting item ID:', itemId);
      
      const response = await fetch('http://localhost/CPS630-React/php/deleteItem.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete item response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Item deleted successfully');
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(`Failed to delete item: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      formData.append('User_Id', userId);
      
      console.log('Deleting user ID:', userId);
      
      const response = await fetch('http://localhost/CPS630-React/php/deleteUser.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete user response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('User deleted successfully');
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      formData.append('Order_Id', orderId);
      
      console.log('Deleting order ID:', orderId);
      
      const response = await fetch('http://localhost/CPS630-React/php/deleteOrder.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete order response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Order deleted successfully');
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(`Failed to delete order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      Object.entries(newUser).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('Password', newUserPassword);
      
      console.log('Adding new user:', newUser);
      
      const response = await fetch('http://localhost/CPS630-React/php/addUser.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Add user response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('User added successfully');
        setNewUser({
          Username: '',
          Name: '',
          Email: '',
          Role: 'user',
          Phone: '',
          Address: ''
        });
        setNewUserPassword('');
        fetchData();
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setError(`Failed to add user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      Object.entries(editingUser).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      if (editingUserPassword) {
        formData.append('Password', editingUserPassword);
      }
      
      console.log('Updating user:', editingUser);
      
      const response = await fetch('http://localhost/CPS630-React/php/updateUser.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update user response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('User updated successfully');
        setEditingUser(null);
        setEditingUserPassword('');
        fetchData();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(`Failed to update user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      Object.entries(newOrder).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      console.log('Adding new order:', newOrder);
      
      const response = await fetch('http://localhost/CPS630-React/php/addOrder.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Add order response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Order added successfully');
        setNewOrder({
          Date_Issued: new Date().toISOString().split('T')[0],
          Date_Received: '',
          Total_Price: '',
          Payment_Code: '',
          User_Id: '',
          Trip_Id: '',
          Receipt_Id: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error adding order:', err);
      setError(`Failed to add order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      const formData = new FormData();
      Object.entries(editingOrder).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      console.log('Updating order:', editingOrder);
      
      const response = await fetch('http://localhost/CPS630-React/php/updateOrder.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Update order response:', result);
      
      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Order updated successfully');
        setEditingOrder(null);
        fetchData();
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setError(`Failed to update order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="db-maintain">
      <h1>Database Maintenance</h1>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}
      
      <div className="tabs">
        <button 
          className={activeTab === 'items' ? 'active' : ''} 
          onClick={() => setActiveTab('items')}
        >
          Items
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'items' && (
          <div>
            <h2>Add New Item</h2>
            <form onSubmit={handleAddItem}>
              <div>
                <label>Name:</label>
                <input 
                  type="text" 
                  value={newItem.Item_Name} 
                  onChange={(e) => setNewItem({...newItem, Item_Name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Type:</label>
                <input 
                  type="text" 
                  value={newItem.Item_Type} 
                  onChange={(e) => setNewItem({...newItem, Item_Type: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Price:</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newItem.Price} 
                  onChange={(e) => setNewItem({...newItem, Price: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Image URL:</label>
                <input 
                  type="text" 
                  value={newItem.Item_Image} 
                  onChange={(e) => setNewItem({...newItem, Item_Image: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Made In:</label>
                <input 
                  type="text" 
                  value={newItem.Made_In} 
                  onChange={(e) => setNewItem({...newItem, Made_In: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Department Code:</label>
                <input 
                  type="text" 
                  value={newItem.Department_Code} 
                  onChange={(e) => setNewItem({...newItem, Department_Code: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Stock Quantity:</label>
                <input 
                  type="number" 
                  value={newItem.Stock_Quantity} 
                  onChange={(e) => setNewItem({...newItem, Stock_Quantity: e.target.value})}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>Add Item</button>
            </form>
            
            {editingItem && (
              <div className="edit-form">
                <h2>Edit Item</h2>
                <form onSubmit={handleUpdateItem}>
                  <div>
                    <label>Name:</label>
                    <input 
                      type="text" 
                      value={editingItem.Item_Name} 
                      onChange={(e) => setEditingItem({...editingItem, Item_Name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Type:</label>
                    <input 
                      type="text" 
                      value={editingItem.Item_Type} 
                      onChange={(e) => setEditingItem({...editingItem, Item_Type: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Price:</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingItem.Price} 
                      onChange={(e) => setEditingItem({...editingItem, Price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Image URL:</label>
                    <input 
                      type="text" 
                      value={editingItem.Item_Image} 
                      onChange={(e) => setEditingItem({...editingItem, Item_Image: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Made In:</label>
                    <input 
                      type="text" 
                      value={editingItem.Made_In} 
                      onChange={(e) => setEditingItem({...editingItem, Made_In: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Department Code:</label>
                    <input 
                      type="text" 
                      value={editingItem.Department_Code} 
                      onChange={(e) => setEditingItem({...editingItem, Department_Code: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Stock Quantity:</label>
                    <input 
                      type="number" 
                      value={editingItem.Stock_Quantity} 
                      onChange={(e) => setEditingItem({...editingItem, Stock_Quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" disabled={loading}>Update</button>
                    <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
            
            <h2>Item List</h2>
            {items.length === 0 ? (
              <p>No items found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Image</th>
                    <th>Made In</th>
                    <th>Department Code</th>
                    <th>Stock Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.Item_Id}>
                      <td>{item.Item_Id}</td>
                      <td>{item.Item_Name}</td>
                      <td>{item.Item_Type}</td>
                      <td>${item.Price}</td>
                      <td>
                        <img src={item.Item_Image} alt={item.Item_Name} className="thumbnail" />
                      </td>
                      <td>{item.Made_In}</td>
                      <td>{item.Department_Code}</td>
                      <td>{item.Stock_Quantity}</td>
                      <td>
                        <button onClick={() => setEditingItem(item)} disabled={loading}>Edit</button>
                        <button onClick={() => handleDeleteItem(item.Item_Id)} disabled={loading}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {activeTab === 'users' && (
          <div>
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div>
                <label>Username:</label>
                <input 
                  type="text" 
                  value={newUser.Username} 
                  onChange={(e) => setNewUser({...newUser, Username: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Name:</label>
                <input 
                  type="text" 
                  value={newUser.Name} 
                  onChange={(e) => setNewUser({...newUser, Name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Email:</label>
                <input 
                  type="email" 
                  value={newUser.Email} 
                  onChange={(e) => setNewUser({...newUser, Email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Password:</label>
                <input 
                  type="password" 
                  value={newUserPassword} 
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Role:</label>
                <select 
                  value={newUser.Role} 
                  onChange={(e) => setNewUser({...newUser, Role: e.target.value})}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label>Phone:</label>
                <input 
                  type="text" 
                  value={newUser.Phone} 
                  onChange={(e) => setNewUser({...newUser, Phone: e.target.value})}
                />
              </div>
              <div>
                <label>Address:</label>
                <input 
                  type="text" 
                  value={newUser.Address} 
                  onChange={(e) => setNewUser({...newUser, Address: e.target.value})}
                />
              </div>
              <button type="submit" disabled={loading}>Add User</button>
            </form>
            
            {editingUser && (
              <div className="edit-form">
                <h2>Edit User</h2>
                <form onSubmit={handleUpdateUser}>
                  <div>
                    <label>Username:</label>
                    <input 
                      type="text" 
                      value={editingUser.Username} 
                      onChange={(e) => setEditingUser({...editingUser, Username: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Name:</label>
                    <input 
                      type="text" 
                      value={editingUser.Name} 
                      onChange={(e) => setEditingUser({...editingUser, Name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Email:</label>
                    <input 
                      type="email" 
                      value={editingUser.Email} 
                      onChange={(e) => setEditingUser({...editingUser, Email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>New Password (leave blank to keep current):</label>
                    <input 
                      type="password" 
                      value={editingUserPassword} 
                      onChange={(e) => setEditingUserPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Role:</label>
                    <select 
                      value={editingUser.Role} 
                      onChange={(e) => setEditingUser({...editingUser, Role: e.target.value})}
                      required
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label>Phone:</label>
                    <input 
                      type="text" 
                      value={editingUser.Phone} 
                      onChange={(e) => setEditingUser({...editingUser, Phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label>Address:</label>
                    <input 
                      type="text" 
                      value={editingUser.Address} 
                      onChange={(e) => setEditingUser({...editingUser, Address: e.target.value})}
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" disabled={loading}>Update</button>
                    <button type="button" onClick={() => {
                      setEditingUser(null);
                      setEditingUserPassword('');
                    }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
            
            <h2>User List</h2>
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.User_Id}>
                      <td>{user.User_Id}</td>
                      <td>{user.Username}</td>
                      <td>{user.Name}</td>
                      <td>{user.Email}</td>
                      <td>{user.Role}</td>
                      <td>{user.Phone}</td>
                      <td>{user.Address}</td>
                      <td>
                        <button onClick={() => setEditingUser(user)} disabled={loading}>Edit</button>
                        <button onClick={() => handleDeleteUser(user.User_Id)} disabled={loading}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div>
            <h2>Add New Order</h2>
            <form onSubmit={handleAddOrder}>
              <div>
                <label>Date Issued:</label>
                <input 
                  type="date" 
                  value={newOrder.Date_Issued} 
                  onChange={(e) => setNewOrder({...newOrder, Date_Issued: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Date Received:</label>
                <input 
                  type="date" 
                  value={newOrder.Date_Received} 
                  onChange={(e) => setNewOrder({...newOrder, Date_Received: e.target.value})}
                />
              </div>
              <div>
                <label>Total Price:</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newOrder.Total_Price} 
                  onChange={(e) => setNewOrder({...newOrder, Total_Price: e.target.value})}
                  required
                />
              </div>
              <div>
                <label>Payment Code:</label>
                <input 
                  type="text" 
                  value={newOrder.Payment_Code} 
                  onChange={(e) => setNewOrder({...newOrder, Payment_Code: e.target.value})}
                />
              </div>
              <div>
                <label>User ID:</label>
                <select 
                  value={newOrder.User_Id} 
                  onChange={(e) => setNewOrder({...newOrder, User_Id: e.target.value})}
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.User_Id} value={user.User_Id}>
                      {user.User_Id} - {user.Username} ({user.Name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Trip ID:</label>
                <input 
                  type="text" 
                  value={newOrder.Trip_Id} 
                  onChange={(e) => setNewOrder({...newOrder, Trip_Id: e.target.value})}
                />
              </div>
              <div>
                <label>Receipt ID:</label>
                <input 
                  type="text" 
                  value={newOrder.Receipt_Id} 
                  onChange={(e) => setNewOrder({...newOrder, Receipt_Id: e.target.value})}
                />
              </div>
              <button type="submit" disabled={loading}>Add Order</button>
            </form>
            
            {editingOrder && (
              <div className="edit-form">
                <h2>Edit Order</h2>
                <form onSubmit={handleUpdateOrder}>
                  <div>
                    <label>Order ID:</label>
                    <input 
                      type="text" 
                      value={editingOrder.Order_Id} 
                      readOnly
                    />
                  </div>
                  <div>
                    <label>Date Issued:</label>
                    <input 
                      type="date" 
                      value={editingOrder.Date_Issued} 
                      onChange={(e) => setEditingOrder({...editingOrder, Date_Issued: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Date Received:</label>
                    <input 
                      type="date" 
                      value={editingOrder.Date_Received} 
                      onChange={(e) => setEditingOrder({...editingOrder, Date_Received: e.target.value})}
                    />
                  </div>
                  <div>
                    <label>Total Price:</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingOrder.Total_Price} 
                      onChange={(e) => setEditingOrder({...editingOrder, Total_Price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Payment Code:</label>
                    <input 
                      type="text" 
                      value={editingOrder.Payment_Code} 
                      onChange={(e) => setEditingOrder({...editingOrder, Payment_Code: e.target.value})}
                    />
                  </div>
                  <div>
                    <label>User ID:</label>
                    <select 
                      value={editingOrder.User_Id} 
                      onChange={(e) => setEditingOrder({...editingOrder, User_Id: e.target.value})}
                      required
                    >
                      {users.map((user) => (
                        <option key={user.User_Id} value={user.User_Id}>
                          {user.User_Id} - {user.Username} ({user.Name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Trip ID:</label>
                    <input 
                      type="text" 
                      value={editingOrder.Trip_Id} 
                      onChange={(e) => setEditingOrder({...editingOrder, Trip_Id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label>Receipt ID:</label>
                    <input 
                      type="text" 
                      value={editingOrder.Receipt_Id} 
                      onChange={(e) => setEditingOrder({...editingOrder, Receipt_Id: e.target.value})}
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" disabled={loading}>Update</button>
                    <button type="button" onClick={() => setEditingOrder(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
            
            <h2>Order List</h2>
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date Issued</th>
                    <th>Date Received</th>
                    <th>Total Price</th>
                    <th>Payment Code</th>
                    <th>User ID</th>
                    <th>Trip ID</th>
                    <th>Receipt ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.Order_Id}>
                      <td>{order.Order_Id}</td>
                      <td>{order.Date_Issued}</td>
                      <td>{order.Date_Received}</td>
                      <td>${order.Total_Price}</td>
                      <td>{order.Payment_Code}</td>
                      <td>{order.User_Id}</td>
                      <td>{order.Trip_Id}</td>
                      <td>{order.Receipt_Id}</td>
                      <td>
                        <button onClick={() => setEditingOrder(order)} disabled={loading}>Edit</button>
                        <button onClick={() => handleDeleteOrder(order.Order_Id)} disabled={loading}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DbMaintain; 