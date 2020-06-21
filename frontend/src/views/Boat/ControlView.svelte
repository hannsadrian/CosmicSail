<script>
    import {onMount} from "svelte";

    onMount(async () => {
        mapboxgl.accessToken = process.env.MAPBOX_TOKEN;
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
            center: [13.650741, 50.918422], // starting position [lng, lat]
            zoom: 17 // starting zoom
        });

        function getBoatPos() {
            return {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [13.650741, 50.918422]
                        }
                    }
                ]
            };
        }

        map.on('load', function () {
            map.dragRotate.disable();
            map.touchZoomRotate.disableRotation();

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
                    map.getSource('point').setData(getBoatPos());
                } catch(err) {

                }

                requestAnimationFrame(updateBoatPos);
            }

            updateBoatPos()
        });
    })
</script>

<div style="height: 60vh" class="sm:w-2/5 mt-4 mb-4 sm:mb-0">
    <div id='map' class="rounded-lg overflow- h-full w-full"></div>
</div>