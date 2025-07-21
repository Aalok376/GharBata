import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatBox from '../components/chatBox';

const ChatPage = ({ currentUser }) => {
  const { bookingId } = useParams();
  const [userId, setUserId] = useState(null);
  const [technicianId, setTechnicianId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (currentUser?._id) {
      setUserId(currentUser._id);
    } else if (storedUser?._id) {
      setUserId(storedUser._id);
    } else {
      setUserId("6863eb9cee0bfd70e6beab0d"); // fallback id for testing
    }

    // TODO: Replace hardcoded technicianId with API fetch if needed
    setTechnicianId("6863e9a2ee0bfd70e6beaaff");

    setLoading(false);
  }, [currentUser]);

  console.log('ChatPage:', { bookingId, userId, technicianId });

  if (loading) {
    return <div>Loading chat data...</div>;
  }

  if (!userId || !bookingId || !technicianId) {
    return <div>Missing required data to load chat.</div>;
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
