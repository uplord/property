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
      <p>Steps: {{ steps }}</p>
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

    const steps = ref('0');

    /*
    const accelerationThreshold = ref(15);
    const rotationThreshold = ref(10);
    const lastAcceleration = ref({ x: null, y: null, z: null });
    const lastRotationRate = ref({ alpha: null, beta: null, gamma: null });
    const lastTime = ref(0);
    /*

    const accelerationHistory = ref([]);
    const stepThreshold = ref(12);
    const historySize = ref(100);
    const stepInterval = ref(300);
    const accel = ref(null);
    const lastStepTime = ref(0);
    */

    const stepThreshold = ref(1.2);
    const filterFactor = ref(0.8);
    const minTimeBetweenSteps = ref(300);

    const lastAcceleration = ref({ x: 0, y: 0, z: 0 });
    const filteredAcceleration = ref({ x: 0, y: 0, z: 0 });
    const lastPeakTime = ref(0);

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

        const acceleration = event.accelerationIncludingGravity;
        filteredAcceleration.value.x = filterFactor.value * filteredAcceleration.value.x + (1 - filterFactor.value) * acceleration.x;
        filteredAcceleration.value.y = filterFactor.value * filteredAcceleration.y + (1 - filterFactor.value) * acceleration.y;
        filteredAcceleration.value.z = filterFactor.value * filteredAcceleration.z + (1 - filterFactor.value) * acceleration.z;

        const currentTime = new Date().getTime();

        // Calculate the magnitude of the filtered acceleration vector
        const magnitude = Math.sqrt(filteredAcceleration.value.x ** 2 + filteredAcceleration.value.y ** 2 + filteredAcceleration.value.z ** 2);
        const delta = Math.abs(magnitude - lastAcceleration.value.magnitude);

        if (delta > stepThreshold.value && (currentTime - lastPeakTime.value) > minTimeBetweenSteps.value) {
            steps++;
            lastPeakTime.value = currentTime;
        }

        lastAcceleration.value = {
            x: filteredAcceleration.value.x,
            y: filteredAcceleration.value.y,
            z: filteredAcceleration.value.z,
            magnitude: magnitude
        };

      /*

        const acc = event.accelerationIncludingGravity;
        const currentAcc = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

        const filteredAcc = alpha * lastFilteredAcc.value + (1 - alpha) * currentAcc;
        const delta = filteredAcc - lastFilteredAcc.value;

        const currentTime = Date.now();
        if (delta > stepThreshold.value && (currentTime - lastStepTime.value > minStepInterval.value)) {
            steps.value++;
            lastStepTime.value = currentTime;
        }

        lastFilteredAcc.value = filteredAcc;

      /*

        let currentTime = Date.now();

        if (currentTime - lastTime.value > 100) { // Sample every 100ms
            let acc = event.accelerationIncludingGravity;
            let rot = event.rotationRate;

            let deltaX = Math.abs(lastAcceleration.value.x - acc.x);
            let deltaY = Math.abs(lastAcceleration.value.y - acc.y);
            let deltaZ = Math.abs(lastAcceleration.value.z - acc.z);

            let deltaAlpha = Math.abs(lastRotationRate.alpha - rot.alpha);
            let deltaBeta = Math.abs(lastRotationRate.beta - rot.beta);
            let deltaGamma = Math.abs(lastRotationRate.gamma - rot.gamma);

            if ((deltaX + deltaY + deltaZ) > accelerationThreshold.value || 
                        (deltaAlpha + deltaBeta + deltaGamma) > rotationThreshold.value) {
                steps.value++;
            }

            lastAcceleration.value = { x: acc.x, y: acc.y, z: acc.z };
            lastRotationRate.value = { alpha: rot.alpha, beta: rot.beta, gamma: rot.gamma };
            lastTime.value = currentTime;
        }

      /*

        const { x, y, z } = event.accelerationIncludingGravity;
        const magnitude = Math.sqrt(x*x + y*y + z*z);

        if (accelerationHistory.value.length >= historySize.value) {
            accelerationHistory.value.shift(); // Remove oldest if history is full
        }
        accelerationHistory.value.push(magnitude);

        const averageMagnitude = accelerationHistory.value.reduce((sum, val) => sum + val, 0) / accelerationHistory.value.length;

        const now = Date.now();
        if (averageMagnitude > stepThreshold.value && (now - lastStepTime.value > stepInterval.value)) {
            steps.value++;
            lastStepTime.value = now;
        }
        /*
        const acceleration = event.accelerationIncludingGravity;
        accel.value = acceleration;

        if (lastZ.value !== null) {
            const deltaZ = Math.abs(lastZ.value - acceleration.z);
            if (deltaZ > stepThreshold.value) {
                steps.value++;
            }
        }
        lastZ.value = acceleration.z;
        */
    }

    function checkDeviceMotionPermission() {
        
        errorMessage.value = '111';
        if (window.DeviceMotionEvent) {
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
                errorMessage.value = 'active';
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
        steps,
        errorMessage,
        checkDeviceMotionPermission
    };
  }
}
</script>
  