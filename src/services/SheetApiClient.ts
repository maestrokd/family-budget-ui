import {get, patch, post} from '@/services/ApiService';

export interface SheetProfileInstructionDetailsResponse {
    sheetTemplateLink: string;
    editorAgentEmail: string;
}

export const SheetProfileAccessRole = {
    OWNER: 'OWNER',
    WRITER: 'WRITER'
} as const;

export type SheetProfileAccessRole = typeof SheetProfileAccessRole[keyof typeof SheetProfileAccessRole];

export interface SheetProfileResponse {
    uuid: string;
    name: string;
    sheetId: string;
    verifiedSheet: boolean;
    userProfileId: number;
    userProfileUuid: string;
    userProfileEmail: string;
    sheetAgentType: string;
    accessUuid: string;
    accessUserProfileUuid: string;
    accessUserProfileEmail: string;
    role: SheetProfileAccessRole;
    isCurrent: boolean;
}

export interface SheetProfileFiltersRequest {
    keywordSearch?: string;
    accessUserProfileEmailKeyword?: string;
    names?: string[];
    sheetUuid?: string;
    roles?: SheetProfileAccessRole[];
    isVerifiedSheet?: boolean;
}

export interface PageImpl<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    last: boolean;
    first: boolean;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
}

export interface CreateSheetProfileRequest {
    name?: string;
    sheetId?: string;
    sheetVerificationCode?: string;
}

export interface PatchUpdateSheetProfileRequest {
    name?: string;
}

export interface ValidateSheetProfileRequest {
    uuid?: string;
    name?: string;
    sheetId?: string;
}

export interface ShareSheetProfileRequest {
    sheetUuid: string;
    accessUserEmails: string[];
}

class SheetApiClient {

    static fetchSheetProfilesAccesses(
        pageable: { page: number; size: number; sort?: string[] },
        filters: SheetProfileFiltersRequest
    ): Promise<PageImpl<SheetProfileResponse>> {
        const params = new URLSearchParams();
        params.append('page', pageable.page.toString());
        params.append('size', pageable.size.toString());
        if (pageable.sort) {
            pageable.sort.forEach(s => params.append('sort', s));
        }
        const url = `/private/sheet/profile/accesses/filters?${params.toString()}`;

        return post<PageImpl<SheetProfileResponse>>(url, filters);
    }

    static fetchSheetProfiles(
        pageable: { page: number; size: number; sort?: string[] },
        filters: SheetProfileFiltersRequest
    ): Promise<PageImpl<SheetProfileResponse>> {
        const params = new URLSearchParams();
        params.append('page', pageable.page.toString());
        params.append('size', pageable.size.toString());
        if (pageable.sort) {
            pageable.sort.forEach(s => params.append('sort', s));
        }
        const url = `/private/sheet/profile/filters?${params.toString()}`;
        return post<PageImpl<SheetProfileResponse>>(url, filters);
    }

    static fetchProfile(uuid: string): Promise<SheetProfileResponse> {
        const url = `/private/sheet/profile/${uuid}`;
        return get<SheetProfileResponse>(url);
    }

    static createProfile(request: CreateSheetProfileRequest): Promise<SheetProfileResponse> {
        const url = `/private/sheet/profile`;
        /*const body = {
            sheetId: sheetId,
            verificationCode: verificationCode,
            profileName: profileName,
        };*/
        return post<SheetProfileResponse>(url, request);
    }

    static selectProfile(accessUuid: string): Promise<SheetProfileResponse> {
        const url = `/private/sheet/profile/${accessUuid}/select`;
        return post<SheetProfileResponse>(url);
    }

    static shareProfiles(request: ShareSheetProfileRequest): Promise<void> {
        const url = `/private/sheet/profile/share`;
        return post<void>(url, request);
    }

    static updateProfile(uuid: string, request: PatchUpdateSheetProfileRequest): Promise<SheetProfileResponse> {
        const url = `/private/sheet/profile/${uuid}`;
        return patch<SheetProfileResponse>(url, request);
    }

    static fetchInstructionDetails(): Promise<SheetProfileInstructionDetailsResponse> {
        const url = `/private/sheet/profile/instructions/details`;
        return get<SheetProfileInstructionDetailsResponse>(url);
    }

    static sendVerificationCode(
        sheetId: string): Promise<SheetProfileResponse> {

        const url = `/private/sheet/profile/verification/send`;
        const body = {
            sheetId: sheetId,
        };
        return post<SheetProfileResponse>(url, body);
    }

    static validateProfile(request: CreateSheetProfileRequest): Promise<void> {
        const url = `/private/sheet/profile/validate`;
        return post<void>(url, request);
    }

    static validateProfileParts(request: ValidateSheetProfileRequest): Promise<void> {
        const url = `/private/sheet/profile/validate/parts`;
        return post<void>(url, request);
    }

}

export default SheetApiClient;
