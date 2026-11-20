import helmet from "helmet";
import { IMAGE_BASE_URL } from "../utils/imageUrl";

const backendOrigin = IMAGE_BASE_URL.replace(/\/$/, "");

export const helmetMiddleware = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],

			scriptSrc: ["'self'"],

			styleSrc: ["'self'"],

			fontSrc: ["'self'"],

			imgSrc: ["'self'", "data:", backendOrigin],

			connectSrc: ["'self'", backendOrigin],

			frameAncestors: ["'self'"],

			objectSrc: ["'none'"],

			baseUri: ["'self'"],
		},
	},
	crossOriginResourcePolicy: { policy: "cross-origin" },

	frameguard: {
		action: "sameorigin",
	},

	referrerPolicy: {
		policy: "no-referrer",
	},
});
