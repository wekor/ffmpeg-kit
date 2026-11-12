#!/usr/bin/env bash
# Prints the android.sh / ios.sh library options of a package (the FFmpeg build an app selects with
# `ffmpegKit.package`). All are LGPL: no x264, x265, xvidcore, vid.stab or rubberband. openssl provides TLS
# (FFmpegKitNext's CI leaves gnutls out).
#
# Usage: package-libraries.sh <min|https|audio|video|full> <android|ios>
set -euo pipefail

package="${1:?package}"
platform="${2:?platform}"

case "$platform" in
  # Hardware codecs and system libraries, in every package.
  android) system="android-zlib android-media-codec" ;;
  ios) system="ios-zlib ios-bzip2 ios-libiconv ios-audiotoolbox ios-videotoolbox ios-avfoundation" ;;
  *) echo "unknown platform: $platform" >&2; exit 1 ;;
esac

https="openssl"
audio="lame libilbc libvorbis opencore-amr opus shine soxr speex twolame vo-amrwbenc"
video="dav1d fontconfig freetype fribidi kvazaar libass libtheora libvpx libwebp snappy zimg"
[[ "$platform" == android ]] && video="$video libiconv"

case "$package" in
  min) libraries="" ;;
  https) libraries="$https" ;;
  audio) libraries="$audio" ;;
  video) libraries="$video" ;;
  full) libraries="$https $audio $video libxml2" ;;
  *) echo "unknown package: $package" >&2; exit 1 ;;
esac

for library in $system $libraries; do
  printf -- '--enable-lib-%s ' "$library"
done
echo
