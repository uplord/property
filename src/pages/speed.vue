<template>
    <div>
        <p id="speed">{{ speedDisplay }}</p>
        <p id="error">{{ errorDisplay }}</p>
        <p id="steps">Estimated Steps: {{ totalSteps }}</p> <!-- Display total steps -->
        <p id="speedCounter">Speed Counter: {{ speedCounter }}</p> <!-- Display speed counter -->
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
        const averageWalkingSpeed = 5; // Average walking speed in km/h
        const minMovementThreshold = 0.001; // Minimal distance to consider movement (in km)
        let prevPosition = null;
        let prevTime = null;
        let watchId = null;
        let distanceAccumulator = 0;
        let speedInterval = null; // Variable to hold setInterval reference

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
                    } else {
                        speedDisplay.value = 'Speed: Stationary';
                        stopSpeedCounter();
                    }
                }
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
        });

        onUnmounted(() => {
            // Clean up the geolocation watch on component unmount
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }

            // Stop the speed counter if it is running
            stopSpeedCounter();
        });

        return {
            speedDisplay,
            errorDisplay,
            totalSteps,
            speedCounter // Return speedCounter to be used in the template
        };
    }
}
</script>