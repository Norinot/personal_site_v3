export const PROFILE = {
  name: "Bernáth Márk Bence",
  handle: "norinot",
  email: "bencemark.bernath@gmail.com",
  phone: "+36 30 202 4133",
};

export interface SocialLink {
  label: string;
  url: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/Norinot" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/bernath-mark-bence/" },
  { label: "SoundCloud", url: "https://soundcloud.com/bence-ber" },
  { label: "Spotify", url: "https://open.spotify.com/artist/6mdH9R4KsdLJzfu6hAOd7F" },
];
