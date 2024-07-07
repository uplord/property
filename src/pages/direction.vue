<template>
    <div>
      <h1>Direction</h1>
      <p id="status">{{ direction }}</p>
      <p id="totalMovement">{{ total }}</p>
      <p id="speed">{{ speedDisplay }}</p>
      <p>Walking - {{ isWalking }}</p>
      <p>Acceleration - {{ acceleration }}</p>
      <p>Status - {{ status }}</p>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  export default {
    setup() {
      const direction = ref('start');
      const previousGamma = ref(0);
      const totalMovement = ref(0);
      const total = ref(`Movement: 0.00 meters`);
      const previousOrientationTime = ref(Date.now());
      const previousMotionTime = ref(Date.now());
      const speedScalingFactor = 0.01;
      const speed = ref(0);
      const speedDisplay = ref(`Speed: 0.00 m/s`);
      const isWalking = ref(false);
      const acceleration = ref(null);
      const status = ref(null);
  
      function handleOrientation(event) {
        const gamma = event.gamma; // rotation around the Y-axis

        // Check the gamma value to detect left or right movement
        if (gamma > 10) {
          direction.value = 'Device tilted right';
        } else if (gamma < -10) {
          direction.value = 'Device tilted left';
        } else {
          direction.value = 'Device is upright or tilted slightly';
        }
  
        previousGamma.value = gamma;
      }
  
      function handleMotion(event) {
        const acc = event.acceleration;
        acceleration.value = acc;
  
        // Determine if the device is walking based on the acceleration threshold
        if (Math.abs(acc.x) > 1.0 || Math.abs(acc.y) > 1.0 || Math.abs(acc.z) > 1.0) {
          isWalking.value = true;
        } else {
          isWalking.value = false;
        }
  
        // If the device is walking, update the total displacement
        if (isWalking.value) {
          const currentTime = Date.now();
          const timeDifference = (currentTime - previousMotionTime.value) / 1000; // Convert to seconds
  
          if (timeDifference === 0) return; // Prevent division by zero

          // Calculate the net acceleration (ignoring gravity)
        const netAcc = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

        // Calculate speed from the acceleration
        speed.value = netAcc * timeDifference;
  
          // Estimate displacement based on speed and time interval, but only if speed is above threshold
          let displacement = 0;
          if (speed.value > 1.4) {
            displacement = speed.value * timeDifference;
          }
  
          status.value = 'testing - ' + displacement;
  
          // Update total displacement
          totalMovement.value += displacement;
          total.value = `Movement: ${totalMovement.value.toFixed(2)} meters`;

          speedDisplay.value = `Speed: ${speed.value.toFixed(2)} m/s`;
  
          // Update the previous time for the next event
          previousMotionTime.value = currentTime;
        }
      }
  
      onMounted(() => {
        // Check if DeviceOrientationEvent and DeviceMotionEvent are supported
        if (window.DeviceOrientationEvent && window.DeviceMotionEvent) {
          // Add event listeners for device orientation and motion changes
          window.addEventListener('deviceorientation', handleOrientation);
          window.addEventListener('devicemotion', handleMotion);
        } else {
          // Inform the user that device orientation or motion is not supported
          direction.value = 'Device orientation or motion not supported';
        }
      });
  
      onUnmounted(() => {
        // Remove event listeners when the component is unmounted
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('devicemotion', handleMotion);
      });
  
      return {
        direction,
        total,
        speedDisplay,
        isWalking,
        acceleration,
        status,
      };
    }
  }
  </script>
  