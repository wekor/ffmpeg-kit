require "digest"
require "fileutils"
require "json"
require "tmpdir"

FFMPEG_KIT_PACKAGES = %w[min https audio video full].freeze

# The FFmpegKit package the app picked: `ffmpegKit.package` in ios/Podfile.properties.json (the Expo config plugin
# writes it) or the FFMPEG_KIT_PACKAGE environment variable; min by default.
def ffmpeg_kit_package
  properties_file = File.join(Pod::Config.instance.installation_root.to_s, "Podfile.properties.json")
  properties = File.exist?(properties_file) ? JSON.parse(File.read(properties_file)) : {}
  package = ENV["FFMPEG_KIT_PACKAGE"] || properties["ffmpegKit.package"] || "min"
  unless FFMPEG_KIT_PACKAGES.include?(package)
    raise "[ReactNativeFFmpeg] ffmpegKit.package is \"#{package}\"; use one of #{FFMPEG_KIT_PACKAGES.join(", ")}."
  end

  package
end

# Fetches the package's FFmpegKit xcframeworks that .github/workflows/native.yml attached to a GitHub release into
# ios/Frameworks, where the podspec vendors them. React Native links this pod from node_modules by path, and
# CocoaPods downloads nothing for such pods, so the podspec calls this before CocoaPods reads it. It runs again
# only when the release or the package changes, and fails `pod install` if the archive's SHA-256 differs.
def download_ffmpeg_kit_frameworks(release:, package:, sha256:)
  frameworks_dir = File.join(__dir__, "Frameworks")
  marker = File.join(frameworks_dir, ".release")
  wanted = "#{release} #{package}"
  return if File.exist?(marker) && File.read(marker).strip == wanted

  url = "https://github.com/wekor/ffmpeg-kit/releases/download/#{release}/ffmpeg-kit-#{package}-ios-xcframework.zip"
  Dir.mktmpdir do |tmp|
    zip = File.join(tmp, "ffmpeg-kit.zip")
    Pod::UI.puts "[ReactNativeFFmpeg] Downloading #{url}"
    system("curl", "--fail", "--location", "--silent", "--show-error", "--retry", "3", "--output", zip, url) ||
      raise("[ReactNativeFFmpeg] Could not download #{url}")
    actual = Digest::SHA256.file(zip).hexdigest
    raise "[ReactNativeFFmpeg] #{url} has SHA-256 #{actual}, expected #{sha256}" if actual != sha256

    FileUtils.rm_rf(frameworks_dir)
    FileUtils.mkdir_p(frameworks_dir)
    system("unzip", "-q", zip, "-d", frameworks_dir) || raise("[ReactNativeFFmpeg] Could not unzip #{zip}")
    File.write(marker, wanted)
  end
end
