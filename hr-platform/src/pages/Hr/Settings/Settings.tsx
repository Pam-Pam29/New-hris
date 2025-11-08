import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Switch } from '../../../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import {
    Settings as SettingsIcon,
    User,
    Building2,
    Shield,
    Bell,
    Palette,
    Database,
    Key,
    Globe,
    Mail,
    Smartphone,
    Monitor,
    Moon,
    Sun,
    Loader,
    CheckCircle,
    AlertCircle,
    Edit,
    Save,
    X,
    Link2,
    Copy
} from 'lucide-react';
import { useTheme } from '../../../components/atoms/ThemeProvider';
import { getPlatformConfig, updatePlatformConfig } from '../../../services/platformConfigService';
import { useCompany } from '../../../context/CompanyContext';
import { getAuth, updateProfile, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { getFirebaseDb } from '../../../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../../../hooks/use-toast';

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { company } = useCompany();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('general');
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Platform URLs state
    const [platformConfig, setPlatformConfig] = useState({
        employeePlatformUrl: '',
        careersPlatformUrl: '',
        hrPlatformUrl: ''
    });
    const [portalLinks, setPortalLinks] = useState({
        careersPortalUrl: '',
        employeePortalUrl: ''
    });
    const [loadingPortalLinks, setLoadingPortalLinks] = useState(false);
    const [copyStatus, setCopyStatus] = useState({
        careers: false,
        employee: false
    });

    // Profile state
    const [userProfile, setUserProfile] = useState({
        displayName: '',
        email: '',
        phone: ''
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editingProfile, setEditingProfile] = useState({
        displayName: '',
        phone: ''
    });
    const [savingProfile, setSavingProfile] = useState(false);

    // Notification preferences state
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        leaveRequests: true,
        newEmployees: true,
        payroll: true
    });
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);

    // Security state
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Load user profile and preferences
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                
                if (user) {
                    // Load from Firebase Auth
                    setUserProfile({
                        displayName: user.displayName || '',
                        email: user.email || '',
                        phone: user.phoneNumber || ''
                    });
                    setEditingProfile({
                        displayName: user.displayName || '',
                        phone: user.phoneNumber || ''
                    });

                    // Load from Firestore (hrUsers collection)
                    const db = getFirebaseDb();
                    const hrUserRef = doc(db, 'hrUsers', user.uid);
                    const hrUserDoc = await getDoc(hrUserRef);
                    
                    if (hrUserDoc.exists()) {
                        const data = hrUserDoc.data();
                        if (data.phone) {
                            setUserProfile(prev => ({ ...prev, phone: data.phone }));
                            setEditingProfile(prev => ({ ...prev, phone: data.phone }));
                        }
                        if (data.notifications) {
                            setNotifications(data.notifications);
                        }
                        if (data.twoFactorEnabled) {
                            setTwoFactorEnabled(data.twoFactorEnabled);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    // Load platform configuration
    useEffect(() => {
        const loadConfig = async () => {
            setLoadingConfig(true);
            try {
                // Load company-specific platform config
                const config = await getPlatformConfig(company?.id);
                setPlatformConfig({
                    employeePlatformUrl: config.employeePlatformUrl || '',
                    careersPlatformUrl: config.careersPlatformUrl || '',
                    hrPlatformUrl: config.hrPlatformUrl || ''
                });
            } catch (error) {
                console.error('Error loading platform config:', error);
            } finally {
                setLoadingConfig(false);
            }
        };
        loadConfig();
    }, []);

    useEffect(() => {
        const loadPortalLinks = async () => {
            if (!company?.id) {
                setPortalLinks({
                    careersPortalUrl: '',
                    employeePortalUrl: ''
                });
                return;
            }

            setLoadingPortalLinks(true);
            try {
                const { getFirebaseDb } = await import('../../../config/firebase');
                const { doc, getDoc, collection, getDocs, query, limit } = await import('firebase/firestore');
                const db = getFirebaseDb();

                let settingsData: Record<string, any> | null = null;

                const companySettingsRef = doc(db, 'hrSettings', company.id);
                const companySettingsSnap = await getDoc(companySettingsRef);

                if (companySettingsSnap.exists()) {
                    settingsData = companySettingsSnap.data();
                } else {
                    const legacyQuery = query(collection(db, 'hrSettings'), limit(1));
                    const legacySnapshot = await getDocs(legacyQuery);
                    if (!legacySnapshot.empty) {
                        settingsData = legacySnapshot.docs[0].data();
                    }
                }

                setPortalLinks({
                    careersPortalUrl: settingsData?.careersPortalUrl || '',
                    employeePortalUrl: settingsData?.employeePortalUrl || ''
                });
            } catch (error) {
                console.error('Error loading portal links:', error);
                setPortalLinks({
                    careersPortalUrl: '',
                    employeePortalUrl: ''
                });
            } finally {
                setLoadingPortalLinks(false);
            }
        };

        loadPortalLinks();
    }, [company?.id]);

    const handleSavePlatformUrls = async () => {
        setSavingConfig(true);
        setConfigMessage(null);
        try {
            // Save platform URLs per company
            await updatePlatformConfig(
                {
                    employeePlatformUrl: platformConfig.employeePlatformUrl.trim(),
                    careersPlatformUrl: platformConfig.careersPlatformUrl.trim(),
                    hrPlatformUrl: platformConfig.hrPlatformUrl.trim()
                },
                company?.id, // Pass company ID to save per-company config
                company?.displayName || 'HR Admin' // Pass display name as updatedBy
            );
            setConfigMessage({ type: 'success', text: 'Platform URLs updated successfully!' });
            toast({
                title: 'Success',
                description: 'Platform URLs updated successfully!',
            });
            setTimeout(() => setConfigMessage(null), 3000);
        } catch (error) {
            console.error('Error saving platform config:', error);
            setConfigMessage({ type: 'error', text: 'Failed to update platform URLs. Please try again.' });
            toast({
                title: 'Error',
                description: 'Failed to update platform URLs. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSavingConfig(false);
        }
    };

    const handleCopyPortalLink = async (type: 'careers' | 'employee') => {
        const url = type === 'careers' ? portalLinks.careersPortalUrl : portalLinks.employeePortalUrl;
        if (!url) {
            toast({
                title: 'Link not available',
                description: 'Complete company onboarding to generate this link.',
                variant: 'destructive'
            });
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            setCopyStatus(prev => ({ ...prev, [type]: true }));
            toast({
                title: 'Link copied',
                description: 'The portal link has been copied to your clipboard.'
            });
            setTimeout(() => setCopyStatus(prev => ({ ...prev, [type]: false })), 2000);
        } catch (error) {
            console.error('Error copying link:', error);
            toast({
                title: 'Error',
                description: 'Failed to copy the link. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleEditProfile = () => {
        setIsEditingProfile(true);
    };

    const handleCancelEditProfile = () => {
        setIsEditingProfile(false);
        setEditingProfile({
            displayName: userProfile.displayName,
            phone: userProfile.phone
        });
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error('No user logged in');
            }

            // Update Firebase Auth profile
            await updateProfile(user, {
                displayName: editingProfile.displayName
            });

            // Update Firestore hrUsers document
            const db = getFirebaseDb();
            const hrUserRef = doc(db, 'hrUsers', user.uid);
            await updateDoc(hrUserRef, {
                displayName: editingProfile.displayName,
                phone: editingProfile.phone,
                updatedAt: serverTimestamp()
            });

            setUserProfile({
                ...userProfile,
                displayName: editingProfile.displayName,
                phone: editingProfile.phone
            });
            setIsEditingProfile(false);

            toast({
                title: 'Success',
                description: 'Profile updated successfully!',
            });
        } catch (error: any) {
            console.error('Error saving profile:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to update profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleNotificationToggle = async (key: keyof typeof notifications) => {
        const newValue = !notifications[key];
        setNotifications(prev => ({ ...prev, [key]: newValue }));
        
        // Save to Firestore
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (user) {
                setSavingNotifications(true);
                const db = getFirebaseDb();
                const hrUserRef = doc(db, 'hrUsers', user.uid);
                await updateDoc(hrUserRef, {
                    notifications: {
                        ...notifications,
                        [key]: newValue
                    },
                    updatedAt: serverTimestamp()
                });
                
                toast({
                    title: 'Success',
                    description: 'Notification preferences updated!',
                });
            }
        } catch (error) {
            console.error('Error updating notifications:', error);
            // Revert on error
            setNotifications(prev => ({ ...prev, [key]: !newValue }));
            toast({
                title: 'Error',
                description: 'Failed to update notification preferences.',
                variant: 'destructive',
            });
        } finally {
            setSavingNotifications(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: 'Error',
                description: 'New passwords do not match.',
                variant: 'destructive',
            });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast({
                title: 'Error',
                description: 'Password must be at least 6 characters.',
                variant: 'destructive',
            });
            return;
        }

        setChangingPassword(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user || !user.email) {
                throw new Error('No user logged in');
            }

            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                passwordForm.currentPassword
            );
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, passwordForm.newPassword);

            toast({
                title: 'Success',
                description: 'Password changed successfully!',
            });

            setShowPasswordDialog(false);
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error: any) {
            console.error('Error changing password:', error);
            let errorMessage = 'Failed to change password. Please try again.';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Current password is incorrect.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'New password is too weak.';
            }
            
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSendPasswordReset = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user || !user.email) {
                throw new Error('No user logged in');
            }

            await sendPasswordResetEmail(auth, user.email);
            
            toast({
                title: 'Email Sent',
                description: 'Password reset email sent to your email address.',
            });
            
            setShowPasswordDialog(false);
        } catch (error: any) {
            console.error('Error sending password reset:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to send password reset email.',
                variant: 'destructive',
            });
        }
    };

    const handleToggle2FA = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                throw new Error('No user logged in');
            }

            const db = getFirebaseDb();
            const hrUserRef = doc(db, 'hrUsers', user.uid);
            await updateDoc(hrUserRef, {
                twoFactorEnabled: !twoFactorEnabled,
                updatedAt: serverTimestamp()
            });

            setTwoFactorEnabled(!twoFactorEnabled);
            
            toast({
                title: 'Success',
                description: twoFactorEnabled ? 'Two-factor authentication disabled.' : 'Two-factor authentication enabled.',
            });
            
            setShow2FADialog(false);
        } catch (error: any) {
            console.error('Error toggling 2FA:', error);
            toast({
                title: 'Error',
                description: 'Failed to update two-factor authentication settings.',
                variant: 'destructive',
            });
        }
    };


    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your HR platform preferences and configurations
                        </p>
                    </div>
                </div>

                {/* Settings Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5" />
                                    Appearance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Theme</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Choose your preferred theme
                                        </p>
                                    </div>
                                    <Button variant="outline" onClick={toggleTheme}>
                                        {theme === 'dark' ? (
                                            <>
                                                <Sun className="w-4 h-4 mr-2" />
                                                Light Mode
                                            </>
                                        ) : (
                                            <>
                                                <Moon className="w-4 h-4 mr-2" />
                                                Dark Mode
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Language</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Select your preferred language
                                        </p>
                                    </div>
                                    <Badge variant="outline">English</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    Company Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Company Name</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {company?.displayName || 'Not set'}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Timezone</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {company?.timezone || 'UTC+1 (West Africa Time)'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Platform URLs Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg mb-4">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Important:</strong> If you redeploy the Employee or Careers platforms, 
                                        their URLs may change. Update these URLs here so setup links work correctly.
                                    </p>
                                </div>

                                {configMessage && (
                                    <Alert variant={configMessage.type === 'success' ? 'default' : 'destructive'}>
                                        {configMessage.type === 'success' ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4" />
                                        )}
                                        <AlertDescription>{configMessage.text}</AlertDescription>
                                    </Alert>
                                )}

                                {loadingConfig ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="employeePlatformUrl">Employee Platform URL</Label>
                                            <Input
                                                id="employeePlatformUrl"
                                                type="url"
                                                value={platformConfig.employeePlatformUrl}
                                                onChange={(e) => setPlatformConfig({
                                                    ...platformConfig,
                                                    employeePlatformUrl: e.target.value
                                                })}
                                                placeholder="https://hris-employee-platform.vercel.app"
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Used for employee setup links. Update this when employee platform is redeployed.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="careersPlatformUrl">Careers Platform URL (Optional)</Label>
                                            <Input
                                                id="careersPlatformUrl"
                                                type="url"
                                                value={platformConfig.careersPlatformUrl}
                                                onChange={(e) => setPlatformConfig({
                                                    ...platformConfig,
                                                    careersPlatformUrl: e.target.value
                                                })}
                                                placeholder="https://hris-careers-platform.vercel.app"
                                                className="font-mono text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="hrPlatformUrl">HR Platform URL (Optional)</Label>
                                            <Input
                                                id="hrPlatformUrl"
                                                type="url"
                                                value={platformConfig.hrPlatformUrl}
                                                onChange={(e) => setPlatformConfig({
                                                    ...platformConfig,
                                                    hrPlatformUrl: e.target.value
                                                })}
                                                placeholder="https://hr-platform-xxx.vercel.app"
                                                className="font-mono text-sm"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleSavePlatformUrls}
                                            disabled={savingConfig}
                                            className="w-full"
                                        >
                                            {savingConfig ? (
                                                <>
                                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Platform URLs'
                                            )}
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Link2 className="w-5 h-5" />
                                    Portal Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Share these links with your team. They are generated automatically from your company settings.
                                </p>

                                {loadingPortalLinks ? (
                                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Loading portal links...
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Careers Portal</Label>
                                            <div className="mt-2 flex flex-col md:flex-row gap-2">
                                                <Input
                                                    readOnly
                                                    value={portalLinks.careersPortalUrl}
                                                    placeholder="Generated after company onboarding"
                                                    className="flex-1"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => handleCopyPortalLink('careers')}
                                                        disabled={!portalLinks.careersPortalUrl}
                                                    >
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        {copyStatus.careers ? 'Copied!' : 'Copy'}
                                                    </Button>
                                                    {portalLinks.careersPortalUrl && (
                                                        <Button asChild variant="ghost">
                                                            <a href={portalLinks.careersPortalUrl} target="_blank" rel="noopener noreferrer">
                                                                Open
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {!portalLinks.careersPortalUrl && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Complete company onboarding to auto-generate your careers portal link.
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Employee Portal</Label>
                                            <div className="mt-2 flex flex-col md:flex-row gap-2">
                                                <Input
                                                    readOnly
                                                    value={portalLinks.employeePortalUrl}
                                                    placeholder="Generated after company onboarding"
                                                    className="flex-1"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => handleCopyPortalLink('employee')}
                                                        disabled={!portalLinks.employeePortalUrl}
                                                    >
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        {copyStatus.employee ? 'Copied!' : 'Copy'}
                                                    </Button>
                                                    {portalLinks.employeePortalUrl && (
                                                        <Button asChild variant="ghost">
                                                            <a href={portalLinks.employeePortalUrl} target="_blank" rel="noopener noreferrer">
                                                                Open
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {company?.settings?.employeeSlug && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Slug: <code className="font-mono">/employee/{company.settings.employeeSlug}</code> (used for setup links)
                                                </p>
                                            )}
                                            {!portalLinks.employeePortalUrl && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    This link is generated automatically when the employee platform URL is configured.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Profile Settings */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditingProfile ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="displayName">Display Name</Label>
                                            <Input
                                                id="displayName"
                                                value={editingProfile.displayName}
                                                onChange={(e) => setEditingProfile({
                                                    ...editingProfile,
                                                    displayName: e.target.value
                                                })}
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={userProfile.email}
                                                disabled
                                                className="bg-muted"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Email cannot be changed. Contact support if needed.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={editingProfile.phone}
                                                onChange={(e) => setEditingProfile({
                                                    ...editingProfile,
                                                    phone: e.target.value
                                                })}
                                                placeholder="+1234567890"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleSaveProfile}
                                                disabled={savingProfile}
                                                className="flex-1"
                                            >
                                                {savingProfile ? (
                                                    <>
                                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCancelEditProfile}
                                                disabled={savingProfile}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium">Name</label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {userProfile.displayName || 'Not set'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Email</label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {userProfile.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Phone</label>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {userProfile.phone || 'Not set'}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={handleEditProfile}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notification Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium">Email Notifications</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.email}
                                        onCheckedChange={() => handleNotificationToggle('email')}
                                        disabled={savingNotifications}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium">Push Notifications</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Receive push notifications in browser
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.push}
                                        onCheckedChange={() => handleNotificationToggle('push')}
                                        disabled={savingNotifications}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium">Leave Requests</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Notify when employees submit leave requests
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.leaveRequests}
                                        onCheckedChange={() => handleNotificationToggle('leaveRequests')}
                                        disabled={savingNotifications}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium">New Employees</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Notify when new employees are added
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.newEmployees}
                                        onCheckedChange={() => handleNotificationToggle('newEmployees')}
                                        disabled={savingNotifications}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium">Payroll Updates</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Notify about payroll processing and updates
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.payroll}
                                        onCheckedChange={() => handleNotificationToggle('payroll')}
                                        disabled={savingNotifications}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Security & Privacy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {twoFactorEnabled 
                                                ? 'Two-factor authentication is enabled' 
                                                : 'Add an extra layer of security'}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShow2FADialog(true)}
                                    >
                                        {twoFactorEnabled ? 'Disable' : 'Enable'}
                                    </Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Password</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Change your account password
                                        </p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setShowPasswordDialog(true)}
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Password Change Dialog */}
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                                Enter your current password and choose a new one.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        currentPassword: e.target.value
                                    })}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        newPassword: e.target.value
                                    })}
                                    placeholder="Enter new password (min 6 characters)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({
                                        ...passwordForm,
                                        confirmPassword: e.target.value
                                    })}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="pt-2">
                                <Button
                                    variant="link"
                                    onClick={handleSendPasswordReset}
                                    className="text-sm"
                                >
                                    Forgot your password? Send reset email
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPasswordDialog(false);
                                    setPasswordForm({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleChangePassword}
                                disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                            >
                                {changingPassword ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Changing...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 2FA Dialog */}
                <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
                            </DialogTitle>
                            <DialogDescription>
                                {twoFactorEnabled 
                                    ? 'Are you sure you want to disable two-factor authentication? This will reduce your account security.'
                                    : 'Two-factor authentication adds an extra layer of security to your account. You will need to verify your identity with a second factor when logging in.'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShow2FADialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleToggle2FA}
                                variant={twoFactorEnabled ? 'destructive' : 'default'}
                            >
                                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default SettingsPage;
