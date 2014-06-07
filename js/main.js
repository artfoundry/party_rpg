//submodules
//(function(){
//    var map = angular.module("map", []);
//})
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

angular.module("rogueCraft.movePlayer", []).value("player", {
    move: function($event) {
        var $currentTile = $(".tile-current");
        var tileDown = parseInt($currentTile.text(), 10) + 10;
        var tileUp = parseInt($currentTile.text(), 10) - 10;
        var tileLeft = parseInt($currentTile.text(), 10) - 1;
        var tileRight = parseInt($currentTile.text(), 10) + 1;
        var newTile = parseInt($($event.target).text());
        switch (newTile) {
            case tileDown:
                if (tileDown <= 100) { this.changeTile($event); }
                break;
            case tileUp:
                if (tileUp >= 0) { this.changeTile($event); }
                break;
            case tileLeft:
                if (parseInt($currentTile.text()) % 10 !== 1) { this.changeTile($event); }
                break;
            case tileRight:
                if (parseInt($currentTile.text()) % 10 !== 0) { this.changeTile($event); }
                break;
            default: return;
        }
    },
    changeTile: function($event){
        $(".tile-current").removeClass("tile-current").addClass("tile-visited");
        $($event.target).attr("class", "tile tile-current");
    },
    start: function() {
        var startTile = Math.round(Math.random() * 100);
        $(function () {
            $(".tile:contains(' " + startTile + " ')").addClass("tile-current");
        });
    }
});

angular.module("rogueCraft.createLevel", []).value("level", {
    tileNum: [],
    create: function() {
        for (var i = 0; i < 10; i++) {
            this.tileNum[i] = [];
            var lastNum = 0;
            for (var j = 0; j < 10; j++) {
                i === 0 ? lastNum = 0 : lastNum = this.tileNum[i-1][9];
                this.tileNum[i][j] = j + lastNum + 1;
            }
        }
    }
});

//app module
var rogueCraft = angular.module("rogue-craft", ["rogueCraft.createLevel", "rogueCraft.movePlayer"]).run(function(level, player){
    level.create();
    player.start();
});

rogueCraft.controller("RogueController", function($scope, player, level){
    $scope.tileNum = level.tileNum;
    $scope.handleClick = function($event) { player.move($event) };
});
