import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { employeeService } from '../services/employee.service';
import { EmployeeForm, type EmployeeFormData } from '../components/employees/EmployeeForm';
import { TagListInput } from '../components/employees/TagListInput';
import type { EmployeeProfile } from '../types/employee.types';

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const canViewSalary = user?.role === 'ADMIN' || user?.role === 'HR';

  return (
    <>
      <Navbar portalTitle="Administration" />

      <main className="page-container" style={{ maxWidth: '960px' }}>
        <button
          onClick={() => navigate('/admin/employees')}
          className="back-link"
        >
          ← Back to Employees Directory
        </button>

        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <span>Loading employee profile...</span>
          </div>
        ) : error || !employee ? (
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-title">Employee Not Found</div>
            <p className="empty-state-desc">{error || 'The requested employee profile does not exist.'}</p>
            <button
              onClick={() => navigate('/admin/employees')}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 'var(--space-4)' }}
            >
              Return to Directory
            </button>
          </div>
        ) : (
          <div className="card card-padding">
            {/* Header section with avatar, name, status, and edit/salary buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: 'var(--space-6)',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap',
                gap: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                {employee.profileImage ? (
                  <img
                    src={employee.profileImage}
                    alt={employee.name}
                    style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-primary-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-xl)',
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(employee.name)}
                  </div>
                )}

                <div>
                  <h1 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>{employee.name}</h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    {employee.designation || 'Staff'} • {employee.department || 'General'}
                  </p>
                  <span
                    className={`badge ${employee.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}
                    style={{ marginTop: 'var(--space-2)' }}
                  >
                    <span className="badge-dot" />
                    {employee.status || 'ACTIVE'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {canViewSalary && (
                  <button
                    onClick={() => navigate(`/admin/employees/${id}/salary`)}
                    className="btn btn-success"
                  >
                    💼 Salary Structure
                  </button>
                )}

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Edit mode vs View mode */}
            {isEditing ? (
              <div>
                <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>Edit Employee Information</h3>
                <EmployeeForm
                  initialValues={employee}
                  onSubmit={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                  submitButtonText="Save Changes"
                  apiError={editApiError}
                />

                <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
                  <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    Additional Profile Fields
                  </h4>

                  <div className="form-group">
                    <label className="form-label">About / Biography</label>
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={3}
                      className="form-textarea"
                      placeholder="Write a brief bio..."
                    />
                  </div>

                  <TagListInput label="Skills & Technologies" items={skills} onChange={setSkills} placeholder="e.g. TypeScript, React, SQL" />
                  <TagListInput label="Interests & Hobbies" items={interests} onChange={setInterests} placeholder="e.g. Photography, Running" />
                  <TagListInput label="Certifications" items={certifications} onChange={setCertifications} placeholder="e.g. AWS Certified Developer" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Left Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                    Primary Details
                  </h3>

                  <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="stat-label">Employee ID</span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{employee.loginId || employee.id}</div>
                    </div>

                    <div>
                      <span className="stat-label">Email Address</span>
                      <div style={{ color: 'var(--color-text-primary)' }}>{employee.email}</div>
                    </div>

                    <div>
                      <span className="stat-label">Phone Number</span>
                      <div style={{ color: 'var(--color-text-primary)' }}>{employee.phone || '—'}</div>
                    </div>

                    <div>
                      <span className="stat-label">Joining Date</span>
                      <div style={{ color: 'var(--color-text-primary)' }}>{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Right Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                    Profile & Expertise
                  </h3>

                  <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="stat-label">About</span>
                      <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>
                        {employee.about || 'No bio provided yet.'}
                      </p>
                    </div>

                    <div>
                      <span className="stat-label">Skills</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                        {employee.skills && employee.skills.length > 0 ? (
                          employee.skills.map((skill, idx) => (
                            <span key={idx} className="badge badge-info" style={{ fontSize: '11px' }}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>None listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="stat-label">Certifications</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                        {employee.certifications && employee.certifications.length > 0 ? (
                          employee.certifications.map((cert, idx) => (
                            <span key={idx} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                              {cert}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>None listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default EmployeeDetailPage;
