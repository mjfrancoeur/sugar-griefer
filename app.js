function App() {

  const $searchBar = $('.search-bar');
  const FOODS = [];

  function Food(params) {
    this.name = params.name;
    this.ndbno = params.ndbno;
    this.sugars = {
      value: params.sugars.value,
      unitOfMeasure: params.sugars.unitOfMeasure
    };
    this.servingSize = params.servingSize;
    this.imgURL = params.imgURL || null;
  }

  $("#searchForm").on('submit', function(event) {
    // prevent page from reloading
    event.preventDefault();

    clearPrevSearch();
    // search request
    $.get('https://api.nal.usda.gov/ndb/search/?', $("#searchForm").serialize())
      .done(function(data) {
        data.list.item.forEach( (el) => {
          nutrientRequest(el.ndbno);
        });
        console.dir(FOODS);
      })
  });

  function clearPrevSearch() {
    FOODS.splice(0);
  }

  function nutrientRequest(foodID) {
    $.get('https://api.nal.usda.gov/ndb/nutrients/?', {
      api_key: 'XM57A3PgIUrZfDaDxBgSB0Fba56m8jPUO5vbYT5w',
      ndbno: foodID,
      nutrients: '269',
      format: 'json'
    }).done(function(data) {
      FOODS.push(new Food({
        name: data.report.foods[0].name,
        ndbno: data.report.foods[0].ndbno,
        sugars: {
          value: data.report.foods[0].nutrients[0].value,
          unitOfMeasure: data.report.foods[0].nutrients[0].unit
        },
        servingSize: data.report.foods[0].measure
      }));
    })
  }

}

$(App);
