<template>
    <div>
        <h1>Direction</h1>
        <p id="status">{{ direction }}</p>
        <p id="totalMovement">{{ total }}</p>
        <p id="speed">{{ speedDisplay }}</p>
    </div>
  </template>
  
<script>
import { ref, onMounted, onUnmounted } from 'vue';
export default {
  setup() {

    let direction = ref('start');
    let previousGamma = ref(0);
    let totalMovement = ref(0);
    let total = ref(`Movement: 0.00 meters`);
    let previousTime = ref(Date.now());
    let speedScalingFactor = 0.01;
    let speed = ref(0);
    let speedDisplay = ref(`Speed: 0.00 m/s`);

    function handleOrientation(event) {
        // Get the rotation around the Z-axis (alpha), X-axis (beta), and Y-axis (gamma)
        const alpha = event.alpha; // rotation around the Z-axis
        const beta = event.beta;   // rotation around the X-axis
        const gamma = event.gamma; // rotation around the Y-axis

        const currentTime = Date.now();

        const timeDifference = (currentTime - previousTime.value) / 1000;
        const gammaDifference = gamma - previousGamma.value;

        speed.value = Math.abs(gammaDifference) / timeDifference * speedScalingFactor;

        //const displacement = Math.abs(gammaDifference) * 0.15 * timeDifference;
        const displacement = speed.value * timeDifference;
        totalMovement.value += displacement;

        // Check the gamma value to detect left or right movement
        if (gamma > 10) {
            direction.value = 'Device tilted right';
        } else if (gamma < -10) {
            direction.value = 'Device tilted left';
        } else {
            direction.value = 'Device is upright or tilted slightly';
        }
        total.value = `Movement: ${totalMovement.value.toFixed(2)} meters`;
        speedDisplay.value = `Speed: ${speed.value.toFixed(2)} m/s`;

        previousGamma.value = gamma;
        previousTime.value = currentTime;
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
        total,
        speedDisplay,
    };
  }
}
</script>
  