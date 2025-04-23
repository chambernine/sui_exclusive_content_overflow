export interface IFormData {
  walletAddress: string;
  username: string;
  description: string;
  profile_image_file: string;
  banner_image_files: string[];
  socialLinks: {
    x: string;
    twitch: string;
    ig: string;
    youtube: string;
  };
}
