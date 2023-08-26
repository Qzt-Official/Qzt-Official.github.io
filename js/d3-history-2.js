const width2 = 500;
const height2 = 300;
const padding2 = 50;
var dataset2,
  processedData = [],
  disciplines = [];
var barcanva1 = d3
  .select(".bar-chart")
  .append("svg")
  .attr("width", width2)
  .attr("height", height2);

var barcanva2 = d3
  .select(".bar-chart")
  .append("svg")
  .attr("width", width2)
  .attr("height", height2);

async function Loading() {
  //数据读取与处理
  let dataset_p0 = d3.csv(
    "./data/raw_full(replaced_countries).csv",
    function (d) {
      return {
        Year: parseInt(d.year),
        Discipline: d.discipline,
        Country: d.Country,
        Papers: parseInt(d.Papers),
      };
    }
  );
  dataset2 = await dataset_p0;
  dataset2 = dataset2.filter(function (d) {
    return d.Country == "China" || d.Country == "United States";
  });
  dataset2 = dataset2.filter(function (d) {
    return d.Discipline !== "Unknown";
  });
  var groupedData = d3.group(
    dataset2,
    (d) => d.Country,
    (d) => d.Discipline,
    (d) => d.Year
  );
  groupedData.forEach(function (countryData, country) {
    countryData.forEach(function (disciplineData, discipline) {
      disciplineData.forEach(function (yearData, year) {
        var papers = d3.sum(yearData, function (d) {
          return +d.Papers;
        });
        processedData.push({
          Country: country,
          Discipline: discipline,
          Year: year,
          Papers: papers,
        });
      });
    });
  });
  processedData.forEach(function (data) {
    var totalPapers = d3.sum(
      processedData.filter(function (d) {
        return d.Country === data.Country && d.Year === data.Year;
      }),
      function (d) {
        return d.Papers;
      }
    );

    data.Percentage = data.Papers / totalPapers;
  });
  console.log(processedData);
  //绘图

  var china2017 = processedData.filter(function (d) {
    return d.Country === "China" && d.Year == 2017;
  });
  var usa1973 = processedData.filter(function (d) {
    return d.Country === "United States" && d.Year == 1973;
  });
  var usa2017 = processedData.filter(function (d) {
    return d.Country == "United States" && d.Year == 2017;
  });
  disciplines = [
    "Biology",
    "Biomedical Research",
    "Chemistry",
    "Clinical Medicine",
    "Engineering and Technology",
    "Health",
    "Humanities",
    "Arts",
    "Earth and Space",
    "Mathematics",
    "Physics",
    "Professional Fields",
    "Psychology",
    "Social Sciences",
  ];

  //console.log(disciplines);

  var xScale1 = d3
    .scaleBand(disciplines, [padding2, width2])
    .paddingInner(0.05);
  var yScale1 = d3.scaleLinear().domain([0, 1]).range([0, height2]);
  const formatPercent = d3.format(".1%");

  barcanva1
    .selectAll("rect")
    .data(usa2017)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xScale1(d.Discipline);
    })
    .attr("y", function (d) {
      return height2 - yScale1(d.Percentage);
    })
    .attr("width", xScale1.bandwidth())
    .attr("height", function (d) {
      return yScale1(d.Percentage);
    })
    .attr("fill", "rgba(0, 0, 255,0.7)")
    .append("title")
    .text(function (d) {
      return (
        "This value is " +
        formatPercent(d.Percentage) +
        "\n" +
        "This Discipline is " +
        d.Discipline
      );
    });

  barcanva2
    .selectAll("rect")
    .data(china2017)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xScale1(d.Discipline);
    })
    .attr("y", function (d) {
      return height2 - yScale1(d.Percentage);
    })
    .attr("width", xScale1.bandwidth())
    .attr("height", function (d) {
      return yScale1(d.Percentage);
    })
    .attr("fill", "rgba(255, 0, 0,0.7)")
    .append("title")
    .text(function (d) {
      return (
        "This value is " +
        formatPercent(d.Percentage) +
        "\n" +
        "This Discipline is " +
        d.Discipline
      );
    });

  barcanva1
    .selectAll("text.bar")
    .data(usa2017)
    .enter()
    .append("text")
    .attr("class", "bar")
    .text(function (d) {
      return formatPercent(d.Percentage);
    })
    .attr("text-anchor", "middle")
    .attr("x", function (d) {
      return xScale1(d.Discipline) + xScale1.bandwidth() / 2;
    })
    .attr("y", function (d) {
      if (d.Percentage <= 0.04) {
        return height2 - yScale1(d.Percentage) - 10;
      } else {
        return height2 - yScale1(d.Percentage) + 14;
      }
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", function (d) {
      if (d.Percentage <= 0.04) {
        return "black";
      } else {
        return "white";
      }
    })
    .style("pointer-events", "none");

  barcanva2
    .selectAll("text.bar")
    .data(china2017)
    .enter()
    .append("text")
    .attr("class", "bar")
    .text(function (d) {
      return formatPercent(d.Percentage);
    })
    .attr("text-anchor", "middle")
    .attr("x", function (d) {
      return xScale1(d.Discipline) + xScale1.bandwidth() / 2;
    })
    .attr("y", function (d) {
      if (d.Percentage <= 0.04) {
        return height2 - yScale1(d.Percentage) - 10;
      } else {
        return height2 - yScale1(d.Percentage) + 14;
      }
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", function (d) {
      if (d.Percentage <= 0.04) {
        return "black";
      } else {
        return "white";
      }
    })
    .style("pointer-events", "none");

  barcanva1
    .append("circle")
    .attr("cx", 20)
    .attr("cy", 30)
    .attr("r", 10)
    .attr("fill", "blue");

  barcanva1
    .append("circle")
    .attr("cx", 20)
    .attr("cy", 60)
    .attr("r", 10)
    .attr("fill", "red");

  barcanva1.append("text").attr("x", 50).attr("y", 35).text("United States");
  barcanva1.append("text").attr("x", 50).attr("y", 65).text("China");

  // 创建滑动条
  const yearSlider = document.getElementById("year-slider");
  yearSlider.addEventListener("input", updateChart);
  const yearDisplay = d3
    .select(".tinyView_History2")
    .append("div")
    .attr("class", "year-dispaly");
  yearDisplay.text("Year: " + yearSlider.value);
  function updateChart() {
    const selectedYear = +yearSlider.value;
    yearDisplay.text("Year: " + yearSlider.value);
    var newusa = processedData.filter(function (d) {
      return d.Country === "United States" && d.Year === selectedYear;
    });
    var newchina = processedData.filter(function (d) {
      return d.Country === "China" && d.Year === selectedYear;
    });
    var usarects = barcanva1.selectAll("rect").data(newusa, (d) => d.Year);
    usarects.exit().remove();
    usarects
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return xScale1(d.Discipline);
      })
      .attr("y", function (d) {
        return height2 - yScale1(d.Percentage);
      })
      .attr("width", xScale1.bandwidth())
      .attr("height", function (d) {
        return yScale1(d.Percentage);
      })
      .attr("fill", "rgba(0, 0, 255,0.7)")
      .merge(usarects)
      .attr("x", function (d) {
        return xScale1(d.Discipline);
      })
      .attr("y", function (d) {
        return height2 - yScale1(d.Percentage);
      })
      .attr("width", xScale1.bandwidth())
      .attr("height", function (d) {
        return yScale1(d.Percentage);
      });

    var chinarects = barcanva2.selectAll("rect").data(newchina, (d) => d.Year);
    chinarects.exit().remove();
    chinarects
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return xScale1(d.Discipline);
      })
      .attr("y", function (d) {
        return height2 - yScale1(d.Percentage);
      })
      .attr("width", xScale1.bandwidth())
      .attr("height", function (d) {
        return yScale1(d.Percentage);
      })
      .attr("fill", "rgba(255, 0, 0,0.7)")
      .merge(chinarects)
      .attr("x", function (d) {
        return xScale1(d.Discipline);
      })
      .attr("y", function (d) {
        return height2 - yScale1(d.Percentage);
      })
      .attr("width", xScale1.bandwidth())
      .attr("height", function (d) {
        return yScale1(d.Percentage);
      });

    barcanva1
      .selectAll("text")
      .data(newusa)
      .text(function (d) {
        return formatPercent(d.Percentage);
      })
      .attr("text-anchor", "middle")
      .attr("x", function (d) {
        return xScale1(d.Discipline) + xScale1.bandwidth() / 2;
      })
      .attr("y", function (d) {
        if (d.Percentage <= 0.04) {
          return height2 - yScale1(d.Percentage) - 10;
        } else {
          return height2 - yScale1(d.Percentage) + 14;
        }
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", function (d) {
        if (d.Percentage <= 0.04) {
          return "black";
        } else {
          return "white";
        }
      })
      .style("pointer-events", "none");
    barcanva1.selectAll("text").raise();

    barcanva2
      .selectAll("text")
      .data(newchina)
      .text(function (d) {
        return formatPercent(d.Percentage);
      })
      .attr("text-anchor", "middle")
      .attr("x", function (d) {
        return xScale1(d.Discipline) + xScale1.bandwidth() / 2;
      })
      .attr("y", function (d) {
        if (d.Percentage <= 0.04) {
          return height2 - yScale1(d.Percentage) - 10;
        } else {
          return height2 - yScale1(d.Percentage) + 14;
        }
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", function (d) {
        if (d.Percentage <= 0.04) {
          return "black";
        } else {
          return "white";
        }
      })
      .style("pointer-events", "none");

    label2 = barcanva2.selectAll("text");
    label2
      .text((d) => formatPercent(d.Percentage))
      .style("display", (d) => {
        return d.Percentage === null ||
          d.Percentage === undefined ||
          d.Percentage <= 0.001
          ? "none"
          : "block";
      });

    barcanva2.selectAll("text").raise();

    barcanva1
      .selectAll("rect")
      .append("title")
      .text(function (d) {
        return (
          "This value is " +
          formatPercent(d.Percentage) +
          "\n" +
          "This Discipline is " +
          d.Discipline
        );
      });

    barcanva2
      .selectAll("rect")
      .append("title")
      .text(function (d) {
        return (
          "This value is " +
          formatPercent(d.Percentage) +
          "\n" +
          "This Discipline is " +
          d.Discipline
        );
      });
  }
}
Loading();
