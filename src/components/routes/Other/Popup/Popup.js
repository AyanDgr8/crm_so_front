// import React, { useState } from 'react';
// import './Popup.css'; // Import the CSS file for styling

// const Popup = ({ customerName, userId, onClose }) => {
//     const [visible, setVisible] = useState(true);

//     // Function to handle snooze
//     const handleSnooze = () => {
//         setVisible(false);
//         setTimeout(() => {
//             setVisible(true);
//         }, 5 * 60 * 1000); // Snooze for 5 minutes (5 minutes * 60 seconds * 1000 milliseconds)
//     };

//     // Function to handle the okay button
//     const handleOkay = () => {
//         setVisible(false);
//         if (onClose) {
//             onClose(); // Optional callback if you want to execute something when the popup closes
//         }
//     };

//     if (!visible) return null; // Don't render anything if the popup is not visible

//     return (
//         <div className="popup-overlay">
//             <div className="popup-content">
//                 <h2>Please Call !!</h2>
//                 <p>Customer: Ayan Khan</p>
//                 <p>User ID: S0_101</p>
//                 <div className="popup-buttons">
//                     <button onClick={handleSnooze}>Snooze</button>
//                     <button onClick={handleOkay}>Okay</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Popup;
