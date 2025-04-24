import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Allow access if user is logged in or if it's a guest
  if (!loading && !user) {
    // For guest access, we'll create a temporary guest user
    const guestUser = {
      id: 'guest',
      username: 'Guest User',
      email: 'guest@example.com'
    };
    return React.cloneElement(children, { isGuest: true, guestUser });
  }

  return children;
};

export default PrivateRoute; 