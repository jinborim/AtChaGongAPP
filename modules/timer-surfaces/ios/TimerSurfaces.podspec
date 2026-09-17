Pod::Spec.new do |s|
  s.name = 'TimerSurfaces'
  s.version = '1.0.0'
  s.summary = 'AtChaGong timer displays'
  s.description = 'Display-only home widgets and Live Activities for AtChaGong.'
  s.license = { :type => 'Private' }
  s.author = 'AtChaGong'
  s.homepage = 'https://expo.dev'
  s.platforms = { :ios => '15.1' }
  s.source = { :git => '' }
  s.static_framework = true
  s.swift_version = '5.9'
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.frameworks = 'WidgetKit', 'SwiftUI'
  s.weak_frameworks = 'ActivityKit'
end
