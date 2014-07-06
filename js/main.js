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

var mapSizeRows = 10;   // number of rows in the map
var mapSizeCols = 20;   // number of columns in the map
var numOfTiles = mapSizeRows * mapSizeCols;

// PLAYER module

angular.module("rogueCraft.movePlayer", []).value("player", {
    move: function($event, $scope) {
        var tileDown = $scope.mapData["tileNum"] + mapSizeRows;
        var tileUp = $scope.mapData["tileNum"] - mapSizeRows;
        var tileLeft = $scope.mapData["tileNum"] - 1;
        var tileRight = $scope.mapData["tileNum"] + 1;
        var newTile = parseInt($($event.target).text());
        switch (newTile) {
            case tileDown:
                if (tileDown <= (mapSizeRows * mapSizeCols)) { this.changeTile($event); }
                break;
            case tileUp:
                if (tileUp >= 0) { this.changeTile($event); }
                break;
            case tileLeft:
                if ($scope.mapData["tileNum"] % mapSizeRows !== 1) { this.changeTile($event); }
                break;
            case tileRight:
                if ($scope.mapData["tileNum"] % mapSizeRows !== 0) { this.changeTile($event); }
                break;
            default: return;
        }
    },
    changeTile: function($event) {
        $(".tile-current").removeClass("tile-current").addClass("tile-visited");
        $($event.target).attr("class", "tile tile-current");
    },
});

// MAP module

angular.module("rogueCraft.mapData", []).value("map", {
    totalDungeonLevels: 20,
    dungeonData: new Array(this.totalDungeonLevels),
    mapData: [],
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
    createMap: function(startTileLoc) {
        var count = 1;
        var adjTileData = {};
        var adjTileEdge = 0;
        var currentTileLoc = startTileLoc;    // array of two numbers indicating col and row for tile location - not sure it's needed - only being used to pass to getNextUnfinishedTile
        var currentTileData = this.mapData[startTileLoc[0]][startTileLoc[1]]; // tile object (hash) containing edge info, etc.
        currentTileData["edges"] = []; // indices go clockwise from top just like css box model; options are "wall", "door", "blank"
        var currentTileEdges = currentTileData["edges"];
        var edge = 0;
        var nextTileObject = {};
        this.mapData["path"] = [];  // dynamic array of objects which are pushed to array starting with start tile, each object containing array(4) and pointer to tile hash in mapData
        this.mapData["path"].push(currentTileData);

        while (count <= numOfTiles) {
            currentTileEdges = new Array(4); // indices go clockwise from top just like css box model; options are "wall", "door", "blank"
            nextTileObject = {};
            edge = 0;
            while (nextTileObject === {} && edge < 4) {
                // if tile is in top row and edge is at top OR if tile is in bottom row and edge is at bottom OR if tile is on left column and edge is on left OR if tile is on right column and edge is on right
                if (((currentTileData["tileNum"] < mapSizeRows) && (edge === 0)) || ((currentTileData["tileNum"] > numOfTiles - mapSizeRows) && (edge === 2)) || ((currentTileData["tileNum"] % mapSizeRows === 1) && (edge === 3)) || ((currentTileData["tileNum"] % mapSizeRows === 0) && (edge === 1))) {
                    currentTileEdges[edge] = {edgeType: "wall"}; // then set edge to be a wall
                } else if (currentTileEdges[edge] === undefined) {
                    adjTileData = this.getNextTileData(currentTileLoc, edge);
                    adjTileEdge = this.getNextTileEdge(adjTileData, edge);
                    currentTileEdges[edge] = {edgeType: adjTileEdge, adjTile: adjTileData};
                    if (adjTileEdge !== "wall") { this.addTileToTree(adjTileData, currentTileEdges, edge); }
                    if (nextTileObject === {}) { nextTileObject = this.getPreviousTileOnPath(); }
                }
            // need to deal with what happens when we reach a dead end
                edge += 1;
            }
            if (nextTileObject === {}) { nextTileObject = this.addTileToPath(adjTileData); }
            currentTileData = nextTileObject["tileData"];
            currentTileLoc = nextTileObject["tileLoc"];
            count += 1;
        }
        this.dungeonData.push(this.mapData);
    },
    getNextTileData: function(currentTileLoc, edge) {
        var adjTileData = {};
        switch(edge) {
            case 0:
                adjTileData = this.mapData[currentTileLoc[0]][currentTileLoc[1] - 1];
                break;
            case 1:
                adjTileData = this.mapData[currentTileLoc[0] + 1][currentTileLoc[1]];
                break;
            case 2:
                adjTileData = this.mapData[currentTileLoc[0]][currentTileLoc[1] + 1];
                break;
            case 3:
                adjTileData = this.mapData[currentTileLoc[0] - 1][currentTileLoc[1]];
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
        var edgeTypes = ["wall", "door", "blank"];
        if (adjTileEdge === undefined) { adjTileEdge = edgeTypes[Math.floor(Math.random() * 3)]; }
        return adjTileEdge;
    },
    getPreviousTileOnPath: function() {
        this.mapData["path"].pop();
        return this.mapData["path"][-1];
    },
    addTileToTree: function(newTileData, currentTileEdges, edge) {
        var oppEdge;
        currentTileEdges[edge] = newTileData;
        edge < 2 ? oppEdge = edge + 2 : oppEdge = edge - 2;
        newTileData["edges"][oppEdge] = currentTileEdges;
    },
    addTileToPath: function(newTileData, edge) {
        this.mapData["path"].push(newTileData);
        return this.mapData["path"][-1];
    },
    start: function() {
        var startTileLoc = new Array(2);
        startTileLoc[0] = Math.floor(Math.random() * (mapSizeRows + 1)); // X
        startTileLoc[1] = Math.floor(Math.random() * (mapSizeCols + 1)); // Y

        console.log(this.mapData, startTileLoc)
        var that = this;
        $(function() { $(".tile:contains(' " + that.mapData[startTileLoc[0]][startTileLoc[1]]["tileNum"] + " ')").addClass("tile-current"); });
        return startTileLoc;
    }
});

//app module
var rogueCraft = angular.module("rogue-craft", ["rogueCraft.mapData", "rogueCraft.movePlayer"]).run(function(map, player){
    map.createGrid();
    var startTileLoc = map.start();
    map.createMap(startTileLoc);
});

rogueCraft.controller("RogueController", function($scope, player, map){
    $scope.mapData = map.mapData;
    $scope.handleClick = function($event) { player.move($event, $scope.mapData) };
});
