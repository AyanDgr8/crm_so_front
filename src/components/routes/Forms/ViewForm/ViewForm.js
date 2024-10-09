// src/components/routes/Forms/ViewForm/ViewForm.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./ViewForm.css"; 

const ViewForm = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [customFields, setCustomFields] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(location.search);
        const searchType = query.get('type');
        const searchQuery = query.get('query');

        const params = new URLSearchParams();
        if (searchType) params.append("type", searchType);
        if (searchQuery) params.append("query", searchQuery);

        const queryString = params.toString();
        const url = `http://localhost:4000/customers/search?${queryString}`;

        const response = await axios.get(url);
        setResults(response.data);
      } catch (error) {
        setError('Error fetching search results.');
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search]);

  const handleEdit = (customer) => {
    navigate('/customers/use/' + customer.id, { state: { customer } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2 className="list_form_headi">Search Results</h2>
      <div className="list-container">
        {results.length > 0 ? (
          <table className="customers-table">
            <thead>
              <tr className="customer-row">
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date Created</th>
                <th>Date of Birth</th>
                <th>Address</th>
                <th>Contact Type</th>
                <th>Source</th>
                <th>Disposition</th>
                <th>Agent Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="customer-body">
              {results.map((customer) => (
                <tr key={customer.id}>
                    <td>{customer.company_unique_id}</td>
                  <td className="customer-name">{customer.first_name} {customer.last_name}</td>
                  <td>{customer.email_id}</td>
                  <td>{customer.phone_no}</td>
                  <td>{new Date(customer.date_created).toLocaleDateString()}</td>
                  <td>{new Date(customer.date_of_birth).toLocaleDateString()}</td>
                  <td className="customer-add">{customer.address}</td>
                  <td>{customer.contact_type}</td>
                  <td>{customer.source}</td>
                  <td>{customer.disposition}</td>
                  <td>{customer.agent_name}</td>
                  <td>
                    <button onClick={() => handleEdit(customer)} className="edit-btnn">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewForm;
