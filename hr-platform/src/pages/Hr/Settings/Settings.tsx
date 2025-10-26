import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
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
    Sun
} from 'lucide-react';
import { useTheme } from '../../../components/atoms/ThemeProvider';

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');

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
