const width = 800;
const height = 560;
const svg = d3.select(".svg_Geography");

// projection 地图投影
const projection = d3
  .geoMercator()
  .center([0, 0])
  .scale(110)
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
let year = 1973;
let data = {};
// 加载数据
Promise.all([
  d3.json("./data/world_countries.json"),
  d3.csv("./data/raw_full.csv"),
]).then(async ([map, csv]) => {
  // 数据聚合 按year 和 国家group,并对paper求和
  d3.groups(
    csv,
    (d) => d.year,
    (d) => d.Country
  ).map(([year, counrties]) => {
    let arr = [];
    counrties.forEach(([name, items]) => {
      arr.push([name, d3.sum(items, (v) => +v.Papers)]);
    });
    data[year] = arr;
    d3.select(".date_selector").append("option").attr("value", year).html(year);
  });
  // selector 监听事件
  d3.select(".date_selector").on("change", (e) => {
    let selector = e.target;
    year = selector.options[selector.selectedIndex].value;
    updateMap();
  });
  // 初始化地图
  svg
    .append("g")
    .attr("id", "map")
    .selectAll("path")
    .data(map.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("fill", "white")
    .attr("style", "cursor:pointer")
    .on("mousemove", (e, d) => {
      // 鼠标hover
      let t = data[year].find((v) => v[0] == d.properties.name);
      d3
        .select(".GeoToolTip")
        .style("display", "block")
        .style("left", e.offsetX + 10 + "px")
        .style("top", e.offsetY + 10 + "px").html(`
                    Country or Region: ${d.properties.name}
                    <br />
                    Paper: ${t ? t[1] : "no data"}
                `);
    })
    .on("mouseout", function () {
      d3.select(".GeoToolTip").style("display", "none");
    });
  updateMap();
});
// 更新地图
function updateMap() {
  let selectedData = data[year];
  let maxValue = d3.max(selectedData, (d) => d[1]);

  let mapColor = d3.interpolate("rgb(255,255,204)", "#fc5a60");
  svg
    .select("#map")
    .selectAll("path")
    .attr("fill", (d) => {
      let t = selectedData.find((v) => v[0] == d.properties.name);
      if (t) {
        let quad = 1-(Math.pow(t[1]-maxValue,2)/Math.pow(maxValue-1,2));
        return mapColor(quad);
      }
      return "white";
    });
}
