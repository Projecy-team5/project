import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  DollarSign, 
  Play, 
  Square, 
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Shifts = () => {
    const [currentShift, setCurrentShift] = useState(null);
    const [openingCash, setOpeningCash] = useState('');
    const [closingCash, setClosingCash] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loadCurrent = async () => {
        try {
            const res = await axios.get('https://localhost:7048/api/Shifts/current');
            setCurrentShift(res.data);
        } catch (err) {
            setCurrentShift(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        loadCurrent(); 
    }, []);

    const openShift = async () => {
        if (!openingCash) return;
        setActionLoading(true);
        try {
            await axios.post('https://localhost:7048/api/Shifts/open', { openingCash: parseFloat(openingCash) });
            setMessage('Shift opened successfully!');
            setOpeningCash('');
            loadCurrent();
        } catch (err) {
            setMessage('Error: ' + (err.response?.data || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    const closeShift = async () => {
        if (!closingCash) return;
        setActionLoading(true);
        try {
            const res = await axios.post('https://localhost:7048/api/Shifts/close', { closingCash: parseFloat(closingCash) });
            setMessage(`Shift closed! Difference: $${res.data.difference.toFixed(2)}`);
            setClosingCash('');
            setCurrentShift(null);
            loadCurrent();
        } catch (err) {
            setMessage('Error: ' + (err.response?.data || err.message));
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Clock className="h-8 w-8" />
                        Shift Management
                    </h1>
                    <p className="text-muted-foreground">Manage your work shifts and cash reconciliation</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading shift status...</span>
                </div>
            ) : currentShift ? (
                /* Shift Active Card */
                <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                                <CardTitle>Shift Active</CardTitle>
                            </div>
                            <Badge variant="success">Open</Badge>
                        </div>
                        <CardDescription>Your current shift is in progress</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Shift Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-background rounded-lg p-4 border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Play className="h-4 w-4" />
                                    <span className="text-sm">Started</span>
                                </div>
                                <p className="font-semibold">{formatDate(currentShift.startTime)}</p>
                            </div>
                            <div className="bg-background rounded-lg p-4 border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-sm">Opening Cash</span>
                                </div>
                                <p className="font-semibold">${currentShift.openingCash.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Close Shift Form */}
                        <div className="bg-background rounded-lg p-6 border">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Square className="h-4 w-4 text-red-500" />
                                Close Shift
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={closingCash}
                                        onChange={e => setClosingCash(e.target.value)}
                                        placeholder="Enter closing cash amount"
                                        className="h-12"
                                    />
                                </div>
                                <Button 
                                    onClick={closeShift} 
                                    disabled={!closingCash || actionLoading}
                                    variant="destructive"
                                    className="h-12 px-6"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Square className="h-4 w-4 mr-2" />
                                    )}
                                    Close Shift
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* No Shift Card */
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                <CardTitle>No Active Shift</CardTitle>
                            </div>
                            <Badge variant="warning">Closed</Badge>
                        </div>
                        <CardDescription>Start a new shift to begin processing orders</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-background rounded-lg p-6 border">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Play className="h-4 w-4 text-green-500" />
                                Open New Shift
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={openingCash}
                                        onChange={e => setOpeningCash(e.target.value)}
                                        placeholder="Enter opening cash amount"
                                        className="h-12"
                                    />
                                </div>
                                <Button 
                                    onClick={openShift} 
                                    disabled={!openingCash || actionLoading}
                                    className="h-12 px-6 bg-green-600 hover:bg-green-700"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Play className="h-4 w-4 mr-2" />
                                    )}
                                    Open Shift
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Message Alert */}
            {message && (
                <div className={`rounded-lg p-4 ${
                    message.includes('Error') 
                        ? 'bg-red-50 text-red-600 dark:bg-red-950 border border-red-200' 
                        : 'bg-green-50 text-green-600 dark:bg-green-950 border border-green-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {message.includes('Error') ? (
                            <AlertCircle className="h-5 w-5" />
                        ) : (
                            <CheckCircle className="h-5 w-5" />
                        )}
                        <span className="font-medium">{message}</span>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How Shift Management Works</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="font-bold text-primary">1</span>
                            </div>
                            <div>
                                <h4 className="font-semibold">Open Shift</h4>
                                <p className="text-sm text-muted-foreground">Enter the opening cash amount to start your shift</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="font-bold text-primary">2</span>
                            </div>
                            <div>
                                <h4 className="font-semibold">Process Orders</h4>
                                <p className="text-sm text-muted-foreground">Use the POS to process orders throughout your shift</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="font-bold text-primary">3</span>
                            </div>
                            <div>
                                <h4 className="font-semibold">Close Shift</h4>
                                <p className="text-sm text-muted-foreground">Enter the closing cash amount to end your shift</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Shifts;
