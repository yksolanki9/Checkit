
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://yash1709:1709@cluster0.usqmt.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item({
  name: "Cook Food"
});

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, items){
    
    if(items.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully inserted!");
        }
      })
    }
    // console.log(items);
    res.render("list", {listTitle: "Today", newListItems: items});
  });
  

});

app.post("/delete", function(req, res){
  const itemId = req.body.checkbox;
  const listName = req.body.list;

  console.log("Item id is " + itemId);

  if(listName === "Today") {
    Item.deleteOne({_id : itemId}, function(err){
      if(err){
        console.log(err);
      } else {
        res.redirect("/");
      }
    })

  } else {

    List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: itemId}}}, function(err, customList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
}
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {

    List.findOne({name: listName}, function(err, customList){
      if(!err){
        customList.items.push(item);
        customList.save();
        res.redirect("/" + listName);
      }
    })    
  }

  
});


app.post("/:listType", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  })

  
});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:listType", function(req, res){
  const listType = _.upperFirst(req.params.listType);

  List.findOne({name: listType}, function(err, customList){

    if(!err){
      if(!customList) {
        //Create a new list
        const customList = new List({
          name: listType,
          items: defaultItems
        })
        customList.save();
        res.redirect("/" + listType);

      } else {
      //Display the stored list
      res.render("list", {
        listTitle: listType, newListItems: customList.items
      });
    }

    // console.log(customList);
      
    }

  });

})

let port = process.env.PORT;

if(port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
