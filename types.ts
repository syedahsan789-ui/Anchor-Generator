
export interface SocialMediaContent {
    youtube: {
        title: string;
        description: string;
        keywords: string[];
        hashtags: string[];
    };
    facebook: {
        post: string;
    };
    instagram: {
        post: string;
    };
}

export enum NewsTopic {
    Politics = 'politics',
    Sports = 'sports',
    Technology = 'technology',
    Weather = 'weather',
    Finance = 'finance',
    Entertainment = 'entertainment',
    Health = 'health',
    Science = 'science',
    Default = 'default',
}