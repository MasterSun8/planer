const Dialogs = require('dialogs')
const path = require('path')
const dialogs = Dialogs()
const sqlite = require('sqlite3').verbose();

//creates the database
var db = new sqlite.Database('F:/work/elec/projects/spec/db/smh.db', sqlite.open_create,(err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

//creates tables
db.serialize(function () {
//  db.run('DROP TABLE events')
//  db.run('DROP TABLE login')
  db.run("CREATE TABLE if not exists events (year, month, day, eve)");
  db.run("CREATE TABLE if not exists login (pin)");
//db.run("INSERT INTO events VALUES (?, ?, ?, ?)", [2004, 1, 1,'clueless']);
//db.run("INSERT INTO login VALUES (?)", ['admin']);
});

let calendar = document.querySelector('.calendar')

const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 ===0)
}

getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28
}

generateCalendar = (month, year) => {

    let calendar_days = calendar.querySelector('.calendar-days')
    let calendar_header_year = calendar.querySelector('#year')

    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.innerHTML = ''

    

    let curr_month = `${month_names[month]}`
    month_picker.innerHTML = curr_month
    calendar_header_year.innerHTML = year

    let first_day = new Date(year, month, 1)

    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = document.createElement('div')
        if (i >= first_day.getDay()) {
            day.id= i - first_day.getDay() + 1
            day.classList.add('calendar-day-hover')
            day.innerHTML = i - first_day.getDay() + 1
            day.innerHTML +="<span></span><span></span><span></span><span></span>"
            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
              day.classList.add('curr-date')
            }
          }

        calendar_days.appendChild(day)
    }
    //console.log(document.getElementsByClassName("calendar-day-hover"))

    let lepin = Array.from(document.getElementsByClassName("login"))
    lepin.forEach(pins =>{
      pins.addEventListener("click", e => {
      if(pins.id=="reset"){
        db.each("SELECT * FROM login",function(err, row){
        if(err){console.log(err)}
        console.log(row.pin)
      })
        dialogs.confirm('You will lose ALL your pins. Are you sure?', ok => {
          if(ok){
        db.run('DROP TABLE login')
        db.run("CREATE TABLE if not exists login (pin)")}})
        console.log()
      }else if(pins.id=="add"){
      dialogs.prompt('Add pin', ok => {
        if(ok!=null){
        db.run("INSERT INTO login VALUES (?)", [ok], function(err){
              if (err) {
                return console.log(err.message)
        }})
        }})
        }else{
        dialogs.confirm('You will lose ALL your events. Are you sure?', ok => {
          if(ok){
        db.run('DROP TABLE events')
        db.run("CREATE TABLE if not exists events (year, month, day, eve)");
        generateCalendar(month, year)}})}
        })
        })

    let dayss = Array.from(document.getElementsByClassName("calendar-day-hover"))
    dayss.forEach(elem => {
        db.each("SELECT day, eve FROM events where month="+month+" AND year="+year+"",function(err, row){
          if(elem.id == row.day){
            elem.classList.add('event-date')
            elem.classList.add('tooltip')
            elem.innerHTML +='<div class="tooltiptext">'+row.eve+'</div>'
          }
      })
      elem.addEventListener("click", e => {
      dialogs.prompt('Add event', ok => {
        if(ok!=null && ok!=""){
        elem.classList.add('event-date')
        elem.classList.add('tooltip')
        elem.innerHTML +='<div class="tooltiptext">'+ok+'</div>'
        
        db.run("INSERT INTO events VALUES (?, ?, ?, ?)", [year, month, elem.id, ok], function(err){
              if (err) {
                return console.log(err.message)
              }
        })
      }})
    })})
}

let month_list = calendar.querySelector('.month-list')

month_names.forEach((e, index) => {
    let month = document.createElement('div')
    month.innerHTML = `<div data-month="${index}">${e}</div>`
    month.querySelector('div').onclick = () => {
        month_list.classList.remove('show')
        curr_month.value = index
        generateCalendar(index, curr_year.value)
    }
    month_list.appendChild(month)
})

let month_picker = calendar.querySelector('#month-picker')

month_picker.onclick = () => {
    month_list.classList.add('show')
}

let currDate = new Date()

let curr_month = {value: currDate.getMonth()}
let curr_year = {value: currDate.getFullYear()}

function setpin(){
    dialogs.prompt('Set pin', ok => {
      if(ok!=null){
        db.run("INSERT INTO login VALUES (?)", [ok], function(err){
              if (err) {
                return console.log(err.message)
              }
              console.log(ok)
              generateCalendar(curr_month.value, curr_year.value)
        })
}else{
  setpin()
}
})}

//checks if the pin is correct. If not set, will ask to set. If incorrect will ask again.
function login(pin,x){
  if(x>0){
      var y = 'Try again'
    }else{
      var y = 'Pin'
    }
  if(pin.length>0){
    dialogs.prompt(y, ok => {
    if(pin.includes(ok)){
      generateCalendar(curr_month.value, curr_year.value)
    }else{
      setTimeout(function () {
      x++
      login(pin,x)
      },x*1000)
    }
})}else{
  setpin()
  }
}

async function readpin (){
      let allpins = new Array()
await db.each("SELECT * FROM login",function(err, row){
        if(err){console.log(err)}
        allpins.push(row.pin)
      })
  return allpins
}

(async() => {
lepins = await readpin()
console.log(lepins)
 setTimeout(function () {
      console.log(lepins.length)
      login(lepins, 0)
    }, 500);
})()

document.querySelector('#prev-year').onclick = () => {
    --curr_year.value
    generateCalendar(curr_month.value, curr_year.value)
}

document.querySelector('#next-year').onclick = () => {
    ++curr_year.value
    generateCalendar(curr_month.value, curr_year.value)
}

let dark_mode_toggle = document.querySelector('.dark-mode-switch')

dark_mode_toggle.onclick = () => {
    document.querySelector('body').classList.toggle('light')
    document.querySelector('body').classList.toggle('dark')
}

/* close the database connection
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});*/