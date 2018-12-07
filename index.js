
document.addEventListener('DOMContentLoaded', ()=>{
  // frontPage()
  // getDrinks()

  let drinksContainer = document.querySelector('#drinks')
  drinksContainer.addEventListener('click', ()=>{
    let button = event.target
    let drink = event.target.parentElement.parentElement.parentElement
    if (button.className === "save"){  saveDrink(drink) } else if (button.value === "Log In"){
      event.preventDefault()
      console.log("this is login");
      returningUser()
    }else if (button.value === "Sign Up"){
      event.preventDefault()
      console.log("this is signup");
      createUser()
    }
    })

  let searchForm = document.querySelector('#filter-input')
  searchForm.addEventListener('keyup', ()=> {
    let input = searchForm.value
    console.log(input);
    filterDrinks(input)
  })
  })

  let savedContainer = document.querySelector('#saved-drinks')
  savedContainer.addEventListener('click', ()=> {
    let button = event.target
    if(button.className === 'remove'){
      let userId = savedContainer.dataset.id
      let drinkId = button.dataset.id
      deleteDrink(userId, drinkId)
    }
  })

  function deleteDrink(userId, drinkId){
    fetch('http://localhost:3000/user_drinks', {method: "DELETE"})
  }

  function returningUser(){
    let username = document.querySelector('#returning-user').value
    fetch('http://localhost:3000/users')
    .then(response=> response.json())
    .then(users => {
      users.forEach((user)=>{
        user.username === username ? getDrinks(user) : null
      })
    })
  }

  document.querySelector('#drink-form-container').addEventListener('submit', ()=> {
    event.preventDefault()
    let drink = document.querySelector('#new-drink').value
    let ingredientsText = document.querySelector('.textarea').value
    let ingredients = separateIngredients(ingredientsText)
    createDrink(drink, ingredients)
  })

  function createDrink(drinkName, ingredientsArray){
    let drinksContainer = document.querySelector('#drinks')

    fetch('http://localhost:3000/drinks', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: drinkName})
    }).then(response => response.json()).then( drink => {

      ingredientsArray.forEach((ingredient) => findOrCreateIngredient(drink, ingredient))
    let ingredientList = ''
    drink.ingredients.forEach((ingredient)=> {
      ingredientList += `<li>${ingredient.name}</li>`
    })
      drinksContainer.innerHTML += constructDrink(drink, ingredientList, 'save')
  })

  }


function separateIngredients(ingredients){
  if (ingredients.includes(" ")){
    x = ingredients.split(", ")
    y = x.map((ingredient)=>{
      return capitalize(ingredient)
    })
    return y
  } else{
    x = ingredients.split(",") // we want to capitalize as well!
  }
}

function findOrCreateIngredient(drink, ingredient){

  fetch('http://localhost:3000/ingredients')
  .then(response => response.json())
  .then(ingredients => {
    ingredients.forEach((existingIngredient)=> {
      if(ingredient === existingIngredient.name){
        findIngredientAndAddToDrink(drink, existingIngredient)
      }else if (ingredient !== existingIngredient.name){
        createIngredientAndAddToDrink(drink, ingredient)
      }
    })
  })
}

function createIngredientAndAddToDrink(drink, ingredientName){
  fetch('http://localhost:3000/ingredients', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name: ingredientName})
  }).then(response => response.json()).then(ingredient => {
    drink.ingredients << ingredient
  })
  // we need to post to ingredients and add that ingredient object to the drink's collection
  // create function and params needed in ingredient controller
}

function findIngredientAndAddToDrink(drink, ingredient){
  fetch('http://localhost:3000/drink_ingredients', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({drink_id: drink.id , ingredient_id: ingredient.id })
  })
  // POSTing an association between the two
  // also means there needs to be a create method in the controller and params
}

function createUser(){
  let username = document.querySelector('#new-user').value
  fetch('http://localhost:3000/users',{
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({username: username})
  }).then(response => response.json()).then(user =>{
    getDrinks(user)
  })
}

function getDrinks(user){

  document.querySelector('#saved-drinks').dataset.id = `${user.id}`
  document.querySelector('#saved-message').innerHTML = ``

  fetch('http://localhost:3000/drinks')
  .then(response => response.json())
  .then(drinks => {
    let drinksContainer = document.querySelector('#drinks')
    drinksContainer.innerHTML = ''
    drinks.forEach((drink)=> {
      let ingredientList = ''
      drink.ingredients.forEach((ingredient)=> {
        ingredientList += `<li>${ingredient.name}</li>`
      })
      drinksContainer.innerHTML += constructDrink(drink, ingredientList, 'save')

    })
  })
  checkUserDrinks(user)
}

function constructDrink(drink, ingredientList, className){
  return `<div class="single-drink" class='saved-or-not' data-id='${drink.id}'>
  <div class='drink-pic-container'><img class='drink-pic' src='https://cdn3.iconfinder.com/data/icons/food-drinks-and-agriculture-1/64/C_Cheers-512.png' ></div>

  <div class="drink-info">
    <p class='drink-name'>${drink.name}
    <button class='${className}' data-id='${drink.id}' type="button" name="button">${capitalize(className)}</button></p>

    <div class="drink-ingredients font">${ingredientList}</div>
  </div>`
}

function saveDrink(drink){
  drinkId = parseInt(drink.dataset.id)
  userId = parseInt(document.querySelector('#saved-drinks').dataset.id)

  fetch(`http://localhost:3000/user_drinks`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({user_id: userId, drink_id: drinkId})
  })
  savedDrinks = document.querySelector('#saved-drink-container')
  savedDrinks.appendChild(drink)
}

function checkUserDrinks(user){
  savedDrinks = document.querySelector('#saved-drink-container')
  user.drinks.length > 0 ? getSavedDrinks(user) : savedDrinks.innerHTML = `You need a drink ${user.username}!`
}

function getSavedDrinks(user){
  let savedDrinks = document.querySelector('#saved-drink-container')
  savedDrinks.innerHTML = ''
  let ingredientList = ''

  user.drinks.forEach((drink) => {
    drink.ingredients.forEach((ingredient) => {
      ingredientList += `<li>${ingredient.name}</li>`
    })
    savedDrinks.innerHTML += constructDrink(drink, ingredientList, 'remove')
  })
}

function filterDrinks(input){
  let drinksList = document.querySelector('#drinks')
  fetch('http://localhost:3000/drinks')
  .then(response => response.json())
  .then(drinks => {
    drinksList.innerHTML = ''
    let ingredientList = ''
    drinks.forEach((drink)=> {
      drink.ingredients.forEach((ingredient)=> {
        ingredientList += `<li>${ingredient.name}</li>`
        if (ingredient.name.includes(input)){
            drinksList.innerHTML += constructDrink(drink, ingredientList, 'save')
        }
      })
    })
  })
}

let dropDown = document.querySelector('#selector')
dropDown.addEventListener('change', ()=>{
  showFiltered(dropDown.value)
})

function showFiltered(chosenDrink){
  fetch('http://localhost:3000/drinks')
  .then(response => response.json())
  .then(drinks => {
    if(chosenDrink === 'prompt'){
      getAllDrinks(drinks)
    }else{
      getChosenDrink(drinks, chosenDrink)
    }
  })
}

function getChosenDrink(drinks, chosenDrink){
  let drinksContainer = document.querySelector('#drinks')
  drinksContainer.innerHTML = ''
  let ingredientList = ''
  drinks.forEach((drink)=> {
    drink.ingredients.forEach((ingredient)=> {
    ingredientList += `<li>${ingredient.name}</li>`
      if(ingredient.name === chosenDrink){
        drinksContainer.innerHTML += constructDrink(drink, ingredientList, 'save')
      }
    })
  })
}

function getAllDrinks(drinks){
  let drinksContainer = document.querySelector('#drinks')
  drinksContainer.innerHTML = ''
  let ingredientList = ''
  drinks.forEach((drink)=> {
    drink.ingredients.forEach((ingredient)=> {
    ingredientList += `<li>${ingredient.name}</li>`
    })
     drinksContainer.innerHTML += constructDrink(drink, ingredientList, 'save')
  })
}

function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}
