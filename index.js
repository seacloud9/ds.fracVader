var createGame = require('voxel-engine'),
    tic = createGame.tick,
    voxelpp = require('voxel-pp'),
    importShaders = require('./scripts/shaders.js'),
    hasGenerated = false,
    hasGeneratedMod = false,
    cockpitView = true,
    bulletmovespeed = 0.05 * 5,
    _liveBogeys = [],
    _width = window.innerWidth,
    _height = window.innerHeight;
mouse = {
    x: 0,
    y: 0
};


window.game = createGame({
    chunkDistance: 3,
    skyColor: 0x000000,
    chunkSize: 8,
    worldOrigin: [0, 0, 0],
    generateChunks: false,
    texturePath: 'textures/',
    controls: {
        discreteFire: false,
        jump_max_speed: 0,
        jump_speed: 0.004
    },
    materials: [
        ['glass2'], 'brick', 'dirt', 'obsidian'
    ],
    keybindings: {
        'W': 'forward',
        'A': null,
        'S': 'backward',
        'D': null,
        '<up>': 'forward',
        '<left>': null,
        '<down>': 'backward',
        '<right>': null,
        '<mouse 1>': 'fire',
        '<mouse 3>': 'firealt',
        '<space>': 'jump',
        '<shift>': 'crouch',
        '<control>': 'alt'
    }

});


function generateVx() {
    var perlinTerrain = require('voxel-perlin-terrain');
    var terrainGenerator = perlinTerrain('foobar', 0, 5);
    game.voxels.on('missingChunk', function(chunkPosition) {
        var size = game.chunkSize
        var voxels = terrainGenerator(chunkPosition, size)
        var chunk = {
            position: chunkPosition,
            dims: [size, size, size],
            voxels: voxels
        }
        game.showChunk(chunk)
    });
}



var critterCreator = require('voxel-critter')(game);
var clock = new game.THREE.Clock();
window.game.view.renderer.autoClear = true;
game.tic = tic;
//game.scene.fog.far = 90000;
game.scene.fog.far = 2000;
game.gravity = [0, 0, 0];
game.paused = false
game.appendTo('#container');
document.addEventListener('mousemove', onDocumentMouseMove, false);
var vaderBullet = require('voxel-bullet');
_bullet = vaderBullet(game)();
window.addEventListener('keydown', function(ev) {
    // /console.log(ev.keyCode);
    if (ev.keyCode === 'R'.charCodeAt(0)) {
        player.toggle();
        if (cockpit.alpha) {
            cockpit.alpha = 0;
            player.avatar.head.children[4].visible = true;
            cockpitView = false;
            player.currentCamera = player.avatar.cameraOutside.children[0];
        } else {
            cockpit.alpha = 1;
            player.avatar.head.children[4].visible = false;
            cockpitView = true;
            player.currentCamera = player.avatar.cameraInside.children[1];
        }
    }
    if (ev.keyCode == 87) {
        var rP = new game.THREE.Vector3(mouse.x, mouse.y, 1);
        var pro = new game.THREE.Projector();
        pro.unprojectVector(rP, player.currentCamera);
        var ray = new game.THREE.Ray(player.position, rP.sub(player.position).normalize());
        player.avatar.translateY(0.5 * ray.direction.y)
    }
    if (ev.keyCode == 32) {
        ev.preventDefault();
        var rP = player.position;
        var bArr = [new game.THREE.Vector3(rP.x + 14, rP.y * 0.8, rP.z), new game.THREE.Vector3(rP.x - 14, rP.y * 0.8, rP.z)];
        _bullet.BuildBullets({
            count: 2,
            rootVector: new game.THREE.Vector3(mouse.x, mouse.y, 1),
            rootPosition: player.position,
            bulletPosition: bArr,
            target: _liveBogeys,
        }, player.currentCamera);
    }
});

function initPostProcess() {
    /// postprocess rendering
    postprocessor = voxelpp(game);
    var bS = new postprocessor.EffectComposer.BloomPass(9.25, 2, 0.0001, 1024);
    var fS = new postprocessor.EffectComposer.FilmPass(0.35, 0.95, 2048, false);
    fS.renderToScreen = true
    postprocessor.addPass(bS);
    postprocessor.addPass('ShaderPass', postprocessor.EffectComposer.ShaderExtras["screen"]);
}




onWindowResize = function(event) {
    customUniforms.resolution.value.x = window.innerWidth;
    customUniforms.resolution.value.y = window.innerHeight;
    postprocessor.composer.setSize(window.innerWidth, window.innerHeight);
    window.game.camera.aspect = window.innerWidth / window.innerHeight;
    window.game.camera.updateProjectionMatrix();
    postprocessor.composer.reset();
}
window.addEventListener('resize', onWindowResize, false);

startFracVaders = function() {
    generateVx();
    window.game.scene.remove(window.game.scene.__objects[1]);
    initPostProcess();
    canvasCallback = $.Callbacks();
    SPE = require('Shader-Particles')(game);
    window.game.starTunnel = new SPE.Group({
        texture: window.game.THREE.ImageUtils.loadTexture('images/spikey.png'),
        maxAge: 2
    }, game.THREE);
    emitter = new SPE.Emitter({
        position: new window.game.THREE.Vector3(0, 0, 10),
        positionSpread: new window.game.THREE.Vector3(150, 150, 150),
        acceleration: new window.game.THREE.Vector3(0, 0, 10),
        velocity: new window.game.THREE.Vector3(0, 0, 10),
        colorStart: new window.game.THREE.Color('white'),
        colorEnd: new window.game.THREE.Color('red'),
        sizeStart: 2,
        sizeEnd: 2,
        opacityStart: 0,
        opacityMiddle: 1,
        opacityEnd: 0,
        particleCount: 5000
    });

    window.game.starTunnel.addEmitter(emitter);

    window.game.scene.fog.color = {
        r: 0,
        g: 0,
        b: 0
    };
    game.view.renderer.setClearColor(0x000000, 1.0);
    game.on('postrender', function(dt) {
        window.game.starTunnel.tick(clock.getDelta() * 0.5);
        window.game.view.renderer.clear();
        postprocessor.composer.render(0.01);

    });
    var hellcat = new Image();
    hellcat.onload = function() {
        hellcatMod = critterCreator(hellcat);
        var createPlayer = require('voxel-player')(game);
        player = createPlayer('textures/substack.png');
        player.playerSkin.body.visible = false;
        player.playerSkin.rightArm.visible = false;
        player.playerSkin.rightLeg.visible = false;
        player.playerSkin.leftArm.visible = false;
        player.playerSkin.leftLeg.visible = false;
        player.playerSkin.head.visible = false;
        player.yaw.position.set(0, 10, 0);
        var myMat = new game.THREE.MeshLambertMaterial({
            color: 0x800830,
            ambient: 0x800830
        });
        hellcatMod.item.avatar.children[0].material = myMat;
        player.avatar.head.add(hellcatMod.item.avatar.children[0]);
        player.avatar.head.children[4].rotation.y = -1.56;
        player.avatar.head.children[4].rotation.z = 1.6;
        player.avatar.head.children[4].visible = false;
        player.avatar.head.children[4].position.y = 0;
        player.avatar.head.children[4].position.z = 90

        player.subjectTo([0, 0, 0]);
        hellcatMod.item.subjectTo([0, 0, 0]);
        player.avatar.name = "omegavader";
        //player.friction = new game.THREE.Vector3(1, 1, 10);
        //player.move([0,0,-0.000005]);


        // physicalObject is most likely going to be your [voxel-player](https://github.com/substack/voxel-player)
        // e.g.:

        player.possess();

        player.avatar.add(window.game.starTunnel.mesh);
        player.currentCamera = player.avatar.cameraInside.children[1];
        game.starTunnel.mesh.position.z = -90;
        game.starTunnel.mesh.position.y = 20;

        $('#loader').hide();
        $('#container').fadeIn("fast");
        /* $('#cockpit').css('bottom', '0px');
        $('#cockpit').fadeIn("fast");
        $('#phaser').remove();*/


        vv = require('voxel-vader');
        _vv = vv(game)(game);
        _vv.message = 'c1';
        _vv.position.y = 10;
        _vv.position.x = 0;
        _vv.position.z = -50;
        _liveBogeys.push(_vv);
        _vv2 = vv(game)(game);
        _vv2.message = 'c2';
        _vv2.position.y = 10;
        _vv2.position.x = 0;
        _vv2.position.z = -450;
        _liveBogeys.push(_vv2);

    }
    hellcat.src = 'images/hellcat2.png';

};


function onDocumentMouseMove(e) {
    e.preventDefault();
    mouse.x = (e.clientX / _width) * 2 - 1;
    mouse.y = -(e.clientY / _height) * 2 + 1;
}



startFracIntro = function() {
    player = null;
    $('#loader').hide();
    $('#container').fadeIn("fast");
    window.game.scene.fog.color = {
        r: 0,
        g: 0,
        b: 0
    };
    //game.view.renderer.setClearColor(0x000000, 1.0);
    uniforms = {
        time: {
            type: "f",
            value: 1.0
        },
        resolution: {
            type: "v2",
            value: new window.game.THREE.Vector2()
        }
    }

    uniformsTunnelFS = {
        time: {
            type: "f",
            value: 1.0
        },
        alpha: {
            type: 'f',
            value: 1
        },
        origin: {
            type: 'f',
            value: 2.0
        },
        resolution: {
            type: "v2",
            value: new window.game.THREE.Vector2()
        },
        mouse: {
            type: '2f',
            value: {
                x: 0.0,
                y: 0.0
            }
        },
        iChannel0: {
            type: 't',
            value: window.game.THREE.ImageUtils.loadTexture("images/tex512.png")
        }
    }
    uniformsTunnelFS.iChannel0.value.wrapS = uniformsTunnelFS.iChannel0.value.wrapT = window.game.THREE.RepeatWrapping;
    uniformsTunnelFS.resolution.value.x = _width;
    uniformsTunnelFS.resolution.value.y = _height;
    tunnelMat = new window.game.THREE.ShaderMaterial({
        uniforms: uniformsTunnelFS,
        vertexShader: tunnelFVVS,
        fragmentShader: tunnelFVFS

    });
    var mesh = new window.game.THREE.Mesh(new window.game.THREE.PlaneGeometry(2, 2), tunnelMat);
    mesh.name = "spacetunnel";
    window.game.scene.add(mesh);
    window.game.camera.position.z = 1;
    window.game.camera.useQuaternion = true;
    window.game.camera.far = 2000;
    game.on('tick', function(delta) {
        uniformsTunnelFS.time.value += 0.01;
        if (typeof _bullet != undefined) {
            var speed = delta * _bullet.speed;
            for (var i = _bullet.live.length - 1; i >= 0; i--) {
                try {
                    var b = _bullet.live[i].mesh;
                    var gcDist = b.position.distanceTo(game.camera.position);
                    if (game.camera.far < gcDist) {
                        _bullet.live.splice(b.id, 1);
                        b.Destroy();
                        game.scene.remove(b);
                    }
                    var p = b.position,
                        d = b.ray.direction;
                    b.translateX(speed * d.x);
                    b.translateY(speed * d.y);
                    b.translateZ(speed * d.z);
                } catch (e) {
                    break;
                }
            }
        }

    });
}