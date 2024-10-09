// src/components/routes/Forms/UseForm/UseForm.js

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UseForm.css";
import LastChanges from "../LastChange/LastChange";

const UseForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const customer = location.state.customer;

    const [formData, setFormData] = useState({
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone_no: customer.phone_no,
        email_id: customer.email_id,
        address: customer.address,
        company_name: customer.company_name,
        contact_type: customer.contact_type || "customer",
        source: customer.source,
        disposition: customer.disposition,
        agent_name: customer.agent_name,
        company_unique_id: customer.company_unique_id,
    });

    const [customFields, setCustomFields] = useState([]);
    const [updatedData, setUpdatedData] = useState(formData); // State to hold updated data

    useEffect(() => {
        // Fetch custom fields when the component mounts
        const fetchCustomFields = async () => {
            try {
                const response = await axios.get("http://localhost:4000/custom-fields");
                setCustomFields(response.data);

                // Initialize custom fields in formData based on customer data
                const customData = {};
                response.data.forEach(field => {
                    customData[field.field_name] = customer[field.field_name] || '';
                });

                setFormData(prevData => ({ ...prevData, ...customData }));
            } catch (error) {
                console.error("Error fetching custom fields:", error);
            }
        };

        fetchCustomFields();
    }, [customer]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleDateTimeChange = (index, event) => {
        const { value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [customFields[index].field_name]: value,
        }));
    };
    
    const validatePhoneNumber = (number) => {
        const regex = /^[5-9]\d{9}$/;
        return regex.test(number);
    };

    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate phone number and email
        if (!validatePhoneNumber(formData.phone_no)) {
            alert("Phone number must be 10 digits long and start with a digit from 5 to 9.");
            return;
        }
    
        if (!validateEmail(formData.email_id)) {
            alert("Please enter a valid email address.");
            return;
        }
    
        // Ensure company_unique_id exists
        if (!customer.company_unique_id) {
            alert("Company unique ID is missing or invalid.");
            return;
        }
    
        // Collect custom fields
        const customFieldData = customFields
            .map(field => {
                const fieldId = field.id || null;
                const fieldValue = formData[field.field_name] !== undefined ? formData[field.field_name] : null;
                return { fieldId, fieldValue };
            })
            .filter(field => field.fieldId !== null && field.fieldValue !== null);
    
        // Ensure valid custom fields
        if (customFieldData.length === 0) {
            alert("No valid custom fields to update.");
            return;
        }
    
        // Track changes
        const changes = [];
        const updatedFormData = { ...formData, customFields: customFieldData, company_unique_id: customer.company_unique_id };
    
        for (const key in updatedFormData) {
            const old_value = customer[key];
            if (updatedFormData[key] !== old_value) {
                changes.push({
                    field: key,
                    old_value,
                    new_value: updatedFormData[key],
                });
            }
        }
    
        if (changes.length === 0) {
            alert("No changes made.");
            return;
        }
    
        try {
            // Clean up undefined fields
            Object.keys(updatedFormData).forEach((key) => {
                if (updatedFormData[key] === undefined) {
                    updatedFormData[key] = null;
                }
            });
    
            // Update customer data
            console.log("Updating customer with data:", updatedFormData);
            await axios.put(`http://localhost:4000/customers/use/${customer.company_unique_id}`, updatedFormData);
    
            // Update or create custom field values
            for (const field of customFieldData) {
                if (!field.fieldId) {
                    // New custom field
                    await axios.post(`http://localhost:4000/custom-values`, {
                        fieldValue: field.fieldValue,
                        company_unique_id: customer.company_unique_id,
                        field_name: field.field_name, // Assuming field_name is available
                    });
                } else {
                    // Update existing custom field
                    await axios.put(`http://localhost:4000/custom-values`, {
                        company_unique_id: customer.company_unique_id,
                        fieldValue: field.fieldValue,
                        field_name: field.field_name,
                    });
                }
            }
    
            // Log changes
            await axios.post(`http://localhost:4000/customers/log-change`, {
                company_unique_id: customer.company_unique_id,
                changes,
            });
    
            setUpdatedData(updatedFormData);
            navigate("/customers");
        } catch (error) {
            console.error("Error updating customer:", error);
            alert("There was an error updating the customer. Please try again.");
        }
    };
    
    
    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this record?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:4000/delete/${customer.id}`);
            alert("Record deleted successfully.");
            navigate("/customers");
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("Failed to delete the record.");
        }
    };

    // Function to safely parse dropdown options
    const parseDropdownOptions = (options) => {
        try {
            // Check if options is an array
            if (Array.isArray(options)) {
                return options;
            } else if (typeof options === 'string') {
                // If it's a string, parse as JSON or split by commas
                if (options.startsWith('[') && options.endsWith(']')) {
                    return JSON.parse(options);
                } else {
                    return options.split(',').map(option => option.trim());
                }
            }
            throw new Error('Invalid dropdown options format');
        } catch (error) {
            console.error("Invalid options format:", error);
            return []; // Return empty array on error
        }
    };

    return (
        <div>
            <h2 className="list_form_headiii">Edit Customer</h2>
            <div className="use-form-container">
                <form onSubmit={handleSubmit}>
                    {/* Existing form inputs */}
                    <div className="label-input">
                        <label>First Name:</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} />
                    </div>
                    <div className="label-input">
                        <label>Last Name:</label>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} />
                    </div>
                    <div className="label-input">
                        <label>Phone Number:</label>
                        <input type="text" name="phone_no" value={formData.phone_no} onChange={handleInputChange} />
                    </div>
                    <div className="label-input">
                        <label>Email:</label>
                        <input type="email" name="email_id" value={formData.email_id} onChange={handleInputChange} />
                    </div>
                    <div className="label-input">
                        <label>Address:</label>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                    </div>
                    <div className="label-input">
                        <label>Company Name:</label>
                        <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} />
                    </div>

                    {/* Dropdown for contact type */}
                    <div className="label-input">
                        <label>Contact Type:</label>
                        <select name="contact_type" value={formData.contact_type} onChange={handleInputChange}>
                            <option value="customer">customer</option>
                            <option value="dealer">dealer</option>
                            <option value="distributor">distributor</option>
                        </select>
                    </div>

                    <div className="label-input">
                        <label>Source:</label>
                        <input type="text" name="source" value={formData.source} onChange={handleInputChange} />
                    </div>

                    <div className="label-input">
                        <label>Disposition:</label>
                        <input type="text" name="disposition" value={formData.disposition} onChange={handleInputChange} />
                    </div>

                    <div className="label-input">
                        <label>Agent Name:</label>
                        <input type="text" name="agent_name" value={formData.agent_name} onChange={handleInputChange} />
                    </div>

                    {/* Custom Fields Inputs */}
                    {customFields.map((field, index) => (
                        <div className="label-input" key={field.id}>
                            <label>{field.field_name}</label>
                            {field.field_type === 'dropdown' ? (
                                <div>
                                    <select
                                        name={field.field_name}
                                        value={formData[field.field_name] || ''}
                                        onChange={handleInputChange}
                                    >
                                        {parseDropdownOptions(field.dropdown_options).map((option, idx) => (
                                            <option key={idx} value={option.trim()}>{option.trim()}</option>
                                        ))}
                                    </select>
                                    
                                </div>
                            ) : field.field_type === 'checkbox' ? (
                                <div>
                                    <select
                                        name={field.field_name}
                                        value={formData[field.field_name] || ''}
                                        onChange={handleInputChange}
                                    >
                                        {parseDropdownOptions(field.dropdown_options).map((option, idx) => (
                                            <option key={idx} value={option.trim()}>{option.trim()}</option>
                                        ))}
                                    </select>
                                    
                                </div>
                            ) : field.field_type === 'datetime' ? (
                                <input
                                    type="datetime-local"
                                    name={field.field_name}
                                    value={formData[field.field_name] || ''}
                                    onChange={(e) => handleDateTimeChange(index, e)}
                                />
                            ) : (
                                <input
                                    type={field.field_type}
                                    name={field.field_name}
                                    value={formData[field.field_name] || ''}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>
                    ))}

                    {/* Update and Delete buttons at the bottom */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', margin: 'auto', gap: '1rem' }}>
                        <button type="submit">Update</button>
                        <button type="button" className="delete-button" onClick={handleDelete}>Delete</button>
                    </div>
                </form>
            </div>

            <div>
                {/* Pass customerId to LastChanges */}
                <LastChanges 
                    customerId ={customer?.id} 
                    originalData={customer} 
                    updatedData={updatedData}
                    company_unique_id={customer?.company_unique_id} 
                />
            </div>
        </div>
    );
};

export default UseForm;
