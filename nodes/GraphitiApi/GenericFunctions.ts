import { IExecuteFunctions } from 'n8n-workflow';

interface AddEpisodeParams {
    name: string;
    content: string;
    type: string;
    description: string;
    referenceTime: string;
}

interface SearchEpisodesParams {
    query: string;
    searchType: string;
    centerNodeUuid: string;
    limit: number;
}

interface Message {
    content: string;
    uuid?: string;
    name?: string;
    role_type: 'user' | 'assistant' | 'system';
    role?: string;
    timestamp?: string;
    source_description?: string;
}

interface AddMessagesParams {
    group_id: string;
    messages: Message[];
}

interface GetMemoryParams {
    group_id: string;
    max_facts?: number;
    center_node_uuid?: string;
    messages: Message[];
}

interface GetEpisodesParams {
    group_id: string;
    last_n: number;
}

export async function addEpisode(context: IExecuteFunctions, params: AddEpisodeParams): Promise<any> {
    const credentials = await context.getCredentials('graphitiApi') as { baseUrl: string };
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/episodes/`,
        body: {
            name: params.name,
            content: params.content,
            type: params.type,
            description: params.description,
            reference_time: params.referenceTime || undefined,
        },
        json: true,
    });
}

export async function searchEpisodes(context: IExecuteFunctions, params: SearchEpisodesParams): Promise<any> {
    const credentials = await context.getCredentials('graphitiApi') as { baseUrl: string };
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/search/`,
        body: {
            query: params.query,
            search_type: params.searchType,
            center_node_uuid: params.centerNodeUuid || undefined,
            limit: params.searchType === 'node' ? params.limit : undefined,
        },
        json: true,
    });
}

export async function addMessages(context: IExecuteFunctions, params: AddMessagesParams): Promise<any> {
    const credentials = await context.getCredentials('graphitiApi') as { baseUrl: string };
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/messages`,
        body: {
            group_id: params.group_id,
            messages: params.messages,
        },
        json: true,
    });
}

export async function getMemory(context: IExecuteFunctions, params: GetMemoryParams): Promise<any> {
    const credentials = await context.getCredentials('graphitiApi') as { baseUrl: string };
    return context.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/get-memory`,
        body: {
            group_id: params.group_id,
            max_facts: params.max_facts || 10,
            center_node_uuid: params.center_node_uuid || null,
            messages: params.messages,
        },
        json: true,
    });
}

export async function getEpisodes(context: IExecuteFunctions, params: GetEpisodesParams): Promise<any> {
    const credentials = await context.getCredentials('graphitiApi') as { baseUrl: string };
    return context.helpers.httpRequest({
        method: 'GET',
        url: `${credentials.baseUrl}/episodes/${params.group_id}?last_n=${params.last_n}`,
        json: true,
    });
}
