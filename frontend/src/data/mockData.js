// mockData.js - Sample booking data for demonstration
export const mockBookings = [
  {
    _id: '1',
    booking_id: 'BK172345678ABC',
    scheduled_date: '2024-12-15',
    scheduled_time: '14:30',
    address: '123 Main Street, Downtown, City - 12345',
    booking_service_price: 150,
    negotiated_price: 130,
    final_price: 130,
    booking_status: 'confirmed',
    created_at: '2024-12-10T10:00:00Z',
    technician_id: {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      profession: 'Electrician',
      rating: 4.8,
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    service_id: {
      name: 'Electrical Repair',
      description: 'Complete electrical repair and maintenance service',
      category: 'Electrical',
      price: 150
    },
    client_id: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1987654321'
    }
  },
  {
    _id: '2',
    booking_id: 'BK172345679DEF',
    scheduled_date: '2024-12-20',
    scheduled_time: '10:00',
    address: '456 Oak Avenue, Suburbs, City - 67890',
    booking_service_price: 200,
    negotiated_price: null,
    final_price: 200,
    booking_status: 'pending',
    created_at: '2024-12-11T15:30:00Z',
    technician_id: {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1122334455',
      profession: 'Plumber',
      rating: 4.9,
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b332c2ef?w=150&h=150&fit=crop&crop=face'
    },
    service_id: {
      name: 'Plumbing Service',
      description: 'Professional plumbing installation and repair',
      category: 'Plumbing',
      price: 200
    },
    client_id: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1987654321'
    }
  },
  {
    _id: '3',
    booking_id: 'BK172345680GHI',
    scheduled_date: '2024-12-08',
    scheduled_time: '16:00',
    address: '789 Pine Street, Uptown, City - 11111',
    booking_service_price: 100,
    negotiated_price: null,
    final_price: 100,
    booking_status: 'completed',
    created_at: '2024-12-05T09:15:00Z',
    technician_id: {
      name: 'Mike Brown',
      email: 'mike@example.com',
      phone: '+1555666777',
      profession: 'AC Repair',
      rating: 4.7,
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    service_id: {
      name: 'AC Maintenance',
      description: 'Air conditioning cleaning and maintenance',
      category: 'HVAC',
      price: 100
    },
    client_id: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1987654321'
    }
  }
]; 


