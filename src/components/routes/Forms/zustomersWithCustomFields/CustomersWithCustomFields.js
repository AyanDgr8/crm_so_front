// // src/components/routes/CustomersWithCustomFields/CustomersWithCustomFields.js

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./CustomersWithCustomFields.css";

// const CustomersWithCustomFields = () => {
//     const [customers, setCustomers] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Fetch updated customers data
//     useEffect(() => {
//         const fetchCustomersWithCustomFields = async () => {
//             try {
//                 const response = await axios.get('http://localhost:4000/customers-custom');
//                 setCustomers(response.data); 
//             } catch (error) {
//                 console.error('Error fetching customers with custom fields:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchCustomersWithCustomFields();
//     }, []);

//     if (loading) {
//         return <p>Loading...</p>;
//     }

//     return (
//         <div className="customers-with-custom-fields-container">
//             <h2>Customers with Custom Fields</h2>
//             <table className="customers-table">
//                 <thead>
//                     <tr>
//                         {customers.length > 0 &&
//                             Object.keys(customers[0]).map((key) => (
//                                 <th key={key}>{key}</th> // Dynamically render table headers based on the data keys
//                             ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {customers.map((customer, index) => (
//                         <tr key={index}>
//                             {Object.values(customer).map((value, idx) => (
//                                 <td key={idx}>{value}</td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default CustomersWithCustomFields;
