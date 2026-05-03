interface User {
  id: number;
  name: string;
  email: string;
  dob: Date;
  role: 'patient' | 'doctor' | 'admin';
}

interface EditDoctor{
  name: string;
  email: string;
  phone: string;
  dob: Date;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  deptName: string;
  phone: string;
  dob: Date;
  specialization: string;
}

interface Patient {
  id: number;
  user_id: number;
  name: string;
  email: string;
  gender: string;
  bloodGroup: string;
  address: string;
  phone: string;
  dob: string;
}

interface Department {
  id: number;
  name: string;
}

interface Appointment {
  appointmentId: number;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  appointmentDateTime: string;
  status: string;
  reason: string;
  patient_id: number;
  doctor_id: number;
}

interface RecordForm {
  patientId:     number;
  recordId:     number;
  appointmentId: number;
  doctorId:      number;
  diagnosis:     string;
  prescription:  string;
}
