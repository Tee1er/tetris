class Tetromino {
    constructor(imageX, imageY, template, gameMap, context) {
        this.imageY = imageY;
        this.imageX = imageX;
        this.template = template;
        this.x = context.squareCountX / 2;
        this.y = 0;
        this.gameMap = gameMap
        this.context = context
    }

    checkBottom() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (realY + 1 >= this.context.squareCountY) {
                    return false;
                }
                if (this.gameMap[realY + 1][realX].imageX != -1) {
                    return false;
                }
            }
        }
        return true;
    }

    getTruncedPosition() {
        return { x: Math.trunc(this.x), y: Math.trunc(this.y) };
    }
    checkLeft() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (realX - 1 < 0) {
                    return false;
                }

                if (this.gameMap[realY][realX - 1].imageX != -1) return false;
            }
        }
        return true;
    }

    checkRight() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (realX + 1 >= this.context.squareCountX) {
                    return false;
                }

                if (this.gameMap[realY][realX + 1].imageX != -1) return false;
            }
        }
        return true;
    }

    moveRight() {
        if (this.checkRight()) {
            this.x += 1;
        }
    }

    moveLeft() {
        if (this.checkLeft()) {
            this.x -= 1;
        }
    }

    moveBottom() {
        if (this.checkBottom()) {
            this.y += 1;
            this.score += 1;
        }
    }
    changeRotation() {
        let tempTemplate = [];
        for (let i = 0; i < this.template.length; i++)
            tempTemplate[i] = this.template[i].slice();
        let n = this.template.length;
        for (let layer = 0; layer < n / 2; layer++) {
            let first = layer;
            let last = n - 1 - layer;
            for (let i = first; i < last; i++) {
                let offset = i - first;
                let top = this.template[first][i];
                this.template[first][i] = this.template[i][last]; // top = right
                this.template[i][last] = this.template[last][last - offset]; //right = bottom
                this.template[last][last - offset] =
                    this.template[last - offset][first];
                //bottom = left
                this.template[last - offset][first] = top; // left = top
            }
        }

        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (
                    realX < 0 ||
                    realX >= this.context.squareCountX ||
                    realY < 0 ||
                    realY >= this.context.squareCountY
                ) {
                    this.template = tempTemplate;
                    return false;
                }
            }
        }
    }
}

class Tetris {
    constructor(canvasNumber) {
        this.imageSquareSize = 24;
        this.size = 40;
        this.framePerSecond = 24;
        this.gameSpeed = 10; // originally 5
        this.canvas = document.getElementById("canvas" + (canvasNumber == undefined ? "" : canvasNumber));
        this.nextShapeCanvas = document.getElementById("nextShapeCanvas" + (canvasNumber == undefined ? "" : canvasNumber));
        this.scoreCanvas = document.getElementById("scoreCanvas" + (canvasNumber == undefined ? "" : canvasNumber));
        this.image = document.getElementById("image" + (canvasNumber == undefined ? "" : canvasNumber));
        this.ctx = this.canvas.getContext("2d");
        this.nctx = this.nextShapeCanvas.getContext("2d");
        this.sctx = this.scoreCanvas.getContext("2d");
        this.squareCountX = this.canvas.width / this.size;
        this.squareCountY = this.canvas.height / this.size;

        this.initalTwoDArr = [];
        for (let i = 0; i < this.squareCountY; i++) {
            let temp = [];
            for (let j = 0; j < this.squareCountX; j++) {
                temp.push({ imageX: -1, imageY: -1 });
            }
            this.initalTwoDArr.push(temp);
        }
        this.gameMap = this.initalTwoDArr;

        this.whiteLineThickness = 4;

        this.shapes = [
            new Tetromino(0, 120, [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0],
            ], this.gameMap, this),
            new Tetromino(0, 96, [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ], this.gameMap, this),
            new Tetromino(0, 72, [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1],
            ], this.gameMap, this),
            new Tetromino(0, 48, [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0],
            ], this.gameMap, this),
            new Tetromino(0, 24, [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
            ], this.gameMap, this),
            new Tetromino(0, 0, [
                [1, 1],
                [1, 1],
            ], this.gameMap, this),

            new Tetromino(0, 48, [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1],
            ], this.gameMap, this),
        ];

        this.score = 0;
        this.gameOver = false;
        this.currentShape = this.getRandomShape();
        this.nextShape = this.getRandomShape();


        window.addEventListener("keydown", (event) => {
            if (event.keyCode == 37) this.currentShape.moveLeft();
            else if (event.keyCode == 38) this.currentShape.changeRotation();
            else if (event.keyCode == 39) this.currentShape.moveRight();
            else if (event.keyCode == 40) this.currentShape.moveBottom();
        });
    }

    // gameLoop() {
    //     setInterval(this.update, 1000 / this.gameSpeed);
    //     setInterval(this.draw, 1000 / this.framePerSecond);
    // };

    deleteCompleteRows() {
        for (let i = 0; i < this.gameMap.length; i++) {
            let t = this.gameMap[i];
            let isComplete = true;
            for (let j = 0; j < t.length; j++) {
                if (t[j].imageX == -1) isComplete = false;
            }
            if (isComplete) {
                console.log("complete row");
                this.score += 1000;
                for (let k = i; k > 0; k--) {
                    this.gameMap[k] = this.gameMap[k - 1];
                }
                let temp = [];
                for (let j = 0; j < this.squareCountX; j++) {
                    temp.push({ imageX: -1, imageY: -1 });
                }
                this.gameMap[0] = temp;
            }
        }
    };

    update() {
        if (this.gameOver) return;
        if (this.currentShape.checkBottom()) {
            this.currentShape.y += 1;
        } else {
            for (let k = 0; k < this.currentShape.template.length; k++) {
                for (let l = 0; l < this.currentShape.template.length; l++) {
                    if (this.currentShape.template[k][l] == 0) continue;
                    this.gameMap[this.currentShape.getTruncedPosition().y + l][
                        this.currentShape.getTruncedPosition().x + k
                    ] = { imageX: this.currentShape.imageX, imageY: this.currentShape.imageY };
                }
            }

            this.deleteCompleteRows();
            this.currentShape = this.nextShape;
            this.nextShape = this.getRandomShape();
            if (!this.currentShape.checkBottom()) {
                this.gameOver = true;
            }
            this.score += 100;
        }
    };

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    };

    drawBackground() {
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, "#bca0dc");
        for (let i = 0; i < this.squareCountX + 1; i++) {
            this.drawRect(
                this.size * i - this.whiteLineThickness,
                0,
                this.whiteLineThickness,
                this.canvas.height,
                "white"
            );
        }

        for (let i = 0; i < this.squareCountY + 1; i++) {
            this.drawRect(
                0,
                this.size * i - this.whiteLineThickness,
                this.canvas.width,
                this.whiteLineThickness,
                "white"
            );
        }
    };

    drawCurrentTetris() {
        for (let i = 0; i < this.currentShape.template.length; i++) {
            for (let j = 0; j < this.currentShape.template.length; j++) {
                if (this.currentShape.template[i][j] == 0) continue;
                this.ctx.drawImage(
                    this.image,
                    this.currentShape.imageX,
                    this.currentShape.imageY,
                    this.imageSquareSize,
                    this.imageSquareSize,
                    Math.trunc(this.currentShape.x) * this.size + this.size * i,
                    Math.trunc(this.currentShape.y) * this.size + this.size * j,
                    this.size,
                    this.size
                );
                console.log(this.image)
                console.log(this.currentShape)
            }
        }
    };

    drawSquares() {
        for (let i = 0; i < this.gameMap.length; i++) {
            let t = this.gameMap[i];
            for (let j = 0; j < t.length; j++) {
                if (t[j].imageX == -1) continue;
                this.ctx.drawImage(
                    this.image,
                    t[j].imageX,
                    t[j].imageY,
                    this.imageSquareSize,
                    this.imageSquareSize,
                    j * this.size,
                    i * this.size,
                    this.size,
                    this.size
                );
            }
        }
    };

    drawNextShape() {
        this.nctx.fillStyle = "#bca0dc";
        this.nctx.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
        for (let i = 0; i < this.nextShape.template.length; i++) {
            for (let j = 0; j < this.nextShape.template.length; j++) {
                if (this.nextShape.template[i][j] == 0) continue;
                this.nctx.drawImage(
                    image,
                    this.nextShape.imageX,
                    this.nextShape.imageY,
                    this.imageSquareSize,
                    this.imageSquareSize,
                    this.size * i,
                    this.size * j + this.size,
                    this.size,
                    this.size
                );
            }
        }
    };

    drawScore() {
        this.sctx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
        this.sctx.font = "64px Poppins";
        this.sctx.fillStyle = "black";
        this.sctx.fillText(this.score, 10, 50);
    };

    drawGameOver() {
        this.ctx.font = "64px Poppins";
        this.ctx.fillStyle = "black";
        this.ctx.fillText("Game Over!", 10, this.canvas.height / 2);
    };

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawSquares();
        this.drawCurrentTetris();
        this.drawNextShape();
        this.drawScore();
        this.drawBackground();
        if (this.gameOver) {
            this.drawGameOver();
        }
    };

    getRandomShape() {
        return Object.create(this.shapes[Math.floor(Math.random() * this.shapes.length)]);
    };
    resetVars() {
        this.initalTwoDArr = [];
        for (let i = 0; i < this.squareCountY; i++) {
            let temp = [];
            for (let j = 0; j < this.squareCountX; j++) {
                temp.push({ imageX: -1, imageY: -1 });
            }
            this.initalTwoDArr.push(temp);
        }
        this.score = 0;
        this.gameOver = false;
        this.currentShape = this.getRandomShape();
        this.nextShape = this.getRandomShape();
        this.gameMap = this.initalTwoDArr;
    };
}



let human = new Tetris();

// human.resetVars();
// human.gameLoop();
console.log(human.gameMap)
setInterval(() => { human.update() }, 1000 / human.gameSpeed);
setInterval(() => { human.draw() }, 1000 / human.framePerSecond);

function resetHumanVars() {
    console.log("Resetting")
    human.resetVars();
}