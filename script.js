var foodName = document.getElementById("search");
var searchBtn = document.getElementById("foodSearchButton");

let storedFoodArray = [];
recentSearches(); //soon as the page loads, shows 3 recent searches
allHistoryTable();

function openTab(tabName, elmnt, color) {
  // Hide all elements with class="tabcontent" by default */
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  // Remove the background color of all tablinks/buttons
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  // Show the specific tab content
  document.getElementById(tabName).style.display = "block";
  // Add the specific color to the button used to open the tab content
  elmnt.style.backgroundColor = color;
}
// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

function recentSearches() {
  if (localStorage.getItem("storedItems")) {
    storedFoodArray = JSON.parse(localStorage.getItem("storedItems"));
    let html = "";
    var min = Math.min(storedFoodArray.length, 3);
    for (var i = 0; i < min; i++) {
      var food = storedFoodArray[i];
      let nutrients = food.nutrientInfo;

      // var protein = nutrients.find(function(n) {
      //   return n.nutrientName === "Protein";
      // }); below this was turned into an arrow function in order to make it fit, mostly, on one line.  if it wasnt done this way it would have been much harder to read.

      var protein = nutrients.find((n) => n.nutrientName === "Protein"); //finding values from the array by a specific name
      var carbs = nutrients.find(
        (n) => n.nutrientName === "Carbohydrate, by difference"
      );
      var calories = nutrients.find((n) => n.nutrientName === "Energy");
      var fat = nutrients.find((n) => n.nutrientName === "Total lipid (fat)");
      var sugar = nutrients.find(
        (n) => n.nutrientName === "Sugars, total including NLEA"
      );
      html += `
      <tr>
      <td>${food.dateString}</td>
      <td>${food.food}</td>
      <td>${protein.value} </td>
      <td>${fat.value}${fat.unitName}</td>
            <td>${sugar.value}${sugar.unitName}</td>
                  <td>${carbs.value}${carbs.unitName}</td>
                        <td>${calories.value}${calories.unitName}</td>
      </tr>`;
    }
    document.querySelector("#recentSearches").innerHTML = html;
  }
}

function allHistoryTable() {
  if (localStorage.getItem("storedItems")) {
    storedFoodArray = JSON.parse(localStorage.getItem("storedItems"));
    let html = "";
    for (let food of storedFoodArray) {
      let nutrients = food.nutrientInfo;

      // var protein = nutrients.find(function(n) {
      //   return n.nutrientName === "Protein";
      // }); below this was turned into an arrow function in order to make it fit, mostly, on one line.  if it wasnt done this way it would have been much harder to read.

      var protein = nutrients.find((n) => n.nutrientName === "Protein"); //finding values from the array by a specific name
      var carbs = nutrients.find(
        (n) => n.nutrientName === "Carbohydrate, by difference"
      );
      var calories = nutrients.find((n) => n.nutrientName === "Energy");
      var fat = nutrients.find((n) => n.nutrientName === "Total lipid (fat)");
      var sugar = nutrients.find(
        (n) => n.nutrientName === "Sugars, total including NLEA"
      );
      html += `
      <tr>
      <td>${food.dateString}</td>
      <td>${food.food}</td>
      <td>${protein.value} </td>
      <td>${fat.value}${fat.unitName}</td>
            <td>${sugar.value}${sugar.unitName}</td>
                  <td>${carbs.value}${carbs.unitName}</td>
                        <td>${calories.value}${calories.unitName}</td>
      </tr>`;
    }
    document.querySelector("#histories").innerHTML = html;
  }
}

if (localStorage.getItem("storedItems")) {
  //gets item from local storage and stores into an array to access the values. if we get items save them to the food array
  storedFoodArray = JSON.parse(localStorage.getItem("storedItems"));
}
// for (let i = 0; i < storedFoodArray.length; i++) {
//     console.log("from local storage", protein, carbs, calories, fat, sugar);
//     displayNutrients(carbs, protein, fat, sugar, calories);
//     for (let j = 0; j < nutrients.length; j++) {
//         // console.log(nutrients[j].nutrientName + ": " + nutrients[j].value);
//     }
// }

searchBtn.addEventListener("click", function (event) {
  event.preventDefault();
  getNutrients(foodName.value);
  getRecipe(foodName.value);
});

function getRecipe(foodName) {
  var recipeRequestUrl =
    "https://api.edamam.com/api/recipes/v2?type=public&q=" +
    foodName +
    "&app_id=61881171&app_key=cf039096837f9493c42a82711335486d";
  fetch(recipeRequestUrl)
    .then((response) => response.json())
    .then((data) => {
      // The inner html variables.
      let html = "";

      let indexes = [];
      for (let i = 0; i < 3; i++) {
        let index;
        do {
          index = Math.floor(Math.random() * data.hits.length);
        } while (indexes.includes(index));
        indexes.push(index);
      }
      for (let i of indexes) {
        let recipe = data.hits[i].recipe;
        let recipeName = recipe.label;
        let url = recipe.url;
        let image = recipe.images.REGULAR.url;
        let ingredients = "<ul>";

        //   code that sets the recipe cards
        for (let j = 0; j < recipe.ingredients.length; j++) {
          ingredients += `<li>${recipe.ingredients[j].text}</li>`;
        }
        ingredients += "</ul>";
        console.log(recipe);
        html += `
          <div class="col s12 m4">
            <div class="card">
              <div class="card-image">
                <img src="${image}">
                <span class="card-title">${recipeName}</span>
              </div>
              <div class="card-content">
                <p>${ingredients}</p>
                <button data-reci="${i}" class="favoriteRecipe">Save Recipe</button>
              </div>
              <div class="card-action">
                <a class="black-text" href="${url}">Go to Recipe</a>
              </div>
            </div>
          </div>
                         `;
      }

      document.querySelector(".containerRecipes").innerHTML = html;
      let buttons = document.querySelectorAll(".containerRecipes button");
      for (let button of buttons) {
        button.addEventListener("click", function (event) {
          let recipeIndex = event.target.dataset.reci;
          let recipeData = data.hits[recipeIndex].recipe;
          saveRecipe(recipeData);
        });
      }
    });
}

function saveRecipe(recipe) {
  let savedRecipes = [];
  if (localStorage.getItem("savedRecipes")) {
    savedRecipes = JSON.parse(localStorage.getItem("savedRecipes"));
  }
  savedRecipes.push(recipe);
  localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
}

// document.querySelector(".containerRecipes").addEventListener("click", saveFavoriteRecipe);

// function saveRecipe(event){
//   console.log(event, event.target.tagName)

//   if (event.target.tagName==="BUTTON"){
//     let element = event.target
//     // console.log(Element);
//     let saved = JSON.parse(localStorage.getItem("recipeName")) || []
//     let rec = event.target.getAttribute("data-reci")
//     saved.push(rec)
//     localStorage.setItem("recipeName", JSON.stringify(saved));
//     console.log(rec)
//       let myRecipe = {

//         //    image: element.closest("img").getAttribute("src"),
//             ingredients: element.previousSibling.innerText ,
//             // url: element.closest("a").getAttribute("href")
//               }
//               console.log(myRecipe);
//   }
// }

function getNutrients(foodName) {
  var foodNutrients;
  var requestUrl =
    "https://api.nal.usda.gov/fdc/v1/foods/search?query=" +
    foodName +
    "&pageSize=2&api_key=vuZ8WUcvpMr1mNoGUwWsyX4AWHv3LLaeRcZpDoga";

  fetch(requestUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(data.foods[0].foodNutrients);
      foodNutrients = data.foods[0].foodNutrients; //this is the foodNutrients object/array maybe or an array that has objects

      var sugar = foodNutrients.find(function (nutrient) {
        if (nutrient.nutrientName === "Sugars, total including NLEA") {
          return true;
        } else {
          return false;
        }
      });

      var calories = foodNutrients.find(function (nutrient) {
        // console.log(nutrient.nutrientName);
        //    return nutrient.nutrientName==="Energy";
        if (nutrient.nutrientName === "Energy") {
          return true;
        } else {
          return false;
        }
      });

      var carb = foodNutrients.find(function (nutrient) {
        if (nutrient.nutrientName === "Carbohydrate, by difference") {
          return true;
        } else {
          return false;
        }
      });

      var fat = foodNutrients.find(function (nutrient) {
        //looking through the nutrients array and returning the value.
        if (nutrient.nutrientName === "Total lipid (fat)") {
          return true;
        } else {
          return false;
        }
      });

      var protein = foodNutrients.find(function (nutrient) {
        return nutrient.nutrientName === "Protein";
      });

      displayNutrients(carb, protein, fat, sugar, calories);

      console.log(calories.value + " " + calories.unitName);
      console.log(sugar.value);
      console.log(protein.value + " " + protein.unitName);

      //   function setFoodItemStorage(event) {
      //     localStorage.setItem("foodName", JSON.stringify(foodData));
      //     console.log(foodData);
      //   }

      // getRecipe(foodName, foodNutrients);

      var date = new Date(Date.now());
      var dateString = new Intl.DateTimeFormat("default", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      }).format(date);

      var storedItem = {
        food: foodName,
        date: date,
        dateString: dateString,
        nutrientInfo: foodNutrients,
      };

      var existingFoodItem = storedFoodArray.find(function (foodItem) {
        return foodItem.food === foodName;
      });
      console.log(existingFoodItem);
      if (existingFoodItem === undefined) {
        storedFoodArray.unshift(storedItem);
        localStorage.setItem("storedItems", JSON.stringify(storedFoodArray));
      }

      allHistoryTable();
      recentSearches();
      //   setFoodItemStorage();
      //   setRecipeStorage();
      //returning the foodNutrients objects that allows access with a function call.
    });
}
//moved out of the main function for more readability.
function displayNutrients(carb, protein, fat, sugar, calories) {
//   document.querySelector(
//     ".test"
//   ).innerHTML += `<p>Calories.....${calories.value} ${calories.unitName}</p>
//         <p>Protein.....${protein.value} ${protein.unitName}</p>
//         <p>Fat.....${fat.value} ${fat.unitName}</p>
//         <p>sugar.....${sugar.value} ${sugar.unitName}</p>
//         <p>carb.....${carb.value} ${carb.unitName}</p>`; //query selector selects the table element and append a row where each column is a different nutrient value.
}
// let findNutrient = function(nutrient) {
//     nutrients.find(function(n) {
//         return n.nutrientName === nutrient; //doing this instead of all the code from below var protein, etc. n=individual, nutrients=array, nutrientName=prop, nutrient=search value.
//     });
// };
