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

angular.module("rogueCraft.moveMonster", []).value("monster", {
    move: function() {
        var $monsterTile = $(".tile-monster");
        var nextTile = [];
        var choice = Math.floor(Math.random() * 4);
        var monsterTileVal = parseInt($monsterTile.text(), 10);
        nextTile[0] = parseInt($monsterTile.text(), 10) + 10;
        nextTile[1] = parseInt($monsterTile.text(), 10) - 10;
        nextTile[2] = parseInt($monsterTile.text(), 10) - 1;
        nextTile[3] = parseInt($monsterTile.text(), 10) + 1;
        if (monsterTileVal <= 10) { nextTile[1] = nextTile[0]; }
        else if (monsterTileVal >= 91) { nextTile[0] = nextTile[1]; }
        if (monsterTileVal % 10 === 0) { nextTile[3] = nextTile[2]; }
        else if (monsterTileVal % 10 === 1) { nextTile[2] = nextTile[3]; }
        this.changeTile(nextTile[choice]);
    },
    changeTile: function(newTile){
        $(".tile-monster").removeClass("tile-monster tile-sword tile-splat");
        $(".tile").filter(function() {
            return parseInt($(this).text(), 10) === newTile;
        }).addClass("tile-monster");
        if ($(".tile-monster").hasClass("tile-current")) {
            alert("The monster ate you! Click OK to reload and play again.");
            location.reload();
        }
        if ($(".tile-monster").hasClass("tile-option")) {
            $(".tile-monster").removeClass("tile-option").addClass("tile-sword");
        }
    },
    start: function() {
        var startTile = Math.floor(Math.random() * 100 + 1);
        $(function () {
            $(".tile:contains(' " + startTile + " ')").addClass("tile-monster");
        });
    }
});

angular.module("rogueCraft.movePlayer", []).value("player", {
    score: 0,
    move: function($event) {
        var $currentTile = $(".tile-current");
        var tileDown = parseInt($currentTile.text(), 10) + 10;
        var tileUp = parseInt($currentTile.text(), 10) - 10;
        var tileLeft = parseInt($currentTile.text(), 10) - 1;
        var tileRight = parseInt($currentTile.text(), 10) + 1;
        var clickedTile = parseInt($($event.target).text(), 10);
        if ($($event.target).hasClass("tile-monster") && ((clickedTile === tileDown) || (clickedTile === tileUp) || (clickedTile === tileLeft) || (clickedTile === tileRight))) {
            this.score += 1;
            $($event.target).removeClass("tile-monster tile-sword");
            $($event.target).addClass("tile-splat");
            return "win";
        } else {
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
            this.markTile();
        }
    },
    changeTile: function($event){
        var $currentTile = $(".tile-current");
        var tileDown = parseInt($currentTile.text(), 10) + 10;
        var tileUp = parseInt($currentTile.text(), 10) - 10;
        var tileLeft = parseInt($currentTile.text(), 10) - 1;
        var tileRight = parseInt($currentTile.text(), 10) + 1;
        $(".tile:contains('" + tileDown + "')").removeClass("tile-option");
        $(".tile:contains('" + tileUp + "')").removeClass("tile-option");
        $(".tile:contains('" + tileLeft + "')").removeClass("tile-option");
        $(".tile:contains('" + tileRight + "')").removeClass("tile-option");
        $currentTile.removeClass("tile-current").addClass("tile-visited");
        $($event.target).attr("class", "tile tile-current");
    },
    start: function() {
        var startTile = Math.round(Math.random() * 100);
        $(function () {
            $(".tile:contains(' " + startTile + " ')").addClass("tile-current");
        });
    },
    markTile: function(){
        var $currentTile = $(".tile-current");
        var tileDown = parseInt($currentTile.text(), 10) + 10;
        var tileUp = parseInt($currentTile.text(), 10) - 10;
        var tileLeft = parseInt($currentTile.text(), 10) - 1;
        var tileRight = parseInt($currentTile.text(), 10) + 1;
        $(".tile").filter(function() {
            return parseInt($(this).text(), 10) === tileDown;
        }).addClass("tile-option");
        $(".tile").filter(function() {
            return parseInt($(this).text(), 10) === tileUp;
        }).addClass("tile-option");
        $(".tile").filter(function() {
            return parseInt($(this).text(), 10) === tileLeft;
        }).addClass("tile-option");
        $(".tile").filter(function() {
            return parseInt($(this).text(), 10) === tileRight;
        }).addClass("tile-option");
    },
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
var rogueCraft = angular.module("rogue-craft", ["rogueCraft.createLevel", "rogueCraft.movePlayer", "rogueCraft.moveMonster"]).run(function(level, player, monster){
    level.create();
    player.start();
    $(function() { player.markTile(); });
    monster.start();
});

rogueCraft.controller("RogueController", function($scope, player, monster, level){
    $scope.tileNum = level.tileNum;
    $scope.player = player;
    $scope.handleClick = function($event) {
        if (player.move($event) === "win") { monster.start(); }
        monster.move(); };
});
