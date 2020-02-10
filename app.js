const express = require('express');
const request = require('request');
const date = require("C:/Users/compa/Desktop/web-dev/todolist-v1/date.js");
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');

//make db.
mongoose.connect("mongodb://localhost:27017/todlistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//shcema properties
const todolistSchema = new mongoose.Schema({
  name: String
})
//make collection plural(model).
const Item = mongoose.model("Item", todolistSchema);

const item1 = new Item({
  name: "Angular study"
});
const item2 = new Item({
  name: "Angular recap"
});
const item3 = new Item({
  name: "new itme3"
});



const itemarr = [item1, item2, item3];


app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", function(req, res) {
  const day = date.getDate();
  Item.find({}, function(err, foundItems) {
    const newOptions = {
      listTitle: day,
      newListItem: foundItems
    };
    if (foundItems.length === 0) {
      Item.insertMany(itemarr, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Deafulat items are saved.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", newOptions);

    }

  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list
  const item = new Item({
    name: itemName
  });

  if (listName == date.getDate()) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {
  const listName = req.body.listName;
  const itemId = req.body.newCheckBox;
  if (listName == date.getDate()) {
    Item.findOneAndDelete({
      _id: itemId
    }, function(err) {
      if (!err) {

        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: itemId
          }
        }
      },
      function(err, foundList) {
        if (!err) {

          res.redirect("/" + listName);
        }
      });
  }

});


const listSchema = new mongoose.Schema({
  name: String,
  items: [todolistSchema]
});
//collection.

const List = mongoose.model("List", listSchema);


app.get("/:custom", function(req, res) {
  const paraName = _.capitalize(req.params.custom);
  List.findOne({
    name: paraName
  }, function(err, results) {
    if (!err) {
      if (!results) {
        console.log("not existed");
        const list = new List({
          name: paraName,
          items: itemarr
        });
        list.save();
        res.redirect("/" + paraName);;
      } else {

        res.render("list", {
          listTitle: results.name,
          newListItem: results.items
        });
      }
    }
  });
});
app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3000, function() {
  console.log("server is running on port 3000");
})
