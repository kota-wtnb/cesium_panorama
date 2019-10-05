// トークン設定
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2M2VkOTIxNi1jNTFkLTRiZWYtOWQ0MS0wZmM4MzQ4NmE4YzEiLCJpZCI6NDY1Niwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0MTM4NDY3N30.I2dU0XE3iwrtcvwsFasR5kDiQADiDMMpfbFVwHmeHQg';


// 視点リストの作成
function viewPoints(_label, _latitude, _longitude, _altitude, _heading, _pitch, _range) {
    this.label = _label;
    this.latitude = _latitude;
    this.longitude = _longitude;
    this.altitude = _altitude;
    this.heading = _heading;
    this.pitch = _pitch;
    this.range = _range;
}
var viewPointsArray = [];
viewPointsArray[0] = new viewPoints("日本全国", 36.251583, 138.405714, 0, -42, -45, 1477669);
viewPointsArray[1] = new viewPoints("パノラマボール", 33.839460, 134.494809, 1000, 0, 0, 1000);
viewPointsArray[2] = new viewPoints("徳島県那賀町", 33.7983, 134.2736, 0, 0, -30, 50000);


// ビューアの作成
var viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false,
    animation: false
});
var scene = viewer.scene;

// czmlの読み込み・表示
function czmlData(_label, _url) {
    this.lable = _label;
    this.url = _url;
}

var czmlDataArray = [];
czmlDataArray[0] = new czmlData("panorama", "../czml/panorama.czml");
viewer.dataSources.add(Cesium.CzmlDataSource.load(czmlDataArray[0].url));


// オブジェクトのクリックとアクション
var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
handler.setInputAction(
    function (movement) {
        var photoBillBoard = scene.pick(movement.position);
        if (photoBillBoard) {
            trackPanoramaBall(photoBillBoard);
        }
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK
);


// 視点変更
function changeViewPoint(number, delay) {
    var newLatitude = viewPointsArray[number].latitude;
    var newLongitude = viewPointsArray[number].longitude;
    var newAltitude = viewPointsArray[number].altitude;
    var newHeading = Cesium.Math.toRadians(viewPointsArray[number].heading);
    var newPitch = Cesium.Math.toRadians(viewPointsArray[number].pitch);
    var newRange = viewPointsArray[number].range;

    var center = Cesium.Cartesian3.fromDegrees(newLongitude, newLatitude, newAltitude);
    var boundingSphere = new Cesium.BoundingSphere(center, newRange);
    var headingPitchRange = new Cesium.HeadingPitchRange(newHeading, newPitch, newRange);

    viewer.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
    viewer.camera.flyToBoundingSphere(boundingSphere, {
        duration: delay,
        offset: headingPitchRange,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
    });
}

var isStart = false;

// カメラ情報取得
function getCameraInfo() {
    var longitude = viewer.camera.positionCartographic.longitude;
    var latitude = viewer.camera.positionCartographic.latitude;
    var height = viewer.camera.positionCartographic.height;
    console.log(Cesium.Math.toDegrees(longitude) + "," + Cesium.Math.toDegrees(latitude));
    console.log(viewer.camera);
    isStart = true;
}

// パノラマボール追跡
function trackPanoramaBall(photoBillBoard) {
    // viewer.trackedEntity = photoBillBoard.id;
    // viewer.camera.flyTo({
    //     destination: Cesium.Cartesian3.fromDegrees(134.49480649572698, 33.83732763700000, 1000),
    //     orientation: {
    //         heading: Cesium.Math.toRadians(0.0),
    //         pitch: Cesium.Math.toRadians(0.0),
    //         roll: 0.0
    //     }
    // });
    changeViewPoint(1, 3.0);
}

// パノラマビューア
// HTML読み込み後実行
window.onload = function () {
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(138.73459144327657, 38.38860846354088, 2956183.115121568)
    });

    setTimeout('changeViewPoint(2, 3.0)', 5000);

    var width = document.getElementById('stage').clientWidth;
    var height = document.getElementById('stage').clientHeight;

    var scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(5, 60, 40);
    geometry.scale(-1, 1, 1);

    var material = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('../img/bg_center.png'),
        transparent: true,
        opacity: 1.0
    });

    var sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    var camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
    camera.position.set(0, 0, 20);
    camera.lookAt(sphere.position);

    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0)
    document.getElementById('stage').appendChild(renderer.domElement);
    renderer.render(scene, camera);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    var easeOut = function (p) {
        return p * (2 - p);
    };

    var progress = 0.0;

    function render() {
        requestAnimationFrame(render);

        if (isStart) {
            document.getElementById('stage').style.zIndex = 1;
            if (progress < 1.0) {
                camera.position.z = 10 - 9 * easeOut(progress);
                //material.opacity = easeOut(progress);
                progress += 0.02
            }
        }
        renderer.render(scene, camera);
        controls.update();
        //console.log(camera.position);
    }
    render();

    // リサイズ処理
    function onResize() {
        // 
    }
}

