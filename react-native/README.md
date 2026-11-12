# @wekor/ffmpeg-kit-react-native

FFmpeg and FFprobe for React Native, built on [FFmpegKitNext](https://github.com/arthenica/ffmpeg-kit-next).

```ts
import { FFmpegKit, FFprobeKit, ReturnCode } from '@wekor/ffmpeg-kit-react-native';

const session = await FFmpegKit.execute(`-i ${input} -c:v mpeg4 ${output}`);
if (ReturnCode.isSuccess(await session.getReturnCode())) {
  const info = (await FFprobeKit.getMediaInformation(output)).getMediaInformation();
  console.log(info?.getDuration());
}
```

## Requirements

| React Native | iOS | Android | Expo |
| --- | --- | --- | --- |
| 0.80+, New Architecture | 15.1+ | 7.0+ (API 24), 16 KB page sizes | Development builds. Not Expo Go. |

Every 64-bit Android library is linked for 16 KB pages, as Google Play requires; the build that publishes the
binaries fails otherwise.

## Installation

```sh
npm i @wekor/ffmpeg-kit-react-native
```

The FFmpeg binaries are downloaded during the native build:

- **iOS**: `pod install` downloads the xcframeworks from this repository's GitHub release into the package.
- **Android**: Gradle resolves `com.github.wekor:ffmpeg-kit` from JitPack. Expo's Android template already lists
  JitPack. In a project without it, add `maven { url 'https://www.jitpack.io' }` to `allprojects.repositories`
  in `android/build.gradle`.

## Packages

Pick the FFmpeg build that has what your app needs; `min` by default. Each adds external libraries to `min`:

| Package | Adds | For |
| --- | --- | --- |
| `min` | | FFmpeg's own codecs (H.264 and HEVC decoding, AAC, MPEG-4, ...) and the platform's hardware encoders: cutting, joining, compressing, converting, thumbnails |
| `https` | openssl | reading `https` URLs |
| `audio` | lame, libilbc, libvorbis, opencore-amr, opus, shine, soxr, speex, twolame, vo-amrwbenc | MP3, Opus, Vorbis and other audio formats |
| `video` | dav1d, fontconfig, freetype, fribidi, kvazaar, libass, libtheora, libvpx, libwebp, snappy, zimg (and libiconv on Android) | AV1, VP8/VP9, HEVC software encoding, WebP, subtitles and text |
| `full` | all of the above and libxml2 | everything |

With Expo, set it with the config plugin:

```json
{ "plugins": [["@wekor/ffmpeg-kit-react-native", { "package": "audio" }]] }
```

Without Expo, set `ffmpegKit.package=audio` in `android/gradle.properties` and `"ffmpegKit.package": "audio"` in
`ios/Podfile.properties.json` (or `FFMPEG_KIT_PACKAGE=audio pod install`). `Packages.getPackageName()` returns
the package at runtime.

Every package has Android's MediaCodec and iOS's AudioToolbox, VideoToolbox and AVFoundation, and no GPL
libraries: there is no x264, x265, xvidcore, vid.stab or rubberband. Encode H.264 and HEVC with the platform's
hardware encoders (`h264_mediacodec`, `h264_videotoolbox`, ...).

## API

The FFmpegKit API: `FFmpegKit`, `FFprobeKit`, `FFmpegKitConfig`, sessions, `ReturnCode`, `MediaInformation`,
logs and statistics. Code written for `ffmpeg-kit-react-native` or `@wekor/react-native-ffmpeg` 6.x keeps working: change the import.

## Binaries

The repository root holds FFmpegKitNext's build scripts and FFmpegKit's native sources, at the version in
`UPSTREAM`. `.github/workflows/native.yml` builds them on GitHub Actions and attaches the binaries to a release
(`native-<FFmpegKitNext version>`, such as `native-9.0.2`), one AAR and one xcframework archive per package. `package.json` pins that release in
`ffmpegKit.release`, with each iOS archive's SHA-256 in `ffmpegKit.iosSha256`.

To move to a new FFmpegKitNext version: `./update-upstream.sh <tag>`, commit, run the workflow with a new release
name, then update both fields.

## License

LGPL-3.0, like FFmpeg and FFmpegKit. Apps may link it dynamically, as both platforms do here, and must credit
FFmpeg. Some codecs are covered by patents in some countries; see
[FFmpegKitNext's notes on patents](https://github.com/arthenica/ffmpeg-kit-next/wiki/Patents).
