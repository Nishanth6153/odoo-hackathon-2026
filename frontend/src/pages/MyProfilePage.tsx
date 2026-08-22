import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { employeeService } from '../services/employee.service';
import { TagListInput } from '../components/employees/TagListInput';
import type { EmployeeProfile, UpdateEmployeeData } from '../types/employee.types';

export const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getMyProfile();
      setProfile(data);
      setPhone(data.phone || '');
      setAbout(data.about || '');
      setSkills(data.skills || []);
      setInterests(data.interests || []);
      setCertifications(data.certifications || []);
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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const updateData: UpdateEmployeeData = {
        phone,
        about,
        skills,
        interests,
        certifications,
      };

      const updated = await employeeService.updateMyProfile(updateData);
      setProfile(updated);
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSaveError(err.message);
      } else {
        setSaveError('Failed to update your profile.');
      }
    } finally {
      setSaving(false);
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

  return (
    <>
      <Navbar portalTitle="Employee Workspace" />

      <main className="page-container" style={{ maxWidth: '960px' }}>
        <button
          onClick={() => navigate('/employee')}
          className="back-link"
        >
          ← Back to Dashboard
        </button>

        {loading ? (
          <div className="loading-box">
            <div className="spinner" />
            <span>Loading profile...</span>
          </div>
        ) : error || !profile ? (
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-title">Profile Unavailable</div>
            <p className="empty-state-desc">{error || 'Could not retrieve your employee profile.'}</p>
            <button onClick={fetchMyProfile} className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-4)' }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="card card-padding">
            {/* Banner header */}
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
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
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
                    {getInitials(profile.name || 'Employee')}
                  </div>
                )}

                <div>
                  <h1 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>{profile.name}</h1>
                  <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    {profile.designation || 'Staff'} • {profile.department || 'General'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => navigate('/employee/payroll')}
                  className="btn btn-secondary"
                >
                  💰 View Payroll
                </button>

                <button
                  onClick={() => {
                    setSaveError(null);
                    setSaveSuccess(false);
                    setIsEditing(!isEditing);
                  }}
                  className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                <span>✓ Profile updated successfully!</span>
              </div>
            )}

            {saveError && (
              <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                <span>⚠️ {saveError}</span>
              </div>
            )}

            {/* Edit mode vs View mode */}
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>Edit Profile Details</h3>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                    placeholder="+1 555 0192"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">About / Bio</label>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={3}
                    className="form-textarea"
                    placeholder="Tell your team about yourself..."
                  />
                </div>

                <TagListInput label="Skills & Technologies" items={skills} onChange={setSkills} placeholder="Add skill (e.g. React)..." />
                <TagListInput label="Interests & Hobbies" items={interests} onChange={setInterests} placeholder="Add interest..." />
                <TagListInput label="Certifications" items={certifications} onChange={setCertifications} placeholder="Add certification..." />

                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Private Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                    Personal Details
                  </h3>

                  <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="stat-label">Full Name</span>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{profile.name}</div>
                    </div>
                    <div>
                      <span className="stat-label">Email Address</span>
                      <div style={{ color: 'var(--color-text-primary)' }}>{profile.email}</div>
                    </div>
                    <div>
                      <span className="stat-label">Phone</span>
                      <div style={{ color: 'var(--color-text-primary)' }}>{profile.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <span className="stat-label">Department</span>
                      <div style={{ color: 'var(--color-text-primary)' }}>{profile.department || '—'}</div>
                    </div>
                    <div>
                      <span className="stat-label">Login Account</span>
                      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{profile.loginId || profile.id}</div>
                    </div>
                  </div>
                </div>

                {/* Profile Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <h3 style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                    Background & Skills
                  </h3>

                  <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <span className="stat-label">About Me</span>
                      <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>
                        {profile.about || 'No about details provided yet.'}
                      </p>
                    </div>

                    <div>
                      <span className="stat-label">Skills</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                        {profile.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill, idx) => (
                            <span key={idx} className="badge badge-info" style={{ fontSize: '11px' }}>
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>No skills added.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="stat-label">Interests & Hobbies</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                        {profile.interests && profile.interests.length > 0 ? (
                          profile.interests.map((interest, idx) => (
                            <span key={idx} className="badge badge-neutral" style={{ fontSize: '11px' }}>
                              {interest}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>No interests added.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="stat-label">Certifications</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                        {profile.certifications && profile.certifications.length > 0 ? (
                          profile.certifications.map((cert, idx) => (
                            <span key={idx} className="badge badge-success" style={{ fontSize: '11px' }}>
                              {cert}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>No certifications added.</span>
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

export default MyProfilePage;
