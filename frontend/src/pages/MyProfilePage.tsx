import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading your profile...</div>;
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
        <h2 style={{ color: '#cc0000', marginTop: 0 }}>Unable to Load Profile</h2>
        <p>{error || 'Your profile could not be loaded.'}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button
            onClick={fetchMyProfile}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/employee')}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#666', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={() => navigate('/employee')}
        style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}
      >
        ← Back to Employee Dashboard
      </button>

      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '2rem', backgroundColor: '#fff' }}>
        {/* Banner header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
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
                {getInitials(profile.name || 'Employee')}
              </div>
            )}

            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem' }}>My Profile</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '1rem' }}>
                {profile.name} • {profile.designation || 'Employee'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSaveError(null);
              setSaveSuccess(false);
              setIsEditing(!isEditing);
            }}
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
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {saveSuccess && (
          <div style={{ padding: '0.75rem', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '4px', marginBottom: '1rem' }}>
            Profile updated successfully!
          </div>
        )}

        {saveError && (
          <div style={{ padding: '0.75rem', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '4px', marginBottom: '1rem' }}>
            {saveError}
          </div>
        )}

        {/* Edit mode vs View mode */}
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#fafafa', padding: '1.5rem', borderRadius: '6px' }}>
            <h3>Edit Allowed Profile Details</h3>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>About</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <TagListInput label="Skills" items={skills} onChange={setSkills} placeholder="Add skill (e.g. React)..." />
            <TagListInput label="Interests & Hobbies" items={interests} onChange={setInterests} placeholder="Add interest..." />
            <TagListInput label="Certifications" items={certifications} onChange={setCertifications} placeholder="Add certification..." />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={saving}
                style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '4px', border: 'none', backgroundColor: saving ? '#888' : '#0066cc', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Private Info Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ marginTop: 0, borderBottom: '2px solid #0066cc', paddingBottom: '0.5rem', display: 'inline-block' }}>
                  Private Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div>
                    <strong>Full Name:</strong> <span style={{ color: '#444' }}>{profile.name}</span>
                  </div>
                  <div>
                    <strong>Email:</strong> <span style={{ color: '#444' }}>{profile.email}</span>
                  </div>
                  <div>
                    <strong>Phone:</strong> <span style={{ color: '#444' }}>{profile.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <strong>Department:</strong> <span style={{ color: '#444' }}>{profile.department || 'N/A'}</span>
                  </div>
                  <div>
                    <strong>Designation:</strong> <span style={{ color: '#444' }}>{profile.designation || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '0.5rem', display: 'inline-block' }}>
                  Security & Account
                </h3>
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Login ID:</strong> <span style={{ color: '#444' }}>{profile.loginId || profile.id}</span>
                </div>
              </div>

              <div>
                <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '0.5rem', display: 'inline-block' }}>
                  Salary Info
                </h3>
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '0.9rem' }}>
                  🔒 Salary management will be connected in Phase 6.
                </div>
              </div>
            </div>

            {/* Profile Info Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ marginTop: 0, borderBottom: '2px solid #0066cc', paddingBottom: '0.5rem', display: 'inline-block' }}>
                  About Me
                </h3>
                <p style={{ margin: '0.75rem 0 0', color: '#555', whiteSpace: 'pre-wrap' }}>
                  {profile.about || 'No about details provided yet.'}
                </p>
              </div>

              <div>
                <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '0.5rem', display: 'inline-block' }}>
                  Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, idx) => (
                      <span key={idx} style={{ background: '#eef2f6', border: '1px solid #d0d7de', padding: '0.25rem 0.6rem', borderRadius: '14px', fontSize: '0.85rem' }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>No skills added.</span>
                  )}
                </div>
              </div>

              <div>
                <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '0.5rem', display: 'inline-block' }}>
                  Interests & Hobbies
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest, idx) => (
                      <span key={idx} style={{ background: '#eef2f6', border: '1px solid #d0d7de', padding: '0.25rem 0.6rem', borderRadius: '14px', fontSize: '0.85rem' }}>
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>No interests added.</span>
                  )}
                </div>
              </div>

              <div>
                <h3 style={{ borderBottom: '2px solid #0066cc', paddingBottom: '0.5rem', display: 'inline-block' }}>
                  Certifications
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {profile.certifications && profile.certifications.length > 0 ? (
                    profile.certifications.map((cert, idx) => (
                      <span key={idx} style={{ background: '#eef2f6', border: '1px solid #d0d7de', padding: '0.25rem 0.6rem', borderRadius: '14px', fontSize: '0.85rem' }}>
                        {cert}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>No certifications added.</span>
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

export default MyProfilePage;
