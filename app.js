const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const date = require(__dirname + "/date.js");

let today = date();
//format of date will be April 13, 2022

const paymentsmade = [];
const itemslist = [];


const setUserId = ["keshav", "sachin", "saksham", "kishan"];
const setPassword = ["4510", "3808", "8053", "6923"];

var balance = {
  sachinBalance: 5,
  kishanBalance: 5,
  keshavExpenses: 0,
  sakshamBalance: 0
}

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("signin");
})

let flag = 0;

app.post("/", (req, res) => {
  const userid = _.lowerCase(req.body.userid);
  const password = req.body.password;

  for (var i = 0; i < setUserId.length; i++) {
    if (userid === setUserId[i] && password === setPassword[i]) {
      if (i == 0) {
        flag = 2; //if the user is keshav
      } else {
        flag = 1;
      }
      res.redirect("/home");
    }
  }
  if (flag === 0) {
    res.redirect("/failure");
  }
})

app.get("/failure", (req, res) => {
  res.render("failure");
})

app.post("/failure", (req, res) => {
  res.redirect("/");
})

app.get("/home", (req, res) => {
  // reducing the balance value to two decimal points before actual values are not rounded off, only the values to show have been rounded off

  let roundoffbalance = balance;
  roundoffbalance.keshavExpenses = Math.floor(roundoffbalance.keshavExpenses * 100) / 100;
  roundoffbalance.sachinBalance = Math.floor(roundoffbalance.sachinBalance * 100) / 100;
  roundoffbalance.sakshamBalance = Math.floor(roundoffbalance.sakshamBalance * 100) / 100;
  roundoffbalance.kishanBalance = Math.floor(roundoffbalance.kishanBalance * 100) / 100;

  res.render("home", {
    balance: roundoffbalance,
    itemslist: itemslist
  });
})


//payment page
app.get("/payment", (req, res) => {
  res.render("payment", {
    balance: balance
  });
})

var amountPaid;
var paidby;
var paymentDescription;

app.post("/payment", (req, res) => {
  amountPaid = req.body.amountPaid;
  paidby = req.body.paidby;
  paymentDescription = req.body.paymentDescription;
  res.render("paymentconfirmation", {
    amountPaid: amountPaid,
    paidby: paidby,
    paymentDescription: paymentDescription
  })
})

app.post("/paymentconfirm", (req, res) => {
  if (paidby === "sachin") {
    balance.sachinBalance -= amountPaid;
  } else if (paidby === "kishan") {
    balance.kishanBalance -= amountPaid;
  } else if (paidby === "saksham") {
    balance.sakshamBalance -= amountPaid;
  }

  let singlepayment = {
    paidby: paidby,
    amountPaid: amountPaid,
    paymentDescription: paymentDescription,
    ondate: date()
  }

  paymentsmade.push(singlepayment);

  res.redirect("/home");
})


app.post("/paymentcancel", (req, res) => {
  res.redirect("/home");
})

app.get("/allpayments", (req, res) => {
  res.render("allpayments", {
    paymentsmade: paymentsmade
  });
})

app.get("/addlist", (req, res) => {
  res.render("addlist");
})


app.post("/addlist", (req, res) => {


  //saving the list into the variables
  let cost = req.body.cost;
  let items = req.body.items;
  let whopaid = req.body.whopaid;
  let shareamong = req.body.shareamong;
  let comment = req.body.comment;

console.log(keshavhkya);

  //agar un teeno m se kisi ne pay kiya to unke mujhpe bche hue paiso m se minus krdo
  if (whopaid === "sachin") {
    balance.sachinBalance -= cost;
  } else if (whopaid === "kishan") {
    balance.kishanBalance -= cost;
  } else if (whopaid === "saksham") {
    balance.sakshamBalance -= cost;
  }

  //ab kitne log h ye decide kro shareamong ki lenght se, aur uske hisaab se per person share kitna ho rha h
  let sharelen = shareamong.length;

  let eachshare = cost / sharelen;


  //ab shareamong m jo jo log h unke hisse m ye share add krdo

  for (var i = 0; i < sharelen; i++) {
    if (shareamong[i] === "sachin") {
      balance.sachinBalance += eachshare;
    } else if (shareamong[i] === "kishan") {
      balance.kishanBalance += eachshare;
    } else if (shareamong[i] === "saksham") {
      balance.sakshamBalance += eachshare;
    } else if (shareamong[i] === "keshav") {
      balance.keshavExpenses += eachshare;
    }
  }

  //transferring one input data into the list
  let singlelist = {
    cost: cost,
    items: items,
    whopaid: whopaid,
    shareamong: shareamong,
    comment: comment,
    listdate: date()
  }

  itemslist.push(singlelist);

  console.log(itemslist);


  res.redirect("/home");
})





app.listen(1000, function() {
  console.log("Server started at port 1000");
})
