import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertCircleIcon, Loader2} from 'lucide-react';
import {Link} from 'react-router-dom';
import {FormMode, useRegistrationForm} from "@/hooks/use-registration-form.ts";

export interface VerificationFormProps {
    formMode: FormMode;
    title: string;
    sendCodeLabel: string;
    submitLoadingLabel: string;
    submitLabel: string;
    secondaryText: string;
    secondaryLinkText: string;
    secondaryLinkTo: string;
}

const GenericRegistrationForm: React.FC<VerificationFormProps> = ({
                                                                      formMode,
                                                                      title,
                                                                      sendCodeLabel,
                                                                      submitLoadingLabel,
                                                                      submitLabel,
                                                                      secondaryText,
                                                                      secondaryLinkText,
                                                                      secondaryLinkTo
                                                                  }) => {
    const {
        email,
        emailError,
        codeSent,
        confirmationCode,
        codeError,
        password,
        confirmPassword,
        passwordErrors,
        confirmError,
        sendCodeLoading,
        submitLoading,
        submitError,
        secondsLeft,
        handleEmailChange,
        handleSendCode,
        handleCodeChange,
        handlePasswordChange,
        handleConfirmChange,
        handleSubmit,
    } = useRegistrationForm({mode: formMode});

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
                </CardHeader>

                <CardContent>
                    {(submitError || confirmError || codeError) && (
                        <Alert variant="destructive" className="mb-4" role="alert" aria-live="assertive">
                            <AlertCircleIcon />
                            <AlertDescription>{submitError ?? confirmError ?? codeError}</AlertDescription>
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
                            ) : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : sendCodeLabel}
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
                                    onChange={handleCodeChange}
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
                            {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {submitLoading ? submitLoadingLabel : submitLabel}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        {secondaryText}{' '}
                        <Link to={secondaryLinkTo} className="text-primary hover:underline">
                            {secondaryLinkText}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GenericRegistrationForm;
