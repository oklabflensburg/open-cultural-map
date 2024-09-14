import L from 'leaflet'
import 'leaflet-control-geocoder'
import 'leaflet.markercluster'

import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'

import monuments from 'url:../data/kulturnacht-flensburg-2024.geojson'
import districts from 'url:../data/flensburg_stadtgrenze.geojson'

import markerDefault from 'url:../static/marker-icon-default.webp'
import markerSelected from 'url:../static/marker-icon-active.webp'

import { Env } from './env.js'


const env = new Env()
env.injectLinkContent('.contact-mail', 'mailto:', '', env.contactMail, 'E-Mail')


let geocoder = L.Control.Geocoder.nominatim()
let previousSelectedMarker = null
let previousSelectedId = null
let slugUrlActive = null


const center = [54.792023881765154, 9.435979166343026]
const bounds = L.latLngBounds(L.latLng(54.75187298885215, 9.357220591547652), L.latLng(54.837075243318516, 9.50671528322748))

const map = L.map('map', {
  minZoom: 12,
  maxZoom: 18,
  maxBounds: bounds
}).setView(center, 13)

L.tileLayer('https://tiles.oklabflensburg.de/knf/{z}/{x}/{y}.png', {
  tileSize: 256,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)


window.addEventListener('popstate', (event) => {
  if (event.state !== null) {
    document.querySelector('#detailImage').innerHTML = ''
    document.querySelector('#detailList').innerHTML = ''
    document.querySelector('#details').classList.remove('hidden')
    document.querySelector('#about').classList.add('hidden')

    map.setView(event.state.latlng, 19)
    renderFeatureDetails(event.state.feature)
  }
  else {
    const latlng = new L.latLng(center[0], center[1])
    document.querySelector('#about').classList.remove('hidden')
    document.querySelector('#details').classList.add('hidden')
    map.setView(latlng, 13)
  }

  const eventId = 0

  const defaultIcon = L.divIcon({
    html: `<div class="flex justify-center items-center w-8 h-8 rounded-full font-bold text-center text-lg text-knf-darkblue bg-knf-light focus:text-knf-light focus:bg-knf-pink hover:text-knf-light hover:bg-knf-pink transition-all duration-300 border-0" role="button" tabindex="${eventId}">${eventId}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    tooltipAnchor: [0, -17]
  })

  // event.state.layer.setIcon(selectedIcon)
  previousSelectedMarker.setIcon(defaultIcon)
})


fetch(monuments, {
  method: 'GET'
}).then((response) => response.json()).then((data) => {
  marker(data)
}).catch(function (error) {
  console.log(error)
})


fetch(districts, {
  method: 'GET'
}).then((response) => response.json()).then((data) => {
  addDistrictsLayer(data)
}).catch(function (error) {
  console.log(error)
})


if (typeof URLSearchParams !== 'undefined' && location.search) {
  // parse /?geocoder=nominatim from URL
  const params = new URLSearchParams(location.search)
  const geocoderString = params.get('geocoder')

  if (geocoderString && L.Control.Geocoder[geocoderString]) {
    console.log('Using geocoder', geocoderString)
    geocoder = L.Control.Geocoder[geocoderString]()
  }
  else if (geocoderString) {
    console.warn('Unsupported geocoder', geocoderString)
  }
}


const osmGeocoder = new L.Control.geocoder({
  query: 'Flensburg',
  position: 'topright',
  placeholder: 'Adresse oder Ort',
  defaultMarkGeocode: false
}).addTo(map)


osmGeocoder.on('markgeocode', (e) => {
  map.fitBounds(bounds)
})


function fetchBlob(url, alt) {
  fetch(url, {
    method: 'get',
    mode: 'no-cors'
  }).then((response) => {
    if (response.ok) {
      response.blob().then((blob) => {
        const imageUrl = URL.createObjectURL(blob)
        const imageElement = document.createElement('img')
        imageElement.src = imageUrl
        imageElement.setAttribute('alt', alt)

        const divElement = document.createElement('div')
        divElement.classList.add('px-3', 'py-2', 'w-full', 'text-xs', 'text-knf-light', 'bg-knf-darkblue')
        divElement.innerText = 'Foto Kulturnacht Flensburg'

        const container = document.querySelector('#detailImage')
        container.appendChild(imageElement)
        container.appendChild(divElement)
      })
    }
    else {
      const debugLog = `${url} returned http status code ${response.status}`
      console.debug(debugLog)
    }
  }).catch((error) => {
    console.error(error)
  })
}


function addDistrictsLayer(data) {
  var geojsonData = {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [
        [
          [-180, 90],  // top-left corner of the world
          [180, 90],   // top-right corner
          [180, -90],  // bottom-right corner
          [-180, -90], // bottom-left corner
          [-180, 90]   // closing the loop
        ],
        [
          [
            9.412664108896106,
            54.822640908326917
          ],
          [
            9.413181875846229,
            54.821236397084668
          ],
          [
            9.413374489802681,
            54.821246525960554
          ],
          [
            9.414811569710462,
            54.82132208928688
          ],
          [
            9.416075868554238,
            54.821718743626214
          ],
          [
            9.417934777922738,
            54.821958905893545
          ],
          [
            9.41913422854455,
            54.822462666879268
          ],
          [
            9.419992305771064,
            54.822945572990449
          ],
          [
            9.421198876774255,
            54.823171178117462
          ],
          [
            9.422934049207743,
            54.823222978718263
          ],
          [
            9.42333027241596,
            54.822620595064642
          ],
          [
            9.423478202614467,
            54.822491546910292
          ],
          [
            9.42417131091806,
            54.821886892889673
          ],
          [
            9.424324681884283,
            54.821781398105955
          ],
          [
            9.42490787908196,
            54.821380245012911
          ],
          [
            9.425313614423393,
            54.82094678166996
          ],
          [
            9.425590187800067,
            54.820417250769381
          ],
          [
            9.425802898131463,
            54.819811199287827
          ],
          [
            9.425878284093747,
            54.819431931505058
          ],
          [
            9.425987037575924,
            54.819033949493651
          ],
          [
            9.426298879453595,
            54.818409737762892
          ],
          [
            9.426552785843045,
            54.818062711480778
          ],
          [
            9.426809952447893,
            54.817711223198685
          ],
          [
            9.427054079010505,
            54.817162418180658
          ],
          [
            9.427305876026066,
            54.81630975297692
          ],
          [
            9.428051421245936,
            54.81544224992026
          ],
          [
            9.428500118597054,
            54.814928766692596
          ],
          [
            9.43001139129195,
            54.813369267419993
          ],
          [
            9.430211364426388,
            54.813146454046851
          ],
          [
            9.431566105998435,
            54.811710719097981
          ],
          [
            9.432798503059599,
            54.811094209470383
          ],
          [
            9.433569844389593,
            54.810373524326486
          ],
          [
            9.434981216832671,
            54.810512144452922
          ],
          [
            9.435509099919948,
            54.81054704328146
          ],
          [
            9.435873651804849,
            54.810436118206702
          ],
          [
            9.436367107784687,
            54.809720640047942
          ],
          [
            9.436551231946542,
            54.809186783504138
          ],
          [
            9.437208303066782,
            54.809248628170742
          ],
          [
            9.437558196380344,
            54.808913404930692
          ],
          [
            9.43776845172092,
            54.808309317724294
          ],
          [
            9.436653156130278,
            54.808201173828287
          ],
          [
            9.43698425182593,
            54.806798274962048
          ],
          [
            9.436195166182994,
            54.806791682599403
          ],
          [
            9.435333154308188,
            54.805231573904329
          ],
          [
            9.434257708223445,
            54.803376857220655
          ],
          [
            9.433167467438073,
            54.803085934941244
          ],
          [
            9.432487176371142,
            54.802981604481118
          ],
          [
            9.431900883819758,
            54.803018953564695
          ],
          [
            9.431385262409972,
            54.803155520622781
          ],
          [
            9.430969305049976,
            54.803208385080431
          ],
          [
            9.430579148803528,
            54.80320510742618
          ],
          [
            9.430119742455764,
            54.8030462625007
          ],
          [
            9.429572742326487,
            54.802492173275439
          ],
          [
            9.429276730164267,
            54.802119171751045
          ],
          [
            9.42909997305112,
            54.801896437774104
          ],
          [
            9.428725463022403,
            54.801273347755497
          ],
          [
            9.428511475527907,
            54.800088026152189
          ],
          [
            9.428916166383825,
            54.79951376211703
          ],
          [
            9.430102595254258,
            54.797917532567496
          ],
          [
            9.430732618622574,
            54.798077812775496
          ],
          [
            9.432067350553581,
            54.796398271357653
          ],
          [
            9.433159563647102,
            54.795632505137867
          ],
          [
            9.43378321526952,
            54.795074147554686
          ],
          [
            9.434167646580029,
            54.794330618902507
          ],
          [
            9.434605417362842,
            54.793404368834274
          ],
          [
            9.434647453986415,
            54.791728051893536
          ],
          [
            9.434801837292792,
            54.790433093999596
          ],
          [
            9.434936436601207,
            54.789926991883725
          ],
          [
            9.435680806157739,
            54.789411901766094
          ],
          [
            9.436015148315041,
            54.789192224747119
          ],
          [
            9.436697178516077,
            54.788744093022402
          ],
          [
            9.437149820097511,
            54.788719976271224
          ],
          [
            9.437408887642116,
            54.789861895140255
          ],
          [
            9.43759720340968,
            54.792190461310334
          ],
          [
            9.437480391448451,
            54.793498856821856
          ],
          [
            9.436886646652693,
            54.796762685052634
          ],
          [
            9.436548228696287,
            54.799740156605424
          ],
          [
            9.436571104178066,
            54.800183034876959
          ],
          [
            9.43673183537606,
            54.800588221244276
          ],
          [
            9.436997918678301,
            54.801128901499894
          ],
          [
            9.438168658586193,
            54.802763065400896
          ],
          [
            9.439335237878666,
            54.80394975587064
          ],
          [
            9.439895464739269,
            54.804536367274153
          ],
          [
            9.440042951405573,
            54.804632178727054
          ],
          [
            9.441752078689206,
            54.804665396198239
          ],
          [
            9.442017460283667,
            54.804572624427813
          ],
          [
            9.439507060864555,
            54.800782550686641
          ],
          [
            9.440602675507417,
            54.800542052052272
          ],
          [
            9.44342407910028,
            54.804869241670787
          ],
          [
            9.443779115589141,
            54.805138125360209
          ],
          [
            9.445053783176135,
            54.80545262392944
          ],
          [
            9.451034641107505,
            54.807085701967893
          ],
          [
            9.452191398944931,
            54.807401507741247
          ],
          [
            9.452729919225792,
            54.807548524115333
          ],
          [
            9.454085124033208,
            54.808604412643014
          ],
          [
            9.454369821666438,
            54.809062640176528
          ],
          [
            9.454722784429887,
            54.810756123388835
          ],
          [
            9.455056687563541,
            54.812403333435732
          ],
          [
            9.455122634363324,
            54.812723670258862
          ],
          [
            9.455776480955565,
            54.813155430370827
          ],
          [
            9.456393434266612,
            54.813586883447883
          ],
          [
            9.456717750443453,
            54.813909337434794
          ],
          [
            9.457106465575176,
            54.814616071888601
          ],
          [
            9.457308551581812,
            54.815406554095638
          ],
          [
            9.4574378725532,
            54.816153800741823
          ],
          [
            9.457412025424482,
            54.816638565935214
          ],
          [
            9.457996005091422,
            54.817480186252098
          ],
          [
            9.459511808867779,
            54.818899673905761
          ],
          [
            9.460460577158761,
            54.819355133713941
          ],
          [
            9.461509680532894,
            54.820237794317748
          ],
          [
            9.463032468529276,
            54.82138013789919
          ],
          [
            9.464022859881686,
            54.821925603866411
          ],
          [
            9.465036283990617,
            54.822483731555366
          ],
          [
            9.467334502006008,
            54.823632317941744
          ],
          [
            9.468828260598407,
            54.822940883119095
          ],
          [
            9.468537592209605,
            54.822746654582687
          ],
          [
            9.469025783626467,
            54.822409497247087
          ],
          [
            9.47077115953612,
            54.821997228642481
          ],
          [
            9.471768909398019,
            54.821962650367965
          ],
          [
            9.47320964232569,
            54.821931638021844
          ],
          [
            9.474202236761361,
            54.82211019302941
          ],
          [
            9.475522967209573,
            54.822461935415021
          ],
          [
            9.475243976006459,
            54.823312465828025
          ],
          [
            9.475899458632686,
            54.823363795229582
          ],
          [
            9.477249283974141,
            54.822838242321886
          ],
          [
            9.479344284174539,
            54.823238799534671
          ],
          [
            9.480007245421428,
            54.82330806984767
          ],
          [
            9.480781982839648,
            54.823335592550976
          ],
          [
            9.481375718829009,
            54.823212427785627
          ],
          [
            9.48204277191342,
            54.823111164900887
          ],
          [
            9.482744184537928,
            54.823116770096412
          ],
          [
            9.483449682148946,
            54.822951849632588
          ],
          [
            9.484070532561503,
            54.822808266658086
          ],
          [
            9.484786317250837,
            54.822642722702895
          ],
          [
            9.485341076472256,
            54.822604505531331
          ],
          [
            9.485815384155309,
            54.822842796683602
          ],
          [
            9.486297331796285,
            54.822761357495992
          ],
          [
            9.487182303907185,
            54.822811037333331
          ],
          [
            9.488178025825899,
            54.822861591954975
          ],
          [
            9.488689776730219,
            54.823078850294003
          ],
          [
            9.489132018058024,
            54.823460345786152
          ],
          [
            9.489540944750733,
            54.823722846445008
          ],
          [
            9.490186113972332,
            54.823815581217431
          ],
          [
            9.490685798418156,
            54.82365115948798
          ],
          [
            9.491195034287843,
            54.82331191489849
          ],
          [
            9.491352324073013,
            54.822908094461631
          ],
          [
            9.491949564818187,
            54.822635672664376
          ],
          [
            9.492295934578252,
            54.821590932124288
          ],
          [
            9.492206128688553,
            54.820136439715121
          ],
          [
            9.490932878762095,
            54.819435359670933
          ],
          [
            9.491294324978428,
            54.818612617056168
          ],
          [
            9.491294578605261,
            54.818321914710445
          ],
          [
            9.491296100455488,
            54.816575532870111
          ],
          [
            9.492051905584958,
            54.814849532359872
          ],
          [
            9.493146946469489,
            54.814911941727338
          ],
          [
            9.496257357844653,
            54.815089160262424
          ],
          [
            9.50164983429636,
            54.812430377506459
          ],
          [
            9.503983589582086,
            54.810976913628792
          ],
          [
            9.505431081139029,
            54.810207487456864
          ],
          [
            9.504392398208797,
            54.809445546155359
          ],
          [
            9.503872308581002,
            54.80777229732854
          ],
          [
            9.504537343170853,
            54.807239053986095
          ],
          [
            9.505287575322903,
            54.807047488711795
          ],
          [
            9.504395366287927,
            54.805285290543878
          ],
          [
            9.503832434139726,
            54.80417336419243
          ],
          [
            9.502900490804242,
            54.804166066832799
          ],
          [
            9.500989585879433,
            54.804169030888112
          ],
          [
            9.499827615550483,
            54.804034267303088
          ],
          [
            9.499697545164825,
            54.803620434251059
          ],
          [
            9.503404405796751,
            54.801890578653392
          ],
          [
            9.503412663161933,
            54.80087656185475
          ],
          [
            9.505685257980593,
            54.800678956989223
          ],
          [
            9.505415377819061,
            54.799599946181246
          ],
          [
            9.501388018167578,
            54.798455607196651
          ],
          [
            9.498975749074221,
            54.798652036551957
          ],
          [
            9.499687186061614,
            54.796144847550508
          ],
          [
            9.50146613436943,
            54.7944716605626
          ],
          [
            9.502650598154368,
            54.793637369232854
          ],
          [
            9.505749398621298,
            54.792629579193154
          ],
          [
            9.506569452474434,
            54.792097527887293
          ],
          [
            9.50671528322748,
            54.791174315389021
          ],
          [
            9.504962176176088,
            54.789769601544911
          ],
          [
            9.505447523046993,
            54.788938785434134
          ],
          [
            9.505690725711753,
            54.787836844781026
          ],
          [
            9.504783703750158,
            54.787443856763097
          ],
          [
            9.503091971406413,
            54.787403689136276
          ],
          [
            9.503795825105131,
            54.785201512572506
          ],
          [
            9.50440741462949,
            54.784946043698724
          ],
          [
            9.50357637653342,
            54.781977991212671
          ],
          [
            9.503091808107303,
            54.781453679283175
          ],
          [
            9.502180299595508,
            54.779274722766274
          ],
          [
            9.502796291483937,
            54.778166722914939
          ],
          [
            9.504730007966671,
            54.776476722222895
          ],
          [
            9.504510834526036,
            54.775891666719247
          ],
          [
            9.503114215066862,
            54.773879418175177
          ],
          [
            9.503220688675482,
            54.773070961897886
          ],
          [
            9.503903739023675,
            54.773311236291129
          ],
          [
            9.505469902421899,
            54.773386314384183
          ],
          [
            9.506660204237905,
            54.772937917237343
          ],
          [
            9.504556075322597,
            54.772634281471021
          ],
          [
            9.496781218146932,
            54.770553919689931
          ],
          [
            9.494976891194812,
            54.771365331256249
          ],
          [
            9.494489790546661,
            54.770957626583538
          ],
          [
            9.494590976667588,
            54.770617393838656
          ],
          [
            9.494915805651228,
            54.770009692012195
          ],
          [
            9.493833157624389,
            54.769294817687964
          ],
          [
            9.493334894869012,
            54.769252299070764
          ],
          [
            9.492627794780496,
            54.769614656893495
          ],
          [
            9.491879523760847,
            54.769782295356308
          ],
          [
            9.488977069051442,
            54.769707464086309
          ],
          [
            9.487266776646585,
            54.770724500826198
          ],
          [
            9.486816908558387,
            54.770735063259927
          ],
          [
            9.486261728391643,
            54.770991025027378
          ],
          [
            9.483653260605738,
            54.771015078373949
          ],
          [
            9.479323777352768,
            54.771599649565033
          ],
          [
            9.474710042387384,
            54.772379222971914
          ],
          [
            9.474442210603652,
            54.771255242529783
          ],
          [
            9.474265849356243,
            54.769557623753556
          ],
          [
            9.473232270966152,
            54.76800565076347
          ],
          [
            9.472249345190763,
            54.766929730486474
          ],
          [
            9.471045117475356,
            54.765966619013057
          ],
          [
            9.467343092269211,
            54.765004560341126
          ],
          [
            9.466528953478811,
            54.764604413241265
          ],
          [
            9.460205568302248,
            54.760990347061451
          ],
          [
            9.46088199301766,
            54.759531949544368
          ],
          [
            9.461259513264983,
            54.758054202059
          ],
          [
            9.461092232607598,
            54.756643797979606
          ],
          [
            9.461260142504413,
            54.755487424207274
          ],
          [
            9.460965252316054,
            54.754219569133831
          ],
          [
            9.461813125901978,
            54.75317644480446
          ],
          [
            9.456468190570403,
            54.752836510717273
          ],
          [
            9.453087744581664,
            54.752117652974157
          ],
          [
            9.452375683355225,
            54.752048962609372
          ],
          [
            9.451617306101777,
            54.751970911406332
          ],
          [
            9.450626677329664,
            54.751872988852149
          ],
          [
            9.448685761707994,
            54.751928749765852
          ],
          [
            9.445371831567776,
            54.752915455574623
          ],
          [
            9.442274157809292,
            54.753311535448837
          ],
          [
            9.437921380095359,
            54.753634236052882
          ],
          [
            9.435884344911802,
            54.753186407551134
          ],
          [
            9.432392668028749,
            54.753202004651293
          ],
          [
            9.429335838897078,
            54.753444808365771
          ],
          [
            9.426671000616468,
            54.753656414420554
          ],
          [
            9.42241132726952,
            54.753360105170493
          ],
          [
            9.414341379752589,
            54.753117488917354
          ],
          [
            9.406572073459641,
            54.753383780351577
          ],
          [
            9.403787917638805,
            54.753479090464324
          ],
          [
            9.399200781072397,
            54.753250976896872
          ],
          [
            9.390091341765441,
            54.753288439316407
          ],
          [
            9.38236541360595,
            54.753229721338933
          ],
          [
            9.379014517860758,
            54.753200215460993
          ],
          [
            9.378562396183789,
            54.753869348971946
          ],
          [
            9.376877884067882,
            54.7565469577182
          ],
          [
            9.374219807876496,
            54.757887634178481
          ],
          [
            9.371928182499561,
            54.758863535365556
          ],
          [
            9.373278860354977,
            54.760015324212908
          ],
          [
            9.370983763009432,
            54.761116824418238
          ],
          [
            9.371410120308477,
            54.761425755501591
          ],
          [
            9.36837974415095,
            54.76547809190243
          ],
          [
            9.3674811461948,
            54.76667956525273
          ],
          [
            9.365173633377278,
            54.771234304028212
          ],
          [
            9.361842144173293,
            54.775072730080709
          ],
          [
            9.36061038295421,
            54.776508489038392
          ],
          [
            9.357220591547652,
            54.779481944078562
          ],
          [
            9.357587525597317,
            54.780849391538801
          ],
          [
            9.358776564321875,
            54.78109340609101
          ],
          [
            9.359888480122128,
            54.781318768792616
          ],
          [
            9.363225738396014,
            54.781940963165461
          ],
          [
            9.366588159690952,
            54.782787658660794
          ],
          [
            9.370261681587147,
            54.783619077101264
          ],
          [
            9.372791531024319,
            54.784419413451147
          ],
          [
            9.375474145092301,
            54.785567874689924
          ],
          [
            9.37717681567433,
            54.786363701772416
          ],
          [
            9.378890478568044,
            54.78792243861318
          ],
          [
            9.379750268090865,
            54.788329930414754
          ],
          [
            9.380730523732771,
            54.788593780311771
          ],
          [
            9.384531651074013,
            54.789272724287784
          ],
          [
            9.386544618704526,
            54.789785787615813
          ],
          [
            9.391828581818343,
            54.791393272506724
          ],
          [
            9.394790332024256,
            54.792394876229423
          ],
          [
            9.398606343123856,
            54.793487705063093
          ],
          [
            9.40069876040417,
            54.793992391662393
          ],
          [
            9.405471190666487,
            54.795324639843386
          ],
          [
            9.405904562514548,
            54.796656417081422
          ],
          [
            9.406326090973973,
            54.798383122685401
          ],
          [
            9.405739275658441,
            54.799455002714851
          ],
          [
            9.404018724721576,
            54.801719683071475
          ],
          [
            9.402600748555137,
            54.804292070918173
          ],
          [
            9.401890636453182,
            54.806520547359426
          ],
          [
            9.402263643524696,
            54.808318620169906
          ],
          [
            9.403385570543833,
            54.80999750181757
          ],
          [
            9.40457710448322,
            54.810788519547295
          ],
          [
            9.40652670905521,
            54.812312950192883
          ],
          [
            9.407850800237931,
            54.813392246652256
          ],
          [
            9.410426021842877,
            54.815234030039143
          ],
          [
            9.410253121824079,
            54.816076995816744
          ],
          [
            9.411016951510039,
            54.816569303398062
          ],
          [
            9.410603212809523,
            54.817552920173213
          ],
          [
            9.410394434069801,
            54.818421624946829
          ],
          [
            9.41042648967035,
            54.819145655502005
          ],
          [
            9.409112697238813,
            54.819250880378057
          ],
          [
            9.407004190091959,
            54.819720738181225
          ],
          [
            9.404625142539361,
            54.82157588421537
          ],
          [
            9.404694993761638,
            54.822482869173854
          ],
          [
            9.407061049020207,
            54.822341665611376
          ],
          [
            9.408250300538914,
            54.822028800264185
          ],
          [
            9.408661625997608,
            54.822956657224864
          ],
          [
            9.411029313295273,
            54.823964075149021
          ],
          [
            9.412019003291398,
            54.824160990065579
          ],
          [
            9.412136516334815,
            54.823820979619313
          ],
          [
            9.412664108896106,
            54.822640908326917
          ]
        ]

      ]
    }
  }

  L.geoJSON(geojsonData, {
    style: {
      weight: 2,
      color: '#bbbbbb',
      fillColor: '#ffffff',
      fillOpacity: 0.7
    }
  }).addTo(map)
}


function capitalizeEachWord(str) {
  return str.replace(/-/g, ' ').replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}


function renderFeatureDetails(feature) {
  const slug = feature.properties.slug
  const eventId = feature.properties.event_id
  const venueName = feature.properties.venue_name
  const eventTitle = feature.properties.event_title
  const eventTags = feature.properties.event_tags
  const venueStreet = feature.properties.venue_street
  const venueHousenumber = feature.properties.venue_housenumber
  const venuePostalCode = feature.properties.venue_postal_code
  const venueCity = feature.properties.venue_city
  const venueUrl = feature.properties.venue_url
  const venueOpen = feature.properties.venue_open
  const venueClose = feature.properties.venue_close
  const activityTime = feature.properties.activity_time
  const activityTitle = feature.properties.activity_title
  const eventDescriptionGerman = feature.properties.event_description_de
  const eventDescriptionDansk = feature.properties.event_description_dk
  const eventImage = feature.properties.event_image

  let showLanguage = false
  let descriptionLanguage = ''

  fetchBlob(eventImage, eventTitle)

  const title = `${capitalizeEachWord(slug)} - Kulturnacht Flensburg`

  document.querySelector('title').innerHTML = title
  document.querySelector('meta[property="og:title"]').setAttribute('content', title)
  document.querySelector('meta[property="og:url"]').setAttribute('content', `${window.location.href}${slug}`)


  if (eventDescriptionGerman !== '' && eventDescriptionDansk !== '') {
    showLanguage = true
  }

  let detailOutput = `<li class="pb-3"><div class="flex justify-center items-center w-8 h-8 rounded-full font-bold text-center text-lg text-knf-light bg-knf-darkblue">${eventId}</div></li>`

  detailOutput += `<li class="text-xl lg:text-2xl xl:text-3xl text-knf-pink font-bold"><h3>${venueName}</h3></li>`
  detailOutput += `<li class="pb-4 text-xl lg:text-2xl xl:text-3xl font-bold"><h4>${eventTitle}</h4></li>`
  detailOutput += `<li class="font-bold text-knf-pink">${eventTags}</li>`
  detailOutput += `<li class="pb-3 font-bold text-knf-darkblue">${venueStreet} ${venueHousenumber}<br>${venuePostalCode} ${venueCity}</li>`

  if (eventDescriptionGerman !== '') {
    if (showLanguage === true) {
      descriptionLanguage = '[deutsch]<br>'
    }

    detailOutput += `<li class="py-1">${descriptionLanguage}${eventDescriptionGerman}</li>`
  }

  if (eventDescriptionDansk !== '') {
    if (showLanguage === true) {
      descriptionLanguage = '[dansk]<br>'
    }

    detailOutput += `<li class="py-1">${descriptionLanguage}${eventDescriptionGerman}</li>`
  }

  detailOutput += `<li class="py-2"><strong>Öffnungszeiten</strong><br>${venueOpen} Uhr bis ${venueClose} Uhr</li>`

  if (activityTitle !== '' && activityTime !== '') {
    detailOutput += `<li class="py-2"><strong>${activityTitle}</strong><br>${activityTime} Uhr</li>`
  }

  detailOutput += `<li class="py-2"><a href="${venueUrl}" class="relative inline-block text-knf-darkblue focus:text-knf-pink hover:text-knf-pink transition-all duration-300 before:absolute before:left-0 before:bottom-0 before:h-[2px] before:bg-current before:w-full before:scale-x-0 hover:before:scale-x-100 before:transition-transform before:origin-left" title="Website ${venueName}" target="_blank">Website <svg class="mb-1 h-4 w-4 inline" viewBox="0 0 1850 1850" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1438.37,1074.95l-0,320c-0,79.334 -28.167,147.167 -84.5,203.5c-56.333,56.334 -124.167,84.5 -203.5,84.5l-832,0c-79.333,0 -147.167,-28.166 -203.5,-84.5c-56.333,-56.333 -84.5,-124.166 -84.5,-203.5l-0,-832c-0,-79.333 28.167,-147.166 84.5,-203.5c56.333,-56.333 124.167,-84.5 203.5,-84.5l704,0c9.333,0 17,3 23,9c6,6 9,13.667 9,23l-0,64c-0,9.334 -3,17 -9,23c-6,6 -13.667,9 -23,9l-704,0c-44,0 -81.667,15.667 -113,47c-31.333,31.334 -47,69 -47,113l-0,832c-0,44 15.667,81.667 47,113c31.333,31.334 69,47 113,47l832,0c44,0 81.667,-15.666 113,-47c31.333,-31.333 47,-69 47,-113l-0,-320c-0,-9.333 3,-17 9,-23c6,-6 13.667,-9 23,-9l64,0c9.333,0 17,3 23,9c6,6 9,13.667 9,23Zm384,-864l-0,512c-0,17.334 -6.333,32.334 -19,45c-12.667,12.667 -27.667,19 -45,19c-17.333,0 -32.333,-6.333 -45,-19l-176,-176l-652,652c-6.667,6.667 -14.333,10 -23,10c-8.667,0 -16.333,-3.333 -23,-10l-114,-114c-6.667,-6.666 -10,-14.333 -10,-23c-0,-8.666 3.333,-16.333 10,-23l652,-652l-176,-176c-12.667,-12.666 -19,-27.666 -19,-45c-0,-17.333 6.333,-32.333 19,-45c12.667,-12.666 27.667,-19 45,-19l512,0c17.333,0 32.333,6.334 45,19c12.667,12.667 19,27.667 19,45Z"></path></svg><span class="absolute bottom-0 left-0 w-full h-[2px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span></a></li>`

  document.querySelector('#details').classList.remove('hidden')
  document.querySelector('#detailList').innerHTML = detailOutput

  document.querySelector('title').innerHTML = title
  document.querySelector('meta[property="og:title"]').setAttribute('content', title)
}


function marker(data) {
  const markers = L.markerClusterGroup({
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 15
  })

  const geojsonGroup = L.geoJSON(data, {
    onEachFeature(feature, layer) {
      const slug = String(feature.properties.slug)
      const path = decodeURIComponent(window.location.pathname)

      if (slug === path.slice(1)) {
        const eventId = feature.properties.event_id

        const selectedIcon = L.divIcon({
          html: `<div class="flex justify-center items-center w-8 h-8 rounded-full font-bold text-center text-lg text-knf-light bg-knf-darkblue border-2 border-slate-100" role="button" tabindex="${eventId}">${eventId}</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          tooltipAnchor: [0, -17]
        })

        document.querySelector('#about').classList.add('hidden')
        layer.setIcon(selectedIcon)
        previousSelectedMarker = layer
        renderFeatureDetails(feature)
        map.setView(layer._latlng, 19)
        slugUrlActive = true
      }

      layer.on('click', function (e) {
        document.getElementById('filter').scrollTo({
          top: 0,
          left: 0
        })

        const currentZoom = map.getZoom()

        if (currentZoom < 15) {
          map.setView(e.latlng, 15)
        }
        else {
          map.setView(e.latlng, currentZoom)
        }

        document.querySelector('#detailImage').innerHTML = ''
        document.querySelector('#detailList').innerHTML = ''
        document.querySelector('#about').classList.add('hidden')
        renderFeatureDetails(e.target.feature)
        history.pushState({ 'feature': e.target.feature, 'latlng': e.latlng }, slug, slug)
      })
    },
    pointToLayer(feature, latlng) {
      const eventId = feature.properties.event_id
      const eventTitle = feature.properties.event_title

      const icon = L.divIcon({
        html: `<div class="flex justify-center items-center w-8 h-8 rounded-full font-bold text-center text-lg text-knf-darkblue bg-knf-light focus:text-knf-light focus:bg-knf-pink hover:text-knf-light hover:bg-knf-pink transition-all duration-300 border-0" role="button" tabindex="${eventId}">${eventId}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        tooltipAnchor: [0, -17]
      })

      return L.marker(latlng, { icon }).bindTooltip(eventTitle, {
        permanent: false,
        direction: 'top'
      }).openTooltip()
    }
  })


  markers.on('click', function (e) {
    const selectedIcon = L.divIcon({
      html: `<div class="flex justify-center items-center w-8 h-8 rounded-full font-bold text-center text-lg text-knf-light bg-knf-darkblue border-2 border-slate-100" role="button">${e.layer.feature.properties.event_id}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      tooltipAnchor: [0, -17]
    })

    if (previousSelectedMarker !== null && previousSelectedId !== null) {
      const defaultIcon = L.divIcon({
        html: `<div class="flex justify-center items-center w-8 h-8 rounded-full font-bold text-center text-lg text-knf-darkblue bg-knf-light focus:text-knf-light focus:bg-knf-pink hover:text-knf-light hover:bg-knf-pink transition-all duration-300 border-0" role="button">${previousSelectedId}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        tooltipAnchor: [0, -17]
      })

      previousSelectedMarker.setIcon(defaultIcon)
    }

    e.layer.setIcon(selectedIcon)
    previousSelectedId = e.layer.feature.properties.event_id
    previousSelectedMarker = e.layer
  })

  markers.addLayer(geojsonGroup)
  map.addLayer(markers)
}