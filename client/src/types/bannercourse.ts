
export interface BannerCourseResponse {
    bannerCourseId: string;
    title: string;
    description: string;
    imageUrl: string;
}

export interface CreateBannerCourseRequest {
    title: string;
    description: string;
    image: File;
}

export interface UpdateBannerCourseRequest {
    title?: string;
    description?: string;
    image?: File;
}