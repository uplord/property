<template>
    <div>
        <h1>Direction</h1>
        <p id="status">{{ direction }}</p>
        <p id="totalMovement">{{ total }}</p>
        <p id="speed">{{ speedDisplay }}</p>
        <p>Walking - {{ isWalking  }}</p>
        <p>Acceleration - {{ acceleration  }}</p>
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
    let isWalking = ref(false);
    let acceleration = ref(null);

    function handleOrientation(event) {
        const gamma = event.gamma; // rotation around the Y-axis
        const currentTime = Date.now();

        const timeDifference = (currentTime - previousTime.value) / 1000;
        const gammaDifference = gamma - previousGamma.value;

        speed.value = Math.abs(gammaDifference) / timeDifference * speedScalingFactor;

        /*
        let displacement = 0;
        if (speed.value > 2.5) {
            speed.value * timeDifference;
        }
        totalMovement.value += displacement;
        */

        // Check the gamma value to detect left or right movement
        if (gamma > 10) {
            direction.value = 'Device tilted right';
        } else if (gamma < -10) {
            direction.value = 'Device tilted left';
        } else {
            direction.value = 'Device is upright or tilted slightly';
        }
        
        //total.value = `Movement: ${totalMovement.value.toFixed(2)} meters`;
        speedDisplay.value = `Speed: ${speed.value.toFixed(2)} m/s`;

        previousGamma.value = gamma;
        previousTime.value = currentTime;
    }

    function handleMotion(event) {
        const acc = event.acceleration;
        acceleration.value = acc;

        if (Math.abs(acc.x) > 1.0 || Math.abs(acc.y) > 1.0 || Math.abs(acc.z) > 1.0) {
            isWalking.value = true;
        } else {
            isWalking.value = false;
        }

        if (isWalking) {
            const currentTime = Date.now();
            const timeDifference = (currentTime - previousTime.value) / 1000; // Convert to seconds

            // Estimate displacement based on speed and time interval, but only if speed is above threshold
            let displacement = 0;
            if (speed.value > 2.5) {
                displacement = speed.value * timeDifference;
            }

            // Update total displacement
            totalMovement.value += displacement;

            total.value = `Movement: ${totalDisplacement.toFixed(2)} meters`;
        }
    }

    onMounted(() => {
        // Check if DeviceOrientationEvent is supported
        if (window.DeviceOrientationEvent) {
            // Add an event listener for device orientation changes
            window.addEventListener('deviceorientation', handleOrientation);
            window.addEventListener('devicemotion', handleMotion);
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
        isWalking,
        acceleration,
    };
  }
}
</script>
  