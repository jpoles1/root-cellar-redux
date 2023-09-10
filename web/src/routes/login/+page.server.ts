import type { PageServerLoad } from './$types';

export type OutputType = { authProviderRedirect: string; authProviderState: string };

export const load: PageServerLoad<OutputType> = async ({ locals, url }) => {
    const authMethods = await locals.pb?.collection('users').listAuthMethods();
    return {
        authMethods
    };
};
