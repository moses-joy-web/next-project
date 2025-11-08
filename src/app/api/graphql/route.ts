import { NextRequest } from 'next/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { typeDefs, resolvers, GraphQLContext } from '@/graphql/schema';
import { verify } from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongoose';

const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
	context: async (req: NextRequest) => {
		await connectToDatabase();
		const auth = req.headers.get('authorization') || '';
		const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
		if (!token) return { currentUserId: null };
		try {
			const secret = process.env.JWT_SECRET || 'dev-secret';
			const payload = verify(token, secret) as { sub?: string };
			return { currentUserId: payload.sub || null };
		} catch (e) {
			return { currentUserId: null };
		}
	},
});

export const GET = handler;
export const POST = handler;



