import React, { useState, useEffect, useRef } from 'react'

const LiveTracking = () => {
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        // Initialize Ola Maps
        const script = document.createElement('script');
        script.src = `https://maps.ola.com/api/js?key=${import.meta.env.VITE_OLA_MAPS_API_KEY}`;
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const initializeMap = () => {
        if (window.ola && window.ola.maps) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const center = { lat: latitude, lng: longitude };
                setCurrentPosition(center);

                // Initialize map
                mapRef.current = new window.ola.maps.Map(document.getElementById('map'), {
                    center: center,
                    zoom: 15
                });

                // Add marker
                markerRef.current = new window.ola.maps.Marker({
                    position: center,
                    map: mapRef.current
                });

                // Watch position
                const watchId = navigator.geolocation.watchPosition((position) => {
                    const { latitude, longitude } = position.coords;
                    const newPosition = { lat: latitude, lng: longitude };
                    setCurrentPosition(newPosition);
                    if (markerRef.current) {
                        markerRef.current.setPosition(newPosition);
                    }
                    if (mapRef.current) {
                        mapRef.current.setCenter(newPosition);
                    }
                });

                return () => navigator.geolocation.clearWatch(watchId);
            });
        }
    };

    return (
        <div id="map" style={{ width: '100%', height: '100%' }} />
    );
};

export default LiveTracking;