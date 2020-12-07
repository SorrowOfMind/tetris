function main(){
    const cvs = document.getElementById('game');
    const ctx = cvs.getContext('2d');
    const scoreTxt = document.getElementById('score');

    const sizes = {
        row: 20,
        col: 10,
        sq: 30,
    };

    const game = {
        board: Array(200).fill(0),
        pieces: [
            [Z, "green"],
            [S, "yellow"],
            [T, "brown"],
            [O, "purple"],
            [L, "orange"],
            [I, "red"],
            [J, "blue"]
        ],
        baseCol: '#161717',
        gameOver: false,
        score: 0,
        drawBoard(){
            for (let i = 0; i < game.board.length; i++) {
                ctx.fillStyle = game.board[i] ? game.board[i] : game.baseCol;
                ctx.fillRect((i % sizes.col) * sizes.sq, Math.floor(i / sizes.col) * sizes.sq, sizes.sq, sizes.sq);
                ctx.strokeStyle = game.baseCol;
                ctx.strokeRect((i % sizes.col) * sizes.sq, Math.floor(i / sizes.col) * sizes.sq, sizes.sq, sizes.sq);
            }
        },
        drawSq(x,y,color){
            ctx.fillStyle = color;
            ctx.fillRect(x * sizes.sq, y * sizes.sq, sizes.sq, sizes.sq);
            ctx.strokeStyle = game.baseCol;
            ctx.strokeRect(x * sizes.sq, y * sizes.sq, sizes.sq, sizes.sq);
        }
    }

    game.drawBoard();

    class Piece {
        constructor(pc, color){
            this.pc = pc;
            this.color = color;
            this.shape = 0;
            this.activePc = this.pc[this.shape];
            this.x = 3;
            this.y = -2;
        }
        draw(){
            for (let row = 0; row < this.activePc.length; row++){
                for (let col = 0; col < this.activePc.length; col++){
                    if (this.activePc[row][col]) {
                        game.drawSq(this.x + col, this.y + row, this.color);
                    }
                }
            }
        }
        undraw(){
            for (let row = 0; row < this.activePc.length; row++){
                for (let col = 0; col < this.activePc.length; col++){
                    if (this.activePc[row][col]) {
                        game.drawSq(this.x + col, this.y + row, game.baseCol);
                    }
                }
            }
        }
        moveDown(){
            if (!this.detectCollision(0, 1, this.activePc)){
                this.undraw();
                this.y++;
                this.draw();
            } else {
                this.lock();
                p = generateRandomPc();
            }
        }
        moveLeft(){
            if (!this.detectCollision(-1,0,this.activePc)){
                this.undraw();
                this.x--;
                this.draw();
            }
        }
        moveRight(){
            if (!this.detectCollision(1,0, this.activePc)){
                this.undraw();
                this.x++;
                this.draw();
            }
        }
        rotate(){
            let nextPattern = this.pc[(this.shape + 1) % this.pc.length];
            let kickoff = 0;
            if (this.detectCollision(0,0, nextPattern)){
                if (this.x > sizes.col / 2) kickoff = -1;
                else kickoff = 1;
            }
            if (!this.detectCollision(kickoff,0, nextPattern)){
                this.undraw();
                this.x += kickoff;
                this.shape = (this.shape + 1) % this.pc.length;
                this.activePc = this.pc[this.shape];
                this.draw();
            }
        }
        detectCollision(x, y, piece){
            for (let row = 0; row < piece.length; row++){
                for (let col = 0; col < this.activePc.length; col++){
                    if (!piece[row][col]) {
                        continue;
                    }
                    let newX = this.x + col + x;
                    let newY = this.y + row + y;

                    if (newX < 0 || newX >= sizes.col || newY >= sizes.row) return true;
                    if (newY < 0) continue;
                    if (game.board[(newY * 10) + newX]) return true;
                }
            }
            return false;
        }
        lock(){
            for (let row = 0; row < this.activePc.length; row++){
                for (let col = 0; col < this.activePc.length; col++){
                    if (!this.activePc[row][col]) continue;
                    if (this.y + row < 0){
                        alert("Game over");
                        game.gameOver = true;
                        break;
                    }
                    game.board[(this.y + row) * 10 + this.x + col] = this.color;
                }
            }

            let isRowFull = false;
            let startIdx = 0;
            for (let row = 0; row <= sizes.row; row++){
                let base = row * 10;
                if (game.board[base] && game.board[base + 1] && game.board[base + 2] && game.board[base + 3] && game.board[base + 4] && game.board[base + 5] && game.board[base + 6] && game.board[base + 7] && game.board[base + 8] && game.board[base + 9]){
                    isRowFull = true;
                    startIdx = base;
                }
            }
            if (isRowFull){
                game.board.splice(startIdx, 10);
                game.board.unshift(0,0,0,0,0,0,0,0,0,0);
                game.drawBoard();
                game.score += 10;
                scoreTxt.textContent = game.score;
                isRowFull = false;
                startIdx = 0;
            }

        }
    }

    function controller (e){
        let key = e.key;
        switch(key){
            case 'ArrowLeft':
                p.moveLeft();
                startDrop = Date.now();
                break;
            case 'ArrowRight':
                p.moveRight();
                startDrop = Date.now();
                break;
            case 'ArrowUp':
                p.rotate();
                startDrop = Date.now();
                break;
            case 'ArrowDown':
                p.moveDown();
                startDrop = Date.now();
                break;
        }
    }

    function generateRandomPc (){
        let random = Math.floor(Math.random() * game.pieces.length);
        return new Piece(game.pieces[random][0], game.pieces[random][1]);
    }

    let p = generateRandomPc();
    p.draw();

    let startDrop = Date.now();
    function drop(){
        let now = Date.now();
        let delta = now - startDrop;
        if (delta > 1000){
            p.moveDown();
            startDrop = Date.now();
        }
        if (!game.gameOver) requestAnimationFrame(drop);
    }

    drop();
    window.addEventListener('keydown', controller);
}

main();