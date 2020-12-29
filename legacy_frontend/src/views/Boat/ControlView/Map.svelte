<script>
    import {onMount} from "svelte";

    export let lng;
    export let lat;
    export let rotation;
    let lastLng = 0;
    let lastLat = 0;

    let points = [];
    let map;

    function flyToBoat() {
        map.flyTo({center: [lng, lat], zoom: 17})
    }

    onMount(async () => {
        mapboxgl.accessToken = process.env.MAPBOX_TOKEN;
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/outdoors-v11', // stylesheet location
            center: [lng, lat], // starting position [lng, lat]
            zoom: -17 // starting zoom
        });

        function getBoatRoute() {
            if (lastLng !== lng || lastLat !== lat) {
                points.push([lng, lat])
                if (lastLat === 0)
                    map.flyTo({center: [lng, lat], zoom: 17})
                lastLat = lat;
                lastLng = lng;
            }

            return {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': points
                }

            }
        }

        function getBoatPos() {
            return {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [lng, lat]
                        }
                    }
                ]
            };
        }

        map.on('load', function () {
            map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

            map.addSource('route', {
                'type': 'geojson',
                'data': getBoatRoute()
            });
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#fff',
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            });

            map.loadImage(process.env.APIURL + "/arrow_up.png",
                    function (error, image) {
                        if (error) throw error;
                        map.addImage('arrow', image);
                        map.addSource('point', {
                            'type': 'geojson',
                            'data': getBoatPos()
                        });

                        map.addLayer({
                            'id': 'point',
                            'source': 'point',
                            'type': 'symbol',
                            'layout': {
                                'icon-image': 'arrow',
                                'icon-size': 0.25,
                                'icon-rotate': 90
                            }
                        });
                    });

            function updateBoatPos() {
                try {
                    if (lastLat !== lat) {
                        map.getSource('point').setData(getBoatPos());
                        map.getSource('route').setData(getBoatRoute());
                        map.setLayoutProperty('point', 'icon-rotate', rotation)
                    }
                } catch (err) {

                }

                requestAnimationFrame(updateBoatPos);
            }

            updateBoatPos()
        });
    })
</script>

<div id='map' class="h-full w-full">
    <button style="z-index:10;right:0;" on:click={flyToBoat} class="absolute m-2 text-lg">⛵️</button>
</div>
