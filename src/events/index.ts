import { registerClientEvents } from "./client.events";
import { registerPlayerEvents } from "./player.events";

export function registerEvents() {
  registerClientEvents();
  registerPlayerEvents();
}