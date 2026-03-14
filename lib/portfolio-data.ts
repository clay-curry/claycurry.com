export const locationData = {
  label: "Seattle, WA",
  mapHref: "https://www.google.com/maps/place/Seattle,+WA",
  mapEmbedUrl: "https://www.google.com/maps?q=Seattle,+WA&z=11&output=embed",
} as const;

export const profileData = {
  name: "Clay Curry",
  title: "Product Engineer",
  avatar: "/clay_profile_cropped.png",
  email: "me@claycurry.com",
  phone: "+1 (405) 301-1055",
  location: locationData.label,
  locationHref: locationData.mapHref,
  githubUsername: "clay-curry",
  social: {
    github: "https://github.com/clay-curry",
    x: "https://x.com/claycurry__",
    linkedin: "https://www.linkedin.com/in/clay-curry/",
  },
} as const;

export const siteConfig = {
  repo: "https://github.com/clay-curry/claycurry.com",
} as const;

export const contactData = {
  email: "me@claycurry.com",
  phone: "+1 (405) 301-1055",
  location: locationData.label,
  mapEmbedUrl: locationData.mapEmbedUrl,
} as const;
