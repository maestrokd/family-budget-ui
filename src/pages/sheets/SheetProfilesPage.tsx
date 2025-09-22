import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Alert, AlertDescription} from '@/components/ui/alert.tsx';
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Loader2,
    MenuIcon,
    MoreHorizontal,
    Pencil,
    Plus,
    ShieldCheck,
    User,
    Users,
    XIcon
} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip.tsx';
import {Badge} from '@/components/ui/badge.tsx';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu.tsx';
import type {PageImpl, SheetProfileResponse} from '@/services/SheetApiClient.ts';
import SheetApiClient from '@/services/SheetApiClient.ts';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table.tsx';
import {shorten} from "@/services/utils/StringUtils.ts";
import {Pagination, PaginationContent, PaginationItem, PaginationLink,} from "@/components/ui/pagination.tsx";
import {cn} from "@/lib/utils.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {notifier} from "@/services/NotificationService.ts";
import useDebounce from '@/hooks/useDebounce.ts';

export const SheetProfilesPage: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [size, setSize] = useState<number>(10);

    const debouncedKeyword = useDebounce(keyword, 500);
    const effectiveKeyword = debouncedKeyword.length >= 3 ? debouncedKeyword : '';

    const queryClient = useQueryClient();
    const selectMutation = useMutation({
        mutationFn: (accessUuid: string) => SheetApiClient.selectProfile(accessUuid),
        onSuccess: () => {
            notifier.success(t('pages.sheetProfilesPage.notifications.selectSuccess', 'Profile selected as current'));
            queryClient.invalidateQueries({queryKey: ['sheetProfiles']});
        },
        onError: () => {
            notifier.error(t('pages.sheetProfilesPage.notifications.selectError', 'Failed to select profile'));
        },
    });

    const {data, isLoading, isError, isFetching} = useQuery<PageImpl<SheetProfileResponse>, Error>({
        queryKey: ['sheetProfiles', page, size, effectiveKeyword],
        queryFn: () =>
            SheetApiClient.fetchSheetProfiles(
                {page, size},
                {keywordSearch: effectiveKeyword || undefined}
            ),
        placeholderData: (prev) => prev,
        staleTime: 30_000,
        enabled: debouncedKeyword.length === 0 || debouncedKeyword.length >= 3,
    });

    const items = data?.content ?? [];

    const handleSearchChange = (value: string) => {
        setKeyword(value);
        setPage(0);
    };

    return (
        <div className="min-h-screen bg-background p-4">
            {/* Search & Create */}
            <div className="mb-4 flex items-center space-x-2">
                <Input
                    id="keyword"
                    className="flex-1"
                    value={keyword}
                    onChange={e => handleSearchChange(e.target.value)}
                    placeholder={t(
                        'common.list.input.keywordSearch.placeholder',
                        'Search by name or sheet ID'
                    )}
                />
                {!isLoading && isFetching && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="animate-spin h-4 w-4"/>
                    </div>
                )}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="default"
                            onClick={() => navigate('create')}
                            className="p-2"
                        >
                            <Plus className="w-5 h-5" aria-hidden="true"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('pages.sheetProfilesPage.button.create.tooltip', 'Create Sheet Profile')}</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Content */}
            {isLoading &&
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin h-6 w-6"/>
                </div>}
            {!isLoading && isError &&
                <Alert variant="destructive">
                    <AlertDescription>
                        {t('pages.sheetProfilesPage.loadFailed', 'Failed to load sheet profiles.')}
                    </AlertDescription>
                </Alert>}
            {!isLoading && !isError && (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="min-w-8/12 sm:min-w-1/2 text-center">{t('pages.sheetProfilesPage.table.columns.name')}</TableHead>
                                <TableHead
                                    className="hidden sm:table-cell max-w-30 text-center">{t('pages.sheetProfilesPage.table.columns.spreadsheetId')}</TableHead>
                                <TableHead
                                    className="hidden sm:table-cell max-w-30 text-center">{t('pages.sheetProfilesPage.table.columns.agentType')}</TableHead>
                                <TableHead className="w-10">
                                    <div className="grid place-items-center">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Users className="w-4 h-4 cursor-pointer" aria-hidden="true"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="whitespace-normal break-words">{t('pages.sheetProfilesPage.table.columns.ownership')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableHead>
                                <TableHead className="w-10">
                                    <div className="grid place-items-center">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <ShieldCheck className="w-4 h-4 cursor-pointer" aria-hidden="true"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="whitespace-normal break-words">{t('pages.sheetProfilesPage.table.columns.verified')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableHead>
                                <TableHead className="w-10">
                                    <div className="grid place-items-center">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <MenuIcon className="w-4 h-4 cursor-pointer" aria-hidden="true"/>
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
                            {items.map(item => (
                                <TableRow key={item.uuid}>
                                    <TableCell className="min-w-8/12 sm:min-w-1/2 truncate">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="inline-flex items-center gap-2">
                                                    {shorten(item.name, 10)}
                                                    {item.isCurrent && (
                                                        <Badge variant="secondary"
                                                               className="bg-emerald-500 text-primary-foreground dark:text-primary dark:bg-emerald-600">
                                                            {t('pages.sheetProfilesPage.current')}
                                                        </Badge>
                                                    )}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="whitespace-normal break-words">{item.name}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell max-w-40 truncate">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>{shorten(item.sheetId, 4)}</span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="whitespace-normal break-words">{item.sheetId}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell max-w-40 truncate">
                                        <div className="grid place-items-center">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge variant="secondary"
                                                           className="bg-blue-500 text-primary-foreground dark:text-primary dark:bg-blue-600 cursor-pointer">{shorten(item.sheetAgentType, 8)}</Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="whitespace-normal break-words">{item.sheetAgentType}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-10 truncate">
                                        <div className="grid place-items-center">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    {item.role === 'OWNER' ? (
                                                        <User className="w-4 h-4 text-emerald-600 dark:text-emerald-500"
                                                              aria-label={t('pages.sheetProfilesPage.row.ownership.own', 'Own') as string}/>
                                                    ) : (
                                                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-500"
                                                               aria-label={t('pages.sheetProfilesPage.row.ownership.shared', 'Shared') as string}/>
                                                    )}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="whitespace-normal break-words">{item.role === 'OWNER' ? t('pages.sheetProfilesPage.row.ownership.own', 'Own') : t('pages.sheetProfilesPage.row.ownership.shared', 'Shared')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-10 truncate">
                                        <div className="grid place-items-center">
                                            {item.verifiedSheet ? (
                                                <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-500"/>
                                            ) : (
                                                <XIcon className="w-4 h-4 text-red-600 dark:text-red-500"/>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-10 text-right">
                                        <div className="grid place-items-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="p-2">
                                                        <MoreHorizontal className="w-5 h-5" aria-hidden="true"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {(() => {
                                                        const actionsDisabled = item.role !== 'OWNER';
                                                        return (
                                                            <>
                                                                <DropdownMenuItem
                                                                    disabled={item.isCurrent || selectMutation.isPending}
                                                                    onClick={async () => {
                                                                        if (!item.isCurrent) {
                                                                            await selectMutation.mutateAsync(item.accessUuid);
                                                                        }
                                                                    }}
                                                                >
                                                                    <CheckIcon className="mr-2 w-4 h-4"/>
                                                                    {item.isCurrent
                                                                        ? t('pages.sheetProfilesPage.action.select.current', 'Current profile')
                                                                        : t('pages.sheetProfilesPage.action.select', 'Select as current')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    disabled={actionsDisabled}
                                                                    onClick={() => {
                                                                        if (!actionsDisabled) navigate(`edit/${item.uuid}`);
                                                                    }}>
                                                                    <Pencil className="mr-2 w-4 h-4"/>
                                                                    {t('common.list.edit', 'Edit')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    disabled={actionsDisabled}
                                                                    onClick={() => {
                                                                        if (!actionsDisabled) navigate(`manage-access/${item.uuid}`);
                                                                    }}>
                                                                    <Users className="mr-2 w-4 h-4"/>
                                                                    {t('pages.manageSheetProfileAccessPage.button.manageAccess', 'Manage access')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem disabled>
                                                                    <XIcon className="mr-2 w-4 h-4"/>
                                                                    {t('common.list.remove', 'Remove')}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )
                                                    })()}
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
                                    aria-disabled={data?.first}
                                    aria-label="Go to previous page"
                                    size="default"
                                    className={cn("gap-1 px-2.5 sm:pl-2.5", data?.first ? ["pointer-events-none opacity-50"] : [])}
                                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}>
                                    <ChevronLeftIcon/>
                                    <span className="hidden sm:block">{t('common.list.previous', 'Previous')}</span>
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink>
                                    {(data?.number ?? 0) + 1} / {data?.totalPages}
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink
                                    aria-disabled={data?.last}
                                    aria-label="Go to next page"
                                    size="default"
                                    className={cn("gap-1 px-2.5 sm:pr-2.5", data?.last ? ["pointer-events-none opacity-50"] : [])}
                                    onClick={() => setPage(prev => Math.min(prev + 1, data?.totalPages ?? 1))}>
                                    <span className="hidden sm:block">{t('common.list.next', 'Next')}</span>
                                    <ChevronRightIcon/>
                                </PaginationLink>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </>
            )}
        </div>
    );
};

export default SheetProfilesPage;
