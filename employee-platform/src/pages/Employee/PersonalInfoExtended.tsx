import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Camera, Plus, X, GraduationCap, Briefcase } from 'lucide-react';
import { PersonalInfoExtended as PersonalInfoExtendedType } from './services/onboardingService';

interface PersonalInfoExtendedProps {
    onComplete: (data: PersonalInfoExtendedType) => void;
}

const PersonalInfoExtended: React.FC<PersonalInfoExtendedProps> = ({ onComplete }) => {
    const [formData, setFormData] = useState<PersonalInfoExtendedType>({
        profilePhoto: '',
        socialMediaProfiles: {
            linkedin: '',
            twitter: '',
            github: ''
        },
        skills: [],
        certifications: [],
        previousExperience: [],
        education: []
    });

    const [newSkill, setNewSkill] = useState('');
    const [newCertification, setNewCertification] = useState({
        name: '',
        issuer: '',
        dateIssued: '',
        expiryDate: ''
    });
    const [newExperience, setNewExperience] = useState({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [newEducation, setNewEducation] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        graduationYear: ''
    });

    const addSkill = () => {
        if (newSkill.trim()) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (index: number) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter((_, i) => i !== index)
        });
    };

    const addCertification = () => {
        if (newCertification.name && newCertification.issuer && newCertification.dateIssued) {
            setFormData({
                ...formData,
                certifications: [...formData.certifications, {
                    ...newCertification,
                    dateIssued: new Date(newCertification.dateIssued),
                    expiryDate: newCertification.expiryDate ? new Date(newCertification.expiryDate) : undefined
                }]
            });
            setNewCertification({ name: '', issuer: '', dateIssued: '', expiryDate: '' });
        }
    };

    const addExperience = () => {
        if (newExperience.company && newExperience.position && newExperience.startDate) {
            setFormData({
                ...formData,
                previousExperience: [...formData.previousExperience, {
                    ...newExperience,
                    startDate: new Date(newExperience.startDate),
                    endDate: newExperience.endDate ? new Date(newExperience.endDate) : undefined
                }]
            });
            setNewExperience({ company: '', position: '', startDate: '', endDate: '', description: '' });
        }
    };

    const addEducation = () => {
        if (newEducation.institution && newEducation.degree && newEducation.graduationYear) {
            setFormData({
                ...formData,
                education: [...formData.education, {
                    ...newEducation,
                    graduationYear: parseInt(newEducation.graduationYear)
                }]
            });
            setNewEducation({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Complete Your Professional Profile
                </CardTitle>
                <CardDescription>
                    Help us get to know you better by sharing your professional background and skills.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Photo */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Profile Photo</Label>
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <Button type="button" variant="outline">
                                    Upload Photo
                                </Button>
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional - You can add this later
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Profiles */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Social Media Profiles (Optional)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    value={formData.socialMediaProfiles?.linkedin || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMediaProfiles: {
                                            ...formData.socialMediaProfiles,
                                            linkedin: e.target.value
                                        }
                                    })}
                                    placeholder="https://linkedin.com/in/yourname"
                                />
                            </div>
                            <div>
                                <Label htmlFor="twitter">Twitter</Label>
                                <Input
                                    id="twitter"
                                    value={formData.socialMediaProfiles?.twitter || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMediaProfiles: {
                                            ...formData.socialMediaProfiles,
                                            twitter: e.target.value
                                        }
                                    })}
                                    placeholder="https://twitter.com/yourname"
                                />
                            </div>
                            <div>
                                <Label htmlFor="github">GitHub</Label>
                                <Input
                                    id="github"
                                    value={formData.socialMediaProfiles?.github || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialMediaProfiles: {
                                            ...formData.socialMediaProfiles,
                                            github: e.target.value
                                        }
                                    })}
                                    placeholder="https://github.com/yourname"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Skills</Label>
                        <div className="flex space-x-2">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a skill"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            />
                            <Button type="button" onClick={addSkill} variant="outline">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => removeSkill(index)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold flex items-center">
                            <GraduationCap className="w-5 h-5 mr-2" />
                            Certifications
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                value={newCertification.name}
                                onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                                placeholder="Certification name"
                            />
                            <Input
                                value={newCertification.issuer}
                                onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                                placeholder="Issuing organization"
                            />
                            <Input
                                type="date"
                                value={newCertification.dateIssued}
                                onChange={(e) => setNewCertification({ ...newCertification, dateIssued: e.target.value })}
                            />
                            <Input
                                type="date"
                                value={newCertification.expiryDate}
                                onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                                placeholder="Expiry date (optional)"
                            />
                        </div>
                        <Button type="button" onClick={addCertification} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Certification
                        </Button>
                        <div className="space-y-2">
                            {formData.certifications.map((cert, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{cert.name}</p>
                                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                                            <p className="text-xs text-gray-500">
                                                Issued: {cert.dateIssued.toLocaleDateString()}
                                                {cert.expiryDate && ` • Expires: ${cert.expiryDate.toLocaleDateString()}`}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                certifications: formData.certifications.filter((_, i) => i !== index)
                                            })}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Previous Experience */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold flex items-center">
                            <Briefcase className="w-5 h-5 mr-2" />
                            Previous Work Experience
                        </Label>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    value={newExperience.company}
                                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                                    placeholder="Company name"
                                />
                                <Input
                                    value={newExperience.position}
                                    onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                                    placeholder="Job title"
                                />
                                <Input
                                    type="date"
                                    value={newExperience.startDate}
                                    onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                                />
                                <Input
                                    type="date"
                                    value={newExperience.endDate}
                                    onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                                    placeholder="End date (leave empty if current)"
                                />
                            </div>
                            <Textarea
                                value={newExperience.description}
                                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                                placeholder="Brief description of your role and responsibilities"
                                rows={3}
                            />
                        </div>
                        <Button type="button" onClick={addExperience} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Experience
                        </Button>
                        <div className="space-y-2">
                            {formData.previousExperience.map((exp, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{exp.position} at {exp.company}</p>
                                            <p className="text-sm text-gray-600">
                                                {exp.startDate.toLocaleDateString()} - {exp.endDate ? exp.endDate.toLocaleDateString() : 'Present'}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                previousExperience: formData.previousExperience.filter((_, i) => i !== index)
                                            })}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold flex items-center">
                            <GraduationCap className="w-5 h-5 mr-2" />
                            Education
                        </Label>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    value={newEducation.institution}
                                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                                    placeholder="Institution name"
                                />
                                <Input
                                    value={newEducation.degree}
                                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                                    placeholder="Degree type"
                                />
                                <Input
                                    value={newEducation.fieldOfStudy}
                                    onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
                                    placeholder="Field of study"
                                />
                                <Input
                                    type="number"
                                    value={newEducation.graduationYear}
                                    onChange={(e) => setNewEducation({ ...newEducation, graduationYear: e.target.value })}
                                    placeholder="Graduation year"
                                />
                            </div>
                        </div>
                        <Button type="button" onClick={addEducation} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Education
                        </Button>
                        <div className="space-y-2">
                            {formData.education.map((edu, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{edu.degree} in {edu.fieldOfStudy}</p>
                                            <p className="text-sm text-gray-600">{edu.institution}</p>
                                            <p className="text-xs text-gray-500">Graduated: {edu.graduationYear}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                education: formData.education.filter((_, i) => i !== index)
                                            })}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
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

export default PersonalInfoExtended;
