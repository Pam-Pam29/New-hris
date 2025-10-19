import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    Phone,
    User,
    Plus,
    Trash2,
    AlertCircle,
    Loader
} from 'lucide-react';
import { EmergencyContact } from './services/onboardingService';

interface EmergencyContactsFormProps {
    employeeId: string;
    progress: any;
    onComplete: (data: EmergencyContact[]) => void;
    onError: (error: string) => void;
}

const EmergencyContactsForm: React.FC<EmergencyContactsFormProps> = ({
    employeeId,
    progress,
    onComplete,
    onError
}) => {
    const [contacts, setContacts] = useState<EmergencyContact[]>([
        {
            name: '',
            relationship: '',
            phoneNumber: '',
            email: '',
            address: '',
            isPrimary: true
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        contacts.forEach((contact, index) => {
            if (!contact.name.trim()) {
                newErrors[`contact_${index}_name`] = 'Name is required';
            }

            if (!contact.relationship.trim()) {
                newErrors[`contact_${index}_relationship`] = 'Relationship is required';
            }

            if (!contact.phoneNumber.trim()) {
                newErrors[`contact_${index}_phone`] = 'Phone number is required';
            }

            if (!contact.address.trim()) {
                newErrors[`contact_${index}_address`] = 'Address is required';
            }
        });

        // Check if at least one primary contact is set
        const hasPrimary = contacts.some(contact => contact.isPrimary);
        if (!hasPrimary) {
            newErrors.primary = 'At least one contact must be marked as primary';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            onComplete(contacts);
        } catch (error) {
            onError('Failed to save emergency contacts');
        } finally {
            setIsLoading(false);
        }
    };

    const addContact = () => {
        setContacts(prev => [...prev, {
            name: '',
            relationship: '',
            phoneNumber: '',
            email: '',
            address: '',
            isPrimary: false
        }]);
    };

    const removeContact = (index: number) => {
        if (contacts.length > 1) {
            setContacts(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateContact = (index: number, field: keyof EmergencyContact, value: any) => {
        setContacts(prev => prev.map((contact, i) => {
            if (i === index) {
                return { ...contact, [field]: value };
            }
            return contact;
        }));

        // Clear error when user starts typing
        const errorKey = `contact_${index}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({
                ...prev,
                [errorKey]: ''
            }));
        }
    };

    const setPrimaryContact = (index: number) => {
        setContacts(prev => prev.map((contact, i) => ({
            ...contact,
            isPrimary: i === index
        })));

        // Clear primary error
        if (errors.primary) {
            setErrors(prev => ({
                ...prev,
                primary: ''
            }));
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Phone className="h-5 w-5" />
                        <span>Emergency Contacts</span>
                    </CardTitle>
                    <CardDescription>
                        Please provide at least one emergency contact. This information will be used in case of emergencies.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {contacts.map((contact, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">
                                        Emergency Contact {index + 1}
                                    </h4>
                                    {contacts.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeContact(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`name_${index}`}>Full Name *</Label>
                                        <Input
                                            id={`name_${index}`}
                                            value={contact.name}
                                            onChange={(e) => updateContact(index, 'name', e.target.value)}
                                            placeholder="Enter full name"
                                            className={errors[`contact_${index}_name`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`contact_${index}_name`] && (
                                            <p className="text-sm text-red-600">{errors[`contact_${index}_name`]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`relationship_${index}`}>Relationship *</Label>
                                        <Input
                                            id={`relationship_${index}`}
                                            value={contact.relationship}
                                            onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                                            placeholder="e.g., Spouse, Parent, Sibling"
                                            className={errors[`contact_${index}_relationship`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`contact_${index}_relationship`] && (
                                            <p className="text-sm text-red-600">{errors[`contact_${index}_relationship`]}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`phone_${index}`}>Phone Number *</Label>
                                        <Input
                                            id={`phone_${index}`}
                                            value={contact.phoneNumber}
                                            onChange={(e) => updateContact(index, 'phoneNumber', e.target.value)}
                                            placeholder="Enter phone number"
                                            className={errors[`contact_${index}_phone`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`contact_${index}_phone`] && (
                                            <p className="text-sm text-red-600">{errors[`contact_${index}_phone`]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`email_${index}`}>Email (Optional)</Label>
                                        <Input
                                            id={`email_${index}`}
                                            type="email"
                                            value={contact.email}
                                            onChange={(e) => updateContact(index, 'email', e.target.value)}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`address_${index}`}>Address *</Label>
                                    <Input
                                        id={`address_${index}`}
                                        value={contact.address}
                                        onChange={(e) => updateContact(index, 'address', e.target.value)}
                                        placeholder="Enter full address"
                                        className={errors[`contact_${index}_address`] ? 'border-red-500' : ''}
                                    />
                                    {errors[`contact_${index}_address`] && (
                                        <p className="text-sm text-red-600">{errors[`contact_${index}_address`]}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`primary_${index}`}
                                        checked={contact.isPrimary}
                                        onChange={() => setPrimaryContact(index)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor={`primary_${index}`} className="text-sm">
                                        This is my primary emergency contact
                                    </Label>
                                </div>
                            </div>
                        ))}

                        {errors.primary && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.primary}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addContact}
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Emergency Contact
                        </Button>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="px-8"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </span>
                                ) : (
                                    'Continue to Next Step'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmergencyContactsForm;





