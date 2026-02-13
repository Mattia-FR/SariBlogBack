import helmet from "helmet";

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],

    scriptSrc: ["'self'"],

    styleSrc: ["'self'", "https://fonts.googleapis.com"],

    fontSrc: ["'self'", "https://fonts.gstatic.com"],

    imgSrc: ["'self'", "data:"],

    connectSrc: ["'self'", "http://localhost:4242"],

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
