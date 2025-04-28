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