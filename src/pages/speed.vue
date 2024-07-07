<template>
    <div>
        <p id="speed">{{ speedDisplay }}</p>
        <p id="error">{{ errorDisplay }}</p>
        <p id="steps">Estimated Steps: {{ totalSteps }}</p>
        <p id="speedCounter">Speed Counter: {{ speedCounter }}</p>
        <p id="shakeCounter">Shake Counter: {{ shakeCounter }}</p>
        <p id="status">{{ statusDisplay }}</p> <!-- Display walking or shake status -->

        <button v-if="!deviceMotionStarted" @click="requestPermissionAndStartDeviceMotion">Start Device Motion</button>
        <button v-if="deviceMotionStarted" @click="stopDeviceMotion">Stop Device Motion</button>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

// Helper function to calculate distance between two GPS coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export default {
    setup() {
        const speedDisplay = ref('Speed: Stationary');
        const errorDisplay = ref('');
        const totalSteps = ref(0);
        const speedCounter = ref(0); // Counter to track time above average walking speed
        const shakeCounter = ref(0); // Counter to track shakes when not walking
        const statusDisplay = ref('Status: Stationary'); // Display walking or shaking status
        const isWalking = ref(false); // Flag to track if the user is walking
        const averageWalkingSpeed = 5; // Average walking speed in km/h
        const minMovementThreshold = 0.001; // Minimal distance to consider movement (in km)
        const stationaryThreshold = 5000; // Time in milliseconds to reset the counter when stationary
        const shakeThreshold = 15; // Threshold for detecting shakes (in m/s^2)
        const shakeCooldown = 1000; // Cooldown period for shake detection (in milliseconds)
        const walkingDelay = 2000; // Delay duration in milliseconds before detecting walking
        let prevPosition = null;
        let prevTime = null;
        let watchId = null;
        let distanceAccumulator = 0;
        let speedInterval = null; // Variable to hold setInterval reference
        let stationaryTimer = null; // Variable to hold setTimeout reference
        let deviceMotionListenerAdded = false; // Flag to track if device motion listener is added
        let lastShakeTime = 0; // Timestamp of the last detected shake
        let shakingDetected = ref(false); // Flag to track if shaking is detected
        let walkingDelayTimer = null; // Variable to manage walking delay timer

        const deviceMotionStarted = ref(false); // Flag to indicate if device motion tracking has started

        // Function to handle position updates
        function handlePositionUpdate(position) {
            const { latitude, longitude } = position.coords;
            const currentTime = Date.now();

            if (prevPosition && !shakingDetected.value) { // Ignore movement if shaking is detected
                const distance = getDistanceFromLatLonInKm(
                    prevPosition.latitude,
                    prevPosition.longitude,
                    latitude,
                    longitude
                );

                if (distance > minMovementThreshold) {
                    distanceAccumulator += distance;

                    // Estimate steps based on distance
                    const steps = distanceAccumulator * 1250; // Approximate number of steps per kilometer
                    totalSteps.value = Math.round(steps); // Update total steps display

                    const timeElapsed = (currentTime - prevTime) / 1000; // time in seconds
                    const speed = distance / timeElapsed; // speed in km/s

                    // Convert speed to km/h
                    const speedInKmPerHour = speed * 3600;

                    if (speedInKmPerHour > averageWalkingSpeed) {
                        // Start walking detection after a delay
                        if (walkingDelayTimer === null) {
                            walkingDelayTimer = setTimeout(() => {
                                speedDisplay.value = `Speed: ${speedInKmPerHour.toFixed(2)} km/h`;
                                startSpeedCounter();
                                isWalking.value = true; // Set walking status
                                statusDisplay.value = 'Status: Walking'; // Update status display
                                resetStationaryTimer();
                                walkingDelayTimer = null; // Clear the timer
                            }, walkingDelay);
                        }
                    } else {
                        speedDisplay.value = 'Speed: Below average walking speed';
                        isWalking.value = false; // Set not walking status
                        statusDisplay.value = 'Status: Below average walking speed'; // Update status display
                        resetStationaryTimer();
                    }
                } else {
                    // No significant movement detected
                    if (distanceAccumulator === 0) {
                        speedDisplay.value = 'Speed: Stationary';
                        isWalking.value = false; // Ensure walking status is false
                        statusDisplay.value = 'Status: Stationary'; // Update status display
                    }
                }
            } else {
                // Initial setup or shaking detected
                speedDisplay.value = 'Speed: Stationary';
                isWalking.value = false; // Set walking status to false
                statusDisplay.value = shakingDetected.value ? 'Status: Shaking' : 'Status: Stationary'; // Update status display
                prevPosition = { latitude, longitude };
                prevTime = currentTime;
            }

            prevPosition = { latitude, longitude };
            prevTime = currentTime;
        }

        // Function to handle errors
        function handleError(error) {
            console.error('Error obtaining position', error);
            errorDisplay.value = `Error: ${error.message}`;
        }

        // Function to start or reset the speed counter
        function startSpeedCounter() {
            if (speedInterval === null) {
                speedInterval = setInterval(() => {
                    speedCounter.value += 1; // Increment counter every second
                }, 1000);
            }
        }

        // Function to stop the speed counter
        function stopSpeedCounter() {
            if (speedInterval !== null) {
                clearInterval(speedInterval);
                speedInterval = null;
            }
        }

        // Function to reset the stationary timer
        function resetStationaryTimer() {
            if (stationaryTimer !== null) {
                clearTimeout(stationaryTimer);
            }

            stationaryTimer = setTimeout(() => {
                // Reset speed and distance accumulator if stationary for the defined period
                speedDisplay.value = 'Speed: Stationary';
                stopSpeedCounter(); // Stop the counter if stationary for the defined period
                distanceAccumulator = 0; // Reset distance accumulator
                if (!shakingDetected.value) { // Only reset status if not shaking
                    statusDisplay.value = 'Status: Stationary'; // Update status display
                }
            }, stationaryThreshold);
        }

        // Function to handle shake detection
        function handleDeviceMotion(event) {
            const { accelerationIncludingGravity } = event;
            const { x, y, z } = accelerationIncludingGravity;
            const acceleration = Math.sqrt(x * x + y * y + z * z);
            const currentTime = Date.now();

            if (acceleration > shakeThreshold) {
                // Check if enough time has passed since the last shake
                if (currentTime - lastShakeTime > shakeCooldown) {
                    shakeCounter.value += 1; // Increment shake counter
                    lastShakeTime = currentTime; // Update the timestamp of the last shake
                    shakingDetected.value = true; // Set shaking detected flag
                    statusDisplay.value = 'Status: Shaking'; // Update status display
                }
            } else {
                shakingDetected.value = false; // Reset shaking detected flag
                if (!isWalking.value) { // Only reset if not walking
                    statusDisplay.value = 'Status: Stationary'; // Update status display
                }
            }
        }

        // Function to request permission and start device motion detection
        function requestPermissionAndStartDeviceMotion() {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            startDeviceMotion();
                        } else {
                            errorDisplay.value = 'Permission to access device motion was denied.';
                        }
                    })
                    .catch(error => {
                        console.error('Error requesting permission for device motion:', error);
                        errorDisplay.value = `Error requesting permission: ${error.message}`;
                    });
            } else {
                // For non-iOS devices, start device motion detection directly
                startDeviceMotion();
            }
        }

        // Function to start device motion detection
        function startDeviceMotion() {
            if (!deviceMotionListenerAdded) {
                window.addEventListener('devicemotion', handleDeviceMotion);
                deviceMotionListenerAdded = true; // Update flag to indicate listener is active
                deviceMotionStarted.value = true; // Mark device motion as started
            }
        }

        // Function to stop device motion detection
        function stopDeviceMotion() {
            if (deviceMotionListenerAdded) {
                window.removeEventListener('devicemotion', handleDeviceMotion);
                deviceMotionListenerAdded = false; // Update flag to indicate listener is inactive
                deviceMotionStarted.value = false; // Mark device motion as stopped
            }
        }

        // Function to handle page visibility changes
        function handleVisibilityChange() {
            if (document.visibilityState === 'visible') {
                if (prevPosition === null) {
                    // If no previous position, reset display to stationary
                    speedDisplay.value = 'Speed: Stationary';
                    statusDisplay.value = 'Status: Stationary';
                }
                // Initialize or reinitialize position tracking
                prevTime = null; // Reset previous time
                distanceAccumulator = 0; // Reset distance accumulator
            } else {
                // Page is not visible, stop tracking motion
                stopSpeedCounter(); // Stop the speed counter if the page is not visible
                distanceAccumulator = 0; // Reset distance accumulator
            }
        }

        // Function to check if DeviceMotionEvent permission is granted
        function checkDeviceMotionPermission() {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            startDeviceMotion();
                        } else {
                            errorDisplay.value = 'Permission to access device motion was denied.';
                        }
                    })
                    .catch(error => {
                        console.error('Error checking permission for device motion:', error);
                        errorDisplay.value = `Error checking permission: ${error.message}`;
                    });
            } else {
                // For non-iOS devices, start device motion detection directly
                startDeviceMotion();
            }
        }

        // Initialize geolocation watch and event listeners
        onMounted(() => {
            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    handlePositionUpdate,
                    handleError,
                    {
                        enableHighAccuracy: true,
                        maximumAge: 0,
                        timeout: 5000
                    }
                );
            } else {
                errorDisplay.value = 'Geolocation is not available on this device.';
            }

            // Add event listener for page visibility change
            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Check for device motion permission and start tracking if already granted
            checkDeviceMotionPermission();
        });

        // Cleanup on component unmount
        onUnmounted(() => {
            // Clean up the geolocation watch on component unmount
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }

            // Stop the speed counter if it is running
            stopSpeedCounter();
            if (stationaryTimer !== null) {
                clearTimeout(stationaryTimer);
            }

            // Remove event listener for page visibility change
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            // Remove event listener for device motion if active
            stopDeviceMotion();
        });

        return {
            speedDisplay,
            errorDisplay,
            totalSteps,
            speedCounter,
            shakeCounter,
            statusDisplay, // Expose statusDisplay to template
            requestPermissionAndStartDeviceMotion, // Expose method to request permission and start device motion
            stopDeviceMotion, // Expose stopDeviceMotion method to template
            deviceMotionStarted // Expose deviceMotionStarted flag to template
        };
    }
}
</script>
