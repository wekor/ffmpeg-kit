import {
  type AndroidConfig,
  type ConfigPlugin,
  createRunOncePlugin,
  withGradleProperties,
  withPodfileProperties,
} from 'expo/config-plugins';

/** The FFmpeg builds, from smallest to largest; each adds external libraries to `min`. */
export const FFMPEG_KIT_PACKAGES = [
  'min',
  'https',
  'audio',
  'video',
  'full',
] as const;

export type FFmpegKitPackage = (typeof FFMPEG_KIT_PACKAGES)[number];

/** Options for the `@wekor/ffmpeg-kit-react-native` config plugin. */
export interface FFmpegKitPluginProps {
  /**
   * The FFmpeg build to bundle; `min` by default.
   * - `min`: FFmpeg's own codecs and the platform's hardware codecs.
   * - `https`: `min` and openssl, to read `https` URLs.
   * - `audio`: `min` and lame, opus, vorbis, speex and other audio libraries.
   * - `video`: `min` and dav1d, libvpx, kvazaar, libass, freetype, fribidi, libwebp and other video libraries.
   * - `full`: all of them.
   */
  package?: FFmpegKitPackage;
}

/** The key the Android build reads from gradle.properties and the podspec from Podfile.properties.json. */
export const PACKAGE_PROPERTY = 'ffmpegKit.package';

export function resolvePackage(
  props: FFmpegKitPluginProps | undefined
): FFmpegKitPackage {
  const value = props?.package ?? 'min';
  if (!(FFMPEG_KIT_PACKAGES as readonly string[]).includes(value)) {
    throw new Error(
      `@wekor/ffmpeg-kit-react-native: package is "${value}"; use one of ${FFMPEG_KIT_PACKAGES.join(', ')}.`
    );
  }
  return value;
}

export function setGradlePackage(
  properties: AndroidConfig.Properties.PropertiesItem[],
  value: FFmpegKitPackage
): AndroidConfig.Properties.PropertiesItem[] {
  return [
    ...properties.filter(
      (item) => !(item.type === 'property' && item.key === PACKAGE_PROPERTY)
    ),
    { type: 'property', key: PACKAGE_PROPERTY, value },
  ];
}

export function setPodfilePackage(
  properties: Record<string, string>,
  value: FFmpegKitPackage
): Record<string, string> {
  return { ...properties, [PACKAGE_PROPERTY]: value };
}

const withFFmpegKit: ConfigPlugin<FFmpegKitPluginProps | undefined> = (
  config,
  props
) => {
  const value = resolvePackage(props);
  config = withGradleProperties(config, (config) => {
    config.modResults = setGradlePackage(config.modResults, value);
    return config;
  });
  config = withPodfileProperties(config, (config) => {
    config.modResults = setPodfilePackage(config.modResults, value);
    return config;
  });
  return config;
};

export default createRunOncePlugin(
  withFFmpegKit,
  '@wekor/ffmpeg-kit-react-native'
);
