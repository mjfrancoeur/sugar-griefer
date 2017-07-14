function App() {

  // Ajax request
  // $.get('https://api.nal.usda.gov/ndb/V2/reports?', {
  //   ndbno: "01009",
  //   type: 'b',
  //   format: 'json',
  //   api_key: 'XM57A3PgIUrZfDaDxBgSB0Fba56m8jPUO5vbYT5w',
  // }).done(function(data) {
  //   console.log(data);
  // })
  // 
   // search request
   $.get('https://api.nal.usda.gov/ndb/search/?', {
     api_key: 'XM57A3PgIUrZfDaDxBgSB0Fba56m8jPUO5vbYT5w',
     q: 'wheaties',
     format: 'json'
   }).done(function(data) {
     console.log('search '+  data);
   })

  // nutrient request
  // $.get('https://api.nal.usda.gov/ndb/nutrients/?', {
  //   api_key: 'XM57A3PgIUrZfDaDxBgSB0Fba56m8jPUO5vbYT5w',
  //   ndbno: '01009',
  //   nutrients: '269',
  //   format: 'json'
  // }).done(function(data) {
  //   console.log('search ' +  data);
  // })
}

$(App);
