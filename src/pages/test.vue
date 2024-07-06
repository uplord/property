<template>
    <div>
        <h1>DeviceMotion Event Demo</h1>
    <p>Move your device to see the motion data.</p>
        <p>{{ errorMessage }}</p>
    </div>
  </template>
  
<script>
import { ref, onMounted, onUnmounted } from 'vue';
export default {
  setup() {
    const errorMessage = ref('');

    function checkDeviceMotionPermission() {
        
        errorMessage.value = '111';
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            errorMessage.value = 'ask';
            document.body.addEventListener('click', function () {
                errorMessage.value = 'click';
                DeviceOrientationEvent.requestPermission()
                    .then(function() {
                        errorMessage.value = 'DeviceOrientationEvent, DeviceMotionEvent enabled';
                    })
                    .catch(function (error) {
                        errorMessage.value = 'DeviceOrientationEvent, DeviceMotionEvent not enabled: ' + error;
                    })
            }, {once: true});
            return;
        } else {
            errorMessage.value = 'Error';
        }
    }

    onMounted(() => {

      checkDeviceMotionPermission();
    });

    return {
      errorMessage
    };
  }
}
</script>
  