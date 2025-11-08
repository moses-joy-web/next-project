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

// The handler returned by @as-integrations/next has multiple overloads (NextApiRequest and NextRequest)
// which causes a TypeScript incompatibility with Next 13 app route types when exported directly.
// Wrap the handler in functions that match the app-route signature: (request: NextRequest) => Response | Promise<Response>
export async function GET(request: NextRequest) {
	// delegate to integration handler; cast to any to avoid overload conflicts
	const res = await (handler as unknown as (req: NextRequest) => Promise<Response>)(request as any);
	return res;
}

export async function POST(request: NextRequest) {
	const res = await (handler as unknown as (req: NextRequest) => Promise<Response>)(request as any);
	return res;
}



