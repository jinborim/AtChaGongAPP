import ActivityKit

// Keep identical to targets/timer-widget/TimerActivityAttributes.swift.
@available(iOS 16.2, *)
struct TimerActivityAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var endTime: Double
    var sessionEndTime: Double?
    var phase: String
    var currentCycle: Int
    var cycleCount: Int
  }
  var sessionId: String
}
