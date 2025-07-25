
const BASE_URL= import.meta.env.VITE_BASE_URL ||'http://localhost:5000';
// helper to get auth token

export const apiClient={
    get: async (url) => {
        const response= await fetch(`${BASE_URL}${url}`,{
            method: 'GET',
            headers:{
                "Content-Type": "application/json",
            },
            credentials: 'include' // send cookies like accessToken
        });
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    },
    post: async (url,data) => {
        const response= await fetch(`${BASE_URL}${url}`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
               
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
        
    },
    put: async (url,data={}) => {
        const response= await fetch(`${BASE_URL}${url}`,{
            method: 'PUT',
            headers:{
                'Content-Type':'application/json',
                
            },
            credentials: 'include',
            body: JSON.stringify(data),

        });
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
        
    }
};
// bookingService using apiClient
export const bookingService = {
  createBooking: (bookingData) => apiClient.post('/api/bookings', bookingData),
  getClientBookings: () => apiClient.get('/api/bookings/client'),
  getBookingById: (id) => apiClient.get(`/api/bookings/${id}`),
  cancelBooking: (id) => apiClient.put(`/api/bookings/${id}/cancel`),
};