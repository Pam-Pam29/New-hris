import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { getDataFlowService, EmployeeProfileData } from '../services/dataFlowService';

interface SimpleProfileManagerProps {
    employeeId: string;
    mode: 'employee' | 'hr';
}

export function SimpleProfileManager({ employeeId, mode }: SimpleProfileManagerProps) {
    console.log('SimpleProfileManager: Component rendered with employeeId:', employeeId, 'mode:', mode);

    const [profile, setProfile] = useState<EmployeeProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('SimpleProfileManager: useEffect running');

        const loadProfile = async () => {
            try {
                console.log('SimpleProfileManager: Loading profile...');
                const dataFlowService = await getDataFlowService();

                // Subscribe to profile updates
                const unsubscribe = dataFlowService.subscribeToEmployeeUpdates(employeeId, (profileData) => {
                    console.log('SimpleProfileManager: Received profile data:', profileData);
                    setProfile(profileData);
                    setLoading(false);
                });

                return unsubscribe;
            } catch (error) {
                console.error('SimpleProfileManager: Error loading profile:', error);
                setLoading(false);
            }
        };

        const cleanup = loadProfile();
        return () => {
            if (cleanup) {
                cleanup.then(unsubscribe => unsubscribe && unsubscribe());
            }
        };
    }, [employeeId]);

    console.log('SimpleProfileManager: Render - loading:', loading, 'profile:', !!profile);

    if (loading) {
        console.log('SimpleProfileManager: Showing loading state');
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading Profile...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please wait while we load your profile...</p>
                </CardContent>
            </Card>
        );
    }

    if (!profile) {
        console.log('SimpleProfileManager: Showing no profile state');
        console.log('SimpleProfileManager: Debug - loading:', loading, 'profile:', profile);
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Profile Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>We couldn't find a profile for employee ID: {employeeId}</p>
                    <p>Debug: loading={loading.toString()}, profile={profile ? 'exists' : 'null'}</p>
                    <p>Check console for detailed debug information.</p>
                </CardContent>
            </Card>
        );
    }

    console.log('SimpleProfileManager: Rendering profile content');
    return (
        <Card>
            <CardHeader>
                <CardTitle>Employee Profile - {profile.personalInfo.firstName} {profile.personalInfo.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Personal Information</h3>
                        <p><strong>Name:</strong> {profile.personalInfo.firstName} {profile.personalInfo.lastName}</p>
                        <p><strong>Email:</strong> {profile.contactInfo.personalEmail}</p>
                        <p><strong>Phone:</strong> {profile.contactInfo.phone}</p>
                        <p><strong>Address:</strong> {profile.contactInfo.address.street}, {profile.contactInfo.address.city}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Profile Completeness</h3>
                        <p><strong>Completeness:</strong> {profile.completeness}%</p>
                    </div>

                    <div>
                        <h3 className="font-semibold">Skills</h3>
                        <ul>
                            {profile.skills.map((skill, index) => (
                                <li key={index}>{skill.name} - {skill.level}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
