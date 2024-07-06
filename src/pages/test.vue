<template>
    <div>
        <h1>DeviceMotion Event Demo</h1>
    <p>Move your device to see the motion data.</p>
        <p>{{ errorMessage }}</p>
        <div @click="checkDeviceMotionPermission()">Button</div>
    </div>
  </template>
  
<script>
import { ref, onMounted, onUnmounted } from 'vue';
export default {
  setup() {
    const errorMessage = ref('');

    function checkDeviceMotionPermission() {
        
        errorMessage.value = '111';
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            errorMessage.value = 'ask';
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    errorMessage.value = 'permissionState'
                    if (permissionState === 'granted') {
                        errorMessage.value = 'Granted'
                        window.addEventListener('devicemotion', () => {
                            errorMessage.value = 'Motion'
                        });
                    }
                })
                .catch(function (error) {
                    errorMessage.value = 'DeviceMotionEvent not enabled: ' + error;
                })
        } else {
            errorMessage.value = 'Error';
        }
    }

    onMounted(() => {

    });

    return {
      errorMessage,
      checkDeviceMotionPermission
    };
  }
}
</script>
  