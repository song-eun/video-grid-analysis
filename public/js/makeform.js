const x = document.getElementById("x");
const y = document.getElementById("y");
let dataset = document.querySelector(".data");

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

      cy.elements().unbind("mouseover");
      cy.elements().bind("mouseover", (event) => event.target.tippy.show());

      cy.elements().unbind("mouseout");
      cy.elements().bind("mouseout", (event) => event.target.tippy.hide());

      cy.on("tap", "node", function (evt) {
        var node = evt.target;
        console.log("tapped " + node.id());
      });
    });
});
