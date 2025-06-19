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
export declare function addEpisode(context: IExecuteFunctions, params: AddEpisodeParams): Promise<any>;
export declare function searchEpisodes(context: IExecuteFunctions, params: SearchEpisodesParams): Promise<any>;
export {};
