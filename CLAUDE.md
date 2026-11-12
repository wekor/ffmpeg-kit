# ffmpeg-kit

FFmpeg and FFprobe for React Native 0.80+, New Architecture only, published as `@wekor/ffmpeg-kit-react-native`
with the FFmpegKit API. The layout follows FFmpegKitNext (`arthenica/ffmpeg-kit-next`, LGPL-3.0): its build scripts
and FFmpegKit's native sources at the root, the React Native package in `react-native/`. Only Android and iOS; no
Flutter. Conventions in `react-native/` follow the owner's `react-native-ble` library.

## Layout

- `android/`, `apple/`, `scripts/`, `tools/`, `android.sh`, `ios.sh` — FFmpegKitNext's, unmodified, at the version
  in `UPSTREAM`. `./update-upstream.sh <tag>` replaces them; never edit them by hand. Not published to npm.
- `react-native/` — the npm package:
  - `src/` — TypeScript. `NativeReactNativeFFmpeg.ts` is the TurboModule spec (codegen `ReactNativeFFmpegSpec`,
    module `ReactNativeFFmpeg`, typed `onLog`/`onStatistics`/`onComplete`/`onSessionDeleted` events); the rest is
    the FFmpegKit API (`FFmpegKit`, `FFprobeKit`, `FFmpegKitConfig`, sessions, buffers and streams), compatible with
    `ffmpeg-kit-react-native` and `@wekor/react-native-ffmpeg` 6.x. `version.ts` must match `package.json`.
  - `android/` — Kotlin (`com.wekor.reactnativeffmpeg`), only the React Native boundary over FFmpegKit's Android
    API; depends on `com.github.wekor:ffmpeg-kit:<release>:<package>@aar` from JitPack.
  - `ios/` — Objective-C++ (`ReactNativeFFmpeg.mm`), the boundary over FFmpegKit's Apple API.
    `download-frameworks.rb`, called by the podspec, fetches the release's xcframeworks into `ios/Frameworks` at
    `pod install` and checks their SHA-256.
  - `plugin/` — the Expo config plugin (`app.plugin.js` loads `plugin/build`): writes the chosen package as
    `ffmpegKit.package` to gradle.properties and Podfile.properties.json.
  - `example/` — Expo app that runs a self-test on launch: version, an encode of FFmpeg's test pattern, a probe.
- Packages: `min` (default), `https`, `audio`, `video`, `full`, each a set of `--enable-lib-*` options defined in
  `.github/scripts/package-libraries.sh` (FFmpegKitNext has no presets). The app picks one with `ffmpegKit.package`.
- `.github/workflows/native.yml` — builds the root for every package, one job per package and architecture (a
  platform's architectures together overrun the six-hour limit), checks 16 KB page alignment of the 64-bit Android
  libraries, and attaches `ffmpeg-kit-<package>-android.aar`, `ffmpeg-kit-android.pom` and
  `ffmpeg-kit-<package>-ios-xcframework.zip` to a `native-<FFmpegKitNext version>` release (or only builds, with
  `publish` off). `jitpack.yml` republishes the AARs as classifiers. `react-native/package.json` pins the release
  and the iOS SHA-256s in `ffmpegKit`.
- `.github/workflows/check.yml` (lint, types, tests, npm pack, example on Android and iOS) and `publish.yml` (npm on
  `v*` tags) run in `react-native/`.

## Commands

In `react-native/`:

```sh
bun install
bun run check        # biome
bun run typecheck
bun run test         # bun test
bun run prepare      # bob build
```

Don't build FFmpeg or the example app locally; run the workflows.

## Rules

- The spec is the contract: Android, iOS and JS change together, and codegen must accept it.
- Session, log, statistics and media-information objects keep FFmpegKit's keys; numbers cross as doubles, bytes
  as base64.
- Android-only methods reject with `unsupported` on iOS.
- LGPL only: no GPL libraries (x264, x265, xvidcore, vid.stab, rubberband) in the binaries.
- Files derived from FFmpegKit keep its LGPL-3.0 header.

## Upgrading FFmpeg

`./update-upstream.sh <new FFmpegKitNext tag>`, review and commit the diff, run `native.yml` with a new
`native-<version>` release (a name JitPack has never seen: it caches every tag's build for good), set `ffmpegKit` in `react-native/package.json` from the run summary, then port any API changes from FFmpegKitNext's own `react-native/`.
