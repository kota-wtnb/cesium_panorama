// import js
import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

// import css
import '../sass/style.scss';
import '../sass/header.scss';

var icons = [];
var isShoot = true;

var container = document.getElementById('container');
var renderer, scene, camera, stats;
var mesh;
var raycaster;
var line;
var intersection = {
    intersects: false,
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
};
var mouse = new THREE.Vector2();
var textureLoader = new THREE.TextureLoader();
var decalDiffuse = textureLoader.load('../img/caution.gif');
var decalNormal = textureLoader.load('../img/caution.gif');
var decalMaterial = new THREE.MeshBasicMaterial({
    map: decalDiffuse,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: - 4,
    wireframe: false,
    //opacity: 0.3
});
var decals = [];
var mouseHelper;
var position = new THREE.Vector3();
var orientation = new THREE.Euler();
var size = new THREE.Vector3(10, 10, 10);
var params = {
    scale: 1,
    clear: function () {
        removeDecals();
    }
};
window.addEventListener('load', init);
function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    // stats = new Stats();
    // container.appendChild(stats.dom);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = -1;
    camera.target = new THREE.Vector3();
    var controls = new OrbitControls(camera, renderer.domElement);
    // controls.minDistance = 50;
    // controls.maxDistance = 200;
    scene.add(new THREE.AmbientLight(0x443333));
    var light = new THREE.DirectionalLight(0xffddcc, 1);
    light.position.set(1, 0.75, 0.5);
    scene.add(light);
    var light = new THREE.DirectionalLight(0xccccff, 1);
    light.position.set(- 1, 0.75, - 0.5);
    scene.add(light);
    var geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
    scene.add(line);
    loadPanorama();
    raycaster = new THREE.Raycaster();
    mouseHelper = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 10), new THREE.MeshNormalMaterial());
    mouseHelper.visible = false;
    scene.add(mouseHelper);
    window.addEventListener('resize', onWindowResize, false);
    var moved = false;
    controls.addEventListener('change', function () {
        moved = true;
    });
    window.addEventListener('mousedown', function () {
        moved = false;
    }, false);
    window.addEventListener('mouseup', function () {
        checkIntersection();
        if (!moved && intersection.intersects && isShoot) shoot();
        if (!moved && intersection.intersects && !isShoot) clickIcon();
    });
    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('touchmove', onTouchMove);
    function onTouchMove(event) {
        var x, y;
        if (event.changedTouches) {
            x = event.changedTouches[0].pageX;
            y = event.changedTouches[0].pageY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = - (y / window.innerHeight) * 2 + 1;
        checkIntersection();
    }
    function checkIntersection() {
        if (!mesh) return;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects([mesh]);
        if (intersects.length > 0) {
            var p = intersects[0].point;
            mouseHelper.position.copy(p);
            intersection.point.copy(p);
            var n = intersects[0].face.normal.clone();
            n.transformDirection(mesh.matrixWorld);
            n.multiplyScalar(10);
            n.add(intersects[0].point);
            intersection.normal.copy(intersects[0].face.normal);
            mouseHelper.lookAt(n);
            // var positions = line.geometry.attributes.position;
            // positions.setXYZ(0, p.x, p.y, p.z);
            // positions.setXYZ(1, n.x, n.y, n.z);
            // positions.needsUpdate = true;
            intersection.intersects = true;
        } else {
            intersection.intersects = false;
        }
    }

    function clickIcon() {
        if (icons.length > 0) {
            raycaster.intersectObjects(scene.children).forEach(function (r) {
                icons.forEach(function (i) {
                    if (r.object.uuid == i.uuid) {
                        createMessageBox(i.message);
                    }
                });
            });
        }
    }
    // var gui = new GUI();
    // gui.add(params, 'scale', 0.1, 1);
    // gui.add(params, 'clear');
    // gui.open();
    onWindowResize();
    animate();
}

// パノラマオブジェクトを作成、シーンに追加
function loadPanorama() {
    var geometry = new THREE.SphereGeometry(5, 60, 40);
    geometry.scale(-1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('../img/bg_center.png'),
        transparent: true,
        opacity: 1.0
    });

    var sphere = new THREE.Mesh(geometry, material);
    mesh = sphere;
    scene.add(sphere);
}

var uuid;

function createMessageBox(message) {
    var element = document.getElementById('message-container');
    if (element) {
        element.parentNode.removeChild(element);
    }
    var div = document.createElement('div');
    div.setAttribute("id", "message-container");
    div.innerText = message;
    document.getElementById('container').appendChild(div);
}

var icon = {};

function shoot() {
    position.copy(intersection.point);
    orientation.copy(mouseHelper.rotation);
    var scale = params.scale;
    size.set(scale, scale, scale);
    var material = decalMaterial.clone();
    var m = new THREE.Mesh(new DecalGeometry(mesh, position, orientation, size), material);

    decals.push(m);
    scene.add(m);

    inputMessageWithIcon(m.uuid);
}

function inputMessageWithIcon(_uuid) {
    icon = {};
    icon.uuid = _uuid;
    icon.message = window.prompt("メッセージを入力してください", "");

    // メッセージが空欄、キャンセルの場合
    if (icon.message == "") {
        icon.message == "メッセージがありません。";
        icons.push(icon);
    } else if (icon.message == null) {
        removeDecal(_uuid);
    } else {
        icons.push(icon);
    }
}

function removeDecal(uuid) {
    decals.forEach(function (d, index) {
        if (d.uuid == uuid) {
            scene.remove(d);
            decals.splice(index, 1);
        }
    });
}
function removeDecals() {
    decals.forEach(function (d) {
        scene.remove(d);
    });
    decals = [];
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    var distance = Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2) + Math.pow(camera.position.z, 2));
    //document.getElementById('status').textContent = distance;

    if (distance > 5) {
        decals.forEach(function (d) {
            d.visible = false;
        });
    } else {
        decals.forEach(function (d) {
            d.visible = true;
        });
    }
    //stats.update();
}
function switchMode(e) {
    modeButton.classList.toggle('edit-mode');
    modeButton.classList.toggle('view-mode');
    modeButton.textContent = (modeButton.textContent == "編集モード") ? "閲覧モード" : "編集モード";
    isShoot = !isShoot;
    e.stopPropagation();
}
var modeButton = document.getElementById('mode-button');
modeButton.addEventListener('mouseup', switchMode);
