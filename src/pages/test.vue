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
      <p>Acceleration: {{ accel }}</p>
      <p>Steps: {{ stepCount }}</p>
      <p>lastZ: {{ lastZ }}</p>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
        <div @click="checkDeviceMotionPermission()">Button</div>
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

    const stepCount = ref('0');
    const lastZ = ref(null);

    const accelerationHistory = ref([]);
    const stepThreshold = ref(1.2);
    const historySize = ref(100);
    const stepInterval = ref(300);
    const accel = ref(null);
    const lastStepTime = ref(0);

    function handleMotion(event) {
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

        const { x, y, z } = event.accelerationIncludingGravity;
        const magnitude = Math.sqrt(x*x + y*y + z*z);

        if (accelerationHistory.value.length >= historySize.value) {
            accelerationHistory.value.shift(); // Remove oldest if history is full
        }
        accelerationHistory.value.push(magnitude);

        const averageMagnitude = accelerationHistory.value.reduce((sum, val) => sum + val, 0) / accelerationHistory.value.length;

        const now = Date.now();
        if (averageMagnitude > stepThreshold.value && (now - lastStepTime.value > stepInterval.value)) {
            stepCount.value++;
            lastStepTime.value = now;
        }
        /*
        const acceleration = event.accelerationIncludingGravity;
        accel.value = acceleration;

        if (lastZ.value !== null) {
            const deltaZ = Math.abs(lastZ.value - acceleration.z);
            if (deltaZ > stepThreshold.value) {
                stepCount.value++;
            }
        }
        lastZ.value = acceleration.z;
        */
    }

    function checkDeviceMotionPermission() {
        
        errorMessage.value = '111';
        if (typeof DeviceMotionEvent !== 'undefined') {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                errorMessage.value = 'ask';
                DeviceMotionEvent.requestPermission()
                    .then(permissionState => {
                        errorMessage.value = 'permissionState'
                        if (permissionState === 'granted') {
                            errorMessage.value = 'Granted'
                            window.addEventListener('devicemotion', handleMotion);
                        }
                    })
                    .catch(function (error) {
                        errorMessage.value = 'DeviceMotionEvent not enabled: ' + error;
                    })
            } else {
                window.addEventListener('devicemotion', handleMotion);
            }
        } else {
            errorMessage.value = 'Not supported';
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
        stepCount,
        accel,
        lastZ,
        errorMessage,
        checkDeviceMotionPermission
    };
  }
}
</script>
  