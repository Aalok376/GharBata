import React from "react";
const NegotiationModal=({
    booking,
    negotiationPrice,
    setNegotiationPrice,
    onSubmit,
    onClose
})=>{
    return (
        // Full screen overlay with centered modal
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

            {/* modal content box */}
            <div className="bg-white rounded-lg p-6 w-full max-w-md">

                {/* Modal title */}
                <h3 className="text-lg font-semibold mb-4">Negotiate Price</h3>

                {/* Negotiation form */}
                <div className="mb-4">

                      {/* Show current price */}
                      <p className="text-sm text-gray-600 mb-2">Current Price: ${booking?.final_price}</p>

                      {/* Input label */}
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Offer</label>

                      {/*Input field for user's negotiation offer */}
                      <input 
                      type="number"
                       value={negotiationPrice}
                      onChange={(e)=> setNegotiationPrice(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your offer"/>                    
                </div>

                {/* Action buttons */}
                <div className="flex space-x-4">

                    {/* Cancel button */}
                    <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                        Cancel
                    </button>

                    {/* Submit offer button */}
                    <button 
                    onClick={onSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Send Offer
                    </button>
                </div>
            </div>
        </div>

    );
};

export default NegotiationModal;