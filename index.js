var createGame = require('voxel-engine'),
    tic = createGame.tick,
    voxelpp = require('voxel-pp'),
    importShaders = require('./scripts/shaders.js'),
    hasGenerated = false,
    hasGeneratedMod = false,
    cockpitView = true,
    bulletmovespeed = 0.05 * 5;

window.game = createGame({
    chunkDistance: 3,
    skyColor: 0x000000,
    chunkSize: 32,
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
    ]
});
var critterCreator = require('voxel-critter')(game);
var clock = new game.THREE.Clock();
window.game.view.renderer.autoClear = true;
game.tic = tic;
game.scene.fog.far = 90000;
game.gravity = [0, 0, 0];
game.paused = false
game.appendTo('#container');
window.addEventListener('keydown', function(ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) {
        player.toggle();
        var d = $('#cockpit').css('display');
        if (d == 'block') {
            $('#cockpit').hide();
            player.avatar.head.children[4].visible = true;
            cockpitView = false;
        } else {
            $('#cockpit').show();
            player.avatar.head.children[4].visible = false;
            cockpitView = true;
        }
    }
    if (ev.keyCode == 32) {
        ev.preventDefault();
        createBullet();
    }
});

function createInvader(game) {
    var sz = 5;
    var step = sz / 5;
    var padding = parseInt(sz / 2);
    var mx, my;
    var T = game.THREE;
    var body = new T.Object3D;
    var bg = new T.Object3D();
    var createVader = function(clr, amb) {
        mats = [
            new T.MeshLambertMaterial({
                color: clr,
                ambient: amb
            }),
        ];
        var vaders = new T.Mesh(
            new T.CubeGeometry(1, 1, 1),
            //new T.MeshFaceMaterial(mats)
            new T.MeshLambertMaterial({
                color: clr,
                ambient: amb
            })
        );
        return vaders;
    }

    col = [];
    for (var j = 0; j < sz; j += step) {
        var m = 1;
        col[j] = [];
        for (var i = 0; i < sz / 2; i += step) {
            c = (Math.random(1) > .5) ? false : true;
            col[j][i] = c;
            col[j][i + (sz - step) / m] = c;
            m++;
        }
    }
    for (var j = 0; j < sz; j += step) {
        for (var i = 0; i < sz; i += step) {
            var vaders = createVader(0x91e842, 0xffffff);
            var vader2 = createVader(0x91e842, 0xffffff);
            var vadersBG = createVader(0x800830, 0x800830);
            vadersBG.position.set(i, j, 4);
            vadersBG.visible = col[j][i];
            vaders.position.set(i, j, 5);
            vaders.visible = col[j][i];
            vader2.position.set(i, j, 6);
            vader2.visible = col[j][i];
            vadersBG.vaderT = "bg";
            vaders.vaderT = "front";
            vader2.vaderT = "front";
            bg.add(vadersBG);
            body.add(bg);
            body.add(vaders);
            body.add(vader2);
        }
    }

    return body;
};

function createCreaures() {
    createCreature = require('voxel-creature')(game);
    cr = createInvader(game);
    /// merging geometry
    var visibileArrBG = new Array();
    var visibileArr = new Array();
    var meshInvaderVisibile = function(obj) {
        for (var i = 0; obj.children.length > i; i++) {
            if (obj.children[i].children.length == 0 && obj.children[i].visible == true && obj.children[i].vaderT == "bg") {
                visibileArrBG.push(obj.children[i]);
            } else if (obj.children[i].visible == true && obj.children[i].vaderT == "front") {
                visibileArr.push(obj.children[i]);
            } else {
                meshInvaderVisibile(obj.children[i])
            }
        }
    }
    meshInvaderVisibile(cr);
    mergedGeo = new game.THREE.Geometry();
    mergedGeoBG = new game.THREE.Geometry();
    for (var i = 0; visibileArr.length > i; i++) {
        if (i != 0) {
            window.game.THREE.GeometryUtils.merge(mergedGeo, visibileArr[i]);
        }
    }
    for (var i = 0; visibileArrBG.length > i; i++) {
        if (i != 0) {
            window.game.THREE.GeometryUtils.merge(mergedGeoBG, visibileArrBG[i]);
        }
    }
    groupBG = new game.THREE.Mesh(mergedGeoBG, new game.THREE.MeshLambertMaterial({
        color: 0xffffff,
        ambient: 0xffffff
    }));
    groupM = new game.THREE.Mesh(mergedGeo, new game.THREE.MeshLambertMaterial({
        color: 0x800830,
        ambient: 0x800830
    }));
    var removeNonMerged = function(obj) {
        for (var i = 0; obj.children.length > i; i++) {
            if (obj.children != undefined && obj.children[i].children.length == 0 && obj.children[i].visible == true) {
                obj.children[i].visible = false;
                obj.children[i].vaderT = "hidden";
                removeNonMerged(cr);
            } else if (obj.children != undefined) {
                removeNonMerged(obj.children[i]);
            }
        }
    }
    removeNonMerged(cr);
    cr.add(groupM);
    cr.add(groupBG);
    creature = createCreature(cr);
    window.creature = creature;
    creature.position.y = 10;
    creature.position.x = 0;
    creature.position.z = -30;

    creature.on('notice', function(player) {
        creature.lookAt(player);
        creature.move(((player.position.x - creature.position.x) * 0.1), ((player.position.y - creature.position.y) * 0.1), ((player.position.z - creature.position.z) * 0.001));
    });
    creature.notice(player, {
        radius: 500
    });
    setInterval(function() {
        if (creature.noticed) return;
        //creature.rotation.y += Math.random() * Math.PI / 2 - Math.PI / 4;
        //creature.move(0, 0, 0.5 * Math.random());
    }, 1000);
}

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
    //customUniforms.resolution.value.x = window.innerWidth;
    //customUniforms.resolution.value.y = window.innerHeight;
    postprocessor.composer.setSize(window.innerWidth, window.innerHeight);
    window.game.camera.aspect = window.innerWidth / window.innerHeight;
    window.game.camera.updateProjectionMatrix();
    postprocessor.composer.reset();
}
window.addEventListener('resize', onWindowResize, false);

startFracVaders = function() {
    $('#logo').hide();
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
        player.yaw.position.set(0, 2, 0);
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
        player.possess();
        player.avatar.add(window.game.starTunnel.mesh);
        window.game.starTunnel.mesh.position.z = -90;
        window.game.starTunnel.mesh.position.y = 20;

        $('#loader').hide();
        $('#container').fadeIn("fast");
        $('#cockpit').css('bottom', '0px');
        $('#cockpit').fadeIn("fast");
        $('#phaser').remove();
        createCreaures();

    }
    hellcat.src = 'images/hellcat2.png';

};

//// shooting logic 
var bullets = [];
var sphereMaterial = new window.game.THREE.MeshBasicMaterial({
    color: 0xffffff
});
var sphereGeo = new window.game.THREE.SphereGeometry(2, 6, 6);

function getShootDir(targetVec) {
    var vector = targetVec;
    targetVec.set(0, 0, 1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Ray(sphereBody.position, vector.subSelf(sphereBody.position).normalize());
    targetVec.x = ray.direction.x;
    targetVec.y = ray.direction.y;
    targetVec.z = ray.direction.z;
}

createBullet = function(obj) {
    pro = new window.game.THREE.Projector();
    if (obj === undefined) {
        obj = window.game.camera;
    }
    var bullet = new window.game.THREE.Mesh(sphereGeo, sphereMaterial);
    var bullet2 = new window.game.THREE.Mesh(sphereGeo, sphereMaterial);
    if (obj instanceof window.game.THREE.Camera) {
        var vector = player.position;
        defaultPos = new window.game.THREE.Vector3(0, 2, 0);
        bullet.position.set(vector.x + 14, vector.y * 0.8, vector.z);
        bullet2.position.set(vector.x - 14, vector.y * 0.8, vector.z);
        if (player.position.x == defaultPos.x && player.position.z == defaultPos.z) {
            vector = new window.game.THREE.Vector3(player.position.x, player.position.y, 1);
            pro.unprojectVector(vector, obj);
            ray = bullet.ray = bullet2.ray = new window.game.THREE.Ray(player.position, vector.sub(player.position).normalize());
        } else {
            pro.unprojectVector(vector, obj);
            ray = bullet.ray = bullet2.ray = new window.game.THREE.Ray(player.position, vector.sub(player.position).normalize());
        }
    } else {
        // enemey logic

    };
    bullet.owner = obj;
    bullets.push(bullet, bullet2);
    window.game.scene.add(bullet);
    window.game.scene.add(bullet2);
    return [bullet, bullet2]
}

startFracIntro = function() {
    player = null;
    $('#loader').hide();

    $('#container').fadeIn("fast", function() {
        var l = (($('body').width() / 2) - ($('#logo').width() / 2));
        var t = (($('body').height() / 2) + ($('#logo').height() / 2));
        $('#logo').css({
            'left': l + 'px',
            'top': t + 'px'
        });
        $('#logo').fadeIn('fast');
    });
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
    uniformsTunnelFS.resolution.value.x = $('#container').width();
    uniformsTunnelFS.resolution.value.y = $('#container').height();
    tunnelMat = new window.game.THREE.ShaderMaterial({
        uniforms: uniformsTunnelFS,
        vertexShader: tunnelFVVS,
        fragmentShader: tunnelFVFS

    });
    var mesh = new window.game.THREE.Mesh(new window.game.THREE.PlaneGeometry(2, 2), tunnelMat);
    mesh.name = "spacetunnel";
    window.game.scene.add(mesh);
    window.game.camera.position.z = 1;
    game.on('tick', function(delta) {
        uniformsTunnelFS.time.value += 0.01;
        speed = delta * bulletmovespeed;
        for (var i = bullets.length - 1; i >= 0; i--) {
            var b = bullets[i],
                p = b.position,
                d = b.ray.direction;
            var hit = false;
            if (!hit) {
                b.translateX(speed * d.x);
                //bullets[i].translateY(speed * bullets[i].direction.y);
                b.translateZ(speed * d.z);
            }
        }
    });
}