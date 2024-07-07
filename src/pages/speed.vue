<template>
    <div>
        <p id="speed">{{ speedDisplay }}</p>
        <p id="error">{{ errorDisplay }}</p>
        <p id="steps">Estimated Steps: {{ totalSteps }}</p> <!-- Display total steps -->
        <p id="speedCounter">Speed Counter: {{ speedCounter }}</p> <!-- Display speed counter -->
        <p id="shakeCounter">Shake Counter: {{ shakeCounter }}</p> <!-- Display shake counter -->
        <p id="isWalking">Walking Status: {{ isWalking ? 'Walking' : 'Not Walking' }}</p> <!-- Display walking status -->

        <!-- Button to start device motion detection -->
        <button @click="startDeviceMotion">Start Device Motion</button>
        <!-- Button to stop device motion detection -->
        <button @click="stopDeviceMotion">Stop Device Motion</button>
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
        const speedDisplay = ref('Calculating speed...');
        const errorDisplay = ref('');
        const totalSteps = ref(0);
        const speedCounter = ref(0); // Counter to track time above average walking speed
        const shakeCounter = ref(0); // Counter to track shakes when not walking
        const isWalking = ref(false); // Flag to track if the user is walking
        const averageWalkingSpeed = 5; // Average walking speed in km/h
        const minMovementThreshold = 0.001; // Minimal distance to consider movement (in km)
        const stationaryThreshold = 5000; // Time in milliseconds to reset the counter when stationary
        const shakeThreshold = 15; // Threshold for detecting shakes (in m/s^2)
        let prevPosition = null;
        let prevTime = null;
        let watchId = null;
        let distanceAccumulator = 0;
        let speedInterval = null; // Variable to hold setInterval reference
        let stationaryTimer = null; // Variable to hold setTimeout reference
        let deviceMotionListenerAdded = false; // Flag to track if device motion listener is added

        // Function to handle position updates
        function handlePositionUpdate(position) {
            const { latitude, longitude } = position.coords;
            const currentTime = Date.now();

            if (prevPosition) {
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
                        speedDisplay.value = `Speed: ${speedInKmPerHour.toFixed(2)} km/h`;
                        startSpeedCounter();
                        isWalking.value = true; // Set walking status
                        resetStationaryTimer();
                    } else {
                        speedDisplay.value = 'Speed: Below average walking speed';
                        isWalking.value = false; // Set not walking status
                        resetStationaryTimer();
                    }
                } else {
                    // If movement is less than the threshold, update display to stationary
                    if (distanceAccumulator === 0) {
                        speedDisplay.value = 'Speed: Stationary';
                    }
                }
            } else {
                // If there's no previous position, just set up the initial values
                speedDisplay.value = 'Speed: Stationary';
                isWalking.value = false; // Set walking status to false
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
                stopSpeedCounter(); // Stop the counter if stationary for the defined period
            }, stationaryThreshold);
        }

        // Function to handle shake detection
        function handleDeviceMotion(event) {
            if (!isWalking.value) {
                const { accelerationIncludingGravity } = event;
                const { x, y, z } = accelerationIncludingGravity;
                const acceleration = Math.sqrt(x * x + y * y + z * z);

                if (acceleration > shakeThreshold) {
                    shakeCounter.value += 1; // Increment shake counter
                }
            }
        }

        // Function to start device motion detection
        function startDeviceMotion() {
            if (!deviceMotionListenerAdded) {
                window.addEventListener('devicemotion', handleDeviceMotion);
                deviceMotionListenerAdded = true; // Update flag to indicate listener is active
            }
        }

        // Function to stop device motion detection
        function stopDeviceMotion() {
            if (deviceMotionListenerAdded) {
                window.removeEventListener('devicemotion', handleDeviceMotion);
                deviceMotionListenerAdded = false; // Update flag to indicate listener is inactive
            }
        }

        // Function to handle page visibility change
        function handleVisibilityChange() {
            if (document.visibilityState === 'visible') {
                // Page is visible, reset position tracking without resetting totalSteps or speedCounter
                prevPosition = null; // Reset previous position
                prevTime = null; // Reset previous time
                distanceAccumulator = 0; // Reset distance accumulator
            }
        }

        onMounted(() => {
            // Check if geolocation is available
            if ('geolocation' in navigator) {
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
        });

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
            isWalking,
            startDeviceMotion, // Expose startDeviceMotion method to template
            stopDeviceMotion // Expose stopDeviceMotion method to template
        };
    }
}
</script>
