package expo.modules.timersurfaces

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews

class TimerWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    // This also clears stale launcher views when Android starts a fresh process.
    TimerDisplay.renderWidgets(context)
    if (TimerDisplay.snapshot == null) TimerDisplay.cancelNotification(context)
  }
}

internal object TimerDisplay {
  private const val CHANNEL = "atchagong_timer"
  private const val NOTIFICATION_ID = 7041
  // Deliberately process-local: a widget receiver must never restore a killed session.
  var snapshot: TimerDisplaySnapshot? = null
    private set
  private val handler = Handler(Looper.getMainLooper())
  private var expiry: Runnable? = null

  fun reset(context: Context) {
    expiry?.let { handler.removeCallbacks(it) }
    expiry = null
    snapshot = null
    cancelNotification(context)
    renderWidgets(context)
  }

  fun update(context: Context, value: TimerDisplaySnapshot) {
    expiry?.let { handler.removeCallbacks(it) }
    snapshot = value
    renderWidgets(context)
    val remaining = value.endTime.toLong() - System.currentTimeMillis()
    if (remaining <= 0) {
      cancelNotification(context)
      return
    }
    showNotification(context, value, remaining)
    expiry = Runnable {
      // Display expiry is not proof of completion. No records or JS timers are started here.
      cancelNotification(context)
      renderWidgets(context)
    }.also { handler.postDelayed(it, remaining) }
  }

  private fun openApp(context: Context): PendingIntent {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("atchagongapp:///homeSetting"))
      .setPackage(context.packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    return PendingIntent.getActivity(context, 7041, intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }

  fun renderWidgets(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    val ids = manager.getAppWidgetIds(ComponentName(context, TimerWidgetProvider::class.java))
    val value = snapshot
    val remaining = (value?.endTime?.toLong() ?: 0L) - System.currentTimeMillis()
    val running = value != null && remaining > 0
    val views = RemoteViews(context.packageName, R.layout.timer_widget).apply {
      setOnClickPendingIntent(R.id.timer_root, openApp(context))
      setTextViewText(R.id.timer_title, if (running) "집중·휴식 ${value!!.cycleCount}사이클" else "집중할 준비가 되었나요?")
      setViewVisibility(R.id.timer_countdown, if (running) View.VISIBLE else View.GONE)
      setChronometer(R.id.timer_countdown, SystemClock.elapsedRealtime() + maxOf(0L, remaining), null, running)
      setChronometerCountDown(R.id.timer_countdown, true)
      setTextViewText(R.id.timer_hint, when {
        running -> "세션 남은 시간 · 눌러서 앱 열기"
        value != null -> "앱에서 완료 여부를 확인해 주세요"
        else -> "눌러서 타이머 시작"
      })
    }
    manager.updateAppWidget(ids, views)
  }

  fun cancelNotification(context: Context) {
    context.getSystemService(NotificationManager::class.java).cancel(NOTIFICATION_ID)
  }

  private fun showNotification(context: Context, value: TimerDisplaySnapshot, remaining: Long) {
    val manager = context.getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= 26) {
      manager.createNotificationChannel(NotificationChannel(CHANNEL, "진행 중인 타이머", NotificationManager.IMPORTANCE_LOW).apply {
        description = "잠금화면에서 집중·휴식 세션의 남은 시간을 표시합니다"
        lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        setSound(null, null)
      })
    }
    if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
    @Suppress("DEPRECATION")
    val builder = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(context, CHANNEL) else Notification.Builder(context)
    builder.setSmallIcon(R.drawable.timer_notification_icon)
      .setContentTitle("앗차공 · 집중·휴식 ${value.cycleCount}사이클")
      .setContentText("세션 남은 시간 · 눌러서 앱에서 확인")
      .setContentIntent(openApp(context))
      .setCategory(Notification.CATEGORY_PROGRESS)
      .setVisibility(Notification.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setWhen(value.endTime.toLong())
      .setShowWhen(true)
      .setUsesChronometer(true)
      .setChronometerCountDown(true)
    if (Build.VERSION.SDK_INT >= 26) builder.setTimeoutAfter(remaining)
    manager.notify(NOTIFICATION_ID, builder.build())
  }
}
