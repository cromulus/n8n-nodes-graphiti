"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graphiti = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const GenericFunctions_1 = require("./GenericFunctions");
class Graphiti {
    constructor() {
        this.description = {
            displayName: 'Graphiti',
            name: 'graphiti',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["name"]}}',
            description: 'A powerful node to interact with the Graphiti API. It allows you to create new knowledge graph "episodes" from text or JSON, and to perform semantic searches (edge or node-based) across your knowledge graph.',
            defaults: {
                name: 'Graphiti',
            },
            inputs: ["main"],
            outputs: ["main"],
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
                            description: 'Creates a new "episode" in your Graphiti knowledge graph. An episode represents a unit of knowledge, like a document, a conversation, or a structured record.',
                            action: 'Add a new episode to Graphiti',
                        },
                        {
                            name: 'Search Episodes',
                            value: 'searchEpisodes',
                            description: 'Performs a semantic search over the episodes in your Graphiti knowledge graph. You can search for relationships (edges) or concepts (nodes).',
                            action: 'Search episodes in Graphiti',
                        },
                    ],
                    default: 'addEpisode',
                },
                {
                    displayName: 'Name',
                    name: 'name',
                    type: 'string',
                    default: '',
                    description: 'A human-readable name for the episode you are creating. This helps in identifying the knowledge unit later.',
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
                    description: 'The actual data for the episode. This can be unstructured text (e.g., a paragraph, a transcript) or a structured JSON object. Graphiti will process this content to build the knowledge graph.',
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
                    description: 'Specifies whether the provided content is plain "Text" or a "JSON" object. This determines how Graphiti parses and processes the data.',
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
                    description: 'A brief summary or description of the episode\'s content. This provides context about what the knowledge unit is about.',
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
                    description: 'An optional ISO 8601 timestamp (e.g., 2023-10-27T10:00:00Z) associated with the episode. This is useful for time-series data or for recording when an event occurred.',
                    displayOptions: {
                        show: {
                            operation: ['addEpisode'],
                        },
                    },
                },
                {
                    displayName: 'Query',
                    name: 'query',
                    type: 'string',
                    default: '',
                    description: 'The natural language query to search for. Graphiti will use this to find relevant episodes, nodes, or edges in your knowledge graph.',
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
                    description: 'Determines the scope of the search. "Edge" search finds relationships and connections between concepts. "Node" search finds core concepts or entities.',
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
                    description: 'For "Edge" searches, you can provide the UUID of a specific node to focus the search around. This re-ranks the results to prioritize relationships connected to the given node, providing more contextual answers.',
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
                    description: 'For "Node" searches, this specifies the maximum number of nodes to return.',
                    displayOptions: {
                        show: {
                            operation: ['searchEpisodes'],
                            searchType: ['node'],
                        },
                    },
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                if (operation === 'addEpisode') {
                    const params = {
                        name: this.getNodeParameter('name', i),
                        content: this.getNodeParameter('content', i),
                        type: this.getNodeParameter('type', i),
                        description: this.getNodeParameter('description', i),
                        referenceTime: this.getNodeParameter('referenceTime', i),
                    };
                    const response = await (0, GenericFunctions_1.addEpisode)(this, params);
                    returnData.push({ json: response });
                }
                else if (operation === 'searchEpisodes') {
                    const params = {
                        query: this.getNodeParameter('query', i),
                        searchType: this.getNodeParameter('searchType', i),
                        centerNodeUuid: this.getNodeParameter('centerNodeUuid', i, ''),
                        limit: this.getNodeParameter('limit', i, 5),
                    };
                    const response = await (0, GenericFunctions_1.searchEpisodes)(this, params);
                    returnData.push({ json: response });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    returnData.push({
                        json: { error: errorMessage },
                        error: new n8n_workflow_1.NodeApiError(this.getNode(), { message: errorMessage }, { message: errorMessage }),
                    });
                    continue;
                }
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error, { message: error instanceof Error ? error.message : 'Unknown error' });
            }
        }
        return [returnData];
    }
}
exports.Graphiti = Graphiti;
//# sourceMappingURL=Graphiti.node.js.map