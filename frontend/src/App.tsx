import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import type { ReactNode } from 'react';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminDoctors from './pages/Admin/AdminDoctors';
import AdminPatients from './pages/Admin/AdminPatients';
import AdminDepartments from './pages/Admin/AdminDepartments';
import AdminAppointments from './pages/Admin/AdminAppointments';
import AdminUsers from './pages/Admin/AdminUsers';
import DoctorDashboard from './pages/Doctor/DoctorsDashboard';
import DoctorAppointments from './pages/Doctor/DoctorsAppointments';
import DoctorPatients from './pages/Doctor/Doctorspatients';
import DoctorRecords from './pages/Doctor/DoctorsRecords';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import PatientDashboard from './pages/Patients/PatientsDashboard';
import PatientAppointments from './pages/Patients/PatientsAppointment';
import PatientRecords from './pages/Patients/PatientsRecords';
import PatientProfile from './pages/Patients/PatientsProfile';
import PatientDoctor from './pages/Patients/PatientsDoctors';
import AdminProfile from './pages/Admin/AdminProfile';
import AdminRecords from './pages/Admin/AdminRecords';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/admin/dashboard"     element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/doctors"       element={<PrivateRoute><AdminDoctors /></PrivateRoute>} />
        <Route path="/admin/patients"      element={<PrivateRoute><AdminPatients /></PrivateRoute>} />
        <Route path="/admin/departments"   element={<PrivateRoute><AdminDepartments /></PrivateRoute>} />
        <Route path="/admin/appointments"  element={<PrivateRoute><AdminAppointments /></PrivateRoute>} />
        <Route path="/admin/records"  element={<PrivateRoute><AdminRecords /></PrivateRoute>} />
        <Route path="/admin/users"         element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/profile"         element={<PrivateRoute><AdminProfile /></PrivateRoute>} />
        <Route path="/doctor/dashboard"    element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/appointments" element={<PrivateRoute><DoctorAppointments /></PrivateRoute>} />
        <Route path="/doctor/patients"     element={<PrivateRoute><DoctorPatients /></PrivateRoute>} />
        <Route path="/doctor/records"      element={<PrivateRoute><DoctorRecords /></PrivateRoute>} />
        <Route path="/doctor/profile"      element={<PrivateRoute><DoctorProfile /></PrivateRoute>} />
        <Route path="/patient/dashboard"    element={<PrivateRoute><PatientDashboard /></PrivateRoute>} />
        <Route path="/patient/appointments" element={<PrivateRoute><PatientAppointments /></PrivateRoute>} />
        <Route path="/patient/book"         element={<PrivateRoute><PatientDoctor /></PrivateRoute>} />
        <Route path="/patient/records"      element={<PrivateRoute><PatientRecords /></PrivateRoute>} />
        <Route path="/patient/profile"      element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;