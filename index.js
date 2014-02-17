var createGame = require('voxel-engine');
var tic = createGame.tick;
voxelpp = require('voxel-pp');
var importShaders = require('./scripts/shaders.js');
var hasGenerated = false;
var hasGeneratedMod = false;

window.game = createGame({
    chunkDistance: 3,
    skyColor: 0x000000,
    chunkSize: 32,
    worldOrigin: [0, 0, 0],
    generateChunks: false,
    texturePath: 'textures/',
    controls: {
        discreteFire: false
    },
    materials: [
        ['glass2'], 'brick', 'dirt', 'obsidian'
    ]
});
var critterCreator = require('voxel-critter')(game);
clock = new game.THREE.Clock();
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
        } else {
            $('#cockpit').show();
            player.avatar.head.children[4].visible = false;
        }
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
    //exp
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
    window.game.starTunnel = new SPE.Group({
        texture: window.game.THREE.ImageUtils.loadTexture('images/spikey.png'),
        maxAge: 2
    });

    emitter = new SPE.Emitter({
        position: new window.game.THREE.Vector3(0, 5, -10),
        positionSpread: new window.game.THREE.Vector3(10, 10, 10),
        acceleration: new window.game.THREE.Vector3(0, 0, 10),
        velocity: new window.game.THREE.Vector3(0, 0, 10),
        colorStart: new window.game.THREE.Color('white'),
        colorEnd: new window.game.THREE.Color('red'),
        sizeStart: 2,
        sizeEnd: 2,
        opacityStart: 0,
        opacityMiddle: 1,
        opacityEnd: 0,
        particleCount: 10000
    });

    window.game.starTunnel.addEmitter(emitter);
    window.game.scene.add(window.game.starTunnel.mesh);
    window.game.scene.fog.color = {
        r: 0,
        g: 0,
        b: 0
    };
    game.view.renderer.setClearColor(0x000000, 1.0)

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
        //player.friction = new game.THREE.Vector3(1, 1, 10);
        //player.move([0,0,-0.000005]);
        player.possess();
        $('#loader').hide();
        $('#container').fadeIn("fast");
        $('#cockpit').css('bottom', '0px');
        $('#cockpit').fadeIn("fast");
        $('#phaser').remove();
        createCreaures();

    }
    hellcat.src = 'images/hellcat2.png';

};

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
        if (window.game.starTunnel != undefined && player != null) {
            emitter.position.z = (player.position.z - 10);
            emitter.position.y = (player.position.y + 5);
            emitter.position.x = player.position.x;
        }
        uniformsTunnelFS.time.value += 0.01;
    });
}