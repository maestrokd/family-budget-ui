import React, {useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Separator} from '@/components/ui/separator';
import {
    ChevronLeft,
    Loader2,
    MailPlus,
    MenuIcon,
    MoreHorizontal,
    Pencil,
    Shield,
    User,
    Users,
    XIcon
} from 'lucide-react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Pagination, PaginationContent, PaginationItem, PaginationLink} from '@/components/ui/pagination';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {cn} from '@/lib/utils';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import type {PageImpl, SheetProfileAccessRole, SheetProfileResponse} from '@/services/SheetApiClient';
import SheetApiClient from '@/services/SheetApiClient';
import {notifier} from '@/services/NotificationService';
import {extractErrorCode} from '@/services/ApiService';
import useDebounce from '@/hooks/useDebounce';

const RoleBadgeLarge: React.FC<{ role: SheetProfileAccessRole; label: string }> = ({role, label}) => (
    <Badge
        variant="secondary"
        className={cn("flex items-center gap-1", role === 'OWNER' ? "bg-emerald-500 text-white dark:bg-emerald-600" : "bg-blue-500 text-white dark:bg-blue-600")}
    >
        {role === 'OWNER' ? <User className="w-3 h-3"/> : <Users className="w-3 h-3"/>}
        {label}
    </Badge>
);

const RoleBadgeSmallWithPopover: React.FC<{ role: SheetProfileAccessRole; label: string }> = ({role, label}) => (
    <Popover>
        <PopoverTrigger asChild>
            <Badge
                variant="secondary"
                className={cn("cursor-pointer flex items-center", role === 'OWNER' ? "bg-emerald-500 text-white dark:bg-emerald-600" : "bg-blue-500 text-white dark:bg-blue-600")}
                aria-label={label}
            >
                {role === 'OWNER' ? <User className="w-3 h-3"/> : <Users className="w-3 h-3"/>}
            </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[90vw] sm:max-w-80">
            <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </PopoverContent>
    </Popover>
);

const ManageSheetProfileAccessPage: React.FC = () => {
    const {uuid} = useParams<{ uuid: string }>();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [emails, setEmails] = useState('');
    const [keyword, setKeyword] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(10);

    const debouncedKeyword = useDebounce(keyword, 500);
    const effectiveKeyword = debouncedKeyword.length >= 3 ? debouncedKeyword : '';

    const {
        data: profile,
        isLoading: isProfileLoading,
        isError: isProfileError
    } = useQuery<SheetProfileResponse, Error>({
        queryKey: ['sheetProfile', uuid],
        queryFn: () => SheetApiClient.fetchProfile(uuid!),
        enabled: !!uuid,
    });

    const {
        data: accessPage,
        isLoading: isAccessLoading,
        isError: isAccessError,
        isFetching: isAccessFetching,
    } = useQuery<PageImpl<SheetProfileResponse>, Error>({
        queryKey: ['sheetProfileAccesses', uuid, page, size, effectiveKeyword],
        queryFn: () => SheetApiClient.fetchSheetProfilesAccesses(
            {page, size},
            {sheetUuid: uuid, accessUserProfileEmailKeyword: effectiveKeyword || undefined}
        ),
        placeholderData: (prev) => prev,
        enabled: !!uuid && (debouncedKeyword.length === 0 || debouncedKeyword.length >= 3),
        staleTime: 30_000,
    });

    const shareMutation = useMutation({
        mutationFn: (req: { sheetUuid: string; accessUserEmails: string[] }) => SheetApiClient.shareProfiles(req),
        onSuccess: () => {
            notifier.success(t('pages.manageSheetProfileAccessPage.notifications.shareSuccess'));
            setEmails('');
            // Refresh accesses and profiles list (if cached elsewhere)
            queryClient.invalidateQueries({queryKey: ['sheetProfileAccesses']});
            queryClient.invalidateQueries({queryKey: ['sheetProfiles']});
        },
        onError: (error: unknown) => {
            const errorCode = extractErrorCode(error);
            const messageKey = errorCode ? `errors.codes.${errorCode}` : 'errors.codes.UNKNOWN';
            const message = t(messageKey, {defaultValue: t('errors.codes.UNKNOWN')});
            notifier.error(message);
        }
    });

    const parsedEmails = useMemo(() => {
        return emails
            .split(/[,\s]+/)
            .map(e => e.trim())
            .filter(e => e.length > 0);
    }, [emails]);

    const shareDisabled = parsedEmails.length === 0 || shareMutation.isPending || !uuid;

    if (isProfileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading"/>
            </div>
        );
    }

    if (isProfileError || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {t('pages.manageSheetProfileAccessPage.notifications.profileLoadError', 'Failed to load profile.')}
                        </AlertDescription>
                    </Alert>
                    <Button variant="outline" onClick={() => navigate('../sheet-profiles')} className="w-full">
                        ← {t('common.form.back', 'Back')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-0 px-0 sm:py-8 sm:px-4">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        {t('pages.manageSheetProfileAccessPage.title', 'Manage Sheet Profile Access')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic profile info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div
                                className="text-sm text-muted-foreground">{t('pages.manageSheetProfileAccessPage.profile.name', 'Profile Name')}</div>
                            <div className="font-medium">{profile.name}</div>
                        </div>
                        <div>
                            <div
                                className="text-sm text-muted-foreground">{t('pages.manageSheetProfileAccessPage.profile.sheetId', 'Spreadsheet ID')}</div>
                            <div className="font-mono text-sm break-all">{profile.sheetId}</div>
                        </div>
                    </div>

                    {/* Share section */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            placeholder={t('pages.manageSheetProfileAccessPage.input.share.placeholder', 'Enter user email(s), comma or space separated') as string}
                            value={emails}
                            onChange={e => setEmails(e.target.value)}
                            disabled={shareMutation.isPending}
                        />
                        <Button
                            onClick={() => shareMutation.mutate({sheetUuid: uuid!, accessUserEmails: parsedEmails})}
                            disabled={shareDisabled}
                        >
                            {shareMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            <MailPlus className="mr-2 h-4 w-4"/>
                            {t('pages.manageSheetProfileAccessPage.button.share', 'Share')}
                        </Button>
                    </div>

                    <Separator/>

                    {/* Access list */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="grid place-items-center">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4"/>
                                    <div className="font-semibold">
                                        {t('pages.manageSheetProfileAccessPage.accessList.title', 'Profile Accesses')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="keyword"
                                    className="w-full sm:max-w-xs"
                                    value={keyword}
                                    onChange={e => {
                                        setKeyword(e.target.value);
                                        setPage(0);
                                    }}
                                    placeholder={t('common.list.input.keywordSearch.placeholder', 'Search...') as string}
                                />
                                {!isAccessLoading && isAccessFetching && (
                                    <Loader2 className="animate-spin h-4 w-4"/>
                                )}
                            </div>
                        </div>
                        {isAccessLoading && (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin h-6 w-6"/></div>
                        )}
                        {isAccessError && (
                            <Alert
                                variant="destructive"><AlertDescription>{t('pages.manageSheetProfileAccessPage.notifications.accessLoadError', 'Failed to load accesses.')}</AlertDescription></Alert>
                        )}
                        {!isAccessLoading && !isAccessError && (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-8/12 text-center">
                                                {t('pages.manageSheetProfileAccessPage.table.columns.email', 'User Email')}
                                            </TableHead>
                                            {/* Small screen Role column (icon header) */}
                                            <TableHead className="w-10 sm:hidden">
                                                <div className="grid place-items-center">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Shield className="w-4 h-4 cursor-pointer"
                                                                    aria-hidden="true"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="whitespace-normal break-words">{t('pages.manageSheetProfileAccessPage.table.columns.role', 'Role')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableHead>
                                            {/* Large screen Role column (text header) */}
                                            <TableHead className="hidden sm:table-cell min-w-30 text-center">
                                                {t('pages.manageSheetProfileAccessPage.table.columns.role', 'Role')}
                                            </TableHead>
                                            <TableHead className="w-10">
                                                <div className="grid place-items-center">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <MenuIcon className="w-4 h-4 cursor-pointer"
                                                                      aria-hidden="true"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="whitespace-normal break-words">{t('common.list.actions', 'Actions')}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(accessPage?.content || []).map(a => (
                                            <TableRow key={a.accessUuid}>
                                                <TableCell
                                                    className="min-w-8/12 truncate">{a.accessUserProfileEmail}</TableCell>
                                                {/* Small screen role cell (icon-only badge with popover) */}
                                                <TableCell className="w-10 truncate sm:hidden">
                                                    <div className="grid place-items-center">
                                                        <RoleBadgeSmallWithPopover role={a.role}
                                                                                   label={t(`pages.manageSheetProfileAccessPage.table.roleLabels.${a.role}`) as string}/>
                                                    </div>
                                                </TableCell>
                                                {/* Large screen role cell (full text) */}
                                                <TableCell className="hidden sm:table-cell min-w-30 truncate">
                                                    <RoleBadgeLarge role={a.role}
                                                                    label={t(`pages.manageSheetProfileAccessPage.table.roleLabels.${a.role}`) as string}/>
                                                </TableCell>
                                                <TableCell className="w-10 text-right">
                                                    <div className="grid place-items-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="p-2">
                                                                    <MoreHorizontal className="w-5 h-5"
                                                                                    aria-hidden="true"/>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {/* Remove not implemented */}
                                                                <DropdownMenuItem
                                                                    disabled /* always disabled; and must be disabled for OWNER */>
                                                                    <XIcon className="mr-2 w-4 h-4"/>
                                                                    {t('common.list.remove', 'Remove')}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <Select
                                                value={String(size)}
                                                onValueChange={(val) => {
                                                    const newSize = Number(val);
                                                    if (!Number.isNaN(newSize)) {
                                                        setSize(newSize);
                                                        setPage(0);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger size="sm" className="w-18">
                                                    <SelectValue placeholder="Size"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1</SelectItem>
                                                    <SelectItem value="2">2</SelectItem>
                                                    <SelectItem value="5">5</SelectItem>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="20">20</SelectItem>
                                                    <SelectItem value="50">50</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink
                                                aria-disabled={accessPage?.first}
                                                aria-label="Go to previous page"
                                                size="default"
                                                className={cn("gap-1 px-2.5 sm:pl-2.5", accessPage?.first ? ["pointer-events-none opacity-50"] : [])}
                                                onClick={() => setPage(prev => Math.max(prev - 1, 0))}>
                                                ←
                                                <span
                                                    className="hidden sm:block">{t('common.list.previous', 'Previous')}</span>
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink>
                                                {(accessPage?.number ?? 0) + 1} / {accessPage?.totalPages}
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink
                                                aria-disabled={accessPage?.last}
                                                aria-label="Go to next page"
                                                size="default"
                                                className={cn("gap-1 px-2.5 sm:pr-2.5", accessPage?.last ? ["pointer-events-none opacity-50"] : [])}
                                                onClick={() => setPage(prev => Math.min(prev + 1, accessPage?.totalPages ?? 1))}>
                                                <span className="hidden sm:block">{t('common.list.next', 'Next')}</span>
                                                →
                                            </PaginationLink>
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </>
                        )}
                    </div>

                    {/* Navigation buttons */}
                    <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
                        <Button variant="outline" className="w-full sm:w-1/2 order-2 sm:order-1"
                                onClick={() => navigate('../sheet-profiles')}>
                            <ChevronLeft
                                className="mr-2 w-4 h-4"/> {t('pages.manageSheetProfileAccessPage.button.backToList', 'Back to list')}
                        </Button>
                        <Button variant="outline" className="w-full sm:w-1/2 order-1 sm:order-2"
                                onClick={() => navigate(`../sheet-profiles/edit/${profile.uuid}`)}>
                            <Pencil
                                className="mr-2 w-4 h-4"/> {t('pages.manageSheetProfileAccessPage.button.backToEdit', 'Back to edit')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageSheetProfileAccessPage;
