import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TimeEntries: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard since all time entry functionality is there
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default TimeEntries;