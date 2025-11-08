import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

function authMiddleware(operation: any, forward: any) {
	// noop: this file is executed in the browser, but we set headers via a link below
	return forward(operation);
}

export function makeApolloClient() {
	const http = new HttpLink({ uri: '/api/graphql', fetch });

	const authLink = new ApolloLink((operation, forward) => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
		operation.setContext(({ headers = {} }) => ({
			headers: {
				...headers,
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		}));
		return forward(operation);
	});

	return new ApolloClient({
		link: ApolloLink.from([authLink, http]),
		cache: new InMemoryCache(),
	});
}



