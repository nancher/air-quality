/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

var colors = ['#16324a', '#24385e', '#393f65', '#4e4a67', '#5a4563', '#b38e95',
              '#edae9e', '#c1b9c2', '#bec3cb', '#9ea7bb', '#99b4ce', '#d7f0f8'];

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: -1,
  nowGraTime: "day"
}

/*
 **设置柱状图数据之间的间隔
 */
function getWidth(width, len) {
  var posObj = {};
  posObj.width = Math.floor(width/(len*2-1));
  posObj.left = Math.floor(width/(len*2-1));
  posObj.offsetLeft = (width - posObj.width*(len*2-1))/2;
  return posObj;
}

/*
 **设置柱状图数据标题的坐缩进
 */
function getHintLeft(posObj, i) {
  if(posObj.left*i + posObj.offsetLeft + posObj.width/2 <= 60){
    return 5;
  }
  else if(posObj.left*i + posObj.offsetLeft + posObj.width*i + posObj.width/2 + 60 >=1200){
    return (posObj.left*i + posObj.offsetLeft + posObj.width*i + posObj.width/2 - 110);
  }
  else{
    return (posObj.left*i + posObj.offsetLeft + posObj.width*i + posObj.width/2 - 60);
  }
}

function getTitle(){
  switch(pageState.nowGraTime){
    case "day" :
      return "每日";
    case "week":
      return "每周";
    case "month":
      return "每月";
  }
}

/**
 * 跨浏览器绑定事件
 **/
function addEventHandle(ele, event, handler) {
  if(ele.addEventListener){
    return ele.addEventListener(event, handler);
  }
  else if(ele.attachEvent){
    return ele.attachEvent("on"+event, handler);
  }
  else{
    return ele["on"+event] = handler;
  }
}

/**
 * 渲染图表
 */
function renderChart() {
  var innerHTML = "";
  var wrapper = document.getElementById("aqi-chart-wrap");
  var width = wrapper.clientWidth;
  var selectedData = chartData[pageState.nowGraTime][pageState.nowSelectCity];
  var len = Object.keys(selectedData).length;
  var asPosObj = getWidth(width, len);
  innerHTML += "<div class='title'>" + pageState.nowSelectCity + "市01-03月" + getTitle() + "空气质量报告" + "</div>";
  var i = 0;
  for(key in selectedData){
    //console.log(key);
    innerHTML += "<div class='aqi-bar' style='height: "+selectedData[key]+"px; width: "+asPosObj.width+"px; left: "+(asPosObj.left*i*2+asPosObj.offsetLeft)+"px; background-color: "+ colors[Math.floor(Math.random()*11)] +"'></div>";
    innerHTML += "<div class='aqi-hint' style='bottom: "+ (selectedData[key]+10) +"px; left: "+ getHintLeft(asPosObj, i) +"px'>" + key + "<br/> [AQI]: " + selectedData[key] + "</div>";
    i++;
  }
  wrapper.innerHTML = innerHTML;
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange(radio) {
  // 确定是否选项发生了变化 
  var value = radio.value;
  var item = radio.previousElementSibling;
  var items = document.getElementsByTagName("span");
  for(var i=0; i < items.length; i++){
    items[i].className = "";
  }
  item.className = "selected";
  if(value != pageState.nowGraTime){
    // 设置对应数据
    pageState.nowGraTime = value;
    // 调用图表渲染函数
    renderChart();
  }
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
  // 确定是否选项发生了变化 
  var city = this.value;
  if(city != pageState.nowSelectCity){
    // 设置对应数据
    pageState.nowSelectCity = city;
    renderChart();
    // 调用图表渲染函数
  }
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  var radio = document.getElementsByName("gra-time");
  for(var i=0; i<radio.length; i++){
    /*(function(m){addEventHandle(radio[m], "click", function(){
        graTimeChange(radio[m]);
      })
    })(i)*/
    addEventHandle(radio[i], "click", function(i){
        return function(){return graTimeChange(radio[i])};
      }(i));
  }
  addEventHandle(document, "mouseover", function(event){
    var ele = event.target;
    ele.className += " show";
  });
  addEventHandle(document, "mouseout", function(event){
    var ele = event.target;
    ele.className = ele.className.replace(/show/,"");
  });
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  var select = document.getElementById("city-select");
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  var cityArr = Object.getOwnPropertyNames(aqiSourceData);
  var htmlArr = cityArr.map(function(item){
    return "<option>" + item +"</option>";
  });
  pageState.nowSelectCity = cityArr[0];
  select.innerHTML = htmlArr.join("");
  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  addEventHandle(select, "change", citySelectChange);
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  var week = {};
  var month = {};
  var singleWeek = {};
  var singleMonth = {};
  for(var key in aqiSourceData){
    var tempCity = aqiSourceData[key];
    var keyArr = Object.getOwnPropertyNames(tempCity);
    keyArr.sort();
    //console.log(keyArr);
    var tempMonth = keyArr[0].slice(5,7);
    var weekDataCount = 0;
    var monthDataCount = 0;
    var weekCount = 0;
    var monthCount = 0;
    var wcount = 0;
    var mcount = 0;
    for(var i=0; i<keyArr.length; i++){
      weekDataCount += tempCity[keyArr[i]];
      monthDataCount += tempCity[keyArr[i]];
      wcount++;
      mcount++;
      if(wcount%7 == 0 || i == keyArr.length-1){
        weekCount++;
        var tempkey = keyArr[i].slice(0,4) + "年第" + weekCount + "周平均";
        singleWeek[tempkey] = Math.floor(weekDataCount/7);
        weekDataCount = 0;
        wcount = 0;
      }
      if(i == keyArr.length-1 || keyArr[i+1].slice(-2) == "01"){
        //console.log(keyArr[i]);
        monthCount++;
        var tempMkey = keyArr[i].slice(0,4) + "年第" + monthCount +"月平均";
        singleMonth[tempMkey] = Math.floor(monthDataCount/mcount);
        monthDataCount = 0;
        mcount = 0;
      }
    }
    week[key] = singleWeek;
    month[key] = singleMonth;
  }
  // 处理好的数据存到 chartData 中
  chartData.day = aqiSourceData;
  chartData.week = week;
  chartData.month = month;
  renderChart();
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm()
  initCitySelector();
  initAqiChartData();
}

init();