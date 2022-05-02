const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin-keshav:Dheetja8@cluster0.obumt.mongodb.net/BahikhataDB', function(err) {
  if (!err) {
    console.log("Database connected successfully");
  }
  else{
    console.log(err);
  }
})

const Balance = new mongoose.model('Balance', {
  name: String,
  balanceAmount: Number
})

const List = new mongoose.model('List', {
  cost: Number,
  items: String,
  whopaid: String,
  shareamong: Array,
  comment: String,
  listdate: String
})

const Payment = new mongoose.model('Payment', {
  paidby: String,
  amountPaid: Number,
  paymentDescription: String,
  paymentdate: String
})


let today = date();
//format of date will be April 13, 2022


const setUserId = ["keshav", "sachin", "saksham", "kishan"];
const setPassword = ["4510", "3808", "8053", "6923"];

var balance = {
  sachinBalance : 0,
  kishanBalance : 0,
  keshavExpenses : 0,
  sakshamBalance : 0
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


  List.find({}, function(err, docs) {
    res.render("home", {
      balance: roundoffbalance,
      itemslist: docs
    });
  })
})


//payment page
app.get("/payment", (req, res) => {
  if (flag != 0) {
    res.render("payment", {
      balance: balance
    });
  } else {
    res.redirect("/");
  }
})

app.get("/updatebalance", (req, res) => {
  if (flag === 2) {
    res.render("updatebalance");
  } else {
    res.redirect("/");
  }
})

app.post("/updatebalance", (req, res) => {
  balance.sachinBalance = req.body.sachinBalance;
  balance.kishanBalance = req.body.kishanBalance;
  balance.sakshamBalance = req.body.sakshamBalance;
  balance.keshavExpenses = req.body.keshavExpenses;

  updateBalance();

  res.redirect("/home");
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

  updateBalance();

  const Paymentmade = new Payment({
    paidby: paidby,
    amountPaid: amountPaid,
    paymentDescription: paymentDescription,
    paymentdate: date()
  })

  Paymentmade.save();

  res.redirect("/allpayments");
})


app.post("/paymentcancel", (req, res) => {
  res.redirect("/home");
})

app.get("/allpayments", (req, res) => {
  Payment.find({}, function(err, payments) {
    if (!err) {
      res.render("allpayments", {
        paymentsmade: payments
      })
    }
  })

})

app.get("/addlist", (req, res) => {
  if (flag != 0) {
    res.render("addlist");
  }
})


app.post("/addlist", (req, res) => {


  //saving the list into the variables
  let cost = req.body.cost;
  let items = req.body.items;
  let whopaid = req.body.whopaid;
  let comment = req.body.comment;

  let keshavshare = 0;
  let sakshamshare = 0;
  let sachinshare = 0;
  let kishanshare = 0;

  let shareamong = [];

  if (req.body.keshavshare === "1") {
    keshavshare = 1;
  };
  if (req.body.sakshamshare === "1") {
    sakshamshare = 1;
  }
  if (req.body.kishanshare === "1") {
    kishanshare = 1;
  }
  if (req.body.sachinshare === "1") {
    sachinshare = 1;
  }

  let sharelen = keshavshare + sachinshare + kishanshare + sakshamshare;

  if (sharelen === 0) {
    res.redirect("/failurelist");
  } else {

    let eachshare = cost / sharelen;

    if (keshavshare === 1) {
      balance.keshavExpenses += eachshare;
      shareamong.push("Keshav");
    }
    if (sakshamshare === 1) {
      balance.sakshamBalance += eachshare;
      shareamong.push("Saksham");
    }
    if (kishanshare === 1) {
      balance.kishanBalance += eachshare;
      shareamong.push("Kishan");
    }
    if (sachinshare === 1) {
      balance.sachinBalance += eachshare;
      shareamong.push("Sachin");
    }


    //agar un teeno m se kisi ne pay kiya to unke mujhpe bche hue paiso m se minus krdo
    if (whopaid === "sachin") {
      balance.sachinBalance -= cost;
    } else if (whopaid === "kishan") {
      balance.kishanBalance -= cost;
    } else if (whopaid === "saksham") {
      balance.sakshamBalance -= cost;
    }

    updateBalance();

    // transferring one input data into the list
    const singlelist = new List({
      cost: cost,
      items: items,
      whopaid: whopaid,
      shareamong: shareamong,
      comment: comment,
      listdate: date()
    })

    singlelist.save();

    res.redirect("/home");
  }
})

app.get("/failurelist", (req, res) => {
  res.render("failurelist");
})

app.post("/failurelist", (req, res) => {
  res.redirect("/addlist");
})





let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});






//update balance function

function updateBalance() {
  const sachinBalance = new Balance({
    name: "Sachin",
    balanceAmount: balance.sachinBalance
  })

  const kishanBalance = new Balance({
    name: "Kishan",
    balanceAmount: balance.kishanBalance
  })

  const sakshamBalance = new Balance({
    name: "Saksham",
    balanceAmount: balance.sakshamBalance
  })

  const keshavExpenses = new Balance({
    name: "Keshav",
    balanceAmount: balance.keshavExpenses
  })

  const initialbalance = [sachinBalance, kishanBalance, sakshamBalance, keshavExpenses];

  Balance.find({}, function(err, foundbalances) {
    if (foundbalances.length === 0) {
      Balance.insertMany(initialbalance, function(err) {
        if (err) {
          console.log(err);
        }
      })
    }
  })

  Balance.findOneAndUpdate({
    name: "Sachin"
  }, {
    balanceAmount: balance.sachinBalance
  }, function(err) { //this won't work without a callback function
    if (err) {
      console.log(err);
    }
  })
  Balance.findOneAndUpdate({
    name: "Kishan"
  }, {
    balanceAmount: balance.kishanBalance
  }, function(err) {
    if (err) {
      console.log(err);
    }
  })
  Balance.findOneAndUpdate({
    name: "Saksham"
  }, {
    balanceAmount: balance.sakshamBalance
  }, function(err) {
    if (err) {
      console.log(err);
    }
  })
  Balance.findOneAndUpdate({
    name: "Keshav"
  }, {
    balanceAmount: balance.keshavExpenses
  }, function(err) {
    if (err) {
      console.log(err);
    }
  })

}
