import React, { useEffect, useState } from 'react';
import './Auth.css';
import HMS from "../../assets/HMS.png";
import { apiCall } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import AnimatedGradientText from '@/components/ui/animated-gradient-text';
import { HMSIcon } from '@/api/icons';

interface SignupResponse {
  access_token: string;
  user: { id: string; name: string; email: string; role: string; dob: string; };
  message: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [role, setRole]           = useState<'patient' | 'doctor'>('patient');
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);

  const [common, setCommon] = useState({
    name: '', email: '', password: '', phone: '', dob: '',
  });

  const [patientForm, setPatientForm] = useState({
    gender: '', address: '', blood_group: 'A+',
  });

  const [doctorForm, setDoctorForm] = useState({
    specialization: '', dept_id: '',
  });

  const handleCommon  = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCommon({ ...common, [e.target.name]: e.target.value });

  const handlePatient = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });

  const handleDoctor  = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });

  useEffect(() => {
    if (role === 'doctor') {
      apiCall<any>('GET', '/departments/all')
        .then(res => { if (res?.departments) setDepartments(res.departments); })
        .catch(err => console.error('Departments fetch failed:', err));
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = role === 'patient'
        ? { ...common, ...patientForm, role }
        : { ...common, ...doctorForm, role, dept_id: Number(doctorForm.dept_id) };

      const res = await apiCall<SignupResponse>('POST', '/auth/signup', payload);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));

      const r = res.user.role?.toLowerCase();
      if (r === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (r === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }

    } catch (err: any) {
      setError(err?.message || 'Signup failed. Try again.');
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
          <AnimatedGradientText className='text-4xl'>Join CarePlus Today</AnimatedGradientText>  
          </h2>
          <p style={{fontSize: "1rem"}}>Modern healthcare management at your fingertips.</p>
        </div>
        <div className="img-pills">
          <span className="img-pill">👨‍⚕️ For Doctors</span>
          <span className="img-pill">🧑‍🤝‍🧑 For Patients</span>
          <span className="img-pill">📋 Easy Setup</span>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-container">
        <div className="auth-box signup-wide">

          <div className="auth-header">
            <div className="auth-header-top">
              <span className="auth-badge" style={{ display: 'flex', gap: 4 }}><HMSIcon/>CarePlus</span>
            </div>
            <AnimatedGradientText className='text-3xl'>Create YourAccount</AnimatedGradientText>
            <p>Fill in the details below to get started</p>
          </div>

          {/* Role Selector */}
          <div className="role-selector">
            {(['patient', 'doctor'] as const).map((r) => (
              <button
                key={r}
                type="button"
                className={`role-btn ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
              >
                {r === 'patient' ? '🧑‍🤝‍🧑 Patient' : '👨‍⚕️ Doctor'}
              </button>
            ))}
          </div>

          {error && <div className="error-box">{error}</div>}

          <form className="auth-form grid-form" onSubmit={handleSubmit}>

            {/* ── Common Fields ── */}
            <div className="form-divider full-width">Basic Info</div>

            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="name" value={common.name} onChange={handleCommon} placeholder="Ali Khan" required />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={common.phone} onChange={handleCommon} placeholder="03001234567" required />
            </div>

            <div className="input-group full-width">
              <label>Email Address</label>
              <input type="email" name="email" value={common.email} onChange={handleCommon} placeholder="name@gmail.com" required />
            </div>

            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={common.dob} onChange={handleCommon} required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={common.password} onChange={handleCommon} placeholder="••••••••" required />
            </div>

            {/* ── Patient Fields ── */}
            {role === 'patient' && (
              <>
                <div className="form-divider full-width">Patient Details</div>

                <div className="input-group">
                  <label>Gender</label>
                  <select name="gender" value={patientForm.gender} onChange={handlePatient} required>
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Blood Group</label>
                  <select name="blood_group" value={patientForm.blood_group} onChange={handlePatient}>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => (
                      <option key={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group full-width">
                  <label>Address</label>
                  <input type="text" name="address" value={patientForm.address} onChange={handlePatient} placeholder="Karachi, Pakistan" />
                </div>
              </>
            )}

            {/* ── Doctor Fields ── */}
            {role === 'doctor' && (
              <>
                <div className="form-divider full-width">Doctor Details</div>

                <div className="input-group">
                  <label>Specialization</label>
                  <input type="text" name="specialization" value={doctorForm.specialization} onChange={handleDoctor} placeholder="e.g. Cardiologist" required />
                </div>

                <div className="input-group">
                  <label>Department</label>
                  <select name="dept_id" value={doctorForm.dept_id} onChange={handleDoctor} required>
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="submit-btn full-width" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>

          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <a href="/login">Sign in</a>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;