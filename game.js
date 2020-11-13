const c = document.getElementById("can");
const ctx = c.getContext("2d");
const width = can.width;
const height = can.height;

let fps = 00;

let board =
[["", "", ""],
["", "", ""],
["", "", ""]]

let lastplayer;
let gameOver = false;


let button1 = {
    x: 50,
    y: 450,
    w: 200,
    h: 30,
    text: "Reset"
}

//tree of moves
//Make tree once, then keep track of where in the tree the game is at and make decisions based on that
let bd =
[["", "", ""],
["", "", ""],
["", "", ""]]

class Node{
    constructor(State , player){
        this.children = []
        this.bdstate = State
        this.player = player
    }

    fillTree(node){
        //checking if its a leaf node by checking if there are available moves or if someone won
        let {win, sym} = checkWin(node.bdstate)
        if((availableMoves(node.bdstate).length != 0) && !(win)){
            let moves = availableMoves(node.bdstate)
            moves.forEach(el => {
                // copying node.bdstate to bdChild
                let bdChild = [["", "", ""],["", "", ""],["", "", ""]]
                for(let i = 0; i< bdChild.length; i++){
                    for(let j =0; j< bdChild[0].length; j++){
                        bdChild[i][j] = node.bdstate[i][j]
                    }
                }
                
                bdChild[el.i][el.j] = node.player
                let player;
                if(node.player == "X"){
                    player = "O"
                }else{
                    player = "X"
                }
                let child = new Node(bdChild, player)
                node.children.push(child)
                })
            node.children.forEach(el => {
                this.fillTree(el)
            })
        }
    }
}

let tree = new Node(bd, "X")
tree.fillTree(tree)
console.log(tree)

let currState = tree

function eval(bd){
    let {win, sym} = checkWin(bd)
    if(win && sym == "O"){
        return 1
    }
    else if(win && sym == "X"){
        return -1
    }else{
        return 0
    }
}

function findMove(bd1, bd2){
    console.log(bd1, bd2)
    for(let i = 0; i < bd1.length; i++){
        for(let j = 0; j < bd1[0].length; j++){
            if(bd1[i][j] != bd2[i][j]){
                return {i, j}
            }
        }
    }
}

function matrixEqual(bd1, bd2){
    let equal = true
    for(let i = 0; i < bd1.length; i++){
        for(let j = 0; j < bd1[0].length; j++){
            if(bd1[i][j] != bd2[i][j]){
                equal = false
            }
        }
    }
    return equal
}

function miniMax(node){
    //computer is maximising we are minimising
    //Error logging: minimax is working and giving the value of the whole tree but how do we use that to pick the next move
    if(node.children.length == 0){
        return node
    }

    if(node.player == "O"){
        let max = -100;
        let maxNode;
        let found;
        for(let i = 0; i< node.children.length; i++){
            found = miniMax(node.children[i])
            let foundmax = eval(found.bdstate)
            if(foundmax >= max){
                max = foundmax
                maxNode = found
            }
        }
        return maxNode
    }

    if(node.player == "X"){
        let min = 100;
        let minNode;
        let found;
        for(let i = 0; i< node.children.length; i++){
            found = miniMax(node.children[i])
            let foundmin = eval(found.bdstate)
            if(foundmin <= min){
                min = foundmin
                minNode = found
            }
        }
        return minNode
    }    
}

function availableMoves(board){
    let available = []

    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[0].length; j++){
            if(board[i][j] == ""){
                available.push({i, j})
            }
        }
    }

    return available
}

function drawMark(sym, i, j){
    if(sym == "X"){
        let size = 20
        let x = ((width/5) * (j+1))
        let y = (height/5) * i
        let x1 = x + (width/5)
        let y1 = y + (height/5)
        ctx.beginPath()
        ctx.strokeStyle = "white";
        ctx.moveTo(x + size, y + size)
        ctx.lineTo(x1 - size, y1 - size)
        ctx.moveTo(x + size, y1 - size)
        ctx.lineTo(x1 - size, y + size)
        ctx.stroke()
    }

    if(sym == "O"){
        let x = ((width/5) * (j+1)) + (width/10)
        let y = ((height/5) * i) + (height/10)
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function equal3(i,j,k,bd){
    if(bd[i.i][i.j] == "" || bd[j.i][j.j] == "" || bd[k.i][k.j] == ""){
        return false
    }else{
        return bd[i.i][i.j] == bd[j.i][j.j] && bd[j.i][j.j]== bd[k.i][k.j] && bd[i.i][i.j] == bd[k.i][k.j]
    }
}

function checkWin(bd){
    //check columns
    for(let i = 0; i<3 ; i++){
        let a = {i:i, j:0}
        let b = {i:i, j:1}
        let c = {i:i, j:2}
        if(equal3(a, b, c, bd)){
            return {win:true, sym:bd[i][0]};
        }
    }
    //check rows
    for(let i = 0; i<3 ; i++){
        let a = {i:0, j:i}
        let b = {i:1, j:i}
        let c = {i:2, j:i}
        if(equal3(a, b, c, bd)){
            return {win:true, sym:bd[0][i]};
        }
    }

    //check diagonals
    if(equal3({i:0, j:0}, {i:1, j:1}, {i:2, j:2}, bd)){
        return {win:true, sym:bd[0][0]};
    }
    if(equal3({i:0, j:2}, {i:1, j:1}, {i:2, j:0}, bd)){
        return {win:true, sym:bd[0][2]};
    }

    return {win:false, sym:""}
}

function update(){
    ctx.clearRect(0,0,width,height)

    ctx.fillStyle = "black"
    ctx.fillRect(0,0,width,height);

    //making buttons
    //button 1
    ctx.fillStyle = "white"
    ctx.font = "30px Georgia";
    ctx.fillText(button1.text, button1.x, button1.y + button1.h)

    for(let i = 1; i < 3; i++){
        ctx.beginPath();
        ctx.strokeStyle = "white";
        let x = width/5;
        let y = i * 100;
        ctx.moveTo(x, y)
        ctx.lineTo(x + 300, y);
        ctx.stroke();
    }

    for(let i = 2; i < 4; i++){
        ctx.beginPath();
        ctx.strokeStyle = "white";
        let y = 0;
        let x = i * 100;
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + 300);
        ctx.stroke();
    }

    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[0].length; j++){
            if(board[i][j] == "X"){
                drawMark("X", i, j)
            }else if(board[i][j] == "O"){
                drawMark("O", i, j)
            }
        }
    }

    let {win,sym} = checkWin(board)
    if(win){
        gameOver = true;
        ctx.font = "30px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText(sym + " Wins", 300, button1.y + 30);
    }

    if(gameOver && !win){
        ctx.font = "30px Georgia";
        ctx.fillStyle = "white";
        ctx.fillText("It's a draw!", 300, button1.y + 30);
    }



}

function mousemove(evt){

}
c.addEventListener("mousemove", mousemove);

function mousedown(evt){

    if(evt.x < button1.x + button1.w && evt.x > button1.x && evt.y < button1.y + height && evt.y > button1.y){
        board =
        [["", "", ""],
        ["", "", ""],
        ["", "", ""]]
        gameOver = false
        currState = tree

    }


    let i = Math.floor(evt.y/(height/5));
    let j = Math.floor(evt.x/(width/5)) - 1;
    if(evt.x <= (width/5) * 4 && evt.x >= width/5 && evt.y <= (height/5) * 3 && evt.y >= 0 && board[i][j] == "" && !gameOver){
        board[i][j] = "X"
        lastplayer = "X"

        for(let i =0; i < currState.children.length; i++){
            if(matrixEqual(currState.children[i].bdstate, board)){
                currState = currState.children[i]
            }
        }

        /*
        let available = []

        for(let i = 0; i < board.length; i++){
            for(let j = 0; j < board[0].length; j++){
                if(board[i][j] == ""){
                    available.push({i, j})
                }
            }
        }

        let item = available[Math.floor(Math.random()*available.length)]
        */
       //Returning an item which has the row anc column of where O will be placed using minimax

       let bestMoveEval = -100;
       let bestMoveNode;

       for(let i =0; i < currState.children.length; i++){
            let item = miniMax(currState.children[i])
            if(eval(item.bdstate) >= bestMoveEval){
                bestMoveEval = eval(item.bdstate)
                bestMoveNode = currState.children[i]
            }
        }

        if(availableMoves(board).length == 0){
            gameOver = true;
        }else{

            let move = findMove(bestMoveNode.bdstate, currState.bdstate)
            currState = bestMoveNode
            let win = checkWin(board).win
            if(!win){
                board[move.i][move.j] = "O";
                lastplayer = "O" 
            }   
        }
    }
}
c.addEventListener("mousedown", mousedown);


setInterval(update, 1000/fps)