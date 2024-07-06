<template>
    <div>
        <h1>DeviceMotion Event Demo</h1>
    <p>Move your device to see the motion data.</p>
    <div id="output">
      Accelerometer: <br>
      x: <span>{{ accelX }}</span> <br>
      y: <span>{{ accelY }}</span> <br>
      z: <span>{{ accelZ }}</span> <br>
      <br>
      Gyroscope: <br>
      alpha: <span>{{ gyroAlpha }}</span> <br>
      beta: <span>{{ gyroBeta }}</span> <br>
      gamma: <span>{{ gyroGamma }}</span> <br>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
    </div>
  </template>
  
<script>
import { ref, onMounted, onUnmounted } from 'vue';
export default {
  setup() {
    const accelX = ref('0');
    const accelY = ref('0');
    const accelZ = ref('0');
    const gyroAlpha = ref('0');
    const gyroBeta = ref('0');
    const gyroGamma = ref('0');
    const errorMessage = ref('');
    console.log(1)

    function handleMotion(event) {
        console.log(2)
      if (event.acceleration) {
        accelX.value = event.acceleration.x ? event.acceleration.x.toFixed(2) : 'N/A';
        accelY.value = event.acceleration.y ? event.acceleration.y.toFixed(2) : 'N/A';
        accelZ.value = event.acceleration.z ? event.acceleration.z.toFixed(2) : 'N/A';
      }

      if (event.rotationRate) {
        gyroAlpha.value = event.rotationRate.alpha ? event.rotationRate.alpha.toFixed(2) : 'N/A';
        gyroBeta.value = event.rotationRate.beta ? event.rotationRate.beta.toFixed(2) : 'N/A';
        gyroGamma.value = event.rotationRate.gamma ? event.rotationRate.gamma.toFixed(2) : 'N/A';
      }
    }

    function checkDeviceMotionPermission() {
        console.log(3)
      if (typeof DeviceMotionEvent !== 'undefined') {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            console.log(4)
          DeviceMotionEvent.requestPermission()
            .then(permissionState => {
              if (permissionState === 'granted') {
                window.addEventListener('devicemotion', handleMotion);
              } else {
                errorMessage.value = 'Permission to access motion data was denied.';
              }
            })
            .catch(err => {
              console.error(err);
              errorMessage.value = 'Error requesting permission for motion data.';
            });
        } else {
            console.log(5)
          window.addEventListener('devicemotion', handleMotion);
        }
      } else {
        console.log(5)
        errorMessage.value = 'DeviceMotionEvent is not supported on this device.';
      }
    }

    onMounted(() => {
      checkDeviceMotionPermission();
    });

    onUnmounted(() => {
      window.removeEventListener('devicemotion', handleMotion);
    });

    return {
      accelX,
      accelY,
      accelZ,
      gyroAlpha,
      gyroBeta,
      gyroGamma,
      errorMessage
    };
  }
}
</script>
  