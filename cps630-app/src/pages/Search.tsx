import { useState, useEffect } from 'react';
import { useAuthContext } from '../authContext';
import ProductCard from '../components/ProductCard';
import '../styles/search.css';

interface SearchResult {
  Item_Id?: string;
  Item_Name?: string;
  Price?: string;
  Item_Image?: string;
  Item_Type?: string;
  Order_Id?: string;
  Date_Issued?: string;
  Date_Received?: string;
  Total_Price?: string;
  User_Id?: string;
  Username?: string;
  Name?: string;
  Email?: string;
  Role?: string;
  [key: string]: any; // Allow for any other properties
}

function Search() {
  const auth = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('products');
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [debug, setDebug] = useState<any>(null);

  // Fetch all data on initial load and when searchType changes
  useEffect(() => {
    fetchAllData();
  }, [searchType, auth.role]); // Re-fetch when search type or user role changes

  // Filter results when searchTerm changes
  useEffect(() => {
    filterResults();
  }, [searchTerm, allResults]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      console.log(`Fetching all ${searchType}`);
      
      const formData = new FormData();
      formData.append('searchType', searchType);
      formData.append('fetchAll', 'true'); // Signal to fetch all results
      
      // Log credentials state
      console.log("Auth state:", {
        username: auth.username,
        role: auth.role,
        includeCredentials: true
      });
      
      const response = await fetch('http://localhost/CPS630-React/php/search.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store raw response for debugging
      setDebug(data);
      console.log('Search results:', data);
      
      if (data.error) {
        setError(data.error);
        setAllResults([]);
        setFilteredResults([]);
      } else if (Array.isArray(data) && data.length === 0) {
        setMessage('No results found.');
        setAllResults([]);
        setFilteredResults([]);
      } else {
        setAllResults(data);
        setFilteredResults(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAllResults([]);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    if (!searchTerm.trim()) {
      setFilteredResults(allResults);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    
    let filtered: SearchResult[] = [];
    
    switch (searchType) {
      case 'products':
        filtered = allResults.filter(item => 
          (item.Item_Name?.toLowerCase().includes(term) ||
           item.Item_Type?.toLowerCase().includes(term))
        );
        break;
        
      case 'orders':
        filtered = allResults.filter(order => 
          (order.Order_Id?.toString().includes(term) ||
           order.Date_Issued?.toLowerCase().includes(term) ||
           order.Date_Received?.toLowerCase().includes(term))
        );
        break;
        
      case 'users':
        filtered = allResults.filter(user => 
          (user.Username?.toLowerCase().includes(term) ||
           user.Name?.toLowerCase().includes(term) ||
           user.Email?.toLowerCase().includes(term))
        );
        break;
    }
    
    setFilteredResults(filtered);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchTerm('');
    setSearchType(e.target.value);
  };

  return (
    <div className="search-container">
      <h1>Search</h1>
      
      <div className="search-controls">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchTermChange}
          placeholder="Filter results..."
          className="search-input"
        />
        
        <select 
          value={searchType}
          onChange={handleSearchTypeChange}
          className="search-type"
        >
          <option value="products">Products</option>
          {auth.username && <option value="orders">Orders</option>}
          {auth.role === 'admin' && <option value="users">Users</option>}
        </select>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {message && <div className="info-message">{message}</div>}
      
      {searchType === 'orders' && (
        <div className="search-help">
          <p>Type to filter orders by Order ID or date.</p>
          {auth.role === 'admin' && <p>As an admin, you can see all user orders.</p>}
        </div>
      )}
      
      <div className="search-results">
        {loading ? (
          <p className="loading-message">Loading {searchType}...</p>
        ) : filteredResults.length > 0 ? (
          <div>
            <h2>Results ({filteredResults.length})</h2>
            
            {searchType === 'products' && (
              <div className="product-results">
                {filteredResults.map((item) => (
                  <ProductCard
                    key={item.Item_Id}
                    imageSrc={item.Item_Image || ''}
                    productName={item.Item_Name || ''}
                    price={item.Price || '0'}
                    productId={item.Item_Id}
                  />
                ))}
              </div>
            )}
            
            {searchType === 'orders' && (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date Issued</th>
                    <th>Date Received</th>
                    <th>Total Price</th>
                    {auth.role === 'admin' && <th>User ID</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((order) => (
                    <tr key={order.Order_Id}>
                      <td>{order.Order_Id}</td>
                      <td>{order.Date_Issued}</td>
                      <td>{order.Date_Received || 'Not received yet'}</td>
                      <td>${parseFloat(order.Total_Price || '0').toFixed(2)}</td>
                      {auth.role === 'admin' && <td>{order.User_Id}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {searchType === 'users' && auth.role === 'admin' && (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((user) => (
                    <tr key={user.User_Id}>
                      <td>{user.User_Id}</td>
                      <td>{user.Username}</td>
                      <td>{user.Name}</td>
                      <td>{user.Email}</td>
                      <td>{user.Role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <p className="no-results">No matching {searchType} found. Try adjusting your filter.</p>
        )}
      </div>
      
    </div>
  );
}

export default Search; 