import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // For URL param (bookingId)
import ChatBox from '../components/chatBox';

const ChatPage = ({ currentUser }) => {
  const { bookingId } = useParams(); // /chat/:bookingId
  const [userId, setUserId] = useState(null);
  const [technicianId, setTechnicianId] = useState(null); // Replace with actual tech fetch
  // ✅ Hardcoded constants for testing
  
  setUserId("6863eb9cee0bfd70e6beab0d");
  setTechnicianId("6863e9a2ee0bfd70e6beaaff");
  // setBookingId("6863f570d9cd398ae0801355");
  
  useEffect(() => {
    // Option 1: Get userId from props
    if (currentUser) {
      setUserId(currentUser._id);
    } else {
      // Option 2: From localStorage/session
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUserId(storedUser?._id);
    }

    // TODO: Fetch technicianId from booking or pass as prop
    setTechnicianId("REPLACE_WITH_TECHNICIAN_ID"); // <- hardcoded or fetched via API
  }, [currentUser]);

  if (!userId || !bookingId || !technicianId) {
    return <div>Loading chat...</div>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2>Booking Chat</h2>
      </header>

      <main style={styles.chatContainer}>
        <ChatBox bookingId={bookingId} userId={userId} technicianId={technicianId} />
      </main>
    </div>
  );
};

export default ChatPage;

// 🧑‍🎨 Basic inline styles
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f4f4f4',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
  },
  header: {
    marginBottom: '1rem',
  },
  chatContainer: {
    width: '100%',
    maxWidth: '700px',
  },
};
