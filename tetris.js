class Tetromino {
    constructor(imageX, imageY, template, context) {
        this.ctx = context;
        this.imageY = imageY;
        this.imageX = imageX;
        this.template = template;
        this.x = this.ctx.squareCountX / 2;
        this.y = 0;
    }

    checkBottom() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template.length; j++) {
                if (this.template[i][j] == 0) continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if (realY + 1 >= this.ctx.squareCountY) {
                    return false;
                }
                if (this.ctx.gameMap[realY + 1][realX].imageX != -1) {
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

                if (this.ctx.gameMap[realY][realX - 1].imageX != -1) return false;
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
                if (realX + 1 >= this.ctx.squareCountX) {
                    return false;
                }

                if (this.ctx.gameMap[realY][realX + 1].imageX != -1) return false;
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
                    realX >= this.squareCountX ||
                    realY < 0 ||
                    realY >= this.squareCountY
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
        this.gameSpeed = 5;
        this.canvas = document.getElementById("canvas" + (canvasNumber == undefined ? "" : canvasNumber));
        this.nextShapeCanvas = document.getElementById("nextShapeCanvas" + (canvasNumber == undefined ? "" : canvasNumber));
        this.scoreCanvas = document.getElementById("scoreCanvas" + (canvasNumber == undefined ? "" : canvasNumber));
        this.image = document.getElementById("image" + (canvasNumber == undefined ? "" : canvasNumber));
        this.ctx = this.canvas.getContext("2d");
        this.nctx = this.nextShapeCanvas.getContext("2d");
        this.sctx = this.scoreCanvas.getContext("2d");
        this.squareCountX = this.canvas.width / this.size;
        this.squareCountY = this.canvas.height / this.size;

        this.whiteLineThickness = 4;

        window.addEventListener("keydown", (event) => {
            if (event.keyCode == 37) this.currentShape.moveLeft();
            else if (event.keyCode == 38) this.currentShape.changeRotation();
            else if (event.keyCode == 39) this.currentShape.moveRight();
            else if (event.keyCode == 40) this.currentShape.moveBottom();
        });
    }

    addShapes(context) {
        this.shapes = [
            new Tetromino(0, 120, [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0],
            ], context),
            new Tetromino(0, 96, [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ], context),
            new Tetromino(0, 72, [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1],
            ], context),
            new Tetromino(0, 48, [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0],
            ], context),
            new Tetromino(0, 24, [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
            ], context),
            new Tetromino(0, 0, [
                [1, 1],
                [1, 1],
            ], context),

            new Tetromino(0, 48, [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1],
            ], context),
        ];
    }

    gameLoop(context) {
        setInterval(() => { this.update(context) }, 1000 / this.gameSpeed);
        setInterval(() => { this.draw(context) }, 1000 / this.framePerSecond);
    };

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

    update(context) {
        if (context.gameOver) return;
        if (context.currentShape.checkBottom()) {
            context.currentShape.y += 1;
        } else {
            for (let k = 0; k < context.currentShape.template.length; k++) {
                for (let l = 0; l < context.currentShape.template.length; l++) {
                    if (context.currentShape.template[k][l] == 0) continue;
                    context.gameMap[context.currentShape.getTruncedPosition().y + l][
                        context.currentShape.getTruncedPosition().x + k
                    ] = { imageX: context.currentShape.imageX, imageY: context.currentShape.imageY };
                }
            }

            context.deleteCompleteRows();
            context.currentShape = this.nextShape;
            context.nextShape = this.getRandomShape();
            if (!context.currentShape.checkBottom()) {
                context.gameOver = true;
            }
            context.score += 100;
        }
    };

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    };

    drawBackground() {
        console.log(this)
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

    drawCurrentTetris(context) {
        for (let i = 0; i < context.currentShape.template.length; i++) {
            for (let j = 0; j < context.currentShape.template.length; j++) {
                if (context.currentShape.template[i][j] == 0) continue;
                context.ctx.drawImage(
                    image,
                    context.currentShape.imageX,
                    context.currentShape.imageY,
                    context.imageSquareSize,
                    context.imageSquareSize,
                    Math.trunc(context.currentShape.x) * context.size + context.size * i,
                    Math.trunc(context.currentShape.y) * context.size + context.size * j,
                    context.size,
                    context.size,
                );
            }
        }
    };

    drawSquares(context) {
        for (let i = 0; i < context.gameMap.length; i++) {
            let t = context.gameMap[i];
            for (let j = 0; j < t.length; j++) {
                if (t[j].imageX == -1) continue;
                context.ctx.drawImage(
                    image,
                    t[j].imageX,
                    t[j].imageY,
                    context.imageSquareSize,
                    context.imageSquareSize,
                    j * context.size,
                    i * context.size,
                    context.size,
                    context.size
                );
            }
        }
    };

    drawNextShape(context) {
        context.nctx.fillStyle = "#bca0dc";
        context.nctx.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
        for (let i = 0; i < context.nextShape.template.length; i++) {
            for (let j = 0; j < context.nextShape.template.length; j++) {
                if (context.nextShape.template[i][j] == 0) continue;
                context.nctx.drawImage(
                    image,
                    context.nextShape.imageY,
                    context.imageSquareSize,
                    context.imageSquareSize,
                    context.nextShape.imageX,
                    context.size * i,
                    context.size * j + this.size,
                    context.size,
                    context.size
                );
            }
        }
    };

    drawScore(context) {
        context.sctx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
        context.sctx.font = "64px Poppins";
        context.sctx.fillStyle = "black";
        context.sctx.fillText(this.score, 10, 50);
    };

    drawGameOver(context) {
        context.ctx.font = "64px Poppins";
        context.ctx.fillStyle = "black";
        context.ctx.fillText("Game Over!", 10, this.canvas.height / 2);
    };

    draw(context) {
        console.log("A" + context)
        context.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.drawSquares(context);
        context.drawCurrentTetris(context);
        context.drawNextShape(context);
        context.drawScore(context);
        // context.drawBackground();
        if (context.gameOver) {
            context.drawGameOver(context);
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

human.resetVars();
human.addShapes(human);
human.drawBackground();
human.gameLoop(human);