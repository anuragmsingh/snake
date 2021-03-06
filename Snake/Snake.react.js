/**
 * Created by ansingh on 8/19/2015.
 */
define(function (require, exports, module) {

    require('jquery');
    var React = require('react');
    React.initializeTouchEvents(true);
    var Block = require("./Block.react");

    var mouse = {x: 0, y: 0};

    var allBlocks, snakeHeadAtDirChange=null;

    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    var Snake = React.createClass({displayName: "Snake",

    fillAllBlocks: function(boardSize) {
        allBlocks = [];
        for(var i=0; i<boardSize*boardSize; i++)
            allBlocks.push(i);
    },

    getRandomFoodPosition: function(alreadyUsed, boardSize) {

        if(allBlocks === undefined || allBlocks.length !== boardSize*boardSize)
            this.fillAllBlocks(boardSize);

        var remainingBlocks = allBlocks.diff(alreadyUsed);

        return remainingBlocks[Math.floor((Math.random() * remainingBlocks.length))];
    },

    getInitialState: function() {
        
        var defaultBoardSize = 20;

        var headLoc = (defaultBoardSize*(1+defaultBoardSize))/2,
            capturedBlocks = [];

        for(var i=0; i<this.props.pSnakeStartSize; i++)
            capturedBlocks.push(headLoc+i);

        var randomFoodPosition = this.getRandomFoodPosition(capturedBlocks, defaultBoardSize);

        return {
            sSnakeSpeed     : 200,
            sBoardStartSize : defaultBoardSize,
            sSnakeDirection : 2,
            sSnakeHeadPosition : headLoc,
            sSnakeCapturedBlocks : capturedBlocks,
            sFoodPosition : randomFoodPosition
        };
    },

    SnakeHeadOnEdge: function(){

        var sz  = this.state.sBoardStartSize,
            pos = this.state.sSnakeHeadPosition,
            result = "";

        var top         = false,
            bottom      = false,
            left        = false,
            right       = false,
            topleft     = false,
            topright    = false,
            bottomleft  = false,
            bottomright = false;

        if(pos >=0 && pos<sz)
            top = true;
        if(pos<sz*sz && pos>=sz*(sz-1))
            bottom = true;
        if(pos%sz === 0)
            left = true;
        if(pos%sz === sz-1)
            right = true;
    
        if(top && left)
            result = "topleft";
        else if(top && right)
            result = "topright";
        else if(bottom && left)
            result = "bottomleft";
        else if(bottom && right)
            result = "bottomright";
        else if(top)
            result = "top";
        else if(bottom)
            result = "bottom";
        else if(left)
            result = "left";
        else if(right)
            result = "right";

        return result;
    },

    moveSnake: function() {

        var headPos,
            edgePosition = this.SnakeHeadOnEdge();

        if(this.state.sSnakeDirection == 0)
        {
            headPos = this.state.sSnakeHeadPosition+1;
            if(edgePosition === "right" || edgePosition === "topright" || edgePosition === "bottomright")
                headPos -= this.state.sBoardStartSize;
        }
        else if(this.state.sSnakeDirection == 1)
        {
            headPos = this.state.sSnakeHeadPosition-this.state.sBoardStartSize;
            if(edgePosition === "top" || edgePosition === "topright" || edgePosition === "topleft")
                headPos += this.state.sBoardStartSize*this.state.sBoardStartSize;
        }
        else if(this.state.sSnakeDirection == 2)
        {
            headPos = this.state.sSnakeHeadPosition-1;
            if(edgePosition === "left" || edgePosition === "topleft" || edgePosition === "bottomleft")
                headPos += this.state.sBoardStartSize;
        }
        else if(this.state.sSnakeDirection == 3)
        {   
            headPos = this.state.sSnakeHeadPosition+this.state.sBoardStartSize;
            if(edgePosition === "bottom" || edgePosition === "bottomright" || edgePosition === "bottomleft")
                headPos -= this.state.sBoardStartSize*this.state.sBoardStartSize;
        }

        var capturedBlocks = this.state.sSnakeCapturedBlocks;

        if(capturedBlocks.indexOf(headPos) !== -1)
        {
            $(this.refs.blockContainer.getDOMNode()).addClass("hide");
                   
            if(capturedBlocks.length < this.state.sBoardStartSize*this.state.sBoardStartSize)
                $(this.refs.SnakeWorld.getDOMNode()).find('.lose').removeClass("hide");
            else
                $(this.refs.SnakeWorld.getDOMNode()).find('.win').removeClass("hide");
            
            $(this.refs.SnakeWorld.getDOMNode()).find('.score').html(capturedBlocks.length+"/"+this.state.sBoardStartSize*this.state.sBoardStartSize);
            $(this.refs.SnakeWorld.getDOMNode()).find('.score').removeClass("hide");
            $(this.refs.reloadButtonContainer.getDOMNode()).removeClass("hide");
            return;
        }

        capturedBlocks.unshift(headPos);
    
        if(headPos == this.state.sFoodPosition)
        {
            this.setState({ sFoodPosition: this.getRandomFoodPosition(capturedBlocks, this.state.sBoardStartSize),
                            sSnakeHeadPosition: headPos, 
                            sSnakeCapturedBlocks: capturedBlocks});
        }    
        else{
            capturedBlocks.pop();
            this.setState({ sSnakeHeadPosition: headPos, 
                            sSnakeCapturedBlocks: capturedBlocks});
        }
        setTimeout(this.moveSnake, this.state.sSnakeSpeed);        
    },

    turnRight: function(){
        if(this.state.sSnakeDirection != 2 && this.state.sSnakeDirection != 0)
            this.setState({sSnakeDirection: 0});
    },

    turnLeft: function(){
        if(this.state.sSnakeDirection != 0 && this.state.sSnakeDirection != 2)
            this.setState({sSnakeDirection: 2}); 
    },

    turnTop: function(){
        if(this.state.sSnakeDirection != 3 && this.state.sSnakeDirection != 1)
            this.setState({sSnakeDirection: 1});
    },

    turnBottom: function(){
        if(this.state.sSnakeDirection != 1 && this.state.sSnakeDirection != 3)
            this.setState({sSnakeDirection: 3});
    },

    handleKeyPress: function(e){

        if(this.state.sSnakeHeadPosition == snakeHeadAtDirChange)
            return;

        snakeHeadAtDirChange = null;

        var code = parseInt(e.which || e.keyCode);

        if(code == 37)
            this.turnLeft();

        else if(code == 38)
            this.turnTop();
        
        else if(code == 39)   
            this.turnRight();

        else if(code == 40)
            this.turnBottom();                        

        snakeHeadAtDirChange = this.state.sSnakeHeadPosition;
    },

    blinkFoodBlock: function() {

        $(this.refs.SnakeWorld.getDOMNode()).find('.food').toggleClass("opaque");
        setTimeout(this.blinkFoodBlock, 500);
    },

    componentDidMount: function() {

        this.blinkFoodBlock();

        window.addEventListener("keydown", this.handleKeyPress, false);
        window.addEventListener("touchstart", this.handleTouchStart, false);
        window.addEventListener("touchend", this.handleTouchEnd, false);

        this.moveSnake();
    },

    propTypes: {
        fParentPath: React.PropTypes.string.isRequired
    },

    getBlock: function(xCord, yCord) {

        var blockKey = this.state.sBoardStartSize * xCord + yCord,
            snakeLen = this.state.sSnakeCapturedBlocks.length;

        return (React.createElement(Block, {key: blockKey, 
                        pxCord: xCord, 
                        pyCord: yCord, 
                        pBlockKey: blockKey, 
                        pDirection: this.state.sSnakeDirection, 
                        pIsHead: this.state.sSnakeCapturedBlocks.indexOf(blockKey) ===  0 ? true  : false, 
                        pIsBody: this.state.sSnakeCapturedBlocks.indexOf(blockKey) !== -1 ? true : false, 
                        pIsTail: this.state.sSnakeCapturedBlocks.indexOf(blockKey) === snakeLen-1 ? true : false, 
                        pIsFood: blockKey === this.state.sFoodPosition ? true : false})
            );
    },

    getBlocks : function() {

        var blocks = [];

        for(var i=0; i<this.state.sBoardStartSize; i++)
            for(var j=0; j<this.state.sBoardStartSize; j++)
                blocks.push(this.getBlock(i, j));

        return (React.createElement("div", {className: "blockContainer", ref: "blockContainer"}, blocks));
    }, 

    getStyle: function() {
        
        var size= this.state.sBoardStartSize*this.props.pBlockSize;

        return {
            'borderStyle'   : 'solid',
            'borderColor'   : 'blueviolet',
            'borderWidth'   : 'thin',
            'width'         : size,
            'height'        : size,
            'marginLeft'    : ($(window).width()-size-2)/2
        };
    },

    getButtonStyle: function() {

        var buttonSize  = 50,
            del;

        return {
            'position'      : 'relative',
            'width'         : buttonSize,
            'height'        : buttonSize,
            'marginLeft'    : ($(window).width()-buttonSize)/2
        };
    },

    getStartIconStyle: function() {

        var iconSize = 160;

        return {
            'position'      : 'relative',
            'width'         : iconSize,
            'height'        : iconSize
        };
    },

    getStartMenuStyle: function() {

        var size = 160;

        return {
            'marginTop'  : '12%',
            'marginLeft' : ($(window).width()-size)/2
        }

    },

    handleTouchStart: function(e){
        
        var touch = e.changedTouches[0];

        mouse.x = touch.pageX;
        mouse.y = touch.pageY;
    },

    handleTouchEnd: function(e){

        if($(this.refs.SnakeWorld.getDOMNode()).hasClass("hide"))
            return;
        
        var touch = e.changedTouches[0];

        var x = touch.pageX,
            y = touch.pageY;

        if(x>=mouse.x && y>=mouse.y)
        {
            if(x-mouse.x > y-mouse.y)
                this.turnRight();
            else
                this.turnBottom();
        }
        else if(x<=mouse.x && y>=mouse.y)
        {
            if(mouse.x-x > y-mouse.y)
                this.turnLeft();
            else
                this.turnBottom();
        }
        else if(x<=mouse.x && y<=mouse.y)
        {
            if(mouse.x-x > mouse.y-y)
                this.turnLeft();
            else
                this.turnTop();
        }
        else if(x>=mouse.x && y<=mouse.y)
        {
            if(x-mouse.x > mouse.y-y)
                this.turnRight();
            else
                this.turnTop();
        }
    },

    handleHomeClick: function() {
        location.reload();
    },

    setSpeed: function(e) {

        if($(e.target).hasClass("slowButton"))
            this.setState({sSnakeSpeed: 225});
        else if($(e.target).hasClass("mediumButton"))
            this.setState({sSnakeSpeed: 150});
        else if($(e.target).hasClass("fastButton"))
            this.setState({sSnakeSpeed: 75});

        $(this.refs.startPage.getDOMNode()).addClass("hide");
        $(this.refs.SnakeWorld.getDOMNode()).removeClass("hide");
    },

    render: function() {
        return (
            React.createElement("div", null,
                React.createElement("div", {className: "startPage", ref:"startPage", style: this.getStartMenuStyle()},
                    React.createElement("div", {className: "startIconContainer"},
                        React.createElement("img", {className: "startIcon", style: this.getStartIconStyle(), src: 'res/icon/android/iconSnake.png'}, null)
                    ),
                    React.createElement("div", {className: "btnContainer"},
                        React.createElement("button", {className: "btn slowButton", onClick: this.setSpeed}, "SLOW")
                    ),
                    React.createElement("div", {className: "btnContainer"},
                        React.createElement("button", {className: "btn mediumButton", onClick: this.setSpeed}, "MEDIUM")
                    ),
                    React.createElement("div", {className: "btnContainer"},
                        React.createElement("button", {className: "btn fastButton", onClick: this.setSpeed}, "FAST")
                    )
                ),
                React.createElement("div", {className: "SnakeWorld hide", ref: "SnakeWorld", style: this.getStyle()}, 
                    this.getBlocks(), 
                    React.createElement("div", {className: "win hide"}, "You Win!"), 
                    React.createElement("div", {className: "lose hide"}, "Longer !!!"), 
                    React.createElement("div", {className: "score hide"})
                ),
                React.createElement("div", {className: "reloadButtonContainer hide", ref:"reloadButtonContainer"},
                    React.createElement("img", {className: "reloadButton", style: this.getButtonStyle(), src: 'res/home.png', onClick: this.handleHomeClick}, null)
                )
            )
        );
    },

    });

    module.exports = Snake;
});