var express = require("express");
var router = express.Router();
var multer = require("multer");

/* GET home page. */

var storage = multer.diskStorage({
  // 2
  destination(req, file, cb) {
    cb(null, "uploadedFiles/"); // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}__${file.originalname}`); // cb 콜백함수를 통해 전송된 파일 이름 설정
  },
});

//기능은 같음
var upload = multer({ dest: "uploadedFiles/" }); //보안성 높음, 관리 어려움
var uploadWithOriginalFilename = multer({ storage: storage }); // 보안성 낮음, 관리 쉬움

router.get("/", function (req, res, next) {
  res.render("index");
});

router.post(
  "/uploadFileWithOriginalFilename",
  uploadWithOriginalFilename.single("attachment"),
  function (req, res) {
    // 5
    res.render("confirmation", { file: req.file, files: null });
  }
);
module.exports = router;
