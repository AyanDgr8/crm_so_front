// src/components/routes/Forms/ListForm/ListForm.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ListForm.css";
// import Popup from "../../Other/Popup/Popup";

const ListForm = () => {
  const [customers, setCustomers] = useState([]);
  const [customFields, setCustomFields] = useState([]); // State for custom fields
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(5);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [customersResponse, customFieldsResponse, userResponse] = await Promise.all([
          axios.get("http://localhost:4000/customers"),
          axios.get("http://localhost:4000/custom-fields"),
          // axios.get("http://localhost:4000/custom-values/${customer.company_unique_id}"),
          axios.get("http://localhost:4000/current-user", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        // Update state with fetched data
        setCustomers(customersResponse.data);
        setCustomFields(customFieldsResponse.data);
        setUser(userResponse.data);
        
        // Check if the user is an admin
        setIsAdmin(userResponse.data.role === "Admin");

      } catch (error) {
        setError("Failed to fetch data.");
        console.error("Error fetching data:", error);
      } finally {
        // Ensure loading state is set to false regardless of success or error
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (customer) => {
    navigate(`/customers/use/${customer.id}`, { state: { customer } });
  };

  const handleAddField = () => {
    navigate("/customers/custom-fields");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      {/* <Popup /> */}
      <h2 className="list_form_headi">Customers Relationship Management</h2>
      <div className="list-container">
        {currentCustomers.length > 0 ? (
          <>
            <table className="customers-table">
              <thead>
                <tr className="customer-row">
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date Created</th>
                  <th>Date of Birth</th>
                  <th className="customer-add">Address</th>
                  <th>Contact Type</th>
                  <th>Source</th>
                  <th>Disposition</th>
                  <th>Agent Name</th>
                  {customFields.map((field) => (
                    <th key={field.id}>{field.field_name}</th> // Use unique field ID
                  ))}

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="customer-body">
                {currentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.company_unique_id}</td>
                    <td>{customer.first_name} {customer.last_name}</td>
                    <td>{customer.email_id}</td>
                    <td>{customer.phone_no}</td>
                    <td>{new Date(customer.date_created).toLocaleDateString()}</td>
                    <td>{new Date(customer.date_of_birth).toLocaleDateString()}</td>
                    <td className="customer-add">{customer.address}</td>
                    <td>{customer.contact_type}</td>
                    <td>{customer.source}</td>
                    <td>{customer.disposition}</td>
                    <td>{customer.agent_name}</td>

                  {/* Render custom field values */}
                  {customFields.map((field) => {
                    // Check if the customer has a value for the current custom field
                    const customValue = customer.custom_values && customer.custom_values[field.field_name] 
                      ? customer.custom_values[field.field_name] 
                      : "++"; // Default value if no custom value exists
                    return <td key={field.id}>{customValue}</td>;
                  })}

                    <td>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="edit-btnn"
                        aria-label={`Edit ${customer.first_name} ${customer.last_name}`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="add-fi" >
              {isAdmin && (
                <button
                  onClick={handleAddField}
                  className="add-field-btn"
                  aria-label="Add new customer"
                >
                  Add Field
                </button>
              )}
            </div>
            

            <div className="pagination-container">
              <div className="pagination">
                {currentPage > 1 && (
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    className="page-number"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                )}

                {[...Array(Math.ceil(customers.length / customersPerPage)).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`page-number ${currentPage === number + 1 ? 'active' : ''}`}
                    aria-label={`Go to page ${number + 1}`}
                  >
                    {number + 1}
                  </button>
                ))}

                {currentPage < Math.ceil(customers.length / customersPerPage) && (
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    className="page-number"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>No recent records found.</p>
        )}
      </div>
    </div>
  );
};

export default ListForm;
