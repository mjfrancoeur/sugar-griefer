function App() {
  const FOODS = [];
  const DATA = [new Food( {displayName: 'Ben & Jerry\'s chocolate ice cream', sugars: { displayValue: 19, unitOfMeasure: 'g' }}), new Food( {displayName: 'Chips Ahoy! cookie', sugars: { displayValue: 11, unitOfMeasure: 'g' }, }) ];

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

  function imageRequest(food, element) {
    $.get('http://api.giphy.com/v1/gifs/random?', {
      api_key: '58fdd97a7b79422b8141f6c7a867cc10',
      tag: food.name,
    }).done( (data) => {
      $('<img>').addClass('food-img')
        .attr('src', data.data.image_url).appendTo(element);
    });
  }

  function renderGraph(food, index) {
    const currentData = DATA.slice(0);

    currentData.unshift(food);

    const dataVals = currentData.map( (obj) => {
      return {name: obj.displayName, value: obj.sugars.displayValue};
    });

    const margin = {top: 20, right: 0, bottom: 20, left: 170}
    const width = 550 - margin.left - margin.right;
    const barHeight = 35;
    const height = barHeight * dataVals.length ;

    const y = d3.scale.ordinal()
      .domain(currentData.map( (food) => { return food.displayName; }))
      .rangeBands([0, barHeight * currentData.length]);

    // const y = d3.scale.linear()
    //   .range([height - margin.top - margin.bottom,0]);
    const scale = d3.scale.linear().domain([0, d3.max(dataVals, function(d) { return d.value; })]).range([0, width]);

    const chart = d3.select(`.result-graph-${index}`)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const bar = chart.selectAll('g').data(dataVals).enter().append('g')
      .attr('transform',(d, i) => { return `translate(0,${i * barHeight})`; });

    bar.append('rect').attr('width', function(d) { return scale(d.value); }).attr('height', barHeight - 2);

    bar.append("text")
      .attr("x", (d) => { return scale(d.value) - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text( (d) => { return `${d.value < 1 ? '' : d.value +'g'}`; });

    // Axes
		const yAxis = d3.svg.axis().scale(y).orient('left');
    chart.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(0,0)`)
        .call(yAxis);
  }

  // Function: Render
  // ----------------
  // Create HTML elements for each item in FOOD
  // and attach to the DOM.
  function render() {
    FOODS.forEach((food, index) => {
      const $wrapper = $('<div>').addClass('result-wrapper');

      const $imgbox = $('<div>').addClass('result-col img-box').appendTo($wrapper);
      imageRequest(food, $imgbox);

      const $textbox = $('<div>').addClass('result-col result-textbox').appendTo($wrapper);
      $('<h3>').text(food.name).appendTo($textbox);
      $('<h4>').text(`${food.sugars.value}${food.sugars.unitOfMeasure} of sugar per serving`).addClass('sugars-subhead').appendTo($textbox);

      const $graphbox = $('<div>').addClass(`result-col result-graph`).appendTo($wrapper);

      // Attemp to create responsive SVG container [currently not working]
      //    const svgContainer =  d3.select(`.result-graph-${index}`)
      //      .append('div')
      //      .classed('svg-container')
      //      .append('svg')
      //      .attr("preserveAspectRatio", "xMinYMin meet")
      //      .attr("viewBox", "0 0 600 400")
      //      //class to make it responsive
      //      .classed("svg-content-responsive", true);

      d3.select($graphbox[0]).append('svg').attr("class", `chart result-graph-${index}`);
      $('#results').append($wrapper);

      renderGraph(food, index);

    });

    // shrink footer
    $('#footer').css({'height': '5%'});

    // Alternate colors for results divs
    d3.selectAll('.result-wrapper').style('background-color', function(d, i) {
      return i % 2 ? '#fff' : '#eee';
    });

    // set mouse enter event to change background-image to product image
    $('#results').on('mouseenter', '.result-wrapper', function() {
      const $el = $(this);
      const $img = $el.find('.food-img');
      const src = $img.attr('src');

      // set background image, size, and box-shadow for better text visibility
      $el.css({'background-image': `url(${src})`, 'background-size': 'cover', 'box-shadow': 'inset 0 0 0 1000px rgba(255, 255, 255, .7)'});

      // set text background
      const $textbox = $el.find('.result-textbox, .result-graph');
      // $textbox.css({'background-color': 'rgba(255,255,255,.6)'});

      // Option to set the img to flash across the wrapper div for one second
      // setTimeout( function() {
      //   $el.css({'background-image': ''});
      //   $textbox.css({'background-color': 'rgba(0,0,0,0)'});
      // }, 1000);


      // When mouse leaves the HTML element, remove background GIF
      $('#results').on('mouseleave', '.result-wrapper', function() {
        const $el = $(this);
        $el.css({'background-image': '', 'box-shadow': ''});
        $textbox.css({'background-color': 'rgba(0,0,0,0)'});
      });

    });

    // $('.result-wrapper').hover( function() {
    //   console.log($('this').find('img'));
    //   console.log($('.result-wrapper'));
    //   //const img = $('this').find('.food-img');
    //   // console.log(img);
    //   //$('this').attr('background-image', `url(${img})`);
    // });
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
