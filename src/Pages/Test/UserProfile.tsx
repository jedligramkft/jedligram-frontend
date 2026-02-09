import { useParams, useNavigate } from 'react-router-dom';

const UserProfile = () => {
  // 1. Grab the ID from the URL
  // This matches the ":id" part of your route path="/user/:id"
  const { id } = useParams(); 
  
  const navigate = useNavigate();

  return (
    <div>
      <h1>User Profile</h1>
      
      {/* 2. Display the dynamic data */}
      <div style={styles.card}>
        <p>Currently viewing User ID:</p>
        <h2 style={styles.highlight}>{id}</h2>
      </div>

      <p>
        In a real app, you would use this ID ({id}) to fetch 
        user details from your API or database.
      </p>

      {/* 3. Button to go back */}
      <button onClick={() => navigate(-1)} style={styles.button}>
        Go Back
      </button>
    </div>
  );
};

// Simple styles for demonstration
const styles = {
  container: { padding: '20px', textAlign: 'center' },
  card: { 
    border: '1px solid #ccc', 
    borderRadius: '8px', 
    padding: '20px', 
    margin: '20px 0',
    backgroundColor: '#f9f9f9'
  },
  highlight: { color: '#007bff', fontSize: '2em', margin: '10px 0' },
  button: { padding: '10px 20px', fontSize: '16px' }
};

export default UserProfile;