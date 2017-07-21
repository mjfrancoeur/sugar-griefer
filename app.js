function App() {
  const FOODS = [];
  const DATA = [ new Food( {displayName: 'Ben & Jerry\'s chocolate ice cream', sugars: { displayValue: 19, unitOfMeasure: 'g' }}), new Food( {displayName: 'Chips Ahoy! cookie', sugars: { displayValue: 11, unitOfMeasure: 'g' }, }) ];

  function Food(params) {
    this.name = params.name;
    this.displayName = params.displayName;
    this.ndbno = params.ndbno;
    this.sugars = {
      value: params.sugars.value,
      displayValue: params.sugars.displayValue,
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

  // function imageRequest(food) {
  //   $.get('http://webservices.amazon.com/onca/xml?', {
  //     Service: 'AWSECommerceService',
  //     Operation: 'ItemSearch',
  //     AWSAccessKeyId: 'AKIAJFL4RV5A6J5GPMDA',
  //     AssociateTag= 'cereality-20',
  //     SearchIndex: 'Grocery',
  //     Keywords: food.name,
  //     Timestamp= new Date(),
  //     Signature=[Request Signature],
  //   }).done( (data) => {
  //     console.log(data);
  //   });
  // }

  function renderGraph(food, index) {
    const currentData = DATA.slice(0);

    currentData.unshift(food);

    const dataVals = currentData.map( (obj) => {
      return {name: obj.displayName, value: obj.sugars.displayValue};
    });

    const margin = {top: 0, right: 0, bottom: 0, left: 170}
    const width = 550 - margin.left - margin.right;
    const barHeight = 40;
    const height = barHeight * dataVals.length;

    const y = d3.scale.ordinal()
      .domain(currentData.map( (food) => { return food.displayName; }))
      .rangeBands([0, barHeight * currentData.length]);

    // const y = d3.scale.linear()
    //   .range([height - margin.top - margin.bottom,0]);
    const scale = d3.scale.linear().domain([0, d3.max(dataVals, function(d) { return d.value; })]).range([0, width]);

    const chart = d3.select(`.result-graph-${index}`)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height)
      .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const bar = chart.selectAll('g').data(dataVals).enter().append('g')
      .attr('transform',(d, i) => { return `translate(0,${i * barHeight})`; });

    bar.append('rect').attr('width', function(d) { return scale(d.value); }).attr('height', barHeight - 1);

    bar.append("text")
      .attr("x", (d) => { return scale(d.value) - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text( (d) => { return `${d.value}g`; });

    // Axes
		const yAxis = d3.svg.axis().scale(y).orient('left');
    chart.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(0,0)`)
        .call(yAxis);
  }

  function render() {
    FOODS.forEach((food, index) => {
      const $wrapper = $('<div>').addClass('result-wrapper');

      const $imgbox = $('<div>').addClass('result-col img-box').appendTo($wrapper);
      $('<img>').addClass('food-img')
        .attr('src', 'http://www.freeiconspng.com/uploads/production-icon-31.png').appendTo($imgbox);
      // imageRequest(food);

      const $textbox = $('<div>').addClass('result-col result-textbox').appendTo($wrapper);
      $('<h3>').text(food.name).appendTo($textbox);
      $('<h4>').text(`${food.sugars.value}${food.sugars.unitOfMeasure} of sugar per serving`).appendTo($textbox);

      const $graphbox = $('<div>').addClass(`result-col result-graph`).appendTo($wrapper);
			d3.select($graphbox[0]).append('svg').attr("class", `chart result-graph-${index}`);
      $('#results').append($wrapper);

      renderGraph(food, index);

      d3.selectAll('.result-wrapper').style('background-color', function(d, i) {
        return i % 2 ? '#fff' : '#eee';
      });
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
            let displayVal;
            if (sugarVal < 1) {
              displayVal = sugarVal;
            } else {
              displayVal = sugarVal.replace(/\.\d*/, '');
            }

            FOODS.push(new Food({
              name: name,
              displayName: 'This product',
              ndbno: item[0].report.foods[0].ndbno,
              sugars: {
                value: sugarVal,
                displayValue: displayVal,
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
