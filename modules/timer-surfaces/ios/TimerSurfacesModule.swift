import ExpoModulesCore
import ActivityKit
import WidgetKit

struct TimerDisplaySnapshot: Record {
  @Field var sessionId: String = ""
  @Field var endTime: Double = 0
  @Field var cycleCount: Int = 1
}

public class TimerSurfacesModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TimerSurfaces")

    AsyncFunction("reset") { () async -> Void in
      await TimerSurfaceController.shared.reset()
    }

    AsyncFunction("update") { (snapshot: TimerDisplaySnapshot) async throws -> Void in
      try await TimerSurfaceController.shared.update(snapshot)
    }
  }
}

@MainActor
private final class TimerSurfaceController {
  static let shared = TimerSurfaceController()
  private let group = "group.com.atchagong.atchagong.timer"
  private let key = "timerDisplay"
  private let widgetKind = "AtChaGongTimerV3"

  func reset() async {
    let defaults = UserDefaults(suiteName: group)
    defaults?.removeObject(forKey: key)
    defaults?.synchronize()
    WidgetCenter.shared.reloadTimelines(ofKind: widgetKind)
    if #available(iOS 16.2, *) {
      for activity in Activity<TimerActivityAttributes>.activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
    }
  }

  func update(_ snapshot: TimerDisplaySnapshot) async throws {
    // Shared storage is only read by the widget extension, never to restore an app session.
    let defaults = UserDefaults(suiteName: group)
    defaults?.set([
      "sessionId": snapshot.sessionId,
      "endTime": snapshot.endTime,
      "cycleCount": snapshot.cycleCount
    ], forKey: key)
    defaults?.synchronize()
    WidgetCenter.shared.reloadTimelines(ofKind: widgetKind)

    guard #available(iOS 16.2, *) else { return }
    let end = Date(timeIntervalSince1970: snapshot.endTime / 1000)
    guard end > Date() else {
      for activity in Activity<TimerActivityAttributes>.activities {
        await activity.end(nil, dismissalPolicy: .immediate)
      }
      return
    }
    let content = ActivityContent(
      state: TimerActivityAttributes.ContentState(endTime: snapshot.endTime, cycleCount: snapshot.cycleCount),
      staleDate: end
    )
    for activity in Activity<TimerActivityAttributes>.activities where activity.attributes.sessionId != snapshot.sessionId {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
    if let existing = Activity<TimerActivityAttributes>.activities.first(where: { $0.attributes.sessionId == snapshot.sessionId }) {
      await existing.update(content)
    } else if ActivityAuthorizationInfo().areActivitiesEnabled {
      _ = try Activity.request(
        attributes: TimerActivityAttributes(sessionId: snapshot.sessionId),
        content: content,
        pushType: nil
      )
    }
  }
}
