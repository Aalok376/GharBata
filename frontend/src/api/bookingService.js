
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const apiClient = {
  get: async (url) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
     },

     post: async (url, data) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

   put: async (url, data = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};
    
     
export const bookingService={
    //POST/api/bookings- Create a new booking
    createBooking: async(bookingData)=>{
        try{
            const response= await apiClient.post('/api/bookings',
                {
                 fname: bookingData.fname,
        lname: bookingData.lname,
        email: bookingData.email,
        phoneNumber: bookingData.phoneNumber,
        streetAddress: bookingData.streetAddress,
        apartMent: bookingData.apartMent,
        cityAddress: bookingData.cityAddress,
        emergencyContactName: bookingData.emergencyContactName,
        emergencyContactPhone: bookingData.emergencyContactPhone,
        scheduled_date: bookingData.scheduled_date,
        scheduled_time: bookingData.scheduled_time,
        specialInstructions: bookingData.specialInstructions,
        contactPreference: bookingData.contactPreference,
        latitude: bookingData.latitude,
        longitude: bookingData.longitude,
         service: bookingData.service,
        technician_id: bookingData.technician_id

                }
            );
            console.log("Create booking response", response);
            const booking= response.data?.booking || response.data;
            // Initiate eSewa payment using booking details
            const paymentResponse= await apiClient.post('/api/esewa/initiate',{
                amount:booking.final_price,
                bookingId: booking._id,
                productName: booking.service_id?.name || "Service payment",
            });
            // Redirect to eSewa
            if(paymentResponse.data.redirectUrl){
                window.location.href= paymentResponse.data.redirectUrl;
            }else{
                throw new Error("Failed to get eSewa redirect URL");
            }
            return booking;
        } catch (error){
            console.error('Create booking or payment initiation error:', error);
            throw new Error(error.response?.data?.message || error.message ||  'Failed to create booking or redirect to payment');
        }
    },

    // Get/api/bookings- Get client's bookings with pagination and filtering
    getClientBookings: async(params= {})=>{
        try {
           const queryParams= new URLSearchParams();
           if(params.status) queryParams.append('status',params.status);
           if(params.page) queryParams.append('page',params.page);
           if(params.limit) queryParams.append('limit',params.limit);

           const url= `/api/bookings${queryParams.toString() ? '?' + queryParams.toString(): ''}`;
           const response= await apiClient.get(url);
         
           return response.data; 
        } catch (error) {
            console.error("Get bookings error:",error);
            throw new Error(error.response?.data?.message || error.message ||  'Failed to fetch bookings');
        }
       
    },
    // GET /api/bookings/:id -Get single booking details
    getBookingById: async(id)=>{
        try {
            const response= await apiClient.get(`/api/bookings/${id}`);
           
            return response.data;
        } catch (error) {
            console.error('Get booking by iD error:',error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch booking details');
            
        }
    },
    // PUT /api/bookings/:id/cancel- Cancel booking
    cancelBooking:async(id, cancellationReason='')=>{
        try {
            const response= await apiClient.put(`/api/bookings/${id}/cancel`,{
                cancellation_reason:  cancellationReason
            }
            );
            return response.data;
        } catch (error) {
            console.error('Cancel booking error:',error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to cancel booking');
            
        }
       
    }
};
// booking status constants
export const BOOKING_STATUS={
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled'
};