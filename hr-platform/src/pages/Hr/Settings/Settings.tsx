import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
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
    AlertCircle
} from 'lucide-react';
import { useTheme } from '../../../components/atoms/ThemeProvider';
import { getPlatformConfig, updatePlatformConfig } from '../../../services/platformConfigService';
import { useCompany } from '../../../context/CompanyContext';

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { company } = useCompany();
    const [activeTab, setActiveTab] = useState('general');
    const [platformConfig, setPlatformConfig] = useState({
        employeePlatformUrl: '',
        careersPlatformUrl: '',
        hrPlatformUrl: ''
    });
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load platform configuration
    useEffect(() => {
        const loadConfig = async () => {
            setLoadingConfig(true);
            try {
                const config = await getPlatformConfig();
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

    const handleSavePlatformUrls = async () => {
        setSavingConfig(true);
        setConfigMessage(null);
        try {
            await updatePlatformConfig(
                {
                    employeePlatformUrl: platformConfig.employeePlatformUrl.trim(),
                    careersPlatformUrl: platformConfig.careersPlatformUrl.trim(),
                    hrPlatformUrl: platformConfig.hrPlatformUrl.trim()
                },
                company?.displayName || 'HR Admin'
            );
            setConfigMessage({ type: 'success', text: 'Platform URLs updated successfully!' });
            setTimeout(() => setConfigMessage(null), 3000);
        } catch (error) {
            console.error('Error saving platform config:', error);
            setConfigMessage({ type: 'error', text: 'Failed to update platform URLs. Please try again.' });
        } finally {
            setSavingConfig(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <SettingsIcon className="w-8 h-8 text-primary" />
                            Settings
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your HR platform preferences and configurations
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="hover:bg-destructive/10 text-destructive hover:text-destructive"
                    >
                        Logout
                    </Button>
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
                                            Acme Corporation
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Timezone</h4>
                                        <p className="text-sm text-muted-foreground">
                                            UTC+1 (West Africa Time)
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">Change</Button>
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
                                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                                    <p className="text-sm text-blue-800">
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
                                                placeholder="https://hris-employee-platform-xxx.vercel.app"
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
                                                placeholder="https://hris-careers-platform-xxx.vercel.app"
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <p className="text-sm text-muted-foreground">HR Manager</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <p className="text-sm text-muted-foreground">hr@acme.com</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Edit Profile</Button>
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
                                    <div>
                                        <h4 className="font-medium">Email Notifications</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Badge variant="outline">Enabled</Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Push Notifications</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Receive push notifications in browser
                                        </p>
                                    </div>
                                    <Badge variant="outline">Enabled</Badge>
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
                                            Add an extra layer of security
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">Enable</Button>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Password</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Last changed 30 days ago
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">Change</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default SettingsPage;
