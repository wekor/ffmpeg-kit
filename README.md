# ffmpeg-kit

FFmpeg and FFprobe for React Native: [`@wekor/ffmpeg-kit-react-native`](react-native/README.md).

| Path | |
| --- | --- |
| [`react-native/`](react-native) | The npm package: TypeScript API, Kotlin and Objective-C++ TurboModule, Expo example |
| `android/`, `apple/`, `scripts/`, `tools/`, `android.sh`, `ios.sh` | [FFmpegKitNext](https://github.com/arthenica/ffmpeg-kit-next)'s build scripts and FFmpegKit's native sources, unmodified, at the version in [`UPSTREAM`](UPSTREAM) |
| [`.github/workflows/native.yml`](.github/workflows/native.yml) | Builds the Android and iOS binaries of every package (`min`, `https`, `audio`, `video`, `full`; see [`package-libraries.sh`](.github/scripts/package-libraries.sh)) on GitHub Actions and attaches them to a release |

To build a new FFmpegKitNext version: `./update-upstream.sh <tag>`, commit, then run the Native workflow.

LGPL-3.0, like FFmpeg and FFmpegKit.
