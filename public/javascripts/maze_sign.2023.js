// register the directive with your app module
var app = angular.module('ddApp', ['ngTouch','ngAnimate', 'ui.bootstrap', 'pascalprecht.translate', 'ngCookies']);
var marker = {};
var socket;
let maxKit = {};

// function referenced by the drop target
app.controller('ddController', ['$scope', '$uibModal', '$log', '$timeout', '$http', '$translate', '$cookies', function ($scope, $uibModal, $log, $timeout, $http, $translate, $cookies) {
    var txt_cap_sign, txt_cref_sign, txt_ref_sign, txt_no_sign, txt_complete, txt_confirm;
    $translate('maze.sign.cap_sign').then(function (val) {
        txt_cap_sign = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('maze.sign.ref_sign').then(function (val) {
        txt_ref_sign = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('maze.sign.cref_sign').then(function (val) {
        txt_cref_sign = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('maze.sign.no_sign').then(function (val) {
        txt_no_sign = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('maze.sign.complete').then(function (val) {
        txt_complete = val;
    }, function (translationId) {
        // = translationId;
    });
    $translate('maze.sign.confirm').then(function (val) {
        txt_confirm = val;
    }, function (translationId) {
        // = translationId;
    });

    $scope.countWords = ["Bottom", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Ninth"];
    $scope.z = 0;

    $scope.MisIdent = 0;

    $scope.enableSign = [false,false,false];
    $scope.signData = [null,null,null];

    $scope.cells = {};
    $scope.tiles = {};

    //$cookies.remove('sRotate')
    if($cookies.get('sRotate')){
        $scope.sRotate = Number($cookies.get('sRotate'));
    }
    else $scope.sRotate = 0;

    if (typeof runId !== 'undefined') {
        $scope.runId = runId;
        loadNewRun();
    }

    (function launchSocketIo() {
        // launch socket.io
        socket = io(window.location.origin, {
            transports: ['websocket']
        });
        if (typeof runId !== 'undefined') {
            socket.emit('subscribe', 'runs/' + runId);
            socket.on('data', function (data) {
                console.log(data);
                $scope.exitBonus = data.exitBonus;
                $scope.score = data.score;
                $scope.LoPs = data.LoPs;
                $scope.foundVictims = data.foundVictims;
                $scope.distKits = data.distKits;
                $scope.MisIdent = data.misidentification;

                // Verified time by timekeeper
                $scope.minutes = data.time.minutes;
                $scope.seconds = data.time.seconds;

                // Scoring elements of the tiles
                for (var i = 0; i < data.tiles.length; i++) {
                    $scope.tiles[data.tiles[i].x + ',' +
                        data.tiles[i].y + ',' +
                        data.tiles[i].z] = data.tiles[i];
                }
                $scope.$apply();
                console.log("Updated view from socket.io");
            });
        }

    })();

    function loadNewRun() {
        $http.get("/api/runs/maze/" + runId +
            "?populate=true").then(function (response) {

            console.log(response.data);
            $scope.exitBonus = response.data.exitBonus;
            $scope.field = response.data.field.name;
            $scope.round = response.data.round.name;
            $scope.score = response.data.score;
            $scope.team = response.data.team.name;
            $scope.league = response.data.team.league;
            $scope.competition = response.data.competition.name;
            $scope.competition_id = response.data.competition._id;
            $scope.LoPs = response.data.LoPs;
            $scope.foundVictims = response.data.foundVictims;
            $scope.distKits = response.data.distKits;
            $scope.MisIdent = response.data.misidentification;

            // Verified time by timekeeper
            $scope.minutes = response.data.time.minutes;
            $scope.seconds = response.data.time.seconds;

            if(response.data.sign){
                $scope.cap_sig = response.data.sign.captain;
                $scope.ref_sig = response.data.sign.referee;
                $scope.refas_sig = response.data.sign.referee_as;
            }

            $scope.comment = response.data.comment;

            // Scoring elements of the tiles
            for (let i = 0; i < response.data.tiles.length; i++) {
                $scope.tiles[response.data.tiles[i].x + ',' +
                    response.data.tiles[i].y + ',' +
                    response.data.tiles[i].z] = response.data.tiles[i];
            }

            // Get the map
            $http.get("/api/maps/maze/" + response.data.map +
                "?populate=true").then(function (response) {
                console.log(response.data);
                $scope.startTile = response.data.startTile;
                $scope.height = response.data.height;

                $scope.width = response.data.width;
                $scope.length = response.data.length;

                $scope.leagueType = response.data.leagueType;
                if ($scope.leagueType == "entry") {
                    maxKit={
                        'Red': 1,
                        'Green': 1
                    }
                } else {
                    maxKit={
                        'Heated': 1,
                        'H': 3,
                        'S': 2,
                        'U': 0,
                        'Red': 1,
                        'Yellow': 1,
                        'Green': 0
                    }
                }

                for (let i = 0; i < response.data.cells.length; i++) {
                    $scope.cells[response.data.cells[i].x + ',' +
                        response.data.cells[i].y + ',' +
                        response.data.cells[i].z] = response.data.cells[i];
                }
                width = response.data.width;
                length = response.data.length;
                $timeout($scope.tile_size, 0);

            }, function (response) {
                console.log("Error: " + response.statusText);
            });

        }, function (response) {
            console.log("Error: " + response.statusText);
            if (response.status == 401) {
                $scope.go('/home/access_denied');
            }
        });
    }

    $scope.reliability = function(){
        if ($scope.leagueType == "entry") {
            return Math.max(($scope.foundVictims * 10) - ($scope.LoPs * 5),0);
        } else {
            return Math.max(($scope.foundVictims + $scope.distKits - $scope.LoPs)*10,0);
        }
    }

    $scope.reliabilityLoPs = function(){
        if ($scope.leagueType == "entry") {
            return Math.min($scope.foundVictims * 10, $scope.LoPs * 5);
        } else {
            return Math.min(($scope.foundVictims + $scope.distKits)*10, $scope.LoPs*10);
        }
    }

    $scope.changeFloor = function (z){
        playSound(sClick);
        $scope.z = z;
        $timeout($scope.tile_size, 100);
    }

    $scope.tileRot = function (r){
        playSound(sClick);
        $scope.sRotate += r;
        if($scope.sRotate >= 360)$scope.sRotate -= 360;
        else if($scope.sRotate < 0) $scope.sRotate+= 360;
        $timeout($scope.tile_size, 0);

        $cookies.put('sRotate', $scope.sRotate, {
          path: '/'
        });
    }


    $scope.range = function (n) {
        arr = [];
        for (let i = 0; i < n; i++) {
            arr.push(i);
        }
        return arr;
    }


    $scope.isUndefined = function (thing) {
        return (typeof thing === "undefined");
    }


    $scope.tileStatus = function (x, y, z, isTile) {
        // If this is a non-existent tile
        var cell = $scope.cells[x + ',' + y + ',' + z];
        if (!cell)
            return;
        if (!isTile)
            return;

        if (!$scope.tiles[x + ',' + y + ',' + z]) {
            $scope.tiles[x + ',' + y + ',' + z] = {
                scoredItems: {
                    speedbump: false,
                    checkpoint: false,
                    ramp: false,
                    steps:  false,
                    victims: {
                        top: false,
                        right: false,
                        left: false,
                        bottom: false,
                        floor: false
                    },
                    rescueKits: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        floor: 0
                    }
                }
            };
        }
        var tile = $scope.tiles[x + ',' + y + ',' + z];

        // Current "score" for this tile
        var current = 0;
        // Max "score" for this tile. Score is added 1 for every passed mission
        var possible = 0;


        if (cell.tile.speedbump) {
            possible++;
            if (tile.scoredItems.speedbump) {
                current++;
            }
        }
        if (cell.tile.checkpoint) {
            possible++;
            if (tile.scoredItems.checkpoint) {
                current++;
            }
        }
        if (cell.tile.ramp) {
            possible+=1;
            if (tile.scoredItems.ramp) {
                current++;
            }
        }
        if (cell.tile.steps) {
            possible++;
            if (tile.scoredItems.steps) {
                current++;
            }
        }

        if(cell.tile.victims.top != "None"){
            possible++;
            current += tile.scoredItems.victims.top;
            possible += maxKit[cell.tile.victims.top];
            current += Math.min(tile.scoredItems.rescueKits.top,maxKit[cell.tile.victims.top]);
        }
        if(cell.tile.victims.left != "None"){
            possible++;
            current += tile.scoredItems.victims.left;
            possible += maxKit[cell.tile.victims.left];
            current += Math.min(tile.scoredItems.rescueKits.left,maxKit[cell.tile.victims.left]);
        }
        if(cell.tile.victims.right != "None"){
            possible++;
            current += tile.scoredItems.victims.right;
            possible += maxKit[cell.tile.victims.right];
            current += Math.min(tile.scoredItems.rescueKits.right,maxKit[cell.tile.victims.right]);
        }
        if(cell.tile.victims.bottom != "None"){
            possible++;
            current += tile.scoredItems.victims.bottom;
            possible += maxKit[cell.tile.victims.bottom];
            current += Math.min(tile.scoredItems.rescueKits.bottom,maxKit[cell.tile.victims.bottom]);
        }
        if(cell.tile.victims.floor != "None"){
            possible++;
            current += tile.scoredItems.victims.floor;
            possible += maxKit[cell.tile.victims.floor];
            current += Math.min(tile.scoredItems.rescueKits.floor,maxKit[cell.tile.victims.floor]);
        }

        if (tile.processing)
            return "processing";
        else if (current > 0 && current == possible)
            return "done";
        else if (current > 0)
            return "halfdone";
        else if (possible > 0)
            return "undone";
        else
            return "";
    }


    $scope.cellClick = function (x, y, z, isWall, isTile) {
        var cell = $scope.cells[x + ',' + y + ',' + z];
        if (!cell)
            return;
        if (!isTile)
            return;
        playSound(sClick);

        var tile = $scope.tiles[x + ',' + y + ',' + z];

        var hasVictims = (cell.tile.victims.top != "None") ||
          (cell.tile.victims.right != "None") ||
          (cell.tile.victims.bottom != "None") ||
          (cell.tile.victims.left != "None") ||
          (cell.tile.victims.floor != "None");
        // Total number of scorable things on this tile
        var total = !!cell.tile.speedbump + !!cell.tile.checkpoint + !!cell.tile.steps + cell.tile.ramp + hasVictims;

        if (total > 1 || hasVictims) {
            // Open modal for multi-select
            $scope.open(x, y, z);
        }

    };

    $scope.tilePoint = function (x, y, z, isTile) {
        // If this is a non-existent tile
        var cell = $scope.cells[x + ',' + y + ',' + z];
        var victimPoint = cell.isLinear ? 10:30;

        if (!cell)
            return;
        if (!isTile)
            return;

        if (!$scope.tiles[x + ',' + y + ',' + z]) {
            $scope.tiles[x + ',' + y + ',' + z] = {
                scoredItems: {
                    speedbump: false,
                    checkpoint: false,
                    ramp: false,
                    victims: {
                        top: false,
                        right: false,
                        left: false,
                        bottom: false,
                        floor: false
                    },
                    rescueKits: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        floor: 0
                    }
                }
            };
        }
        var tile = $scope.tiles[x + ',' + y + ',' + z];

        // Current "score" for this tile
        var current = 0;


        if (cell.tile.speedbump) {
            if (tile.scoredItems.speedbump) {
                current+=5;
            }
        }
        if (cell.tile.checkpoint) {
            if (tile.scoredItems.checkpoint) {
                current+=10;
            }
        }
        if (cell.tile.ramp) {
            if (tile.scoredItems.ramp) {
                current+=10;
            }
        }
        if (cell.tile.steps) {
            if (tile.scoredItems.steps) {
                current+=5;
            }
        }
        switch (cell.tile.victims.top) {
            case 'H':
                current += victimPoint * tile.scoredItems.victims.top;
                current += 10*Math.min(tile.scoredItems.rescueKits.top , 3);
                break;
            case 'S':
                current += victimPoint * tile.scoredItems.victims.top;
                current += 10*Math.min(tile.scoredItems.rescueKits.top , 2);
                break;
            case 'Heated':
                current += victimPoint * tile.scoredItems.victims.top;
                current += 10*Math.min(tile.scoredItems.rescueKits.top , 1);
                break;
            case 'Red':
            case 'Yellow':
                current += (victimPoint * tile.scoredItems.victims.top / 2);
                current += 10*Math.min(tile.scoredItems.rescueKits.top , 1);
                break;
            case 'U':
            case 'Green':
                current += victimPoint * tile.scoredItems.victims.top / 2;
                break;
        }
        switch (cell.tile.victims.right) {
            case 'H':
                current += victimPoint * tile.scoredItems.victims.right;
                current += 10*Math.min(tile.scoredItems.rescueKits.right , 3);
                break;
            case 'S':
                current += victimPoint * tile.scoredItems.victims.right;
                current += 10*Math.min(tile.scoredItems.rescueKits.right , 2);
                break;
            case 'Heated':
                current += victimPoint * tile.scoredItems.victims.right;
                current += 10*Math.min(tile.scoredItems.rescueKits.right , 1);
                break;
            case 'Red':
            case 'Yellow':
                current += (victimPoint * tile.scoredItems.victims.right / 2);
                current += 10*Math.min(tile.scoredItems.rescueKits.right , 1);
                break;
            case 'U':
            case 'Green':
                current += victimPoint * tile.scoredItems.victims.right / 2;
                break;
        }
        switch (cell.tile.victims.bottom) {
            case 'H':
                current += victimPoint * tile.scoredItems.victims.bottom;
                current += 10*Math.min(tile.scoredItems.rescueKits.bottom , 3);
                break;
            case 'S':
                current += victimPoint * tile.scoredItems.victims.bottom;
                current += 10*Math.min(tile.scoredItems.rescueKits.bottom , 2);
                break;
            case 'Heated':
                current += victimPoint * tile.scoredItems.victims.bottom;
                current += 10*Math.min(tile.scoredItems.rescueKits.bottom , 1);
                break;
            case 'Red':
            case 'Yellow':
                current += (victimPoint * tile.scoredItems.victims.bottom / 2);
                current += 10*Math.min(tile.scoredItems.rescueKits.bottom , 1);
                break;
            case 'U':
            case 'Green':
                current += victimPoint * tile.scoredItems.victims.bottom / 2;
                break;
        }
        switch (cell.tile.victims.left) {
            case 'H':
                current += victimPoint * tile.scoredItems.victims.left;
                current += 10*Math.min(tile.scoredItems.rescueKits.left , 3);
                break;
            case 'S':
                current += victimPoint * tile.scoredItems.victims.left;
                current += 10*Math.min(tile.scoredItems.rescueKits.left , 2);
                break;
            case 'Heated':
                current += victimPoint * tile.scoredItems.victims.left;
                current += 10*Math.min(tile.scoredItems.rescueKits.left , 1);
                break;
            case 'Red':
            case 'Yellow':
                current += (victimPoint * tile.scoredItems.victims.left / 2);
                current += 10*Math.min(tile.scoredItems.rescueKits.left , 1);
                break;
            case 'U':
            case 'Green':
                current += victimPoint * tile.scoredItems.victims.left / 2;
                break;
        }
        switch (cell.tile.victims.floor) {
            case 'Red':
            case 'Green':
                current += (cell.isLinear ? 15:30) * tile.scoredItems.victims.floor;
                current += 10 * Math.min(tile.scoredItems.rescueKits.floor , 1);
                break;
        }

        return current;
    };


    $scope.open = function (x, y, z) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: '/templates/maze_view_modal.html',
            controller: 'ModalInstanceCtrl',
            size: 'lm',
            resolve: {
                cell: function () {
                    return $scope.cells[x + ',' + y + ',' + z];
                },
                tile: function () {
                    return $scope.tiles[x + ',' + y + ',' + z];
                },
                sRotate: function (){
                    return $scope.sRotate;
                },
                leagueType: function () {
                    return $scope.leagueType;
                }
            }
        }).closed.then(function (result) {
            console.log("Closed modal");
        });
    };

    $scope.getParam = function (key) {
        var str = location.search.split("?");
        if (str.length < 2) {
          return "";
        }

        var params = str[1].split("&");
        for (var i = 0; i < params.length; i++) {
          var keyVal = params[i].split("=");
          if (keyVal[0] == key && keyVal.length == 2) {
            return decodeURIComponent(keyVal[1]);
          }
        }
        return "";
    }

    $scope.go = function (path) {
        playSound(sClick);
        socket.emit('unsubscribe', 'runs/' + runId);
        socket.emit('subscribe', 'runs/map/' + runId);
        window.location = path
    }


    $scope.success_message = function () {
        playSound(sInfo);
        swal({
            title: 'Recorded!',
            text: txt_complete,
            type: 'success'
        }).then((result) => {
            if (result.value) {
                if($scope.getParam('return')) $scope.go($scope.getParam('return'));
                else $scope.go("/maze/" + $scope.competition_id);
            }
        })
        console.log("Success!!");
    }

    $scope.toggleSign = function(index){
        $scope.enableSign[index] = !$scope.enableSign[index];
        if(!$scope.enableSign[index]){
            let datapair;
            switch (index) {
                case 0:
                    datapair = $("#cap_sig").jSignature("getData", "svgbase64");
                    break;
                case 1:
                    datapair = $("#ref_sig").jSignature("getData", "svgbase64");
                    break;
                case 2:
                    datapair = $("#refas_sig").jSignature("getData", "svgbase64")
                    break;
            }
            $scope.signData[index] = "data:" + datapair[0] + "," + datapair[1];
        }else{
            if(!$scope.signData[index]) setTimeout(initSign,100,index);
        }
    }

    function initSign(index){
        switch (index) {
            case 0:
                $("#cap_sig").jSignature();
                break;
            case 1:
                $("#ref_sig").jSignature();
                break;
            case 2:
                $("#refas_sig").jSignature();
                break;
        }
    }

    $scope.clearSign = function(index){
        switch (index) {
            case 0:
                $("#cap_sig").jSignature("clear");
                break;
            case 1:
                $("#ref_sig").jSignature("clear");
                break;
            case 2:
                $("#refas_sig").jSignature("clear");
                break;
        }
        $scope.toggleSign(index);
    }

    $scope.send_sign = function () {
        playSound(sClick);
        var sign_empty = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMCIgaGVpZ2h0PSIwIj48L3N2Zz4="
        var run = {}
        run.comment = $scope.comment;
        run.sign = {}
        var err_mes = ""
        if (!$scope.signData[0]) {
            err_mes += "[" + txt_cap_sign + "] "
        } else {
            run.sign.captain = $scope.signData[0]
        }

        if (!$scope.signData[1]) {
            err_mes += "[" + txt_ref_sign + "] "
        } else {
            run.sign.referee = $scope.signData[1]
        }

        if (!$scope.signData[2]) {
            err_mes += "[" + txt_cref_sign + "] "
        } else {
            run.sign.referee_as = $scope.signData[2]
        }


        if (err_mes != "") {
            playSound(sError);
            swal("Oops!", err_mes + txt_no_sign, "error");
            return;
        }
        playSound(sInfo);

        swal({
            title: "Finish Run?",
            text: txt_confirm,
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, finish it!",
            confirmButtonColor: "#ec6c62"
        }).then((result) => {
            if (result.value) {
                console.log("STATUS UPDATED(4)")
                run.status = 4;
                $http.put("/api/runs/maze/" + runId, run).then(function (response) {
                    setTimeout($scope.success_message, 500);
                }, function (response) {
                    playSound(sError);
                    swal("Oops", "We couldn't connect to the server! Please notice to system manager.", "error");
                    console.log("Error: " + response.statusText);
                });
            }

        })


    }

    $scope.wallColor = function(x,y,z,rotate=0){
        let cell = $scope.cells[x+','+y+','+z];
        if(!cell) return {};
        if(cell.isWall) return cell.isLinear?{'background-color': 'black'}:{'background-color': 'navy'};

        if(cell.halfWall > 0){
            let direction = 180*(cell.halfWall-1)+(y%2==1?0:90);

            //Wall color
            let color = 'navy';
            switch (direction) {
                case 0:
                    if(wallCheck($scope.cells[(x-1)+','+(y+1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x+1)+','+(y+1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x)+','+(y+2)+','+z])) color = 'black';
                    break;
                case 90:
                    if(wallCheck($scope.cells[(x-1)+','+(y+1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x-1)+','+(y-1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x-2)+','+(y)+','+z])) color = 'black';
                    break;
                case 180:
                    if(wallCheck($scope.cells[(x-1)+','+(y-1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x+1)+','+(y-1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x)+','+(y-2)+','+z])) color = 'black';
                    break;
                case 270:
                    if(wallCheck($scope.cells[(x+1)+','+(y+1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x+1)+','+(y-1)+','+z])) color = 'black';
                    if(wallCheck($scope.cells[(x+2)+','+(y)+','+z])) color = 'black';
                    break;
            }

            direction += rotate;
            if(direction>=360) direction-=360;

            let gradient = String(direction) + "deg," + color + " 0%," + color + " 50%,white 50%,white 100%";
            return {'background': 'linear-gradient(' + gradient + ')'};

        }

    };

    function wallCheck(cell){
        if(!cell) return false;
        return cell.isWall && cell.isLinear;
    }

    $scope.tile_size = function () {
        try {
            var b = $('.tilearea');

            if($scope.sRotate%180 == 0){
                var tilesize_w = (b.width()-2*(width+1)) / (width+1 + (width+1)/12);
                console.log(tilesize_w);
                var tilesize_h = (window.innerHeight - 130) /(length + length/12*(length+1));
            }else{
                var tilesize_w = (b.width() - (20 + 11 * (length + 1))) / length;
                var tilesize_h = (window.innerHeight - (130 + 11 * (width + 1))) /width;
            }


            if (tilesize_h > tilesize_w) var tilesize = tilesize_w;
            else var tilesize = tilesize_h;

            $('.tile-image-container').css('height', tilesize);
            $('.tile-image-container').css('width', tilesize);
            $('.tile-image').css('height', tilesize);
            $('.tile-image').css('width', tilesize);
            $('.tile').css('height', tilesize);
            $('.tile').css('width', tilesize);
            $('.tile-font').css('font-size', tilesize - 10);
            $('.cell').css('padding', tilesize/12);
            $('.tile-point').css('font-size', tilesize/2 + "px");
            $('.tile-point').css('line-height', tilesize + "px");
            if (b.height() == 0) $timeout($scope.tile_size, 500);

            if($scope.sRotate%180 == 0){
                $('#wrapTile').css('width', (tilesize+10)*width+11);
            }else{
                $('#wrapTile').css('width', (tilesize+10)*length+11);
            }
        } catch (e) {
            $timeout($scope.tile_size, 500);
        }
}


var currentWidth = -1;


$(window).on('load resize', function () {
    if (currentWidth == window.innerWidth) {
        return;
    }
    currentWidth = window.innerWidth;
    $scope.tile_size();
    $timeout($scope.tile_size, 500);
    $timeout($scope.tile_size, 3000);

});

    }]);


app.controller('ModalInstanceCtrl', ['$scope','$uibModalInstance','cell','tile','sRotate','leagueType',function ($scope, $uibModalInstance, cell, tile, sRotate, leagueType) {
    $scope.cell = cell;
    $scope.tile = tile;
    $scope.leagueType = leagueType;
    $scope.hasVictims = (cell.tile.victims.top != "None") ||
        (cell.tile.victims.right != "None") ||
        (cell.tile.victims.bottom != "None") ||
        (cell.tile.victims.left != "None") ||
        (cell.tile.victims.floor != "None");

    $scope.lightStatus = function(light, kit){
        if(light) return true;
        return false;
    };

    $scope.kitStatus = function(light, kit, type){
        return (maxKit[type] <= kit);
    };

    $scope.modalRotate = function(dir){
        var ro;
        switch(dir){
            case 'top':
                ro = 0;
                break;
            case 'right':
                ro = 90;
                break;
            case 'left':
                ro = 270;
                break;
            case 'bottom':
                ro = 180;
                break;
        }
        ro += sRotate;
        if(ro >= 360)ro -= 360;
        switch(ro){
            case 0:
                return 'top';
            case 90:
                return 'right';
            case 180:
                return 'bottom';
            case 270:
                return 'left';
        }
    }

    $scope.ok = function () {
        playSound(sClick);
        $uibModalInstance.close();
    };
}]);




$(window).on('beforeunload', function () {
    socket.emit('unsubscribe', 'runs/' + runId);
    socket.emit('subscribe', 'runs/map/' + runId);
});


let lastTouch = 0;
document.addEventListener('touchend', event => {
    const now = window.performance.now();
    if (now - lastTouch <= 500) {
        event.preventDefault();
    }
    lastTouch = now;
}, true);

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var getAudioBuffer = function(url, fn) {
  var req = new XMLHttpRequest();
  req.responseType = 'arraybuffer';

  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      if (req.status === 0 || req.status === 200) {
        context.decodeAudioData(req.response, function(buffer) {
          fn(buffer);
        });
      }
    }
  };

  req.open('GET', url, true);
  req.send('');
};

var playSound = function(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
};

var sClick,sInfo,sError;
window.onload = function() {
  getAudioBuffer('/sounds/click.mp3', function(buffer) {
      sClick = buffer;
  });
  getAudioBuffer('/sounds/info.mp3', function(buffer) {
      sInfo = buffer;
  });
  getAudioBuffer('/sounds/error.mp3', function(buffer) {
      sError = buffer;
  });
};
