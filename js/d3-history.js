var w = 800;
var h = 600;
var padding = 60;
var ticks = 10;

var dataset = [],
  p_data,
  xScale,
  yScale,
  xAxis,
  yAxis,
  line;
var TotalPapers = [];
var Countries_Papers;
var formatTime = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");
var canvas = d3.select(".svg_History1"); //图表画布

async function loadCSVData() {
  let dataset_p = d3.csv(
    "./data/raw_full(replaced_countries).csv",
    function (d) {
      return {
        Year: parseDate(d.year),
        Discipline: d.discipline,
        Specialty: d.specialty,
        Country: d.Country,
        Papers: parseInt(d.Papers),
      };
    }
  );
  //异步操作,需要用await处理Promise,下同
  dataset = await dataset_p;

  let p_data_tem = d3.csv("./data/prepared_data.csv");

  p_data = await p_data_tem;
  //console.log(p_data);

  p_data = p_data.map((v) =>
    Object.keys(v).map((c) => (Number(v[c]) ? Number(v[c]) : v[c]))
  ); //加载预处理数据，加快绘图速度

  for (var i = 1973; i <= 2017; i++) {
    //利用循环体录入1973-2017论文数总和
    var temobj = { Year: parseDate(i) };
    var temarr = dataset.slice(456000); //"ALL COUNTRIES"仅在此后出现
    temobj["Papers"] = d3.sum(
      temarr.filter(
        (d) => formatTime(d.Year) == String(i) && d.Country == "ALL COUNTRIES"
      ),
      (d) => d.Papers
    ); //筛选，求和
    TotalPapers.push(temobj);
  }

  geo_xScale = d3
    .scaleTime()
    .domain([
      d3.min(TotalPapers, (d) => d.Year),
      d3.max(TotalPapers, (d) => d.Year),
    ])
    .range([padding, w]);

  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(TotalPapers, (d) => d.Papers)])
    .range([h - padding, padding]);

  xAxis = d3.axisBottom(geo_xScale).ticks(ticks).tickFormat(formatTime);

  yAxis = d3.axisLeft(yScale).ticks(ticks);

  line = d3
    .line()
    .defined(function (d) {
      return d.Papers >= 1;
    })
    .x((d) => geo_xScale(d.Year))
    .y((d) => yScale(d.Papers));

  canvas
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

  canvas
    .append("g")
    .attr("class", "yAxis")
    .attr("transform", "translate(" + padding * 1 + ",0)")
    .call(yAxis);

  var color_count = 0;
  var line_color = d3.schemeCategory10;

  function Generate_Line_by_Country(c) {
    //给出国家名绘制条形图的方法
    var temD = [];

    let r = p_data.filter((d) => d[45] == c);
    let r0 = r[0];
    for (var i = 1973; i <= 2017; i++) {
      let tobj = { Year: parseDate(i) };
      tobj["Papers"] = r0[i - 1973];
      temD.push(tobj);
    }

    canvas
      .append("path")
      .datum(temD)
      .attr("class", `line`)
      .attr("id", `${c}`)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", line_color[color_count])
      .style("pointer-events", "none");

    toolTip = d3.select("body").append("div").attr("class", "toolTip");

    canvas
      .selectAll(`circle.${c}`)
      .data(temD)
      .enter()
      .append("circle")
      .attr("class", `${c}`)
      .attr("id", "datapoint")
      .attr("cx", function (d) {
        return geo_xScale(d.Year);
      })
      .attr("cy", function (d) {
        return yScale(d.Papers);
      })
      .attr("r", 4)
      .attr("fill", line_color[color_count])
      .on("mousemove", nodeMouseOver)
      .on("mouseleave", nodeMouseOut);

    function nodeMouseOver(event, d) {
      // 创建标识并更新其位置
      toolTip
        .style("left", event.pageX + 18 + "px")
        .style("top", event.pageY + 18 + "px")
        .style("display", "block")
        .html(`Papers:<strong>${d.Papers}</strong>`);

      //让光标变个样
      d3.select(event.target).style("cursor", "pointer");

      //突出显示被选择的圆
      d3.select(event.target).attr("r", 6);
    }

    function nodeMouseOut(event, d) {
      //鼠标移出时隐藏标识
      toolTip.style("display", "none"); // Hide toolTip

      //把光标变回来
      d3.select(event.target).style("cursor", "default");

      //让圆圈恢复原样
      d3.select(event.target).transition().attr("r", 4);
    }

    canvas
      .selectAll(`text.label${c}`)
      .data(temD)
      .join("text")
      .attr("class", function (d) {
        if (formatTime(d.Year) != 2017) {
          return "willbedeleted"; //为不符要求的元素添加特殊标签以便后续删除
        } else {
          return `label${c}`;
        }
      })
      .attr("id", "linelabel")
      .attr("x", function (d) {
        if (c == "ALL COUNTRIES") {
          return w - padding * 2.3; //标签太长了
        } else {
          return w - padding - c.length * 3;
        }
      })
      .attr("y", function (d) {
        if (c == "United Kingdom") {
          return yScale(d.Papers + 30000); //UK的标签略显靠下，人为将其升高一点
        } else {
          return yScale(d.Papers + 10000);
        }
      })
      .style("fill", function (d) {
        if (formatTime(d.Year) != "2017") {
          return "none";
        } else {
          return line_color[color_count];
        }
      })
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .text(c);

    canvas.selectAll("text.willbedeleted").remove(); //删除不符要求的svg文本元素

    color_count = color_count + 1;
    color_count = color_count % 10;

    return null;
  }

  Generate_Line_by_Country("United States");
  Generate_Line_by_Country("China");
  Generate_Line_by_Country("Germany");
  Generate_Line_by_Country("United Kingdom");
  Generate_Line_by_Country("ALL COUNTRIES");

  var Buttonlist = [
    "ChinaButton",
    "USButton",
    "UKButton",
    "GermanyButton",
    "AllButton",
  ];
  var Countrylist = [
    "China",
    "United States",
    "United Kingdom",
    "Germany",
    "ALL COUNTRIES",
  ];

  for (var i = 0; i <= 4; i++) {
    (function (index) {
      d3.select(`#${Buttonlist[index]}`).on("click", function () {
        ShowHideLine(Countrylist[index]);
        UpdateAxis();
        UpdateLines();
      });
    })(i);
  }

  function ShowHideLine(country) {
    countryclass = country.replace(/\s/g, ".");
    countryid = country.replace(/\s/g, "\\ ");

    if (canvas.select(`path#${countryid}`).style("visibility") == "visible") {
      canvas.select(`path#${countryid}`).style("visibility", "hidden");
      canvas.selectAll(`circle.${countryclass}`).style("visibility", "hidden");
      canvas.select(`text.label${countryclass}`).style("visibility", "hidden");
    } else {
      canvas.select(`path#${countryid}`).style("visibility", "visible");
      canvas.selectAll(`circle.${countryclass}`).style("visibility", "visible");
      canvas.select(`text.label${countryclass}`).style("visibility", "visible");
    }
  }
  function UpdateAxis() {
    //选择所有圆
    var selectedcircle = canvas.selectAll("circle");
    var visiblecircles = selectedcircle.filter(function () {
      return d3.select(this).style("visibility") != "hidden";
    });
    var data0 = visiblecircles.data();
    var maxdata = d3.max(data0, function (d) {
      return d.Papers;
    });
    //console.log(maxdata);
    yScale = d3
      .scaleLinear()
      .domain([0, maxdata])
      .range([h - padding, padding]);

    yAxis = d3.axisLeft(yScale).ticks(ticks);

    canvas.select(".yAxis").transition().duration(300).call(yAxis);
  }
  function UpdateLines() {
    // 获取所有可见的折线图
    var visibleLines = canvas.selectAll("path.line").filter(function () {
      return d3.select(this).style("display") !== "none";
    });
    //获取所有可见的圆
    var visiblecircles = canvas.selectAll("circle").filter(function () {
      return d3.select(this).style("visibility") != "hidden";
    });
    //获取所有可见文字标签
    var visibletexts = canvas.selectAll("text#linelabel").filter(function () {
      return d3.select(this).style("visibility") != "hidden";
    });
    var duration = 500; // 过渡持续时间
    visibleLines.each(function () {
      var line1 = d3.select(this);
      // 获取当前折线的数据
      var data = line1.datum(); // 获取折线的数据
      // 更新折线的路径
      line1
        .transition()
        .duration(duration)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return geo_xScale(d.Year);
            })
            .y(function (d) {
              return yScale(d.Papers);
            })
        );
    });
    //更新数据点
    visiblecircles.each(function () {
      var cir = d3.select(this);
      var data0 = cir.data();
      cir
        .transition()
        .delay(50)
        .duration(duration)
        .attr("cx", function (d) {
          return geo_xScale(d.Year);
        })
        .attr("cy", function (d) {
          return yScale(d.Papers);
        });
    });
    //更新文字标签
    visibletexts.each(function () {
      var text1 = d3.select(this);
      var data1 = text1.data();
      text1
        .transition()
        .duration(duration)
        .attr("y", function (d) {
          return yScale(d.Papers);
        });
    });
  }
  var mouseX, mouseY;
  // 绘制数值线
  const valueLine = canvas
    .append("line")
    .attr("class", "value-line")
    .attr("y1", 0)
    .attr("y2", h)
    .style("stroke", "lightgray")
    .style("opacity", 0.6)
    .style("stroke-width", 2.5)
    .style('pointer-events','none');
  function handleMouseMove(event) {
    // 获取鼠标位置
    var mousePosition = d3.pointer(event);
    mouseX = mousePosition[0];
    mouseY = mousePosition[1];
    valueLine.attr("x1", mouseX).attr("x2", mouseX).style("opacity", 0.6);
  }
  canvas.on('mousemove',handleMouseMove);
}

loadCSVData();
