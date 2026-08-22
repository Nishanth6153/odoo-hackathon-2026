import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employee.service';
import { EmployeeForm, type EmployeeFormData } from '../components/employees/EmployeeForm';
import { TagListInput } from '../components/employees/TagListInput';
import { PageTransition } from '../components/motion/PageTransition';
import { Reveal } from '../components/motion/Reveal';
import type { EmployeeProfile } from '../types/employee.types';

export const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editApiError, setEditApiError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [about, setAbout] = useState('');

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getMyProfile();
      setProfile(data);
      setSkills(data.skills || []);
      setInterests(data.interests || []);
      setCertifications(data.certifications || []);
      setAbout(data.about || '');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load your profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleUpdate = async (formData: EmployeeFormData) => {
    try {
      setEditApiError(null);
      const updated = await employeeService.updateMyProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        about,
        skills,
        interests,
        certifications,
      });

      setProfile(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditApiError(err.message);
      } else {
        setEditApiError('Failed to update your profile.');
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
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading your profile...</div>;
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
        <h2 style={{ color: '#cc0000', marginTop: 0 }}>Profile Error</h2>
        <p>{error || 'Unable to retrieve your personal profile details.'}</p>
        <button
          onClick={() => navigate('/employee')}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Return to Employee Dashboard
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/employee')}
            style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
          >
            ← Back to Employee Dashboard
          </button>

          <button
            onClick={logout}
            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Logout
          </button>
        </div>

        <Reveal delay={0.1}>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '2rem', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
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
                    {getInitials(profile.name)}
                  </div>
                )}

                <div>
                  <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{profile.name}</h1>
                  <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '1rem' }}>
                    {profile.designation || 'No Designation'} • {profile.department || 'No Department'}
                  </p>
                  <span style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600, backgroundColor: '#e6f4ea', color: '#137333' }}>
                    EMPLOYEE ROLE
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  padding: '0.55rem 1.15rem',
                  backgroundColor: isEditing ? '#666' : '#0066cc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {isEditing ? 'Cancel Editing' : 'Edit My Profile'}
              </button>
            </div>

            {isEditing ? (
              <div style={{ backgroundColor: '#fafafa', padding: '1.5rem', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>Edit Personal Details</h3>
                <EmployeeForm
                  initialValues={profile}
                  onSubmit={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                  submitButtonText="Save Changes"
                  apiError={editApiError}
                />

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                  <h4>About & Skills</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>About Me</label>
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                  </div>

                  <TagListInput label="Skills" items={skills} onChange={setSkills} placeholder="e.g. React, TypeScript" />
                  <TagListInput label="Interests & Hobbies" items={interests} onChange={setInterests} placeholder="e.g. Chess, Running" />
                  <TagListInput label="Certifications" items={certifications} onChange={setCertifications} placeholder="e.g. AWS Solutions Architect" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3>Primary Details</h3>
                  <div><strong>Email:</strong> <span style={{ color: '#444' }}>{profile.email}</span></div>
                  <div><strong>Phone:</strong> <span style={{ color: '#444' }}>{profile.phone || 'N/A'}</span></div>
                  <div><strong>Department:</strong> <span style={{ color: '#444' }}>{profile.department || 'N/A'}</span></div>
                  <div><strong>Joining Date:</strong> <span style={{ color: '#444' }}>{profile.joiningDate || 'N/A'}</span></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3>Personal Bio & Skills</h3>
                  <div>
                    <strong>About Me:</strong>
                    <p style={{ margin: '0.25rem 0', color: '#555', whiteSpace: 'pre-wrap' }}>
                      {profile.about || 'No personal bio added.'}
                    </p>
                  </div>

                  <div>
                    <strong>Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, idx) => (
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
                      {profile.interests && profile.interests.length > 0 ? (
                        profile.interests.map((interest, idx) => (
                          <span key={idx} style={{ background: '#eef2f6', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                            {interest}
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
        </Reveal>
      </div>
    </PageTransition>
  );
};

export default MyProfilePage;
