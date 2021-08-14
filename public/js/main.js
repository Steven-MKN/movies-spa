let loadedMovies = []
let currentPage = 1
let reachedEnd = false
let viewMode = 'grid'
const moviesCollection = document.getElementById('moviesCollection')
const btnRight = document.getElementById('btnRight')
const btnLeft = document.getElementById('btnLeft')
const btnList = document.getElementById('btnList')
const btnGrid = document.getElementById('btnGrid')
const elementPageNumber = document.getElementById('elementPageNumber')
const inputSearch = document.getElementById('inputSearch')
const btnSearch = document.getElementById('btnSearch')
const logoIcon = document.getElementById('logoIcon')
const btnCloseModal = document.getElementById('btnCloseModal')
const modal = document.getElementById('modal')
const modalBody = document.getElementById('modalBody')

async function getMovies(page) {
    try {
        const result = await axios.get('http://localhost:8000/api/movies.php?p=' + page)
        console.log(result)
        const movies = result.data

        mapResultToLocalMovies(movies)

        // set reached end to true if movies returned is less than 10
        reachedEnd = loadedMovies.length !== 10

        elementPageNumber.innerHTML = currentPage
        viewMode === 'grid' ? loadGrid() : loadList()

    } catch (err) {
        console.error(err)
        alert('An unexpected error occured')
    }
}

function loadGrid(prefix) {
    let template = ''
    if (prefix) template += `<div style="width: 100%; text-align: center; padding: 10px;">${prefix}</div>`

    loadedMovies.forEach(loadedMovie => {
        template += Handlebars.compile(`
            <div class="card" onclick="displayModal({{id}})">
                <div class="image-container">
                    <img class="card-image" src="{{posterurl}}" onerror="this.src='./public/no_image.png'"/>
                </div>
                <div class="card-details">
                    <div class="card-title">
                        <h4>{{title}} ({{year}})</h4>
                        <div>
                            <span><i class="fa fa-star" style="color: rgb(196, 196, 12);"></i></span>
                            <span>{{rating}}</span>
                            <span>({{ratingCount}})</span>
                            <span style="float: right; cursor: pointer;">
                                <i class="fa fa-bookmark" aria-hidden="true"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `)(loadedMovie)
    })

    moviesCollection.innerHTML = template

}

function loadList(prefix) {
    let template = ''
    if (prefix) template += prefix

    loadedMovies.forEach(loadedMovie => {
        template += Handlebars.compile(`
        <div class="list-item" onclick="displayModal({{id}})">
            <span style="width: 15%; overflow: hidden;">
                <img height="50px" src="{{posterurl}}" onerror="this.src='./public/no_image.png'"/>
            </span>
            <span class="list-title">
                <span class="list-item-title">{{title}}</span>
                <span>({{year}})</span>
            </span>
            <span class="list-rating">
                <span><i class="fa fa-star" style="color: rgb(196, 196, 12);"></i></span>
                <span>{{rating}}</span>
                <span>({{ratingCount}})</span>
            </span>
            <span style="cursor: pointer; width:10%">
                <i class="fa fa-bookmark" aria-hidden="true"></i>
            </span>
        </div>
        `)(loadedMovie)
    })

    moviesCollection.innerHTML = template
}

async function search() {
    const searchPhrase = inputSearch.value
    if (searchPhrase.length < 2) {
        alert('Please enter atleast 3 letters to search')
        return
    }

    const searchResult = await axios.get('http://localhost:8000/api/movies.php?s=' + searchPhrase)
    console.log(searchResult)
    if (searchResult.data?.length) {
        mapResultToLocalMovies(searchResult.data)
        viewMode === 'grid' ? loadGrid(`<div>Search results for <strong>${searchPhrase}</strong></div>`)
            : loadList(`<div>Search results for <strong>${searchPhrase}</strong></div>`)
    } else {
        moviesCollection.innerHTML = 'no results found...'
    }
}

function mapResultToLocalMovies(arr) {
    loadedMovies = arr.map(movie => {
        let ratingSum = 0
        const ratingCount = movie.ratings.length

        movie.ratings.forEach(r => ratingSum += r)

        return {
            id: movie.id,
            title: movie.title,
            year: movie.year,
            genres: [...movie.genres],
            rating: (ratingSum / ratingCount).toFixed(1),
            ratingCount: ratingCount,
            contentRating: movie.contentRating,
            duration: movie.duration,
            releaseDate: movie.releaseDate,
            originalTitle: movie.originalTitle,
            storyline: movie.storyline,
            actors: [...movie.actors],
            imdbRating: movie.imdbRating,
            posterurl: movie.posterurl
        }
    })
}

function displayModal(id) {
    console.log(id)

    const selectedMovie = loadedMovies.find(m => m.id === id.toString())
    if (selectedMovie) {
        console.log(selectedMovie)
        modalBody.innerHTML = Handlebars.compile(`
        <div class="image-container modal-image">
            <img class="card-image" src="{{posterurl}}" onerror="this.src='./public/no_image.png'"/>
        </div>
        <div class="modal-body-section">
            <h2>{{title}} ({{year}})</h2>
            <p>{{storyline}}</p>
            <div>
                <span>
                    <span><i class="fa fa-star" style="color: rgb(196, 196, 12);"></i></span>
                    <span>{{rating}}</span>
                </span>
            </div>
            <div>
                <span>
                    <span>Voters:</span>
                    <span>{{ratingCount}}</span>
                </span>
            </div>
            <div>
                <span>
                    <span>Release Date:</span>
                    <span>{{releaseDate}}</span>
                </span>
            </div>
            <div>
                <span>
                    <span>Top cast:</span>
                    {{#each actors}}
                    <span>{{this}} </span>
                    {{/each}}
                </span>
            </div>
            <div>
                {{#if originalTitle}}
                <span>
                    <span>Original Title:</span>
                    <span>{{originalTitle}}</span>
                </span>
                {{/if}}
            </div>
            <div>
                <span>
                    <span>Genre:</span>
                    {{#each genres}}
                    <span>{{this}}</span>
                    {{/each}}
                </span>
            </div>
        </div>
        `)(selectedMovie)
        modal.style.display = "block"
    } else {
        alert('cannot locate selected movie')
    }
}

function setElementsEvents() {
    btnLeft.onclick = function () {
        currentPage > 1 && getMovies(--currentPage)
    }

    btnRight.onclick = function () {
        !reachedEnd && getMovies(++currentPage)
    }

    btnGrid.onclick = function () {
        viewMode = 'grid'
        loadGrid()
    }

    btnList.onclick = function () {
        viewMode = 'list'
        loadList()
    }

    btnSearch.onclick = search

    logoIcon.onclick = () => location.reload()

    btnCloseModal.onclick = () => modal.style.display = "none"
}

setElementsEvents()
getMovies(currentPage)