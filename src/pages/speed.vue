<template>
    <div>
        <p id="speed">{{ speedDisplay }}</p>
        <p id="error">{{ errorDisplay }}</p>
        <p id="steps">Estimated Steps: {{ totalSteps }}</p> <!-- Display total steps -->
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
        const totalSteps = ref(0); // Add reactive variable for total steps
        let prevPosition = null;
        let prevTime = null;
        let watchId = null;
        let distanceAccumulator = 0;
        const averageStepsPerKm = 1250; // Approximate number of steps per kilometer
        const minMovementThreshold = 0.001; // Minimal distance to consider movement (in km)
        const speedToStepsMultiplier = 0.05; // Multiplier to estimate steps from speed

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
                
                if (distance > minMovementThreshold) { // Only update if there's significant movement
                    distanceAccumulator += distance;

                    // Estimate steps based on distance
                    const steps = distanceAccumulator * averageStepsPerKm;
                    totalSteps.value = Math.round(steps); // Update total steps display

                    const timeElapsed = (currentTime - prevTime) / 1000; // time in seconds
                    const speed = distance / timeElapsed; // speed in km/s

                    // Convert speed to m/s and km/h
                    const speedInMetersPerSecond = speed * 1000;
                    const speedInKmPerHour = speed * 3600;

                    if (speedInKmPerHour > 0.1) { // Only update if speed is above a threshold
                        speedDisplay.value = `Speed: ${speedInMetersPerSecond.toFixed(2)} m/s or ${speedInKmPerHour.toFixed(2)} km/h`;
                    } else {
                        speedDisplay.value = 'Speed: Stationary';
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
        });

        return {
            speedDisplay,
            errorDisplay,
            totalSteps // Return totalSteps to be used in the template
        };
    }
}
</script>
