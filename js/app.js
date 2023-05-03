//Elementos del DOM
const $selectCategoria = document.getElementById("categorias");
const $resultado = document.getElementById("resultado");
const modal = new bootstrap.Modal("#modal", {});
const $favoritosDiv = document.querySelector(".favoritos");

//IniciarApp
document.addEventListener("DOMContentLoaded", iniciarApp);
function iniciarApp() {

    //Home de la App
    if(location.pathname === "/index.html"){
        //Lleno el select de categorías
        llenarSelect();
        //Agrego un evento al select de categorías
        $selectCategoria.addEventListener("change", seleccionarCategoria);
        //Botones de cerrar y favorito
        crearBotones();
    }


    //Favoritos page
    if(location.pathname === "/favoritos.html"){
        const favoritos = usingLocalStorage("obtener");

        if(favoritos.length === 0){
            const msg = document.createElement("P");
            msg.textContent = "No hay favoritos aun";
            msg.classList.add("fs-4", "text-center", "font-bold", "mt-5");
            $resultado.appendChild(msg);
        }else{
            const fragment = document.createDocumentFragment();

            favoritos.forEach( meal => {
    
                const {recipeId, recipeTitle, recipeImg} = meal;

                const container = document.createElement("DIV");
                container.classList.add("col-md-4");
            
                const card = document.createElement("DIV");
                card.classList.add("card", "mb-4");
            
                const img = document.createElement("IMG");
                img.classList.add("card-img-top");
                img.setAttribute("alt", `Imagen de: ${recipeTitle}`);
                img.src = recipeImg;
            
                const body = document.createElement("DIV");
                body.classList.add("card-body");
            
                const heading = document.createElement("H3");
                heading.classList.add("card-title", "mb-3");
                heading.textContent = recipeTitle;
            
                const button = document.createElement("BUTTON");
                button.classList.add("btn", "btn-danger", "w-100", "btn-receta");
                button.textContent = "Ver Receta";
                button.setAttribute("id", recipeId);
            
                body.appendChild(heading);
                body.appendChild(button);
            
                card.appendChild(img);
                card.appendChild(body);
            
                container.appendChild(card);

                fragment.appendChild(container);
            })

            $resultado.appendChild(fragment);
        }

        //Botones de cerrar y favorito
        crearBotones(true);

    }

    //Agrego un evento a los botones de cada busqueda
    document.addEventListener("click", buscarPlatillo);
}

//Consultar Api
//Este metodo será reutilizable y permitirá ser dinamico al llamado de la Api
async function consultarApi(URL) {
    try {
        const consulta = await fetch(URL);
        const datos = await consulta.json();

        return datos
    } catch (error) {
        console.error("Ocurrio un error al consultar la Api");
    }
}

//llenarSelect
//Esta funcion obtendrá lo recibido de la API de recetas y lo asignará al Select de Categorías
async function llenarSelect() {

    const URL = "https://www.themealdb.com/api/json/v1/1/categories.php";

    const { categories } = await consultarApi(URL);

    const fragment = document.createDocumentFragment();

    categories.forEach( category => {
        //Extraigo toda la información de la categoria
        const { idCategory, strCategory } = category;

        //Creo un obj option para agregar al select
        const $option = document.createElement("OPTION");
        $option.setAttribute("id", idCategory);
        $option.setAttribute("value", strCategory);
        $option.textContent = strCategory;

        fragment.appendChild($option);
    });

    $selectCategoria.appendChild(fragment);
}

//seleccionarCategoria
//Esta funcion se ejecutará cuando occura un cambio en el select
//A su vez, imprimirá los platillos obtenidos de la consulta a la API
async function seleccionarCategoria(e){

    const seleccion = e.target.value;
    
    if(seleccion !== "-- Seleccione --"){

        limpiarHTML();
    
        const URL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${seleccion}`;

        const fragment = document.createDocumentFragment();
        
        const { meals } = await consultarApi(URL);
            
        meals.forEach( meal => {
    
            const {idMeal, strMeal, strMealThumb} = meal;

            const container = document.createElement("DIV");
            container.classList.add("col-md-4");
        
            const card = document.createElement("DIV");
            card.classList.add("card", "mb-4");
        
            const img = document.createElement("IMG");
            img.classList.add("card-img-top");
            img.setAttribute("alt", `Imagen de: ${strMeal}`);
            img.src = strMealThumb;
        
            const body = document.createElement("DIV");
            body.classList.add("card-body");
        
            const heading = document.createElement("H3");
            heading.classList.add("card-title", "mb-3");
            heading.textContent = strMeal;
        
            const button = document.createElement("BUTTON");
            button.classList.add("btn", "btn-danger", "w-100", "btn-receta");
            button.textContent = "Ver Receta";
            button.setAttribute("id", idMeal);
        
            body.appendChild(heading);
            body.appendChild(button);
        
            card.appendChild(img);
            card.appendChild(body);
        
            container.appendChild(card);
        
            fragment.appendChild(container);
        });

        $resultado.appendChild(fragment);
    }

}

async function buscarPlatillo(e){
    if(e.target.classList.contains("btn-receta")){

        modal.show();

        const id = e.target.id;

        const URL = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

        const { meals } = await consultarApi(URL);

        const { idMeal, strMeal, strInstructions, strMealThumb } = meals[0];

        //Añadir contenido al modal
        document.getElementById("modal").dataset.id = idMeal;
        document.querySelector(".modal-title").textContent = strMeal;
        document.querySelector(".modal-body").innerHTML = `
            <img class="modal-img img-fluid" src="${strMealThumb}" alt="receta de ${strMealThumb}" />
            <h3 class="my-3">Instructions</h3>
            <p>${strInstructions}</p>
        `;

        //Mostrar ingredientes y sus cantidades
        const $listGroup = document.createElement("UL");
        $listGroup.classList.add("list-group");

        for (let i = 1; i < 20; i++) {
            if(meals[0][`strIngredient${i}`]){
                const ingrediente = meals[0][`strIngredient${i}`];
                const cantidad = meals[0][`strMeasure${i}`];

                const $ingredient = document.createElement("LI");
                $ingredient.classList.add("list-group-item");
                $ingredient.textContent = `${ingrediente} - ${cantidad}`;

                $listGroup.appendChild($ingredient);
            }
            
        }

        document.querySelector(".modal-body").appendChild($listGroup);

    }
}

//Otras funciones
function crearBotones(exists){

    const btnFavorito = document.createElement("BUTTON");
    btnFavorito.classList.add("btn", "btn-danger", "col");
    btnFavorito.textContent =  (exists) ? "Eliminar Favorito" : "Guardar Favorito" ;
    btnFavorito.onclick = function(){
        if(btnFavorito.textContent === "Guardar Favorito"){
            btnFavorito.textContent = "Eliminar Favorito";
            usingLocalStorage("almacenar");
        }else{
            btnFavorito.textContent = "Guardar Favorito";
            usingLocalStorage("eliminar");
        }
    }

    const btnCerrar = document.createElement("BUTTON");
    btnCerrar.classList.add("btn", "btn-secondary", "col");
    btnCerrar.textContent = "Cerrar Modal";
    btnCerrar.onclick = function(){
        modal.hide();
    }

    document.querySelector(".modal-footer").appendChild(btnFavorito);
    document.querySelector(".modal-footer").appendChild(btnCerrar);
}


function limpiarHTML(){
    while($resultado.firstChild){
        $resultado.removeChild($resultado.firstChild);
    }
}

function usingLocalStorage(accion){

    if(accion === "almacenar"){
        const recipes = JSON.parse(localStorage.getItem("recipes")) ?? [];

        const recipeId = document.getElementById("modal").dataset.id;
        const recipeTitle = document.querySelector(".modal-title").textContent;
        const recipeImg = document.querySelector(".modal-img").src;

        const exists = recipes.some( exist => exist.recipeId === recipeId);

        if(!exists){
            const recipe = {
                recipeId,
                recipeTitle,
                recipeImg
            }
    
            localStorage.setItem("recipes", JSON.stringify([...recipes, recipe]))

            showToast("Agregado a favoritos");
        }
    }

    if(accion === "eliminar"){
        const recipes = JSON.parse(localStorage.getItem("recipes")) ?? [];
        
        const recipeId = document.getElementById("modal").dataset.id;
        const removingRecipe = recipes.filter( exist => exist.recipeId !== recipeId);

        localStorage.setItem("recipes", JSON.stringify([...removingRecipe]));

        showToast("Eliminado correctamente");

        setTimeout(() => {
            location.reload();
        }, 1500);
    }

    if(accion === "obtener"){
        return JSON.parse(localStorage.getItem("recipes")) ?? [];
    }
}

function showToast(mensaje){
    const $toastDiv = document.querySelector("#toast");
    const $toastBody = document.querySelector(".toast-body");
    const toast = new bootstrap.Toast($toastDiv);
    $toastBody.textContent = mensaje;
    toast.show();
}