import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import { addMessages, getMemory, addEntityNode } from './GenericFunctions';
import { z } from 'zod';

// Zod schema defining exactly what parameters AI agents can populate
export const inputSchema = z.object({
	operation: z.enum(['retrieveMemory', 'storeConversation', 'storeEntity'])
		.describe('Memory operation to perform: retrieveMemory (get context before AI response), storeConversation (save user message + AI response), or storeEntity (save important entities)'),

		sessionId: z.string()
		.describe('Unique conversation session identifier to group related conversations (auto-generated from workflow + execution if not provided)'),

	// For retrieveMemory operation
	currentMessage: z.string().optional()
		.describe('Current user message to find relevant memory context for (auto-detected from common fields like message, userInput, input)'),

	maxFacts: z.number().min(1).max(50).default(8).optional()
		.describe('Maximum number of relevant memory facts to retrieve (1-50, default: 8)'),

	centerNodeUuid: z.string().optional()
		.describe('Optional UUID of an entity to focus memory retrieval around'),

		// For storeConversation operation
	userMessage: z.string().optional()
		.describe('User message to store in memory (auto-detected from userMessage, userInput, input fields)'),

	aiResponse: z.string().optional()
		.describe('AI response to store in memory (auto-detected from aiResponse, output, response fields)'),

	userName: z.string().default('User').optional()
		.describe('Name of the user for conversation tracking (auto-detected from userName field or defaults to "User")'),

	aiName: z.string().default('Assistant').optional()
		.describe('Name of the AI assistant for conversation tracking (auto-detected from aiName field or defaults to "Assistant")'),

		// For storeEntity operation
	entityName: z.string().optional()
		.describe('Name of the entity to store (auto-detected from entityName field)'),

	entitySummary: z.string().optional()
		.describe('Summary or description of the entity to store (auto-detected from entitySummary, entityDescription fields)'),

	entityUuid: z.string().optional()
		.describe('Unique identifier for the entity (auto-generated using workflow + timestamp pattern if not provided)'),
});

export class GraphitiMemoryTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Graphiti AI Memory Tool',
		name: 'graphitiMemoryTool',
		icon: 'fa:brain',
		group: ['AI'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'AI Tool for managing persistent conversation memory using Graphiti knowledge graph. AI agents can retrieve context, store conversations, and manage entities with schema-controlled parameters.',
		defaults: {
			name: 'Graphiti AI Memory Tool',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'graphitiApi',
				required: true,
			},
		],
		// AI Tool schema export (for future AI Tool integration)
		// inputSchema,
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Retrieve Memory',
						value: 'retrieveMemory',
						description: 'Get relevant conversation context from memory for AI processing',
						action: 'Retrieve relevant memory context',
					},
					{
						name: 'Store Conversation',
						value: 'storeConversation',
						description: 'Save user input and AI response to memory',
						action: 'Store conversation in memory',
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
			{
				displayName: 'Session ID',
				name: 'sessionId',
				type: 'string',
				default: '={{$json.sessionId || $workflow.id + "_" + $execution.id}}',
				description: 'Unique identifier for the conversation session (auto-generated from workflow + execution if not provided)',
				required: true,
			},
			// Retrieve Memory Fields
			{
				displayName: 'Current Message',
				name: 'currentMessage',
				type: 'string',
				default: '={{$json.message || $json.userInput || $json.input || $json.currentMessage}}',
				description: 'Current user message to find relevant context for (auto-detected from common message fields)',
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
				default: '={{$json.userMessage || $json.userInput || $json.input || $json.message}}',
				description: 'The user\'s message to store (auto-detected from common message fields)',
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
				default: '={{$json.aiResponse || $json.output || $json.response || $json.assistantResponse}}',
				description: 'The AI\'s response to store (auto-detected from common response fields)',
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
				default: '={{$json.userName || $json.user || $json.name || "User"}}',
				description: 'Name of the user (auto-detected from user fields or defaults to "User")',
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
				default: '={{$json.aiName || $json.assistantName || $json.botName || "Assistant"}}',
				description: 'Name of the AI assistant (auto-detected from assistant fields or defaults to "Assistant")',
				displayOptions: {
					show: {
						operation: ['storeConversation'],
					},
				},
			},
			// Store Entity Fields
			{
				displayName: 'Entity Name',
				name: 'entityName',
				type: 'string',
				default: '={{$json.entityName || $json.name || $json.title}}',
				description: 'Name of the entity to store (auto-detected from entity/name/title fields)',
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
				default: '={{$json.entityUuid || $json.uuid || $workflow.id + "_entity_" + Date.now()}}',
				description: 'Unique identifier for the entity (auto-detected or generated using workflow + timestamp)',
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
				default: '={{$json.entitySummary || $json.entityDescription || $json.summary || $json.description}}',
				description: 'Summary or description of the entity (auto-detected from summary/description fields)',
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

				if (operation === 'retrieveMemory') {
					const currentMessage = this.getNodeParameter('currentMessage', i) as string;
					const maxFacts = this.getNodeParameter('maxFacts', i, 8) as number;
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

					// Format response for AI Tool usage
					returnData.push({
						json: {
							context: memoryResponse.memory || [],
							facts: memoryResponse.facts || [],
							sessionId,
							currentMessage,
							operation: 'retrieveMemory',
							contextRetrieved: true,
							factsCount: (memoryResponse.facts || []).length,
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
							success: true,
							sessionId,
							userMessage,
							aiResponse,
							operation: 'storeConversation',
							messagesStored: 2,
							timestamp,
							...response,
						},
					});

				} else if (operation === 'storeEntity') {
					const entityName = this.getNodeParameter('entityName', i) as string;
					const entityUuid = this.getNodeParameter('entityUuid', i, '') as string || `${sessionId}_entity_${Date.now()}`;
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
							success: true,
							sessionId,
							entityName,
							entityUuid,
							entitySummary,
							operation: 'storeEntity',
							...response,
						},
					});
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							operation,
							success: false,
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
