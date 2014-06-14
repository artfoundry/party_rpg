//submodules
//
//(function(){
//    var tiles = angular.module("tiles", []);
//})
//
//(function(){
//    var character = angular.module("character", []);
//})
//
//(function(){
//    var item = angular.module("item", []);
//})
//
//(function(){
//    var monster = angular.module("monster", []);
//})
//

var mapSizeX = 20;
var mapSizeY = 10;

angular.module("rogueCraft.movePlayer", []).value("player", {
    move: function($event) {
        var $currentTile = $(".tile-current");
        var tileDown = parseInt($currentTile.text(), 10) + mapSizeX;
        var tileUp = parseInt($currentTile.text(), 10) - mapSizeX;
        var tileLeft = parseInt($currentTile.text(), 10) - 1;
        var tileRight = parseInt($currentTile.text(), 10) + 1;
        var newTile = parseInt($($event.target).text());
        switch (newTile) {
            case tileDown:
                if (tileDown <= (mapSizeX * mapSizeY)) { this.changeTile($event); }
                break;
            case tileUp:
                if (tileUp >= 0) { this.changeTile($event); }
                break;
            case tileLeft:
                if (parseInt($currentTile.text()) % mapSizeX !== 1) { this.changeTile($event); }
                break;
            case tileRight:
                if (parseInt($currentTile.text()) % mapSizeX !== 0) { this.changeTile($event); }
                break;
            default: return;
        }
    },
    changeTile: function($event){
        $(".tile-current").removeClass("tile-current").addClass("tile-visited");
        $($event.target).attr("class", "tile tile-current");
    },
    start: function() {
        var startTile = Math.round(Math.random() * (mapSizeX * mapSizeY));
        $(function () {
            $(".tile:contains(' " + startTile + " ')").addClass("tile-current");
        });
        return startTile;
    }
});

angular.module("rogueCraft.mapData", []).value("map", {
    mapData: [],
    createGrid: function() {
        for (var i = 0; i < mapSizeY; i++) {
            this.mapData[i] = [];
            var lastNum = 0;
            for (var j = 0; j < mapSizeX; j++) {
                i === 0 ? lastNum = 0 : lastNum = this.mapData[i-1][mapSizeX-1]["tileNum"];
                this.mapData[i][j] = { tileNum: j + lastNum + 1 };
            }
        }
    },
    createMap: function(startTile) {
        var tiles = mapSizeX * mapSizeY;
        var count = 1;
        while (count <= tiles) {

            count += 1;
        }
    }
});

//app module
var rogueCraft = angular.module("rogue-craft", ["rogueCraft.mapData", "rogueCraft.movePlayer"]).run(function(map, player){
    map.createGrid();
    var startTile = player.start();
    map.createMap(startTile);
});

rogueCraft.controller("RogueController", function($scope, player, map){
    $scope.mapData = map.mapData;
    $scope.handleClick = function($event) { player.move($event) };
});
