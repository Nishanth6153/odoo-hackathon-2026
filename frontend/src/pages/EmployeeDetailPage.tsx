import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeService } from '../services/employee.service';
import { EmployeeForm, type EmployeeFormData } from '../components/employees/EmployeeForm';
import { TagListInput } from '../components/employees/TagListInput';
import type { EmployeeProfile } from '../types/employee.types';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode toggle
  const [isEditing, setIsEditing] = useState(false);
  const [editApiError, setEditApiError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [about, setAbout] = useState('');

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEmployeeById(id);
      setEmployee(data);
      setSkills(data.skills || []);
      setInterests(data.interests || []);
      setCertifications(data.certifications || []);
      setAbout(data.about || '');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load employee profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdate = async (formData: EmployeeFormData) => {
    if (!id) return;
    try {
      setEditApiError(null);
      const updated = await employeeService.updateEmployee(id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        status: formData.status,
        about,
        skills,
        interests,
        certifications,
      });

      setEmployee(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditApiError(err.message);
      } else {
        setEditApiError('Failed to update employee details.');
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading employee details...</div>;
  }

  if (error || !employee) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
        <h2 style={{ color: '#cc0000', marginTop: 0 }}>Employee Not Found</h2>
        <p>{error || 'The requested employee could not be found.'}</p>
        <button
          onClick={() => navigate('/admin/employees')}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Return to Employees Directory
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={() => navigate('/admin/employees')}
        style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
      >
        ← Back to Employees Directory
      </button>

      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '2rem', backgroundColor: '#fff' }}>
        {/* Header section with avatar, name, status, and edit button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {employee.profileImage ? (
              <img
                src={employee.profileImage}
                alt={employee.name}
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#0066cc',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(employee.name)}
              </div>
            )}

            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{employee.name}</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '1rem' }}>
                {employee.designation || 'No Designation'} • {employee.department || 'No Department'}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  backgroundColor: employee.status === 'ACTIVE' ? '#e6f4ea' : '#feefe3',
                  color: employee.status === 'ACTIVE' ? '#137333' : '#b06000',
                }}
              >
                {employee.status || 'ACTIVE'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isEditing ? '#666' : '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit mode vs View mode */}
        {isEditing ? (
          <div style={{ backgroundColor: '#fafafa', padding: '1.5rem', borderRadius: '6px' }}>
            <h3 style={{ marginTop: 0 }}>Edit Employee Information</h3>
            <EmployeeForm
              initialValues={employee}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              submitButtonText="Update Employee"
              apiError={editApiError}
            />

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
              <h4>Additional Profile Fields</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>About</label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <TagListInput label="Skills" items={skills} onChange={setSkills} placeholder="e.g. React, Python" />
              <TagListInput label="Interests & Hobbies" items={interests} onChange={setInterests} placeholder="e.g. Reading, Cycling" />
              <TagListInput label="Certifications" items={certifications} onChange={setCertifications} placeholder="e.g. AWS Certified" />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Left Info Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3>Primary Information</h3>
              <div>
                <strong>Employee ID / ID:</strong> <span style={{ color: '#444' }}>{employee.id}</span>
              </div>
              {employee.loginId && (
                <div>
                  <strong>Login ID:</strong> <span style={{ color: '#444' }}>{employee.loginId}</span>
                </div>
              )}
              <div>
                <strong>Email:</strong> <span style={{ color: '#444' }}>{employee.email}</span>
              </div>
              <div>
                <strong>Phone:</strong> <span style={{ color: '#444' }}>{employee.phone || 'N/A'}</span>
              </div>
              <div>
                <strong>Joining Date:</strong> <span style={{ color: '#444' }}>{employee.joiningDate || 'N/A'}</span>
              </div>
            </div>

            {/* Right Info Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3>Profile Details</h3>
              <div>
                <strong>About:</strong>
                <p style={{ margin: '0.25rem 0', color: '#555', whiteSpace: 'pre-wrap' }}>
                  {employee.about || 'No description provided.'}
                </p>
              </div>

              <div>
                <strong>Skills:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {employee.skills && employee.skills.length > 0 ? (
                    employee.skills.map((skill, idx) => (
                      <span key={idx} style={{ background: '#eef2f6', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>None listed</span>
                  )}
                </div>
              </div>

              <div>
                <strong>Interests & Hobbies:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {employee.interests && employee.interests.length > 0 ? (
                    employee.interests.map((interest, idx) => (
                      <span key={idx} style={{ background: '#eef2f6', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>None listed</span>
                  )}
                </div>
              </div>

              <div>
                <strong>Certifications:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {employee.certifications && employee.certifications.length > 0 ? (
                    employee.certifications.map((cert, idx) => (
                      <span key={idx} style={{ background: '#eef2f6', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                        {cert}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>None listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
