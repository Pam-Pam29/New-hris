import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Laptop, Key, Car, MapPin, Plus, X } from 'lucide-react';
import { EquipmentAccess as EquipmentAccessType } from './services/onboardingService';

interface EquipmentAccessProps {
    onComplete: (data: EquipmentAccessType) => void;
}

const EquipmentAccess: React.FC<EquipmentAccessProps> = ({ onComplete }) => {
    const [formData, setFormData] = useState<EquipmentAccessType>({
        laptopAssigned: false,
        laptopModel: '',
        laptopSerialNumber: '',
        softwareAccess: [],
        buildingAccess: false,
        parkingSpot: '',
        transportationInfo: '',
        deskLocation: '',
        keycardNumber: ''
    });

    const [newSoftware, setNewSoftware] = useState('');

    const addSoftware = () => {
        if (newSoftware.trim()) {
            setFormData({
                ...formData,
                softwareAccess: [...formData.softwareAccess, newSoftware.trim()]
            });
            setNewSoftware('');
        }
    };

    const removeSoftware = (index: number) => {
        setFormData({
            ...formData,
            softwareAccess: formData.softwareAccess.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Equipment & Access Setup
                </CardTitle>
                <CardDescription>
                    Let's get you set up with everything you need for your new role.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Laptop Assignment */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Laptop className="w-6 h-6 text-blue-600" />
                            <Label className="text-lg font-semibold">Laptop Assignment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="laptopAssigned"
                                checked={formData.laptopAssigned}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    laptopAssigned: checked as boolean
                                })}
                            />
                            <Label htmlFor="laptopAssigned">I have been assigned a company laptop</Label>
                        </div>
                        {formData.laptopAssigned && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                <div>
                                    <Label htmlFor="laptopModel">Laptop Model</Label>
                                    <Input
                                        id="laptopModel"
                                        value={formData.laptopModel}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            laptopModel: e.target.value
                                        })}
                                        placeholder="e.g., MacBook Pro 16-inch"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="laptopSerialNumber">Serial Number</Label>
                                    <Input
                                        id="laptopSerialNumber"
                                        value={formData.laptopSerialNumber}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            laptopSerialNumber: e.target.value
                                        })}
                                        placeholder="Serial number"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Software Access */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Software Access</Label>
                        <p className="text-sm text-gray-600">
                            List the software applications you need access to for your role.
                        </p>
                        <div className="flex space-x-2">
                            <Input
                                value={newSoftware}
                                onChange={(e) => setNewSoftware(e.target.value)}
                                placeholder="e.g., Microsoft Office, Slack, Adobe Creative Suite"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftware())}
                            />
                            <Button type="button" onClick={addSoftware} variant="outline">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {formData.softwareAccess.map((software, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <span className="text-sm">{software}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSoftware(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Building Access */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Key className="w-6 h-6 text-green-600" />
                            <Label className="text-lg font-semibold">Building Access</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="buildingAccess"
                                checked={formData.buildingAccess}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    buildingAccess: checked as boolean
                                })}
                            />
                            <Label htmlFor="buildingAccess">I have building access</Label>
                        </div>
                        {formData.buildingAccess && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                <div>
                                    <Label htmlFor="keycardNumber">Keycard Number</Label>
                                    <Input
                                        id="keycardNumber"
                                        value={formData.keycardNumber}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            keycardNumber: e.target.value
                                        })}
                                        placeholder="Keycard number"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="deskLocation">Desk Location</Label>
                                    <Input
                                        id="deskLocation"
                                        value={formData.deskLocation}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            deskLocation: e.target.value
                                        })}
                                        placeholder="e.g., Floor 3, Desk 15"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Parking & Transportation */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Car className="w-6 h-6 text-purple-600" />
                            <Label className="text-lg font-semibold">Parking & Transportation</Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="parkingSpot">Parking Spot</Label>
                                <Input
                                    id="parkingSpot"
                                    value={formData.parkingSpot}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        parkingSpot: e.target.value
                                    })}
                                    placeholder="e.g., Spot A-15, Garage Level 2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="transportationInfo">Transportation Info</Label>
                                <Input
                                    id="transportationInfo"
                                    value={formData.transportationInfo}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        transportationInfo: e.target.value
                                    })}
                                    placeholder="e.g., Public transport, Bike, Car"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Information Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• IT will review your software access requests</li>
                                    <li>• Your keycard will be activated within 24 hours</li>
                                    <li>• Equipment will be delivered to your desk location</li>
                                    <li>• You'll receive an email confirmation for all access</li>
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

export default EquipmentAccess;
