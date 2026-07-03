"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'deekshacandles' && password === 'deekshacandles@123#') {
      localStorage.setItem('deeksha_admin_logged_in', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0b1a11' }}>
      <Header />
      
      <main style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#FAF8F5' }}>
        <div style={{ 
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(25, 48, 36, 0.35)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(197, 168, 128, 0.25)',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.25em', color: 'var(--accent)', textTransform: 'uppercase' }}>
              Deeksha Candles
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '400', margin: '8px 0 0 0', fontFamily: 'var(--font-serif)' }}>
              Studio Portal
            </h1>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: 'rgba(197, 74, 74, 0.15)', 
              border: '1px solid rgba(197, 74, 74, 0.3)',
              color: '#ff8888',
              fontSize: '13px',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em', color: 'rgba(250, 248, 245, 0.6)', textTransform: 'uppercase' }}>
                Username
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username"
                style={{ 
                  background: 'rgba(250, 248, 245, 0.04)', 
                  border: '1px solid rgba(250, 248, 245, 0.1)', 
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em', color: 'rgba(250, 248, 245, 0.6)', textTransform: 'uppercase' }}>
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                style={{ 
                  background: 'rgba(250, 248, 245, 0.04)', 
                  border: '1px solid rgba(250, 248, 245, 0.1)', 
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }} 
              />
            </div>

            <button 
              type="submit"
              style={{ 
                background: 'var(--accent)', 
                color: '#0b1a11', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '14px',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '10px'
              }}
            >
              Sign In
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
