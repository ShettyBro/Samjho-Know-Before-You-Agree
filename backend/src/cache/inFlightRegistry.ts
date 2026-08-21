export class InFlightRegistry<T> {
  private readonly entries = new Map<string, Promise<T>>()

  get(key: string): Promise<T> | undefined {
    return this.entries.get(key)
  }

  has(key: string): boolean {
    return this.entries.has(key)
  }

  size(): number {
    return this.entries.size
  }

  register(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = this.entries.get(key)
    if (existing) return existing

    const promise = factory().finally(() => {
      if (this.entries.get(key) === promise) this.entries.delete(key)
    })
    this.entries.set(key, promise)
    return promise
  }

  clear(): void {
    this.entries.clear()
  }
}
