const x = document.getElementById("x");
const y = document.getElementById("y");
//fps 받아오기
let dataset = document.querySelector(".data");

function playVideoTeaserFrom (startTime, endTime) {
  var videoplayer = document.getElementById("yourVideoplayer");  //get your videoplayer

  videoplayer.currentTime = startTime; //not sure if player seeks to seconds or milliseconds
  videoplayer.play();

  //call function to stop player after given intervall
  var stopVideoAfter = (endTime - startTime) * 1000;  //* 1000, because Timer is in ms
  setTimeout(function(){
      videoplayer.pause();
  }, stopVideoAfter);
}

function showPopup(frame_list) {
  // const ul = document.querySelector('#frame-list');
  // for(let i=0; i<frame_list.length; i++) {
  //   let li = document.createElement("li");
  //   const span = document.createElement("span");
  //   span.innerText = i+1;
  //   li.appendChild(span);
  //   ul.appendChild(li);
  // }

  let startTime = frame2time(frame_list[frame_list.length-1][0]);
  let endTime = frame2time(frame_list[frame_list.length-1][frame_list[frame_list.length-1].length-1]);
  
  if(endTime - startTime < 3) {
    endTime = endTime + 1;
    startTime = startTime - 2;
  }

  console.log(startTime,endTime);
  playVideoTeaserFrom(startTime, endTime);
  const popup = document.querySelector('#popup');
    popup.classList.remove('has-filter');
    popup.classList.remove('hide');
}

function frame2time(frame) {
  let time;
  let fps = 15;
  time = frame/fps;
  return time;
}

dataset.addEventListener("change", (event) => {
  let name = event.target.value;
  fetch(`/datasets/${name}`)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      var cy = (window.cy = cytoscape({
        container: document.getElementById("cy"),

        layout: {
          name: "grid",
          rows: `${y.innerText}`,
        },
        userPanningEnabled: false,
        style: [
          {
            selector: "node",
            style: {
              width: (window.innerWidth / x.innerText) * 10,
              height: (window.innerHeight / y.innerText) * 10,

              shape: "square",
              "background-color": "#666",
              // "background-color": function( ele ){ 
              //   if( ele.data('weight') > 40) return "red"; //if edge weight is more than 2, return color red;
              //   else if( ele.data('weight') > 10) return "blue";
              // },
              "background-opacity": "data(opacity)",
            },
          },
        ],

        elements: data,
      }));
      
      function makePopper(ele, weight) {
        let ref = ele.popperRef(); // used only for positioning

        ele.tippy = tippy(ref, {
          // tippy options:
          content: () => {
            let content = document.createElement("div");

            content.innerHTML = weight;

            return content;
          },
          arrow: true,
          trigger: "manual", // probably want manual mode
        });
      }

      cy.ready(function () {
        cy.elements().forEach(function (ele) {
          let weight = ele._private.data.weight;
          makePopper(ele, weight);
        });
      });

      var nodes = cy.nodes().sort(function(a,b){
        return a.data('node_weight') - b.data('node_weight');
      });
      var nodeSlc = nodes.slice(8999,9999);
      nodeSlc.style('background-color', '#E84855').update();

      cy.elements().unbind("mouseover");
      cy.elements().bind("mouseover", (event) => event.target.tippy.show());

      cy.elements().unbind("mouseout");
      cy.elements().bind("mouseout", (event) => event.target.tippy.hide());

      cy.on("tap", "node", function (evt) {
        //동영상 태그 추가
        var node = evt.target;
        console.log("tapped " + node.id());
        console.log(node._private.data.frameid);
        console.log(node._private.data.frameid.length);
        console.log(node._private.data.frameid[0]);
        //최댓값 최솟값
        for(let i = 0; i<node._private.data.frameid.length; i++){
          console.log(node._private.data.frameid[i][0], node._private.data.frameid[i][node._private.data.frameid[i].length-1]);
        }


        //그냥 배열 전체를 보냄    
        showPopup(node._private.data.frameid);
      });
    });
});
