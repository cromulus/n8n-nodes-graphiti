import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeApiError, NodeConnectionType } from 'n8n-workflow';
import { addEpisode, searchEpisodes, addMessages, getMemory, getEpisodes, addEntityNode, getEntityEdge, deleteEntityEdge, deleteGroup, deleteEpisode, clearData, healthCheck } from './GenericFunctions';

export class Graphiti implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Graphiti',
        name: 'graphiti',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["name"]}}',
        description: 'A powerful node to interact with the Graphiti API. It allows you to create new knowledge graph "episodes" from text or JSON, and to perform semantic searches (edge or node-based) across your knowledge graph.',
        defaults: {
            name: 'Graphiti',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
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
                        name: 'Add Entity Node',
                        value: 'addEntityNode',
                        description: 'Add an individual entity node to the knowledge graph',
                        action: 'Add entity node to graphiti',
                    },
                    {
                        name: 'Add Episode',
                        value: 'addEpisode',
                        description: 'Creates a new "episode" in your Graphiti knowledge graph. An episode represents a unit of knowledge, like a document, a conversation, or a structured record.',
                        action: 'Add a new episode to graphiti',
                    },
                    {
                        name: 'Add Messages',
                        value: 'addMessages',
                        description: 'Add conversation messages to a specific group in the knowledge graph',
                        action: 'Add messages to graphiti',
                    },
                    {
                        name: 'Clear Data',
                        value: 'clearData',
                        description: 'Clear all data from Graphiti (WARNING: This will delete everything!)',
                        action: 'Clear all data from graphiti',
                    },
                    {
                        name: 'Delete Entity Edge',
                        value: 'deleteEntityEdge',
                        description: 'Delete a specific entity edge by UUID',
                        action: 'Delete entity edge from graphiti',
                    },
                    {
                        name: 'Delete Episode',
                        value: 'deleteEpisode',
                        description: 'Delete a specific episode by UUID',
                        action: 'Delete episode from graphiti',
                    },
                    {
                        name: 'Delete Group',
                        value: 'deleteGroup',
                        description: 'Delete an entire group and all its data',
                        action: 'Delete group from graphiti',
                    },
                    {
                        name: 'Get Entity Edge',
                        value: 'getEntityEdge',
                        description: 'Retrieve details of a specific entity edge by UUID',
                        action: 'Get entity edge from graphiti',
                    },
                    {
                        name: 'Get Episodes',
                        value: 'getEpisodes',
                        description: 'Retrieve episodes for a specific group from the knowledge graph',
                        action: 'Get episodes from graphiti',
                    },
                    {
                        name: 'Get Memory',
                        value: 'getMemory',
                        description: 'Retrieve relevant memories based on context and messages from the knowledge graph',
                        action: 'Get memory from graphiti',
                    },
                    {
                        name: 'Health Check',
                        value: 'healthCheck',
                        description: 'Check if the Graphiti API is healthy and responsive',
                        action: 'Check graphiti health',
                    },
                    {
                        name: 'Search Episodes',
                        value: 'searchEpisodes',
                        description: 'Performs a semantic search over the episodes in your Graphiti knowledge graph. You can search for relationships (edges) or concepts (nodes).',
                        action: 'Search episodes in graphiti',
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
            // Search Episodes Fields
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
																typeOptions: {
																	minValue: 1,
																},
                default: 50,
                description: 'Max number of results to return',
                displayOptions: {
                    show: {
                        operation: ['searchEpisodes'],
                        searchType: ['node'],
                    },
                },
            },
            // Add Messages Fields
            {
                displayName: 'Group ID',
                name: 'groupId',
                type: 'string',
                default: '',
                description: 'The group ID to add messages to',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addMessages'],
                    },
                },
            },
            {
                displayName: 'Messages',
                name: 'messages',
                type: 'fixedCollection',
                default: {},
                description: 'Messages to add to the group',
                typeOptions: {
                    multipleValues: true,
                },
                displayOptions: {
                    show: {
                        operation: ['addMessages'],
                    },
                },
                options: [
                    {
                        name: 'message',
                        displayName: 'Message',
                        values: [
                            {
                                displayName: 'Content',
                                name: 'content',
                                type: 'string',
                                default: '',
                                description: 'The content of the message',
                                required: true,
                            },
                            {
                                displayName: 'Role Type',
                                name: 'role_type',
                                type: 'options',
                                options: [
                                    { name: 'User', value: 'user' },
                                    { name: 'Assistant', value: 'assistant' },
                                    { name: 'System', value: 'system' },
                                ],
                                default: 'user',
                                description: 'The role type of the message',
                                required: true,
                            },
                            {
                                displayName: 'Role',
                                name: 'role',
                                type: 'string',
                                default: '',
                                description: 'The custom role of the message (user name, bot name, etc.)',
                            },
                            {
                                displayName: 'UUID',
                                name: 'uuid',
                                type: 'string',
                                default: '',
                                description: 'Optional UUID for the message',
                            },
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Optional name for the episodic node',
                            },
                            {
                                displayName: 'Timestamp',
                                name: 'timestamp',
                                type: 'dateTime',
                                default: '',
                                description: 'Optional timestamp for the message',
                            },
                            {
                                displayName: 'Source Description',
                                name: 'source_description',
                                type: 'string',
                                default: '',
                                description: 'Optional description of the message source',
                            },
                        ],
                    },
                ],
            },
            // Get Episodes Fields
            {
                displayName: 'Group ID',
                name: 'groupId',
                type: 'string',
                default: '',
                description: 'The group ID to retrieve episodes from',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['getEpisodes'],
                    },
                },
            },
            {
                displayName: 'Last N',
                name: 'lastN',
                type: 'number',
                default: 10,
                description: 'Number of recent episodes to retrieve',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['getEpisodes'],
                    },
                },
            },
            // Get Memory Fields
            {
                displayName: 'Group ID',
                name: 'groupId',
                type: 'string',
                default: '',
                description: 'The group ID to retrieve memory from',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['getMemory'],
                    },
                },
            },
            {
                displayName: 'Max Facts',
                name: 'maxFacts',
                type: 'number',
                default: 10,
                description: 'Maximum number of facts to retrieve',
                displayOptions: {
                    show: {
                        operation: ['getMemory'],
                    },
                },
            },
            {
                displayName: 'Center Node UUID',
                name: 'centerNodeUuid',
                type: 'string',
                default: '',
                description: 'Optional UUID of the node to center the retrieval on',
                displayOptions: {
                    show: {
                        operation: ['getMemory'],
                    },
                },
            },
            {
                displayName: 'Messages',
                name: 'messages',
                type: 'fixedCollection',
                default: {},
                description: 'Messages to build the retrieval query from',
                typeOptions: {
                    multipleValues: true,
                },
                displayOptions: {
                    show: {
                        operation: ['getMemory'],
                    },
                },
                options: [
                    {
                        name: 'message',
                        displayName: 'Message',
                        values: [
                            {
                                displayName: 'Content',
                                name: 'content',
                                type: 'string',
                                default: '',
                                description: 'The content of the message',
                                required: true,
                            },
                            {
                                displayName: 'Role Type',
                                name: 'role_type',
                                type: 'options',
                                options: [
                                    { name: 'User', value: 'user' },
                                    { name: 'Assistant', value: 'assistant' },
                                    { name: 'System', value: 'system' },
                                ],
                                default: 'user',
                                description: 'The role type of the message',
                                required: true,
                            },
                            {
                                displayName: 'Role',
                                name: 'role',
                                type: 'string',
                                default: '',
                                description: 'The custom role of the message (user name, bot name, etc.)',
                            },
                            {
                                displayName: 'UUID',
                                name: 'uuid',
                                type: 'string',
                                default: '',
                                description: 'Optional UUID for the message',
                            },
                            {
                                displayName: 'Name',
                                name: 'name',
                                type: 'string',
                                default: '',
                                description: 'Optional name for the episodic node',
                            },
                            {
                                displayName: 'Timestamp',
                                name: 'timestamp',
                                type: 'dateTime',
                                default: '',
                                description: 'Optional timestamp for the message',
                            },
                            {
                                displayName: 'Source Description',
                                name: 'source_description',
                                type: 'string',
                                default: '',
                                description: 'Optional description of the message source',
                            },
                        ],
                    },
                ],
            },
            // Add Entity Node Fields
            {
                displayName: 'UUID',
                name: 'uuid',
                type: 'string',
                default: '',
                description: 'The UUID of the entity node to add',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addEntityNode'],
                    },
                },
            },
            {
                displayName: 'Group ID',
                name: 'groupId',
                type: 'string',
                default: '',
                description: 'The group ID for the entity node',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addEntityNode'],
                    },
                },
            },
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'The name of the entity node',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['addEntityNode'],
                    },
                },
            },
            {
                displayName: 'Summary',
                name: 'summary',
                type: 'string',
                default: '',
                description: 'Optional summary of the entity node',
                displayOptions: {
                    show: {
                        operation: ['addEntityNode'],
                    },
                },
            },
            // Get Entity Edge Fields
            {
                displayName: 'UUID',
                name: 'uuid',
                type: 'string',
                default: '',
                description: 'The UUID of the entity edge to retrieve',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['getEntityEdge'],
                    },
                },
            },
            // Delete Entity Edge Fields
            {
                displayName: 'UUID',
                name: 'uuid',
                type: 'string',
                default: '',
                description: 'The UUID of the entity edge to delete',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['deleteEntityEdge'],
                    },
                },
            },
            // Delete Episode Fields
            {
                displayName: 'UUID',
                name: 'uuid',
                type: 'string',
                default: '',
                description: 'The UUID of the episode to delete',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['deleteEpisode'],
                    },
                },
            },
            // Delete Group Fields
            {
                displayName: 'Group ID',
                name: 'groupId',
                type: 'string',
                default: '',
                description: 'The group ID to delete (WARNING: This will delete all data in the group)',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['deleteGroup'],
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
                } else if (operation === 'addMessages') {
                    const messagesCollection = this.getNodeParameter('messages', i, { message: [] }) as { message: any[] };
                    const messages = messagesCollection.message || [];
                    const params = {
                        group_id: this.getNodeParameter('groupId', i) as string,
                        messages: messages,
                    };
                    const response = await addMessages(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'getMemory') {
                    const messagesCollection = this.getNodeParameter('messages', i, { message: [] }) as { message: any[] };
                    const messages = messagesCollection.message || [];
                    const params = {
                        group_id: this.getNodeParameter('groupId', i) as string,
                        max_facts: this.getNodeParameter('maxFacts', i, 10) as number,
                        center_node_uuid: this.getNodeParameter('centerNodeUuid', i, '') as string,
                        messages: messages,
                    };
                    const response = await getMemory(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'getEpisodes') {
                    const params = {
                        group_id: this.getNodeParameter('groupId', i) as string,
                        last_n: this.getNodeParameter('lastN', i) as number,
                    };
                    const response = await getEpisodes(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'addEntityNode') {
                    const params = {
                        uuid: this.getNodeParameter('uuid', i) as string,
                        group_id: this.getNodeParameter('groupId', i) as string,
                        name: this.getNodeParameter('name', i) as string,
                        summary: this.getNodeParameter('summary', i, '') as string,
                    };
                    const response = await addEntityNode(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'getEntityEdge') {
                    const params = {
                        uuid: this.getNodeParameter('uuid', i) as string,
                    };
                    const response = await getEntityEdge(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'deleteEntityEdge') {
                    const params = {
                        uuid: this.getNodeParameter('uuid', i) as string,
                    };
                    const response = await deleteEntityEdge(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'deleteEpisode') {
                    const params = {
                        uuid: this.getNodeParameter('uuid', i) as string,
                    };
                    const response = await deleteEpisode(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'deleteGroup') {
                    const params = {
                        group_id: this.getNodeParameter('groupId', i) as string,
                    };
                    const response = await deleteGroup(this, params);
                    returnData.push({ json: response });
                } else if (operation === 'clearData') {
                    const response = await clearData(this);
                    returnData.push({ json: response });
                } else if (operation === 'healthCheck') {
                    const response = await healthCheck(this);
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
