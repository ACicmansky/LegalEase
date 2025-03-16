'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a single supabase client instance to be used in server components
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// RAG code that is currently not used
// export async function vectorStore(filter?: Record<string, unknown>) {
//   return new SupabaseVectorStore(embeddings, {
//     client: await createSupabaseServerClient(),
//     tableName: "embeddings",
//     queryName: "match_documents",
//     filter: filter || {}
//   });
// }

// export async function getRetriever(filter: Record<string, unknown>) {
//   return (await vectorStore(filter)).asRetriever();
// }