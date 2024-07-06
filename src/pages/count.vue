<template>
    <div>
        <h1>Shake Counter</h1>
        <p>Shakes: <span id="shakeCount">{{ shakeCount }}</span></p>
        <p>Total Movement: <span id="totalMovement">{{ totalMovement }}</span></p>
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
    let totalMovement = ref(0);

    function handleMotion() {
        let acceleration = event.accelerationIncludingGravity;
        let currentTime = new Date().getTime();

        if ((currentTime - lastTime.value) > shakeTimeout) {
            let deltaX = acceleration.x;
            let deltaY = acceleration.y;
            let deltaZ = acceleration.z;

            let totalAcceleration = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

            let timeInterval = (currentTime - lastTime.value) / 1000; // Convert to seconds
            let distanceMoved = totalAcceleration * timeInterval;
            totalMovement.value += distanceMoved;

            if (totalAcceleration > threshold) {
                shakeCount.value++;
                lastTime.value = currentTime;
            }
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
        totalMovement,
        errorMessage,
        checkDeviceMotionPermission
    };
  }
}
</script>
  