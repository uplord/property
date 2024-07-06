<template>
    <div>
        <h1>Direction</h1>
        <div id="status">{{ direction }}</div>
    </div>
  </template>
  
<script>
import { ref, onMounted, onUnmounted } from 'vue';
export default {
  setup() {

    let direction = ref('start');

    function handleOrientation(event) {
        // Get the rotation around the Z-axis (alpha), X-axis (beta), and Y-axis (gamma)
        const alpha = event.alpha; // rotation around the Z-axis
        const beta = event.beta;   // rotation around the X-axis
        const gamma = event.gamma; // rotation around the Y-axis

        // Check the gamma value to detect left or right movement
        if (gamma > 10) {
            direction.value = 'Device tilted right';
        } else if (gamma < -10) {
            direction.value = 'Device tilted left';
        } else {
            direction.value = 'Device is upright or tilted slightly';
        }
    }

    onMounted(() => {
        // Check if DeviceOrientationEvent is supported
        if (window.DeviceOrientationEvent) {
            // Add an event listener for device orientation changes
            window.addEventListener('deviceorientation', handleOrientation);
        } else {
            // Inform the user that device orientation is not supported
            direction.value = 'Device orientation not supported';
        }
    });

    onUnmounted(() => {

    });

    return {
        direction,
    };
  }
}
</script>
  