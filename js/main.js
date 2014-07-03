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

var mapSizeCols = 20;
var mapSizeRows = 10;
var numOfTiles = mapSizeCols * mapSizeRows;
var edgeTypes = ["wall", "door", "blank"];

// PLAYER module

angular.module("rogueCraft.movePlayer", []).value("player", {
    move: function($event, $scope.mapData) {
//        var $currentTile = $(".tile-current");
        var tileDown = $scope.mapData["tileNum"] + mapSizeCols;
        var tileUp = $scope.mapData["tileNum"] - mapSizeCols;
        var tileLeft = $scope.mapData["tileNum"] - 1;
        var tileRight = $scope.mapData["tileNum"] + 1;
        var newTile = parseInt($($event.target).text());
        switch (newTile) {
            case tileDown:
                if (tileDown <= (mapSizeCols * mapSizeRows)) { this.changeTile($event); }
                break;
            case tileUp:
                if (tileUp >= 0) { this.changeTile($event); }
                break;
            case tileLeft:
                if ($scope.mapData["tileNum"] % mapSizeCols !== 1) { this.changeTile($event); }
                break;
            case tileRight:
                if ($scope.mapData["tileNum"] % mapSizeCols !== 0) { this.changeTile($event); }
                break;
            default: return;
        }
    },
    changeTile: function($event){
        $(".tile-current").removeClass("tile-current").addClass("tile-visited");
        $($event.target).attr("class", "tile tile-current");
    },
});

// MAP module

angular.module("rogueCraft.mapData", []).value("map", {
    totalDungeonLevels: 20,
    dungeonData: new Array(totalDungeonLevels),
    mapData: [],
//    pathData: ["wall", "wall", "wall", "wall"],
    createGrid: function() {
        for (var i = 0; i < mapSizeRows; i++) {
            this.mapData[i] = [];
            var lastNum = 0;
            for (var j = 0; j < mapSizeCols; j++) {
                i === 0 ? lastNum = 0 : lastNum = this.mapData[i-1][mapSizeCols-1]["tileNum"];
                this.mapData[i][j] = { tileNum: j + lastNum + 1 };
            }
        }
    },
    createMap: function(startTile) {
        var count = 1;
        var adjTileData = {};
        var adjTileEdge = 0;
        var currentTile = startTile;    // array of two numbers indicating col and row for tile location - not sure it's needed - only being used to pass to getNextUnfinishedTile
        var currentTileData = this.mapData[startTile[0]][startTile[1]]; // tile object (hash) containing edge info, etc.
        var edge;
        var currentTileEdges = currentTileData["edges"];
        this.mapData["path"] = [];  // dynamic array of objects which are pushed to array starting with start tile, each object containing array(4) and pointer to tile hash in mapData
        this.mapData["path"].push(currentTileData);

        while (count <= numOfTiles) {
            currentTileData["edges"] = new Array(4); // indices go clockwise from top just like css box model; options are "wall", "door", "blank"
            var nextTileObject = {};
            for (edge = 0; edge < 4; edge++) {
                // if tile is in top row and edge is at top OR if tile is in bottom row and edge is at bottom OR if tile is on left column and edge is on left OR if tile is on right column and edge is on right
                if (((currentTileData["tileNum"] < mapSizeCols) && (edge === 0)) || ((currentTileData["tileNum"] > numOfTiles - mapSizeCols) && (edge === 2)) || ((currentTileData["tileNum"] % mapSizeCols === 1) && (edge === 3)) || ((currentTileData["tileNum"] % mapSizeCols === 0) && (edge === 1))) {
                    currentTileEdges[edge] = {edgeType: edgeTypes[0]}; // then set edge to be a wall
                } else if (currentTileEdges[edge] === undefined) {
                    adjTileData = this.getNextTileData(currentTile, edge);
                    adjTileEdge = this.getNextTileEdge(adjTileData, edge);
                    currentTileEdges[edge] = {edgeType: adjTileEdge, adjTile: adjTileData};
                    if (adjTileEdge !== "wall") {
                        this.addTileToTree(adjTileData, currentTileEdges, edge);
                    };
                    if (nextTileObject === {}) {
                        nextTileObject = this.setPathNextTile(adjTileData);
                    };
                };
            // need to deal with what happens when we reach a dead end
            }
            currentTileData = nextTileObject["tileData"];
            currentTile = nextTileObject["tileLoc"];    // unnecessary?
            count += 1;
        }
        this.dungeonData.push(this.mapData);
    },
    // this method needs to track every tile visited so it can return to previous tile once hitting a dead end
//    getNextUnfinishedTile: function(currentTileData, currentTile) {
//        var edge = 0;
//        var wallCount = 0;
//        mapData["tilesArray"].push(currentTile);
//    // need to be able to know which edge is matching with the previous adjacent tile so we don't set that tile as the next one (exception is the start tile the first time)
//
//        while (mapData["tilesArray"].length < numOfTiles) {
//            while (currentTileEdges[edge] === "wall") {
//                edge += 1;
//            }
//            if (edge < 4) { // if there's a non-wall edge
//                var nextTileObject = {tileLoc: mapData["tilesArray"].slice(-1), tileData: this.getNextTileData(edge)}
//                return nextTileObject;
//            } else {    //otherwise we've reached a dead end so backtrack
//                this.getPreviousTile();
//            };
//
//        }
//    },
    getNextTileData: function(currentTile, edge) {
        var adjTileData = {};
        switch(edge) {
            case 0:
                adjTileData = this.mapData[currentTile[0]][currentTile[1] - 1];
                break;
            case 1:
                adjTileData = this.mapData[currentTile[0] + 1][currentTile[1]];
                break;
            case 2:
                adjTileData = this.mapData[currentTile[0]][currentTile[1] + 1];
                break;
            case 3:
                adjTileData = this.mapData[currentTile[0] - 1][currentTile[1]];
                break;
            default:
                break;
        }
        return adjTileData;
    },
    getNextTileEdge: function(adjTileData, edge) {
        var adjTileEdge = 0;
        switch(edge) {
            case 0:
                adjTileEdge = adjTileData["edges"][2]; //tile above's bottom edge
                break;
            case 1:
                adjTileEdge = adjTileData["edges"][3]; //tile to the righ's left edge
                break;
            case 2:
                adjTileEdge = adjTileData["edges"][0]; //tile below's top edge
                break;
            case 3:
                adjTileEdge = adjTileData["edges"][1]; //tile to the left's right edge
                break;
            default:
                break;
        }
        if (adjTileEdge === undefined) {
            adjTileEdge = edgeTypes[Math.floor(Math.random() * 3];
        }
        return adjTileEdge;
    },
    getPreviousTile: function() {

    },
    addTileToTree: function(newTileData, currentTileEdges, edge) {
        var oppEdge;
        currentTileEdges[edge] = newTileData;
        edge < 2 ? oppEdge = edge + 2 : oppEdge = edge - 2;
        newTileData["edges"][oppEdge] = currentTileEdges;
    },
    setPathNextTile: function(newTileData, edge) {
        this.mapData["path"].push(newTileData);
        return this.mapData["path"][-1];
    },
    setPathPreviousTile: function(tileData, edge) {

    },
    start: function() {
        var startTile = new Array(2);
        startTile[0] = Math.floor(Math.random() * (mapSizeCols * mapSizeRows + 1)); // row
        startTile[1] = Math.floor(Math.random() * (mapSizeCols * mapSizeRows + 1)); // column
        $(function () {
            $(".tile:contains(' " + mapData[startTileX][startTileY]["tileNum"] + " ')").addClass("tile-current");
        });
        return startTile;
    }
});

//app module
var rogueCraft = angular.module("rogue-craft", ["rogueCraft.mapData", "rogueCraft.movePlayer"]).run(function(map, player){
    map.createGrid();
    var startTile = map.start();
    map.createMap(startTile);
});

rogueCraft.controller("RogueController", function($scope, player, map){
    $scope.mapData = map.mapData;
    $scope.handleClick = function($event) { player.move($event, $scope.mapData) };
});
