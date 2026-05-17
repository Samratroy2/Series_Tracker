// frontend\src\pages\Dashboard.js
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const isGuest = location.state?.guest;

  return (
    <div>
      <h1>Welcome {isGuest ? 'Guest' : location.state?.user?.name}</h1>
      {isGuest && <p>Note: You have limited access as a guest.</p>}
    </div>
  );
};
