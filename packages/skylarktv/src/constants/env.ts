export const SKYLARK_API = (process.env.NEXT_PUBLIC_SKYLARK_API_URL ||
  process.env.SKYLARK_API_URL) as string;

export const SAAS_API_ENDPOINT = (process.env.NEXT_PUBLIC_SAAS_API_ENDPOINT ||
  process.env.SAAS_API_ENDPOINT) as string;
export const SAAS_API_KEY = (process.env.NEXT_PUBLIC_SAAS_API_KEY ||
  process.env.SAAS_API_KEY) as string;

export const CLOUDINARY_ENVIRONMENT = process.env
  .NEXT_PUBLIC_CLOUDINARY_ENVIRONMENT as string;

export const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE;