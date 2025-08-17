import {type FormEvent, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {InfoIcon, Loader2} from 'lucide-react';
import {notifier} from '@/services/NotificationService';
import SheetApiClient, {type SheetProfileInstructionDetailsResponse} from '@/services/SheetApiClient';
import {extractErrorCode} from "@/services/ApiService.ts";
import {ImagePreviewList} from "@/components/image/ImagePreviewList.tsx";
import {Link, useNavigate} from "react-router-dom";

import step1Image1Mobile from "@/assets/images/instructions/mobile/2-M-make-copy-menu-button.jpg";
import step1Image2Mobile from "@/assets/images/instructions/mobile/3-M-make-copy-export.jpg";
import step1Image3Mobile from "@/assets/images/instructions/mobile/4-M-make-copy-menu.jpg";
import step1Image4Mobile from "@/assets/images/instructions/mobile/5-M-make-copy-name.jpg";

import step1Image1Web from "@/assets/images/instructions/web/2-make-copy-menu.png";
import step1Image2Web from "@/assets/images/instructions/web/3-make-copy-name.png";

import step2Image1Mobile from "@/assets/images/instructions/mobile/6-M-share-menu-1.jpg";
import step2Image2Mobile from "@/assets/images/instructions/mobile/7-M-share-menu-2.jpg";
import step2Image3Mobile from "@/assets/images/instructions/mobile/8-M-share-form.jpg";
import step2Image4Mobile from "@/assets/images/instructions/mobile/9-M-share-email.jpg";

import step2Image1Web from "@/assets/images/instructions/web/4-share-menu.png";
import step2Image2Web from "@/assets/images/instructions/web/5-share-form.png";
import step2Image3Web from "@/assets/images/instructions/web/6-share-email.png";

import step3Image1Mobile from "@/assets/images/instructions/mobile/10-M-spreadsheet-link.jpg";
import step3Image2Mobile from "@/assets/images/instructions/mobile/11-M-spreadsheet-link-paste.png";

import step3Image1Web from "@/assets/images/instructions/web/7-spreadsheet-id-copy.png";

import step4Image1Web from "@/assets/images/instructions/web/8-spreadsheet-verification-code.png";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";

export default function CreateSheetProfilePage() {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const [instructionDetails, setInstructionDetails] = useState<SheetProfileInstructionDetailsResponse | null>(null);
    const [instructionDetailsLoading, setInstructionDetailsLoading] = useState(false);
    const [sheetId, setSheetId] = useState('');
    const [sheetIdError, setSheetIdError] = useState<string | null>(null);
    const [sheetIdValidLoading, setSheetIdValidLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [sendLoading, setSendLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [codeError, setCodeError] = useState<string | null>(null);
    const [profileName, setProfileName] = useState('');
    const [profileNameError, setProfileNameError] = useState<string | null>(null);
    const [profileNameValidLoading, setProfileNameValidLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // countdown
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => setSecondsLeft(prev => prev <= 1 ? 0 : prev - 1), 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    useEffect(() => {
        setInstructionDetailsLoading(true);
        SheetApiClient.fetchInstructionDetails()
            .then(response => setInstructionDetails(response))
            .catch(error => {
                const errorCode = extractErrorCode(error);
                const messageKey = errorCode ? `errors.codes.${errorCode}` : 'errors.codes.UNKNOWN';
                const message = t(messageKey, {defaultValue: t('errors.codes.UNKNOWN')})
                notifier.error(message);
            })
            .finally(() => setInstructionDetailsLoading(false));
    }, []);

    function validateSheetId(value: string): string | null {
        const urlRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]{10,})/;
        const idRegex = /^[a-zA-Z0-9-_]{10,}$/;
        if (urlRegex.test(value) || idRegex.test(value)) return null;
        return t('pages.createSheetProfilePage.validation.sheetIdInvalid');
    }

    const handleSheetIdBlur = async () => {
        setSheetIdValidLoading(true);
        setSheetIdError(null);
        const validError = validateSheetId(sheetId);
        if (validError) {
            setSheetIdError(validError);
            setSheetIdValidLoading(false);
            return;
        }

        try {
            await SheetApiClient.validateProfileParts({sheetId: sheetId});
        } catch (error: unknown) {
            const errorCode = extractErrorCode(error);
            const messageKey = errorCode ? `errors.codes.${errorCode}` : 'pages.createSheetProfilePage.validation.profileNameTaken';
            const message = t(messageKey, {defaultValue: t('errors.codes.UNKNOWN')})

            setSheetIdError(message);
            notifier.error(message);
        } finally {
            setSheetIdValidLoading(false);
        }
    };

    const handleSendCode = async () => {
        if (sheetIdError || !sheetId || secondsLeft > 0) return;
        setSendLoading(true);
        setCodeError(null);
        try {
            await SheetApiClient.sendVerificationCode(sheetId);
            notifier.success(t('pages.createSheetProfilePage.notifications.codeSentSuccess'));
            setCodeSent(true);
            setSecondsLeft(60);
        } catch {
            notifier.error(t('pages.createSheetProfilePage.notifications.codeSentError'));
            setCodeError(t('pages.createSheetProfilePage.notifications.codeSentError'));
        } finally {
            setSendLoading(false);
        }
    };

    const handleProfileNameBlur = async () => {
        await validateProfileName();
    };

    const validateProfileName = async (): Promise<boolean> => {
        if (!profileName || profileName.trim().length === 0) {
            const message = t('pages.createSheetProfilePage.validation.profileNameRequired');
            setProfileNameError(message);
            return false;
        }
        setProfileNameValidLoading(true);
        setProfileNameError(null);
        try {
            await SheetApiClient.validateProfileParts({name: profileName});
            return true;
        } catch (error: unknown) {
            const errorCode = extractErrorCode(error);
            const messageKey = errorCode ? `errors.codes.${errorCode}` : 'pages.createSheetProfilePage.validation.profileNameTaken';
            const message = t(messageKey, {defaultValue: t('errors.codes.UNKNOWN')});
            setProfileNameError(message);
            notifier.error(message);
            return false;
        } finally {
            setProfileNameValidLoading(false);
        }
    };

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const isNameValid = await validateProfileName();
            if (!isNameValid) return;
            if (sheetIdError || !verificationCode) return;
            await SheetApiClient.createProfile({name: profileName, sheetId, sheetVerificationCode: verificationCode});
            notifier.success(t('pages.createSheetProfilePage.notifications.createSuccess'));
            navigate('../sheet-profiles');
        } catch (error: unknown) {
            const errorCode = extractErrorCode(error);
            const messageKey = errorCode ? `errors.codes.${errorCode}` : 'pages.createSheetProfilePage.notifications.createError';
            const message = t(messageKey, {defaultValue: t('errors.codes.UNKNOWN')});
            notifier.error(message);
        } finally {
            setCreateLoading(false);
        }
    };

    const instructionSteps =
        <Accordion type="single" collapsible defaultValue="">
            <AccordionItem key={1} value={`step-1`}>
                <AccordionTrigger>
                    {t(`pages.createSheetProfilePage.instruction.step1.title`)}:
                </AccordionTrigger>
                <AccordionContent>
                    <p>{t(`pages.createSheetProfilePage.instruction.step1.description1`)}</p>
                    {instructionDetails?.sheetTemplateLink
                        ? (
                            <Link to={instructionDetails?.sheetTemplateLink}
                                  className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors font-medium"
                                  target="_blank"
                                  rel="noopener noreferrer"
                            >
                                <span>{t(`pages.createSheetProfilePage.instruction.step1.sheetTemplateLinkTitle`)}</span>
                            </Link>
                        )
                        : (<Loader2 className="animate-spin h-6 w-6"/>)
                    }

                    <Accordion type="single" collapsible defaultValue="" className="mx-6">
                        <AccordionItem key={1} value={`step-1-photo-instructions-mobile`}>
                            <AccordionTrigger>
                                {t(`pages.createSheetProfilePage.instruction.photoInstructionMobile`)}:
                            </AccordionTrigger>
                            <AccordionContent>
                                <ImagePreviewList
                                    images={[step1Image1Mobile, step1Image2Mobile, step1Image3Mobile, step1Image4Mobile]}/>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem key={2} value={`step-1-photo-instructions-web`}>
                            <AccordionTrigger>
                                {t(`pages.createSheetProfilePage.instruction.photoInstructionWeb`)}:
                            </AccordionTrigger>
                            <AccordionContent>
                                <ImagePreviewList images={[step1Image1Web, step1Image2Web]}/>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem key={2} value={`step-2`}>
                <AccordionTrigger>
                    {t(`pages.createSheetProfilePage.instruction.step2.title`)}
                </AccordionTrigger>
                <AccordionContent>
                    <p>{t(`pages.createSheetProfilePage.instruction.step2.description`)}</p>
                    {instructionDetails?.sheetTemplateLink
                        ? (<span className="font-semibold">"{instructionDetails?.editorAgentEmail}"</span>)
                        : (<Loader2 className="animate-spin h-6 w-6"/>)
                    }

                    <Accordion type="single" collapsible defaultValue="" className="mx-6">
                        <AccordionItem key={1} value={`step-2-photo-instructions-mobile`}>
                            <AccordionTrigger>
                                {t(`pages.createSheetProfilePage.instruction.photoInstructionMobile`)}:
                            </AccordionTrigger>
                            <AccordionContent>
                                <ImagePreviewList
                                    images={[step2Image1Mobile, step2Image2Mobile, step2Image3Mobile, step2Image4Mobile]}/>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem key={2} value={`step-2-photo-instructions-web`}>
                            <AccordionTrigger>
                                {t(`pages.createSheetProfilePage.instruction.photoInstructionWeb`)}:
                            </AccordionTrigger>
                            <AccordionContent>
                                <ImagePreviewList
                                    images={[step2Image1Web, step2Image2Web, step2Image3Web]}/>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem key={3} value={`step-3`}>
                <AccordionTrigger>
                    {t(`pages.createSheetProfilePage.instruction.step3.title`)}
                </AccordionTrigger>
                <AccordionContent>
                    <p>{t(`pages.createSheetProfilePage.instruction.step3.description1`)}</p>
                    <p>{t(`pages.createSheetProfilePage.instruction.step3.description2`)}</p>
                    <Accordion type="single" collapsible defaultValue="" className="mx-6">
                        <AccordionItem key={1} value={`step-3-photo-instructions-mobile`}>
                            <AccordionTrigger>
                                {t(`pages.createSheetProfilePage.instruction.photoInstructionMobile`)}:
                            </AccordionTrigger>
                            <AccordionContent>
                                <ImagePreviewList images={[step3Image1Mobile, step3Image2Mobile]}/>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem key={2} value={`step-3-photo-instructions-web`}>
                            <AccordionTrigger>
                                {t(`pages.createSheetProfilePage.instruction.photoInstructionWeb`)}:
                            </AccordionTrigger>
                            <AccordionContent>
                                <ImagePreviewList images={[step3Image1Web]}/>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem key={4} value={`step-4`}>
                <AccordionTrigger>
                    {t(`pages.createSheetProfilePage.instruction.step4.title`)}
                </AccordionTrigger>
                <AccordionContent>
                    <p>{t(`pages.createSheetProfilePage.instruction.step4.description1`)}</p>
                    <p>{t(`pages.createSheetProfilePage.instruction.step4.description2`)}</p>
                    <p>{t(`pages.createSheetProfilePage.instruction.step4.description3`)}</p>
                    <p>{t(`pages.createSheetProfilePage.instruction.step4.description4`)}</p>
                    <Accordion type="single" collapsible defaultValue="" className="mx-6">
                        <AccordionItem key={1} value={`step-4-photo-instructions-web`}>
                            <AccordionTrigger>
                                {t(`pages.createSheetProfilePage.instruction.photoInstructionWeb`)}:
                            </AccordionTrigger>
                            <AccordionContent>
                                <ImagePreviewList images={[step4Image1Web]}/>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </AccordionContent>
            </AccordionItem>
        </Accordion>;

    return (
        <div className="py-8 px-4">
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader><CardTitle
                    className="text-2xl font-bold text-center">{t('pages.createSheetProfilePage.title')}</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {instructionDetailsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {!instructionDetailsLoading && !(instructionDetails?.sheetTemplateLink) &&
                        <Alert
                            variant="destructive"><AlertDescription>{t('errors.codes.UNKNOWN')}</AlertDescription></Alert>
                    }
                    {!instructionDetailsLoading && instructionDetails?.sheetTemplateLink && instructionSteps}

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="sheetId">{t('pages.createSheetProfilePage.input.sheetId.label')}</Label>
                            <Input
                                id="sheetId"
                                placeholder={t('pages.createSheetProfilePage.input.sheetId.placeholder')}
                                value={sheetId}
                                onChange={(e) => setSheetId(e.target.value)}
                                onBlur={handleSheetIdBlur}
                                disabled={sheetIdValidLoading || sendLoading || createLoading}
                            />
                            {sheetIdError && <Alert
                                variant="destructive"><AlertDescription>{sheetIdError}</AlertDescription></Alert>}
                        </div>

                        <Button
                            type="button"
                            onClick={handleSendCode}
                            disabled={sendLoading || !!sheetIdError || !sheetId || secondsLeft > 0}
                            className="w-full"
                        >
                            {sendLoading
                                ? <><Loader2
                                    className="mr-2 h-4 w-4 animate-spin"/>{t('pages.createSheetProfilePage.button.sendCode.loading')}</>
                                : secondsLeft > 0
                                    ? t('pages.createSheetProfilePage.button.sendCode.resend', {secondsLeft})
                                    : t('pages.createSheetProfilePage.button.sendCode.default')}
                        </Button>

                        {codeSent && (
                            <div className="space-y-1">
                                <Label
                                    htmlFor="verificationCode">{t('pages.createSheetProfilePage.input.verificationCode.label')}</Label>
                                <Input
                                    id="verificationCode"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    disabled={sheetIdValidLoading || createLoading}
                                />
                                {codeError && <Alert
                                    variant="destructive"><AlertDescription>{codeError}</AlertDescription></Alert>}
                            </div>
                        )}

                        <div className="space-y-1">
                            <div className="flex gap-1">
                                <Label
                                    htmlFor="profileName">{t('pages.createSheetProfilePage.input.profileName.label')}</Label>
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
                                value={profileName}
                                onChange={(e) => {
                                    setProfileName(e.target.value);
                                    if (profileNameError) setProfileNameError(null);
                                }}
                                onBlur={handleProfileNameBlur}
                                disabled={profileNameValidLoading || createLoading}
                            />
                            {profileNameError && <Alert
                                variant="destructive"><AlertDescription>{profileNameError}</AlertDescription></Alert>}
                        </div>

                        <div className="w-full flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                className="w-full sm:w-1/2 order-2 sm:order-1"
                                onClick={() => navigate('../sheet-profiles')}
                            >
                                ← {t('common.form.back')}
                            </Button>

                            <Button
                                type="submit"
                                className="w-full sm:w-1/2 order-1 sm:order-2"
                                disabled={
                                    sheetIdValidLoading ||
                                    createLoading ||
                                    sendLoading ||
                                    !codeSent ||
                                    !verificationCode ||
                                    !!sheetIdError ||
                                    !!profileNameError
                                }
                            >
                                {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                {createLoading
                                    ? t('pages.createSheetProfilePage.button.create.loading')
                                    : t('pages.createSheetProfilePage.button.create.default')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
