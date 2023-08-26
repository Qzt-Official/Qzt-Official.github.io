var Width = 1000;
var Height = 600;
var padding = 60;
var dataset = [];
// 初始化数据集和 SVG 元素
var svg = d3
  .select("#content") // 选择 content 容器
  .append("svg") // 在容器内添加 SVG 元素
  .attr("width", Width)
  .attr("height", Height);

var geo_xScale, geo_yScale, rScale;

function initScales() {
  // 初始化比例尺
  geo_xScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataset, function (d) {
        return d[0];
      }),
    ])
    .range([padding, Width - padding * 2]);

  geo_yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataset, function (d) {
        return d[1];
      }),
    ])
    .range([Height - padding, padding]);

  rScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataset, function (d) {
        return d[1];
      }),
    ])
    .range([2, 4]);
}
// 定义函数用于绘制散点图
function show() {
  // 删除之前的散点
  svg.selectAll("circle").remove();
  initScales();
  // 创建 x 轴和 y 轴
  var xAxis = d3.axisBottom().scale(geo_xScale).ticks(7);
  var yAxis = d3.axisLeft().scale(geo_yScale).ticks(6);
  // 移除之前的坐标轴
  svg.selectAll(".axis").remove();
  // 添加新的 x 轴和 y 轴
  svg
    .append("g")
    .attr("class", "axis")
    .attr(
      "transform",
      "translate(" + (padding - 40) + ", " + (Height - padding) + ")"
    ) // 调整 x 轴位置
    .call(xAxis);
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (padding + 20) + ", 0)")
    .call(yAxis);
  // 添加横轴标签
  var xAxisLabel = svg
    .append("text")
    .attr("class", "axis-label")
    .attr("x", Width / 2)
    .attr("y", Height - 10)
    .style("text-anchor", "middle")
    .text("论文数");
  // 添加纵轴标签
  var yAxisLabel = svg
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -Height / 2)
    .attr("y", padding - 40)
    .style("text-anchor", "middle")
    .text("人均GDP数");
  // 添加图表标题
  svg
    .append("text")
    .attr("x", Width / 2 - 120)
    .attr("y", 30)
    .attr("class", "title")
    .text("GDP与论文数散点图");

  // 添加散点
  svg
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return geo_xScale(d[0]) + 20;
    })
    .attr("cy", function (d) {
      return geo_yScale(d[1]);
    })
    .attr("r", function (d) {
      return rScale(d[1]);
    });
}
var ecoyear = 1990;
var ecodata = {};
var gdp = {};

function getCountryYearGDP(country, year) {
  var newArr = gdp.filter(function (ele) {
    return ele.Country == country;
  });
  var a = newArr[0];
  var mygdp = 0;
  try {
    mygdp = a[year];
  } catch (e) {}
  return mygdp;
}
// 使用 Promise 并行加载两个 CSV 文件
Promise.all([d3.csv("./data/GDP.csv"), d3.csv("./data/raw.csv")]).then(
  async ([map, csv]) => {
    gdp = map;

    // 处理数据，数据聚合按 year 和国家 group ,并对 paper 求和
    d3.groups(
      csv,
      (d) => d.year,
      (d) => d.Country
    ).map(([year, countries]) => {
      let arr = [];
      countries.forEach(([name, items]) => {
        var thisgdp = getCountryYearGDP(name, year);
        if (parseInt(thisgdp)) {
          arr.push([d3.sum(items, (v) => +v.Papers), parseInt(thisgdp), name]);
        }
      });
      ecodata[year] = arr;
      // 添加年份选项
      d3.select("#dateselector")
        .append("option")
        .attr("value", year)
        .html(year);
    });

      d3.select('#dateselector').select("option[value='1990']")
      .attr('selected','selected');
    // 监听年份选择
    d3.select("#dateselector").on("change", (e) => {
      let selector = e.target;
      year = selector.options[selector.selectedIndex].value;
      dataset = ecodata[year]; // 更新散点数据

      geo_xScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(dataset, function (d) {
            return d[0];
          }),
        ])
        .range([padding, Width - padding * 2]);

      geo_yScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(dataset, function (d) {
            return d[1];
          }),
        ])
        .range([Height - padding, padding]);

      rScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(dataset, function (d) {
            return d[1];
          }),
        ])
        .range([2, 4]);
      show(); // 调用绘制函数显示更新后的数据
      // 鼠标移动，显示 tooltip
      d3.select("#content")
        .on("mousemove", function (event) {
          var [x, y] = d3.pointer(event);
          var xValue = geo_xScale.invert(x);
          var yValue = geo_yScale.invert(y);

          var nearest = null;
          var minDistance = Number.MAX_VALUE;
          dataset.forEach(function (d) {
            var distance = Math.sqrt(
              (xValue - d[0]) ** 2 + (yValue - d[1]) ** 2
            );
            if (distance < minDistance) {
              nearest = d;
              minDistance = distance;
            }
          });
          var tooltip = d3
            .select(".tooltip")
            .style("left", x + "px")
            .style("top", y + "px")
            .style("display", "block");

          if (nearest) {
            tooltip.html(nearest[2] + "," + nearest[0] + "," + nearest[1]);
          }
        })
        .on("mouseout", function () {
          d3.select(".tooltip").style("display", "none");
        });
    });
  }
);
