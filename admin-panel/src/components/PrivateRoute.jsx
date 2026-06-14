import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
    const { currentUser } = useAuth();

    const ADMIN_UID = 'MGJvxAVghfZZpaiz2ElhDq6dTXp1';

    if (!currentUser || currentUser.uid !== ADMIN_UID) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
