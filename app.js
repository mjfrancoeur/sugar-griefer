function App() {
  const FOODS = [];
  const DATA = [ new Food( {name: 'chocolate ice-cream', sugars: { value: 17, unitOfMeasure: 'g' }}), new Food( {name: 'cupcake', sugars: { value: 25, unitOfMeasure: 'g' }, }) ];

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
    const currentData = DATA.slice(0);
    currentData.unshift(food);

    const dataVals = currentData.map( (obj) => {
      return {name: obj.name, value: obj.sugars.value};
    });

    const testData = [30, 40, 50];
    const width = 200;
    const barHeight = 20;

    const scale = d3.scale.linear().domain([0, d3.max(dataVals, function(d) { return d.value; })]).range([0, width]);

    const chart = d3.select(`.result-graph-${index}`).attr('width', width).attr('height', barHeight * dataVals.length);

    const bar = chart.selectAll('g').data(dataVals).enter().append('g')
      .attr('transform',(d, i) => { return `translate(0,${i * barHeight})`; });

    bar.append('rect').attr('width', function(d) { return scale(d.value); }).attr('height', barHeight - 1);

     bar.append("text")
      .attr("x", (d) => { return scale(d.value) - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text( (d) => { return `${d.name}: ${d.value}g`; });
  }

  function render() {
    FOODS.forEach((food, index) => {
      const $wrapper = $('<div>').addClass('result-wrapper');
      $('<img>').addClass('result-col food-img')
        .attr('src', 'http://www.cheerios.com/~/media/17EE88F6F39C45E787CE2E1186260B94.ashx').appendTo($wrapper);

      const $textbox = $('<div>').addClass('result-col result-textbox').appendTo($wrapper);
      $('<h3>').text(food.name).appendTo($textbox);
      $('<h4>').text(`${food.sugars.value}${food.sugars.unitOfMeasure} of sugar per serving`).appendTo($textbox);

      const $graphbox = $('<div>').addClass(`result-col result-graph`).appendTo($wrapper);
			d3.select($graphbox[0]).append('svg').attr("class", `chart result-graph-${index}`);
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
          if (item[0].report.foods.length > 0) {
            let name = item[0].report.foods[0].name;
            name = name.replace(/(,\s)?UPC:\s\d+(,\s)?/, '')
              .replace(/Cereals\sready-to-eat,\s/, '')
              .replace(/(,\s)?GTIN:\s\d+(,\s)?/, '');
            let sugarVal = item[0].report.foods[0].nutrients[0].value;
            // remove empty decimals
            sugarVal = sugarVal.replace(/\.00$/, '');

            FOODS.push(new Food({
              name: name,
              ndbno: item[0].report.foods[0].ndbno,
              sugars: {
                value: sugarVal,
                unitOfMeasure: item[0].report.foods[0].nutrients[0].unit,
              },
              servingSize: item[0].report.foods[0].measure,
            }));
          }
        });

        render();
      });
    });
  });
}

$(App);
