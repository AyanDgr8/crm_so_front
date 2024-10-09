// src/components/routes/Forms/LastChange/LastChanges.js

import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for making API requests
import "./LastChange.css";

const LastChanges = ({ company_unique_id }) => {
  console.log("Received company_unique_id:", company_unique_id);
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    const fetchChangeHistory = async () => {
      if (!company_unique_id) {
        console.error("No company_unique_id provided.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:4000/customers/log-change/${company_unique_id}`);
        const history = response.data.changeHistory || [];
        
        // Filter out irrelevant custom field updates
        const filteredChanges = history.filter(change => {
          if (change.field === "customFields") {
            try {
              const parsedOldValue = JSON.parse(change.old_value);
              const parsedNewValue = JSON.parse(change.new_value);

              // Compare old and new values, only keep actual changes
              return parsedOldValue.some((field, index) => field.fieldValue !== parsedNewValue[index].fieldValue);
            } catch (error) {
              console.error("Error parsing custom fields:", error);
              return false;
            }
          }
          return true;
        });
        
        setChanges(filteredChanges);
      } catch (error) {
        console.error("Error fetching change history:", error);
      }
    };

    fetchChangeHistory();
  }, [company_unique_id]);

  const renderCustomFieldChanges = (oldValue, newValue) => {
    try {
      const oldFields = JSON.parse(oldValue);
      const newFields = JSON.parse(newValue);

      // Only return the fields that have changed
      return oldFields.map((field, index) => {
        if (field.fieldValue !== newFields[index].fieldValue) {
          return (
            <span key={field.fieldId}>
              <strong>{`Field ${field.fieldId}`}</strong> from <em>{field.fieldValue}</em> to <em>{newFields[index].fieldValue}</em>
            </span>
          );
        }
        return null;
      }).filter(Boolean); // Remove null values
    } catch (error) {
      console.error("Error rendering custom field changes:", error);
      return null;
    }
  };

  return (
    <div className="last-changes-container">
      <div className="last-headi">Update History</div>
      {changes.length > 0 ? (
        changes.map((change, index) => (
          <p className="changes-content" key={index}>
            <strong>Changes made on:</strong> {new Date(change.changed_at).toLocaleString()} || 
            {change.field === "customFields" ? (
              renderCustomFieldChanges(change.old_value, change.new_value)
            ) : (
              <>
                updated <strong>{change.field}</strong> from <em>{change.old_value}</em> to <em>{change.new_value}</em>.
              </>
            )}
          </p>
        ))
      ) : (
        <p>No changes detected.</p>
      )}
    </div>
  );
};

export default LastChanges;