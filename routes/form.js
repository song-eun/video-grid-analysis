var express = require("express");
const fs = require("fs");
const parse = require("csv-parse");
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

      for (let i = 1; i < lines.length; i++) {
        if(lines[i]["itraj"]){
          let itraj = lines[i]["itraj"];
          let str = itraj.replaceAll("[", "");
          str = str.replaceAll("]", "");
          str = str.split(", ").map(function (i) {
            return parseInt(i, 10);
          });
          if (lines[i]["class_name"] == "person") {
            person_list.push(str);
          } else {
            car_list.push(str);
          }
        }
        else {
          let x = lines[i]["x"];
          let y = lines[i]["y"];
          let x_y = [];
          x = parseInt(x);
          y = parseInt(y);
          x_y.push(x);
          x_y.push(y);
          if (lines[i]["object_class"] == "person") {
            person_list.push(x_y);
          } else if(lines[i]["object_class"] == "car"){
            car_list.push(x_y);
          }
        }
      }
      
      let cnt = 0;

      let car_count = [];
      let person_count = [];
      var fps = 15;

      for (let i = 0; i < car_data.length; i++) {
        cnt = 0;
        for (let j = 0; j < car_list.length; j++) {
          for (let k = 0; k < car_list[j].length; k++) {
            if (
              car_list[j][k] >= car_data[i].x1 &&
              car_list[j][k] <= car_data[i].x2 &&
              car_list[j][k + 1] >= car_data[i].y1 &&
              car_list[j][k + 1] <= car_data[i].y2
            ) {
              cnt = cnt + 1 / fps;
            }
            k++;
          }
        }
        cnt = Math.round(cnt * 100) / 100;
        car_count.push(cnt);
      }

      for (let i = 0; i < person_data.length; i++) {
        cnt = 0;
        for (let j = 0; j < person_list.length; j++) {
          for (let k = 0; k < person_list[j].length; k++) {
            if (
              person_list[j][k] >= person_data[i].x1 &&
              person_list[j][k] <= person_data[i].x2 &&
              person_list[j][k + 1] >= person_data[i].y1 &&
              person_list[j][k + 1] <= person_data[i].y2
            ) {
              cnt = cnt + 1 / fps;
            }
            k++;
          }
        }
        cnt = Math.round(cnt * 100) / 100;
        person_count.push(cnt);
      }

      for (let i = 0; i < car_count.length; i++) {
        let opacity = 0;
        if (car_count[i] > 1) opacity = 1;
        else opacity = car_count[i];
        car_data[i].data = {
          id: i + 1,
          weight: car_count[i],
          opacity: opacity,
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