<template>
    <div>
        <h1>Shake Counter</h1>
        <p>Shakes: <span id="shakeCount">{{ shakeCount }}</span></p>
        <p>Total Movement: <span id="totalDistance">{{ totalDistance }}</span></p>
        <div @click="checkDeviceMotionPermission()">Button</div>
        <p>{{ errorMessage }}</p>
    </div>
  </template>
  
<script>
import { ref, onMounted, onUnmounted } from 'vue';
export default {
  setup() {

    let errorMessage = ref(null);
    
    let shakeCount = ref(0);
    let threshold = 15; // Adjust this value to change the sensitivity
    let lastTime = ref(new Date().getTime());
    let shakeTimeout = 500;

    let previousTime = ref(lastTime);
    let velocityX = ref(0);
    let velocityY = ref(0);
    let velocityZ = ref(0);
    let totalDistance = ref(0);

    function handleMotion(event) {
        let acceleration = event.accelerationIncludingGravity;
        let currentTime = new Date().getTime();
        let deltaTime = (currentTime - previousTime.value) / 1000;

        if (deltaTime > 0) {
            let accelerationX = acceleration.x;
            let accelerationY = acceleration.y;
            let accelerationZ = acceleration.z;

            // Calculate velocity change
            velocityX.value += accelerationX * deltaTime;
            velocityY.value += accelerationY * deltaTime;
            velocityZ.value += accelerationZ * deltaTime;

            // Calculate distance traveled
            let distanceX = velocityX.value * deltaTime;
            let distanceY = velocityY.value * deltaTime;
            let distanceZ = velocityZ.value * deltaTime;

            let distanceMoved = Math.sqrt(distanceX * distanceX + distanceY * distanceY + distanceZ * distanceZ);
            totalDistance.value += distanceMoved;

            if (Math.sqrt(accelerationX * accelerationX + accelerationY * accelerationY + accelerationZ * accelerationZ) > threshold) {
                shakeCount.value++;
            }

            totalDistance = totalDistance.toFixed(2);
            previousTime.value = currentTime;
        }
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
        shakeCount,
        totalDistance,
        errorMessage,
        checkDeviceMotionPermission
    };
  }
}
</script>
  