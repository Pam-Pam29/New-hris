# Asset Request & Starter Kit Implementation Guide

## ✅ Completed:
1. Extended asset types with `AssetRequest` and `StarterKit` interfaces
2. Added request and starter kit methods to asset service (Firebase integrated)
3. Updated employee My Assets page structure with requests tab

## 🔧 Remaining Implementation:

### 1. Add to Employee My Assets (`employee-platform/src/pages/Employee/MyAssets/index.tsx`)

#### Add after `useEffect(() => { loadAssets(); }, [employeeId]);`:

```typescript
// Load employee name
useEffect(() => {
  const loadEmployeeName = async () => {
    try {
      const { getComprehensiveDataFlowService } = await import('../../../services/comprehensiveDataFlowService');
      const dataFlowService = await getComprehensiveDataFlowService();
      const allEmployees = await dataFlowService.getAllEmployees();
      const profile = allEmployees.find(emp => emp.id === employeeId || emp.employeeId === employeeId);
      if (profile) {
        const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`;
        setEmployeeName(fullName);
      }
    } catch (error) {
      console.error('Failed to load employee name:', error);
    }
  };
  loadEmployeeName();
}, [employeeId]);
```

#### Update loadAssets function to include requests:

```typescript
const loadAssets = async () => {
  setLoading(true);
  try {
    // ... existing asset loading code ...

    // Load asset requests
    const requestsQuery = query(
      collection(db, 'assetRequests'),
      where('employeeId', '==', employeeId)
    );
    const requestsSnapshot = await getDocs(requestsQuery);
    const requestsData = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AssetRequest));

    setAssets(assetsData);
    setAssignments(assignmentsData);
    setRequests(requestsData);
    console.log('📦 Loaded assets:', assetsData.length, 'Requests:', requestsData.length);
  } catch (error) {
    console.error('Failed to load assets:', error);
  } finally {
    setLoading(false);
  }
};
```

#### Add request handling functions before `formatDate`:

```typescript
const handleSubmitRequest = async () => {
  if (!requestForm.assetType || !requestForm.category || !requestForm.justification) {
    alert('Please fill in all required fields');
    return;
  }

  setSubmitting(true);
  try {
    const requestsRef = collection(db, 'assetRequests');
    await addDoc(requestsRef, {
      employeeId,
      employeeName,
      assetType: requestForm.assetType,
      category: requestForm.category,
      justification: requestForm.justification,
      priority: requestForm.priority,
      status: 'Pending',
      requestedDate: Timestamp.now()
    });

    console.log('✅ Asset request submitted');
    setShowRequestModal(false);
    setRequestForm({
      assetType: '',
      category: '',
      justification: '',
      priority: 'Medium'
    });
    await loadAssets();
    alert('Asset request submitted successfully!');
  } catch (error) {
    console.error('Failed to submit request:', error);
    alert('Failed to submit asset request');
  } finally {
    setSubmitting(false);
  }
};

const getRequestStatusBadge = (status: AssetRequest['status']) => {
  const colors: Record<AssetRequest['status'], string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Fulfilled': 'bg-blue-100 text-blue-800'
  };

  return (
    <Badge className={colors[status]}>
      <span className="capitalize">{status}</span>
    </Badge>
  );
};

const getPriorityBadge = (priority: AssetRequest['priority']) => {
  const colors: Record<AssetRequest['priority'], string> = {
    'Urgent': 'bg-red-100 text-red-800',
    'High': 'bg-orange-100 text-orange-800',
    'Medium': 'bg-blue-100 text-blue-800',
    'Low': 'bg-gray-100 text-gray-800'
  };

  return (
    <Badge className={colors[priority]}>
      <span className="capitalize">{priority}</span>
    </Badge>
  );
};
```

#### Add before the closing `</Tabs>` tag (after Assignment History tab):

```typescript
        {/* My Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowRequestModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request New Asset
            </Button>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Asset Requests</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't requested any assets yet.
                  </p>
                  <Button onClick={() => setShowRequestModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Your First Asset
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            requests.map(request => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{request.assetType}</h3>
                        <Badge variant="outline">{request.category}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          {getRequestStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Priority:</span>
                          {getPriorityBadge(request.priority)}
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Justification:</p>
                        <p className="text-sm text-gray-600">{request.justification}</p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Requested: {formatDate(request.requestedDate)}
                      </div>

                      {request.status === 'Approved' && request.approvedBy && (
                        <div className="p-2 bg-green-50 rounded text-sm text-green-700">
                          ✅ Approved by {request.approvedBy} on {formatDate(request.approvedDate)}
                        </div>
                      )}

                      {request.status === 'Rejected' && request.rejectedReason && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Rejected:</strong> {request.rejectedReason}
                          </AlertDescription>
                        </Alert>
                      )}

                      {request.status === 'Fulfilled' && (
                        <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
                          🎉 Fulfilled on {formatDate(request.fulfilledDate)} - Asset has been assigned to you
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
```

#### Add Request Modal before the Asset Details Modal:

```typescript
      {/* Request Asset Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Request New Asset</CardTitle>
              <CardDescription>
                Submit a request for an asset you need for your work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="assetType">Asset Type *</Label>
                <Input
                  id="assetType"
                  placeholder="e.g., Laptop, Monitor, Keyboard"
                  value={requestForm.assetType}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, assetType: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={requestForm.category}
                  onValueChange={(value) => setRequestForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={requestForm.priority}
                  onValueChange={(value: any) => setRequestForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="justification">Justification *</Label>
                <Textarea
                  id="justification"
                  placeholder="Explain why you need this asset..."
                  rows={4}
                  value={requestForm.justification}
                  onChange={(e) => setRequestForm(prev => ({ ...prev, justification: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Provide details about how this asset will help you perform your job better
                </p>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestForm({
                      assetType: '',
                      category: '',
                      justification: '',
                      priority: 'Medium'
                    });
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
```

## 📋 Features Implemented:

### Employee Side:
- ✅ View assigned assets
- ✅ View assignment history
- ✅ **NEW: Request new assets**
- ✅ **NEW: Track request status** (Pending/Approved/Rejected/Fulfilled)
- ✅ **NEW: View approval/rejection reasons**
- ✅ Priority levels for requests

### HR Side (to be added):
- View all asset requests
- Approve/Reject requests with reasons
- Fulfill requests by assigning available assets
- Create starter kit templates for job roles/departments
- Auto-assign starter kits during onboarding

### Starter Kit Features (to be added):
- Configure starter kits per department/job title
- Define required vs optional assets
- Specify quantities and specifications
- Auto-assign on employee onboarding
- Track starter kit fulfillment

## 🔥 Quick Implementation Steps:

1. Copy the code snippets above into the My Assets page
2. Test asset request submission
3. Create HR request approval page (next step)
4. Create starter kit management page (next step)
5. Integrate starter kit auto-assignment with onboarding

All Firebase collections are ready:
- `assetRequests` - Asset requests from employees
- `starterKits` - Starter kit templates

