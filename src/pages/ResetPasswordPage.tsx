import React from 'react';
import GenericRegistrationForm from "@/pages/GenericRegistrationForm.tsx";
import {FormMode} from "@/hooks/use-registration-form.ts";

const ResetPasswordPage: React.FC = () => {

    return (
        <GenericRegistrationForm
            formMode={FormMode.PASSWORD_RESET}
            title="Reset your password"
            sendCodeLabel="Send reset code"
            submitLoadingLabel="Resetting..."
            submitLabel="Reset Password"
            secondaryText="Remembered your password?"
            secondaryLinkText="Sign in"
            secondaryLinkTo="/login"
        />
    );
};

export default ResetPasswordPage;
