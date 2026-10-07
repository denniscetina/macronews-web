let currentFetch = global.fetch;

Object.defineProperty(global, 'fetch', {
	get() {
		return currentFetch;
	},
	set(nextJsFetch) {
		// Envolvemos el fetch de Next.js dentro del nuestro
		currentFetch = async (url, options = {}) => {
			const headers = new Headers(options?.headers || {});
			headers.set('User-Agent', 'Custom-User-Agent/1.0');
			return nextJsFetch(url, {
				...options,
				headers,
			});
		};
	},
	configurable: true
});

global.fetch = currentFetch;