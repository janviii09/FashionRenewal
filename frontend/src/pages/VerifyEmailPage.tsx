import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided');
            return;
        }

        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            setStatus('loading');
            const response = await api.post('/auth/verify-email', { token });

            if (response.data.success) {
                setStatus('success');
                setMessage(response.data.message);

                toast({
                    title: 'Email Verified!',
                    description: 'Your email has been successfully verified.',
                });

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(response.data.message);
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to verify email');

            toast({
                title: 'Verification Failed',
                description: error.response?.data?.message || 'Failed to verify email',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                        {status === 'loading' && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                        {status === 'success' && <CheckCircle2 className="h-8 w-8 text-green-500" />}
                        {status === 'error' && <XCircle className="h-8 w-8 text-destructive" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' && 'Please wait while we verify your email address'}
                        {status === 'success' && 'You will be redirected to login shortly'}
                        {status === 'error' && 'There was a problem verifying your email'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {message && (
                        <div className={`rounded-lg p-4 text-center text-sm ${status === 'success'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : status === 'error'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                            {message}
                        </div>
                    )}

                    {status === 'success' && (
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full"
                            variant="gradient"
                        >
                            Go to Login
                        </Button>
                    )}

                    {status === 'error' && (
                        <div className="space-y-2">
                            <Button
                                onClick={() => navigate('/signup')}
                                className="w-full"
                                variant="outline"
                            >
                                Back to Signup
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                className="w-full"
                                variant="ghost"
                            >
                                Go to Home
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
