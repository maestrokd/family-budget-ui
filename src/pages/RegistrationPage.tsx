import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.tsx';
import WebApp from '@twa-dev/sdk';
import axios from "axios";
import type { ApiErrorResponse } from "@/services/ApiService.ts";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegistrationPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);

    const [codeSent, setCodeSent] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [codeError, setCodeError] = useState<string | null>(null);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [confirmError, setConfirmError] = useState<string | null>(null);

    const [sendCodeLoading, setSendCodeLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [secondsLeft, setSecondsLeft] = useState(0);

    const navigate = useNavigate();
    const { doRegister, sendConfirmationCode, isTelegram } = useAuth();

    // Countdown effect for resend timer
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    const validatePasswordRules = (value: string): string[] => {
        const errors: string[] = [];
        if (value.length < 8 || value.length > 20) {
            errors.push('must be between 8 and 20 characters');
        }
        if (!/[A-Z]/.test(value)) {
            errors.push('must include at least one uppercase letter');
        }
        if (!/[a-z]/.test(value)) {
            errors.push('must include at least one lowercase letter');
        }
        if (!/\d/.test(value)) {
            errors.push('must include at least one number');
        }
        if (!/[^A-Za-z0-9]/.test(value)) {
            errors.push('must include at least one special character');
        }
        return errors;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setCodeSent(false);
        setConfirmationCode('');
        setCodeError(null);
        setSecondsLeft(0);

        if (!value) {
            setEmailError(null);
        } else if (!emailRegex.test(value)) {
            setEmailError('invalid email address');
        } else {
            setEmailError(null);
        }
    };

    const handleSendCode = async () => {
        if (emailError || !email || secondsLeft > 0) return;
        setSendCodeLoading(true);
        setCodeError(null);

        try {
            await sendConfirmationCode(email);
            setCodeSent(true);
            setSecondsLeft(60);
        } catch (error: unknown) {
            let message = 'Failed to send confirmation code.';
            if (axios.isAxiosError(error) && error.response?.data) {
                const data = error.response.data as ApiErrorResponse;
                message = data.message;
            }
            setCodeError(message);
        } finally {
            setSendCodeLoading(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        setPasswordErrors(validatePasswordRules(value));
        if (confirmPassword && value !== confirmPassword) {
            setConfirmError('passwords do not match');
        } else {
            setConfirmError(null);
        }
    };

    const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (password && password !== value) {
            setConfirmError('passwords do not match');
        } else {
            setConfirmError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            emailError ||
            !confirmationCode ||
            codeError ||
            passwordErrors.length > 0 ||
            confirmError
        ) return;
        setSubmitLoading(true);
        setSubmitError(null);

        try {
            await doRegister(email, password, confirmPassword, confirmationCode);
            if (isTelegram) {
                WebApp.close();
            } else {
                navigate('/', { replace: true });
            }
        } catch (error: unknown) {
            let message = 'Registration failed. Please try again.';
            if (axios.isAxiosError(error) && error.response?.data) {
                const data = error.response.data as ApiErrorResponse;
                message = data.message;
            }
            setSubmitError(message);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
                </CardHeader>

                <CardContent>
                    {(submitError || confirmError) && (
                        <Alert variant="destructive" className="mb-4" role="alert" aria-live="assertive">
                            <AlertDescription>{submitError || confirmError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                disabled={sendCodeLoading || submitLoading}
                                autoFocus
                            />
                            {emailError && (
                                <Alert variant="destructive" className="mt-2" role="alert" aria-live="assertive">
                                    <AlertDescription>{emailError}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Send Confirmation Code */}
                        <Button
                            type="button"
                            className="w-full flex items-center justify-center"
                            onClick={handleSendCode}
                            disabled={sendCodeLoading || submitLoading || !!emailError || !email || secondsLeft > 0}
                        >
                            {sendCodeLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Sending...
                                </>
                            ) : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Send Confirmation Code'}
                        </Button>

                        {/* Confirmation Code */}
                        {codeSent && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmationCode">Confirmation Code</Label>
                                <Input
                                    id="confirmationCode"
                                    type="text"
                                    placeholder="123456"
                                    required
                                    value={confirmationCode}
                                    onChange={(e) => {
                                        setConfirmationCode(e.target.value);
                                        setCodeError(null);
                                    }}
                                    disabled={sendCodeLoading || submitLoading}
                                />
                                {codeError && (
                                    <Alert variant="destructive" className="mt-2" role="alert" aria-live="assertive">
                                        <AlertDescription>{codeError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={handlePasswordChange}
                                disabled={submitLoading}
                            />
                            {passwordErrors.length > 0 && (
                                <Alert variant="destructive" className="mt-2" role="alert" aria-live="assertive">
                                    <AlertDescription>
                                        <ul className="list-disc list-inside space-y-1">
                                            {passwordErrors.map((msg, idx) => (
                                                <li key={idx}>{msg}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={handleConfirmChange}
                                disabled={submitLoading}
                            />
                            {confirmError && (
                                <Alert variant="destructive" className="mt-2" role="alert" aria-live="assertive">
                                    <AlertDescription>{confirmError}</AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            className="w-full flex items-center justify-center"
                            type="submit"
                            disabled={
                                submitLoading ||
                                sendCodeLoading ||
                                !email ||
                                !!emailError ||
                                !confirmationCode ||
                                !!codeError ||
                                !password ||
                                !confirmPassword ||
                                passwordErrors.length > 0 ||
                                !!confirmError
                            }
                        >
                            {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submitLoading ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegistrationPage;
