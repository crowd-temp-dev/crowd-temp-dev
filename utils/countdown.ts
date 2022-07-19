import { convertToMilliSecond } from '.'
export type Duration = `${number}${'ms' | 's' | ''}` | number

export default class Countdown {
  public duration = 0
  private onDone: () => Countdown
  private onUpdate: () => Countdown
  private timeoutId = null
  private startTime = 0
  public done = true
  public stopped = true
  private _currentTime = 0
  public running = false
  private pausedTime = 0
  private useAnimframe = false
  public touched = false

  constructor(arg: {
    duration: Duration
    onDone?: (_arg: Countdown) => void
    onUpdate?: (_arg: Countdown) => void
  }) {
    const { duration, onDone, onUpdate } = arg

    this.setDuration(duration)
    this.onDone = function (): Countdown {
      if (typeof onDone === 'function') {
        onDone(this)
      }

      return this
    }

    this.onUpdate = function (): Countdown {
      if (typeof onUpdate === 'function') {
        onUpdate(this)

        this.useAnimframe = true
      }

      return this
    }
  }

  public get remainingTime() {
    if (this.stopped) return 0

    return Math.max(
      this.duration -
        (this.currentTime - this.pausedTime - this.startTime || 1),
      0
    )
  }

  public get currentTime() {
    return this._currentTime
  }

  private set currentTime(val) {
    if (typeof val === 'number') {
      this._currentTime = val

      if (typeof this.onUpdate === 'function' && this.percentDone !== 0) {
        this.onUpdate()
      }
    }
  }

  get paused() {
    return !this.running && !this.stopped
  }

  public get percentDone() {
    if (this.stopped) {
      return 0
    }

    const percent = this.remainingTime / this.duration

    // starting
    if (percent === 1) {
      return 0
    }

    // done
    if (percent === 0) {
      return 1
    }

    return Math.max(percent, 0)
  }

  private clearTimeout(): Countdown {
    if (this.useAnimframe) {
      cancelAnimationFrame(this.timeoutId)
    } else {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = 0

    return this
  }

  private run(): Countdown {
    const done = () => {
      this.running = false

      this.done = true

      this.stopped = true

      this.clearTimeout().onUpdate().onDone()
    }

    if (typeof this.onUpdate === 'function') {
      const frame = (currentTime: number) => {
        if (this.remainingTime <= 0) {
          return done()
        }

        this.currentTime = currentTime

        this.timeoutId = requestAnimationFrame(frame)
      }

      frame(this.currentTime)
    } else {
      this.timeoutId = setTimeout(done, this.remainingTime)
    }

    return this
  }

  public start(): Countdown {
    this.touched = true

    if (this.running) {
      return this
    }

    if (this.stopped) {
      this.startTime = performance.now()

      this.currentTime = this.startTime

      this.pausedTime = 0
    }

    if (this.paused) {
      this.pausedTime += performance.now() - this.currentTime
    }

    requestAnimationFrame(() => {
      this.stopped = false

      this.running = true

      this.done = false

      this.run().onUpdate()
    })

    return this
  }

  public pause(): Countdown {
    if (!this.running) {
      return this
    }

    this.clearTimeout()

    this.currentTime = performance.now()

    this.running = false

    this.onUpdate()

    return this
  }

  public stop(): Countdown {
    if (this.stopped) {
      return this
    }

    this.clearTimeout()

    this.running = false

    if (!this.running) {
      this.stopped = true

      this.startTime = 0

      this.onUpdate()
    }

    return this
  }

  public setDuration(val: Duration): Countdown {
    this.duration = convertToMilliSecond(val)

    return this
  }
}
