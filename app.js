function App() {
  const FOODS = [];

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

  function render() {
    FOODS.forEach((food) => {
      const $wrapper = $('<div>').addClass('result-wrapper');
      const $img = $('<img>').addClass('result-col food-img')
        .attr('src', 'http://www.cheerios.com/~/media/17EE88F6F39C45E787CE2E1186260B94.ashx').appendTo($wrapper);

      const $textbox = $('<div>').addClass('result-col result-textbox').appendTo($wrapper);
      const $header = $('<h3>').text(food.name).appendTo($textbox);
      const $para = $('<h4>').text(`${food.sugars.value}${food.sugars.unitOfMeasure} of sugar per serving`).appendTo($textbox);

      const $graph = $('<div>').addClass('result-col').appendTo($wrapper);

      $('#results').append($wrapper);
    });
  }


  $('#searchForm').on('submit', (event) => {
    // prevent page from reloading
    event.preventDefault();

    // clear previous search
    clearPrevSearch();

    // search request
    const $searchResults =
      $.get(
        'https://api.nal.usda.gov/ndb/search/?',
        $('#searchForm').serialize(),
      )
      .done((data) => {
        const results = data.list.item.map((result) => {
          return nutrientRequest(result.ndbno);
        });

        $.when.apply($, results).done(() => {
          [].slice.call(arguments).forEach((item) => {
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
