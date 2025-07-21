
import { apiClient } from "./bookingapi";

//Helper: Attach auth headers
const getAuthHeaders=()=>{
    const token = localStorage.getItem("token");
    return token ? {Authorization: `Bearer ${token}`} : {};
};

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
                booking_service_price: bookingData.booking_service_price
                },
                {
                    headers: getAuthHeaders()
                }
            );
            return response.data;
        } catch (error){
            console.error('Create booking error:', error);
            throw new Error(error.response?.data?.message || error.message ||  'Failed to create booking');
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
           const response= await apiClient.get(url,{
            headers: getAuthHeaders()
           });
           return response.data; 
        } catch (error) {
            console.error("Get bookings error:",error);
            throw new Error(error.response?.data?.message || error.message ||  'Failed to fetch bookings');
        }
       
    },
    // GET /api/bookings/:id -Get single booking details
    getBookingById: async(id)=>{
        try {
            const response= await apiClient.get(`/api/bookings/${id}`,{
                headers: getAuthHeaders()
            });
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
                cancellation_reason:  cancellationReason},
                {
                    headers: getAuthHeaders()
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