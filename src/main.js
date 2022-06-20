
// 描画用の三角形
class Triangle {
    constructor(_v0, _v1, _v2) {
        this.verts = [_v0, _v1, _v2];
    }

    // ワイヤーフレームを描画
    drawWireFrame() {
        gl.beginPath();
        gl.moveTo(this.verts[0][0], this.verts[0][1]);
        gl.lineTo(this.verts[1][0], this.verts[1][1]);
        gl.lineTo(this.verts[2][0], this.verts[2][1]);
        gl.closePath();
        gl.stroke();
    }

    // 三角形の表裏を求める
    isFlipped() {
        const center = this.getCenter();
        const angle1 = Math.atan2(this.verts[0][1] - center[1], this.verts[0][0] - center[0]);
        const angle2 = Math.atan2(this.verts[1][1] - center[1], this.verts[1][0] - center[0]);
        const dif = angle2 - angle1;
        if (((dif >= 0) && (dif < Math.PI)) || (dif < -Math.PI)) {
            return false;
        }
        else {
            return true;
        }
    }

    // 重心を求める
    getCenter() {
        const x = (this.verts[0][0] + this.verts[1][0] + this.verts[2][0]) / 3.0;
        const y = (this.verts[0][1] + this.verts[1][1] + this.verts[2][1]) / 3.0;
        return [x, y];
    }
}

// 頂点
class Vertex {
    constructor(_x, _y, _z) {
        this.pos = [_x, _y, _z, 1]
    }
}

// 面
class Face {
    constructor(_v0, _v1, _v2) {
        this.verts = [_v0, _v1, _v2];
    }
}

// トランスフォーム
class Transform {
    constructor() {
        this.pos = [0.0, 0.0, 0.0];
        this.rot = [0.0, 0.0, 0.0];
        this.scl = [1.0, 1.0, 1.0];
    }

    // 平行移動
    translate(_x, _y, _z) {
        this.pos[0] += _x;
        this.pos[1] += _y;
        this.pos[2] += _z;
    }

    // 回転
    rotate(_x, _y, _z) {
        this.rot[0] += _x;
        this.rot[1] += _y;
        this.rot[2] += _z;
    }

    // 拡大縮小
    resize(_x, _y, _z) {
        this.scl = [_x, _y, _z];
    }

    // 平行移動行列
    translateMat(_reverse = false) {
        if (_reverse) {
            return [
                1, 0, 0, -this.pos[0],
                0, 1, 0, -this.pos[1],
                0, 0, 1, -this.pos[2],
                0, 0, 0, 1
            ];
        }
        else {
            return [
                1, 0, 0, this.pos[0],
                0, 1, 0, this.pos[1],
                0, 0, 1, this.pos[2],
                0, 0, 0, 1
            ];
        }
    }
    
    // 回転行列
    rotateMat(_axis, _reverse = false) {

        // X軸
        if (_axis === 0) {
            const rad = this.rot[0] * Math.PI / 180;
            const c = Math.cos(rad);
            const s = Math.sin(rad);
            if (_reverse) {
                return [
                    1,  0,  0,  0,
                    0,  c,  s,  0,
                    0,  -s, c,  0,
                    0,  0,  0,  1
                ];
            }
            else {
                return [
                    1,  0,  0,  0,
                    0,  c,  -s, 0,
                    0,  s,  c,  0,
                    0,  0,  0,  1
                ];
            }
        }

        // Y軸
        if (_axis === 1) {
            const rad = this.rot[1] * Math.PI / 180;
            const c = Math.cos(rad);
            const s = Math.sin(rad);
            if (_reverse) {
                return [
                    c,  0,  -s, 0,
                    0,  1,  0,  0,
                    s,  0,  c,  0,
                    0,  0,  0,  1
                ];
            }
            else {
                return [
                    c,  0,  s,  0,
                    0,  1,  0,  0,
                    -s, 0,  c,  0,
                    0,  0,  0,  1
                ];
            }
        }

        // Z軸
        if (_axis === 2) {
            const rad = this.rot[2] * Math.PI / 180;
            const c = Math.cos(rad);
            const s = Math.sin(rad);
            if (_reverse) {
                return [
                    c,  s,  0,  0,
                    -s, c,  0,  0,
                    0,  0,  1,  0,
                    0,  0,  0,  1
                ];
            }
            else {
                return [
                    c,  -s, 0,  0,
                    s,  c,  0,  0,
                    0,  0,  1,  0,
                    0,  0,  0,  1
                ];
            }
        }
    }

    // 拡大縮小行列
    scaleMat() {
        return [
            this.scl[0], 0,           0,           0,
            0,           this.scl[1], 0,           0,
            0,           0,           this.scl[2], 0,
            0,           0,           0,           1
        ];
    }
}

// モデル
class Model extends Transform {
    constructor() {
        super();
        this.verts = [];
        this.faces = [];
    }

    // 頂点の追加
    addVerts(_x, _y, _z) {
        const v = new Vertex(_x, _y, _z);
        this.verts.push(v);
    }

    // 面の追加
    addFaces(_v0, _v1, _v2) {
        const f = new Face(_v0, _v1, _v2);
        this.faces.push(f);
    }
}

// カメラ
class Camera extends Transform {
    constructor() {
        super();
        this.focalLen = 1;
    }
}

// 変数
var canvas, gl;
var model, camera;
var renderVerts;
var renderTris;

// サイトが読み込まれたときにここが実行される
window.onload = function()
{
    canvas = document.getElementById("gameCanvas");
    gl = canvas.getContext("2d");

    init();
    setInterval("main()", 16);
}

// 読み込み時に一度だけ実行
function init()
{
    createModel();
    createCamera();
    createRenderVerts();
    clearCanvas();
}

// メインループ
function main()
{
    update();
    draw();
}

// 毎フレーム実行
function update()
{
    model.rotate(0.1, 0.5, 0.0);
}

// 描画
function draw()
{
    clearCanvas();
    vertsToWorldSpace();
    vertsToCameraSpace();
    projectVerts();
    faceToTriangle();
    drawTris();
}

// モデルを作成
function createModel()
{
    model = new Model();

    // 頂点を追加
    model.addVerts(-0.5,  0.5,  0.5);
    model.addVerts(-0.5,  0.5, -0.5);
    model.addVerts( 0.5,  0.5, -0.5);
    model.addVerts( 0.5,  0.5,  0.5);
    model.addVerts(-0.5, -0.5,  0.5);
    model.addVerts(-0.5, -0.5, -0.5);
    model.addVerts( 0.5, -0.5, -0.5);
    model.addVerts( 0.5, -0.5,  0.5);

    // 面を追加
    model.addFaces(0, 1, 2);
    model.addFaces(0, 2, 3);
    model.addFaces(0, 4, 5);
    model.addFaces(0, 5, 1);
    model.addFaces(1, 5, 6);
    model.addFaces(1, 6, 2);
    model.addFaces(2, 6, 7);
    model.addFaces(2, 7, 3);
    model.addFaces(3, 7, 4);
    model.addFaces(3, 4, 0);
    model.addFaces(4, 6, 5);
    model.addFaces(4, 7, 6);
    
    // 拡大縮小
    model.resize(1.0, 2.0, 1.0);
}

// カメラを作成
function createCamera()
{
    camera = new Camera();
    camera.translate(0.0, 0.0, -5.0);
}

// レンダー用の頂点行列を用意
function createRenderVerts()
{
    renderVerts = [];
    renderVerts.length = model.verts.length;
}

// キャンバスを初期化
function clearCanvas()
{
    gl.fillStyle = 'rgb(160, 160, 160)';
    gl.fillRect(0, 0, canvas.width, canvas.height);
}

// 頂点座標をワールド座標系に変換
function vertsToWorldSpace()
{
    for (i = 0; i < renderVerts.length; i++) {
        renderVerts[i] = model.verts[i].pos;
        renderVerts[i] = multiplyMat(model.scaleMat(),     renderVerts[i]);
        renderVerts[i] = multiplyMat(model.rotateMat(0),   renderVerts[i]);
        renderVerts[i] = multiplyMat(model.rotateMat(1),   renderVerts[i]);
        renderVerts[i] = multiplyMat(model.rotateMat(2),   renderVerts[i]);
        renderVerts[i] = multiplyMat(model.translateMat(), renderVerts[i]);
    }
}

// 頂点座標をカメラの座標系に変換
function vertsToCameraSpace()
{
    for (i = 0; i < renderVerts.length; i++) {
        renderVerts[i] = multiplyMat(camera.translateMat(true), renderVerts[i]);
        renderVerts[i] = multiplyMat(camera.rotateMat(0, true), renderVerts[i]);
        renderVerts[i] = multiplyMat(camera.rotateMat(1, true), renderVerts[i]);
        renderVerts[i] = multiplyMat(camera.rotateMat(2, true), renderVerts[i]);
    }
}

// 頂点をキャンバスに投影
function projectVerts()
{
    for (i = 0; i < renderVerts.length; i++) {
        const t1 = renderVerts[i][0] / renderVerts[i][2];
        const t2 = renderVerts[i][1] / renderVerts[i][2];
        renderVerts[i][0] = t1 * camera.focalLen * canvas.width + canvas.width  / 2;
        renderVerts[i][1] = t2 * camera.focalLen * canvas.width + canvas.height / 2;
    }
}

// 面から三角形を作成
function faceToTriangle()
{
    renderTris = [];
    for (i = 0; i < model.faces.length; i++) {
        const n0 = model.faces[i].verts[0];
        const n1 = model.faces[i].verts[1];
        const n2 = model.faces[i].verts[2];
        const v0 = [renderVerts[n0][0], renderVerts[n0][1]];
        const v1 = [renderVerts[n1][0], renderVerts[n1][1]];
        const v2 = [renderVerts[n2][0], renderVerts[n2][1]];
        renderTris.push(new Triangle(v0, v1, v2));
    }
}

// 三角形を描画
function drawTris()
{
    for (i = 0; i < renderTris.length; i++) {
        if (!renderTris[i].isFlipped()) renderTris[i].drawWireFrame();
    }
}

// 行列の掛け算(4x4, 1x4)
function multiplyMat(_mat1, _mat2)
{
    const a0 = (_mat1[0]  * _mat2[0]) + (_mat1[1]  * _mat2[1]) + (_mat1[2]  * _mat2[2]) + (_mat1[3]  * _mat2[3]);
    const a1 = (_mat1[4]  * _mat2[0]) + (_mat1[5]  * _mat2[1]) + (_mat1[6]  * _mat2[2]) + (_mat1[7]  * _mat2[3]);
    const a2 = (_mat1[8]  * _mat2[0]) + (_mat1[9]  * _mat2[1]) + (_mat1[10] * _mat2[2]) + (_mat1[11] * _mat2[3]);
    const a3 = (_mat1[12] * _mat2[0]) + (_mat1[13] * _mat2[1]) + (_mat1[14] * _mat2[2]) + (_mat1[15] * _mat2[3]);
    return [a0, a1, a2, a3];
}
