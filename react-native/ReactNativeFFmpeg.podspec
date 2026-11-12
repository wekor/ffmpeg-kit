require "json"
require_relative "ios/download-frameworks"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

ffmpeg_kit = package["ffmpegKit"]
download_ffmpeg_kit_frameworks(
  release: ffmpeg_kit["release"],
  package: ffmpeg_kit_package,
  sha256: ffmpeg_kit["iosSha256"][ffmpeg_kit_package]
)

Pod::Spec.new do |s|
  s.name         = "ReactNativeFFmpeg"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/wekor/ffmpeg-kit.git", :tag => "v#{s.version}" }

  s.source_files = "ios/*.{h,mm}"
  s.private_header_files = "ios/*.h"
  s.vendored_frameworks = "ios/Frameworks/*.xcframework"
  s.pod_target_xcconfig = {
    "DEFINES_MODULE" => "YES"
  }

  install_modules_dependencies(s)
end
