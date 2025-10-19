import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import {
    Package,
    Laptop,
    Monitor,
    Smartphone,
    Headphones,
    Mouse,
    Keyboard,
    Calendar,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Clock,
    Star,
    Gift,
    TrendingUp,
    Wrench,
    DollarSign,
    User,
    Users,
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { Asset } from './types';
import { Employee } from '../../EmployeeManagement/types';

interface EmployeeAssetAssignmentsProps {
    assets: Asset[];
    employees: Employee[];
    onAssignAsset: (assetId: string, employeeId: string) => void;
    onCreateNewEmployeeKit: (employeeId: string) => void;
}

export default function EmployeeAssetAssignments({
    assets,
    employees,
    onAssignAsset,
    onCreateNewEmployeeKit
}: EmployeeAssetAssignmentsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);

    // Get employee assignments
    const employeeAssignments = employees.map(employee => {
        // Try matching by both id and name since assignedTo might use either
        const assignedAssets = assets.filter(asset => {
            const matches = asset.assignedTo === employee.id ||
                asset.assignedTo === employee.name ||
                asset.assignedTo === (employee as any).employeeId;

            return matches;
        });
        const totalValue = assignedAssets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
        const essentialAssets = assignedAssets.filter(asset => asset.isEssential);
        const criticalAssets = assignedAssets.filter(asset => asset.priority === 'Critical');

        return {
            employee,
            assignedAssets,
            totalValue,
            essentialAssets,
            criticalAssets,
            hasCompleteKit: essentialAssets.length >= 3 // Assuming 3 essential items for complete kit
        };
    });

    // Get new employees (those without any assets)
    const newEmployees = employees.filter(employee =>
        !assets.some(asset =>
            asset.assignedTo === employee.id ||
            asset.assignedTo === employee.name ||
            asset.assignedTo === (employee as any).employeeId
        )
    );

    // Get available starter kit assets
    const starterKitAssets = assets.filter(asset =>
        asset.status === 'Available' && asset.isEssential
    );

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'laptop': return <Laptop className="h-5 w-5" />;
            case 'monitor': return <Monitor className="h-5 w-5" />;
            case 'phone': return <Smartphone className="h-5 w-5" />;
            case 'headphones': return <Headphones className="h-5 w-5" />;
            case 'mouse': return <Mouse className="h-5 w-5" />;
            case 'keyboard': return <Keyboard className="h-5 w-5" />;
            default: return <Package className="h-5 w-5" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredAssignments = employeeAssignments.filter(assignment => {
        const matchesSearch = assignment.employee.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'complete' && assignment.hasCompleteKit) ||
            (filterStatus === 'incomplete' && !assignment.hasCompleteKit);

        return matchesSearch && matchesStatus;
    });

    const totalEmployees = employees.length;
    const employeesWithAssets = employeeAssignments.filter(a => a.assignedAssets.length > 0).length;
    const employeesWithCompleteKits = employeeAssignments.filter(a => a.hasCompleteKit).length;
    const totalAssetValue = employeeAssignments.reduce((sum, a) => sum + a.totalValue, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Employee Asset Assignments</h2>
                    <p className="text-gray-600">View assets assigned to each employee. Use the "Starter Kits" tab to assign kits to new employees.</p>
                </div>
            </div>


            {/* Employee Assignments */}
            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-gray-800">Employee Asset Assignments</CardTitle>
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                            >
                                <option value="all">All Employees</option>
                                <option value="complete">Complete Kits</option>
                                <option value="incomplete">Incomplete Kits</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAssignments.map((assignment) => (
                            <div key={assignment.employee.id} className="border-2 border-gray-200 rounded-lg p-6 space-y-4 bg-white hover:shadow-md hover:border-blue-300 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{assignment.employee.name}</h4>
                                            <p className="text-sm text-gray-500">{assignment.employee.position}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Badge className={assignment.hasCompleteKit ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                            {assignment.hasCompleteKit ? 'Complete' : 'Incomplete'}
                                        </Badge>
                                        <span className="text-xs text-gray-500">{assignment.assignedAssets.length} assets</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Total Value:</span>
                                        <span className="font-semibold">${assignment.totalValue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Essential:</span>
                                        <span>{assignment.essentialAssets.length}/3</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Critical:</span>
                                        <span>{assignment.criticalAssets.length}</span>
                                    </div>
                                </div>

                                {assignment.assignedAssets.length > 0 && (
                                    <div className="space-y-2">
                                        <h5 className="font-medium text-sm text-gray-700">Assigned Assets:</h5>
                                        <div className="space-y-1">
                                            {assignment.assignedAssets.slice(0, 3).map((asset) => (
                                                <div key={asset.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                                    <div className="flex items-center space-x-2">
                                                        {getCategoryIcon(asset.category)}
                                                        <span>{asset.name}</span>
                                                    </div>
                                                    <Badge className={`${getPriorityColor(asset.priority)} text-xs`}>
                                                        {asset.priority}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {assignment.assignedAssets.length > 3 && (
                                                <p className="text-xs text-gray-500 text-center">
                                                    +{assignment.assignedAssets.length - 3} more assets
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedEmployee(assignment.employee);
                                            setShowDetailsModal(true);
                                        }}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedEmployee(assignment.employee);
                                            setShowManageModal(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Manage
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredAssignments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No employee assignments found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Details Modal */}
            {showDetailsModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{selectedEmployee.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedEmployee.position} • {selectedEmployee.department}</p>
                                </div>
                                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                                    ✕
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {(() => {
                                const employeeAssets = assets.filter(a => a.assignedTo === selectedEmployee.id);
                                const totalValue = employeeAssets.reduce((sum, a) => sum + a.purchasePrice, 0);

                                return (
                                    <>
                                        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Assets</p>
                                                <p className="text-2xl font-bold">{employeeAssets.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Value</p>
                                                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Essential Assets</p>
                                                <p className="text-2xl font-bold">{employeeAssets.filter(a => a.isEssential).length}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold mb-3">Assigned Assets:</h3>
                                            {employeeAssets.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                                    <p>No assets assigned to this employee</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {employeeAssets.map(asset => (
                                                        <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                {getCategoryIcon(asset.category)}
                                                                <div>
                                                                    <p className="font-medium">{asset.name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {asset.serialNumber} • {asset.category} • {asset.condition}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <Badge className={getPriorityColor(asset.priority)}>
                                                                    {asset.priority}
                                                                </Badge>
                                                                <p className="text-sm font-semibold mt-1">₦{asset.purchasePrice.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Manage Assets Modal */}
            {showManageModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Manage Assets - {selectedEmployee.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Assign or unassign assets for this employee</p>
                                </div>
                                <Button variant="outline" onClick={() => setShowManageModal(false)}>
                                    ✕
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {(() => {
                                const employeeAssets = assets.filter(a => a.assignedTo === selectedEmployee.id);
                                const availableAssets = assets.filter(a => a.status === 'Available');

                                return (
                                    <>
                                        {/* Currently Assigned */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold">Currently Assigned ({employeeAssets.length}):</h3>
                                                {employeeAssets.length > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="text-xs"
                                                        onClick={async () => {
                                                            if (confirm(`⚠️ Unassign ALL ${employeeAssets.length} assets from ${selectedEmployee.name}?\n\nThis will make all their assets available again.`)) {
                                                                console.log(`🗑️ Unassigning all ${employeeAssets.length} assets from ${selectedEmployee.name}`);

                                                                // Unassign all assets
                                                                for (const asset of employeeAssets) {
                                                                    await onAssignAsset(asset.id, ''); // Empty string to unassign
                                                                    console.log(`   ✅ Unassigned: ${asset.name}`);
                                                                }

                                                                console.log(`🎉 All assets unassigned from ${selectedEmployee.name}`);
                                                                console.log('⏳ Waiting 3 seconds for Firebase to fully propagate changes...');

                                                                // Wait for Firebase to fully update (3 seconds for maximum safety)
                                                                await new Promise(resolve => setTimeout(resolve, 3000));

                                                                console.log('✅ Firebase should be updated now. Safe to re-assign!');
                                                                setShowManageModal(false);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Unassign All
                                                    </Button>
                                                )}
                                            </div>
                                            {employeeAssets.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No assets assigned</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {employeeAssets.map(asset => (
                                                        <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                                                            <div className="flex items-center space-x-3">
                                                                {getCategoryIcon(asset.category)}
                                                                <div>
                                                                    <p className="font-medium text-sm">{asset.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{asset.serialNumber}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:bg-red-50"
                                                                onClick={() => {
                                                                    if (confirm(`Unassign ${asset.name} from ${selectedEmployee.name}?`)) {
                                                                        // This will trigger the unassign through parent
                                                                        onAssignAsset(asset.id, ''); // Empty string to unassign
                                                                        setShowManageModal(false);
                                                                    }
                                                                }}
                                                            >
                                                                Unassign
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Available to Assign */}
                                        <div>
                                            <h3 className="font-semibold mb-3">Available Assets ({availableAssets.length}):</h3>
                                            {availableAssets.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No available assets</p>
                                            ) : (
                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    {availableAssets.map(asset => (
                                                        <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                                            <div className="flex items-center space-x-3">
                                                                {getCategoryIcon(asset.category)}
                                                                <div>
                                                                    <p className="font-medium text-sm">{asset.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{asset.serialNumber} • {asset.category}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => {
                                                                    onAssignAsset(asset.id, selectedEmployee.id);
                                                                    setShowManageModal(false);
                                                                }}
                                                            >
                                                                Assign
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
