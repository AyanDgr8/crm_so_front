// src/components/routes/Forms/ZForm.js

import React from "react";
import { Routes, Route, useParams } from 'react-router-dom';
import ViewForm from "./ViewForm/ViewForm";
import UseForm from "./UseForm/UseForm";
import ListForm from "./ListForm/ListForm";
import LastChanges from "./LastChange/LastChange";
import Login from "../Sign/Login/Login";
import Register from "../Sign/Register/Register";
import Logout from "../Sign/Logout/Logout";
import CustomForm from "./CustomForm/CustomForm";

// import CustomersWithCustomFields from "./CustomersWithCustomFields/CustomersWithCustomFields";

const ZForm = () => {
    return (
        <Routes>
            {/* Route to the ListForm component */}
            <Route path="/customers" element={<ListForm />} />

            {/* Route to the CustomForm component */}
            <Route path="/customers/custom-fields" element={<CustomForm />} />
            
            {/* Route to View Form */}
            <Route path="/customers/search/" element={<ViewForm />} />

            {/* Route to log changes; passing the customerId as a prop */}
            <Route path="/customers/log-change/:company_unique_id" element={<LastChangeWrapper />} />

            {/* Route to Use Form */}
            <Route path="/customers/use/:id" element={<UseForm />} />

            {/* Route to insert values */}
            <Route path="/custom-values/:id" element={<UseForm />} />

            {/* Route to insert values */}
            <Route path="/customer/:id/update-custom-values" element={<UseForm />} />

            {/* Route to the Register component */}
            <Route path="/register" element={<Register />} />

            {/* Route to the Login component */}
            <Route path="/login" element={<Login />} />

            {/* Route to the Logout component */}
            <Route path="/logout" element={<Logout />} />

            {/* Route to the Logout component */}
            <Route path="/delete/:id" element={<UseForm />} />


        </Routes>
    );
};

// Wrapper component to extract the customerId from the URL and pass it to LastChanges
const LastChangeWrapper = () => {
    const { id } = useParams(); // Get customerId from the URL

    // Debugging log
    console.log("Customer ID from URL:", id);

    return <LastChanges company_unique_id={id} />;
};

export default ZForm;