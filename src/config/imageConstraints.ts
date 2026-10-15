export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/avif",
] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];
