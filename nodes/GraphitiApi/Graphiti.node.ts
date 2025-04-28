import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeApiError } from 'n8n-workflow';
import { addEpisode, searchEpisodes } from './GenericFunctions';

export class Graphiti implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Graphiti',
        name: 'graphiti',
        icon: 'file:node-icon.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["name"]}}',
        description: 'Interact with Graphiti API to add and search episodes',
        defaults: {
            name: 'Graphiti',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'graphitiApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Add Episode',
                        value: 'addEpisode',
                        description: 'Add a new episode to Graphiti',
                        action: 'Add a new episode to Graphiti',
                    },
                    {
                        name: 'Search Episodes',
                        value: 'searchEpisodes',
                        description: 'Search episodes in Graphiti',
                        action: 'Search episodes in Graphiti',
                    },
                ],
                default: 'addEpisode',
            },
            // Add Episode Fields
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the episode',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addEpisode'],
                    },
                },
            },
            {
                displayName: 'Content',
                name: 'content',
                type: 'string',
                default: '',
                description: 'Content of the episode (text or JSON string)',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addEpisode'],
                    },
                },
            },
            {
                displayName: 'Type',
                name: 'type',
                type: 'options',
                options: [
                    { name: 'Text', value: 'text' },
                    { name: 'JSON', value: 'json' },
                ],
                default: 'text',
                description: 'Type of episode content',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addEpisode'],
                    },
                },
            },
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Description of the episode',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addEpisode'],
                    },
                },
            },
            {
                displayName: 'Reference Time',
                name: 'referenceTime',
                type: 'dateTime',
                default: '',
                description: 'Reference time for the episode (optional)',
                displayOptions: {
                    show: {
                        operation: ['addEpisode'],
                    },
                },
            },
            // Search Episodes Fields
            {
                displayName: 'Query',
                name: 'query',
                type: 'string',
                default: '',
                description: 'Search query for episodes',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['searchEpisodes'],
                    },
                },
            },
            {
                displayName: 'Search Type',
                name: 'searchType',
                type: 'options',
                options: [
                    { name: 'Edge', value: 'edge' },
                    { name: 'Node', value: 'node' },
                ],
                default: 'edge',
                description: 'Type of search (edge or node)',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['searchEpisodes'],
                    },
                },
            },
            {
                displayName: 'Center Node UUID',
                name: 'centerNodeUuid',
                type: 'string',
                default: '',
                description: 'Optional UUID for center node reranking (edge search only)',
                displayOptions: {
                    show: {
                        operation: ['searchEpisodes'],
                        searchType: ['edge'],
                    },
                },
            },
            {
                displayName: 'Limit',
                name: 'limit',
                type: 'number',
                default: 5,
                description: 'Maximum number of results (node search only)',
                displayOptions: {
                    show: {
                        operation: ['searchEpisodes'],
                        searchType: ['node'],
                    },
                },
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                if (operation === 'addEpisode') {
                    const params = {
                        name: this.getNodeParameter('name', i) as string,
                        content: this.getNodeParameter('content', i) as string,
                        type: this.getNodeParameter('type', i) as string,
                        description: this.getNodeParameter('description', i) as string,
                        referenceTime: this.getNodeParameter('referenceTime', i) as string,
                    };
                    const response = await addEpisode(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'searchEpisodes') {
                    const params = {
                        query: this.getNodeParameter('query', i) as string,
                        searchType: this.getNodeParameter('searchType', i) as string,
                        centerNodeUuid: this.getNodeParameter('centerNodeUuid', i, '') as string,
                        limit: this.getNodeParameter('limit', i, 5) as number,
                    };
                    const response = await searchEpisodes(this, params);
                    returnData.push({ json: response });
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    returnData.push({
                        json: { error: errorMessage },
                        error: new NodeApiError(this.getNode(), { message: errorMessage }, { message: errorMessage }),
                    });
                    continue;
                }
                throw new NodeApiError(this.getNode(), error, { message: error instanceof Error ? error.message : 'Unknown error' });
            }
        }

        return [returnData];
    }
}