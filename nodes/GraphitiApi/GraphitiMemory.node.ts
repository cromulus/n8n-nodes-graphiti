import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import { addMessages, getMemory, getEpisodes, addEntityNode } from './GenericFunctions';

export class GraphitiMemory implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Graphiti AI Memory',
        name: 'graphitiMemory',
        icon: 'fa:brain',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["sessionId"]}}',
        description: 'Provides persistent memory management for AI conversations using Graphiti knowledge graph. Store, retrieve, and manage conversational context seamlessly with AI nodes.',
        defaults: {
            name: 'Graphiti AI Memory',
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
                        name: 'Initialize Session',
                        value: 'initializeSession',
                        description: 'Create a new conversation session with Graphiti',
                        action: 'Initialize a new conversation session',
                    },
                    {
                        name: 'Retrieve Memory',
                        value: 'retrieveMemory',
                        description: 'Get relevant conversation context from Graphiti for AI processing',
                        action: 'Retrieve relevant memory context',
                    },
                    {
                        name: 'Store Conversation',
                        value: 'storeConversation',
                        description: 'Save user input and AI response to Graphiti memory',
                        action: 'Store conversation in memory',
                    },
                    {
                        name: 'Get Session History',
                        value: 'getSessionHistory',
                        description: 'Retrieve complete conversation history for a session',
                        action: 'Get session conversation history',
                    },
                    {
                        name: 'Store Entity',
                        value: 'storeEntity',
                        description: 'Extract and store important entities from conversations',
                        action: 'Store conversation entities',
                    },
                ],
                default: 'retrieveMemory',
            },
            // Common Fields
            {
                displayName: 'Session ID',
                name: 'sessionId',
                type: 'string',
                default: '={{$json.sessionId || $workflow.id + "_" + $execution.id}}',
                description: 'Unique identifier for the conversation session (auto-generated if not provided)',
                required: true,
            },
            // Initialize Session Fields
            {
                displayName: 'Session Name',
                name: 'sessionName',
                type: 'string',
                default: 'AI Conversation {{new Date().toISOString().split("T")[0]}}',
                description: 'Human-readable name for the conversation session',
                displayOptions: {
                    show: {
                        operation: ['initializeSession'],
                    },
                },
            },
            {
                displayName: 'User Name',
                name: 'userName',
                type: 'string',
                default: '={{$json.userName || "User"}}',
                description: 'Name of the user in this conversation',
                displayOptions: {
                    show: {
                        operation: ['initializeSession'],
                    },
                },
            },
            // Retrieve Memory Fields
            {
                displayName: 'Current Message',
                name: 'currentMessage',
                type: 'string',
                default: '={{$json.message || $json.userInput || $json.input}}',
                description: 'Current user message to find relevant context for',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['retrieveMemory'],
                    },
                },
            },
            {
                displayName: 'Max Context Facts',
                name: 'maxFacts',
                type: 'number',
                default: 8,
                typeOptions: {
                    minValue: 1,
                    maxValue: 50,
                },
                description: 'Maximum number of relevant memory facts to retrieve',
                displayOptions: {
                    show: {
                        operation: ['retrieveMemory'],
                    },
                },
            },
            {
                displayName: 'Focus Entity UUID',
                name: 'centerNodeUuid',
                type: 'string',
                default: '',
                description: 'Optional UUID of an entity to focus memory retrieval around',
                displayOptions: {
                    show: {
                        operation: ['retrieveMemory'],
                    },
                },
            },
            // Store Conversation Fields
            {
                displayName: 'User Message',
                name: 'userMessage',
                type: 'string',
                default: '={{$json.userMessage || $json.userInput || $json.input}}',
                description: 'The user\'s message to store',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['storeConversation'],
                    },
                },
            },
            {
                displayName: 'AI Response',
                name: 'aiResponse',
                type: 'string',
                default: '={{$json.aiResponse || $json.output || $json.response}}',
                description: 'The AI\'s response to store',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['storeConversation'],
                    },
                },
            },
            {
                displayName: 'User Name',
                name: 'userName',
                type: 'string',
                default: '={{$json.userName || "User"}}',
                description: 'Name of the user (for conversation tracking)',
                displayOptions: {
                    show: {
                        operation: ['storeConversation'],
                    },
                },
            },
            {
                displayName: 'AI Name',
                name: 'aiName',
                type: 'string',
                default: '={{$json.aiName || "Assistant"}}',
                description: 'Name of the AI assistant (for conversation tracking)',
                displayOptions: {
                    show: {
                        operation: ['storeConversation'],
                    },
                },
            },
            // Get Session History Fields
            {
                displayName: 'Recent Messages Count',
                name: 'recentCount',
                type: 'number',
                default: 20,
                typeOptions: {
                    minValue: 1,
                    maxValue: 100,
                },
                description: 'Number of recent messages to retrieve from session history',
                displayOptions: {
                    show: {
                        operation: ['getSessionHistory'],
                    },
                },
            },
            // Store Entity Fields
            {
                displayName: 'Entity Name',
                name: 'entityName',
                type: 'string',
                default: '={{$json.entityName}}',
                description: 'Name of the entity to store',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['storeEntity'],
                    },
                },
            },
            {
                displayName: 'Entity UUID',
                name: 'entityUuid',
                type: 'string',
                default: '={{$json.entityUuid || $workflow.id + "_entity_" + Date.now()}}',
                description: 'Unique identifier for the entity (auto-generated if not provided)',
                displayOptions: {
                    show: {
                        operation: ['storeEntity'],
                    },
                },
            },
            {
                displayName: 'Entity Summary',
                name: 'entitySummary',
                type: 'string',
                default: '={{$json.entitySummary || $json.entityDescription}}',
                description: 'Summary or description of the entity',
                displayOptions: {
                    show: {
                        operation: ['storeEntity'],
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
                const sessionId = this.getNodeParameter('sessionId', i) as string;

                if (operation === 'initializeSession') {
                    const sessionName = this.getNodeParameter('sessionName', i) as string;
                    const userName = this.getNodeParameter('userName', i) as string;

                    // Create initial session message
                    const initMessage = {
                        content: `New conversation session started: ${sessionName}`,
                        role_type: 'system' as const,
                        role: 'System',
                        name: 'session_init',
                        timestamp: new Date().toISOString(),
                        source_description: `Session initialization for ${userName}`,
                    };

                    const params = {
                        group_id: sessionId,
                        messages: [initMessage],
                    };

                    const response = await addMessages(this, params);
                    returnData.push({
                        json: {
                            ...response,
                            sessionId,
                            sessionName,
                            userName,
                            operation: 'initializeSession',
                            message: 'Session initialized successfully',
                        },
                    });

                } else if (operation === 'retrieveMemory') {
                    const currentMessage = this.getNodeParameter('currentMessage', i) as string;
                    const maxFacts = this.getNodeParameter('maxFacts', i) as number;
                    const centerNodeUuid = this.getNodeParameter('centerNodeUuid', i, '') as string;

                    const messages = [{
                        content: currentMessage,
                        role_type: 'user' as const,
                        role: 'User',
                        timestamp: new Date().toISOString(),
                    }];

                    const params = {
                        group_id: sessionId,
                        max_facts: maxFacts,
                        center_node_uuid: centerNodeUuid || undefined,
                        messages: messages,
                    };

                    const memoryResponse = await getMemory(this, params);
                    returnData.push({
                        json: {
                            ...memoryResponse,
                            sessionId,
                            currentMessage,
                            operation: 'retrieveMemory',
                            contextRetrieved: true,
                        },
                    });

                } else if (operation === 'storeConversation') {
                    const userMessage = this.getNodeParameter('userMessage', i) as string;
                    const aiResponse = this.getNodeParameter('aiResponse', i) as string;
                    const userName = this.getNodeParameter('userName', i, 'User') as string;
                    const aiName = this.getNodeParameter('aiName', i, 'Assistant') as string;

                    const timestamp = new Date().toISOString();
                    const messages = [
                        {
                            content: userMessage,
                            role_type: 'user' as const,
                            role: userName,
                            timestamp,
                            source_description: 'User input in AI conversation',
                        },
                        {
                            content: aiResponse,
                            role_type: 'assistant' as const,
                            role: aiName,
                            timestamp,
                            source_description: 'AI response in conversation',
                        },
                    ];

                    const params = {
                        group_id: sessionId,
                        messages: messages,
                    };

                    const response = await addMessages(this, params);
                    returnData.push({
                        json: {
                            ...response,
                            sessionId,
                            userMessage,
                            aiResponse,
                            operation: 'storeConversation',
                            messagesStored: 2,
                        },
                    });

                } else if (operation === 'getSessionHistory') {
                    const recentCount = this.getNodeParameter('recentCount', i) as number;

                    const params = {
                        group_id: sessionId,
                        last_n: recentCount,
                    };

                    const historyResponse = await getEpisodes(this, params);
                    returnData.push({
                        json: {
                            ...historyResponse,
                            sessionId,
                            operation: 'getSessionHistory',
                            recentCount,
                        },
                    });

                } else if (operation === 'storeEntity') {
                    const entityName = this.getNodeParameter('entityName', i) as string;
                    const entityUuid = this.getNodeParameter('entityUuid', i) as string;
                    const entitySummary = this.getNodeParameter('entitySummary', i, '') as string;

                    const params = {
                        uuid: entityUuid,
                        group_id: sessionId,
                        name: entityName,
                        summary: entitySummary,
                    };

                    const response = await addEntityNode(this, params);
                    returnData.push({
                        json: {
                            ...response,
                            sessionId,
                            entityName,
                            entityUuid,
                            operation: 'storeEntity',
                        },
                    });
                }

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                            operation,
                        },
                    });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}
