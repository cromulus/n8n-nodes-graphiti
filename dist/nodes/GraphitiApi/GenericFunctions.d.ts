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
interface AddEntityNodeParams {
    uuid: string;
    group_id: string;
    name: string;
    summary?: string;
}
interface GetEntityEdgeParams {
    uuid: string;
}
export declare function addEpisode(context: IExecuteFunctions, params: AddEpisodeParams): Promise<any>;
export declare function searchEpisodes(context: IExecuteFunctions, params: SearchEpisodesParams): Promise<any>;
export declare function addMessages(context: IExecuteFunctions, params: AddMessagesParams): Promise<any>;
export declare function getMemory(context: IExecuteFunctions, params: GetMemoryParams): Promise<any>;
export declare function getEpisodes(context: IExecuteFunctions, params: GetEpisodesParams): Promise<any>;
export declare function addEntityNode(context: IExecuteFunctions, params: AddEntityNodeParams): Promise<any>;
export declare function getEntityEdge(context: IExecuteFunctions, params: GetEntityEdgeParams): Promise<any>;
export {};
