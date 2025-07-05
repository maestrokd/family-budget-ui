import React from 'react';
import {FormMode} from "@/hooks/use-registration-form.ts";
import GenericRegistrationForm from "@/pages/GenericRegistrationForm.tsx";

const RegistrationPage: React.FC = () => {

    return (
        <GenericRegistrationForm
            formMode={FormMode.REGISTRATION}
            title="Create your account"
            sendCodeLabel="Send Confirmation Code"
            submitLoadingLabel="Creating account..."
            submitLabel="Sign up"
            secondaryText="Already have an account?"
            secondaryLinkText="Sign in"
            secondaryLinkTo="/login"
        />
    );
};

export default RegistrationPage;
