import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import { Home, Search, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '5rem 1.5rem', maxWidth: '540px', margin: '0 auto' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--danger-light)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}
      >
        <AlertCircle size={36} />
      </div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--slate-500)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Button
          variant="primary"
          size="md"
          icon={Home}
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
        <Button
          variant="outline"
          size="md"
          icon={Search}
          onClick={() => navigate('/directory')}
        >
          Explore Directory
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
