// WebSocket connection manager — maps userId → send function
// Stored as plain send callbacks to avoid coupling to Bun types.

type Sender = (data: string) => void;

class WebSocketManager {
  private readonly connections = new Map<string, Sender>();

  add(userId: string, send: Sender): void {
    this.connections.set(userId, send);
  }

  remove(userId: string): void {
    this.connections.delete(userId);
  }

  send(userId: string, data: unknown): void {
    const sender = this.connections.get(userId);
    if (!sender) return;
    try {
      sender(JSON.stringify(data));
    } catch {
      // Stale connection — evict it
      this.connections.delete(userId);
    }
  }

  isOnline(userId: string): boolean {
    return this.connections.has(userId);
  }
}

export const wsManager = new WebSocketManager();
