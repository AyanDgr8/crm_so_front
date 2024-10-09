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
    });

    const [customFields, setCustomFields] = useState([]);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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

        if (!validatePhoneNumber(formData.phone_no)) {
            alert("Phone number must be 10 digits long and start with a digit from 5 to 9.");
            return;
        }

        if (!validateEmail(formData.email_id)) {
            alert("Please enter a valid email address.");
            return;
        }

        const updatedFormData = {
            ...formData,
        };

        const changes = [];
        for (const key in updatedFormData) {
            if (updatedFormData[key] !== customer[key]) {
                changes.push({
                    field: key,
                    old_value: customer[key] || null,
                    new_value: updatedFormData[key] || null,
                });
            }
        }

        if (changes.length === 0) {
            alert("No changes made.");
            return;
        }

        try {
            Object.keys(updatedFormData).forEach((key) => {
                if (updatedFormData[key] === undefined) {
                    updatedFormData[key] = null;
                }
            });

            // Update customer
            await axios.put(`http://localhost:4000/customers/use/${customer.id}`, updatedFormData);

            // Log changes to customer_change_log
            await axios.post(`http://localhost:4000/customers/log-change`, {
                customerId: customer.id,
                C_unique_id: customer.C_unique_id,
                changes,
            });

            navigate("/customers");
        } catch (error) {
            console.error("Error updating customer:", error);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this record?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:4000/customers/delete/${customer.id}`);
            alert("Record deleted successfully.");
            navigate("/customers");
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("Failed to delete the record.");
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
                            <option value="Customer">Customer</option>
                            <option value="Dealer">Dealer</option>
                            <option value="Distributor">Distributor</option>
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
                    {customFields.map((field) => (
                    <div className="label-input" key={field.field_name}>
                        <label>{field.field_name}</label>
                        {field.field_type === 'dropdown' ? (
                            <select
                                name={field.field_name}
                                value={formData[field.field_name] || ''}
                                onChange={handleInputChange}
                            >
                            {/* Check if the dropdown options are valid JSON */}
                            {(() => {
                                try {
                                    console.log("Dropdown options for", field.field_name, field.dropdown_options);   
                                    let options;
                                    // Check if dropdown_options is an array
                                    if (Array.isArray(field.dropdown_options)) {
                                        options = field.dropdown_options;
                                    } else if (typeof field.dropdown_options === 'string') {
                                        // If it's a string, split by commas
                                        if (field.dropdown_options.startsWith('[') && field.dropdown_options.endsWith(']')) {
                                            // Try parsing it if it's a JSON string
                                            options = JSON.parse(field.dropdown_options);
                                        } else {
                                            // Otherwise, split the string by commas
                                            options = field.dropdown_options.split(',');
                                        }
                                    } else {
                                        throw new Error('Invalid dropdown options format');
                                    }
                                    // Map through the options to render them
                                    return options.map((option, idx) => (
                                        <option key={idx} value={option.trim()}>{option.trim()}</option>
                                    ));
                                } catch (error) {
                                    console.error(`Invalid JSON in dropdown options for field: ${field.field_name}`, error);
                                    return <option value="">Invalid options</option>;
                                }
                            })()}
                        </select>
                        ) : (
                            <input
                                type={field.field_type === 'number' ? 'number' : 'text'}
                                name={field.field_name}
                                value={formData[field.field_name] || ''}
                                onChange={handleInputChange}
                            />
                        )}
                    </div>
                ))}


                {/* Update and Delete buttons at the bottom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', margin : 'auto', gap : '1rem' }}>
                        <button type="submit">Update</button>
                        <button type="button" className="delete-button" onClick={handleDelete}>Delete</button>
                    </div>
                </form>
            </div>

            <div>
                {/* Pass customerId to LastChanges */}
                <LastChanges customerId={customer.id} originalData={customer} updatedData={formData} />
            </div>
        </div>
    );
};

export default UseForm;
