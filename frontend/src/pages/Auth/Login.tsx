import React, { useState } from 'react';
import './Auth.css';
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import HMS from "../../assets/HMS.png";
import { apiCall } from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { HMSIcon } from '@/api/icons';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiCall<LoginResponse>('POST', '/auth/signin', { email, password });

      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));

      const role = res.user.role?.toLowerCase();
      console.log('Role:', role, '| Full user:', res.user);
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }

    } catch (err: any) {
      console.log('fullerror;',err)
      setError(err?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">

      {/* ── Left Panel ── */}
      <div className="img-container">
        <img src={HMS} alt="Hospital Management System" />
        <div className="img-tagline">
          <h2>
          <AnimatedGradientText className='text-4xl'>Your Health,<br />Our Priority</AnimatedGradientText>  
          </h2>
          <p style={{fontSize: "1rem"}}>Trusted care, anytime and anywhere.</p>
        </div>
        <div className="img-pills">
          <span className="img-pill">🏥 Multi-Role Access</span>
          <span className="img-pill">🔒 Secure & Private</span>
          <span className="img-pill">⚡ Real-time Updates</span>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-container">
        <div className="auth-box">

          <div className="auth-header">
            <div className="auth-header-top">
              <span className="auth-badge" style={{ display: 'flex', gap: 4 }}><HMSIcon/>CarePlus</span>
            </div>
            <AnimatedGradientText className='text-4xl'>Welcome Back</AnimatedGradientText>
            <p style={{fontSize: "1.2rem"}}>Sign in to access your dashboard</p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
         

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;