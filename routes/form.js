var express = require("express");
const fs = require("fs");
const parse = require("csv-parse");
const { json } = require("express/lib/response");
var router = express.Router();

function makeDataForm(x,y) {
  var width = 1920;
  var height = 1084;
  var xvalue = Math.round((width / x) * 100) / 100;
  var yvalue = Math.round((height / y) * 100) / 100;
  var y1 = 0, y2 = 0, x1 = 0, x2 = 0, prex2 = 0, prey2 = 0;
  var data_form = [];
  var x1_list = [];
  var x2_list = [];
  var y1_list = [];
  var y2_list = []; 

  for (let i = 0; i < y; i++) {
    y1 = 0;
    y2 = 0;
    if (i == 0) {
      y1 = 0;
      y2 = yvalue;
      prey2 = +y2.toFixed(2);
    } else {
      y1 = +(prey2 + 0.01).toFixed(2);
      y2 = +(y1 + yvalue).toFixed(2);
      prey2 = +y2.toFixed(2);
    }
    for (let j = 0; j < x; j++) {
      x1 = 0;
      x2 = 0;

      if (j == 0) {
        x1 = 0;
        x2 = xvalue;
        prex2 = +x2.toFixed(2);
      } else {
        x1 = +(prex2 + 0.01).toFixed(2);
        x2 = +(x1 + xvalue).toFixed(2);
        prex2 = +x2.toFixed(2);
      }
      y1_list.push(y1);
      y2_list.push(y2);

      x1_list.push(x1);
      x2_list.push(x2);
    }
  }

  for (let i = 0; i < x * y; i++) {
    var jsonObj = new Object();
    var jsonData = { id: i + 1, weight: 0 };
    jsonObj.group = "nodes";
    jsonObj.data = jsonData;

    jsonObj.grabbable = false;

    jsonObj.x1 = x1_list[i];
    jsonObj.x2 = x2_list[i];
    jsonObj.y1 = y1_list[i];
    jsonObj.y2 = y2_list[i];
    jsonObj.frameid = [];

    jsonObj = JSON.stringify(jsonObj);
    data_form.push(JSON.parse(jsonObj));
  }
  return data_form;
}

router.post("/", function (req, res) {
  var radio = req.body.vid;
  var x = req.body.gridx;
  var y = req.body.gridy;

  console.log(radio);

  //const filePath = "./csv/f29b1858-7c8a-36ac-b007-a88a9f9c5801_out_.csv";
  const filePath = `./csv/${radio}.csv`;

  var csvData = [];
  var lines = [];

  fs.createReadStream(filePath)
    .pipe(parse.parse({ delimiter: "," }))

    .on("data", function (csvrow) {
      csvData.push(csvrow);
    })

    .on("end", function () {

      let car_data = makeDataForm(x,y);
      let person_data = makeDataForm(x,y);

      let keys = csvData[0];
      for (let i = 0; i < csvData.length; i++) {
        let obj = {};
        for (let j = 0; j < keys.length; j++) {
          obj[keys[j]] = csvData[i][j];
        }
        lines.push(obj);
      }

      let person_list = [];
      let car_list = [];

      let person_x = [];
      let person_y = [];
      let person_score = [];
      let car_x = [];
      let car_y = [];
      let car_score = [];

      let fcar_list = [];
      let fperson_list = [];
      //person x, person y 리스트 만들고 car도 똑같이 만든다.

      //fcar리스트의 length는 x나 y랑 같음
      //해당 되는 index json에 넣음

      for (let i = 1; i < lines.length; i++) {
          let frameId = lines[i]["frame_id"];
          let frame_str = frameId.replaceAll("[", "");
          frame_str = frame_str.replaceAll("]", "");
          frame_str = frame_str.split(", ").map(function (i) {
            return parseInt(i, 10);
          });

          let itraj = lines[i]["itraj"];
          let str = itraj.replaceAll("[", "");
          str = str.replaceAll("]", "");
          str = str.split(", ").map(function (i) {
            return parseInt(i, 10);
          });

          let score = lines[i]["score"];
          let score_str = score.replaceAll("[", "");
          score_str = score_str.replaceAll("]", "");
          score_str = score_str.split(", ").map(function (i) {
            return parseFloat(i);
          });

          if (lines[i]["class_name"] == "person") {
            let list_x = [];
            let list_y = [];
            for(let j = 0; j < str.length; j++){
              if(j % 2 == 0) {
                list_x.push(str[j]);
              }
              else {
                list_y.push(str[j]);
              }
            }
            person_x.push(list_x);
            person_y.push(list_y);
            person_list.push(str);
            person_score.push(score_str);
            fperson_list.push(frame_str);
          } else {
            let list_x = [];
            let list_y = [];
            for(let j = 0; j < str.length; j++){
              if(j % 2 == 0) {
                list_x.push(str[j]);
              }
              else {
                list_y.push(str[j]);
              }
            }
            car_x.push(list_x);
            car_y.push(list_y);
            car_list.push(str);
            car_score.push(score_str);
            fcar_list.push(frame_str);
          }
      }
      
      //console.log(person_x[0]);
      //console.log(car_x[1]);
      //console.log(person_list[0]);
      //console.log(car_list[1]);

      let cnt = 0;
      let data_car_frame = [];
      let car_count = [];
      let person_count = [];
      var fps = 15;

      for (let i = 0; i < car_data.length; i++) {
        let frame_row = [];
        let car_id_frame = [];
        cnt = 0;
        for (let j = 0; j < car_x.length; j++) {
          car_id_frame = [];
          if(car_score[j] > 0.5) {
            for (let k = 0; k < car_x[j].length; k++) {
              if (
                car_x[j][k] >= car_data[i].x1 &&
                car_x[j][k] <= car_data[i].x2 &&
                car_y[j][k] >= car_data[i].y1 &&
                car_y[j][k] <= car_data[i].y2
              ) {
                cnt = cnt + 1 / fps;
                car_id_frame.push(fcar_list[j][k]);
              }
            }
            if(car_id_frame.length != 0){
              frame_row.push(car_id_frame);
            }
          }
        }
        cnt = Math.round(cnt * 100) / 100;
        car_count.push(cnt);
        //if(frame_row.length != 0) {
          data_car_frame.push(frame_row);
        //}
      }

      let data_person_frame = [];
      
      //경계 조사
      for (let i = 0; i < person_data.length; i++) {
        let frame_row = [];
        let person_id_frame = [];
        cnt = 0;
        for (let j = 0; j < person_list.length; j++) {
          person_id_frame = [];
          for (let k = 0; k < person_list[j].length; k++) {
            if (
              person_x[j][k] >= person_data[i].x1 &&
              person_x[j][k] <= person_data[i].x2 &&
              person_y[j][k] >= person_data[i].y1 &&
              person_y[j][k] <= person_data[i].y2
            ) {
              cnt = cnt + 1 / fps;
              person_id_frame.push(fperson_list[j][k]);
            }
          }
          if(person_id_frame.length != 0){
            frame_row.push(person_id_frame);
          }
        }
        cnt = Math.round(cnt * 100) / 100;
        person_count.push(cnt);
        //if(frame_row.length !== 0) {
          data_person_frame.push(frame_row);
        //}
      }
      console.log(car_data.length);
      console.log(data_car_frame.length);

      for (let i = 0; i < car_count.length; i++) {
        let opacity = 0;
        if (car_count[i] > 1) opacity = 1;
        else opacity = car_count[i];
        car_data[i].data = {
          id: i + 1,
          weight: car_count[i],
          opacity: opacity,
          frameid: data_car_frame[i]
        };
      }

      for (let i = 0; i < person_count.length; i++) {
        let opacity = 0;
        if (person_count[i] > 1) opacity = 1;
        else opacity = person_count[i];
        person_data[i].data = {
          id: i + 1,
          weight: person_count[i],
          opacity: opacity,
          frameid: data_person_frame[i]
        };
      }

      const carJSON = JSON.stringify(car_data);
      const personJSON = JSON.stringify(person_data);

      fs.writeFileSync("./public/datasets/person.json", personJSON);
      fs.writeFileSync("./public/datasets/car.json", carJSON);

      res.render("form", { x: x, y: y });
    });
});

module.exports = router;