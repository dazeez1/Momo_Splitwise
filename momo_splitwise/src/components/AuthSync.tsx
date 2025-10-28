import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const AuthSync: React.FC = () => {
  const { user: authUser } = useAuth();
  const { syncAuthUser } = useApp();

  useEffect(() => {
    if (authUser) {
      syncAuthUser(authUser);
    }
  }, [authUser, syncAuthUser]);

  return null; // This component doesn't render anything
};

export default AuthSync;