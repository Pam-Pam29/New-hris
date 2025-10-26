import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Users, Calendar, Phone, Mail, Plus, X, Clock } from 'lucide-react';
import { TeamIntroduction as TeamIntroductionType } from './services/onboardingService';

interface TeamIntroductionProps {
    onComplete: (data: TeamIntroductionType) => void;
}

const TeamIntroduction: React.FC<TeamIntroductionProps> = ({ onComplete }) => {
    const [formData, setFormData] = useState<TeamIntroductionType>({
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        buddyName: '',
        buddyEmail: '',
        buddyPhone: '',
        department: '',
        teamMembers: [],
        firstWeekSchedule: []
    });

    const [newTeamMember, setNewTeamMember] = useState({
        name: '',
        role: '',
        email: ''
    });

    const [newScheduleItem, setNewScheduleItem] = useState({
        day: '',
        time: '',
        activity: '',
        location: ''
    });

    const addTeamMember = () => {
        if (newTeamMember.name && newTeamMember.role && newTeamMember.email) {
            setFormData({
                ...formData,
                teamMembers: [...formData.teamMembers, newTeamMember]
            });
            setNewTeamMember({ name: '', role: '', email: '' });
        }
    };

    const removeTeamMember = (index: number) => {
        setFormData({
            ...formData,
            teamMembers: formData.teamMembers.filter((_, i) => i !== index)
        });
    };

    const addScheduleItem = () => {
        if (newScheduleItem.day && newScheduleItem.time && newScheduleItem.activity) {
            setFormData({
                ...formData,
                firstWeekSchedule: [...formData.firstWeekSchedule, newScheduleItem]
            });
            setNewScheduleItem({ day: '', time: '', activity: '', location: '' });
        }
    };

    const removeScheduleItem = (index: number) => {
        setFormData({
            ...formData,
            firstWeekSchedule: formData.firstWeekSchedule.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Meet Your Team
                </CardTitle>
                <CardDescription>
                    Get to know your colleagues and set up your first week schedule.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Manager Information */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-6 h-6 text-blue-600" />
                            <Label className="text-lg font-semibold">Your Manager</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="managerName">Manager Name</Label>
                                <Input
                                    id="managerName"
                                    value={formData.managerName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        managerName: e.target.value
                                    })}
                                    placeholder="John Smith"
                                />
                            </div>
                            <div>
                                <Label htmlFor="managerEmail">Manager Email</Label>
                                <Input
                                    id="managerEmail"
                                    type="email"
                                    value={formData.managerEmail}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        managerEmail: e.target.value
                                    })}
                                    placeholder="john.smith@company.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="managerPhone">Manager Phone (Optional)</Label>
                                <Input
                                    id="managerPhone"
                                    value={formData.managerPhone}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        managerPhone: e.target.value
                                    })}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                            <div>
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        department: e.target.value
                                    })}
                                    placeholder="Engineering, Marketing, Sales, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Buddy Information */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-6 h-6 text-green-600" />
                            <Label className="text-lg font-semibold">Your Buddy (Optional)</Label>
                        </div>
                        <p className="text-sm text-gray-600">
                            A buddy is someone who will help you get settled in during your first few weeks.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="buddyName">Buddy Name</Label>
                                <Input
                                    id="buddyName"
                                    value={formData.buddyName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        buddyName: e.target.value
                                    })}
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <Label htmlFor="buddyEmail">Buddy Email</Label>
                                <Input
                                    id="buddyEmail"
                                    type="email"
                                    value={formData.buddyEmail}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        buddyEmail: e.target.value
                                    })}
                                    placeholder="jane.doe@company.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="buddyPhone">Buddy Phone (Optional)</Label>
                                <Input
                                    id="buddyPhone"
                                    value={formData.buddyPhone}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        buddyPhone: e.target.value
                                    })}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Team Members</Label>
                        <p className="text-sm text-gray-600">
                            Add other team members you'll be working with.
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    value={newTeamMember.name}
                                    onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                                    placeholder="Team member name"
                                />
                                <Input
                                    value={newTeamMember.role}
                                    onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                                    placeholder="Role/Position"
                                />
                                <div className="flex space-x-2">
                                    <Input
                                        value={newTeamMember.email}
                                        onChange={(e) => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                                        placeholder="Email"
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={addTeamMember} variant="outline">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {formData.teamMembers.map((member, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-gray-600">{member.role}</p>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeTeamMember(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* First Week Schedule */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-6 h-6 text-purple-600" />
                            <Label className="text-lg font-semibold">First Week Schedule</Label>
                        </div>
                        <p className="text-sm text-gray-600">
                            Plan your first week activities and meetings.
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="scheduleDay">Day</Label>
                                    <select
                                        id="scheduleDay"
                                        className="w-full p-2 border rounded-md"
                                        value={newScheduleItem.day}
                                        onChange={(e) => setNewScheduleItem({ ...newScheduleItem, day: e.target.value })}
                                    >
                                        <option value="">Select day...</option>
                                        {days.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="scheduleTime">Time</Label>
                                    <Input
                                        id="scheduleTime"
                                        type="time"
                                        value={newScheduleItem.time}
                                        onChange={(e) => setNewScheduleItem({ ...newScheduleItem, time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="scheduleActivity">Activity</Label>
                                    <Input
                                        id="scheduleActivity"
                                        value={newScheduleItem.activity}
                                        onChange={(e) => setNewScheduleItem({ ...newScheduleItem, activity: e.target.value })}
                                        placeholder="e.g., Team meeting, Training session"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="scheduleLocation">Location (Optional)</Label>
                                    <Input
                                        id="scheduleLocation"
                                        value={newScheduleItem.location}
                                        onChange={(e) => setNewScheduleItem({ ...newScheduleItem, location: e.target.value })}
                                        placeholder="e.g., Conference Room A, Online"
                                    />
                                </div>
                            </div>
                            <Button type="button" onClick={addScheduleItem} variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Schedule
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {formData.firstWeekSchedule.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="font-medium">{item.activity}</p>
                                            <p className="text-sm text-gray-600">
                                                {item.day} at {item.time}
                                                {item.location && ` • ${item.location}`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeScheduleItem(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Information Box */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <Users className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-green-900 mb-2">What happens next?</h4>
                                <ul className="text-sm text-green-800 space-y-1">
                                    <li>• Your manager will be notified of your onboarding progress</li>
                                    <li>• Team members will receive introduction emails</li>
                                    <li>• Calendar invites will be sent for scheduled meetings</li>
                                    <li>• You'll receive a welcome package with company information</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Continue
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default TeamIntroduction;
