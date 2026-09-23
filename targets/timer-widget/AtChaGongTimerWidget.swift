import SwiftUI
import WidgetKit
import ActivityKit
import UIKit

private let timerURL = URL(string: "atchagongapp:///homeSetting")!
private let timerWidgetKind = "AtChaGongTimerV4"
private let ink = Color(red: 0.09, green: 0.24, blue: 0.36)
private let ice = Color(red: 0.91, green: 0.95, blue: 0.99)

private func timerPhaseLabel(_ phase: String) -> String {
  phase == "break" ? "휴식" : "집중"
}

private struct TimerEntry: TimelineEntry {
  let date: Date
  var end: Date?
  var phase = "focus"
  var currentCycle = 1
  var cycleCount = 4
  var needsConfirmation = false
  var isPreview = false
}

private struct StudyingPenguinImage: View {
  let width: CGFloat
  let height: CGFloat
  var usesWidgetAccentedRendering = true

  private var presentationImage: Image {
    guard let source = UIImage(
      named: "studyingPenguin",
      in: .main,
      compatibleWith: nil
    ) else {
      return Image(systemName: "book.closed.fill")
    }

    let targetSize = CGSize(
      width: max(1, width),
      height: max(1, height)
    )
    let format = UIGraphicsImageRendererFormat()
    format.scale = 1
    format.opaque = false
    let renderer = UIGraphicsImageRenderer(size: targetSize, format: format)
    let resized = renderer.image { context in
      context.cgContext.interpolationQuality = .none
      let scale = min(
        targetSize.width / source.size.width,
        targetSize.height / source.size.height
      )
      let drawSize = CGSize(
        width: source.size.width * scale,
        height: source.size.height * scale
      )
      source.draw(
        in: CGRect(
          x: (targetSize.width - drawSize.width) / 2,
          y: (targetSize.height - drawSize.height) / 2,
          width: drawSize.width,
          height: drawSize.height
        )
      )
    }

    return Image(uiImage: resized)
  }

  @ViewBuilder
  var body: some View {
    if #available(iOS 18.0, *), usesWidgetAccentedRendering {
      presentationImage
        .renderingMode(.original)
        .resizable()
        .interpolation(.none)
        .widgetAccentedRenderingMode(.fullColor)
        .scaledToFit()
        .frame(width: width, height: height)
        .unredacted()
        .privacySensitive(false)
        .accessibilityHidden(true)
    } else {
      presentationImage
        .renderingMode(.original)
        .resizable()
        .interpolation(.none)
        .scaledToFit()
        .frame(width: width, height: height)
        .unredacted()
        .privacySensitive(false)
        .accessibilityHidden(true)
    }
  }
}

private struct TimerProvider: TimelineProvider {
  func placeholder(in context: Context) -> TimerEntry {
    TimerEntry(
      date: Date(),
      isPreview: true
    )
  }

  func getSnapshot(in context: Context, completion: @escaping (TimerEntry) -> Void) {
    completion(
      context.isPreview
        ? placeholder(in: context)
        : makeTimelineEntries().first ?? TimerEntry(date: Date())
    )
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<TimerEntry>) -> Void) {
    let entries = makeTimelineEntries()
    let refreshDate = (entries.last?.date ?? Date()).addingTimeInterval(15)
    completion(
      Timeline(
        entries: entries,
        policy: .after(refreshDate)
      )
    )
  }

  private func makeTimelineEntries(now: Date = Date()) -> [TimerEntry] {
    guard let saved = UserDefaults(suiteName: "group.com.atchagong.atchagong.timer")?.dictionary(forKey: "timerDisplay"),
          let milliseconds = (saved["endTime"] as? NSNumber)?.doubleValue else {
      return [TimerEntry(date: now)]
    }

    var end = Date(timeIntervalSince1970: milliseconds / 1000)
    var phase = saved["phase"] as? String ?? "focus"
    var currentCycle = (saved["currentCycle"] as? NSNumber)?.intValue ?? 1
    let cycleCount = (saved["cycleCount"] as? NSNumber)?.intValue ?? 4
    let focusDuration = ((saved["focusDurationMilliseconds"] as? NSNumber)?.doubleValue ?? 0) / 1000
    let breakDuration = ((saved["breakDurationMilliseconds"] as? NSNumber)?.doubleValue ?? 0) / 1000

    func advancePhase() -> Bool {
      if phase == "focus", breakDuration > 0 {
        phase = "break"
        end = end.addingTimeInterval(breakDuration)
        return true
      }
      if phase == "break", currentCycle < cycleCount, focusDuration > 0 {
        phase = "focus"
        currentCycle += 1
        end = end.addingTimeInterval(focusDuration)
        return true
      }
      return false
    }

    while end <= now {
      guard advancePhase() else {
        return [TimerEntry(date: now, needsConfirmation: true)]
      }
    }

    var entries = [
      TimerEntry(
        date: now,
        end: end,
        phase: phase,
        currentCycle: currentCycle,
        cycleCount: cycleCount
      )
    ]

    while true {
      let nextDate = end
      guard advancePhase() else {
        entries.append(TimerEntry(date: nextDate, needsConfirmation: true))
        break
      }
      entries.append(
        TimerEntry(
          date: nextDate,
          end: end,
          phase: phase,
          currentCycle: currentCycle,
          cycleCount: cycleCount
        )
      )
    }

    return entries
  }
}

private struct TimerWidgetView: View {
  @Environment(\.widgetFamily) private var family
  @Environment(\.widgetRenderingMode) private var renderingMode
  let entry: TimerEntry

  var body: some View {
    let showsPenguin = !entry.isPreview && family == .systemMedium

    ZStack(alignment: .bottomTrailing) {
      if showsPenguin {
        StudyingPenguinImage(
          width: 112,
          height: 112
        )
      }

      VStack(alignment: .leading, spacing: family == .accessoryRectangular ? 2 : 7) {
        Label("앗차공", systemImage: "timer")
          .font(.caption.bold())
        if let end = entry.end, end > entry.date {
          if family != .accessoryRectangular {
            Text("\(timerPhaseLabel(entry.phase)) \(entry.currentCycle)/\(entry.cycleCount)사이클")
              .font(.caption)
          }
          Text(timerInterval: entry.date...end, countsDown: true)
            .font(family == .accessoryRectangular ? .headline : .largeTitle)
            .monospacedDigit()
            .minimumScaleFactor(0.6)
            .lineLimit(1)
          Text("\(timerPhaseLabel(entry.phase)) 남은 시간").font(.caption2)
        } else {
          Text(entry.needsConfirmation ? "앱에서 완료 여부를\n확인해 주세요" : "집중할 준비가\n되었나요?")
            .font(family == .accessoryRectangular ? .caption : .headline)
          if family != .accessoryRectangular {
            Text("눌러서 앱 열기").font(.caption)
          }
        }
      }
      .padding(.trailing, showsPenguin ? 108 : 0)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .foregroundStyle(
      family == .accessoryRectangular || renderingMode != .fullColor
        ? Color.primary
        : ink
    )
    .widgetURL(timerURL)
    .timerWidgetBackground()
    .unredacted()
  }
}

private extension View {
  @ViewBuilder
  func timerWidgetBackground() -> some View {
    if #available(iOS 17.0, *) {
      self.containerBackground(ice, for: .widget)
    } else {
      self.padding().background(ice)
    }
  }
}

struct AtChaGongTimerWidget: Widget {
  let kind = timerWidgetKind
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: TimerProvider()) { entry in
      TimerWidgetView(entry: entry)
        .unredacted()
    }
    .configurationDisplayName("앗차공 타이머")
    .description("집중·휴식 세션의 남은 시간을 확인해요.")
    .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
  }
}

private struct ActivityCountdown: View {
  let context: ActivityViewContext<TimerActivityAttributes>

  var body: some View {
    let end = Date(
      timeIntervalSince1970: (context.state.sessionEndTime ?? context.state.endTime) / 1000
    )
    if context.isStale || end <= Date() {
      Text("앱에서 확인").font(.caption)
    } else {
      Text(timerInterval: Date()...end, countsDown: true)
        .monospacedDigit()
        .minimumScaleFactor(0.6)
        .lineLimit(1)
    }
  }
}

struct AtChaGongLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: TimerActivityAttributes.self) { context in
      HStack(spacing: 16) {
        Image(systemName: "timer").font(.largeTitle)
        VStack(alignment: .leading, spacing: 5) {
          Text("앗차공 · 집중·휴식 \(context.state.cycleCount)사이클")
          .font(.caption.bold())
          ActivityCountdown(context: context).font(.largeTitle)
          Text(
            context.isStale
              ? "전체 세션이 끝났어요. 앱에서 확인해 주세요"
              : "전체 세션 남은 시간"
          )
          .font(.caption)
        }
        Spacer(minLength: 0)
        StudyingPenguinImage(width: 78, height: 78, usesWidgetAccentedRendering: false)
      }
      .padding(18)
      .foregroundStyle(ink)
      .activityBackgroundTint(ice)
      .activitySystemActionForegroundColor(ink)
      .widgetURL(timerURL)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          HStack(spacing: 6) {
            StudyingPenguinImage(width: 28, height: 28, usesWidgetAccentedRendering: false)
            Text("앗차공")
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text("총 \(context.state.cycleCount)사이클")
          .font(.caption)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack {
            ActivityCountdown(context: context).font(.title)
            Text("전체 세션 남은 시간").font(.caption)
          }
        }
      } compactLeading: {
        StudyingPenguinImage(width: 24, height: 24, usesWidgetAccentedRendering: false)
      } compactTrailing: {
        ActivityCountdown(context: context).font(.caption).frame(maxWidth: 64)
      } minimal: {
        StudyingPenguinImage(width: 20, height: 20, usesWidgetAccentedRendering: false)
      }
      .widgetURL(timerURL)
    }
  }
}

@main
struct AtChaGongWidgets: WidgetBundle {
  var body: some Widget {
    AtChaGongTimerWidget()
    AtChaGongLiveActivity()
  }
}
