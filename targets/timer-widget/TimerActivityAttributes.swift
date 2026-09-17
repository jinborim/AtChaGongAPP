import ActivityKit

// Keep identical to modules/timer-surfaces/ios/TimerActivityAttributes.swift.
@available(iOS 16.2, *)
struct TimerActivityAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var endTime: Double
    var cycleCount: Int
  }
  var sessionId: String
}
