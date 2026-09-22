import SwiftUI
import WidgetKit
import ActivityKit

private let timerURL = URL(string: "atchagongapp:///homeSetting")!
private let timerWidgetKind = "AtChaGongTimerV3"
private let ink = Color(red: 0.09, green: 0.24, blue: 0.36)
private let ice = Color(red: 0.91, green: 0.95, blue: 0.99)

private struct TimerEntry: TimelineEntry {
  let date: Date
  var end: Date?
  var cycleCount = 4
  var needsConfirmation = false
}

private struct StudyingPenguinImage: View {
  let width: CGFloat
  let height: CGFloat

  @ViewBuilder
  var body: some View {
    if #available(iOS 18.0, *) {
      Image("studyingPenguin")
        .resizable()
        .interpolation(.none)
        .widgetAccentedRenderingMode(.fullColor)
        .scaledToFit()
        .frame(width: width, height: height)
        .unredacted()
        .accessibilityHidden(true)
    } else {
      Image("studyingPenguin")
        .resizable()
        .interpolation(.none)
        .scaledToFit()
        .frame(width: width, height: height)
        .unredacted()
        .accessibilityHidden(true)
    }
  }
}

private struct TimerProvider: TimelineProvider {
  func placeholder(in context: Context) -> TimerEntry {
    TimerEntry(date: Date(), end: Date().addingTimeInterval(1800))
  }

  func getSnapshot(in context: Context, completion: @escaping (TimerEntry) -> Void) {
    completion(context.isPreview ? placeholder(in: context) : readEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<TimerEntry>) -> Void) {
    let entry = readEntry()
    var entries = [entry]
    if let end = entry.end {
      entries.append(TimerEntry(date: end, needsConfirmation: true))
      completion(Timeline(entries: entries, policy: .after(end)))
      return
    }
    completion(
      Timeline(
        entries: entries,
        policy: .after(Date().addingTimeInterval(15))
      )
    )
  }

  private func readEntry() -> TimerEntry {
    guard let saved = UserDefaults(suiteName: "group.com.atchagong.atchagong.timer")?.dictionary(forKey: "timerDisplay"),
          let milliseconds = (saved["endTime"] as? NSNumber)?.doubleValue else {
      return TimerEntry(date: Date())
    }
    let end = Date(timeIntervalSince1970: milliseconds / 1000)
    return TimerEntry(
      date: Date(),
      end: end > Date() ? end : nil,
      cycleCount: (saved["cycleCount"] as? NSNumber)?.intValue ?? 4,
      needsConfirmation: end <= Date()
    )
  }
}

private struct TimerWidgetView: View {
  @Environment(\.widgetFamily) private var family
  @Environment(\.widgetRenderingMode) private var renderingMode
  let entry: TimerEntry

  var body: some View {
    ZStack(alignment: .bottomTrailing) {
      if family != .accessoryRectangular {
        StudyingPenguinImage(
          width: family == .systemMedium ? 112 : 66,
          height: family == .systemMedium ? 112 : 66
        )
      }

      VStack(alignment: .leading, spacing: family == .accessoryRectangular ? 2 : 7) {
        Label("앗차공", systemImage: "timer")
          .font(.caption.bold())
        if let end = entry.end, end > entry.date {
          if family != .accessoryRectangular {
            Text("집중·휴식 \(entry.cycleCount)사이클").font(.caption)
          }
          Text(timerInterval: entry.date...end, countsDown: true)
            .font(family == .accessoryRectangular ? .headline : .largeTitle)
            .monospacedDigit()
            .minimumScaleFactor(0.6)
            .lineLimit(1)
          Text("세션 남은 시간").font(.caption2)
        } else {
          Text(entry.needsConfirmation ? "앱에서 완료 여부를\n확인해 주세요" : "집중할 준비가\n되었나요?")
            .font(family == .accessoryRectangular ? .caption : .headline)
          if family != .accessoryRectangular {
            Text("눌러서 앱 열기").font(.caption)
          }
        }
      }
      .padding(.trailing, family == .systemMedium ? 108 : family == .systemSmall ? 42 : 0)
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
    let end = Date(timeIntervalSince1970: context.state.endTime / 1000)
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
          Text("앗차공 · 집중·휴식 \(context.state.cycleCount)사이클").font(.caption.bold())
          ActivityCountdown(context: context).font(.largeTitle)
          Text(context.isStale ? "완료 여부는 앱에서 확인해 주세요" : "세션 남은 시간").font(.caption)
        }
        Spacer(minLength: 0)
        StudyingPenguinImage(width: 78, height: 78)
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
            StudyingPenguinImage(width: 28, height: 28)
            Text("앗차공")
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text("\(context.state.cycleCount)사이클").font(.caption)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack {
            ActivityCountdown(context: context).font(.title)
            Text("세션 남은 시간 · 앱에서 확인").font(.caption)
          }
        }
      } compactLeading: {
        StudyingPenguinImage(width: 24, height: 24)
      } compactTrailing: {
        ActivityCountdown(context: context).font(.caption).frame(maxWidth: 64)
      } minimal: {
        StudyingPenguinImage(width: 20, height: 20)
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
