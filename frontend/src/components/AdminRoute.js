import React from 'react';

import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({
  children,
}) => {
  const { user } = useAuth();

  if (
    user?.role === 'admin'
  ) {
    return children;
  }

  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'red',
        fontSize: '1.2rem',
        fontWeight: 'bold',
      }}
    >
      ⚠️ You do not have
      permission to access
      this page.
    </div>
  );
};

export default AdminRoute;