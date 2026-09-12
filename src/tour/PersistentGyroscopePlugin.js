import { events } from '@photo-sphere-viewer/core';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';

// Keep the sensor active until the navbar button calls toggle()/stop().
export default class PersistentGyroscopePlugin extends GyroscopePlugin {
  handleEvent(event) {
    if (event instanceof events.StopAllEvent) return;

    if (event instanceof events.BeforeRotateEvent && this.isEnabled()) {
      event.preventDefault();
      if (this.config.touchmove && this.state.alphaOffset !== null) {
        const delta = event.position.yaw - this.viewer.getPosition().yaw;
        this.state.alphaOffset -= Math.atan2(Math.sin(delta), Math.cos(delta));
      }
      return;
    }

    super.handleEvent(event);
  }
}
