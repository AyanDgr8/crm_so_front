// src/components/routes/Forms/CustomForm/CustomForm.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "./CustomForm.css";

const CustomForm = () => {
    const [formFields, setFormFields] = useState([{ fieldName: "", fieldType: "text", dropdownOptions: [], dateTimeValue: ""  }]);
    const navigate = useNavigate(); 
    const [submittedFields, setSubmittedFields] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');

    // Function to fetch user data
    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token'); 
            const userResponse = await axios.get('http://localhost:4000/current-user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(userResponse.data);

            // Check if the user is an admin
            if (userResponse.data.role === 'Admin') {
                setIsAdmin(true); 
                console.log("User is an admin.");
            } else {
                console.log("User is not an admin.");
            }
        } catch (error) {
            setError('Failed to fetch user data.');
            console.error('Error fetching user data:', error);
        }
    };

    // Call fetchUser when the component mounts
    useEffect(() => {
        fetchUser();
    }, []);

    // Handle form field changes
    const handleFieldChange = (index, event) => {
        const updatedFields = [...formFields];
        const { name, value } = event.target;
    
        if (name === 'fieldName' && !/^[a-zA-Z0-9_]+$/.test(value)) {
            alert('Field names can only contain letters, numbers, and underscores.');
            return;
        }
    
        updatedFields[index][name] = value;
        setFormFields(updatedFields);
    };

    // Handle adding dropdown options
    const handleAddDropdownOption = (index) => {
        const updatedFields = [...formFields];
        updatedFields[index].dropdownOptions.push(""); // Add an empty option
        setFormFields(updatedFields);
    };

    // Handle dropdown option changes
    const handleDropdownOptionChange = (index, optionIndex, event) => {
        const updatedFields = [...formFields];
        updatedFields[index].dropdownOptions[optionIndex] = event.target.value;
        setFormFields(updatedFields);
    };

    // Add a new form field
    const handleAddField = () => {
        if (!isAdmin) {
            alert("You do not have permission to add fields.");
            return;
        }
        setFormFields([...formFields, { fieldName: "", fieldType: "text", dropdownOptions: [] }]);
    };

    // Remove a form field
    const handleRemoveField = (index) => {
        const updatedFields = [...formFields];
        updatedFields.splice(index, 1);
        setFormFields(updatedFields);
    };

    // Submit form data (updating the "customers" table)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate field names and dropdown options
        const allFieldsValid = formFields.every(field => {
            if (field.fieldType === 'dropdown') {
                return field.fieldName.trim() !== "" && field.dropdownOptions.every(option => option.trim() !== "");
            }
            return field.fieldName.trim() !== "";
        });

        if (!allFieldsValid) {
            alert("All fields must have a name and valid options before submitting!");
            return;
        }
    
        // Map the fields correctly before sending
        const fieldsToSubmit = formFields.map(field => {
            let customFieldValue;
    
            // Determine the default value based on the field type
            switch (field.fieldType) {
                case 'text':
                    customFieldValue = "Change Text ";
                    break;
                case 'dropdown':
                    customFieldValue = field.dropdownOptions[0] || ""; // First option or empty if none
                    break;
                case 'dropdown_checkbox':
                    customFieldValue = field.dropdownOptions.join(", "); // Join options for checkbox
                    break;
                case 'datetime':
                    customFieldValue = "2024-01-01T00:00"; // ISO format for date & time
                    break;
                default:
                    customFieldValue = ""; // Fallback
            }
    
            return {
                fieldName: field.fieldName, 
                fieldType: field.fieldType,
                dropdownOptions: field.fieldType === 'dropdown' ? field.dropdownOptions : undefined,
                custom_field_value: customFieldValue, // Include the default value
            };
        }).filter(field => field.fieldName);
    
        console.log("Fields to submit:", fieldsToSubmit);
    
        try {
            setLoading(true); 
            const token = localStorage.getItem('token');
            console.log('Token:', token);
            const response = await axios.post(
                'http://localhost:4000/custom-fields',
                { formFields: fieldsToSubmit }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    },
                }
            );

            console.log('Response:', response.data); 
            console.log('Request Headers:', response.config.headers); 
        
            // Check for success in response
            if (response.data && response.data.success) {
                alert("Custom fields added successfully!");
                setSubmittedFields(fieldsToSubmit); 
                setFormFields([{ fieldName: "", fieldType: "text", dropdownOptions: [] }]);
                navigate("/customers");
            } else {
                alert("Failed to add custom fields: " + response.data.message || "Unknown error");
            }
        } catch (error) {
            alert("Error while adding fields: " + (error.response?.data?.message || "Please try again."));
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="custom-form-container">
            <h2 className="custom-headi">Custom Form</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit} className="custom-form">
                {formFields.map((field, index) => (
                    <div key={index} className="form-field">
                        <input
                            type="text"
                            name="fieldName"
                            className="fieldname"
                            value={field.fieldName}
                            placeholder="Field Name"
                            onChange={(e) => handleFieldChange(index, e)}
                            required
                        />
                        <select
                            name="fieldType"
                            value={field.fieldType}
                            onChange={(e) => handleFieldChange(index, e)}
                        >
                            <option value="text">Text</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="dropdown_checkbox">Dropdown Checkbox</option> 
                            <option value="datetime">Date & Time</option>
                        </select>

                        {field.fieldType === "dropdown"  && (
                            <div>
                                {field.dropdownOptions.map((option, optionIndex) => (
                                    <div key={optionIndex} className="dropdown-option">
                                        <input
                                            type="text"
                                            value={option}
                                            placeholder={`Option ${optionIndex + 1}`}
                                            onChange={(e) => handleDropdownOptionChange(index, optionIndex, e)}
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddDropdownOption(index)} className="add-option-btn">
                                    Add More Options
                                </button>
                            </div>
                        )}
                        
                        {field.fieldType === "dropdown_checkbox" && (
                            <div>
                                {field.dropdownOptions.map((option, optionIndex) => (
                                    <div key={optionIndex} className="dropdown-option">
                                        <input
                                            type="text"
                                            value={option}
                                            placeholder={`Option ${optionIndex + 1}`}
                                            onChange={(e) => handleDropdownOptionChange(index, optionIndex, e)}
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddDropdownOption(index)} className="add-option-btn">
                                    Add More Options
                                </button>
                            </div>
                        )}
                        <button type="button" onClick={() => handleRemoveField(index)} className="remove-field-btn">
                            Remove
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddField} className="add-field-btnn">
                    Add Field
                </button>
                <button type="submit" className="submit-form-btn" disabled={loading}>
                    Submit
                </button>
            </form>
        </div>
    );
};

export default CustomForm;
