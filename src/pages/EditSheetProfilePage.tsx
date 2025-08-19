import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';
import {Card, CardContent, CardHeader, CardTitle,} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {CheckIcon, InfoIcon, Loader2, XIcon} from 'lucide-react';
import type {SheetProfileResponse} from '@/services/SheetApiClient';
import SheetApiClient from '@/services/SheetApiClient';
import {Separator} from '@/components/ui/separator';
import {extractErrorCode} from "@/services/ApiService.ts";
import {notifier} from "@/services/NotificationService.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";

const EditSheetProfilePage: React.FC = () => {
    const {uuid} = useParams<{ uuid: string }>();
    const {t} = useTranslation();
    const navigate = useNavigate();

    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isProfileUpdateLoading, setIsProfileUpdateLoading] = useState(false);
    const [isProfileNameValidLoading, setProfileNameValidLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profileNameError, setProfileNameError] = useState<string | null>(null);
    const [profile, setProfile] = useState<SheetProfileResponse | null>(null);

    useEffect(() => {
        if (!uuid) {
            const message = t('pages.editSheetProfilePage.notifications.missingUuid');
            setError(message);
            notifier.error(message);
            return;
        }

        setIsProfileLoading(true);
        SheetApiClient.fetchProfile(uuid)
            .then(response => setProfile(response))
            .catch(error => {
                const errorCode = extractErrorCode(error);
                const messageKey = errorCode ? `errors.codes.${errorCode}` : 'errors.codes.UNKNOWN';
                const message = t(messageKey, {defaultValue: t('errors.codes.UNKNOWN')})
                setError(message);
                notifier.error(message);
            })
            .finally(() => setIsProfileLoading(false));
    }, []);

    const handleChangeProfileName = (value: string) => {
        if (!profile) return;
        setProfile({
            ...profile,
            name: value,
        });
        if (profileNameError) setProfileNameError(null);
    };

    const handleProfileNameBlur = async () => {
        await validateProfileName();
    };

    const validateProfileName = async (): Promise<boolean> => {
        if (!profile) return false;
        if (!profile.name || profile.name.trim().length === 0) {
            const message = t('pages.createSheetProfilePage.validation.profileNameRequired');
            setProfileNameError(message);
            return false;
        }

        setProfileNameValidLoading(true);
        setProfileNameError(null);
        try {
            await SheetApiClient.validateProfileParts({uuid: profile.uuid, name: profile.name});
            return true;
        } catch (error: unknown) {
            const errorCode = extractErrorCode(error);
            const messageKey = errorCode ? `errors.codes.${errorCode}` : 'pages.editSheetProfilePage.validation.profileNameTaken';
            const message = t(messageKey, {defaultValue: t('errors.codes.UNKNOWN')});
            setProfileNameError(message);
            notifier.error(message);
            return false;
        } finally {
            setProfileNameValidLoading(false);
        }
    };

    const handleUpdate = async () => {
        setIsProfileUpdateLoading(true);
        try {
            if (profile === null || error) return;
            const isValid = await validateProfileName();
            if (!isValid) return;
            await SheetApiClient.updateProfile(profile.uuid, {name: profile.name});
            notifier.success(t('pages.editSheetProfilePage.notifications.updateSuccess'));
        } catch (error: unknown) {
            const errorCode = extractErrorCode(error);
            const messageKey = errorCode ? `errors.codes.${errorCode}` : 'pages.editSheetProfilePage.notifications.updateError';
            const message = t(messageKey, {defaultValue: t('errors.codes.UNKNOWN')});
            notifier.error(message);
        } finally {
            setIsProfileUpdateLoading(false);
        }
    };

    if (isProfileLoading || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <Button variant="outline"
                            onClick={() => navigate('../sheet-profiles')}
                            className="w-full">
                        ← {t('common.form.back', 'Back')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-0 px-0 sm:py-8 sm:px-4">
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader className="space-y-0">
                    <CardTitle className="text-2xl font-bold text-center">
                        {t('pages.editSheetProfilePage.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-1">
                        <Label htmlFor="sheetId">
                            {t('pages.editSheetProfilePage.input.sheetId.label')}
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <div
                                    id="sheetId"
                                    className="w-full rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono text-muted-foreground overflow-hidden truncate"
                                    aria-label={t('pages.editSheetProfilePage.input.sheetId.label', 'Sheet ID') as string}
                                >
                                    {profile?.sheetId}
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto max-w-[90vw] sm:max-w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <p className="text-muted-foreground text-sm break-all">
                                            {profile?.sheetId}
                                        </p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1">
                        <div className="flex gap-1">
                            <Label
                                htmlFor="profileName">{t('pages.editSheetProfilePage.input.profileName.label')}</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <InfoIcon className="w-4 h-4 cursor-pointer" aria-hidden="true"/>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground text-sm">
                                                {t('pages.createSheetProfilePage.input.profileName.hint')}
                                            </p>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Input
                            id="profileName"
                            value={profile?.name}
                            onChange={(e) => handleChangeProfileName(e.target.value)}
                            onBlur={handleProfileNameBlur}
                            disabled={isProfileNameValidLoading || isProfileUpdateLoading}
                        />
                        {profileNameError && <Alert
                            variant="destructive"><AlertDescription>{profileNameError}</AlertDescription></Alert>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="agentType">
                            {t('pages.editSheetProfilePage.input.agentType.label')}
                        </Label>
                        <Badge variant="secondary" className="w-fit">
                            {profile.sheetAgentType}
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="verified">
                            {t('pages.editSheetProfilePage.input.verified.label')}
                        </Label>
                        <div id="verified" className="flex items-center gap-2">
                            {profile.verifiedSheet ? (
                                <CheckIcon className="w-4 h-4 text-green-500" aria-label="Verified"/>
                            ) : (
                                <XIcon className="w-4 h-4 text-red-500" aria-label="Not verified"/>
                            )}
                        </div>
                    </div>

                    <Separator/>

                    <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="w-full sm:w-1/3 order-3 sm:order-1"
                            onClick={() => navigate('../sheet-profiles')}
                        >
                            ← {t('common.form.back', 'Back')}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full sm:w-1/3 order-2 sm:order-2"
                            onClick={() => navigate(`../sheet-profiles/manage-access/${profile.uuid}`)}
                        >
                            {t('pages.manageSheetProfileAccessPage.button.manageAccess', 'Manage access')}
                        </Button>
                        <Button
                            className="w-full sm:w-1/3 order-1 sm:order-3"
                            onClick={handleUpdate}
                            disabled={!!error || isProfileUpdateLoading}
                        >
                            {isProfileUpdateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isProfileUpdateLoading
                                ? t('pages.editSheetProfilePage.button.update.loading')
                                : t('pages.editSheetProfilePage.button.update.default')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditSheetProfilePage;
