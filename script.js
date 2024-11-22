const scrollButton = document.querySelector('#hero button');
const targetSection = document.getElementById('catalogo');

scrollButton.addEventListener('click', () => {
	const targetPosition = targetSection.offsetTop - 64; //64 es 4rem en pixeles, el tamaño de mi header, evita scroll de más
	window.scrollTo({ top: targetPosition, behavior: 'smooth' });
});

class cameraViewer extends HTMLElement {
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
		const template = document.getElementById('cam-template');


		this.innerHTML = '';

		cameras.forEach(camera => {

			const cameraContent = document.importNode(template.content, true);
			const tags = camera.tags;


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
			cameraContent.querySelector('.url').href = 'camera.html?id=' + camera.id;
			cameraContent.querySelector('.cam-rating').textContent = "Rating: " + camera.rating;
			cameraContent.querySelector('.price').textContent = camera.price;
			cameraContent.querySelector('.date').setAttribute('time', camera.date);

			this.appendChild(cameraContent);
		});
	}
}
customElements.define('camera-viewer', cameraViewer);

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
		console.log(cameraResults)

		const template = this.querySelector('template').content;
		cameraResults.forEach(camera => {
			const li = template.querySelector('li').cloneNode(true);
			li.querySelector('.search-url').href = 'camera.html?id=' + camera.id
			li.querySelector('img').src = camera.image;
			li.querySelector('.search-title').textContent = camera.title
			li.querySelector('.search-desc').textContent = camera.short_description;
			li.querySelector('.search-price').textContent = camera.price

			searchResults.appendChild(li);
		})

	}
}
customElements.define('custom-search', CustomSearch);
