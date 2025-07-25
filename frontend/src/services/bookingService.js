
import { apiClient } from "./bookingapi";

export const bookingService={
    //POST/api/bookings- Create a new booking
    createBooking: async(bookingData)=>{
        try{
            const response= await apiClient.post('/api/bookings',
                {
                technician_id: bookingData.technician_id,
                service_id: bookingData.service_id,
                address: bookingData.address,
                scheduled_date: bookingData.scheduled_date,
                scheduled_time: bookingData.scheduled_time,
                booking_service_price: bookingData.booking_service_price,
                 final_price: bookingData.final_price,
                }
            );
            console.log("Create booking response", response);
            const booking= response.data.booking || response.data;
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