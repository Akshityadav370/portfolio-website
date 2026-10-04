/** Add user-supplied, licensed tracks here. Paths are relative to public/. */
export type AudioTrack = {
  src: string;
  title: string;
  credit: string;
  licenseUrl: string;
};
export const trialsAudio: {
  ambience: AudioTrack | null;
  carousel: AudioTrack | null;
} = {
  ambience: null,
  carousel: null,
};
