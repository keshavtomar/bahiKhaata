require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://admin-keshav:Dheetja8@cluster0.obumt.mongodb.net/BahikhataDB', function(err) {
  if (!err) {
    console.log("Database connected successfully");
  } else {
    console.log(err);
  }
})

const userSchema = new mongoose.Schema({
  username: String,
  password: String
})

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
})


const Balance = new mongoose.model('Balance', {
  sachinBalance: Number,
  kishanBalance: Number,
  sakshamBalance: Number,
  keshavExpenses: Number
})

const List = new mongoose.model('List', {
  cost: Number,
  items: String,
  whopaid: String,
  shareamong: Array,
  comment: String,
  listdate: String,
  updatedBy: String
})

const Payment = new mongoose.model('Payment', {
  paidby: String,
  amountPaid: Number,
  paymentDescription: String,
  paymentdate: String
})


let today = date();
//format of date will be April 13, 2022


// // -------------------------------------------->           uncomment the register route if you want to add more users to this app
// app.get("/register",(req,res)=>{
// res.render("register", {mssg: null});
// })
//
// app.post("/register", (req, res) => {
//   User.register({
//     username: req.body.username
//   }, req.body.password, function(err, user) {
//     if (err) {
//       console.log(err);
//     } else {
//       passport.authenticate("local")(req, res, function() {
//         res.render("register",{mssg:"Registered successfully"});
//       })
//     }
//   })
// })


app.get("/login", (req, res) => {
  res.render("login", {
    msg: null
  });
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      })
    }
  })
})


app.post("/failure", (req, res) => {
  res.redirect("/");
})

app.get("/", (req, res) => {
  Balance.findOne({}, function(err, resultingbalance) {
    if (err) {
      console.log(err);
    } else {
      List.find({}, function(err, docs) {
        if (err) {
          console.log(err);
        } else {
          //rounding off

          resultingbalance.sachinBalance = Math.round(resultingbalance.sachinBalance);
          resultingbalance.kishanBalance = Math.round(resultingbalance.kishanBalance);
          resultingbalance.sakshamBalance = Math.round(resultingbalance.sakshamBalance);
          resultingbalance.keshavExpenses = Math.round(resultingbalance.keshavExpenses);

          res.render("home", {
            balance: resultingbalance,
            itemslist: docs,
            user: req.user
          });
        }
      });
    }
  });
})


//payment page
app.get("/payment", (req, res) => {
  if (req.isAuthenticated() && req.user.username === "Keshav") {
    Balance.findOne({}, function(err, resultingbalance) {
      if (err) {
        console.log(err);
      } else {
        //rounding off

        resultingbalance.sachinBalance = Math.round(resultingbalance.sachinBalance);
        resultingbalance.kishanBalance = Math.round(resultingbalance.kishanBalance);
        resultingbalance.sakshamBalance = Math.round(resultingbalance.sakshamBalance);
        resultingbalance.keshavExpenses = Math.round(resultingbalance.keshavExpenses);


        res.render("payment", {
          balance: resultingbalance,
          user: req.user
        })
      }
    })
  } else {
    res.render("login", {
      msg: "Please login as admin to add payments"
    });
  }
})


app.post("/payment", (req, res) => {
  const amountPaid = req.body.amountPaid;
  const paidby = req.body.paidby;
  const paymentDescription = req.body.paymentDescription;
  if (paidby === "sachin") {
    Balance.findOne({}, function(err, response) {
      if (!err) {
        const newbalance = response.sachinBalance - amountPaid;
        Balance.updateOne({}, {
          sachinBalance: newbalance
        }, function(err) {
          if (!err) {
            const Paymentmade = new Payment({
              paidby: paidby,
              amountPaid: amountPaid,
              paymentDescription: paymentDescription,
              paymentdate: date()
            })

            Paymentmade.save();

            res.redirect("/allpayments");
          }
        })
      }
    })
  } else if (paidby === "kishan") {
    Balance.findOne({}, function(err, response) {
      if (!err) {
        const newbalance = response.kishanBalance - amountPaid;
        Balance.updateOne({}, {
          kishanBalance: newbalance
        }, function(err) {
          if (!err) {
            const Paymentmade = new Payment({
              paidby: paidby,
              amountPaid: amountPaid,
              paymentDescription: paymentDescription,
              paymentdate: date()
            })

            Paymentmade.save();

            res.redirect("/allpayments");
          }
        })
      }
    })
  } else if (paidby === "saksham") {
    Balance.findOne({}, function(err, response) {
      if (!err) {
        const newbalance = response.sakshamBalance - amountPaid;
        Balance.updateOne({}, {
          sakshamBalance: newbalance
        }, function(err) {
          if (!err) {
            const Paymentmade = new Payment({
              paidby: paidby,
              amountPaid: amountPaid,
              paymentDescription: paymentDescription,
              paymentdate: date()
            })

            Paymentmade.save();

            res.redirect("/allpayments");
          }
        })
      }
    })
  }
})


app.post("/paymentcancel", (req, res) => {
  res.redirect("/");
})

app.get("/allpayments", (req, res) => {
  Payment.find({}, function(err, payments) {
    if (!err) {
      res.render("allpayments", {
        paymentsmade: payments,
        user: req.user
      })
    }
  })
})

app.get("/addlist", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("addlist", {
      msg: null,
      user: req.user
    });
  } else {
    res.redirect("/login");
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
    res.render("addlist", {
      msg: "The item you purchased should be shared with at least one person",
      user: req.user
    });
  } else if ((kishanshare === 0 && whopaid == "kishan") || (sachinshare === 0 && whopaid == "sachin") || (sakshamshare === 0 && whopaid == "saksham")) {
    res.render("addlist", {
      msg: "Error! You should not pay if you are not involved in the share, handle it yourself, FOOL",
      user: req.user
    });
  } else {
    let eachshare = cost / sharelen;

    if (keshavshare === 1) {
      Balance.findOne({}, function(err, response) {
        if (!err) {
          const newbalance = response.keshavExpenses + eachshare;
          Balance.updateOne({}, {
            keshavExpenses: newbalance
          }, function(err) {
            if (err) {
              console.log(err);
            }
          })
        }
      })
      shareamong.push("Keshav");
    }
    if (sakshamshare === 1) {
      Balance.findOne({}, function(err, response) {
        if (!err) {
          if (whopaid === "saksham") {
            const newbalance = response.sakshamBalance + eachshare - cost;
            Balance.updateOne({}, {
              sakshamBalance: newbalance
            }, function(err) {
              if (err) {
                console.log(err);
              }
            })
          } else {
            const newbalance = response.sakshamBalance + eachshare;
            Balance.updateOne({}, {
              sakshamBalance: newbalance
            }, function(err) {
              if (err) {
                console.log(err);
              }
            })
          }
        }
      })
      shareamong.push("Saksham");
    }
    if (kishanshare === 1) {
      Balance.findOne({}, function(err, response) {
        if (!err) {
          if (whopaid === "kishan") {
            const newbalance = response.kishanBalance + eachshare - cost;
            Balance.updateOne({}, {
              kishanBalance: newbalance
            }, function(err) {
              if (err) {
                console.log(err);
              }
            })
          } else {
            const newbalance = response.kishanBalance + eachshare;
            Balance.updateOne({}, {
              kishanBalance: newbalance
            }, function(err) {
              if (err) {
                console.log(err);
              }
            })
          }
        }
      })
      shareamong.push("Kishan");
    }
    if (sachinshare === 1) {
      Balance.findOne({}, function(err, response) {
        if (!err) {
          if (whopaid === "sachin") {
            const newbalance = response.sachinBalance + eachshare - cost;
            Balance.updateOne({}, {
              sachinBalance: newbalance
            }, function(err) {
              if (err) {
                console.log(err);
              }
            })
          } else {
            const newbalance = response.sachinBalance + eachshare;
            Balance.updateOne({}, {
              sachinBalance: newbalance
            }, function(err) {
              if (err) {
                console.log(err);
              }
            })
          }
        }
      })
      shareamong.push("Sachin");
    }

    // transferring one input data into the list
    const singlelist = new List({
      cost: cost,
      items: items,
      whopaid: whopaid,
      shareamong: shareamong,
      comment: comment,
      listdate: date(),
      updatedBy: req.user.username
    })

    singlelist.save();

    res.redirect("/");
  }
})


// app.get("/updatebalance", (req, res) => {
//   res.render("updatebalance");
// })
//
// app.post("/updatebalance", (req, res) => {
//   balance.sachinBalance = req.body.sachinBalance;
//   balance.kishanBalance = req.body.kishanBalance;
//   balance.sakshamBalance = req.body.sakshamBalance;
//   balance.keshavExpenses = req.body.keshavExpenses;
//
//   updateBalance();
//
//   res.redirect("/");
// })

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect('/');
});







let port = process.env.PORT;
if (port == null || port == "") {
  port = 300;
}

app.listen(port, function() {
  console.log("Server started on port 300");
});
