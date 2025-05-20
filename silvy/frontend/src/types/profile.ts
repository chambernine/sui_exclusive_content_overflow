
export interface SocialBanner { 
    x: string | null
    instragram: string | null
    twitch: string | null
    youtube: string | null
}

export interface ProfileMetaData {    
    description: string
    profile_image_url: string
    social_links: SocialBanner
    banner_images: string[]
}