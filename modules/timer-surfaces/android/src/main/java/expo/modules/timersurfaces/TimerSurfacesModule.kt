package expo.modules.timersurfaces

import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class TimerDisplaySnapshot : Record {
  @Field var sessionId: String = ""
  @Field var endTime: Double = 0.0
  @Field var phase: String = "focus"
  @Field var currentCycle: Int = 1
  @Field var cycleCount: Int = 1
  @Field var focusDurationMilliseconds: Double = 0.0
  @Field var breakDurationMilliseconds: Double = 0.0
}

class TimerSurfacesModule : Module() {
  private val context: Context
    get() = appContext.reactContext?.applicationContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("TimerSurfaces")

    AsyncFunction("reset") {
      TimerDisplay.reset(context)
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("update") { snapshot: TimerDisplaySnapshot ->
      TimerDisplay.update(context, snapshot)
    }.runOnQueue(Queues.MAIN)
  }
}
