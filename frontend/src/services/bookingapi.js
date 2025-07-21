const BASE_URL= import.meta.env.VITE_BASE_URL ||'http://localhost:5000';
// helper to get auth token
const getAuthToken=()=>{
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}
export const apiClient={
    get: async (url) => {
        const response= await fetch(`${BASE_URL}${url}`,{
            method: 'GET',
            headers:{
                "Content-Type": "application/json",
                'Authorization': `Bearer ${getAuthToken()}`,

            },
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
                'Authorization': `Bearer ${getAuthToken()}`,
            },
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
                'Authorization':`Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify(data),

        });
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
        
    }
};