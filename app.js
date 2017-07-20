function App() {
  const FOODS = [];
  const DATA = [
    { name: 'chocolate ice-cream',
      sugars: 17,
    },
    { name: 'cupcake',
      sugars: 25,
    },
  ];

  function Food(params) {
    this.name = params.name;
    this.ndbno = params.ndbno;
    this.sugars = {
      value: params.sugars.value,
      unitOfMeasure: params.sugars.unitOfMeasure,
    };
    this.servingSize = params.servingSize;
    this.imgURL = params.imgURL || null;
  }

  function clearPrevSearch() {
    FOODS.splice(0);
    $('#results').empty();
  }

  function nutrientRequest(foodID) {
    return $.get('https://api.nal.usda.gov/ndb/nutrients/?', {
      api_key: 'XM57A3PgIUrZfDaDxBgSB0Fba56m8jPUO5vbYT5w',
      ndbno: foodID,
      nutrients: '269',
      format: 'json',
    });
  }

  function renderGraph(food, index) {
    const testData = [30, 40, 50];
    const width = 200;
    const barHeight = 20;

    const scale = d3.scale.linear().domain([0, d3.max(testData)]).range([0, width]);

    const chart = d3.select(`.result-graph-${index}`).attr('width', width).attr('height', barHeight * testData.length);

    const bar = chart.selectAll('g').data(testData).enter().append('g')
      .attr('transform',(d, i) => { return `translate(0,${i * barHeight})`; });

    bar.append('rect').attr('width', scale).attr('height', barHeight - 1);

     bar.append("text")
      .attr("x", (d) => { return scale(d) - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text( (d) => { return d; });
  }

  function render() {
    FOODS.forEach((food, index) => {
      const $wrapper = $('<div>').addClass('result-wrapper');
      $('<img>').addClass('result-col food-img')
        .attr('src', 'http://www.cheerios.com/~/media/17EE88F6F39C45E787CE2E1186260B94.ashx').appendTo($wrapper);

      const $textbox = $('<div>').addClass('result-col result-textbox').appendTo($wrapper);
      $('<h3>').text(food.name).appendTo($textbox);
      $('<h4>').text(`${food.sugars.value}${food.sugars.unitOfMeasure} of sugar per serving`).appendTo($textbox);

      const $graphbox = $('<div>').addClass(`result-col`).appendTo($wrapper);
			$('<svg>').addClass(`chart result-graph-${index}`).appendTo($graphbox);
      $('#results').append($wrapper);
       renderGraph(food, index);

    });
  }



  $('#searchForm').on('submit', (event) => {
    // prevent page from reloading
    event.preventDefault();

    // clear previous search
    clearPrevSearch();

    // search request
    $.get(
      'https://api.nal.usda.gov/ndb/search/?',
      $('#searchForm').serialize(),
    )
    .done((data) => {
      const requestResults = data.list.item.map(result => nutrientRequest(result.ndbno));

      $.when.apply($, requestResults).done((...args) => {
        [].slice.call(args).forEach((item) => {
          FOODS.push(new Food({
            name: item[0].report.foods[0].name,
            ndbno: item[0].report.foods[0].ndbno,
            sugars: {
              value: item[0].report.foods[0].nutrients[0].value,
              unitOfMeasure: item[0].report.foods[0].nutrients[0].unit,
            },
            servingSize: item[0].report.foods[0].measure,
          }));
        });

        render();
      });
    });
  });
}

$(App);
