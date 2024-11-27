const scrollButton = document.querySelector('#hero button');
const targetSection = document.getElementById('catalogo');
const popoverBtn = document.querySelector('#btn-tags');
const flexSwitchBtn = document.querySelectorAll('#btn-grid-flex button');
const flexBtn = document.querySelector('#btn-flex');
const gridBtn = document.querySelector('#btn-grid');
const cameraList = document.querySelector('camera-viewer');
const cameras = document.querySelectorAll('.cam-div');
const cart = document.querySelector('#cart');
loadCart();

if (window.location.pathname != '/index.html') {
	camInfo();
}

const comprarBtn = document.querySelector('#comprar');

if (comprarBtn) {
	comprarBtn.addEventListener('click', () => {
		const cart = JSON.parse(localStorage.getItem('cart')) || [];
		if (cart.length === 0) {
			alert('No hay artículos en el carrito');
		} else {
			alert('Compra realizada con éxito');
			localStorage.removeItem('cart');
			loadCart();
		}
	});
}

if (flexBtn) {
	flexBtn.addEventListener('click', () => {
		if (!flexBtn.classList.contains('pressed')) {
			flexBtn.classList.add('pressed');
			gridBtn.classList.remove('pressed');
		}
		cameraList.classList.add('flex', 'flex-wrap', 'items-center')
		cameraList.classList.remove('grid')
	});
}

if (gridBtn) {
	gridBtn.addEventListener('click', () => {
		if (!gridBtn.classList.contains('pressed')) {
			gridBtn.classList.add('pressed');
			flexBtn.classList.remove('pressed');
		}
		cameraList.classList.add('grid')
		cameraList.classList.remove('flex', 'flex-wrap', 'items-center')
	});
}


if (scrollButton) {
	scrollButton.addEventListener('click', () => {
		const targetPosition = targetSection.offsetTop - 64; //64 es 4rem en pixeles, el tamaño de mi header, evita scroll de más
		window.scrollTo({ top: targetPosition, behavior: 'smooth' });
	});
}

const logo = document.querySelector('#logo');
logo.addEventListener('click', () => {
	console.log('click');
	window.location.href = 'index.html';
});

class CameraCard extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.loadCamera();
	}

	async loadCamera() {
		const id = this.getAttribute('camId');
		try {
			const response = await fetch(`https://products-foniuhqsba-uc.a.run.app/Cameras/${id}`);
			if (!response.ok) {
				throw new Error('Error al obtener la cámara');
			}
			const camera = await response.json();
			this.renderCamera(camera);
		} catch (error) {
			console.error('Error:', error);
			this.innerHTML = `<p>Error al cargar la cámara. Inténtelo nuevamente más tarde.</p>`;
		}
	}

	renderCamera(camera) {
		const template = document.getElementById('cam-template');
		const cameraContent = document.importNode(template.content, true);
		const tags = camera.tags;
		const id = this.getAttribute('camId');

		cameraContent.querySelector('.cam-img img').setAttribute("src", camera.image);
		cameraContent.querySelector('.cam-title').textContent = camera.title;
		cameraContent.querySelector('.cam-desc').textContent = camera.short_description;
		tags.forEach(tag => {
			const element = document.createElement('p');
			element.textContent = tag;
			element.className = 'tag'
			element.style.backgroundColor = 'lightgray'
			element.classList.add('rounded-lg', 'p-1', 'text-xs')
			cameraContent.querySelector('.cam-tags').appendChild(element);
		});
		cameraContent.querySelector('.cam-rating').textContent = "Rating: " + camera.rating;
		cameraContent.querySelector('.price').textContent = camera.price;
		cameraContent.querySelector('.date').setAttribute('time', camera.date);
		cameraContent.querySelector('.url').href = 'camera.html?id=' + id;

		this.appendChild(cameraContent);

		const addToCart = this.querySelector('.add-cart');
		addToCart.addEventListener('click', () => {
			const camDiv = addToCart.closest('.cam-div');
			const camId = id;
			const cart = JSON.parse(localStorage.getItem('cart')) || [];
			const cameraData = {
				numArticulo: cart.length + 1,
				id: camId,
				url: 'camera.html?id=' + camId,
				image: camDiv.querySelector('img').src,
				title: camDiv.querySelector('.cam-title').textContent,
				price: camDiv.querySelector('.price').textContent,
			};
			cart.push(cameraData);
			localStorage.setItem('cart', JSON.stringify(cart));
			loadCart();
		});
	}
}

customElements.define('custom-camera', CameraCard);

function loadCart() { 
	const cartDiv = document.querySelector('#items');
	const cart = JSON.parse(localStorage.getItem('cart')) || [];
	const cartTemplate = document.getElementById('cart-template');
	const totalP = document.querySelector('#total');
	var total = 0;
	cartDiv.innerHTML = '';
	
	cart.forEach(camera => { 
		total += parseInt(camera.price);
		const cartContent = document.importNode(cartTemplate.content, true);
		cartContent.querySelector('img').src = camera.image;
		cartContent.querySelector('.title').textContent = camera.title;
		cartContent.querySelector('.price').textContent = camera.price;
		cartContent.querySelector('a').href = camera.url;
		cartContent.querySelector('.remove').addEventListener('click', () => { 
			const newCart = cart.filter(c => c.numArticulo !== camera.numArticulo);
			localStorage.setItem('cart', JSON.stringify(newCart));
			loadCart();
		});
		cartDiv.appendChild(cartContent);
	});
	totalP.textContent = "Total: $" + total;
}

class CameraViewer extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.loadCameras();
	}

	async loadCameras() {
		try {
			const response = await fetch('https://products-foniuhqsba-uc.a.run.app/Cameras');
			if (!response.ok) {
				throw new Error('Error al obtener los artículos');
			}
			const cameras = await response.json();
			this.renderCameras(cameras);
		} catch (error) {
			console.error('Error:', error);
			this.innerHTML = `<p>Error al cargar las cámaras. Inténtelo nuevamente más tarde.</p>`;
		}
	}

	renderCameras(cameras) {
		const tagSet = new Set();


		this.innerHTML = '';

		cameras.forEach(camera => {

			const cameraContent = document.createElement('custom-camera');
			const tags = camera.tags;
			tags.forEach(tag => {
				tagSet.add(tag);
			});
			cameraContent.setAttribute('camId', camera.id);
			this.appendChild(cameraContent);
		});
		const popover = document.querySelector('#popover-1 div');
		tagSet.forEach(tag => {
			const tagLi = document.createElement('li');
			tagLi.textContent = tag;
			tagLi.classList.add("tags", "h-10", "flex", "items-center", "px-4", "hover:bg-gray-200", "text-sm", "cursor-pointer", "rounded-lg");
			popover.appendChild(tagLi);

		});
		const allTags = document.querySelectorAll('.tags');
		allTags.forEach(tag => {
			tag.addEventListener('click', () => {
				this.filterTag(tag.textContent);
			});
		});
	}


	filterTag(tag) {
		const tags = document.querySelectorAll('.tags');
		tags.forEach(t => {
			if (t.textContent === tag) {
				if (t.textContent === 'None') {
					t.style.backgroundColor = 'white';
				} else {
					t.style.backgroundColor = 'lightblue';
				}
			} else {
				t.style.backgroundColor = 'white';
			}
		});
		const cameras = document.querySelectorAll('custom-camera');
		cameras.forEach(camera => {
			if (tag === 'None') {
				camera.style.display = 'flex';
			} else {
				const tags = camera.querySelectorAll('.cam-tags p');
				const hasTag = Array.from(tags).some(t => t.textContent === tag);
				console.log(hasTag)
				camera.style.display = hasTag ? 'flex' : 'none';
			}
		});
	}
}

customElements.define('camera-viewer', CameraViewer);

class RelativeTime extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		this.render()

		setInterval(() => {
			this.render()
		}, 1000)
	}

	static get observedAttributes() {
		return ['time']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	render() {
		const time = new Date(this.getAttribute('time')).getTime();
		const now = Date.now();

		const diff = now - time;
		const seconds = Math.floor(diff / 1000)
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		const weeks = Math.floor(days / 7);
		const months = Math.floor(days / 30);
		const years = Math.floor(months / 12);

		let aux = '...';

		if (years >= 1)
			aux = `Hace ${years} año${years > 1 ? 's' : ''}`
		else if (months >= 1)
			aux = `Hace ${months} mes${months > 1 ? 'es' : ''}`
		else if (weeks >= 1)
			aux = `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`
		else if (days >= 1)
			aux = `Hace ${days} día${days > 1 ? 's' : ''}`
		else if (hours >= 1)
			aux = `Hace ${hours} hora${hours > 1 ? 's' : ''}`
		else if (minutes >= 1)
			aux = `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
		else if (seconds >= 1)
			aux = `Hace ${seconds} segundo${seconds > 1 ? 's' : ''}`
		this.textContent = aux;


	}
}
customElements.define('relative-time', RelativeTime);

class CustomSearch extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const dialogBtn = document.querySelector('#search-btn');
		const closeBtn = this.querySelector('#back-btn');
		const dialog = this.querySelector('dialog');

		dialogBtn.addEventListener('click', () => {
			dialog.style.visibility = 'visible';
			dialog.showModal();
		});
		closeBtn.addEventListener('click', () => {
			dialog.style.visibility = 'hidden';
			dialog.close();
		});
		this.loadCameras()

	}

	async loadCameras() {
		const siteSearch = this.querySelector('#search-input');
		try {
			const response = await fetch('https://products-foniuhqsba-uc.a.run.app/Cameras?v2');
			if (!response.ok) {
				throw new Error('Error al obtener los artículos');
			}
			const cameras = await response.json();
			this.renderResults(cameras, '');
			siteSearch.addEventListener('input', (event) => this.search(cameras, event));
		} catch (error) {
			console.error('Error:', error);
			this.innerHTML = `<p>Error al cargar las cámaras. Inténtelo nuevamente más tarde.</p>`;
		}
	}

	search(cameras, event) {
		event.preventDefault();
		const siteSearch = this.querySelector('#search-input');
		const term = siteSearch.value
		this.renderResults(cameras, term)
	}

	renderResults(cameras, term = '') {
		const searchResults = this.querySelector('#resultados');
		searchResults.innerHTML = '';
		const cameraResults = cameras.filter(camera => {
			return camera.title.toLowerCase().includes(term.toLowerCase());
		})

		const template = this.querySelector('template').content;
		cameraResults.forEach(camera => {
			const li = template.querySelector('li').cloneNode(true);
			li.querySelector('.search-url').href = 'camera.html?id=' + camera.id
			li.querySelector('img').src = camera.image;
			li.querySelector('.search-title').textContent = camera.title
			li.querySelector('.search-price').textContent = camera.price

			searchResults.appendChild(li);
		})

	}
}
customElements.define('custom-search', CustomSearch);


class ShoppingCart extends HTMLElement {

}

async function camInfo() {
	const urlParams = new URLSearchParams(window.location.search);
	const id = urlParams.get('id');
	const camDiv = document.querySelector('#camera-info');
	const camImg = camDiv.querySelector('img');
	const camTitle = camDiv.querySelector('.cam-title');
	const camDesc = camDiv.querySelector('.cam-desc');
	const camTags = camDiv.querySelector('.cam-tags');
	const camRating = camDiv.querySelector('.cam-rating');
	const camPrice = camDiv.querySelector('.price');
	const camDate = camDiv.querySelector('.date');
	const comprar = camDiv.querySelector('.add-cart');

	try {
		const response = await fetch(`https://products-foniuhqsba-uc.a.run.app/Cameras/${id}`);
		if (!response.ok) {
			throw new Error('Error al obtener la cámara');
		}
		const camera = await response.json();
		camImg.src = camera.image;
		camTitle.textContent = camera.title;
		camDesc.textContent = camera.description;
		camera.tags.forEach(tag => {
			const element = document.createElement('p');
			element.textContent = tag;
			element.className = 'tag'
			element.style.backgroundColor = 'lightgray'
			element.classList.add('rounded-lg', 'p-1', 'text-xs')
			camTags.appendChild(element);
		});
		camRating.textContent = "Rating: " + camera.rating;
		camPrice.textContent = camera.price;
		camDate.setAttribute('time', camera.date);
		comprar.addEventListener('click', () => {
			const cart = JSON.parse(localStorage.getItem('cart')) || [];
			const cameraData = {
				numArticulo: cart.length + 1,
				id: id,
				url: 'camera.html?id=' + id,
				image: camImg.src,
				title: camTitle.textContent,
				price: camPrice.textContent,
			};
			cart.push(cameraData);
			localStorage.setItem('cart', JSON.stringify(cart));
			loadCart();
		});

	} catch (error) {
		console.error('Error:', error);
		camDiv.innerHTML = `<p>Error al cargar la cámara. Inténtelo nuevamente más tarde.</p>`;
	}
}